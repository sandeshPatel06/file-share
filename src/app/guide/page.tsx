import type { Metadata } from "next";
import Link from "next/link";
import { FileText, BookOpen, Code, Sparkles } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shptechnology.online";

export const metadata: Metadata = {
  title: "User Guide & Documentation — FileShare",
  description: "Learn how to use FileShare live markdown workspaces, instant file vaults, password security, and formatting tools.",
  alternates: {
    canonical: `${appUrl}/guide`,
  },
};

export default function GuidePage() {
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
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>Documentation & Manual</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">FileShare User Guide</h1>
          <p className="text-sm text-[var(--text-muted)]">Master real-time markdown collaboration, file vaults, and security features.</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          {/* Step 1 */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h2 className="text-lg font-bold text-[var(--text-main)]">Creating & Sharing Workspaces</h2>
            </div>
            <p className="text-[var(--text-muted)] mb-3">
              Workspaces on FileShare are identified by unique URL slugs. You can create a space instantly:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-muted)]">
              <li>Visit <code className="px-1.5 py-0.5 rounded bg-[var(--bg-main)] font-mono text-xs text-[var(--accent-primary)]">https://shptechnology.online/s/your-slug</code> in any browser.</li>
              <li>Or click &quot;New Space&quot; on the home page to auto-generate a secure random workspace ID.</li>
              <li>Share the URL or use the built-in <strong>QR Code Generator</strong> to quickly transfer links to mobile devices.</li>
            </ul>
          </section>

          {/* Step 2 */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h2 className="text-lg font-bold text-[var(--text-main)]">Live Markdown & AI Copilot Formatting</h2>
            </div>
            <p className="text-[var(--text-muted)] mb-3">
              The editor supports full GitHub Flavored Markdown (GFM) with real-time preview and smart formatting:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]">
                <div className="font-semibold flex items-center gap-1.5 mb-1 text-[var(--text-main)]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  AI Copilot Formatter
                </div>
                <p className="text-[var(--text-muted)]">Automatically normalizes headers, list bullets, code indentation, and spacing with one click.</p>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-main)]">
                <div className="font-semibold flex items-center gap-1.5 mb-1 text-[var(--text-main)]">
                  <Code className="w-3.5 h-3.5 text-blue-400" />
                  Mermaid Diagrams
                </div>
                <p className="text-[var(--text-muted)]">Embed live flowcharts and sequence diagrams using standard <code className="font-mono">```mermaid</code> code blocks.</p>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h2 className="text-lg font-bold text-[var(--text-main)]">File Vault & Media Handling</h2>
            </div>
            <p className="text-[var(--text-muted)] mb-3">
              Store and stream project files attached directly to your workspace:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[var(--text-muted)]">
              <li>Drag & drop files directly onto the workspace file panel.</li>
              <li>Preview images, PDFs, code files, and audio/video media right inside the browser.</li>
              <li>Multi-file uploads supported up to 500 MB per file.</li>
            </ul>
          </section>

          {/* Step 4 */}
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-xs">
                4
              </div>
              <h2 className="text-lg font-bold text-[var(--text-main)]">Securing Workspaces</h2>
            </div>
            <p className="text-[var(--text-muted)]">
              Need to restrict access to a private workspace? Click the <strong>Lock Space</strong> button in the workspace header to set a passphrase. Once locked, visitors will be prompted for authentication before viewing or editing notes and files.
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
            <Link href="/privacy" className="hover:text-[var(--text-main)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
