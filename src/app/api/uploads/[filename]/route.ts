export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { b2Client, b2BucketName } from "@/lib/b2";

interface RouteContext {
  params: Promise<{ filename: string }>;
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { filename } = await ctx.params;

  const fileRecord: any = await db.prepare("SELECT slug, mimetype, originalName, size FROM files WHERE storedName = ?").get(filename);
  
  if (!fileRecord) {
    return NextResponse.json({ error: "File record not found" }, { status: 404 });
  }

  if (fileRecord?.slug) {
    const page: any = await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(fileRecord.slug);
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

  if (!b2BucketName) {
    return NextResponse.json({ error: "B2 Bucket not configured" }, { status: 500 });
  }

  const rangeHeader = req.headers.get("range");
  let getObjectCommandInput: any = {
    Bucket: b2BucketName,
    Key: filename,
  };
  
  if (rangeHeader) {
    getObjectCommandInput.Range = rangeHeader;
  }

  let s3Object;
  try {
    s3Object = await b2Client.send(new GetObjectCommand(getObjectCommandInput));
  } catch (err: any) {
    return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
  }
  
  const hasBody = !!s3Object.Body;

  const headers = new Headers();
  if (s3Object.ETag) headers.set("etag", s3Object.ETag);
  if (s3Object.ContentLength) headers.set("Content-Length", s3Object.ContentLength.toString());
  if (s3Object.ContentRange) headers.set("Content-Range", s3Object.ContentRange);
  
  const commonHeaders = {
    "Accept-Ranges": "bytes",
    "Content-Type": fileRecord.mimetype || "application/octet-stream",
    "Content-Disposition": `inline; filename="${encodeURIComponent(fileRecord.originalName)}"`,
    "X-Frame-Options": "SAMEORIGIN",
    "Content-Security-Policy": "frame-ancestors 'self'",
    "Cache-Control": "public, max-age=31536000, immutable",
  };

  for (const [k, v] of Object.entries(commonHeaders)) {
    headers.set(k, v);
  }

  if (hasBody) {
    return new NextResponse(s3Object.Body?.transformToWebStream() as any, {
      status: rangeHeader ? 206 : 200,
      headers,
    });
  } else {
    return new NextResponse(null, {
      status: rangeHeader ? 416 : 404,
      headers,
    });
  }
}
