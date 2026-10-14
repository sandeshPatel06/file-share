import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next 16 `proxy` convention (renamed from deprecated `middleware`).
export function proxy(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = request.headers.get("host") || "";
  const currentDomain = forwardedHost || host;

  // Never redirect if already on the new domain
  if (currentDomain.includes("fileshare.shptechnology.online")) {
    return NextResponse.next();
  }

  // Redirect old domain to new domain
  if (currentDomain.includes("fileshare-live.onrender.com")) {
    const url = request.nextUrl.clone();
    url.hostname = "fileshare.shptechnology.online";
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Vault uploads stream up to 500MB via busboy — keep the proxy from
    // cloning/buffering those bodies in memory on small instances.
    "/((?!_next/static|_next/image|favicon.ico|api/pages/.*/files/upload).*)",
  ],
};
