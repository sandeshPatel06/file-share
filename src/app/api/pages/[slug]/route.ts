import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { rateLimit } from "@/lib/rateLimiter";
import { verifyPageToken } from "@/lib/jwt";
import { deleteFromB2, hasB2Storage } from "@/lib/b2";
import path from "path";
import fs from "fs";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  slug: string;
  content: string | null;
  isProtected: number;
}

interface FileRow {
  storedName: string;
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

// DELETE /api/pages/[slug] — delete workspace and associated files permanently
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  const limited = await rateLimit(req, "general");
  if (limited) return limited;

  const { slug } = await ctx.params;
  const page = (await db.prepare("SELECT slug, isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;

  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  if (Boolean(page.isProtected)) {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyPageToken(token);
    if (payload?.slug !== slug) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const files = (await db.prepare("SELECT storedName FROM files WHERE slug = ?").all(slug)) as FileRow[];

    await db.prepare("DELETE FROM files WHERE slug = ?").run(slug);
    await db.prepare("DELETE FROM pages WHERE slug = ?").run(slug);

    // Metadata deletion must not leave inaccessible local or B2 objects behind.
    const b2Enabled = hasB2Storage();
    await Promise.all(files.map(async ({ storedName }) => {
      const safeName = path.basename(storedName);
      const filePath = path.join(process.cwd(), "uploads", safeName);
      try {
        await fs.promises.unlink(filePath);
      } catch (error: unknown) {
        const code = error && typeof error === "object" && "code" in error
          ? (error as { code?: string }).code
          : undefined;
        if (code !== "ENOENT") {
          console.warn("Failed to remove local file during workspace deletion:", safeName);
        }
      }
      if (b2Enabled) {
        await deleteFromB2(safeName);
      }
    }));

    return NextResponse.json({ success: true, message: "Workspace deleted permanently" });
  } catch (err: unknown) {
    console.error("Failed to delete workspace:", err);
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 });
  }
}
