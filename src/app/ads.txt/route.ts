import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const adsTxtContent = "google.com, pub-4947821599815451, DIRECT, f08c47fec0942fa0\n";

  return new NextResponse(adsTxtContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
