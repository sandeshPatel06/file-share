import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { renameSlugSchema } from "@/lib/validators";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  isProtected: number;
}

// PATCH /api/pages/[slug]/rename
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug } = await ctx.params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = renameSlugSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 422 });
  }
  const { newSlug } = parsed.data;

  // Fetch old page
  const oldPage = db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug) as PageRow | undefined;
  if (!oldPage) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Auth check for protected pages
  if (oldPage.isProtected) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyPageToken(token);
    if (payload?.slug !== slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check new slug is available
  const newPage = db.prepare("SELECT slug FROM pages WHERE slug = ?").get(newSlug);
  if (newPage) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const transaction = db.transaction(() => {
    db.prepare(`
      UPDATE pages
      SET slug = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE slug = ?
    `).run(newSlug, slug);

    db.prepare(`
      UPDATE files
      SET slug = ?
      WHERE slug = ?
    `).run(newSlug, slug);
  });

  transaction();

  return NextResponse.json({ newSlug });
}
