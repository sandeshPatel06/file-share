"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Shield,
  Zap,
  Lock,
  ArrowRight,
  Plus,
  QrCode,
  FolderUp,
  Wand2,
  Globe,
  Compass,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Users,
  Code2,
  Share2,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";

interface LandingPageProps {
  defaultSlug: string;
}

export function LandingPage({ defaultSlug }: LandingPageProps) {
  const router = useRouter();
  const [customSlug, setCustomSlug] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const handleCreateSpace = (slugToUse?: string) => {
    const target = (slugToUse || customSlug.trim() || defaultSlug)
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    setActiveSlug(target);
    router.push(`/s/${target}`);
  };

  const handleCustomSlugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateSpace();
  };

  const featuredWorkspaces = [
    { slug: "general", title: "General Workspace", icon: "💬" },
    { slug: "notes", title: "Live Markdown Notes", icon: "📝" },
    { slug: "code", title: "Code Snippet Vault", icon: "⚡" },
    { slug: "welcome", title: "Sandbox & Docs", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-[var(--text-main)]">
              FileShare
            </span>
          </Link>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <Button
              onClick={() => handleCreateSpace()}
              disabled={Boolean(activeSlug)}
              className="!px-3 !py-1.5 !rounded-md text-xs !font-semibold bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white disabled:opacity-60"
              icon={activeSlug && !customSlug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            >
              {activeSlug && !customSlug ? "Opening..." : "New Space"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section - Minimalist */}
        <section className="pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-[var(--border-color)]">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-6">
              <span>Instant Real-Time Workspaces</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-main)] mb-5">
              Live Notes & Secure File Vault
            </h1>

            <p className="max-w-xl mx-auto text-sm sm:text-base text-[var(--text-muted)] mb-8 leading-relaxed">
              Create instant workspaces for real-time Markdown notes and file storage up to 500MB. Zero registration needed.
            </p>

            {/* Clean Minimal Action Form */}
            <div className="max-w-md mx-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 shadow-sm">
              <form onSubmit={handleCustomSlugSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-subtle)] select-none">
                    /s/
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder={defaultSlug}
                    className="w-full pl-8 pr-3 py-2 text-xs sm:text-sm rounded-md bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)] font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={Boolean(activeSlug)}
                  className="!px-4 !py-2 !rounded-md !font-semibold text-xs sm:text-sm bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white disabled:opacity-60"
                  icon={activeSlug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                  iconRight={!activeSlug ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
                >
                  {activeSlug ? "Opening Workspace..." : "Open Space"}
                </Button>
              </form>

              <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-subtle)]">
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  disabled={Boolean(activeSlug)}
                  onClick={() => handleCreateSpace(defaultSlug)}
                  className="!p-0 !rounded-lg inline-flex items-center gap-1 text-[var(--text-subtle)] hover:text-[var(--text-main)] disabled:opacity-50"
                  icon={activeSlug === defaultSlug ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" /> : <Compass className="w-3.5 h-3.5" />}
                >
                  Random Space (/s/{defaultSlug})
                </Button>
                <span>500MB Limit</span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid - Minimal Github Style */}
        <section className="py-10 sm:py-14 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--border-glow)] transition-colors">
              <Zap className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
              <h3 className="text-sm font-bold mb-1">Real-Time SSE Sync</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Live Markdown edits and file uploads sync across devices in real-time.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--border-glow)] transition-colors">
              <Lock className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
              <h3 className="text-sm font-bold mb-1">Password Protection</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Lock sensitive spaces with bcrypt password hashing and token auth.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--border-glow)] transition-colors">
              <FolderUp className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
              <h3 className="text-sm font-bold mb-1">500MB File Vault</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Upload images, video, audio, and documents with instant preview modals.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--border-glow)] transition-colors">
              <Wand2 className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
              <h3 className="text-sm font-bold mb-1">AI Copilot Formatter</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Standardize markdown formatting, headings, lists, and spacing in 1 click.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--border-glow)] transition-colors">
              <QrCode className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
              <h3 className="text-sm font-bold mb-1">Instant QR Code</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Generate high-resolution QR codes to open notes instantly on mobile.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-4 hover:border-[var(--border-glow)] transition-colors">
              <Globe className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
              <h3 className="text-sm font-bold mb-1">Zero Registration</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                No email or password needed. Open a custom URL slug and start sharing.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Workspaces */}
        <section className="py-8 bg-[var(--bg-surface)] border-t border-b border-[var(--border-color)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h3 className="text-sm font-bold text-[var(--text-subtle)] uppercase tracking-wider text-center mb-4">Popular Public Workspaces</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredWorkspaces.map((item) => {
                const isItemActive = activeSlug === item.slug;
                return (
                  <Button
                    key={item.slug}
                    size="md"
                    disabled={Boolean(activeSlug)}
                    onClick={() => handleCreateSpace(item.slug)}
                    className="!justify-start !items-center gap-2.5 !p-3 !rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] !text-left !font-semibold disabled:opacity-50"
                    icon={<span className="text-lg">{item.icon}</span>}
                    iconRight={isItemActive ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" /> : <ArrowRight className="w-3.5 h-3.5 text-[var(--text-subtle)]" />}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate text-[var(--text-main)]">
                        {item.title}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-subtle)]">/s/{item.slug}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        {/* How FileShare Works */}
        <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-3">
              How FileShare Works
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Experience seamless, instant collaboration without logins, verifications, or installation steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 relative">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-mono font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold mb-2 text-[var(--text-main)]">Pick or Create a Slug</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Type any workspace identifier like <code className="px-1.5 py-0.5 rounded bg-[var(--bg-main)] font-mono text-[var(--accent-primary)]">/s/project-sync</code> or let the generator create a secure random link.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 relative">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-mono font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold mb-2 text-[var(--text-main)]">Type & Upload Live</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Write Markdown notes, render Mermaid diagrams, and drag-and-drop files up to 500MB. All participants sync live via Server-Sent Events.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 relative">
              <div className="w-9 h-9 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-mono font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold mb-2 text-[var(--text-main)]">Share or Protect</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Share via URL or instant QR code. Need privacy? Set an encrypted password lock to secure your notes and vault from unauthorized guests.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-12 sm:py-16 bg-[var(--bg-surface)] border-t border-b border-[var(--border-color)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-3">
                Built for Fast Real-Time Collaboration
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Designed for engineers, students, and remote teams who value speed and privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                <Code2 className="w-5 h-5 text-indigo-400 mb-2.5" />
                <h3 className="text-sm font-bold mb-1.5 text-[var(--text-main)]">Pair Programming</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Share code snippets, terminal traces, and architecture diagrams during live debugging sessions.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                <Users className="w-5 h-5 text-emerald-400 mb-2.5" />
                <h3 className="text-sm font-bold mb-1.5 text-[var(--text-main)]">Meeting Notes</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Keep synchronized agendas and action items without forcing teammates to create third-party accounts.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                <Share2 className="w-5 h-5 text-blue-400 mb-2.5" />
                <h3 className="text-sm font-bold mb-1.5 text-[var(--text-main)]">Cross-Device Transfer</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Move files, screenshots, and text links between your phone, tablet, and PC in seconds using QR codes.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)]">
                <CheckCircle2 className="w-5 h-5 text-amber-400 mb-2.5" />
                <h3 className="text-sm font-bold mb-1.5 text-[var(--text-main)]">Classrooms & Workshops</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Distribute exercise files and live scratchpads to students effortlessly with a single memorable URL.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions (FAQ) */}
        <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Questions & Answers</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Everything you need to know about FileShare, storage policies, and security.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">
                Is FileShare free to use, and do I need to register?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Yes, FileShare is 100% free with zero registration required. There are no forms to fill out, no email confirmations, and no subscriptions. You can start typing or uploading immediately.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">
                What is the file size upload limit?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                You can upload files up to 500 MB each. FileShare supports multi-file uploads including videos, zip archives, images, PDFs, and code repositories with streaming cloud storage backing.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">
                How does real-time synchronization work?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                FileShare utilizes Server-Sent Events (SSE) to broadcast changes across all connected clients in milliseconds. Edits and file uploads show up automatically without any page refresh needed.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">
                Can I protect my workspace with a password?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Yes! Click the &quot;Lock Space&quot; button inside any workspace to set a password. Passwords are securely hashed with bcrypt (10 rounds) and access is verified via JWT tokens.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">
                How do I open my workspace on mobile devices?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Click the QR code button in the top navigation bar of your workspace to generate a high-resolution QR code. Scan it with your phone&apos;s camera to immediately continue editing on mobile.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--header-bg)] border-t border-[var(--border-color)] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>FileShare — Real-Time Notes & Secure File Vault</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <span>•</span>
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
            <span>•</span>
            <a
              href="https://github.com/sandeshPatel06/file-share"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[var(--text-main)] transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
