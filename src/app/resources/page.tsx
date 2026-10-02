import type { Metadata } from "next";
import Link from "next/link";
import { FileText, BookOpen, Clock, Tag, ArrowRight, ShieldCheck, Sparkles, Compass } from "lucide-react";
import { getAllArticles } from "@/lib/articles";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";
import { getAppUrl } from "@/lib/seo";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Engineering Resources & Guides — FileShare Knowledge Hub",
  description: "Explore in-depth engineering articles on real-time collaborative note-taking, secure file vaults, modern Markdown syntax, and privacy-first remote productivity.",
  alternates: {
    canonical: `${appUrl}/resources`,
  },
  openGraph: {
    title: "Engineering Resources & Guides — FileShare Knowledge Hub",
    description: "Explore comprehensive guides on collaborative note-taking, file sharing, security, and developer productivity.",
    url: `${appUrl}/resources`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function ResourcesPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span>FileShare</span>
          </Link>
          <nav className="flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-10 border-b border-[var(--border-color)] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Knowledge Base & Technical Publications</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            FileShare Resources & Engineering Guides
          </h1>
          <p className="max-w-2xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            In-depth architectural analysis, security frameworks, and productivity blueprints for distributed software teams, educators, and privacy-conscious collaborators.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-subtle)] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Peer-reviewed technical practices
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-subtle)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Practical workflows & templates
            </span>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col justify-between hover:border-[var(--border-glow)] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] bg-[var(--bg-main)] border border-[var(--border-color)] text-[var(--accent-primary)]">
                    <Tag className="w-3 h-3" />
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-[var(--text-subtle)]">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h2 className="text-lg font-bold tracking-tight mb-2 text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors">
                  <Link href={`/resources/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>

                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  {article.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-subtle)] font-mono">
                  {article.date}
                </span>
                <Link
                  href={`/resources/${article.slug}`}
                  className="font-semibold text-[var(--accent-primary)] inline-flex items-center gap-1 hover:gap-1.5 transition-all"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 text-center max-w-2xl mx-auto">
          <Compass className="w-8 h-8 text-[var(--accent-primary)] mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Put These Workflows Into Practice</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-5 max-w-lg mx-auto leading-relaxed">
            Create an instant, anonymous workspace in one click. Collaborate live on Markdown notes, render Mermaid diagrams, and upload files up to 500MB.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Launch Instant Workspace
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare (SHP Technology). High-velocity collaborative workspaces &amp; secure file vaults.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span>•</span>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
