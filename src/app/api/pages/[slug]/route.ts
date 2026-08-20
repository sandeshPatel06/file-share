import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { rateLimit } from "@/lib/rateLimiter";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  slug: string;
  content: string | null;
  isProtected: number;
}

// GET /api/pages/[slug] — fetch page metadata (strips passwordHash)
export async function GET(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug } = await ctx.params;
  const page = (await db.prepare("SELECT slug, content, isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json({
    slug: page.slug,
    content: page.content ?? "",
    isProtected: Boolean(page.isProtected),
  });
}
