export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { getRequestContext } from "@cloudflare/next-on-pages";

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

  const envCtx = getRequestContext();
  const bucket = envCtx.env.UPLOADS_BUCKET as any;
  
  if (!bucket) {
    return NextResponse.json({ error: "R2 Bucket not configured" }, { status: 500 });
  }

  const rangeHeader = req.headers.get("range");
  let r2Object;
  
  if (rangeHeader) {
    // Pass standard headers for range resolution
    const headers = new Headers();
    headers.set("Range", rangeHeader);
    r2Object = await bucket.get(filename, {
      range: headers,
    });
  } else {
    r2Object = await bucket.get(filename);
  }

  if (!r2Object) {
    return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
  }
  
  const hasBody = "body" in r2Object && r2Object.body;

  const headers = new Headers();
  r2Object.writeHttpMetadata(headers);
  headers.set("etag", r2Object.httpEtag);
  
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
    return new NextResponse(r2Object.body, {
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
