import type { Metadata } from "next";
import Link from "next/link";
import { Shield, FileText, Lock, Globe, Database, Eye } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shptechnology.online";

export const metadata: Metadata = {
  title: "Privacy Policy — FileShare",
  description: "Privacy Policy for FileShare real-time collaborative workspace and file sharing service.",
  alternates: {
    canonical: `${appUrl}/privacy`,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span>FileShare</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Compliance & Data Protection</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--text-muted)]">Last updated: September 2, 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-8">
          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-main)]">
              <Globe className="w-4 h-4 text-[var(--accent-primary)]" />
              1. Overview
            </h2>
            <p className="text-[var(--text-muted)]">
              FileShare (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides a zero-registration, real-time collaborative workspace and temporary file sharing platform. We respect user privacy and are committed to protecting personal data. This Privacy Policy explains what information is collected, how it is processed, and your rights regarding your data when using FileShare.
            </p>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-main)]">
              <Database className="w-4 h-4 text-[var(--accent-primary)]" />
              2. Information We Collect
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
              <li><strong>User-Generated Workspace Content:</strong> Real-time markdown text, note content, and files uploaded directly to custom workspace URLs (`/s/[slug]`).</li>
              <li><strong>Authentication Data:</strong> Passwords created for protected workspaces are salted and hashed using bcrypt (10 rounds) before storage. We do not store raw workspace passwords.</li>
              <li><strong>Technical & Usage Log Data:</strong> Standard server logs including IP address, user-agent, request timestamp, and bandwidth consumption for security and rate limiting.</li>
            </ul>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-main)]">
              <Eye className="w-4 h-4 text-[var(--accent-primary)]" />
              3. Google AdSense & Third-Party Vendors
            </h2>
            <p className="text-[var(--text-muted)] mb-3">
              We use Google AdSense to serve advertisements on our web pages. Google and third-party vendors use cookies to serve ads based on a user&apos;s prior visits to our website or other websites.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
              <li>Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to FileShare and/or other sites on the Internet.</li>
              <li>Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="text-[var(--accent-primary)] underline">Google Ads Settings</a>.</li>
              <li>Alternatively, users can opt out of a third-party vendor&apos;s use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info" target="_blank" rel="noreferrer" className="text-[var(--accent-primary)] underline">aboutads.info</a>.</li>
            </ul>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-main)]">
              <Lock className="w-4 h-4 text-[var(--accent-primary)]" />
              4. Data Retention & Security
            </h2>
            <p className="text-[var(--text-muted)]">
              Uploaded files and workspace contents are stored securely on our infrastructure. File access is managed strictly via workspace authorization tokens and unique workspace URLs. We employ industry-standard encryption, HTTP Strict Transport Security (HSTS), and containerized isolation to safeguard storage vaults.
            </p>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 text-[var(--text-main)]">5. Contact Us</h2>
            <p className="text-[var(--text-muted)]">
              If you have any questions or concerns regarding this Privacy Policy or data processing practices, please contact us at support@shptechnology.online.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--border-color)] py-6 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[var(--text-main)]">Home</Link>
            <Link href="/about" className="hover:text-[var(--text-main)]">About</Link>
            <Link href="/guide" className="hover:text-[var(--text-main)]">Guide</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
