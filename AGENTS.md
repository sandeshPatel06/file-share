<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Rules & Architecture Guidelines

## Core Development Rules
1. **DO NOT run `npm run build`**: Never execute `npm run build` during tasks or development checks (use `npx tsc --noEmit` and `npx eslint .`).
2. **DO NOT use browser / browser subagents**: Do not attempt to use browser tools or open browser subagents for testing in this repository.

---

## 🏗️ System Architecture Summary

### 1. Database & Persistence (`src/lib/db.ts`)
- **Engine**: Hybrid database engine supporting PostgreSQL (`pg`) via `DATABASE_URL` or embedded SQLite (`better-sqlite3`).
- **Database Path**: `data/fileshare.db` (auto-created on startup if non-existent, used as SQLite fallback).
- **Referential Integrity**: Foreign keys are enabled with `ON UPDATE CASCADE` to allow space slug renames without referential constraint errors.
- **Defensive Provisioning**: API routes use `INSERT OR IGNORE` or try/catch fallbacks to provision page records dynamically before file uploads or content updates.

### 2. Real-Time Synchronization Engine (`src/lib/events.ts` & SSE Route)
- **Central Event Hub**: `EventEmitter` singleton instance in `src/lib/events.ts`.
- **SSE Stream**: Server-Sent Events pushed via `GET /api/pages/[slug]/events` with headers `Content-Type: text/event-stream` and `Cache-Control: no-cache`.
- **Client Hook**: `usePageContent` listens to incoming SSE broadcast events to synchronize notes live across all connected clients.

### 3. File Vault & Media Handling
- **Storage Location**: Backblaze B2 (S3-compatible object storage via `@aws-sdk/client-s3`) with local disk fallback under `uploads/` directory.
- **Upload Route**: `POST /api/pages/[slug]/files/upload` (accepts multi-part files up to 500 MB with memory-efficient streaming).
- **File Serving**: `GET /api/uploads/[filename]` queries the `files` table to serve content with HTTP byte-range support and fallback streaming from Backblaze B2.

### 4. Security & Authentication
- **Password Hashing**: `bcrypt` (10 rounds) for securing password-protected spaces.
- **Authorization Tokens**: JWT tokens generated via `jsonwebtoken` and verified via `Authorization: Bearer <token>` headers.

### 5. AI Copilot Formatting Engine (`src/components/TextEditor.tsx`)
- **Function**: `handleAICopilotFormat`
- **Capabilities**: Parses Markdown syntax to standardize headings (`#`), list bullets (`-`), task checkboxes (`- [ ]`), numbered lists (`1.`), blockquotes (`>`), comma spacing, and collapses excessive blank lines while preserving raw code block indentation.

### 6. SEO, OpenGraph & Metadata System
- **Root Layout (`src/app/layout.tsx`)**: Sets base metadata, OpenGraph tags, Twitter cards (`summary_large_image`), viewport theme colors, and JSON-LD `WebApplication` schema.
- **Workspace Pages (`src/app/s/[slug]/page.tsx`)**: Dynamic metadata & canonical URLs per workspace slug.
- **Search Engine Crawling**: `src/app/robots.ts` (`/robots.txt`), `src/app/sitemap.ts` (`/sitemap.xml`), and `public/manifest.json`.

### 7. CI/CD & Testing Pipeline
- **GitHub Actions**: `.github/workflows/ci.yml` runs TypeScript checks (`npx tsc --noEmit`), ESLint (`npx eslint .`), and production build verification on every push to `main`.
