<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Stack pin:** Next.js **16.2.x** (App Router), React **19**, TypeScript **5**, Tailwind CSS **4**, Node runtime for API routes that use SSE / busboy / better-sqlite3.
<!-- END:nextjs-agent-rules -->

# FileShare — Agent Rules & Architecture Guidelines

This document is the **source of truth for AI agents and automated coding tools** working on [sandeshPatel06/file-share](https://github.com/sandeshPatel06/file-share).

Product: **zero-registration** real-time Markdown workspaces + 500 MB file vault, password-optional, SSE sync, hybrid DB, B2/local storage.

Live canonical URL: `https://fileshare.shptechnology.online`

---

## 0. Hard rules (never violate)

1. **DO NOT run `npm run build`** during agent tasks or iterative checks. Use:
   - `npx tsc --noEmit`
   - `npx eslint .`
2. **DO NOT use browser / browser subagents** for testing this repository (project convention).
3. **Preserve zero-registration product model.** Do not add mandatory accounts, email verification, or OAuth unless explicitly requested.
4. **Do not invent secrets.** Never commit real `JWT_SECRET`, B2 keys, or `DATABASE_URL`.
5. **Prefer existing patterns** in `src/lib/*`, hooks, and API route auth helpers — do not introduce a parallel stack (e.g. Prisma, Socket.io) without an explicit product decision.
6. **JWT library is `jose`**, not `jsonwebtoken`. Sign/verify via `src/lib/jwt.ts` only.
7. **Slug rules** are enforced by Zod in `src/lib/validators.ts`: `3–48` chars, `^[a-z0-9]+(-[a-z0-9]+)*$`.
8. When changing schema, keep **PostgreSQL + SQLite + in-memory** paths in `src/lib/db.ts` in sync (or document intentional divergence).

---

## 1. Repository map

```
src/
  app/                    # Next.js App Router
    page.tsx              # Landing (SEO + LandingPage)
    layout.tsx            # Root metadata, theme, consent, ads
    s/[slug]/page.tsx     # Workspace SSR entry → SharePage
    api/
      health/
      pages/
        create/
        [slug]/             # GET page
          content/        # PATCH content + SSE emit
          events/         # SSE stream
          files/          # list / delete
          files/upload/   # multipart upload ≤500MB
          password/       # set/clear lock
          verify/         # unlock → JWT
          rename/         # slug rename
      uploads/[filename]/ # serve file + Range + B2 fallback
    guide|privacy|terms|cookies|about|contact|resources|blog|refund/
  components/
    SharePage.tsx         # Shell: gate, editor, file panel
    TextEditor.tsx        # Large client editor (debounce PATCH, AI format, export)
    FilePanel.tsx         # Vault UI + XHR progress uploads
    SlugBar.tsx           # Header actions
    PasswordGate|PasswordModal|QRCodeModal|RenameSlugModal
    MarkdownRenderer|MermaidRenderer
    LandingPage.tsx
    ui/                   # Button, Modal, Toast, CookieConsent, ConfirmModal
    ads/                  # AdSense (consent-gated)
  hooks/
    usePageContent.ts     # SSE + local-edit guard + fallback poll
    useFileList.ts        # SSE files_updated + poll
  lib/
    db.ts                 # Hybrid PG / SQLite / memory
    events.ts             # EventEmitter singleton (pageEvents)
    jwt.ts                # jose HS256, 24h, slug-scoped
    b2.ts                 # S3-compatible B2 client
    validators.ts         # Zod schemas + MIME allowlist
    rateLimiter.ts        # verify 5/60s · general 300/60s (memory)
    slugGenerator.ts      # adj-noun-NN
    seo.ts                # canonical production host lock
    caret.ts|clipboard.ts|articles.ts
  middleware.ts           # 301 old onrender host → canonical domain
```

Config: `next.config.ts` (security headers, `allowedDevOrigins`), `deploy.sh`, `render.yaml`, `.github/workflows/ci.yml`.

---

## 2. System architecture

### 2.1 Database (`src/lib/db.ts`)

| Mode | Trigger | Notes |
|------|---------|--------|
| PostgreSQL | `DATABASE_URL` set | `pg` Pool, SSL off for localhost |
| SQLite | no `DATABASE_URL` | `better-sqlite3` at `data/fileshare.db` (or `/tmp` on serverless) |
| Memory | SQLite unavailable | `Map` fallback — **non-durable** |

**Tables (logical):**

- `pages`: `slug` PK, `content`, `isProtected`, `passwordHash`, `createdAt`, `updatedAt`
- `files`: `fileId` PK, `slug` FK → pages (`ON DELETE CASCADE`, `ON UPDATE CASCADE`), `originalName`, `storedName`, `mimetype`, `size`, `downloadURL`, `uploadedAt`

**Conventions:**

- API routes **provision** missing pages with `INSERT OR IGNORE` / try-catch before writes.
- PG uses quoted camelCase identifiers; `convertSqlForPg` rewrites `?` → `$n` and `INSERT OR IGNORE`.
- Prefer `db.prepare(sql).get|run|all(...)` async abstraction — do not call `pg`/`better-sqlite3` directly from routes.

### 2.2 Real-time sync (`src/lib/events.ts` + SSE)

- Singleton `pageEvents: EventEmitter` (max listeners 200; stored on `global` in dev).
- **Emit:** after content PATCH or file upload/delete → `pageEvents.emit(slug, payload)`.
- **Subscribe:** `GET /api/pages/[slug]/events` → `ReadableStream` SSE:
  - `event: connected`
  - `event: message` + JSON body
  - comment ping every 10s
- Client: `EventSource` in `usePageContent` / `useFileList`.
- **Local-edit guard:** ignore remote content if user typed within ~1.5–2s (`lastLocalEditAt` + `touchLocalEdit`).
- Fallback poll every 12s if EventSource closed.
- Protected spaces: SSE requires Bearer or `?token=` JWT matching slug.

**Known product gap (do not “fix” by adding CRDT without design):** last-write-wins; concurrent same-region edits can clobber. Soft conflict / presence is a planned enhancement (see `task.md`).

### 2.3 Content pipeline

1. SSR: `s/[slug]/page.tsx` loads/creates page, passes `pageData` to `SharePage`.
2. Client: `TextEditor` holds `displayContent`, calls `pushUpdate` → debounced `PATCH /api/pages/[slug]/content` with optional `Authorization: Bearer`.
3. Server validates Zod `updateContentSchema` (max **500_000** chars), updates DB, emits `content_updated`.
4. Other clients apply if not in local-edit window.

### 2.4 File vault

- **Upload:** `POST /api/pages/[slug]/files/upload` — `busboy` streaming, max **500 MB**, MIME allowlist in `validators.ts`.
- Local path under `uploads/` (or `/tmp/uploads` serverless); optional mirror to **Backblaze B2** via `uploadToB2`.
- **Serve:** `GET /api/uploads/[filename]` — DB lookup, auth if page protected, Range support, local then B2 `getFromB2`.
- **Client:** `FilePanel` uses **XHR** for upload progress % / speed; `useFileList` refreshes on `files_updated`.
- Delete via files API + B2/local cleanup when implemented in route.

### 2.5 Security & auth

| Concern | Implementation |
|---------|----------------|
| Password hash | `bcryptjs` 10 rounds (`passwordHash` on pages) |
| Session | `jose` JWT, HS256, **24h**, payload `{ slug }`, secret `JWT_SECRET` |
| Client storage | `sessionStorage` key `token:${slug}` (cleared on tab close) |
| API auth | `Authorization: Bearer <token>`; slug must match |
| Rate limit | In-memory: verify **5/60s/IP**, general **300/60s/IP** |
| Headers | `X-Content-Type-Options`, `X-Frame-Options`, CSP `frame-ancestors 'self'`, etc. in `next.config.ts` |
| Domain | Middleware 301 from `fileshare-live.onrender.com` → canonical host |

**Not E2E encrypted.** Server can read notes and files. Do not claim zero-knowledge in UI copy.

### 2.6 AI Copilot formatter

- Client-only in `TextEditor.tsx` → `handleAICopilotFormat`.
- Deterministic Markdown cleanup (headings, lists, tasks, blockquotes, commas, blank lines); **preserves fenced code blocks**.
- Shortcut: Cmd/Ctrl+Shift+F. Not an external LLM API.

### 2.7 SEO / PWA / legal surface

- Root `layout.tsx` + per-route metadata; workspace pages `robots: noindex`.
- `robots.ts`, `sitemap.ts`, `public/manifest.json`.
- Marketing: guide, privacy (GDPR/DPDP), terms, cookies, resources articles (`lib/articles.ts`), about, contact, refund.
- Cookie consent: `CookieConsent.tsx` + Consent Mode v2 for Analytics/AdSense.

### 2.8 Theme / design tokens

- CSS variables in `src/app/globals.css` for `.dark` / `.light` (GitHub-like palette).
- `next-themes` via `ThemeProvider`.
- Prefer tokens (`--text-main`, `--text-muted`, `--bg-main`, …) over hard-coded greys.
- Light muted text was audited as borderline AA — prefer darkening `--text-muted` in light theme when touching styles.

---

## 3. API surface (agents)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health |
| GET | `/api/pages/[slug]` | Page meta/content (empty content if locked without token) |
| PATCH | `/api/pages/[slug]/content` | Update notes + emit SSE |
| GET | `/api/pages/[slug]/events` | SSE |
| GET/DELETE | `/api/pages/[slug]/files` | List / delete file |
| POST | `/api/pages/[slug]/files/upload` | Multipart upload |
| POST | `/api/pages/[slug]/password` | Set/clear password |
| POST | `/api/pages/[slug]/verify` | Password → JWT |
| POST | `/api/pages/[slug]/rename` | Rename slug |
| POST | `/api/pages/create` | Explicit create (if used) |
| GET | `/api/uploads/[filename]` | Download/stream |

Always: rate-limit where existing routes do; authorize protected pages consistently with `verifyPageToken` + slug match.

---

## 4. Environment variables

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEFAULT_THEME=dark
JWT_SECRET=change-me-in-production

# Optional
DATABASE_URL=postgresql://...
B2_ENDPOINT=...
B2_KEY_ID=...
B2_APPLICATION_KEY=...
B2_BUCKET_NAME=...
B2_REGION=us-east-005
ALLOWED_DEV_ORIGINS=...
```

Production canonical host is forced in `src/lib/seo.ts` when `NODE_ENV=production` or URL contains `onrender.com`.

---

## 5. Coding conventions for changes

### Do

- Extend Zod schemas in `validators.ts` for new body shapes.
- Emit SSE events after any multi-client mutation (`content_updated` | `files_updated`).
- Keep upload streaming (busboy) — do not buffer entire 500 MB in memory.
- Use existing `showToast`, `Button`, `Modal` UI primitives.
- Match TypeScript strictness already in project; avoid `any` unless unavoidable at boundary.
- After edits: `npx tsc --noEmit` and `npx eslint .` on touched areas.

### Don’t

- Replace SSE with WebSockets without explicit architecture approval (multi-instance EventEmitter does not cross processes — document if scaling).
- Store JWTs in `localStorage` without product decision (currently session-only by design).
- Widen MIME allowlist carelessly (security).
- Break hybrid DB fallbacks when only testing PG locally.
- Add heavy editor deps (CodeMirror/Monaco) without size/perf review — current editor is textarea + preview.

### Multi-instance caveat

`pageEvents` is **process-local**. Multiple Render instances will not share SSE fan-out. Acceptable for current single-service deploy; for horizontal scale need Redis pub/sub or similar — out of scope unless requested.

---

## 6. CI / deploy

- **CI (`.github/workflows/ci.yml`):** `tsc --noEmit`, `eslint`, production build on `main`.
- **Render:** build `./deploy.sh`, start `npm start`; set env vars from README.
- **Agent rule still applies:** agents themselves should not run full `npm run build` in interactive loops; CI does.

---

## 7. Related project docs

| File | Role |
|------|------|
| `README.md` | Human setup & feature list |
| `MINT.md` | Product/architecture atlas, route map, data flows, known gaps |
| `task.md` | Prioritized fix backlog (UX, contrast, collab, vault) |

When implementing backlog items from `task.md`, update this file if architecture or agent constraints change.

---

## 8. Quick verification checklist (before finishing a task)

- [ ] Protected route still checks JWT slug match
- [ ] Mutation emits SSE when peers should update
- [ ] Zod validation on user input
- [ ] No new hard-coded theme colors (use CSS variables)
- [ ] `tsc --noEmit` clean for changed files
- [ ] Zero-registration path still works without login
- [ ] File size / MIME limits not accidentally removed