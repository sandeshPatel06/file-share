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
  BookOpen,
  Clock,
  Pin,
  X,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/Button";
import { ARTICLES } from "@/lib/articles";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";
import { useRecentSpaces } from "@/hooks/useRecentSpaces";

interface LandingPageProps {
  defaultSlug: string;
}

export function LandingPage({ defaultSlug }: LandingPageProps) {
  const router = useRouter();
  const [customSlug, setCustomSlug] = useState("");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const { recentSpaces, removeRecentSpace, togglePin, clearRecentSpaces } = useRecentSpaces();

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

  const featuredArticles = ARTICLES.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight text-[var(--text-main)]">
                FileShare
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-[var(--text-muted)]">
              <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
              <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">User Guide</Link>
              <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
              <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
            </nav>
          </div>

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
        {/* Hero Section */}
        <section className="pt-12 pb-14 sm:pt-16 sm:pb-20 border-b border-[var(--border-color)]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            {/* Value Proposition Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-6">
              <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Zero Registration</span>
              <span>•</span>
              <span className="text-[var(--accent-primary)] flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Real-Time SSE Sync</span>
              <span>•</span>
              <span className="text-blue-400 flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> 500MB Encrypted Vault</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-main)] mb-6 leading-tight">
              Instant Online Notepad &amp; Secure 500MB File Vault
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-[var(--text-muted)] mb-8 leading-relaxed">
              Create instant, anonymous workspaces to collaborate on live Markdown notes, render Mermaid diagrams, and share files up to 500MB in real-time. Zero registration, no email verification, and instant QR code handoff between devices.
            </p>

            {/* Workspace Launcher Action Form */}
            <div className="max-w-md mx-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 shadow-sm">
              <form onSubmit={handleCustomSlugSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <label htmlFor="landing-custom-slug" className="sr-only">
                    Workspace URL Slug
                  </label>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--text-subtle)] select-none">
                    /s/
                  </span>
                  <input
                    id="landing-custom-slug"
                    name="slug"
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder={defaultSlug}
                    aria-label="Enter custom workspace name"
                    className="w-full pl-8 pr-3 py-2.5 text-xs sm:text-sm rounded-lg bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--accent-primary)] font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={Boolean(activeSlug)}
                  aria-label="Open or create instant workspace"
                  className="!px-5 !py-2.5 !rounded-lg !font-semibold text-xs sm:text-sm bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white disabled:opacity-60"
                  icon={activeSlug ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
                  iconRight={!activeSlug ? <ArrowRight className="w-3.5 h-3.5" /> : undefined}
                >
                  {activeSlug ? "Opening..." : "Open Space"}
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
                <span>500MB Limit per file</span>
              </div>

              {/* Recent Spaces Quick Access (Local & Privacy-Safe) */}
              {recentSpaces.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[var(--border-color)] text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[var(--text-subtle)] uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[var(--accent-indigo)]" />
                      Recent Spaces
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSpaces}
                      className="text-[10px] text-[var(--text-subtle)] hover:text-red-400 transition-colors cursor-pointer"
                      title="Clear recent workspaces"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {recentSpaces.map((item) => (
                      <div
                        key={item.slug}
                        className="group inline-flex items-center gap-1 pl-2.5 pr-1 py-1 rounded-lg bg-[var(--bg-main)] hover:bg-[var(--border-color)]/60 border border-[var(--border-color)] transition-all text-xs font-mono"
                      >
                        <Link
                          href={`/s/${item.slug}`}
                          className="font-bold text-[var(--text-main)] hover:text-[var(--accent-primary)] truncate max-w-[120px] transition-colors"
                          title={`Open workspace /s/${item.slug}`}
                        >
                          {item.slug}
                        </Link>
                        <button
                          type="button"
                          onClick={() => togglePin(item.slug)}
                          title={item.pinned ? "Unpin workspace" : "Pin workspace"}
                          className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer ${
                            item.pinned ? "text-amber-400" : "text-[var(--text-subtle)] opacity-40 group-hover:opacity-100"
                          }`}
                        >
                          <Pin className={`w-3 h-3 ${item.pinned ? "fill-current" : ""}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRecentSpace(item.slug)}
                          title="Remove from history"
                          className="p-0.5 rounded text-[var(--text-subtle)] hover:text-red-400 opacity-40 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Consent Notice (GDPR & DPDP Act 2023) */}
              <p className="mt-3 text-[11px] text-[var(--text-subtle)] text-center leading-normal">
                By opening or joining a workspace, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-[var(--text-main)]">
                  Terms
                </Link>
                ,{" "}
                <Link href="/privacy" className="underline hover:text-[var(--text-main)]">
                  Privacy Policy
                </Link>
                , and{" "}
                <Link href="/cookies" className="underline hover:text-[var(--text-main)]">
                  Cookie Policy
                </Link>
                .
              </p>
            </div>

            {/* Quick Link to Knowledge Base */}
            <div className="mt-6 text-xs text-[var(--text-muted)] flex items-center justify-center gap-3">
              <span>New to FileShare?</span>
              <Link href="/guide" className="text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1 font-medium">
                Read the Complete User Guide <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        {/* 3-Step Educational Workflow Overview */}
        <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-3">
              How Instant Workspaces Work
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
              <h3 className="text-base font-bold mb-2 text-[var(--text-main)]">Pick Any Workspace URL</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Type any custom name like <code className="px-1.5 py-0.5 rounded bg-[var(--bg-main)] font-mono text-[var(--accent-primary)]">/s/sprint-notes</code> or generate a random link. The space is auto-created instantly.
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

        {/* Feature Grid */}
        <section className="py-12 sm:py-16 bg-[var(--bg-surface)] border-t border-b border-[var(--border-color)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-3">
                Engineered for High-Velocity Teams
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Modern primitives combining rich technical Markdown and high-capacity cloud storage.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--border-glow)] transition-colors">
                <Zap className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
                <h3 className="text-sm font-bold mb-1">Live Synchronization</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Real-time updates pushed across all connected windows in milliseconds using native Server-Sent Events.
                </p>
              </div>

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--border-glow)] transition-colors">
                <FolderUp className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
                <h3 className="text-sm font-bold mb-1">500MB File Vault</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Direct drag-and-drop storage for multi-file archives, video media, PDFs, and code repositories.
                </p>
              </div>

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--border-glow)] transition-colors">
                <Wand2 className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
                <h3 className="text-sm font-bold mb-1">AI Copilot Formatting</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  One-click Markdown syntax cleanup that standardizes headers, task lists, and spacing while preserving raw code.
                </p>
              </div>

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--border-glow)] transition-colors">
                <Lock className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
                <h3 className="text-sm font-bold mb-1">Encrypted Password Gates</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Secure sensitive workspaces with 10-round salted bcrypt hashing and stateless JWT token authentication.
                </p>
              </div>

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--border-glow)] transition-colors">
                <QrCode className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
                <h3 className="text-sm font-bold mb-1">Instant QR Code Handoff</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Transfer workspaces between PC, tablet, and mobile devices in seconds with dynamic vector QR codes.
                </p>
              </div>

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[var(--border-glow)] transition-colors">
                <Globe className="w-5 h-5 text-[var(--accent-primary)] mb-2.5" />
                <h3 className="text-sm font-bold mb-1">Zero Registration</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  No email or password needed. Open a custom URL slug and start collaborating immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Comparison Matrix — Optimized for Google AI Mode & Long-Tail Searchers */}
        <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)] mb-3">
              Why Teams Choose FileShare
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              Compare FileShare with traditional cloud storage, pastebins, and file transfer services.
            </p>
          </div>

          <div className="overflow-x-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--bg-main)]">
                  <th className="p-3 sm:p-4 font-bold text-[var(--text-main)]">Key Capability</th>
                  <th className="p-3 sm:p-4 font-bold text-[var(--accent-primary)]">FileShare</th>
                  <th className="p-3 sm:p-4 font-medium text-[var(--text-subtle)]">Cloud Drives (Google Drive)</th>
                  <th className="p-3 sm:p-4 font-medium text-[var(--text-subtle)]">Standard Pastebin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-xs text-[var(--text-muted)]">
                <tr>
                  <td className="p-3 sm:p-4 font-medium text-[var(--text-main)]">Registration &amp; Login</td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-500">Zero (Anonymous)</td>
                  <td className="p-3 sm:p-4">Mandatory Account</td>
                  <td className="p-3 sm:p-4">Optional / Limited</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-medium text-[var(--text-main)]">Real-Time Collaborative Editing</td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-500">Live SSE Sync (Milliseconds)</td>
                  <td className="p-3 sm:p-4">Document Delay</td>
                  <td className="p-3 sm:p-4 text-rose-400">Static (No Live Sync)</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-medium text-[var(--text-main)]">File Attachment Capacity</td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-500">500 MB Free per file</td>
                  <td className="p-3 sm:p-4">Consumes Account Quota</td>
                  <td className="p-3 sm:p-4 text-rose-400">None (Text Only)</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-medium text-[var(--text-main)]">Markdown &amp; Mermaid Diagrams</td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-500">Native Inline Rendering</td>
                  <td className="p-3 sm:p-4">Requires Third-Party Extensions</td>
                  <td className="p-3 sm:p-4 text-rose-400">Plain Raw Text Only</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-medium text-[var(--text-main)]">Instant Device Handoff</td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-500">Dynamic Vector QR Code</td>
                  <td className="p-3 sm:p-4">Requires App Install</td>
                  <td className="p-3 sm:p-4">Manual URL Copying</td>
                </tr>
                <tr>
                  <td className="p-3 sm:p-4 font-medium text-[var(--text-main)]">Security &amp; Encryption</td>
                  <td className="p-3 sm:p-4 font-bold text-emerald-500">Bcrypt Password Lock &amp; JWT</td>
                  <td className="p-3 sm:p-4">Account Permissions</td>
                  <td className="p-3 sm:p-4">Public / Unprotected</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Featured Educational Resources & Guides Section */}
        <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
                <BookOpen className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Engineering Knowledge Hub</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
                Featured Guides & Technical Publications
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Explore in-depth articles on remote collaboration, ephemeral security, and Markdown productivity.
              </p>
            </div>
            <Link
              href="/resources"
              className="text-xs sm:text-sm font-semibold text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1"
            >
              View All 8 Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredArticles.map((article) => (
              <article
                key={article.slug}
                className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col justify-between hover:border-[var(--border-glow)] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-subtle)] font-mono mb-2">
                    <span className="text-[var(--accent-primary)]">{article.category}</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors mb-2">
                    <Link href={`/resources/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3 mb-4">
                    {article.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-subtle)] font-mono">{article.date}</span>
                  <Link
                    href={`/resources/${article.slug}`}
                    className="font-semibold text-[var(--accent-primary)] inline-flex items-center gap-1 group-hover:gap-1.5 transition-all"
                  >
                    Read Guide <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Featured Public Workspaces */}
        <section className="py-8 bg-[var(--bg-surface)] border-t border-b border-[var(--border-color)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h3 className="text-xs font-bold text-[var(--text-subtle)] uppercase tracking-wider text-center mb-4">Starter Public Workspaces</h3>
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

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">
                How is FileShare different from Pastebin, Google Drive, or WeTransfer?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Unlike Pastebin, FileShare offers real-time live typing synchronization, rich Markdown formatting, Mermaid diagram rendering, and 500MB multi-file uploads. Unlike Google Drive or WeTransfer, FileShare requires zero registration, no recipient email addresses, and creates instant workspaces accessible by custom URL slug or QR code.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-5">
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">
                Can I write Markdown and render Mermaid diagrams?
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Yes! FileShare natively parses GitHub Flavored Markdown (headings, task lists, code blocks with syntax highlighting) and automatically renders Mermaid sequence, flowchart, and class diagrams inline with live synchronization.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[var(--header-bg)] border-t border-[var(--border-color)] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>FileShare — Real-Time Notes & Secure File Vault</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
              <span>•</span>
              <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">User Guide</Link>
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
              <span>•</span>
              <a
                href="https://github.com/sandeshPatel06/file-share"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[var(--text-main)] transition-colors"
                aria-label="FileShare on GitHub (opens in new tab)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--text-subtle)]">
            <p>Operated by <strong>SHP Technology</strong> • Founder: Sandesh Patel • Jabalpur, Madhya Pradesh 482001, India</p>
            <p>GDPR &amp; India DPDP Act 2023 Compliant • Free Web Utility</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
