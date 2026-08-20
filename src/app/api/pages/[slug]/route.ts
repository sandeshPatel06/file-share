import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { rateLimit } from "@/lib/rateLimiter";
import { verifyPageToken } from "@/lib/jwt";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  slug: string;
  content: string | null;
  isProtected: number;
}

// GET /api/pages/[slug] — fetch page metadata (withholds content if protected & unauthenticated)
export async function GET(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug } = await ctx.params;
  const page = (await db.prepare("SELECT slug, content, isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const isProtected = Boolean(page.isProtected);
  let hasValidToken = false;

  if (isProtected) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) {
      const payload = await verifyPageToken(token);
      if (payload?.slug === slug) {
        hasValidToken = true;
      }
    }
  }

  return NextResponse.json({
    slug: page.slug,
    content: isProtected && !hasValidToken ? "" : (page.content ?? ""),
    isProtected,
  });
}
