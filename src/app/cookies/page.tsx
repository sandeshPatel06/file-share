import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ShieldCheck, Settings, CheckCircle2, Lock, Eye, ArrowLeft } from "lucide-react";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "Cookie Policy — FileShare",
  description: "Detailed Cookie Policy for FileShare. Understand what cookies and browser storage technologies we use, why we use them, and how to manage your privacy preferences.",
  alternates: {
    canonical: `${appUrl}/cookies`,
  },
  openGraph: {
    title: "Cookie Policy — FileShare",
    description: "Learn about the cookies and storage technologies used by FileShare.",
    url: `${appUrl}/cookies`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <Cookie className="w-4 h-4" />
            </div>
            <span>FileShare</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        <div className="mb-10 border-b border-[var(--border-color)] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Compliance & Transparency</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
            This Cookie Policy explains how FileShare, operated by SHP Technology (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), uses cookies, local storage, and similar technologies on our website.
          </p>
          <p className="text-xs text-[var(--text-subtle)] mt-2">
            Last Updated: September 29, 2026 | Effective Date: September 29, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Section 1: What are cookies */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[var(--accent-primary)]" />
              1. What Are Cookies and Local Storage?
            </h2>
            <p className="text-[var(--text-muted)]">
              Cookies are small data files placed on your computer or mobile device when you visit a website. They are widely used by web applications to remember your preferences, keep you logged into secure spaces, and provide aggregate usage statistics.
            </p>
            <p className="text-[var(--text-muted)]">
              In addition to standard HTTP cookies, we also use browser <strong>Local Storage</strong> and <strong>Session Storage</strong> (HTML5 Web Storage). These client-side storage mechanisms hold data directly inside your browser sandbox without transmitting data automatically in every HTTP request header.
            </p>
          </section>

          {/* Section 2: Manage Preferences CTA */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--accent-primary)]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-[var(--text-main)] mb-1">
                Manage Your Cookie Consent Preferences
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                You can inspect or adjust your analytics and advertising cookie choices at any time.
              </p>
            </div>
            <div className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-semibold hover:bg-[var(--accent-primary-hover)] transition-colors inline-flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              <CookieSettingsButton />
            </div>
          </section>

          {/* Section 3: Cookie Inventory Table */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--accent-primary)]" />
              2. Detailed Inventory of Cookies & Storage Mechanisms
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              The table below outlines every cookie and browser storage item used across FileShare:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[var(--border-color)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--bg-main)] font-mono text-[var(--text-subtle)] border-b border-[var(--border-color)]">
                  <tr>
                    <th className="p-3">Item / Key Name</th>
                    <th className="p-3">Type & Provider</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-muted)]">
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--text-main)]">fileshare_cookie_consent</td>
                    <td className="p-3">localStorage (First-party)</td>
                    <td className="p-3 font-semibold text-emerald-400">Strictly Necessary</td>
                    <td className="p-3">Persistent (1 year)</td>
                    <td className="p-3">Stores your explicit cookie consent and preference choices (GDPR & DPDP Act compliance).</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--text-main)]">token:[slug]</td>
                    <td className="p-3">sessionStorage (First-party)</td>
                    <td className="p-3 font-semibold text-emerald-400">Strictly Necessary</td>
                    <td className="p-3">Browser Session only</td>
                    <td className="p-3">Stores temporary JWT authorization token to unlock password-protected workspaces. Destroyed on tab close.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--text-main)]">theme</td>
                    <td className="p-3">localStorage (First-party)</td>
                    <td className="p-3 font-semibold text-blue-400">Functional</td>
                    <td className="p-3">Persistent</td>
                    <td className="p-3">Remembers your dark or light theme interface preference.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--text-main)]">_ga, _ga_*</td>
                    <td className="p-3">HTTP Cookie (Google LLC)</td>
                    <td className="p-3 font-semibold text-purple-400">Analytics (Consent Required)</td>
                    <td className="p-3">2 years / 24 hours</td>
                    <td className="p-3">Distinguishes unique users and tracks anonymized aggregate site usage via Google Analytics 4.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-[var(--text-main)]">__gads, __gpi</td>
                    <td className="p-3">HTTP Cookie (Google LLC)</td>
                    <td className="p-3 font-semibold text-amber-400">Advertising (Consent Required)</td>
                    <td className="p-3">13 months</td>
                    <td className="p-3">Google AdSense frequency capping and non-intrusive ad reporting on public editorial pages.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Consent Mode */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[var(--accent-primary)]" />
              3. Google Consent Mode v2 & Default Denied State
            </h2>
            <p className="text-[var(--text-muted)]">
              In accordance with the European Union&apos;s ePrivacy Directive, GDPR, and India&apos;s Digital Personal Data Protection (DPDP) Act, 2023, FileShare implements <strong>Google Consent Mode v2</strong>.
            </p>
            <p className="text-[var(--text-muted)]">
              When you first load our website, all tracking, analytics, and advertising cookies are in a <strong>default denied</strong> state (<code className="font-mono text-xs">analytics_storage: &apos;denied&apos;</code>, <code className="font-mono text-xs">ad_storage: &apos;denied&apos;</code>). Only if and when you click &quot;Accept All&quot; or enable analytics in &quot;Customize Preferences&quot; are those signals updated to granted.
            </p>
          </section>

          {/* Section 5: Browser Controls */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[var(--accent-primary)]" />
              4. How to Manage and Disable Cookies in Your Browser
            </h2>
            <p className="text-[var(--text-muted)]">
              Most web browsers allow you to control cookies through their settings preferences. You can configure your browser to reject all cookies, accept only first-party cookies, or alert you before a cookie is saved:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[var(--text-muted)]">
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Third-party cookies.</li>
              <li><strong>Mozilla Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Enhanced Tracking Protection.</li>
              <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Block all cookies / Prevent cross-site tracking.</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage and delete cookies.</li>
            </ul>
            <p className="text-xs text-[var(--text-muted)] italic pt-2">
              Please note that disabling strictly necessary session storage will prevent password-protected workspaces from functioning correctly.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-2">
            <h2 className="text-lg font-bold text-[var(--text-main)]">5. Inquiries & Data Privacy Officer</h2>
            <p className="text-[var(--text-muted)]">
              If you have any questions about this Cookie Policy or our data storage practices, please reach out to our Grievance &amp; Data Protection Officer:
            </p>
            <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono space-y-1">
              <div>Entity: SHP Technology</div>
              <div>Grievance Officer: Sandesh Patel</div>
              <div>Email: grievance@fileshare.shptechnology.online / support@fileshare.shptechnology.online</div>
              <div>Address: 1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station, Jabalpur, Madhya Pradesh 482001, India</div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare (SHP Technology). Engineered for speed, privacy, and accessibility.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-[var(--text-main)] transition-colors">Cookies</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-[var(--text-main)] transition-colors">Refund Policy</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
