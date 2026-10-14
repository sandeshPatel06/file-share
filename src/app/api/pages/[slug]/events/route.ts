import { NextRequest } from "next/server";
import { pageEvents } from "@/lib/events";
import db from "@/lib/db";
import { verifyPageToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rateLimiter";

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
  // Rate-limit connection opens: each stream holds a listener + 10s ping
  // interval, so unbounded fan-out = FD/memory exhaustion.
  const limited = await rateLimit(req, "general");
  if (limited) {
    return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment." }), { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } });
  }

  const { slug } = await ctx.params;

  const page = (await db.prepare("SELECT isProtected FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
  // Fail closed on missing pages: no phantom rooms (each would leak a
  // listener + ping interval with zero listeners).
  if (!page) {
    return new Response(JSON.stringify({ error: "Page not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
  }
  if (page.isProtected) {
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
  let cleanupStream = () => {};

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

      // Broadcast once. The new connection is already subscribed, so a
      // second direct enqueue would deliver duplicate presence events.
      const activeCount = pageEvents.listenerCount(slug);
      pageEvents.emit(slug, {
        type: "presence_updated",
        slug,
        activeCount,
      });

      // Keepalive ping every 10s to keep connection open without dev server timeout
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
        }
      }, 10000);

      cleanupStream = () => {
        pageEvents.off(slug, onPageEvent);
        clearInterval(pingInterval);
      };

      req.signal.addEventListener("abort", () => {
        cleanupStream();
        try { controller.close(); } catch {}

        const remaining = pageEvents.listenerCount(slug);
        pageEvents.emit(slug, {
          type: "presence_updated",
          slug,
          activeCount: remaining,
        });
      });
    },
    cancel() {
      // Abort is the normal path, but cancel() also runs when the runtime
      // tears down a stream without delivering the request abort event.
      cleanupStream();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Content-Encoding": "none",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "no-referrer",
    },
  });
}
