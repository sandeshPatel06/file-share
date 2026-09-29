"use client";

import Script from "next/script";

/**
 * AdSenseScript conditionally loads the Google AdSense library
 * ONLY on pages that contain rich editorial publisher content.
 * It is deliberately omitted from interactive tool pages, editor screens,
 * empty states, and authentication gates to strictly adhere to Google
 * Publisher Policies regarding screens without publisher content.
 */
export function AdSenseScript() {
  return (
    <Script
      id="adsense-script"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4947821599815451"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
