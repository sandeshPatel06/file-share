import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { updateContentSchema } from "@/lib/validators";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import { pageEvents } from "@/lib/events";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  isProtected: number;
}

async function isAuthorized(req: NextRequest, slug: string): Promise<boolean> {
  let page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  if (!page) {
    await db.prepare("INSERT OR IGNORE INTO pages (slug, content, isProtected) VALUES (?, '', 0)").run(slug);
    page = { isProtected: 0 };
  }
  if (!page.isProtected) return true;

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return false;

  const payload = await verifyPageToken(token);
  return payload?.slug === slug;
}

// PATCH /api/pages/[slug]/content — update editor text & broadcast live event
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug } = await ctx.params;

  if (!(await isAuthorized(req, slug))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = updateContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 422 });
  }

  await db.prepare(`
    UPDATE pages
    SET content = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE slug = ?
  `).run(parsed.data.content, slug);

  // Broadcast real-time content update to all connected clients
  pageEvents.emit(slug, {
    type: "content_updated",
    content: parsed.data.content,
  });

  return NextResponse.json({ ok: true });
}
