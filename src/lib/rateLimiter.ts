import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest, NextResponse } from "next/server";

// Strict limiter for password verify — 5 attempts per 60s per IP
const verifyLimiter = new RateLimiterMemory({
  points:   5,
  duration: 60,
});

// General API limiter — 300 req per 60s per IP (accommodates polling & active tabs)
const generalLimiter = new RateLimiterMemory({
  points:   300,
  duration: 60,
});

// Sensitive limiter — 30 req per 60s per IP for CPU-heavy routes
// (bcrypt cost-12 hashing on create-with-password / password-set).
const sensitiveLimiter = new RateLimiterMemory({
  points:   30,
  duration: 60,
});

// Uploads are expensive even when they fail: cap connection attempts before
// busboy starts consuming a potentially 500 MB request body.
const uploadLimiter = new RateLimiterMemory({
  points: 12,
  duration: 600,
});

function getIp(req: NextRequest): string {
  // Never trust the leftmost X-Forwarded-For entry — it is client-controlled
  // and trivially rotated to defeat per-IP budgets. The proxy appends the
  // real client IP at the RIGHT, so take the last entry. Empty strings fall
  // through (||, not ??) to the next source instead of sharing one bucket.
  const forwarded = req.headers.get("x-forwarded-for");
  const fromXff = forwarded?.split(",").map((s) => s.trim()).filter(Boolean).pop();
  return (
    fromXff ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function rateLimit(
  req: NextRequest,
  type: "verify" | "general" | "sensitive" | "upload" = "general"
): Promise<NextResponse | null> {
  const ip      = getIp(req);
  const limiter = type === "verify"
    ? verifyLimiter
    : type === "sensitive"
      ? sensitiveLimiter
      : type === "upload"
        ? uploadLimiter
        : generalLimiter;

  try {
    await limiter.consume(ip);
    return null; // allowed
  } catch {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }
}
