import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
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

    const parsePromise = new Promise<{
      fileId: string;
      originalName: string;
      storedName: string;
      mimetype: string;
      size: number;
    }>((resolve, reject) => {
      bb.on("file", (_name, fileStream, info) => {
        fileFound = true;
        originalName = info.filename || "file";
        mimetype = info.mimeType || "application/octet-stream";
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
        storedName = `${fileId}-${safeName}`;
        filePath = path.join(uploadsDir, storedName);

        const writeStream = fs.createWriteStream(filePath);

        fileStream.on("data", (chunk: Buffer) => {
          fileSize += chunk.length;
        });

        fileStream.on("limit", () => {
          limitExceeded = true;
          fileStream.resume();
        });

        fileStream.pipe(writeStream);

        writeStream.on("error", (err) => {
          reject(err);
        });
      });

      bb.on("finish", () => {
        if (!fileFound) {
          reject(new Error("No file provided"));
          return;
        }
        if (limitExceeded || fileSize > MAX_FILE_SIZE) {
          if (filePath && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
          }
          reject(new Error("File size exceeds the 500 MB limit"));
          return;
        }
        resolve({
          fileId,
          originalName,
          storedName,
          mimetype,
          size: fileSize,
        });
      });

      bb.on("error", (err) => reject(err));
    });

    if (req.body) {
      const nodeStream = Readable.fromWeb(req.body as import("stream/web").ReadableStream);
      nodeStream.pipe(bb);
    } else {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    const uploadedInfo = await parsePromise;
    const downloadURL = `/api/uploads/${uploadedInfo.storedName}`;

    // Upload to Backblaze B2 Object Storage if B2 credentials are set
    if (hasB2Storage() && filePath && fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      await uploadToB2(uploadedInfo.storedName, fileBuffer, uploadedInfo.mimetype);
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
    const message = err instanceof Error ? err.message : "File upload failed";
    const status = message.includes("exceeds") ? 413 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
