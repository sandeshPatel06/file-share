import type { Metadata } from "next";
import Link from "next/link";
import { FileText, CheckCircle2, AlertTriangle, ShieldAlert, Scale, Globe, Building2 } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "Terms and Conditions & Intermediary Guidelines — FileShare",
  description: "Terms and Conditions for FileShare (SHP Technology). Compliant with the Indian Information Technology Act, 2000 and global digital service regulations.",
  alternates: {
    canonical: `${appUrl}/terms`,
  },
  openGraph: {
    title: "Terms and Conditions — FileShare",
    description: "Terms of Service, Intermediary Guidelines, and Acceptable Use Policy for FileShare.",
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
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <Link href="/cookies" className="hover:text-[var(--text-main)] transition-colors">Cookies</Link>
            <Link href="/refund" className="hover:text-[var(--text-main)] transition-colors">Refund Policy</Link>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <Scale className="w-3.5 h-3.5 text-blue-500" />
            <span>Legal Framework &amp; Intermediary Guidelines</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Terms &amp; Conditions of Service
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Last Updated: September 29, 2026 | Effective Date: September 29, 2026
          </p>
        </div>

        <div className="text-sm leading-relaxed space-y-8">
          {/* Section 1: Agreement to Terms */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              1. Acceptance of Terms &amp; Entity Information
            </h2>
            <p className="text-[var(--text-muted)]">
              These Terms and Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;User&quot;, &quot;you&quot;) and <strong>SHP Technology</strong> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), the owner and operator of the FileShare web platform at <code className="font-mono text-xs">{appUrl}</code>.
            </p>
            <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono space-y-1">
              <div><strong>Operating Entity:</strong> SHP Technology</div>
              <div><strong>Operator:</strong> Sandesh Patel</div>
              <div><strong>Registered Office:</strong> 1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station, Jabalpur, Madhya Pradesh 482001, India</div>
              <div><strong>Contact Email:</strong> support@fileshare.shptechnology.online</div>
            </div>
            <p className="text-[var(--text-muted)]">
              By accessing, creating, editing, uploading to, or viewing any workspace on FileShare, you explicitly agree to comply with and be bound by these Terms, our Privacy Policy, Cookie Policy, and Refund Policy. If you disagree with any portion of these agreements, you must cease using the Service immediately.
            </p>
          </section>

          {/* Section 2: Intermediary Status (India IT Act Section 79) */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Globe className="w-5 h-5 text-[var(--accent-primary)]" />
              2. Intermediary Status under the Indian IT Act, 2000
            </h2>
            <p className="text-[var(--text-muted)]">
              FileShare functions strictly as an <strong>&quot;Intermediary&quot;</strong> as defined under Section 2(1)(w) of the <strong>Indian Information Technology Act, 2000 (IT Act)</strong> and complies with the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>.
            </p>
            <p className="text-[var(--text-muted)]">
              In accordance with Section 79 of the IT Act, SHP Technology does not initiate the transmission, select the receiver of the transmission, or modify the contents contained in user workspaces. All notes, Markdown documents, diagrams, and files are user-generated, hosted ephemerally at the request of users.
            </p>
          </section>

          {/* Section 3: Acceptable Use Policy & Content Restrictions (Rule 3[1][b]) */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-[var(--text-main)]">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              3. Acceptable Use Policy (Mandatory Statutory Prohibitions)
            </div>
            <p className="text-[var(--text-muted)]">
              Under Rule 3(1)(b) of the Information Technology (Intermediary Guidelines) Rules, 2021 and international law, you agree that you shall <strong>NOT</strong> host, display, upload, modify, publish, transmit, store, or share any information that:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Malware &amp; Software Exploits</div>
                <p className="text-[var(--text-muted)]">
                  Contains software viruses, trojans, ransomware, spyware, keyloggers, botnets, or any computer code designed to interrupt, destroy, or limit the functionality of any computer resource.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Copyright &amp; IP Infringement</div>
                <p className="text-[var(--text-muted)]">
                  Infringes any patent, trademark, copyright, trade secret, or other proprietary rights of third parties without explicit authorization.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Child Harm &amp; Exploitation (CSAM)</div>
                <p className="text-[var(--text-muted)]">
                  Is harmful to child welfare, depicts child sexual abuse or exploitation. We maintain a zero-tolerance policy and report incidents directly to law enforcement authorities.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Fraud, Phishing &amp; Impersonation</div>
                <p className="text-[var(--text-muted)]">
                  Deceives or misleads the addressee about the origin of messages, impersonates another person, or spreads financial scams and credential phishing traps.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Threats to Sovereignty &amp; Security</div>
                <p className="text-[var(--text-muted)]">
                  Threatens the unity, integrity, defense, security, or sovereignty of India, friendly relations with foreign States, or public order, or incites violence.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-red-400">Defamation &amp; Invasive Content</div>
                <p className="text-[var(--text-muted)]">
                  Is defamatory, obscene, pornographic, pedophilic, invasive of another&apos;s privacy, bodily privacy, or encouraging gambling, hate speech, or harassment.
                </p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] italic">
              SHP Technology reserves the right to terminate access, take down violating workspaces and files immediately, and block offending IP addresses upon receiving actual knowledge or statutory notice.
            </p>
          </section>

          {/* Section 4: Notice and Takedown Procedure */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <ShieldAlert className="w-5 h-5 text-[var(--accent-primary)]" />
              4. Notice, Takedown &amp; Grievance Redressal (24-36h SLA)
            </h2>
            <p className="text-[var(--text-muted)]">
              Under Rule 3(1)(d) of the IT Intermediary Rules, 2021 and international DMCA provisions, upon receiving actual knowledge in the form of an order by a court of competent jurisdiction, or on being notified by the appropriate government or its agency, or on receiving a verifiable grievance from an affected individual:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[var(--text-muted)]">
              <li>We will act within <strong>twenty-four to thirty-six hours</strong> to disable access to unlawful or infringing material.</li>
              <li>Takedown notices and copyright infringement complaints should be directed to our designated Grievance Officer:</li>
            </ul>
            <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono space-y-1">
              <div><strong>Grievance &amp; Abuse Officer:</strong> Sandesh Patel</div>
              <div><strong>Email:</strong> grievance@fileshare.shptechnology.online / abuse@fileshare.shptechnology.online</div>
              <div><strong>Address:</strong> 1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station, Jabalpur, Madhya Pradesh 482001, India</div>
            </div>
          </section>

          {/* Section 5: Ephemeral Nature and Storage Caps */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)]">5. Ephemeral Architecture &amp; Service Limits</h2>
            <p className="text-[var(--text-muted)]">
              FileShare enforces an individual upload cap of <strong>500 MB per file</strong>. Workspaces and file vaults are engineered for agile, collaborative, and temporary usage.
            </p>
            <p className="text-[var(--text-muted)]">
              FileShare is <strong>not an archival backup solution</strong>. We reserve the right to delete unreferenced or inactive workspaces following extended dormancy (30 to 90 days) to preserve system integrity and storage bandwidth. You are solely responsible for keeping permanent local backups of mission-critical notes and media.
            </p>
          </section>

          {/* Section 6: Disclaimers and Limitation of Liability */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)]">6. Disclaimers of Warranties &amp; Limitation of Liability</h2>
            <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs space-y-2 text-[var(--text-muted)] leading-relaxed uppercase">
              <p>
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. SHP TECHNOLOGY AND ITS OPERATORS EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p>
                IN NO EVENT SHALL SHP TECHNOLOGY, ITS AFFILIATES, OFFICERS, OR DEVELOPERS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES (INCLUDING DAMAGES FOR LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS INTERRUPTION) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE THE SERVICE.
              </p>
            </div>
          </section>

          {/* Section 7: Indemnification */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold text-[var(--text-main)]">7. User Indemnification</h2>
            <p className="text-[var(--text-muted)]">
              You agree to defend, indemnify, and hold harmless SHP Technology, Sandesh Patel, and associated contributors from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal and accounting fees) arising out of or in any way connected with your violation of these Terms, your upload of unauthorized content, or your infringement of any intellectual property or privacy rights of any third party.
            </p>
          </section>

          {/* Section 8: Dispute Resolution & Jurisdiction */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Building2 className="w-5 h-5 text-[var(--accent-primary)]" />
              8. Governing Law &amp; Exclusive Jurisdiction
            </h2>
            <p className="text-[var(--text-muted)]">
              These Terms and your use of FileShare shall be governed by and construed in accordance with the laws of the Republic of India, without giving effect to any principles of conflict of laws.
            </p>
            <p className="text-[var(--text-muted)]">
              Any dispute, controversy, or claim arising out of or relating to these Terms or the breach, termination, or invalidity thereof shall be subject to the <strong>exclusive jurisdiction of the courts of competent jurisdiction located in Jabalpur, Madhya Pradesh, India</strong>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare (SHP Technology). Compliant with Indian Information Technology Act, 2000.</p>
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
