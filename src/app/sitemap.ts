import type { MetadataRoute } from "next";
import db from "@/lib/db";

interface PageRow {
  slug: string;
  updatedAt: string | null;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const DEFAULT_FEATURED_SLUGS = [
  "general",
  "notes",
  "welcome",
  "sandbox",
  "code",
  "workspace",
  "scratchpad",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  try {
    // Fetch public non-password-protected pages from SQLite
    const pages = db
      .prepare("SELECT slug, updatedAt FROM pages WHERE isProtected = 0 ORDER BY updatedAt DESC LIMIT 500")
      .all() as PageRow[];

    const addedSlugs = new Set<string>();

    // Add public database pages
    for (const page of pages) {
      if (!page.slug) continue;
      addedSlugs.add(page.slug);
      routes.push({
        url: `${appUrl}/s/${encodeURIComponent(page.slug)}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }

    // Add featured default starter workspaces if not already in DB
    for (const featured of DEFAULT_FEATURED_SLUGS) {
      if (!addedSlugs.has(featured)) {
        routes.push({
          url: `${appUrl}/s/${featured}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
  } catch {
    // Fallback if database query fails during build
    for (const featured of DEFAULT_FEATURED_SLUGS) {
      routes.push({
        url: `${appUrl}/s/${featured}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  return routes;
}
