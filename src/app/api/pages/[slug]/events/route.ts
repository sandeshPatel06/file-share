import { NextRequest } from "next/server";
import { pageEvents } from "@/lib/events";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  isProtected: number;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/pages/[slug]/events — Server-Sent Events stream for instant real-time updates
export async function GET(req: NextRequest, ctx: RouteContext) {
  const { slug } = await ctx.params;

  const page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  if (page?.isProtected) {
    const authHeader = req.headers.get("authorization") ?? "";
    const tokenParam = req.nextUrl.searchParams.get("token") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : tokenParam;

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
    const payload = await verifyPageToken(token);
    if (payload?.slug !== slug) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ slug, timestamp: Date.now() })}\n\n`)
      );

      const onPageEvent = (eventData: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: message\ndata: ${JSON.stringify(eventData)}\n\n`)
          );
        } catch {
          // Stream closed
        }
      };

      pageEvents.on(slug, onPageEvent);

      // Keepalive ping every 10s to keep connection open without dev server timeout
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 10000);

      req.signal.addEventListener("abort", () => {
        pageEvents.off(slug, onPageEvent);
        clearInterval(pingInterval);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
    },
  });
}
