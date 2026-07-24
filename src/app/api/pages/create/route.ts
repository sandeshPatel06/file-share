import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { createPageSchema, slugSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimiter";

// POST /api/pages/create
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = createPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 422 });
  }

  const { slug, password } = parsed.data;

  try {
    const existing = db.prepare("SELECT slug FROM pages WHERE slug = ?").get(slug);
    if (existing) {
      return NextResponse.json({ error: "This slug is already taken" }, { status: 409 });
    }

    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    db.prepare(`
      INSERT INTO pages (slug, content, isProtected, passwordHash)
      VALUES (?, ?, ?, ?)
    `).run(slug, "", password ? 1 : 0, passwordHash);

    return NextResponse.json({ slug }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create space";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/pages/create?slug=xyz — check availability
export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const slug = req.nextUrl.searchParams.get("slug") ?? "";
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return NextResponse.json({ available: false, error: parsed.error.issues[0]?.message ?? "Validation error" });
  }

  try {
    const existing = db.prepare("SELECT slug FROM pages WHERE slug = ?").get(slug);
    return NextResponse.json({ available: !existing });
  } catch {
    return NextResponse.json({ available: true });
  }
}
