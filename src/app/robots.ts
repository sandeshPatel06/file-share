import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/s/"],
      },
      {
        userAgent: "Mediapartners-Google",
        allow: "/",
      },
      {
        userAgent: "Google-Display-Ads-Bot",
        allow: "/",
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
