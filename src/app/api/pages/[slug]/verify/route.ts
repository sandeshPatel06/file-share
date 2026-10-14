import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { verifyPasswordSchema } from "@/lib/validators";
import { signPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  isProtected: number;
  passwordHash: string | null;
}

// POST /api/pages/[slug]/verify — compare password, return JWT
export async function POST(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "verify");
  if (limited) return limited;

  const { slug } = await ctx.params;

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = verifyPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 422 });
  }

  const page = (await db.prepare("SELECT isProtected, passwordHash FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  if (!page || !page.isProtected || !page.passwordHash) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Constant-time response shape: the delay applies to BOTH outcomes so
  // success isn't measurably faster than failure (timing oracle). Brute
  // force is already braked by the strict verify limiter above.
  const [match] = await Promise.all([
    bcrypt.compare(parsed.data.password, page.passwordHash),
    new Promise((r) => setTimeout(r, 200)),
  ]);
  if (!match) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await signPageToken(slug);
  return NextResponse.json({ token }, { status: 200 });
}
