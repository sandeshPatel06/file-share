"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export function AdUnit() {
  const { data: session } = useSession();
  const adLoaded = useRef(false);
  
  // If the user is logged in and has an active Pro subscription, hide ads
  const isPro = session && (session as any).isPro;

  useEffect(() => {
    if (isPro || adLoaded.current) return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
      adLoaded.current = true;
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [isPro]);

  if (isPro) return null;

  return (
    <div className="w-full overflow-hidden flex justify-center my-4 min-h-[90px]">
      {/* Google AdSense Code */}
      <ins className="adsbygoogle"
           style={{ display: "block", minWidth: "250px", minHeight: "90px" }}
           data-ad-client="ca-pub-4947821599815451"
           data-ad-slot="YOUR_AD_SLOT_ID"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
