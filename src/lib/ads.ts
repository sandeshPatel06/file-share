/**
 * Google AdSense — manual in-content units only.
 *
 * REQUIRED dashboard settings (Site Behavior: Navigation compliance):
 * - Auto ads: OFF (all formats)
 * - Anchor ads: OFF (never overlay sticky header / bottom nav)
 * - Vignette / full-screen: OFF
 * - Multiplex / Matched content / Related search: OFF (these mimic
 *   site navigation grids and trigger "mistaken for menu" flags)
 * - In-page auto-insert: OFF — only the explicit <AdBanner> units below
 *   may serve. Auto-insertion would place ads next to Download / Upload /
 *   Export / Copy-Link buttons in workspaces, which is exactly what the
 *   "Publishers may not place ads where they might be mistaken for menu,
 *   navigation or download links" policy prohibits.
 *
 * Placement allowlist: guide + about (+ substantial resource articles only).
 * NEVER mount ads on `/`, `/s/[slug]`, or any vault / download / export flow.
 */
export const ADSENSE_CLIENT_ID = "ca-pub-4947821599815451";

const guideMid = process.env.NEXT_PUBLIC_ADS_SLOT_GUIDE || "7002682101";
const aboutMid = process.env.NEXT_PUBLIC_ADS_SLOT_ABOUT || "4278561824";
/** Keep empty during review — no ads on article pages yet */
const articleMid = process.env.NEXT_PUBLIC_ADS_SLOT_ARTICLE || "";

export const ADSENSE_SLOTS = {
  guideMid,
  aboutMid,
  articleMid,
  /**
   * Backward-compat aliases for pre-rename slot keys.
   * guide/page.tsx uses guideSection1/guideSection2, about/page.tsx uses
   * about, resources/[slug]/page.tsx uses resourceArticle.
   */
  guideSection1: guideMid,
  guideSection2: guideMid,
  about: aboutMid,
  resourceArticle: articleMid,
} as const;

/** Real AdSense unit IDs are 9–12 digit numbers */
export function isValidSlot(slot: string | undefined | null): boolean {
  if (!slot) return false;
  const s = slot.trim();
  if (!/^\d{9,12}$/.test(s)) return false;
  // Reject obvious placeholders
  if (/^123456789/.test(s) || /^200000000/.test(s) || /^300000000/.test(s)) {
    return false;
  }
  return true;
}

export function isAdsEnabled(slot?: string): boolean {
  return Boolean(ADSENSE_CLIENT_ID) && isValidSlot(slot);
}
