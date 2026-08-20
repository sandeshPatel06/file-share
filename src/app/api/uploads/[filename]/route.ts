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

// GET /api/uploads/[filename] — stream stored file with Range support & same-origin framing
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
  
  // Detect PDF or fallback MIME types
  let contentType = fileRecord?.mimetype || "application/octet-stream";
  if (safeFilename.toLowerCase().endsWith(".pdf")) {
    contentType = "application/pdf";
  }

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
  const fileSize = stat.size;
  const rangeHeader = req.headers.get("range");

  const commonHeaders = {
    "Accept-Ranges": "bytes",
    "Content-Type": contentType,
    "Content-Disposition": `inline; filename="${encodeURIComponent(fileRecord?.originalName || safeFilename)}"`,
    "X-Frame-Options": "SAMEORIGIN",
    "Content-Security-Policy": "frame-ancestors 'self'",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  // HTTP Range request processing for PDF & Media viewers
  if (rangeHeader) {
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }

    const chunkSize = end - start + 1;
    const nodeStream = fs.createReadStream(filePath, { start, end });
    const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      status: 206,
      headers: {
        ...commonHeaders,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Content-Length": chunkSize.toString(),
      },
    });
  }

  const nodeStream = fs.createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;

  return new NextResponse(webStream, {
    status: 200,
    headers: {
      ...commonHeaders,
      "Content-Length": fileSize.toString(),
    },
  });
}
