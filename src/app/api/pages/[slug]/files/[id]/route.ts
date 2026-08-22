import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { pageEvents } from "@/lib/events";
import { deleteFromB2, hasB2Storage } from "@/lib/b2";
import path from "path";
import fs from "fs";

interface RouteContext {
  params: Promise<{ slug: string; id: string }>;
}

interface PageRow {
  isProtected: number;
}

interface FileRow {
  storedName: string;
}

// DELETE /api/pages/[slug]/files/[id]
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug, id } = await ctx.params;

  const page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Auth check for protected pages
  if (page.isProtected) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyPageToken(token);
    if (payload?.slug !== slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileRecord = (await db.prepare("SELECT storedName FROM files WHERE fileId = ? AND slug = ?").get(id, slug)) as FileRow | undefined;
  if (!fileRecord) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Remove file from disk or Backblaze B2
  try {
    const filePath = path.join(process.cwd(), "uploads", fileRecord.storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (hasB2Storage()) {
      await deleteFromB2(fileRecord.storedName);
    }
  } catch (err) {
    console.error("Failed to delete file asset:", err);
  }

  // Delete metadata record from SQLite / Postgres
  await db.prepare("DELETE FROM files WHERE fileId = ? AND slug = ?").run(id, slug);

  // Broadcast real-time file deletion to all connected clients
  pageEvents.emit(slug, {
    type: "files_updated",
    action: "deleted",
    fileId: id,
  });

  return NextResponse.json({ ok: true });
}
