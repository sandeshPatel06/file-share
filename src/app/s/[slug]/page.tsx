import { notFound } from "next/navigation";
import db from "@/lib/db";
import { SharePage } from "@/components/SharePage";
import { slugSchema } from "@/lib/validators";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

interface PageRow {
  slug: string;
  isProtected: number;
  content: string | null;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://file-share-dev.onrender.com";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const canonicalUrl = `${appUrl}/s/${slug}`;

  return {
    title: `${slug} — Live Workspace`,
    description: `Collaborate live in real-time at /s/${slug}. Instant markdown editing and file sharing vault.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${slug} — FileShare Live Space`,
      description: `Real-time collaborative text and file sharing workspace at /s/${slug}.`,
      url: canonicalUrl,
      siteName: "FileShare",
      type: "website",
      images: [
        {
          url: `${appUrl}/logo.png`,
          width: 512,
          height: 512,
          alt: `FileShare Workspace - ${slug}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${slug} — FileShare Live Space`,
      description: `Collaborate live in real-time at /s/${slug}.`,
      images: [`${appUrl}/logo.png`],
    },
  };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  // Validate slug format
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    notFound();
  }

  // Get or auto-initialize page record
  let page = (await db.prepare("SELECT slug, isProtected, content FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;

  if (!page) {
    try {
      await db.prepare("INSERT INTO pages (slug, content, isProtected) VALUES (?, ?, 0)").run(slug, "");
      page = { slug, isProtected: 0, content: "" };
    } catch {
      page = (await db.prepare("SELECT slug, isProtected, content FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
      if (!page) notFound();
    }
  }

  return (
    <SharePage
      pageData={{
        slug:        page.slug,
        isProtected: Boolean(page.isProtected),
        content:     page.content ?? "",
      }}
    />
  );
}
