"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT_ID, isAdsEnabled } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  responsive?: boolean;
  className?: string;
}

/**
 * AdBanner renders a policy-compliant Google AdSense ad unit.
 *
 * Compliance & Policy Safeguards (AdSense Site Behavior: Navigation):
 * - Clear, unambiguous "Advertisement" badge adhering to Google Publisher Policies.
 * - Diagonal-hatched surface (.ad-surface in globals.css) + dashed border make the
 *   unit visually categorically distinct from every solid-surface nav menu, CTA box,
 *   related-article card, and download button on the site, so it can never be mistaken
 *   for site navigation or a download link.
 * - Never rendered inside workspace editor, file vault, download/export menus, sticky
 *   headers, TOC navigation, CTA button groups, or related-article grids. Callers must
 *   keep at least one full editorial section (~300px+) between the unit and any
 *   navigation menu, CTA, or download link.
 * - Enforces vertical separation (my-8 sm:my-12) from navigation menus, TOCs,
 *   CTAs, and download links so ads cannot be mistaken for site navigation.
 * - Never sticky, floating, or overlapping content; static in-content flow only.
 * - Auto-collapses completely when an ad fails to fill or if slot is invalid (data-ad-status="unfilled" or timeout).
 * - Marked with role="complementary", aria-label="Advertisement", and data-nosnippet="true".
 */
export function AdBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  const enabled = isAdsEnabled(slot);

  useEffect(() => {
    if (!enabled) return;

    const el = adRef.current;
    if (!el) return;

    // Observe changes to data-ad-status attribute set by AdSense runtime
    const observer = new MutationObserver(() => {
      const status = el.getAttribute("data-ad-status");
      if (status === "unfilled") {
        setIsUnfilled(true);
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ["data-ad-status"] });

    // Fallback collapse timeout: If after 3.5s no ad iframe was loaded and status is not filled,
    // collapse the unit so no empty dead box remains on screen.
    const timer = setTimeout(() => {
      const status = el.getAttribute("data-ad-status");
      const hasIframe = el.querySelector("iframe") !== null;
      if (status === "unfilled" || (!hasIframe && status !== "filled")) {
        setIsUnfilled(true);
      }
    }, 3500);

    // Push ad request if valid slot and not already pushed
    if (typeof window !== "undefined" && !isPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.debug("AdSense push skipped or blocked:", err);
        }
        setTimeout(() => {
          setIsUnfilled(true);
        }, 0);
      }
    }

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [enabled]);

  // Collapse completely if slot is invalid/disabled or unfilled
  if (!enabled || isUnfilled) {
    return null;
  }

  return (
    <aside
      aria-label="Advertisement"
      role="complementary"
      data-nosnippet="true"
      className={`w-full max-w-3xl mx-auto clear-both select-none transition-all duration-200 my-8 sm:my-12 ${className}`}
    >
      <div className="ad-surface w-full mx-auto p-4 sm:p-6 rounded-2xl border-2 border-dashed border-[var(--border-color)] text-center relative overflow-hidden">
        {/* Unambiguous advertisement badge */}
        <div
          className="flex items-center justify-center gap-3 mb-3 select-none"
          aria-hidden="true"
        >
          <span className="h-px flex-1 max-w-[40px] sm:max-w-[80px] bg-[var(--border-color)]" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-main)] border border-[var(--border-color)]">
            Advertisement
          </span>
          <span className="h-px flex-1 max-w-[40px] sm:max-w-[80px] bg-[var(--border-color)]" />
        </div>

        {/* Ad container */}
        <div className="min-h-[100px] w-full flex items-center justify-center overflow-hidden [&_ins]:max-w-full [&_iframe]:max-w-full [&_iframe]:w-full">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>

        {/* Caption */}
        <p
          className="mt-2 text-xs text-[var(--text-muted)] font-mono select-none"
          aria-hidden="true"
        >
          Third-party ad • Not a site menu or download link
        </p>
      </div>
    </aside>
  );
}
