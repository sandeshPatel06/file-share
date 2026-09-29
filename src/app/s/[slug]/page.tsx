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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

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

function getDefaultStarterContent(slug: string): string {
  return `# Live Workspace: /s/${slug}

Welcome to your real-time collaborative Markdown workspace and 500MB file vault. Edits and file uploads sync across all active browsers via Server-Sent Events.

## 🚀 Quick Start Guide
- **Live Markdown:** Type headers (\`#\`), bullet lists (\`-\`), task items (\`- [ ]\`), and tables.
- **AI Formatting Copilot:** Click **AI Format** (or press \`Cmd/Ctrl + Shift + F\`) to clean up spacing and indentation.
- **500MB File Vault:** Drag and drop images, PDFs, archives, and code into the right-hand Explorer panel.
- **Security & Lock:** Click **Lock Space** in the top navigation bar to protect this workspace with a passphrase.

---

### Sprint Tasks
- [x] Initialized workspace \`/s/${slug}\`
- [ ] Share URL or QR code with collaborators
- [ ] Upload project attachments to vault

> 💡 **Tip:** Explore our [Complete User Guide](/guide) or [Engineering Resources](/resources) for advanced Markdown tips and workflows.
`;
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;

  // Validate slug format
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    notFound();
  }

  const starterContent = getDefaultStarterContent(slug);

  // Get or auto-initialize page record
  let page = (await db.prepare("SELECT slug, isProtected, content FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;

  if (!page) {
    try {
      await db.prepare("INSERT INTO pages (slug, content, isProtected) VALUES (?, ?, 0)").run(slug, starterContent);
      page = { slug, isProtected: 0, content: starterContent };
    } catch {
      page = (await db.prepare("SELECT slug, isProtected, content FROM pages WHERE slug = ?").get(slug)) as PageRow | undefined;
      if (!page) notFound();
    }
  }

  // Ensure content is never an empty screen even on existing blank rows
  const effectiveContent = (page.content && page.content.trim().length > 0) ? page.content : starterContent;

  return (
    <SharePage
      pageData={{
        slug: page.slug,
        isProtected: Boolean(page.isProtected),
        content: effectiveContent,
      }}
    />
  );
}
