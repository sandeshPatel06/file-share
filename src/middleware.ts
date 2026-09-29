import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
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
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
