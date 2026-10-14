import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { ALLOWED_MIME_TYPES } from "@/lib/validators";
import { pageEvents } from "@/lib/events";
import { hasB2Storage, uploadToB2 } from "@/lib/b2";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import busboy from "busboy";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5-minute upload duration limit for large files

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

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB limit

// POST /api/pages/[slug]/files/upload — stream file upload up to 500 MB
export async function POST(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "upload");
  if (limited) return limited;

  const requestLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(requestLength) && requestLength > MAX_FILE_SIZE + 1024 * 1024) {
    return NextResponse.json({ error: "Upload exceeds the 500 MB limit" }, { status: 413 });
  }

  const { slug } = await ctx.params;

  let page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  if (!page) {
    await db.prepare("INSERT OR IGNORE INTO pages (slug, content, isProtected) VALUES (?, '', 0)").run(slug);
    page = { isProtected: 0 };
  }

  if (!(await isAuthorized(req, slug, Boolean(page.isProtected)))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
  }

  try {
    const bb = busboy({
      headers: { "content-type": contentType },
      limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    });

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileId = randomUUID();
    let originalName = "file";
    let storedName = "";
    let mimetype = "application/octet-stream";
    let filePath = "";
    let fileSize = 0;
    let limitExceeded = false;
    let fileFound = false;

    let pendingWriteStream: fs.WriteStream | null = null;

    const parsePromise = new Promise<{
      fileId: string;
      originalName: string;
      storedName: string;
      mimetype: string;
      size: number;
    }>((resolve, reject) => {
      // Single-settlement guard: stream 'error' events after a reject would
      // otherwise surface as uncaughtExceptions and crash the process.
      let settled = false;
      const fail = (err: unknown) => {
        if (settled) return;
        settled = true;
        try {
          bb.destroy();
        } catch {}
        if (pendingWriteStream) {
          try { pendingWriteStream.destroy(); } catch {}
        }
        reject(err instanceof Error ? err : new Error("File upload failed"));
      };
      const done = (
        value: { fileId: string; originalName: string; storedName: string; mimetype: string; size: number }
      ) => {
        if (settled) return;
        settled = true;
        resolve(value);
      };

      bb.on("file", (_name, fileStream, info) => {
        fileFound = true;
        originalName = (info.filename || "file").slice(0, 255);
        mimetype = info.mimeType || "application/octet-stream";
        if (!ALLOWED_MIME_TYPES.has(mimetype)) {
          fileStream.resume();
          fail(new Error("File type not allowed"));
          return;
        }
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
        storedName = `${fileId}-${safeName}`;
        filePath = path.join(uploadsDir, storedName);

        const writeStream = fs.createWriteStream(filePath);
        pendingWriteStream = writeStream;

        fileStream.on("data", (chunk: Buffer) => {
          fileSize += chunk.length;
        });

        fileStream.on("limit", () => {
          limitExceeded = true;
          fileStream.unpipe(writeStream);
          writeStream.destroy();
          fileStream.resume();
        });

        fileStream.on("error", (err) => fail(err));

        fileStream.pipe(writeStream);

        writeStream.on("error", (err) => {
          fail(err);
        });
      });

      bb.on("finish", () => {
        if (!fileFound) {
          fail(new Error("No file provided"));
          return;
        }

        const finalize = () => {
          if (limitExceeded || fileSize > MAX_FILE_SIZE) {
            if (filePath && fs.existsSync(filePath)) {
              try { fs.unlinkSync(filePath); } catch {}
            }
            fail(new Error("File size exceeds the 500 MB limit"));
            return;
          }
          done({
            fileId,
            originalName,
            storedName,
            mimetype,
            size: fileSize,
          });
        };

        if (pendingWriteStream && !pendingWriteStream.closed && !pendingWriteStream.writableFinished) {
          pendingWriteStream.on("finish", finalize);
        } else {
          finalize();
        }
      });

      bb.on("error", (err) => fail(err));
    });

    if (req.body) {
      const nodeStream = Readable.fromWeb(req.body as import("stream/web").ReadableStream);
      // A request-stream error after busboy already failed would otherwise
      // escape as an uncaughtException — route it into the same settlement.
      nodeStream.on("error", () => {
        try {
          bb.destroy();
        } catch {}
      });
      nodeStream.pipe(bb);
    } else {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const uploadedInfo = await parsePromise;
    const downloadURL = `/api/uploads/${uploadedInfo.storedName}`;

    // Enforce the MIME allowlist (declared multipart content type). Files
    // outside the set are deleted before any DB row is written → 422.
    if (!ALLOWED_MIME_TYPES.has(uploadedInfo.mimetype)) {
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
      return NextResponse.json({ error: "File type not allowed" }, { status: 422 });
    }

    // Upload to Backblaze B2 Object Storage if B2 credentials are set
    const b2Active = hasB2Storage();
    if (b2Active && filePath && fs.existsSync(filePath)) {
      // Use direct buffer for small files (<=10MB) for highest reliability; stream for large files to conserve RAM
      const isLarge = uploadedInfo.size > 10 * 1024 * 1024;
      const b2Payload = isLarge ? fs.createReadStream(filePath) : fs.readFileSync(filePath);
      const b2Uploaded = await uploadToB2(
        uploadedInfo.storedName,
        b2Payload,
        uploadedInfo.mimetype,
        uploadedInfo.size
      );
      if (!b2Uploaded) {
        console.warn(`[Storage] Warning: Backblaze B2 upload failed for ${uploadedInfo.storedName}; file remains on local disk.`);
      }
    }

    await db.prepare(`
      INSERT INTO files (fileId, slug, originalName, storedName, mimetype, size, downloadURL)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      uploadedInfo.fileId,
      slug,
      uploadedInfo.originalName,
      uploadedInfo.storedName,
      uploadedInfo.mimetype,
      uploadedInfo.size,
      downloadURL
    );

    // Broadcast real-time file addition to all connected clients
    pageEvents.emit(slug, {
      type: "files_updated",
      action: "uploaded",
      fileId: uploadedInfo.fileId,
    });

    return NextResponse.json({
      fileId: uploadedInfo.fileId,
      originalName: uploadedInfo.originalName,
      downloadURL,
      mimetype: uploadedInfo.mimetype,
      size: uploadedInfo.size,
    }, { status: 201 });

  } catch (err: unknown) {
    // Only expose stable client errors. Busboy/DB/B2 messages can leak
    // internals and are not safe to reflect to an attacker.
    const message = err instanceof Error ? err.message : "";
    if (message === "File type not allowed") {
      return NextResponse.json({ error: message }, { status: 422 });
    }
    if (message.includes("exceeds")) {
      return NextResponse.json({ error: "Upload exceeds the 500 MB limit" }, { status: 413 });
    }
    console.error("[Upload] request failed", err);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
