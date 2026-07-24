import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title:       "FileShare — Real-time File & Note Sharing",
  description: "Create a unique URL to share notes and files in real-time. No account needed. Password-protect your space.",
  keywords:    ["file sharing", "real-time", "collaborative", "notes", "live"],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
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
