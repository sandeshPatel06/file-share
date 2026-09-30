import type { Metadata } from "next";
import { getAppUrl } from "@/lib/seo";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Contact Us & Support — FileShare",
  description: "Get in touch with the FileShare team. Technical inquiries, feedback, DMCA notices, and user support.",
  alternates: {
    canonical: `${appUrl}/contact`,
  },
  openGraph: {
    title: "Contact Us & Support — FileShare",
    description: "Get in touch with the FileShare team for technical inquiries, DMCA notices, and support.",
    url: `${appUrl}/contact`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
