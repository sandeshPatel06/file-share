import type { Metadata } from "next";
import Link from "next/link";
import { Shield, FileText, Lock, Globe, Database, Eye, Cookie, AlertCircle } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "Privacy Policy & Cookie Disclosures — FileShare",
  description: "Comprehensive Privacy Policy for FileShare. Details on data handling, Google AdSense disclosures, cookie management, and user privacy rights.",
  alternates: {
    canonical: `${appUrl}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy & Cookie Disclosures — FileShare",
    description: "Learn how FileShare handles data, cookies, and adheres to Google AdSense privacy policies.",
    url: `${appUrl}/privacy`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span>FileShare</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Privacy & Compliance Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Privacy Policy & Cookie Disclosures</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Effective Date: September 29, 2026 | Last Updated: September 29, 2026</p>
        </div>

        <div className="text-sm leading-relaxed space-y-8">
          {/* Section 1 */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-main)]">
              <Globe className="w-4 h-4 text-[var(--accent-primary)]" />
              1. Introduction & Core Privacy Philosophy
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              FileShare (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the collaborative workspace and file sharing service located at <code className="font-mono text-xs">{appUrl}</code>. Our foundational product philosophy is built on data minimization: we require zero user registration, we do not request email addresses or telephone numbers to create workspaces, and we believe users should collaborate with full privacy and confidence.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              This Privacy Policy explains what technical information is collected, how it is used, and the third-party services—including Google AdSense and analytics providers—that operate on our public web pages.
            </p>
          </section>

          {/* Section 2: AdSense & Cookie Disclosures (Required by Google) */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--text-main)]">
              <Cookie className="w-5 h-5 text-amber-400" />
              2. Google AdSense & Third-Party Advertising Policy (Mandatory Disclosure)
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              We partner with Google AdSense to serve advertisements on select editorial and informational pages (such as our Guide, Knowledge Base articles, and About pages). To maintain compliance with Google Publisher Policies, we provide the following disclosures regarding cookies and personalized advertising:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
              <li>
                <strong>Third-Party Vendors & Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to our website or other websites across the Internet.
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve targeted advertisements to our users based on their browsing patterns and visits to FileShare and other digital properties.
              </li>
              <li>
                <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising at any time by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] underline">Google Ads Settings</a>.
              </li>
              <li>
                <strong>Third-Party Vendor Opt-Out Resources:</strong> Users can also opt out of third-party vendors&apos; use of cookies for personalized advertising by visiting the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] underline">Digital Advertising Alliance Choice Page (aboutads.info)</a> or the <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] underline">Network Advertising Initiative (networkadvertising.org)</a>.
              </li>
              <li>
                <strong>No Ads in Active Workspace Tool Canvases:</strong> We strictly ensure that advertisements are never displayed inside private or interactive editing canvases (<code className="font-mono text-xs">/s/[slug]</code>) to maintain user focus and eliminate accidental clicks.
              </li>
            </ul>
          </section>

          {/* Section 3: Information Collected */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-main)]">
              <Database className="w-4 h-4 text-[var(--accent-primary)]" />
              3. Information We Collect and Process
            </h2>
            <div className="space-y-3 text-[var(--text-muted)]">
              <p>
                <strong>A. User-Generated Notes & Workspaces:</strong> Real-time Markdown text, diagrams, and task checklists entered within workspaces (<code className="font-mono text-xs">/s/[slug]</code>) are stored in our persistence database to enable collaborative synchronization.
              </p>
              <p>
                <strong>B. Uploaded Files & Vault Storage:</strong> Files uploaded to workspaces are stored in Backblaze B2 S3-compatible cloud storage with local disk fallbacks. File access requires knowledge of the unique workspace slug and valid passphrase authorization if protected.
              </p>
              <p>
                <strong>C. Cryptographic Passphrase Hashes:</strong> If you lock a workspace, your passphrase is salted and hashed using bcrypt (10 rounds). Plaintext passphrases are never logged or stored.
              </p>
              <p>
                <strong>D. Local Browser Storage:</strong> We use browser <code className="font-mono text-xs">sessionStorage</code> to hold short-lived JWT authorization tokens for locked spaces. This token is destroyed when the browser tab is closed. We use <code className="font-mono text-xs">localStorage</code> solely to remember your light/dark theme preference.
              </p>
              <p>
                <strong>E. Standard Server Logs & Rate Limiting:</strong> For security and denial-of-service protection, our edge servers record standard IP addresses, request timestamps, and bandwidth metrics in ephemeral access logs.
              </p>
            </div>
          </section>

          {/* Section 4: Analytics */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-main)]">
              <Eye className="w-4 h-4 text-[var(--accent-primary)]" />
              4. Analytics & Measurement
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              We use Google Analytics 4 (GA4) with IP anonymization to understand aggregate website traffic, popular guide pages, and technical device performance. Google Analytics uses first-party cookies to report on visitor interactions without personal identity linkage.
            </p>
          </section>

          {/* Section 5: Data Retention & Deletion */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-main)]">
              <Lock className="w-4 h-4 text-[var(--accent-primary)]" />
              5. Data Retention, Ephemeral Storage & Deletion Rights
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              FileShare workspaces are intended as agile, ephemeral collaboration environments. Inactive workspaces with no edits or visits over an extended period (typically 30 to 90 days) may be automatically purged during routine database hygiene.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              <strong>User Deletion:</strong> Any user with administrative access to a workspace can delete uploaded files immediately by clicking the delete icon in the File Explorer panel. To request permanent deletion of an inactive workspace, email <a href="mailto:support@fileshare.shptechnology.online" className="text-[var(--accent-primary)] underline">support@fileshare.shptechnology.online</a>.
            </p>
          </section>

          {/* Section 6: GDPR & CCPA Rights */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-main)]">
              <AlertCircle className="w-4 h-4 text-[var(--accent-primary)]" />
              6. Your Privacy Rights (GDPR & CCPA)
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Depending on your location, you may possess statutory rights regarding personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-muted)]">
              <li><strong>Right of Access & Portability:</strong> You may export notes and download uploaded files at any time directly through the interface.</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You may request deletion of any content uploaded to FileShare.</li>
              <li><strong>Right to Object & Opt-Out:</strong> You may opt out of personalized ad targeting using the tools described in Section 2.</li>
              <li><strong>Non-Discrimination:</strong> We do not discriminate against users who exercise their privacy rights.</li>
            </ul>
          </section>

          {/* Section 7: Contact */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-2">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">7. Privacy Inquiries & Data Protection Contact</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our cookie practices, please contact our Data Protection representative:
            </p>
            <p className="text-xs font-mono text-[var(--accent-primary)] pt-1">
              Email: support@fileshare.shptechnology.online
            </p>
            <p className="text-xs text-[var(--text-subtle)]">
              FileShare Privacy & Compliance Office
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare. Engineered for speed, privacy, and frictionless collaboration.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <span>•</span>
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <span>•</span>
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
