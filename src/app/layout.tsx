import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
  description: "Create instant, anonymous workspaces to collaborate, edit live Markdown notes, and share files in real-time. Zero registration required.",
  keywords: [
    "file share",
    "real-time notes",
    "online notepad",
    "collaborative markdown editor",
    "file vault",
    "anonymous file transfer",
    "temporary workspace",
    "instant code sharing",
    "live text editor",
    "secure file storage",
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
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FileShare",
    "url": appUrl,
    "image": `${appUrl}/logo.png`,
    "description": "Instant real-time collaborative text editor and secure file sharing workspace.",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    "featureList": [
      "Real-time live Markdown editing",
      "Instant multi-file upload vault",
      "Password protection & encryption",
      "Custom workspace URL slugs",
      "Zero registration required"
    ],
  };

  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FileShare" />
        <meta property="og:title" content="FileShare — Instant Real-Time Notes & Secure File Sharing Vault" />
        <meta property="og:description" content="Create instant, anonymous workspaces to collaborate, edit live Markdown notes, and share files in real-time. Zero registration required." />
        <meta property="og:url" content={appUrl} />
        <meta property="og:image" content={`${appUrl}/logo.png`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="FileShare Logo — Real-Time Notes & File Sharing Vault" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FileShare — Instant Real-Time Notes & Secure File Sharing Vault" />
        <meta name="twitter:description" content="Share notes & files instantly in real-time. No sign-up required." />
        <meta name="twitter:image" content={`${appUrl}/logo.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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

            gtag('config', 'G-QJ7L4HP72G');
          `}
        </Script>
      </head>
      <body className="antialiased bg-[var(--bg-main)] text-[var(--text-main)] min-h-dvh font-sans transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme={process.env.NEXT_PUBLIC_DEFAULT_THEME || "dark"}
          enableSystem={false}
        >
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
