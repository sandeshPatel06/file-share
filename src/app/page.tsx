import { generateSlug } from "@/lib/slugGenerator";
import { LandingPage } from "@/components/LandingPage";
import type { Metadata } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://file-share-dev.onrender.com";

export const metadata: Metadata = {
  title: "FileShare — Instant Real-Time Notes & Secure File Sharing Vault",
  description: "Create instant, anonymous workspaces to collaborate, edit live Markdown notes, and share files up to 500MB in real-time. Zero registration required.",
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: "FileShare — Instant Real-Time Notes & Secure File Sharing Vault",
    description: "Share notes & files instantly in real-time with zero registration required.",
    url: appUrl,
    siteName: "FileShare",
    type: "website",
    images: [
      {
        url: `${appUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "FileShare Logo — Real-Time Notes & File Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FileShare — Instant Real-Time Notes & Secure File Sharing Vault",
    description: "Share notes & files instantly in real-time. No sign-up required.",
    images: [`${appUrl}/logo.png`],
  },
};

export default function Home() {
  const defaultSlug = generateSlug();
  return <LandingPage defaultSlug={defaultSlug} />;
}
