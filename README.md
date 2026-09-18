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
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://fileshare-live.onrender.com`)
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
