import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { getAppUrl } from "@/lib/seo";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

const appUrl = getAppUrl();

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
    { media: "(prefers-color-scheme: light)", color: "#f6f8fa" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FileShare — Instant Real-Time Notes & Secure File Sharing Vault",
    template: "%s | FileShare",
  },
  description: "FileShare is a free, instant real-time collaborative notepad and secure 500MB file vault. Create anonymous workspaces without registration, edit live Markdown notes with AI formatting, render Mermaid diagrams, and share files across devices via custom URLs or QR codes.",
  keywords: [
    "online notepad",
    "online notepad without login",
    "real-time collaborative notes",
    "live markdown editor online",
    "instant shared notepad",
    "temporary notes sharing",
    "collaborative markdown scratchpad",
    "free web notepad live sync",
    "anonymous text editor",
    "online notepad with link",
    "file share",
    "free file sharing no registration",
    "anonymous file transfer",
    "send large files up to 500mb free",
    "temporary file upload vault",
    "quick file share online",
    "secure file storage without account",
    "qr code file transfer pc to mobile",
    "instant file transfer link",
    "pastebin alternative no login",
    "share code snippets with syntax highlighting",
    "online mermaid diagram renderer",
    "developer scratchpad with markdown",
    "instant code sharing tool",
    "password protected notes sharing",
    "encrypted temporary file vault",
    "ephemeral workspace",
    "private shared notepad with password",
    "zero registration file transfer",
  ],
  authors: [{ name: "SANDESH-PATEL" }],
  creator: "SANDESH-PATEL",
  publisher: "FileShare",
  category: "Productivity",
  alternates: {
    canonical: appUrl,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "FileShare — Instant Real-Time Notes & Secure File Sharing Vault",
    description: "Share notes & large files instantly with live real-time synchronization. Zero registration required.",
    url: appUrl,
    siteName: "FileShare",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${appUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "FileShare Logo — Real-Time Notes & File Sharing Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FileShare — Instant Real-Time Notes & Secure File Sharing Vault",
    description: "Share notes & files instantly in real-time. No sign-up required.",
    images: [`${appUrl}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google8d8686369b9d6380",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${appUrl}/#website`,
        "url": appUrl,
        "name": "FileShare",
        "alternateName": ["FileShare Online", "FileShare Notepad", "FileShare Vault"],
        "description": "Free instant real-time collaborative notepad and secure 500MB ephemeral file sharing vault with zero registration.",
        "publisher": {
          "@id": `${appUrl}/#organization`,
        },
        "inLanguage": "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${appUrl}/#software`,
        "name": "FileShare",
        "url": appUrl,
        "image": `${appUrl}/logo.png`,
        "description": "Instant real-time collaborative Markdown text editor and high-speed 500MB secure file sharing workspace without login or registration.",
        "applicationCategory": "UtilitiesApplication, ProductivityApplication, DeveloperApplication",
        "operatingSystem": "All (Web Browser, Windows, macOS, Linux, iOS, Android)",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1540",
          "bestRating": "5",
          "worstRating": "1",
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "featureList": [
          "Zero registration instant anonymous workspaces",
          "Real-time live collaborative Markdown editing with SSE sync",
          "Instant file upload vault supporting files up to 500MB",
          "Automatic Mermaid syntax diagram rendering",
          "AI Copilot one-click Markdown syntax formatting",
          "Salted bcrypt password protection with JWT token verification",
          "Dynamic QR code generator for instant PC to phone handoff",
          "Dark and light theme support",
        ],
        "publisher": {
          "@id": `${appUrl}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${appUrl}/#organization`,
        "name": "SHP Technology",
        "url": appUrl,
        "logo": `${appUrl}/logo.png`,
        "founder": {
          "@type": "Person",
          "name": "Sandesh Patel",
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station",
          "addressLocality": "Jabalpur",
          "addressRegion": "Madhya Pradesh",
          "postalCode": "482001",
          "addressCountry": "IN",
        },
      },
    ],
  };

  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Consent Mode v2 Initialization (GDPR & DPDP Act 2023 Default Denied with wait_for_update) */}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-QJ7L4HP72G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-QJ7L4HP72G', {
              anonymize_ip: true
            });
          `}
        </Script>
        {/* Google AdSense Site Verification (Script loaded conditionally on content-rich pages) */}
        <meta name="google-adsense-account" content="ca-pub-4947821599815451" />
      </head>
      <body className="antialiased bg-[var(--bg-main)] text-[var(--text-main)] min-h-dvh font-sans transition-colors duration-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent-primary)] focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme={process.env.NEXT_PUBLIC_DEFAULT_THEME || "dark"}
          enableSystem={false}
        >
          <div id="main-content" tabIndex={-1} className="outline-none min-h-dvh flex flex-col">
            {children}
          </div>
          <ToastProvider />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
