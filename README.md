# 🚀 FileShare — Real-Time Notes & File Sharing Vault

FileShare is a lightweight, high-performance, real-time note & file sharing application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **PostgreSQL** / **SQLite (`better-sqlite3`)**, and **Backblaze B2 Object Storage**.

---

## ✨ Features

- **⚡ Real-Time Live Sync**: Synchronizes Markdown notes across multiple browsers instantly via Server-Sent Events (SSE).
- **📂 File Sharing Vault**: Drag-and-drop file uploads (up to 500 MB) with streaming support and MIME-type detection.
- **☁️ Cloud Object Storage**: Integrated with Backblaze B2 (S3-compatible) for persistent and reliable file storage.
- **✨ AI Copilot Auto-Formatter**: Automatic Markdown beautification engine that fixes headings, lists, task checkboxes, punctuation, and blockquotes.
- **🔒 Password Protection**: Optional space locking with `bcrypt` password hashing and JWT authorization tokens.
- **🌐 Complete SEO & PWA**: Dynamic OpenGraph images, Twitter Cards, JSON-LD Schema, `robots.txt`, `sitemap.xml`, and web manifest.
- **🗄️ Hybrid Database Support**: Automatic failover supporting Render PostgreSQL (via `DATABASE_URL`) or embedded local SQLite (`data/fileshare.db`).

---

## 🛠️ Getting Started

### 1. Environment Setup

Create `.env.local` in the root directory:

```env
# App Base URL (used for sharing links and OpenGraph metadata)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Theme Preference (dark or light)
NEXT_PUBLIC_DEFAULT_THEME=dark

# JWT Secret Key for password-protected workspace tokens
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Database Configuration (Optional: uses local SQLite if DATABASE_URL is unset)
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# Backblaze B2 Object Storage (Optional: stores locally under uploads/ if unset)
# B2_ENDPOINT=s3.us-east-005.backblazeb2.com
# B2_KEY_ID=your_b2_key_id
# B2_APPLICATION_KEY=your_b2_application_key
# B2_BUCKET_NAME=your_bucket_name
# B2_REGION=us-east-005
```

### 2. Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run TypeScript static check
npx tsc --noEmit

# Run ESLint code quality check
npx eslint .
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment Guide (Render.com)

### Render.com Web Service
1. Push your repository to GitHub (`sandeshPatel06/file-share`).
2. Create a **New Web Service** on Render connected to your repository.
3. **Build Command**: `./deploy.sh`
4. **Start Command**: `npm start`
5. **Environment Variables**:
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://fileshare.shptechnology.online`)
   - `JWT_SECRET`
   - `DATABASE_URL` (Render PostgreSQL connection string)
   - `B2_ENDPOINT`, `B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME`, `B2_REGION`

---

## 🎨 Tech Stack & Architecture

- **Frontend**: Next.js 16 (Turbopack), React 19, Lucide Icons, Tailwind CSS
- **Backend**: Next.js App Router API Routes
- **Database**: PostgreSQL (`pg`) with automatic table provisioning & SQLite (`better-sqlite3`) fallback
- **Storage**: Backblaze B2 S3 SDK (`@aws-sdk/client-s3`) & local disk fallback
- **Streaming Engine**: Node.js `EventEmitter` + Server-Sent Events (SSE)
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`)

---

## 🔌 API Reference

Base URL: `http://localhost:3000` (local) · `https://fileshare.shptechnology.online` (prod).

**Auth model:** public pages need no auth. Password-protected pages require `Authorization: Bearer <JWT>` whose payload `slug` matches the path slug. Get a token via `POST /api/pages/:slug/verify`. SSE and file-download also accept `?token=` since `EventSource`/`<a download>` can't set headers. Slugs: 3–48 chars, `^[a-z0-9]+(-[a-z0-9]+)*$`.

| Method | Endpoint | Auth (if protected) | Notes |
|--------|----------|---------------------|-------|
| GET | `/api/health` | — | `{status, timestamp, uptime}` |
| GET | `/api/pages/:slug` | Bearer (optional) | `content` is `""` when locked without token |
| DELETE | `/api/pages/:slug` | Bearer | Deletes workspace + file rows (irreversible) |
| PATCH | `/api/pages/:slug/content` | Bearer | `{content (≤500k chars), clientId?}` → emits `content_updated` |
| GET | `/api/pages/:slug/events` | Bearer or `?token=` | SSE: `connected` → `message` JSON, 10s ping |
| GET | `/api/pages/:slug/files` | Bearer | Newest first, `uploadedAt: {seconds}` |
| DELETE | `/api/pages/:slug/files/:fileId` | Bearer | Scoped delete + B2/local cleanup → `files_updated` |
| POST | `/api/pages/:slug/files/upload` | Bearer header only | Multipart `file` field, single file, ≤500 MB, MIME allowlist |
| PATCH | `/api/pages/:slug/password` | Bearer if already protected | Set `{password}` (min 6) / clear `{password: null}` |
| POST | `/api/pages/:slug/verify` | — (5/60s per IP) | `{password}` → JWT (HS256, 24h, `{slug}`) |
| PATCH | `/api/pages/:slug/rename` | Bearer | `{newSlug}`; old slug 307-redirects to new |
| POST | `/api/pages/create` | — | `{slug, password?}` → 201 (200 `{exists:true}` if taken) |
| GET | `/api/pages/create?slug=` | — | `{available}` live check |
| GET | `/api/uploads/:storedName` | Bearer or `?token=` | Local → B2 fallback, `Range` support |

Rate limits: general 300/60s per IP; verify 5/60s per IP. Error shape: `{error: "..."}` with 400/401/404/413/422/429 as appropriate.

### Quickstart (curl)

```bash
# 1. Create + write
curl -X POST localhost:3000/api/pages/create -H 'Content-Type: application/json' -d '{"slug":"demo"}'
curl -X PATCH localhost:3000/api/pages/demo/content -H 'Content-Type: application/json' -d '{"content":"# hi"}'

# 2. Lock + unlock (token auto-flows in the Bruno collection)
curl -X PATCH localhost:3000/api/pages/demo/password -H 'Content-Type: application/json' -d '{"password":"secret12345"}'
TOKEN=$(curl -s -X POST localhost:3000/api/pages/demo/verify -H 'Content-Type: application/json' -d '{"password":"secret12345"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
curl localhost:3000/api/pages/demo -H "Authorization: Bearer $TOKEN"

# 3. Vault
curl -X POST localhost:3000/api/pages/demo/files/upload -F "file=@notes.pdf"
curl localhost:3000/api/pages/demo/files | python3 -m json.tool

# 4. Live stream (stays open)
curl -N -H "Accept: text/event-stream" "localhost:3000/api/pages/demo/events?token=$TOKEN"
```

### Bruno collection (`bruno/`)

Import `bruno/` into [Bruno](https://www.usebruno.com). Two environments included — pick one from the environment selector:

- **Local** → `http://localhost:3000`
- **Production** → `https://fileshare.shptechnology.online`

Suggested run order: `Get Page → Update Content → Check Slug → Create Page → Rename → Set Password → Verify → SSE → Files (List → Upload → Delete → Serve) → Delete Workspace`.

**Automation scripts included** (no manual copy-paste):
- `Verify Password` post-response saves the JWT into the `token` env var.
- `Rename Workspace` post-response moves `slug` to the new slug.
- `Create Page` post-response sets `slug` to the created slug.
- `Upload File` post-response saves `fileId` + `storedName` (Delete/Serve reuse them via variables).
