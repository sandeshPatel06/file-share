import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

interface RouteContext {
  params: Promise<{ filename: string }>;
}

// GET /api/uploads/[filename] — serve stored file from local uploads directory
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { filename } = await ctx.params;
  const safeFilename = path.basename(filename);
  const filePath = path.join(process.cwd(), "uploads", safeFilename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileStream = fs.readFileSync(filePath);
  
  return new NextResponse(fileStream, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
