"use client";

import { useEffect } from "react";
import {
  classifyNetwork,
  googleFontsUrl,
  readCachedTier,
  snapshotNetwork,
  writeCachedTier,
  type FontTier,
} from "@/lib/fonts";

const LINK_ID = "adaptive-font-css";
const VERIFY_TIMEOUT_MS = 3000;

function injectTierStylesheet(tier: FontTier): void {
  if (tier === "lite") return;
  const url = googleFontsUrl(tier);
  if (!url) return;
  const existing = document.getElementById(LINK_ID) as HTMLLinkElement | null;
  if (existing) {
    if (existing.getAttribute("href") === url) return;
    existing.remove();
  }
  const link = document.createElement("link");
  link.id = LINK_ID;
  link.rel = "stylesheet";
  link.href = url;
  // Non-blocking fetch: download async, apply once ready (no render block
  // on slow networks). Safety timer covers browsers that never fire onload.
  link.media = "print";
  link.onload = () => {
    link.media = "all";
  };
  document.head.appendChild(link);
  window.setTimeout(() => {
    link.media = "all";
  }, VERIFY_TIMEOUT_MS);
}

function applyTier(tier: FontTier): void {
  document.documentElement.dataset.fontTier = tier;
  injectTierStylesheet(tier);
  writeCachedTier(tier);
}

/**
 * Verify the top-tier fonts actually arrived in time. If the "full" payload
 * stalls past the timeout (mid-download network drop, captive portal that
 * returned HTML for the CSS, etc.), step down to the system stack instead
 * of leaving swapped/fallback glyphs half-painted.
 */
async function verifyTopTier(): Promise<boolean> {
  try {
    if (!("fonts" in document)) return true;
    const load = Promise.all([
      document.fonts.load('700 16px "Plus Jakarta Sans"'),
      document.fonts.load('400 16px "JetBrains Mono"'),
    ]);
    const timeout = new Promise<null>((resolve) =>
      window.setTimeout(() => resolve(null), VERIFY_TIMEOUT_MS),
    );
    return (await Promise.race([load, timeout])) !== null;
  } catch {
    return false;
  }
}

/**
 * Client runtime for network-aware fonts. The inline bootstrap in
 * `layout.tsx` already set an initial `data-font-tier` pre-paint; this
 * effect re-classifies with the live Network Information API, verifies the
 * top payload, and downgrades if needed. Also re-runs when the connection
 * changes (e.g. Wi-Fi → cellular).
 */
export function AdaptiveFontLoader() {
  useEffect(() => {
    const decide = (initial: boolean) => {
      // Cached choice wins on first run so repeat visits are stable.
      const tier = initial
        ? (readCachedTier() ?? classifyNetwork(snapshotNetwork()))
        : classifyNetwork(snapshotNetwork());
      applyTier(tier);
      if (tier === "full") {
        void verifyTopTier().then((ok) => {
          if (!ok) applyTier("lite");
        });
      }
    };

    decide(true);

    const conn = (
      navigator as Navigator & {
        connection?: { addEventListener?: (t: string, l: () => void) => void };
      }
    ).connection;
    const onChange = () => decide(false);
    conn?.addEventListener?.("change", onChange);
    return () => {
      (
        conn as
          | { removeEventListener?: (t: string, l: () => void) => void }
          | undefined
      )?.removeEventListener?.("change", onChange);
    };
  }, []);

  return null;
}
