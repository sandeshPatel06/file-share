# FileShare — MINT (Map · Implementation · Notes · Truth)

Human- and agent-readable **project atlas** for FileShare after a full source deep-read.

| Field | Value |
|-------|--------|
| Repo | `sandeshPatel06/file-share` |
| Live | https://fileshare.shptechnology.online |
| Stack | Next.js 16 App Router · React 19 · TS · Tailwind 4 · PG/SQLite · B2 · SSE |
| Version pin | `package.json` → `next@16.2.4`, `react@19.2.4` |
| Companion docs | `AGENTS.md` (agent rules) · `task.md` (fix backlog) · `README.md` (setup) |

**MINT =** Map of the product, Implementation truth from code (not marketing), Notes for contributors, known Truth gaps.

---

## 1. Product in one paragraph

FileShare creates **anonymous workspaces** at `/s/{slug}`. Anyone with the URL can edit **GitHub-Flavored Markdown** (live preview, Mermaid, task toggles) and upload files up to **500 MB**. Changes broadcast via **Server-Sent Events**. Optional **bcrypt password** gates the space; unlock issues a **24h JWT** stored in **sessionStorage**. No accounts. Storage is **local disk and/or Backblaze B2**; metadata in **PostgreSQL or SQLite**.

---

## 2. User journeys

### 2.1 Create / open space

1. Land on `/` → enter custom slug or **Random Space** (`generateSlug()` → `adj-noun-NN`).
2. Navigate to `/s/{slug}`.
3. Server validates slug (`slugSchema`); if missing row → insert starter Markdown template.
4. `SharePage` renders editor + file panel (or `PasswordGate` if locked).

### 2.2 Collaborate on notes

1. Type in left textarea (write / split / preview modes).
2. Local state updates immediately; `touchLocalEdit()` stamps time.
3. Debounced `PATCH /api/pages/{slug}/content` persists + `pageEvents.emit(content_updated)`.
4. Peers’ `EventSource` applies remote text **only if** they have not typed in the last ~1.5–2s.
5. Fallback: poll GET page every 12s if SSE dead.

### 2.3 Share / protect / handoff

- **Copy link** / **QR** (`QRCodeModal`) for device handoff.
- **Protect** → `PasswordModal` → password API (hash stored; never plaintext).
- **Unlock** → verify API → JWT → `sessionStorage['token:'+slug]`.
- Tab close ⇒ token gone ⇒ re-enter password.

### 2.4 Files

1. Drag-drop or browse in `FilePanel`.
2. XHR POST upload with **progress % and speed**.
3. Server streams via busboy → disk → optional B2 → DB row → SSE `files_updated`.
4. Preview modal for common media; download via `/api/uploads/{storedName}`.

### 2.5 Export notes (not full vault ZIP yet)

From editor: Markdown / TXT / JSON / HTML / print. **Full notes+files ZIP** is a backlog item (`task.md`).

---

## 3. Route map

### App pages

| Route | Role |
|-------|------|
| `/` | Landing, launcher, FAQ schema, featured resources |
| `/s/[slug]` | Workspace (noindex) |
| `/guide` | User documentation |
| `/privacy` `/terms` `/cookies` `/refund` | Legal |
| `/about` `/contact` | Company / support |
| `/resources` `/resources/[slug]` | Editorial articles (`lib/articles.ts`) |
| `/blog` | Blog index (if populated) |
| `/api/*` | See AGENTS.md API table |

### Important API behaviors

- **GET page** while protected + no token → `content: ""` (metadata may still leak `isProtected`).
- **Rename** updates `pages.slug` and `files.slug`; if target exists → `{ redirected: true }` without overwrite. **No HTTP redirect from old slug** (gap).
- **SSE on protected space** accepts `Authorization` or `?token=`.

---

## 4. Data model (truth)

```
pages
  slug            TEXT/VARCHAR PK
  content         TEXT
  isProtected     INT 0|1
  passwordHash    TEXT NULL
  createdAt       timestamp
  updatedAt       timestamp

files
  fileId          TEXT PK
  slug            FK → pages.slug  ON UPDATE CASCADE ON DELETE CASCADE
  originalName    TEXT
  storedName      TEXT   # on-disk / B2 key
  mimetype        TEXT
  size            INT/BIGINT
  downloadURL     TEXT   # typically /api/uploads/{storedName}
  uploadedAt      timestamp
```

**Provisioning:** first hit to a new slug creates the page with starter content (SSR path) or empty via API `INSERT OR IGNORE`.

**Retention (product copy):** inactive spaces may be pruned ~30 days — **no automated prune job found in repo**; treat as policy/ops unless implemented later.

---

## 5. Core modules (implementation notes)

### `src/lib/db.ts`

- Single abstraction: `db.prepare(sql).get|run|all`.
- PG identifier quoting + `ON CONFLICT` translation for inserts.
- Serverless detection → base dir `/tmp`.
- Memory store if SQLite native module fails.

### `src/lib/events.ts`

- Process-local `EventEmitter`. **Not multi-instance safe.**

### `src/lib/jwt.ts`

- `jose` `SignJWT` / `jwtVerify`, HS256, 24h, payload `{ slug }`.
- Fallback secret string only for dev — production **must** set `JWT_SECRET`.

### `src/lib/b2.ts`

- Optional; `hasB2Storage()` gates uploads/downloads.
- Put/Get/Delete via `@aws-sdk/client-s3` against B2 endpoint.

### `src/lib/validators.ts`

- Slug, password, content max 500k, rename, MIME allowlist (images, pdf, text, zip, common office/code types — read file before expanding).

### `src/lib/rateLimiter.ts`

- `rate-limiter-flexible` **memory** (resets on process restart; not shared across instances).

### `src/hooks/usePageContent.ts`

- SSR initial content supported.
- SSE + local-edit suppression + 12s fallback poll.
- Skips fetch when `document.hidden`.

### `src/components/TextEditor.tsx` (~1.4k LOC)

- View modes: write | preview | split; zen mode; templates; AI format; toolbar shortcuts; export menu; task checkbox sync from preview → source.
- Debounced PATCH with Bearer token when present.

### `src/components/FilePanel.tsx`

- Categories, grid/list, search, **upload progress list**, drag-drop.
- Auth header on XHR when token present.

### `src/components/ui/CookieConsent.tsx`

- Full consent UI; can dominate mobile viewport (UX backlog).

### `src/middleware.ts`

- Host rewrite only for legacy Render subdomain → canonical domain.

---

## 6. Security model (honest)

| Claim in marketing | Code truth |
|--------------------|------------|
| Password-protected | Yes — bcrypt + JWT gate on APIs/SSE/uploads |
| Encrypted vault | Transport TLS + B2 at-rest; **not** client-side E2E |
| Zero registration | Yes |
| Ephemeral | Policy-oriented; prune not in application code |
| Rate limited | Yes, per-process memory limits |

Threat notes for implementers:

- Public slug = public edit unless locked.
- Guessable custom slugs are a feature; random slugs are harder to brute.
- MIME allowlist reduces executable upload risk; not a full AV pipeline.
- Content is readable by server operators and anyone with DB/B2 access.

---

## 7. Design system snapshot

Defined in `src/app/globals.css`:

**Dark (default marketing feel)**

- `--bg-main: #0d1117`
- `--text-main: #e6edf3`
- `--text-muted: #9da7b3`
- Accent greens `#238636` / `#3fb950`

**Light**

- `--bg-main: #f6f8fa`
- `--text-main: #1f2328`
- `--text-muted: #57606a` ← borderline for small text (see `task.md`)

Focus: `:focus-visible` outline on accent. `prefers-reduced-motion` disables micro-animations.

Fonts: Plus Jakarta Sans (UI), JetBrains Mono (code).

---

## 8. Deploy topology

```
Browser
  → fileshare.shptechnology.online (canonical)
  → Next.js on Render (or local)
       → PostgreSQL (DATABASE_URL) or SQLite file
       → uploads/ disk and/or Backblaze B2
       → in-process pageEvents (SSE)
```

`deploy.sh` + `render.yaml` + env list in README. CI runs typecheck, eslint, build on `main`.

---

## 9. Known gaps (code-backed)

Aligned with `task.md`; listed here as **truth**, not wishes:

1. **Collab:** LWW + debounce window ≠ OT/CRDT; collisions possible.
2. **SSE scale:** single Node process EventEmitter.
3. **Rename:** no permanent redirect from old slug.
4. **Export:** notes formats yes; **all files ZIP** no.
5. **Recent spaces:** no first-class local history UI.
6. **Token lifetime UX:** sessionStorage only — mobile friction after background kill.
7. **Cookie banner:** large first-paint intrusion on mobile.
8. **Light muted contrast:** secondary text softer than ideal.
9. **Prune job:** retention messaging without matching in-repo cron.
10. **Multi-instance rate limit / SSE:** memory-local.

---

## 10. Contributor playbook

### Safe first tasks

- Token/contrast CSS in `globals.css`
- CookieConsent layout compact mode
- Footer typography on `SharePage`
- Touch target spacing on `SlugBar`
- Export ZIP endpoint + FilePanel button
- Recent slugs in `localStorage` on `LandingPage`

### Risky tasks (design first)

- CRDT / Yjs integration
- Redis-backed SSE
- E2E encryption
- Mandatory accounts

### Verification

```bash
npm install
npm run dev
npx tsc --noEmit
npx eslint .
```

Manual: two browsers same `/s/test-collab`, lock/unlock flow, upload > few MB with progress, light/dark toggle, mobile width 375px.

---

## 11. File ownership cheat sheet

| Concern | Primary files |
|---------|----------------|
| Auth JWT | `lib/jwt.ts`, `password/route`, `verify/route`, `SharePage` |
| Live text | `hooks/usePageContent.ts`, `content/route.ts`, `events/route.ts`, `TextEditor.tsx` |
| Files | `FilePanel.tsx`, `files/upload/route.ts`, `uploads/[filename]/route.ts`, `lib/b2.ts` |
| DB | `lib/db.ts` only |
| Slugs | `validators.ts`, `slugGenerator.ts`, `rename/route.ts`, `s/[slug]/page.tsx` |
| SEO host | `lib/seo.ts`, `middleware.ts`, `layout.tsx` |
| Consent/ads | `CookieConsent.tsx`, `ads/*`, `layout.tsx` |
| Theme | `globals.css`, `ThemeProvider.tsx`, `ThemeToggle.tsx` |

---

## 12. Changelog duty

When you change behavior that this atlas describes (auth storage, SSE payload shapes, max upload size, slug rules, DB columns), **update MINT.md and AGENTS.md in the same PR**.

---
