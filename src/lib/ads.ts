/**
 * Google AdSense Configuration
 *
 * Publisher ID: ca-pub-4947821599815451
 *
 * Policy Compliance Note (Site Behavior: Navigation):
 * - Ads are strictly placed in substantial editorial reading flows (Guide, About, and Resource Articles).
 * - No ads are placed on the homepage (/), workspace app (/s/*), or resource index (/resources).
 * - All ad units are manual in-article responsive Display units with clear "Sponsored Advertisement" badges.
 * - Ad slot IDs can be configured via environment variables or set directly below once real ad units
 *   are generated in the Google AdSense dashboard (Ads -> By ad unit -> Display ads).
 */

export const ADSENSE_CLIENT_ID = "ca-pub-4947821599815451";

export const ADSENSE_SLOTS = {
  // Guide page: Mid-article ad slot (after Section 3: AI Copilot Formatter)
  guideSection1: process.env.NEXT_PUBLIC_ADS_SLOT_GUIDE_1 || "2000000001",

  // Guide page: In-content ad slot (after Section 7: Security & Encryption)
  guideSection2: process.env.NEXT_PUBLIC_ADS_SLOT_GUIDE_2 || "2000000002",

  // About page: Mid-manifesto in-content ad slot (after Section 3: Architecture)
  about: process.env.NEXT_PUBLIC_ADS_SLOT_ABOUT || "3000000001",

  // Resource article page: Mid-body in-article ad slot (between section splits)
  resourceArticle: process.env.NEXT_PUBLIC_ADS_SLOT_RESOURCE_ARTICLE || "1234567891",
} as const;
