import type { Metadata } from "next";
import Link from "next/link";
import { Shield, FileText, Lock, Globe, Database, Cookie, AlertCircle, Scale, UserCheck } from "lucide-react";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "Privacy Policy — GDPR & India DPDP Act 2023 Compliant — FileShare",
  description: "Comprehensive Privacy Policy for FileShare (SHP Technology). Fully compliant with the EU General Data Protection Regulation (GDPR) and India's Digital Personal Data Protection (DPDP) Act, 2023.",
  alternates: {
    canonical: `${appUrl}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy — FileShare",
    description: "Learn how FileShare protects your personal data in compliance with GDPR and India's DPDP Act 2023.",
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
            <Link href="/cookies" className="hover:text-[var(--text-main)] transition-colors">Cookie Policy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            <Link href="/refund" className="hover:text-[var(--text-main)] transition-colors">Refund Policy</Link>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>GDPR (EU) &amp; DPDP Act 2023 (India) Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Privacy Policy &amp; Data Protection Notice
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Last Updated: September 29, 2026 | Effective Date: September 29, 2026
          </p>
        </div>

        <div className="text-sm leading-relaxed space-y-8">
          {/* Section 1: Data Fiduciary Identity */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Globe className="w-5 h-5 text-[var(--accent-primary)]" />
              1. Identity of the Data Fiduciary &amp; Overview
            </h2>
            <p className="text-[var(--text-muted)]">
              This Privacy Policy is published in compliance with the <strong>European Union General Data Protection Regulation (Regulation [EU] 2016/679 - GDPR)</strong> and <strong>India&apos;s Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)</strong>.
            </p>
            <p className="text-[var(--text-muted)]">
              The Data Fiduciary (or &quot;Data Controller&quot;) responsible for the processing of your personal data is:
            </p>
            <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono space-y-1">
              <div><strong>Entity:</strong> SHP Technology (Operating &quot;FileShare&quot;)</div>
              <div><strong>Registered Address:</strong> 1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station, Jabalpur, Madhya Pradesh 482001, India</div>
              <div><strong>Official Email:</strong> support@fileshare.shptechnology.online</div>
              <div><strong>Grievance Officer Email:</strong> grievance@fileshare.shptechnology.online</div>
            </div>
            <p className="text-[var(--text-muted)]">
              FileShare operates on a foundational commitment to <strong>data minimization</strong>. You are never required to register an account, create a username, or submit personal phone numbers or government IDs to create or participate in workspaces.
            </p>
          </section>

          {/* Section 2: Grounds for Processing */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Scale className="w-5 h-5 text-blue-400" />
              2. Lawful Grounds and Specified Purpose of Processing
            </h2>
            <p className="text-[var(--text-muted)]">
              In accordance with Section 4 and Section 6 of India&apos;s DPDP Act 2023 and Article 6 of GDPR, we process digital data strictly for lawful, specified purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <li>
                <strong>Provision of Real-Time Workspace Service (Performance of Contract / Consent):</strong> Processing Markdown text edits, Mermaid diagram structures, and file uploads that you voluntarily choose to sync across active collaborators via Server-Sent Events (SSE).
              </li>
              <li>
                <strong>Access Control &amp; Security Verification (Legitimate Use / Specified Purpose):</strong> Processing salted bcrypt hashes of passphrases you voluntarily set to restrict unauthorized entry to protected workspaces.
              </li>
              <li>
                <strong>Platform Integrity, Abuse Prevention &amp; Rate Limiting (Legitimate Interest / Legal Obligation):</strong> Processing transient server IP address logs to prevent Distributed Denial of Service (DDoS) attacks, brute-force access attempts, and malware distribution.
              </li>
              <li>
                <strong>Aggregated Analytics &amp; Advertising (Affirmative Consent):</strong> Processing aggregate, anonymized website visit counts via Google Analytics 4 and serving non-intrusive ads via Google AdSense strictly upon your affirmative consent via Google Consent Mode v2.
              </li>
            </ul>
          </section>

          {/* Section 3: Data Categories Collected */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Database className="w-5 h-5 text-[var(--accent-primary)]" />
              3. Data Collected &amp; Data Minimization Audit
            </h2>
            <p className="text-[var(--text-muted)]">
              Under our strict data minimization architecture, we collect only data that is technically essential for the platform:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-[var(--text-main)]">Workspace Notes &amp; Text</div>
                <p className="text-[var(--text-muted)]">
                  The Markdown notes and diagrams you type in workspaces (<code className="font-mono text-[var(--accent-primary)]">/s/[slug]</code>). Ephemeral and editable live by participants.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-[var(--text-main)]">Uploaded Vault Files</div>
                <p className="text-[var(--text-muted)]">
                  Files you drag-and-drop into workspace file panels (up to 500MB). Stored securely on encrypted Backblaze B2 cloud storage with delete handles.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-[var(--text-main)]">Workspace Passphrase Hashes</div>
                <p className="text-[var(--text-muted)]">
                  When you lock a space, we store a one-way, 10-round salted bcrypt cryptographic hash. Plaintext passwords are never stored or recoverable.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] space-y-1">
                <div className="font-bold text-[var(--text-main)]">Browser Local &amp; Session Storage</div>
                <p className="text-[var(--text-muted)]">
                  SessionStorage stores temporary JWT tokens for unlocked spaces (cleared on tab close). LocalStorage stores theme and your cookie consent settings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Rights of Data Principals (DPDP & GDPR) */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              4. Your Statutory Rights as a Data Principal
            </h2>
            <p className="text-[var(--text-muted)]">
              Under Section 11, 12, 13, and 14 of the DPDP Act 2023 and Chapter III of GDPR, you possess the following actionable rights:
            </p>
            <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
              <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-main)] block mb-1">A. Right to Access &amp; Summary (Section 11, DPDP Act / Art. 15 GDPR):</strong>
                You have the right to request a summary of personal data being processed and the identities of any third parties with whom data has been shared.
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-main)] block mb-1">B. Right to Correction and Erasure (Section 12, DPDP Act / Art. 16 &amp; 17 GDPR):</strong>
                You can delete uploaded files immediately via the File Explorer trash icon, or erase text in any unlocked workspace. You may also contact our Grievance Officer to request permanent removal of unreferenced workspace records.
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-main)] block mb-1">C. Right of Grievance Redressal (Section 13, DPDP Act):</strong>
                You have the right to have your data protection grievances addressed by our designated Grievance Officer within 30 days.
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-main)] block mb-1">D. Right to Nominate (Section 14, DPDP Act):</strong>
                Under Indian law, a Data Principal has the right to nominate any other individual who, in the event of death or incapacity, shall exercise your data rights.
              </div>
              <div className="p-3 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)]">
                <strong className="text-[var(--text-main)] block mb-1">E. Right to Withdraw Consent (Section 6[4], DPDP Act / Art. 7 GDPR):</strong>
                You can withdraw analytics or marketing cookie consent at any time via our Cookie Preferences controller.
              </div>
            </div>
          </section>

          {/* Section 5: Mandatory Grievance Officer Details */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--accent-primary)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <AlertCircle className="w-5 h-5 text-[var(--accent-primary)]" />
              5. Designated Grievance Redressal Officer (DPDP Act, 2023 Mandatory Disclosure)
            </h2>
            <p className="text-[var(--text-muted)]">
              In accordance with Section 13 of India&apos;s Digital Personal Data Protection Act, 2023, the details of our designated Grievance Officer are published below:
            </p>
            <div className="p-4 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs font-mono space-y-1.5">
              <div><strong>Name of Officer:</strong> Sandesh Patel</div>
              <div><strong>Designation:</strong> Data Protection &amp; Grievance Redressal Officer</div>
              <div><strong>Entity:</strong> SHP Technology</div>
              <div><strong>Office Address:</strong> 1st floor, SHP Technology, Near Underground Bridge, Madan Mahal Station, Jabalpur, Madhya Pradesh 482001, India</div>
              <div><strong>Dedicated Email:</strong> grievance@fileshare.shptechnology.online</div>
              <div><strong>Acknowledgment SLA:</strong> Within 48 hours</div>
              <div><strong>Resolution SLA:</strong> Within 30 calendar days</div>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              If you are not satisfied with the resolution provided by our Grievance Officer, you have the right to register an appeal with the <strong>Data Protection Board of India (DPBI)</strong> in accordance with the DPDP Rules. European residents also maintain the right to lodge a complaint with their local supervisory Data Protection Authority (DPA).
            </p>
          </section>

          {/* Section 6: Children's Data */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Lock className="w-5 h-5 text-amber-400" />
              6. Protection of Children&apos;s Personal Data (Section 9, DPDP Act)
            </h2>
            <p className="text-[var(--text-muted)]">
              In strict adherence to Section 9 of the DPDP Act 2023 and Article 8 of GDPR:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-muted)]">
              <li>FileShare does not knowingly process, profile, or track children under 18 years of age.</li>
              <li>We do not undertake behavioral tracking or targeted advertising directed at children.</li>
              <li>We do not process personal data that is likely to cause any detrimental effect on the well-being of a child.</li>
              <li>If a parent or legal guardian discovers that a child has uploaded personal data, they may contact <code className="font-mono text-xs">grievance@fileshare.shptechnology.online</code> for immediate expedited erasure.</li>
            </ul>
          </section>

          {/* Section 7: Third-Party Data Transfers & Cross-Border Hosting */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Globe className="w-5 h-5 text-[var(--accent-primary)]" />
              7. Cross-Border Data Transfers &amp; Third-Party Services
            </h2>
            <p className="text-[var(--text-muted)]">
              To operate a globally synchronized, high-speed workspace platform, we utilize trusted cloud infrastructure:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--text-muted)]">
              <li><strong>Cloud Storage (Backblaze B2 / AWS S3):</strong> Encrypted object storage located in secure ISO 27001/SOC 2 certified data centers with transport-layer encryption (TLS 1.3).</li>
              <li><strong>Hosting &amp; Edge CDN:</strong> Cloud infrastructure with automated DDoS mitigation and containerized isolation.</li>
              <li><strong>Google AdSense &amp; Analytics:</strong> Operated by Google LLC. Analytics IP anonymization is permanently enabled and advertising storage is governed strictly by Google Consent Mode v2.</li>
            </ul>
          </section>

          {/* Section 8: Cookies Management CTA */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] space-y-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
              <Cookie className="w-5 h-5 text-[var(--accent-primary)]" />
              8. Cookie Management
            </h2>
            <p className="text-[var(--text-muted)]">
              For complete details regarding the exact cookies we use and how to block them, please consult our dedicated{" "}
              <Link href="/cookies" className="text-[var(--accent-primary)] underline hover:text-[var(--text-main)]">
                Cookie Policy
              </Link>.
            </p>
            <div className="pt-2">
              <CookieSettingsButton />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare (SHP Technology). GDPR &amp; India DPDP Act 2023 Compliant.</p>
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
