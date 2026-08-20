import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { pageEvents } from "@/lib/events";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  isProtected: number;
}

async function isAuthorized(req: NextRequest, slug: string, isProtected: boolean) {
  if (!isProtected) return true;
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return false;
  const payload = await verifyPageToken(token);
  return payload?.slug === slug;
}

// POST /api/pages/[slug]/files/upload — handle file upload & broadcast live event
export async function POST(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug } = await ctx.params;

  let page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  if (!page) {
    await db.prepare("INSERT OR IGNORE INTO pages (slug, content, isProtected) VALUES (?, '', 0)").run(slug);
    page = { isProtected: 0 };
  }

  if (!(await isAuthorized(req, slug, Boolean(page.isProtected)))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileId = randomUUID();
    const originalName = file.name;
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${fileId}-${safeName}`;
    const mimetype = file.type || "application/octet-stream";
    const size = file.size;

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, storedName);
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const downloadURL = `/api/uploads/${storedName}`;

    await db.prepare(`
      INSERT INTO files (fileId, slug, originalName, storedName, mimetype, size, downloadURL)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(fileId, slug, originalName, storedName, mimetype, size, downloadURL);

    // Broadcast real-time file addition to all connected clients
    pageEvents.emit(slug, {
      type: "files_updated",
      action: "uploaded",
      fileId,
    });

    return NextResponse.json({
      fileId,
      originalName,
      downloadURL,
      mimetype,
      size,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "File upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
