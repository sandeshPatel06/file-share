import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { getFromB2, hasB2Storage } from "@/lib/b2";

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

  try {
  const { filename } = await ctx.params;
  const safeFilename = path.basename(filename);
  const uploadsDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadsDir, safeFilename);

  // Prevent path traversal outside uploads directory
  if (!filePath.startsWith(uploadsDir)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const fileRecord = (await db.prepare("SELECT slug, mimetype, originalName, size FROM files WHERE storedName = ?").get(safeFilename)) as FileRow | undefined;

  // Fail closed: a storedName with no DB row skips auth below, so never
  // serve bytes for it (orphan disk/B2 objects stay unreachable).
  if (!fileRecord) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Detect PDF or fallback MIME types
  let contentType = fileRecord.mimetype || "application/octet-stream";
  if (safeFilename.toLowerCase().endsWith(".pdf")) {
    contentType = "application/pdf";
  }

  // Auth check if page is protected
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

  // Authenticated bytes must never land in shared caches under the same URL.
  const cacheControl = page?.isProtected
    ? "private, no-store"
    : "public, max-age=31536000, immutable";

  // RFC 5987 encoding: ASCII fallback in `filename`, real name in `filename*`.
  const asciiFallback = ((fileRecord.originalName || safeFilename).replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_").slice(0, 120) || "download");
  const dangerousInlineType = /^(text\/html|application\/x?html|image\/svg\+xml|application\/javascript|text\/javascript|application\/xml)/i.test(contentType);
  const contentDisposition = `${dangerousInlineType ? "attachment" : "inline"}; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(fileRecord.originalName || safeFilename)}`;
  const fileCsp = dangerousInlineType ? "sandbox" : "frame-ancestors 'self'";

  const rangeHeader = req.headers.get("range");

  // Stream from Backblaze B2 if local file does not exist or B2 is active
  if (!fs.existsSync(filePath) && hasB2Storage()) {
    const b2Data = await getFromB2(safeFilename, rangeHeader);
    if (b2Data) {
      const b2Headers: Record<string, string> = {
        "Accept-Ranges": "bytes",
        "Content-Type": contentType,
        "Content-Disposition": contentDisposition,
        "X-Frame-Options": "SAMEORIGIN",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": fileCsp,
        "Cross-Origin-Resource-Policy": "same-origin",
        "Cache-Control": cacheControl,
      };
      if (b2Data.contentLength) b2Headers["Content-Length"] = b2Data.contentLength.toString();
      if (b2Data.contentRange) b2Headers["Content-Range"] = b2Data.contentRange;

      const webStream = b2Data.stream instanceof Readable
        ? Readable.toWeb(b2Data.stream) as ReadableStream<Uint8Array>
        : (b2Data.stream as unknown as ReadableStream<Uint8Array>);

      return new NextResponse(webStream, {
        status: b2Data.statusCode,
        headers: b2Headers,
      });
    }
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stat = await fs.promises.stat(filePath);
  const fileSize = stat.size;

  const commonHeaders = {
    "Accept-Ranges": "bytes",
    "Content-Type": contentType,
    "Content-Disposition": contentDisposition,
    "X-Frame-Options": "SAMEORIGIN",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": fileCsp,
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cache-Control": cacheControl,
  };

  // HTTP Range request processing for PDF & Media viewers (strict RFC 7233:
  // single `bytes=start-end` only; suffix/multi ranges get 416).
  if (rangeHeader) {
    const match = /^bytes=(\d+)-(\d*)$/.exec(rangeHeader.trim());
    if (!match) {
      return new NextResponse(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileSize}` },
      });
    }
    const start = parseInt(match[1], 10);
    let end = match[2] === "" ? fileSize - 1 : parseInt(match[2], 10);
    if (end >= fileSize) end = fileSize - 1;

    if (start >= fileSize || start > end) {
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
  } catch {
    // Generic message: statSync/B2/stream throws would otherwise leak
    // internals or crash mid-flight as unhandled 500s.
    return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
  }
}
