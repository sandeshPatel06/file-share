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
