import { generateSlug } from "@/lib/slugGenerator";
import { LandingPage } from "@/components/LandingPage";
import { getAppUrl } from "@/lib/seo";
import type { Metadata } from "next";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "FileShare — Instant Real-Time Notes & Secure 500MB File Sharing Vault",
  description: "Free instant collaborative real-time notepad and 500MB secure file vault. Anonymous workspaces, live Markdown editing, AI formatting, Mermaid diagrams, and instant QR code file transfer. Zero sign-up required.",
  keywords: [
    "online notepad without login",
    "real time collaborative notepad",
    "free file sharing 500mb",
    "live markdown editor online",
    "temporary workspace no sign up",
    "anonymous file transfer link",
    "pastebin alternative with file upload",
    "share notes online with link",
    "share code snippets real time",
    "password protected notes sharing",
    "transfer files pc to mobile qr code",
    "ephemeral file vault",
  ],
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: "FileShare — Instant Real-Time Notes & Secure 500MB File Sharing Vault",
    description: "Free instant collaborative real-time notepad and 500MB secure file vault. Zero registration required.",
    url: appUrl,
    siteName: "FileShare",
    type: "website",
    images: [
      {
        url: `${appUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "FileShare Logo — Real-Time Notes & File Vault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FileShare — Instant Real-Time Notes & Secure 500MB File Sharing Vault",
    description: "Free instant collaborative real-time notepad and 500MB secure file vault. Zero sign-up required.",
    images: [`${appUrl}/logo.png`],
  },
};

export default function Home() {
  const defaultSlug = generateSlug();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is FileShare and how does it work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FileShare is a free, instant web utility that merges an anonymous collaborative Markdown notepad with a 500MB secure file sharing vault. You do not need to register or install software. Simply visit a custom URL like /s/project-notes and all edits and file uploads sync across all connected browsers in milliseconds using Server-Sent Events (SSE)."
        }
      },
      {
        "@type": "Question",
        "name": "Is FileShare free to use, and do I need to register?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, FileShare is 100% free with zero registration required. There are no forms to fill out, no email confirmations, and no subscriptions. You can start typing notes or uploading files immediately."
        }
      },
      {
        "@type": "Question",
        "name": "What is the file size upload limit on FileShare?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can upload files up to 500 MB each. FileShare supports multi-file uploads including videos, zip archives, images, PDFs, datasets, and code repositories with streaming cloud storage backing."
        }
      },
      {
        "@type": "Question",
        "name": "How is FileShare different from Pastebin, Google Drive, or WeTransfer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike Pastebin, FileShare offers real-time live typing synchronization, rich Markdown, Mermaid diagram rendering, and 500MB file attachments. Unlike Google Drive or WeTransfer, FileShare requires zero logins, no recipient emails, and creates instant workspaces accessible by custom URL slug or QR code."
        }
      },
      {
        "@type": "Question",
        "name": "How does real-time synchronization work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "FileShare utilizes Server-Sent Events (SSE) to broadcast changes across all connected clients in milliseconds. Text edits, Markdown formatting, and file uploads appear automatically across all screens without any page refresh."
        }
      },
      {
        "@type": "Question",
        "name": "Can I protect my workspace with a password?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! Click the 'Lock Space' button inside any workspace to set an encrypted password. Passwords are securely hashed with bcrypt (10 rounds) and access is verified via stateless JWT tokens."
        }
      },
      {
        "@type": "Question",
        "name": "How do I share files between PC and mobile phone using FileShare?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Click the QR code button in the top navigation bar of your workspace to generate a high-resolution QR code. Scan it with your phone's camera to immediately continue editing notes or downloading files on mobile without installing an app."
        }
      },
      {
        "@type": "Question",
        "name": "Can I write Markdown and render Mermaid diagrams?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. FileShare natively parses GitHub Flavored Markdown (headings, tables, task lists, code blocks with syntax highlighting) and automatically renders Mermaid sequence, flowchart, and class diagrams inline."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create an Instant Collaborative Workspace and Share Files",
    "description": "Step-by-step instructions to create an anonymous real-time workspace for live Markdown notes and secure file sharing up to 500MB.",
    "image": `${appUrl}/logo.png`,
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose or enter a workspace slug",
        "text": "Enter your preferred custom workspace name (such as /s/my-project) in the launcher or click 'Random Space' to auto-generate a private slug.",
        "url": `${appUrl}/#launcher`
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Collaborate on live Markdown notes",
        "text": "Write and edit text simultaneously with collaborators. Format with Markdown, code syntax highlighting, task checkboxes, and Mermaid diagrams.",
        "url": `${appUrl}/#editor`
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Upload files up to 500MB",
        "text": "Drag and drop archives, PDFs, videos, or code folders into the file vault. Files sync live across all active participants.",
        "url": `${appUrl}/#vault`
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Share or lock your space",
        "text": "Share the URL, scan the dynamic QR code on mobile devices, or set a bcrypt password lock for confidential collaboration.",
        "url": `${appUrl}/#security`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <LandingPage defaultSlug={defaultSlug} />
    </>
  );
}
