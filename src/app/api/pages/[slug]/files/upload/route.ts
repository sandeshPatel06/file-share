export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { pageEvents } from "@/lib/events";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

async function isAuthorized(req: NextRequest, slug: string, isProtected: boolean) {
  if (!isProtected) return true;
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return false;
  const payload = await verifyPageToken(token);
  return payload?.slug === slug;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;
  
  let isPro = false;
  try {
    const session = await auth();
    isPro = session && (session as any).isPro;
  } catch (e) {
    console.warn("getServerSession edge warning:", e);
  }
  const MAX_FILE_SIZE = isPro ? 500 * 1024 * 1024 : 5 * 1024 * 1024;

  const { slug } = await ctx.params;

  let page: any = await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug);
  if (!page) {
    // Note: D1 does not support INSERT OR IGNORE natively without returning changes properly sometimes, 
    // but ON CONFLICT works. We use a simple insert and catch exception if already exists.
    try {
      await db.prepare("INSERT INTO pages (slug, content, isProtected) VALUES (?, '', 0)").run(slug);
    } catch {}
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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File size exceeds the limit` }, { status: 413 });
    }

    const fileId = crypto.randomUUID();
    const originalName = file.name || "file";
    const mimetype = file.type || "application/octet-stream";
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storedName = `${fileId}-${safeName}`;

    const envCtx = getRequestContext();
    const bucket = envCtx.env.UPLOADS_BUCKET as any; // R2Bucket
    
    if (!bucket) {
      throw new Error("R2 Bucket UPLOADS_BUCKET not configured");
    }

    const arrayBuffer = await file.arrayBuffer();
    await bucket.put(storedName, arrayBuffer, {
      httpMetadata: { contentType: mimetype }
    });

    const downloadURL = `/api/uploads/${storedName}`;

    await db.prepare(`
      INSERT INTO files (fileId, slug, originalName, storedName, mimetype, size, downloadURL)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      fileId,
      slug,
      originalName,
      storedName,
      mimetype,
      file.size,
      downloadURL
    );

    try {
      pageEvents.emit(slug, {
        type: "files_updated",
        action: "uploaded",
        fileId: fileId,
      });
    } catch {}

    return NextResponse.json({
      fileId,
      originalName,
      downloadURL,
      mimetype,
      size: file.size,
    }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "File upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
