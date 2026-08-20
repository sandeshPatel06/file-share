import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";

interface RouteContext {
  params: Promise<{ filename: string }>;
}

interface FileRow {
  slug: string;
  mimetype: string;
  originalName: string;
  size: number;
}

interface PageRow {
  isProtected: number;
}

// GET /api/uploads/[filename] — stream stored file with authorization & Range support
export async function GET(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { filename } = await ctx.params;
  const safeFilename = path.basename(filename);
  const uploadsDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadsDir, safeFilename);

  // Prevent path traversal outside uploads directory
  if (!filePath.startsWith(uploadsDir)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileRecord = (await db.prepare("SELECT slug, mimetype, originalName, size FROM files WHERE storedName = ?").get(safeFilename)) as FileRow | undefined;
  const contentType = fileRecord?.mimetype || "application/octet-stream";

  // Auth check if page is protected
  if (fileRecord?.slug) {
    const page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(fileRecord.slug)) as PageRow | undefined;
    if (page?.isProtected) {
      const authHeader = req.headers.get("authorization") ?? "";
      const tokenParam = req.nextUrl.searchParams.get("token") ?? "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : tokenParam;
      
      if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const payload = await verifyPageToken(token);
      if (payload?.slug !== fileRecord.slug) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
  }

  const stat = fs.statSync(filePath);
  const nodeStream = fs.createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      "Content-Disposition": `inline; filename="${encodeURIComponent(fileRecord?.originalName || safeFilename)}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
