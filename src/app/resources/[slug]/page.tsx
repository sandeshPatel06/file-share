import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Clock,
  Tag,
  Calendar,
  User,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { getArticleBySlug, getAllArticles } from "@/lib/articles";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { AdBanner } from "@/components/ads/AdBanner";
import { CookieSettingsButton } from "@/components/ui/CookieConsent";
import { getAppUrl } from "@/lib/seo";
import { ADSENSE_SLOTS } from "@/lib/ads";

interface Props {
  params: Promise<{ slug: string }>;
}

const appUrl = getAppUrl();

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Article Not Found — FileShare",
    };
  }

  const canonicalUrl = `${appUrl}/resources/${slug}`;

  return {
    title: `${article.title} — FileShare Resources`,
    description: article.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: canonicalUrl,
      siteName: "FileShare",
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
      images: [
        {
          url: `${appUrl}/logo.png`,
          width: 512,
          height: 512,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [`${appUrl}/logo.png`],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Organization",
      name: article.author,
      url: appUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "FileShare",
      logo: {
        "@type": "ImageObject",
        url: `${appUrl}/logo.png`,
      },
    },
    datePublished: article.date,
    mainEntityOfPage: `${appUrl}/resources/${slug}`,
    wordCount: article.wordCount,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": appUrl,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Resources",
        "item": `${appUrl}/resources`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title,
        "item": `${appUrl}/resources/${slug}`,
      },
    ],
  };

  // Split article content at natural mid-point section break (---)
  // Ensures the first ad only appears after at least 2-3 full sections of editorial text
  const sections = article.content.split(/\n---\n/);
  const midPoint = sections.length > 2 ? Math.floor(sections.length / 2) : 1;
  const firstHalf = sections.slice(0, midPoint).join("\n\n---\n\n");
  const secondHalf = sections.slice(midPoint).join("\n\n---\n\n");

  // Navigation-policy guard: only render the mid-article unit on substantial
  // articles where the ad stays buffered by long editorial text on both sides.
  // On thin pages the unit would sit too close to the "Try FileShare Free" CTA
  // and the Related Resources navigation grid, risking a
  // "mistaken for menu / navigation" flag. articleMid is intentionally empty
  // (ads disabled) until review passes — isAdsEnabled() then collapses to null.
  const showResourceAd =
    article.wordCount >= 700 &&
    firstHalf.trim().length >= 1500 &&
    secondHalf.trim().length >= 1200;

  return (
    <div className="min-h-dvh bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Conditionally load AdSense on this substantial publisher content page */}
      <AdSenseScript />

      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--header-bg)] border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-base tracking-tight">
            <div className="w-7 h-7 rounded-md bg-[var(--accent-primary)] flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <span>FileShare</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-4 text-xs font-medium text-[var(--text-muted)]">
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
          </nav>
        </div>
      </header>

      {/* Article Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/resources"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to All Resources
          </Link>
        </div>

        {/* Article Header */}
        <div className="border-b border-[var(--border-color)] pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--accent-primary)]">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
            <span className="text-xs text-[var(--text-subtle)]">•</span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Clock className="w-3 h-3" />
              {article.readTime}
            </span>
            <span className="text-xs text-[var(--text-subtle)]">•</span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Calendar className="w-3 h-3" />
              {article.date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4 text-[var(--text-main)] leading-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed mb-4">
            {article.description}
          </p>

          <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-subtle)] dark:text-[var(--text-muted)] pt-4 border-t border-[var(--border-color)]">
            <div className="flex min-w-0 items-center gap-2">
              <User className="w-3.5 h-3.5 shrink-0 text-[var(--accent-primary)]" />
              <span className="min-w-0 truncate">By {article.author}</span>
            </div>
            <div className="font-mono shrink-0">
              ~{article.wordCount} words
            </div>
          </div>
        </div>

        {/* Article Body Part 1 */}
        <article className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed">
          <MarkdownRenderer content={firstHalf} />
        </article>

        {/* Safe In-Content Ad Unit: Embedded mid-editorial flow after 2-3 full sections.
            Rendered only on substantial articles so it never sits adjacent to
            the CTA button or Related Resources navigation grid. */}
        {showResourceAd && (
          <AdBanner slot={ADSENSE_SLOTS.resourceArticle} />
        )}

        {/* Article Body Part 2 */}
        {secondHalf.trim() && (
          <article className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed">
            <MarkdownRenderer content={secondHalf} />
          </article>
        )}

        {/* Author / Editorial Box */}
        <div className="my-10 p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">About FileShare Knowledge Hub</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-lg leading-relaxed">
                FileShare publishes original engineering guides, collaborative architecture analyses, and productivity frameworks for distributed teams and independent creators.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="w-full sm:w-auto shrink-0 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center"
          >
            Try FileShare Free
          </Link>
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
          <h2 className="text-xl font-bold mb-6 text-[var(--text-main)]">Related Resources & Guides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.slug}
                href={`/resources/${rel.slug}`}
                className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--border-glow)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <span className="text-xs font-mono text-[var(--accent-primary)] block mb-1">
                    {rel.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 mb-2">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">
                    {rel.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--text-subtle)] dark:text-[var(--text-muted)] font-mono">
                  <span>{rel.readTime}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare (SHP Technology). High-velocity collaborative workspaces &amp; secure file vaults.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/guide" className="hover:text-[var(--text-main)] transition-colors">Guide</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy Policy</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms &amp; Conditions</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/cookies" className="hover:text-[var(--text-main)] transition-colors">Cookie Policy</Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/refund" className="hover:text-[var(--text-main)] transition-colors">Refund Policy</Link>
            <span className="hidden sm:inline">•</span>
            <CookieSettingsButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
