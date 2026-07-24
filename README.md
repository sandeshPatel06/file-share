# 🚀 FileShare — Real-Time Notes & File Sharing Vault

FileShare is a lightweight, high-performance, real-time note & file sharing application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **SQLite (`better-sqlite3`)**.

---

## ✨ Features

- **⚡ Real-Time Live Sync**: Synchronizes Markdown notes across multiple browsers instantly via Server-Sent Events (SSE).
- **📂 File Sharing Vault**: Drag-and-drop file uploads (up to 50 MB) stored securely with MIME-type detection.
- **✨ AI Copilot Auto-Formatter**: Automatic Markdown beautification engine that fixes headings, lists, task checkboxes, punctuation, and blockquotes.
- **🔒 Password Protection**: Optional space locking with `bcrypt` password hashing and JWT authorization tokens.
- **🌐 Complete SEO & PWA**: Dynamic OpenGraph images, Twitter Cards, JSON-LD Schema, `robots.txt`, `sitemap.xml`, and web manifest.
- **🗄️ Zero External DB Setup**: Auto-initializes local SQLite database (`data/fileshare.db`) with zero external database dependencies.

---

## 🛠️ Getting Started

### 1. Environment Setup

Create `.env.local` in the root directory:

```env
# JWT Secret Key for password-protected workspace tokens
# Command to generate: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# App Base URL (used for sharing links and OpenGraph metadata)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Theme Preference (dark or light)
NEXT_PUBLIC_DEFAULT_THEME=dark
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

## 🚀 Deployment Guide (100% Free Options)

### Render.com (Free PaaS Web Service)
1. Push your repository to GitHub (`sandeshPatel06/file-share`).
2. Create a **New Web Service** on Render connected to your repository.
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`
5. **Environment Variable**: `JWT_SECRET`
6. Attach a **Persistent Disk Volume** mounted at `/app/data` and `/app/uploads`.

---

## 🎨 Tech Stack & Architecture

- **Frontend**: Next.js 16 (Turbopack), React 19, Lucide Icons, Tailwind CSS
- **Backend**: Next.js App Router API Routes
- **Database**: SQLite (`better-sqlite3`) with automatic `ON UPDATE CASCADE` referential integrity
- **Streaming Engine**: Node.js `EventEmitter` + Server-Sent Events (SSE)
- **CI/CD**: GitHub Actions workflow (`.github/workflows/ci.yml`)
