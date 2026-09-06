"use client";

import { useSession } from "next-auth/react";
import Script from "next/script";

export function AdUnit() {
  const { data: session } = useSession();
  
  // If the user is logged in and has an active Pro subscription, hide ads
  const isPro = session && (session as any).isPro;
  if (isPro) return null;

  return (
    <div className="w-full overflow-hidden flex justify-center my-4">
      {/* Google AdSense Code */}
      <ins className="adsbygoogle"
           style={{ display: "block" }}
           data-ad-client="ca-pub-4947821599815451"
           data-ad-slot="YOUR_AD_SLOT_ID"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
      <Script id="adsense-init" strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  );
}
