export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { setPasswordSchema } from "@/lib/validators";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  isProtected: number;
}

// PATCH /api/pages/[slug]/password — set or remove password
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug } = await ctx.params;

  const page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  // Premium feature gate: only Pro users can set a password
  const session = await getServerSession(authOptions);
  const isPro = session && (session as any).isPro;
  
  if (!isPro && !page.isProtected) {
    return NextResponse.json({ error: "Password protection is a Pro feature. Please upgrade." }, { status: 403 });
  }

  // If currently protected, require valid token
  if (page.isProtected) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await verifyPageToken(token);
    if (payload?.slug !== slug) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = setPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 422 });
  }

  const { password } = parsed.data;

  if (password === null) {
    await db.prepare(`
      UPDATE pages
      SET isProtected = 0, passwordHash = NULL, updatedAt = CURRENT_TIMESTAMP
      WHERE slug = ?
    `).run(slug);
    return NextResponse.json({ isProtected: false });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.prepare(`
    UPDATE pages
    SET isProtected = 1, passwordHash = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE slug = ?
  `).run(passwordHash, slug);

  return NextResponse.json({ isProtected: true });
}
