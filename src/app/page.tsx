import { generateSlug } from "@/lib/slugGenerator";
import { LandingPage } from "@/components/LandingPage";
import { getAppUrl } from "@/lib/seo";
import type { Metadata } from "next";

const appUrl = getAppUrl();

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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is FileShare free to use, and do I need to register?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, FileShare is 100% free with zero registration required. There are no forms to fill out, no email confirmations, and no subscriptions. You can start typing or uploading immediately."
        }
      },
      {
        "@type": "Question",
        "name": "What is the file size upload limit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can upload files up to 500 MB each. FileShare supports multi-file uploads including videos, zip archives, images, PDFs, and code repositories with streaming cloud storage backing."
        }
      },
      {
        "@type": "Question",
        "name": "How does real-time synchronization work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FileShare utilizes Server-Sent Events (SSE) to broadcast changes across all connected clients in milliseconds. Edits and file uploads show up automatically without any page refresh needed."
        }
      },
      {
        "@type": "Question",
        "name": "Can I protect my workspace with a password?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Click the 'Lock Space' button inside any workspace to set a password. Passwords are securely hashed with bcrypt (10 rounds) and access is verified via JWT tokens."
        }
      },
      {
        "@type": "Question",
        "name": "How do I open my workspace on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click the QR code button in the top navigation bar of your workspace to generate a high-resolution QR code. Scan it with your phone's camera to immediately continue editing on mobile."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingPage defaultSlug={defaultSlug} />
    </>
  );
}
