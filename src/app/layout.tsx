import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
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
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FileShare — Real-Time Notes & File Sharing Vault",
    template: "%s | FileShare",
  },
  description: "Create instant, anonymous workspaces to collaborate, edit live Markdown notes, and share files in real-time. Zero registration required.",
  keywords: [
    "file sharing",
    "real-time notes",
    "online notepad",
    "collaborative markdown editor",
    "file vault",
    "anonymous file transfer",
    "temporary workspace",
    "instant code sharing",
  ],
  authors: [{ name: "FileShare Team" }],
  creator: "FileShare",
  publisher: "FileShare",
  category: "Productivity",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "FileShare — Real-Time Notes & File Sharing Vault",
    description: "Share notes & large files instantly with live real-time synchronization. Zero registration needed.",
    url: appUrl,
    siteName: "FileShare",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${appUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "FileShare Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FileShare — Real-Time Notes & File Sharing Vault",
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
    "@type": "WebApplication",
    "name": "FileShare",
    "url": appUrl,
    "description": "Real-time collaborative text editor and secure file sharing workspace.",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
  };

  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
