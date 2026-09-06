export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { pageEvents } from "@/lib/events";
import { getRequestContext } from "@cloudflare/next-on-pages";

interface RouteContext {
  params: Promise<{ slug: string; id: string }>;
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug, id } = await ctx.params;

  const page: any = await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  if (page.isProtected) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyPageToken(token);
    if (payload?.slug !== slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fileRecord: any = await db.prepare("SELECT storedName FROM files WHERE fileId = ? AND slug = ?").get(id, slug);
  if (!fileRecord) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const envCtx = getRequestContext();
    const bucket = envCtx.env.UPLOADS_BUCKET as any;
    if (bucket) {
      await bucket.delete(fileRecord.storedName);
    }
  } catch (err) {
    console.error("Failed to delete file from R2:", err);
  }

  await db.prepare("DELETE FROM files WHERE fileId = ? AND slug = ?").run(id, slug);

  try {
    pageEvents.emit(slug, {
      type: "files_updated",
      action: "deleted",
      fileId: id,
    });
  } catch {}

  return NextResponse.json({ ok: true });
}
