import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Mail,
  ShieldAlert,
  Clock,
  Send,
  MessageSquare,
} from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "Contact Us & Support — FileShare",
  description: "Get in touch with the FileShare team. Technical support, abuse reports, DMCA inquiries, and security disclosures.",
  alternates: {
    canonical: `${appUrl}/contact`,
  },
  openGraph: {
    title: "Contact Us & Support — FileShare",
    description: "Technical support, abuse reports, and inquiries for FileShare.",
    url: `${appUrl}/contact`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function ContactPage() {
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
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-10 border-b border-[var(--border-color)] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Contact the FileShare Team
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
            Have questions about FileShare, need technical assistance, or want to report policy-violating content? Our team is here to assist you.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-main)] mb-1">General & Technical Support</h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Questions about workspace usage, browser compatibility, API features, or platform issues.
              </p>
            </div>
            <a
              href="mailto:support@fileshare.shptechnology.online"
              className="text-xs font-mono text-[var(--accent-primary)] hover:underline break-all"
            >
              support@fileshare.shptechnology.online
            </a>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-main)] mb-1">Abuse & DMCA Takedowns</h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Report copyrighted material, phishing campaigns, malicious software, or unacceptable content.
              </p>
            </div>
            <a
              href="mailto:abuse@fileshare.shptechnology.online"
              className="text-xs font-mono text-amber-400 hover:underline break-all"
            >
              abuse@fileshare.shptechnology.online
            </a>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Send className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-[var(--text-main)] mb-1">Security Disclosures</h2>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                Responsible vulnerability disclosures from independent researchers and ethical hackers.
              </p>
            </div>
            <a
              href="mailto:security@fileshare.shptechnology.online"
              className="text-xs font-mono text-emerald-400 hover:underline break-all"
            >
              security@fileshare.shptechnology.online
            </a>
          </div>
        </div>

        {/* Response SLA Box */}
        <div className="mb-10 p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-start gap-4">
          <Clock className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            <h3 className="font-bold text-[var(--text-main)] mb-1">Response Time SLA</h3>
            <p>
              We monitor incoming inquiries continuously. Critical security alerts and verifiable abuse reports receive priority triage within <strong>12 to 24 hours</strong>. General support inquiries are typically resolved within 1 to 2 business days.
            </p>
          </div>
        </div>

        {/* Common Inquiries FAQ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-4">Frequently Asked Support Topics</h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-bold text-[var(--text-main)] mb-1">How do I delete an accidental file upload?</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                If the workspace is unlocked or you hold the passphrase token, you can click the red trash icon next to any file in the File Explorer panel to delete it permanently from our storage vaults immediately.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-bold text-[var(--text-main)] mb-1">I forgot the password to my locked workspace. Can you recover it?</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                To guarantee zero-knowledge privacy, workspace passphrases are irreversibly hashed with salted bcrypt. We do not store plaintext passwords and cannot recover lost passphrases. We recommend saving passwords securely during creation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-bold text-[var(--text-main)] mb-1">How do I submit a DMCA Copyright Infringement notice?</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Please email <code className="font-mono text-xs">abuse@fileshare.shptechnology.online</code> with the exact workspace URL (<code className="font-mono text-xs">/s/[slug]</code>), identification of the copyrighted work claimed to have been infringed, proof of authorization, and your contact details. Takedowns are processed promptly in accordance with international copyright laws.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare. Fast collaborative workspaces & secure file vaults.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <span>•</span>
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <span>•</span>
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
