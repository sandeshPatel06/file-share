"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import { ADSENSE_CLIENT_ID } from "@/lib/ads";

const STORAGE_KEY = "fileshare_cookie_consent";

function subscribeConsent(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("cookie_preferences_changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cookie_preferences_changed", callback);
  };
}

function getConsentSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerSnapshot(): string | null {
  return "";
}

function hasMarketingConsent(raw: string | null): boolean {
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { marketing?: boolean };
    return parsed.marketing === true;
  } catch {
    return false;
  }
}

// Manual units only. Auto ads, Anchor, Vignette, Multiplex and
// Related Search must stay OFF in the AdSense dashboard, otherwise Google
// auto-injects ads next to navigation / Download / Upload buttons on
// workspace pages (Site Behavior: Navigation violation).
// This script is intentionally mounted ONLY on long-form editorial pages
// (guide, about, resources). It never loads on `/`, `/s/[slug]`, or any
// file vault / download flow, and it waits for explicit marketing consent
// (Google Consent Mode v2) before loading.
export function AdSenseScript() {
  const rawConsent = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    // Consent Mode update is handled centrally in CookieConsent;
    // this hook only re-evaluates whether the script may load.
  }, [rawConsent]);

  if (!hasMarketingConsent(rawConsent)) {
    return null;
  }

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
