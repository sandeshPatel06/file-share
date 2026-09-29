"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal";
  responsive?: boolean;
  className?: string;
}

/**
 * AdBanner renders a policy-compliant Google AdSense ad unit.
 *
 * Compliance Features:
 * - Clear "ADVERTISEMENT" badge adhering to Google Publisher Policies.
 * - Distinct visual separation with subtle borders to prevent accidental clicks.
 * - Only rendered on content-rich pages with substantial editorial text.
 * - Graceful initialization handling without crashing if blocked by ad-blockers.
 */
export function AdBanner({
  slot = "1234567890",
  format = "auto",
  responsive = true,
  className = "",
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    // Only attempt push if window and adsbygoogle are available, and not already pushed
    if (typeof window !== "undefined" && !isPushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      } catch (err) {
        // Silently handle adblock or network errors
        if (process.env.NODE_ENV === "development") {
          console.debug("AdSense push skipped or blocked:", err);
        }
      }
    }
  }, []);

  return (
    <div
      className={`my-8 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-hidden text-center ${className}`}
      aria-label="Sponsored Content"
    >
      <div className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-subtle)] mb-2 select-none">
        Advertisement
      </div>
      <div className="min-h-[100px] flex items-center justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-4947821599815451"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
}
