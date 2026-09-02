import type { Metadata } from "next";
import Link from "next/link";
import { FileText, FileCode, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shptechnology.online";

export const metadata: Metadata = {
  title: "Terms of Service — FileShare",
  description: "Terms of Service and Acceptable Use Policy for FileShare workspace platform.",
  alternates: {
    canonical: `${appUrl}/terms`,
  },
};

export default function TermsPage() {
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
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <FileCode className="w-3.5 h-3.5 text-blue-500" />
            <span>Legal Framework</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
          <p className="text-sm text-[var(--text-muted)]">Effective Date: September 2, 2026</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-8">
          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              1. Acceptance of Terms
            </h2>
            <p className="text-[var(--text-muted)]">
              By accessing or using FileShare (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must not access or use the platform.
            </p>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-main)]">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              2. Acceptable Use Policy & Content Restrictions
            </h2>
            <p className="text-[var(--text-muted)] mb-3">
              Users are solely responsible for all content, notes, and files uploaded or edited within their workspaces. You agree NOT to use the Service to upload, store, or share:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
              <li>Malicious software, viruses, trojans, ransomware, or executable exploit files.</li>
              <li>Content that infringes upon copyright, trademark, or intellectual property rights.</li>
              <li>Illegal material, hate speech, harassment, or unauthorized personal data of third parties.</li>
              <li>Automated spam scripts, phishing campaigns, or illegal file sharing networks.</li>
            </ul>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 text-[var(--text-main)]">3. Storage & Workspace Limits</h2>
            <p className="text-[var(--text-muted)]">
              Individual uploaded files are capped at 500 MB per upload. FileShare reserves the right to remove inactive, unreferenced, or policy-violating files and workspaces to maintain system performance and storage integrity.
            </p>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 text-[var(--text-main)]">4. Disclaimer of Warranties</h2>
            <p className="text-[var(--text-muted)]">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. FileShare does not warrant uninterrupted service, error-free operation, or permanent retention of ephemeral files.
            </p>
          </section>

          <section className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[var(--text-main)]">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              5. Governing Law & Abuse Reports
            </h2>
            <p className="text-[var(--text-muted)]">
              To report abuse, copyright infringement, or terms violations, please contact abuse@shptechnology.online.
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
            <Link href="/privacy" className="hover:text-[var(--text-main)]">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
