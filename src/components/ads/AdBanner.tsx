"use client";

import { useEffect, useRef, useState } from "react";
import { ADSENSE_CLIENT_ID } from "@/lib/ads";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdBannerProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  responsive?: boolean;
  position?: "in-content" | "bottom";
  className?: string;
}

/**
 * AdBanner renders a policy-compliant Google AdSense ad unit.
 *
 * Compliance & Policy Safeguards (AdSense Navigation Policy):
 * - Clear, unambiguous "SPONSORED ADVERTISEMENT" badge adhering to Google Publisher Policies.
 * - Distinct visual separation with dashed border, muted tinted background, and generous padding so it cannot be mistaken for site navigation or editorial cards.
 * - Enforces minimum vertical separation (~150-200px) from navigation menus, TOCs, and call-to-actions.
 * - Auto-collapses completely when an ad fails to fill (data-ad-status="unfilled" or timeout), preventing large empty clickable shells.
 * - Only rendered mid-body on substantial editorial pages (Guide, About, Resource Articles).
 * - Marked with role="complementary", aria-label="Advertisement", and data-nosnippet.
 */
export function AdBanner({
  slot,
  format = "auto",
  responsive = true,
  position = "in-content",
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
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

    // Push ad request if not already pushed
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
  }, []);

  // Collapse height completely if ad is unfilled or blocked, removing any dead clickable space
  if (isUnfilled) {
    return null;
  }

  // Safe position-based margin enforcement (ensures ≥150–200px clearance from interactive controls & TOC)
  const positionClasses =
    position === "bottom"
      ? "my-36 sm:my-48"
      : "my-32 sm:my-44";

  return (
    <aside
      aria-label="Advertisement"
      role="complementary"
      data-nosnippet="true"
      className={`w-full clear-both select-none transition-all duration-200 ${positionClasses} ${className}`}
    >
      <div className="w-full mx-auto p-4 sm:p-6 rounded-2xl bg-neutral-500/[0.03] dark:bg-neutral-400/[0.02] border-2 border-dashed border-[var(--border-color)] text-center relative overflow-hidden">
        {/* Unambiguous sponsored label with visual dividers */}
        <div
          className="flex items-center justify-center gap-3 mb-3 select-none"
          aria-hidden="true"
        >
          <span className="h-px flex-1 max-w-[40px] sm:max-w-[80px] bg-[var(--border-color)]" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-main)] border border-[var(--border-color)]">
            Sponsored Advertisement
          </span>
          <span className="h-px flex-1 max-w-[40px] sm:max-w-[80px] bg-[var(--border-color)]" />
        </div>

        {/* Ad container with minimum dimensions preventing layout shifts */}
        <div className="min-h-[100px] w-full flex items-center justify-center overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", minWidth: "250px", minHeight: "100px" }}
            data-ad-client={ADSENSE_CLIENT_ID}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>

        {/* Explicit disclaimer confirming non-navigation status */}
        <p
          className="mt-2 text-[10px] text-[var(--text-subtle)] font-mono select-none"
          aria-hidden="true"
        >
          Third-party advertisement • Not an editorial link or site navigation control
        </p>
      </div>
    </aside>
  );
}
