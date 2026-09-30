/**
 * SEO & Canonical URL Configuration Helper
 * Enforces https://fileshare.shptechnology.online as the canonical domain in production,
 * preventing accidental indexing of *.onrender.com or circular canonical redirect loops.
 */

export const CANONICAL_SITE_URL = "https://fileshare.shptechnology.online";

export function getAppUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  // If running in production, or if envUrl is missing/points to the internal render domain,
  // enforce the public canonical production domain.
  if (process.env.NODE_ENV === "production" || !envUrl || envUrl.includes("onrender.com")) {
    return CANONICAL_SITE_URL;
  }

  // During local development (e.g., http://localhost:3000)
  return envUrl.replace(/\/+$/, "");
}
