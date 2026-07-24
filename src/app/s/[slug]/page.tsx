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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title:       `${slug} — FileShare`,
    description: `Shared space at /s/${slug}. Real-time collaborative text and file sharing.`,
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
  let page = db.prepare("SELECT slug, isProtected, content FROM pages WHERE slug = ?").get(slug) as PageRow | undefined;

  if (!page) {
    try {
      db.prepare("INSERT INTO pages (slug, content, isProtected) VALUES (?, ?, 0)").run(slug, "");
      page = { slug, isProtected: 0, content: "" };
    } catch {
      page = db.prepare("SELECT slug, isProtected, content FROM pages WHERE slug = ?").get(slug) as PageRow | undefined;
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
