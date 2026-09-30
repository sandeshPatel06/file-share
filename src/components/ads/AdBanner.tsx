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
  position?: "in-content" | "bottom";
  className?: string;
}

/**
 * AdBanner renders a policy-compliant Google AdSense ad unit.
 *
 * Compliance & Policy Safeguards (AdSense Navigation Policy):
 * - Clear, unambiguous "ADVERTISEMENT" badge adhering to Google Publisher Policies.
 * - Distinct visual separation with border, subtle background, and padding to prevent accidental clicks.
 * - Minimum-height container preventing layout shift (CLS).
 * - Safe vertical margins enforcing clearance from navigation controls, sticky headers, and CTAs.
 * - Position modes: "in-content" (editorial text flow) vs "bottom" (deep footer clearance).
 * - Only rendered on content-rich pages with substantial editorial text.
 * - Graceful initialization handling without crashing if blocked by ad-blockers.
 */
export function AdBanner({
  slot = "1234567890",
  format = "auto",
  responsive = true,
  position = "in-content",
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

  // Safe position-based margin enforcement (ensures minimum clearance from interactive controls)
  const positionClasses =
    position === "bottom"
      ? "my-16 sm:my-20"
      : "my-12 sm:my-16";

  return (
    <aside
      aria-label="Advertisement"
      role="complementary"
      className={`w-full clear-both select-none transition-all duration-150 ${positionClasses} ${className}`}
    >
      <div className="w-full mx-auto p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm text-center relative overflow-hidden">
        {/* Unambiguous sponsored label with visual dividers */}
        <div
          className="flex items-center justify-center gap-2 mb-3 select-none"
          aria-hidden="true"
        >
          <span className="h-px w-8 bg-[var(--border-color)]" />
          <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-[var(--text-subtle)]">
            Advertisement
          </span>
          <span className="h-px w-8 bg-[var(--border-color)]" />
        </div>

        {/* Minimum-height container preventing layout shift (CLS) */}
        <div className="min-h-[260px] sm:min-h-[280px] w-full flex items-center justify-center overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", minWidth: "250px", minHeight: "100px" }}
            data-ad-client="ca-pub-4947821599815451"
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>
      </div>
    </aside>
  );
}
