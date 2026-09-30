import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, CheckCircle2, ShieldAlert, ArrowLeft, Mail, RefreshCcw } from "lucide-react";
import { getAppUrl } from "@/lib/seo";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — FileShare",
  description: "Official Refund and Cancellation Policy for FileShare, operated by SHP Technology. Learn about our free service tier, voluntary contributions, and dispute resolutions.",
  alternates: {
    canonical: `${appUrl}/refund`,
  },
  openGraph: {
    title: "Refund & Cancellation Policy — FileShare",
    description: "Read the transparent Refund and Cancellation terms for FileShare.",
    url: `${appUrl}/refund`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <span>FileShare</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
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
            <RefreshCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Commercial Terms & Policies</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-2xl">
            This Refund and Cancellation Policy outlines the financial and commercial terms governing the use of FileShare, operated by SHP Technology.
          </p>
          <p className="text-xs text-[var(--text-subtle)] mt-2 font-mono">
            Last Updated: September 29, 2026 | Effective Date: September 29, 2026
          </p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Section 1: Free Service Tier */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              1. 100% Free Core Platform
            </h2>
            <p className="text-[var(--text-muted)]">
              FileShare is provided as a <strong>free public web application</strong>. All fundamental capabilities—including creating workspaces, real-time Markdown editing, AI copilot formatting, Mermaid diagram compilation, passphrase protection, and file uploads up to 500MB per file—are accessible at no monetary charge.
            </p>
            <p className="text-[var(--text-muted)]">
              We do not ask for credit cards, debit cards, bank details, or recurring monthly subscriptions to access the platform. Because standard users are not billed, refund requests for standard service access do not apply.
            </p>
          </section>

          {/* Section 2: Cancellation Terms */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-[var(--accent-primary)]" />
              2. Cancellation and Termination Policy
            </h2>
            <p className="text-[var(--text-muted)]">
              Because FileShare operates on a zero-registration, account-free model, there are no ongoing accounts or contracts to cancel:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-muted)]">
              <li>You may stop using FileShare at any time simply by closing your browser tab.</li>
              <li>You can delete your uploaded files immediately through the trash icon in the File Explorer panel.</li>
              <li>You can overwrite or erase notes within your workspace at any time.</li>
              <li>Inactive ephemeral workspaces are automatically pruned by our cleanup scheduler without any cancellation fees.</li>
            </ul>
          </section>

          {/* Section 3: Voluntary Donations and Sponsorships */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-amber-400" />
              3. Voluntary Donations, Tips &amp; Sponsorships
            </h2>
            <p className="text-[var(--text-muted)]">
              If you choose to support the maintenance and server bandwidth of FileShare through voluntary donations (such as GitHub Sponsors, Buy Me a Coffee, or Open Collective):
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-muted)]">
              <li>Donations and sponsorships are voluntary gifts provided without expectation of commercial goods or exclusive services.</li>
              <li>As a general rule, voluntary contributions are non-refundable once processed.</li>
              <li>However, in cases of verified technical error, fraudulent transaction, or accidental duplicate donation, please email us within <strong>14 calendar days</strong> of the transaction date. We will review and process a refund to the original payment source.</li>
            </ul>
          </section>

          {/* Section 4: Enterprise Licensing */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-400" />
              4. Custom Commercial &amp; Enterprise Agreements
            </h2>
            <p className="text-[var(--text-muted)]">
              If an organization contracts SHP Technology for custom enterprise deployment, dedicated private cloud hosting, or tailored SLA agreements:
            </p>
            <p className="text-[var(--text-muted)]">
              Refund and cancellation provisions will be governed by the specific Statement of Work (SOW) or commercial contract signed by both parties. In the absence of specific conflicting terms, custom enterprise setup and engineering consulting fees are non-refundable once engineering deployment has commenced.
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)] flex items-center gap-2">
              <Mail className="w-5 h-5 text-[var(--accent-primary)]" />
              5. Billing Inquiries &amp; Dispute Resolution
            </h2>
            <p className="text-[var(--text-muted)]">
              For any payment inquiries, erroneous transaction claims, or billing clarifications, please contact our billing administration:
            </p>
            <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono space-y-1">
              <div>Entity: SHP Technology (FileShare)</div>
              <div>Billing Email: billing@fileshare.shptechnology.online</div>
              <div>Support Email: support@fileshare.shptechnology.online</div>
              <div>Operating Address: 1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station, Jabalpur, Madhya Pradesh 482001, India</div>
              <div>Response Time: 24 to 48 business hours</div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare (SHP Technology). All rights reserved.</p>
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
