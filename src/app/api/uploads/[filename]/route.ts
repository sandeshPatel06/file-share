import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import path from "path";
import fs from "fs";

interface RouteContext {
  params: Promise<{ filename: string }>;
}

interface FileRow {
  mimetype: string;
}

// GET /api/uploads/[filename] — serve stored file with proper Content-Type
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { filename } = await ctx.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), "uploads", safeFilename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileRecord = (await db.prepare("SELECT mimetype FROM files WHERE storedName = ?").get(safeFilename)) as FileRow | undefined;
  const contentType = fileRecord?.mimetype || "application/octet-stream";

  const fileStream = fs.readFileSync(filePath);
  
  return new NextResponse(fileStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
