import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle2, AlertTriangle, ShieldAlert, Scale } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "Terms of Service & Acceptable Use Policy — FileShare",
  description: "Terms of Service and Acceptable Use Policy for FileShare. Explicit prohibitions on illegal content, malware, copyright infringement, and abuse guidelines.",
  alternates: {
    canonical: `${appUrl}/terms`,
  },
  openGraph: {
    title: "Terms of Service & Acceptable Use Policy — FileShare",
    description: "Terms of Service, acceptable use guidelines, and abuse reporting procedures for FileShare.",
    url: `${appUrl}/terms`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function TermsPage() {
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
            <Scale className="w-3.5 h-3.5 text-blue-500" />
            <span>Legal Framework & Community Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Terms of Service & Acceptable Use Policy</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">Effective Date: September 29, 2026 | Last Updated: September 29, 2026</p>
        </div>

        <div className="text-sm leading-relaxed space-y-8">
          {/* Section 1 */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              1. Agreement to Terms
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              These Terms of Service (&quot;Terms&quot;) constitute a binding agreement between you and FileShare (&quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By creating, visiting, editing, or uploading files to any workspace or page on FileShare, you confirm your acceptance of these Terms. If you do not agree to these terms in full, you must discontinue use immediately.
            </p>
          </section>

          {/* Section 2: Strict Acceptable Use Policy */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--text-main)]">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              2. Acceptable Use Policy & Zero-Tolerance Content Restrictions
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              FileShare provides open, real-time collaboration infrastructure. To preserve security, integrity, and safety for all users, you agree <strong>NOT</strong> to use the Service to host, upload, link, display, or transmit any of the following prohibited content categories:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Malware & Cybersecurity Threats</div>
                <p className="text-[var(--text-muted)]">
                  Viruses, trojans, ransomware, keyloggers, rootkits, botnet command-and-control scripts, zero-day exploits, or payloads designed to compromise computer systems.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Copyright & Pirated Materials</div>
                <p className="text-[var(--text-muted)]">
                  Unauthorized copyrighted movies, music albums, proprietary commercial software, pirated video games, or torrent seed archives violating intellectual property laws.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Fraud, Scams & Phishing</div>
                <p className="text-[var(--text-muted)]">
                  Deceptive login screens, credential harvesting kits, phishing pages, advance-fee fraud schemes, stolen financial data, or fraudulent impersonation.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Illegal & Abusive Content</div>
                <p className="text-[var(--text-muted)]">
                  Child sexual abuse material (CSAM - zero tolerance and reported to NCMEC/authorities), terrorism, violent extremism, doxxing, harassment, and hate speech.
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] italic">
              Violation of this Acceptable Use Policy will result in immediate and permanent deletion of the offending files and workspaces, IP blocking, and reporting to relevant civil or criminal authorities where required by law.
            </p>
          </section>

          {/* Section 3: DMCA */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[var(--text-main)]">
              <ShieldAlert className="w-4 h-4 text-[var(--accent-primary)]" />
              3. DMCA Copyright Takedown Procedure
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              FileShare complies with the provisions of the Digital Millennium Copyright Act (17 U.S.C. § 512). If you believe your copyrighted work has been copied and made accessible in a manner that constitutes infringement, please send a formal DMCA notice to our designated agent containing:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)]">
              <li>Identification of the copyrighted work claimed to have been infringed.</li>
              <li>The exact workspace URL (<code className="font-mono text-xs">/s/[slug]</code>) and filename of the infringing material.</li>
              <li>Your contact information (name, address, telephone number, and email).</li>
              <li>A statement of good faith belief that use of the material is not authorized by the copyright owner.</li>
              <li>A physical or electronic signature of the copyright owner or authorized representative.</li>
            </ul>
            <p className="text-xs font-mono text-[var(--accent-primary)] pt-1">
              Send DMCA Notices to: abuse@fileshare.shptechnology.online
            </p>
          </section>

          {/* Section 4: Operational Limits */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">4. File Limits & Ephemeral Service Terms</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              FileShare enforces an individual upload limit of <strong>500 MB per file</strong>. Workspaces are designed for agile, ephemeral collaboration. While we endeavor to maintain high availability and reliability, FileShare is not a cold-storage backup service. We reserve the right to delete unaccessed or stale workspaces and files after periods of prolonged inactivity to maintain database and storage hygiene.
            </p>
          </section>

          {/* Section 5: Warranty Disclaimers */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">5. Disclaimer of Warranties & Limitation of Liability</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. IN NO EVENT SHALL FILESHARE OR ITS OPERATORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE PLATFORM.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-2">
            <h2 className="text-lg font-semibold text-[var(--text-main)]">6. Contact for Legal Inquiries</h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              For questions regarding these Terms or legal matters:
            </p>
            <p className="text-xs font-mono text-[var(--accent-primary)]">
              Email: support@fileshare.shptechnology.online
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
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
