import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Shield,
  Globe,
  Users,
  HardDrive,
  Code2,
  Cpu,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { AdBanner } from "@/components/ads/AdBanner";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "About FileShare — Engineering Mission, Architecture & Privacy Values",
  description: "Learn why FileShare was created: our engineering philosophy, privacy-first ephemeral architecture, open-source values, and transparent platform infrastructure.",
  alternates: {
    canonical: `${appUrl}/about`,
  },
  openGraph: {
    title: "About FileShare — Mission, Architecture & Privacy Values",
    description: "Learn why FileShare was created: our engineering philosophy, ephemeral architecture, and privacy values.",
    url: `${appUrl}/about`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Conditionally load AdSense on this comprehensive publisher about page */}
      <AdSenseScript />

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
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Hero Title */}
        <div className="mb-10 border-b border-[var(--border-color)] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Platform Manifesto & Infrastructure</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            About FileShare
          </h1>
          <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
            We built FileShare because modern collaboration software has become unnecessarily slow, bloated with corporate gatekeeping, and obsessed with tracking user identities.
          </p>
        </div>

        {/* Section: Why FileShare Exists */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed">
          <section className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              The Problem: The Friction Tax on Digital Work
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Every day, millions of software engineers, researchers, students, and digital creators need to perform simple tasks: jot down live sprint notes with a colleague, exchange a 200MB build artifact, paste a code snippet with formatted diagrams, or move a screenshot from a computer to a phone.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Yet in 2026, performing these simple actions requires navigating an obstacle course of barriers: mandatory account creation, email verification codes, password resets, corporate single-sign-on permissions, 25MB email attachment limits, and pervasive tracking pixels.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              We asked a straightforward engineering question: <em>What if a collaborative workspace could be launched in less than two seconds, requiring zero sign-up, zero personal data, and zero corporate overhead?</em> That question led to the creation of FileShare.
            </p>
          </section>

          {/* Compliant Ad Unit 1 */}
          <AdBanner slot="3000000001" />

          {/* Section: Who We Built It For */}
          <section className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              Who FileShare Is For
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              FileShare is engineered specifically for users who value speed, technical elegance, and privacy over bloated feature sets:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base mb-1 text-[var(--text-main)]">Engineers & DevOps Teams</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Spin up instant incident war rooms, share deployment runbooks, live-pair on code snippets with syntax highlighting, and compile Mermaid.js architecture diagrams synchronously.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base mb-1 text-[var(--text-main)]">Educators & Workshop Leads</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Distribute exercise files, code templates, and workshop slides to dozens of students instantly using memorable custom slugs or projector-ready QR codes.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base mb-1 text-[var(--text-main)]">Privacy Advocates & Sources</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Share confidential documents without linking your phone number, credit card, or personal email. Protect sensitive spaces with bcrypt-hashed passphrases.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                  <HardDrive className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base mb-1 text-[var(--text-main)]">Freelancers & Creators</h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  Deliver high-resolution design assets, client contracts, and raw video files up to 500MB directly to clients with zero onboarding friction.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Architectural Transparency */}
          <section className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-2xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[var(--accent-primary)]" />
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                Under the Hood: Transparent Architecture
              </h2>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              We believe users have a right to know how their data is processed, stored, and protected. FileShare is engineered with modern, performant, and defense-in-depth principles:
            </p>
            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-muted)]">
              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="font-bold text-[var(--text-main)] mb-1">1. Real-Time Server-Sent Events (SSE) Engine</div>
                <p>Instead of heavy, battery-draining WebSockets or wasteful short-polling, FileShare uses HTTP/2 SSE streams. Updates transmit in under 50ms with automatic reconnection and minimal client CPU load.</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="font-bold text-[var(--text-main)] mb-1">2. Hybrid High-Resilience Database</div>
                <p>Our persistence layer supports high-throughput PostgreSQL for cloud environments and optimized SQLite (<code className="font-mono text-xs">better-sqlite3</code>) for embedded deployments. Foreign keys with <code className="font-mono text-xs">ON UPDATE CASCADE</code> guarantee atomic slug renaming without orphan data.</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="font-bold text-[var(--text-main)] mb-1">3. Backblaze B2 & Local Disk Vault</div>
                <p>Files uploaded to workspace vaults are streamed in memory-safe chunks directly to Backblaze B2 S3-compatible cloud storage, backed by local file fallbacks for maximum resilience.</p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="font-bold text-[var(--text-main)] mb-1">4. Cryptographic Access Protection</div>
                <p>Protected workspaces hash passphrases with 10-round salted bcrypt. Successful authentication produces short-lived stateless JWT tokens stored only in ephemeral session storage.</p>
              </div>
            </div>
          </section>

          {/* Section: Ethical Monetization & Ad Transparency */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                Our Values & Sustainable Monetization
              </h2>
            </div>
            <p className="text-[var(--text-muted)] leading-relaxed">
              FileShare is 100% free to use. We do not sell user data, we do not require subscription paywalls, and we do not monetize by harvesting private workspace contents.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              To support our cloud storage, high-bandwidth egress, and continuous development costs, we display non-intrusive advertisements served through Google AdSense strictly on our public editorial pages (such as our Guide, Knowledge Base, and Platform Resources).
            </p>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] space-y-2">
              <div className="font-semibold text-[var(--text-main)]">Our Advertising Commitment:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>We <strong>never</strong> place advertisements inside your active workspace editor or file upload canvases.</li>
                <li>We <strong>never</strong> display deceptive or disguising ads that could trigger accidental clicks.</li>
                <li>All advertisements are clearly labeled and separated from editorial content.</li>
                <li>We respect user privacy and do not track confidential workspace notes.</li>
              </ul>
            </div>
          </section>

          {/* Compliant Ad Unit 2 */}
          <AdBanner slot="3000000002" />

          {/* Call to action */}
          <section className="bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-color)] text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--text-main)]">
              Experience Collaboration Without Barriers
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-5 max-w-md mx-auto leading-relaxed">
              Launch a workspace in seconds or explore our technical resources to learn more about our engineering practices.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
              >
                Create Instant Space
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resources"
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs sm:text-sm font-semibold hover:bg-[var(--bg-surface)] transition-colors inline-flex items-center justify-center"
              >
                Read Technical Guides
              </Link>
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
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <span>•</span>
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms &amp; Conditions</Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-[var(--text-main)] transition-colors">Cookie Policy</Link>
            <span>•</span>
            <Link href="/refund" className="hover:text-[var(--text-main)] transition-colors">Refund Policy</Link>
            <span>•</span>
            <CookieSettingsButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
