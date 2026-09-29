import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  Code2,
  Sparkles,
  Shield,
  HardDrive,
  QrCode,
  Zap,
  Lock,
  Workflow,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Layers,
} from "lucide-react";
import { AdSenseScript } from "@/components/ads/AdSenseScript";
import { AdBanner } from "@/components/ads/AdBanner";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fileshare.shptechnology.online";

export const metadata: Metadata = {
  title: "Complete Documentation & User Guide — FileShare",
  description: "Comprehensive manual and knowledge base for FileShare. Master real-time Markdown notes, AI formatting, Mermaid diagrams, file vaults, and cryptographic security.",
  alternates: {
    canonical: `${appUrl}/guide`,
  },
  openGraph: {
    title: "Complete Documentation & User Guide — FileShare",
    description: "Master real-time Markdown notes, Mermaid diagrams, file vaults, and security on FileShare.",
    url: `${appUrl}/guide`,
    siteName: "FileShare",
    type: "website",
  },
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      {/* Conditionally load AdSense on this comprehensive publisher guide */}
      <AdSenseScript />

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
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      {/* Main Guide Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Title & Introduction */}
        <div className="mb-10 border-b border-[var(--border-color)] pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Official Knowledge Base & Platform Manual</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            FileShare Complete User Guide
          </h1>
          <p className="max-w-3xl text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
            Welcome to the definitive documentation for FileShare. This guide provides an in-depth walkthrough of our real-time collaborative Markdown editor, AI formatting copilot, cloud file vault architecture, access security, and workflow automation.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-[var(--text-subtle)]">
            <span>Version: 2.4.0 (2026 Edition)</span>
            <span>•</span>
            <span>Reading Time: ~12 minutes</span>
            <span>•</span>
            <span>Word Count: ~2,100 words</span>
          </div>
        </div>

        {/* Quick Table of Contents */}
        <nav aria-label="Table of Contents" className="mb-10 p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <h2 className="text-xs uppercase font-mono tracking-wider text-[var(--text-subtle)] mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            Table of Contents
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-[var(--text-muted)]">
            <a href="#section-1" className="hover:text-[var(--text-main)] hover:underline">1. Workspace Architecture & Slugs</a>
            <a href="#section-2" className="hover:text-[var(--text-main)] hover:underline">2. Markdown Syntax & Rich Text</a>
            <a href="#section-3" className="hover:text-[var(--text-main)] hover:underline">3. AI Copilot Formatting Engine</a>
            <a href="#section-4" className="hover:text-[var(--text-main)] hover:underline">4. Declarative Mermaid Diagrams</a>
            <a href="#section-5" className="hover:text-[var(--text-main)] hover:underline">5. Real-Time Sync (SSE)</a>
            <a href="#section-6" className="hover:text-[var(--text-main)] hover:underline">6. High-Performance File Vault</a>
            <a href="#section-7" className="hover:text-[var(--text-main)] hover:underline">7. Security & Passphrase Gates</a>
            <a href="#section-8" className="hover:text-[var(--text-main)] hover:underline">8. Cross-Device QR Mobility</a>
            <a href="#section-9" className="hover:text-[var(--text-main)] hover:underline">9. Keyboard Shortcuts & Reference</a>
            <a href="#section-10" className="hover:text-[var(--text-main)] hover:underline">10. Frequently Asked Questions</a>
          </div>
        </nav>

        {/* Compliant Ad Unit 1 */}
        <AdBanner slot="2000000001" className="max-w-3xl mx-auto" />

        {/* SECTION 1 */}
        <section id="section-1" className="my-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Workspace Architecture & URL Slug Topology
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Every workspace on FileShare is bound to a unique, human-readable URL slug under the <code className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] font-mono text-xs text-[var(--accent-primary)]">/s/[slug]</code> namespace. Unlike traditional SaaS applications that mandate account creation, password verification emails, and team workspace onboarding workflows, FileShare instantiates workspaces dynamically on first request.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-semibold text-sm mb-1 text-[var(--text-main)]">Custom Workspace Names</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                You can select any descriptive alphanumeric slug, such as <code className="font-mono text-[var(--accent-primary)]">/s/q4-sprint-planning</code> or <code className="font-mono text-[var(--accent-primary)]">/s/mobile-app-bugs</code>. Workspace slugs accept lowercase letters, numbers, and hyphens (up to 48 characters).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-semibold text-sm mb-1 text-[var(--text-main)]">Cryptographic Auto-Generated Slugs</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Clicking &quot;New Space&quot; on the home page produces a cryptographically randomized slug (e.g., <code className="font-mono text-[var(--accent-primary)]">/s/swift-falcon-7492</code>). This provides non-guessability for sensitive pairing sessions or confidential document handoffs.
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            <strong>Defensive Provisioning:</strong> When a user navigates to an uninitialized slug, our database layer executes an atomic <code className="font-mono text-xs">INSERT OR IGNORE</code> transaction. The workspace is provisioned immediately with zero latency, ready to accept edits and file uploads.
          </p>
        </section>

        {/* SECTION 2 */}
        <section id="section-2" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Markdown Syntax & Rich Text Capabilities
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            FileShare features a split-view editor supporting the full GitHub Flavored Markdown (GFM) specification. The left pane provides an ultra-low latency code textarea, while the right pane renders formatted HTML with syntax highlighting and live interactive widgets.
          </p>
          <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)] space-y-3">
            <h3 className="font-semibold text-sm text-[var(--text-main)]">Essential Syntax Reference</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="text-[var(--accent-primary)] font-bold mb-1">Headers & Typography</div>
                <div className="text-[var(--text-muted)]"># Large Header (H1)</div>
                <div className="text-[var(--text-muted)]">## Section Header (H2)</div>
                <div className="text-[var(--text-muted)]">### Subsection (H3)</div>
                <div className="text-[var(--text-muted)]">**Bold Text** | *Italic Text*</div>
              </div>
              <div className="p-3 rounded bg-[var(--bg-main)] border border-[var(--border-color)]">
                <div className="text-[var(--accent-primary)] font-bold mb-1">Interactive Tasks & Lists</div>
                <div className="text-[var(--text-muted)]">- [ ] Pending action item</div>
                <div className="text-[var(--text-muted)]">- [x] Completed task</div>
                <div className="text-[var(--text-muted)]">1. Ordered list item</div>
                <div className="text-[var(--text-muted)]">&gt; Blockquote highlight</div>
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            <strong>Interactive Checklists:</strong> Unlike static Markdown viewers where checkboxes are read-only, checkboxes in FileShare&apos;s live preview pane can be toggled with a single mouse click. Toggling a task automatically updates the underlying Markdown source code and broadcasts the state change to all connected collaborators.
          </p>
        </section>

        {/* SECTION 3 */}
        <section id="section-3" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              AI Copilot Formatting Engine
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            During rapid brainstorming sessions or chaotic engineering war rooms, notes often end up with inconsistent indentation, broken bullet lists, uneven heading depths, and excessive empty line breaks. FileShare includes a deterministic AI-powered formatting engine designed specifically for technical Markdown documents.
          </p>
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text-main)]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              What the AI Copilot Formatter Normalizes:
            </div>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <li><strong>Heading Standardization:</strong> Enforces standard ATX formatting (<code className="font-mono"># Heading</code>) with exact space delimiters, correcting malformed headers like <code className="font-mono">##Heading</code>.</li>
              <li><strong>List Bullet Harmonization:</strong> Converts mixed asterisks (<code className="font-mono">*</code>), pluses (<code className="font-mono">+</code>), and irregular dashes into consistent, clean hyphenated lists (<code className="font-mono">-</code>).</li>
              <li><strong>Code Block Protection:</strong> Intelligently preserves raw whitespace, tabs, and indentation inside fenced code blocks (<code className="font-mono">```typescript ... ```</code>) while cleaning exterior documentation text.</li>
              <li><strong>Excessive Line Break Collapse:</strong> Cleans up messy three- or four-line gaps into clean, readable single blank lines.</li>
              <li><strong>Punctuation & Comma Spacing:</strong> Standardizes English comma and period spacing across sentences for professional document presentation.</li>
            </ul>
          </div>
        </section>

        {/* Compliant Ad Unit 2 */}
        <AdBanner slot="2000000002" className="max-w-3xl mx-auto" />

        {/* SECTION 4 */}
        <section id="section-4" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              4
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Declarative Technical Diagrams with Mermaid.js
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Complex software architectures, user flows, and database schemas are cumbersome to describe with pure prose. FileShare features integrated support for Mermaid.js, compiling declarative text syntax directly into responsive SVG diagrams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-semibold text-xs sm:text-sm mb-2 text-[var(--text-main)] flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-blue-400" />
                Flowchart Example
              </h3>
              <pre className="p-3 rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px] font-mono text-[var(--text-muted)] overflow-x-auto">
{`\`\`\`mermaid
flowchart TD
    Client[Web Browser] -->|SSE Stream| Edge[Edge Server]
    Edge -->|Query| DB[(PostgreSQL)]
    Client -->|Binary Upload| S3[(Backblaze B2)]
\`\`\``}
              </pre>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-semibold text-xs sm:text-sm mb-2 text-[var(--text-main)] flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-400" />
                Sequence Diagram Example
              </h3>
              <pre className="p-3 rounded bg-[var(--bg-main)] border border-[var(--border-color)] text-[11px] font-mono text-[var(--text-muted)] overflow-x-auto">
{`\`\`\`mermaid
sequenceDiagram
    User->>Gateway: POST /login
    Gateway->>DB: Verify bcrypt hash
    DB-->>Gateway: OK (Match)
    Gateway-->>User: 200 OK + JWT Token
\`\`\``}
              </pre>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Because diagrams are stored as plain text, they can be edited collaboratively, copied across workspaces, and version-controlled cleanly without dealing with stale PNG or binary drawing files.
          </p>
        </section>

        {/* SECTION 5 */}
        <section id="section-5" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              5
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Real-Time Synchronization Engine (Server-Sent Events)
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            FileShare utilizes a high-efficiency Server-Sent Events (SSE) streaming engine rather than traditional polling or heavyweight bidirectional WebSockets. This architecture delivers minimal client memory overhead and native reconnection handling over standard HTTP/2 and HTTP/3 transports.
          </p>
          <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)] space-y-3">
            <h3 className="font-semibold text-sm text-[var(--text-main)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              How Real-Time Sync Works Under the Hood:
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <li><strong>Connection Establishment:</strong> When a user opens a workspace, the browser subscribes to <code className="font-mono text-xs">/api/pages/[slug]/events</code> via the native <code className="font-mono text-xs">EventSource</code> API.</li>
              <li><strong>Debounced Typing Invalidation:</strong> As a user types, edits are buffered and transmitted over an authenticated POST request with debounced timing to eliminate network congestion.</li>
              <li><strong>Central Event Hub:</strong> The server commits the updated text atomically to the database and emits an event through our centralized event hub singleton.</li>
              <li><strong>Broadcast Fan-Out:</strong> All active subscribers to that specific workspace receive the update in under 50 milliseconds, updating the client editor smoothly without cursor jumps.</li>
            </ol>
          </div>
        </section>

        {/* SECTION 6 */}
        <section id="section-6" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              6
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              High-Performance File Vault & Media Handling
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            In addition to real-time Markdown notes, every FileShare workspace includes an integrated multi-file storage vault capable of storing files up to 500 MB per file.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <HardDrive className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="font-semibold text-sm mb-1 text-[var(--text-main)]">500MB Upload Limit</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Upload large video recordings, zip archives, high-resolution design assets, PDFs, and code tarballs effortlessly.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <Sparkles className="w-5 h-5 text-blue-400 mb-2" />
              <h3 className="font-semibold text-sm mb-1 text-[var(--text-main)]">In-Browser Previews</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Click any file to preview high-resolution images, stream MP4/WebM videos, listen to audio files, or view PDF documents directly.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <Shield className="w-5 h-5 text-purple-400 mb-2" />
              <h3 className="font-semibold text-sm mb-1 text-[var(--text-main)]">S3 & B2 Cloud Storage</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Files are backed by Backblaze B2 S3-compatible cloud storage with high bandwidth and local disk fallback redundancy.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7 */}
        <section id="section-7" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              7
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Security, Access Control & Passphrase Protection
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            While public workspaces are ideal for open collaboration and classroom sharing, confidential projects require strict access restriction. FileShare incorporates enterprise-grade cryptographic controls that can be engaged in seconds.
          </p>
          <div className="bg-[var(--bg-surface)] p-5 rounded-xl border border-[var(--border-color)] space-y-4">
            <div className="flex items-center gap-2 font-semibold text-sm text-[var(--text-main)]">
              <Lock className="w-4 h-4 text-emerald-400" />
              How Workspace Security Is Enforced:
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              <p>
                <strong>Bcrypt Passphrase Hashing:</strong> When you set a workspace password, the server computes a 10-round bcrypt hash with an individual salt. The plaintext password is never stored or logged anywhere on our infrastructure.
              </p>
              <p>
                <strong>Stateless JWT Authentication:</strong> Successful authentication produces a cryptographic JSON Web Token (JWT) signed with a secure server secret. The client stores this token strictly in temporary <code className="font-mono text-xs">sessionStorage</code>. When the browser tab is closed, access expires automatically.
              </p>
              <p>
                <strong>Zero Password Gate Bypass:</strong> API endpoints verifying file downloads, note editing, and SSE event streaming strictly validate the Bearer token. Any request without a valid token to a locked space receives an immediate HTTP 401 Unauthorized rejection.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 8 */}
        <section id="section-8" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              8
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Cross-Device Mobility & Instant QR Code Transfer
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Seamlessly transitioning between a desktop workstation, iPad, and smartphone is often hampered by typing long URLs or having to email links to yourself. FileShare solves this with instant QR code generation:
          </p>
          <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
              <QrCode className="w-8 h-8" />
            </div>
            <div className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              <p className="mb-2">
                Click the <strong>QR Code icon</strong> in the top navigation bar of any workspace. A high-resolution, vector QR code is rendered instantly.
              </p>
              <p>
                Point your smartphone or tablet camera at the screen to open the exact same workspace immediately. Perfect for mobile photo uploads, live lecture note-taking, or testing responsive designs.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 9 */}
        <section id="section-9" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              9
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Keyboard Shortcuts & Hotkey Reference
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Power users can navigate and format text rapidly using standard keyboard shortcuts:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-[var(--border-color)] rounded-xl overflow-hidden">
              <thead className="bg-[var(--bg-surface)] font-mono text-[var(--text-subtle)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="p-3">Action</th>
                  <th className="p-3">Shortcut (Mac)</th>
                  <th className="p-3">Shortcut (Windows/Linux)</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-muted)]">
                <tr>
                  <td className="p-3 font-semibold text-[var(--text-main)]">AI Copilot Format</td>
                  <td className="p-3 font-mono">Cmd + Shift + F</td>
                  <td className="p-3 font-mono">Ctrl + Shift + F</td>
                  <td className="p-3">Cleans and normalizes document markdown syntax</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[var(--text-main)]">Bold Text</td>
                  <td className="p-3 font-mono">Cmd + B</td>
                  <td className="p-3 font-mono">Ctrl + B</td>
                  <td className="p-3">Encloses selected text in double asterisks</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[var(--text-main)]">Italic Text</td>
                  <td className="p-3 font-mono">Cmd + I</td>
                  <td className="p-3 font-mono">Ctrl + I</td>
                  <td className="p-3">Encloses selected text in single underscores</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[var(--text-main)]">Insert Code Block</td>
                  <td className="p-3 font-mono">Cmd + Shift + C</td>
                  <td className="p-3 font-mono">Ctrl + Shift + C</td>
                  <td className="p-3">Wraps text in fenced code backticks</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-[var(--text-main)]">Toggle File Panel</td>
                  <td className="p-3 font-mono">Cmd + \</td>
                  <td className="p-3 font-mono">Ctrl + \</td>
                  <td className="p-3">Opens or closes the right-hand file vault drawer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 10 */}
        <section id="section-10" className="my-10 space-y-4 pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white font-bold flex items-center justify-center text-sm">
              10
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">
              Frequently Asked Questions & Troubleshooting
            </h2>
          </div>
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                How long are files and notes stored on FileShare?
              </h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                FileShare is designed as an agile, ephemeral collaboration workspace. Files and active notes remain available while the space is active. To protect storage resources and user privacy, inactive workspaces may be subject to ephemeral lifecycle pruning after 30 days of inactivity. Always export mission-critical documents to permanent git or local archives.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                What happens if two people edit the same workspace simultaneously?
              </h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Our Server-Sent Events engine pushes debounced text updates in near real-time. To prevent collisions, we recommend working under distinct Markdown headers when multiple team members are typing concurrently.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                Can I rename my workspace slug?
              </h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Yes! If you are the workspace administrator (or the space is unlocked), click the workspace name in the header to trigger the rename dialog. Our database enforces <code className="font-mono text-xs">ON UPDATE CASCADE</code> referential integrity, ensuring all uploaded files stay linked to the new workspace name seamlessly.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
              <h3 className="font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-primary)]" />
                Are there any file type restrictions?
              </h3>
              <p className="text-[var(--text-muted)] leading-relaxed">
                FileShare accepts virtually all standard media, archive, and code formats including ZIP, TAR, PDF, PNG, JPG, MP4, MP3, TXT, JSON, CSV, and code files. However, our Acceptable Use Policy strictly forbids malicious executables, ransomware, phishing scripts, and illegal material. Violating content is permanently deleted upon detection.
              </p>
            </div>
          </div>
        </section>

        {/* Compliant Ad Unit 3 */}
        <AdBanner slot="2000000003" className="max-w-3xl mx-auto" />

        {/* CTA Footer Box */}
        <div className="my-12 p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center max-w-2xl mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Ready to Experience FileShare?</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
            Put this guide to work. Launch a collaborative space in seconds without registering or filling out forms.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--accent-primary)] text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
            >
              Open a Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-color)] text-xs sm:text-sm font-semibold hover:bg-[var(--bg-surface)] transition-colors inline-flex items-center justify-center"
            >
              Browse Engineering Articles
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 bg-[var(--header-bg)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© 2026 FileShare. Complete technical manual & collaborative platform.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="hover:text-[var(--text-main)] transition-colors">Home</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-[var(--text-main)] transition-colors">About</Link>
            <span>•</span>
            <Link href="/resources" className="hover:text-[var(--text-main)] transition-colors">Resources</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[var(--text-main)] transition-colors">Contact</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[var(--text-main)] transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[var(--text-main)] transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
