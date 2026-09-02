import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Zap, Shield, Globe, Users, HardDrive, Code2 } from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shptechnology.online";

export const metadata: Metadata = {
  title: "About FileShare — Real-Time Collaborative Workspace",
  description: "Learn about FileShare, instant collaborative markdown note-taking and file sharing platform.",
  alternates: {
    canonical: `${appUrl}/about`,
  },
};

export default function AboutPage() {
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
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="mb-8 border-b border-[var(--border-color)] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Platform Overview</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">About FileShare</h1>
          <p className="text-sm text-[var(--text-muted)]">Modern, zero-friction collaborative note editing and file vault.</p>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)]">
            <h2 className="text-xl font-bold mb-3 text-[var(--text-main)]">What is FileShare?</h2>
            <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
              FileShare is an instant workspace web application designed for developer teams, students, and remote collaborators. It combines full-featured Markdown note editing with secure multi-file vault management—requiring zero user registration, passwords, or complex account setups.
            </p>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Every custom URL (e.g. <code className="px-1.5 py-0.5 rounded bg-[var(--bg-main)] font-mono text-xs text-[var(--accent-primary)]">/s/my-project</code>) acts as a dedicated live workspace where multiple users can type concurrently, render rich diagrams, format code snippets, and upload project files.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)] flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base mb-1">Instant Real-Time SSE Engine</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                Powered by Server-Sent Events (SSE), edits and file uploads sync instantaneously across all active browser windows without page refreshes.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)] flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base mb-1">Encrypted Password Vaults</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                Lock sensitive workspaces with bcrypt-hashed passwords and JWT token verification to prevent unauthorized access.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)] flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base mb-1">Rich Markdown & Diagrams</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                Supports syntax-highlighted code blocks, automated markdown AI copilot formatting, spreadsheets, LaTeX formulas, and live Mermaid.js flowcharts.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)] flex flex-col">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
                <HardDrive className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base mb-1">High-Speed File Vault</h3>
              <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                Upload images, archives, PDFs, code files, and video media up to 500 MB per file with drag-and-drop ease.
              </p>
            </div>
          </div>

          <section className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-color)] text-center">
            <h2 className="text-lg font-bold mb-2 text-[var(--text-main)]">Ready to create a workspace?</h2>
            <p className="text-[var(--text-muted)] text-xs mb-4">Pick any workspace name and start sharing instantly.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Users className="w-4 h-4" />
              Start Collaboration
            </Link>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--border-color)] py-6 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-[var(--text-main)]">Home</Link>
            <Link href="/guide" className="hover:text-[var(--text-main)]">Guide</Link>
            <Link href="/privacy" className="hover:text-[var(--text-main)]">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-main)]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
