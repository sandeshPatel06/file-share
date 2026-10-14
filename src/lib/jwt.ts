import { SignJWT, jwtVerify } from "jose";

const secretValue = process.env.JWT_SECRET;

// Fail closed in production: the fallback below is public in the repo, so
// any prod without JWT_SECRET would accept attacker-forged tokens for every
// protected page. Dev keeps the fallback for zero-config local runs.
if (!secretValue && process.env.NODE_ENV === "production") {
  throw new Error(
    "JWT_SECRET is not set. Refusing to start with a publicly-known signing key."
  );
}

const secret = new TextEncoder().encode(
  secretValue ?? "fallback-dev-secret-change-in-production"
);

export interface PageSessionPayload {
  slug: string;
  iat?: number;
  exp?: number;
}

/** Issue a 24-hour JWT scoped to a specific page slug */
export async function signPageToken(slug: string): Promise<string> {
  return new SignJWT({ slug })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

/** Verify a page token — returns payload or null if invalid/expired */
export async function verifyPageToken(
  token: string
): Promise<PageSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (typeof (payload as Record<string, unknown>).slug !== "string") {
      return null;
    }
    return payload as unknown as PageSessionPayload;
  } catch {
    return null;
  }
}
