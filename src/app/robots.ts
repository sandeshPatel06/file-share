import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/health"],
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
    host: appUrl,
  };
}
