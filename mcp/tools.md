# FileShare MCP — Tool Reference

Proposed tool surface for the FileShare MCP server. Every tool maps 1:1 to an
existing REST route (source of truth: [`AGENTS.md` §3](../AGENTS.md)). The
server is a thin adapter — no direct DB access, no parallel validation stack.

Conventions used below:

| Column | Meaning |
|--------|---------|
| Auth | `none` = open; `Bearer if protected` = JWT required only when the page has a password |
| RL | Rate-limit class from `src/lib/rateLimiter.ts` (per IP, in-memory) |
| Errors | Canonical HTTP status the tool should surface as an MCP error |

---

## 1. Workspaces (pages)

### `fs_create_page`

Create a workspace (or report that the slug is taken).

- **API:** `POST /api/pages/create`
- **Auth:** none
- **RL:** general (300 / 60 s)
- **Input:**

```jsonc
{
  "slug": "string (3–48, ^[a-z0-9]+(-[a-z0-9]+)*$)",
  "password": "string (6–128) | optional"
}
```

- **Output:** `201 { slug, content, isProtected, createdAt, updatedAt }` or `200 { exists: true }`
- **Errors:** `422` Zod validation · `409` reserved/exists (rename path)

### `fs_check_slug`

Slug availability (used before create/rename).

- **API:** `GET /api/pages/create?slug=…`
- **Auth:** none · **RL:** general
- **Input:** `{ "slug": "string" }`
- **Output:** `{ "available": boolean }`

### `fs_get_page`

Read a workspace's meta and content.

- **API:** `GET /api/pages/[slug]`
- **Auth:** Bearer if protected (valid token returns full content; missing/invalid returns locked view `{ slug, content: "", isProtected: true }`)
- **RL:** general
- **Input:** `{ "slug": "string", "token": "string | optional" }`
- **Output:** full page object, or locked view for protected pages without a token
- **Errors:** `404` missing · `401` (events/SSE path only; GET page degrades to locked view)

### `fs_update_content`

Replace the Markdown notes for a page and emit `content_updated` to SSE peers.

- **API:** `PATCH /api/pages/[slug]/content`
- **Auth:** Bearer if protected
- **RL:** general
- **Input:**

```jsonc
{
  "slug": "string",
  "content": "string (max 500000 chars)",
  "clientId": "string (max 64, optional — echoes to SSE so the sender can ignore its own echo)",
  "token": "string | optional"
}
```

- **Output:** updated page object
- **Errors:** `404` missing · `401` bad/expired token · `422` content too large

### `fs_rename_page`

Rename a slug. Writes a `redirects` row; old slug 307-redirects via
`s/[slug]/page.tsx`. No SSE emit; no fresh token returned (old tokens remain
scoped to the old slug — re-verify after rename).

- **API:** `PATCH /api/pages/[slug]/rename`
- **Auth:** Bearer if protected
- **RL:** general
- **Input:** `{ "slug": "string", "newSlug": "string (slugSchema)", "token": "string | optional" }`
- **Output:** rename result (new slug)
- **Errors:** `404` missing · `409` target exists or reserved · `401`

### `fs_delete_page`

Delete a workspace and all of its files (FK `ON DELETE CASCADE`).

- **API:** `DELETE /api/pages/[slug]`
- **Auth:** Bearer if protected
- **RL:** general
- **Input:** `{ "slug": "string", "token": "string | optional" }`
- **Output:** `{ "success": true }`
- **Errors:** `404` · `401`

---

## 2. Passwords & sessions

### `fs_set_password`

Set or clear a page password. Token required only if the page is **already**
protected. Hashing is bcryptjs cost 12 on the server.

- **API:** `PATCH /api/pages/[slug]/password`
- **Auth:** Bearer if already protected
- **RL:** sensitive (30 / 60 s) — bcrypt-heavy
- **Input:** `{ "slug": "string", "password": "string (6–128) | null", "token": "string | optional" }`
  - non-null → protect · `null` → clear
- **Output:** updated meta (`isProtected` flag)
- **Errors:** `404` · `401` · `422`

### `fs_verify_password`

Exchange a password for a 24 h JWT. Uniform `401` on any failure (no
existence oracle). **Never log or persist the password argument.**

- **API:** `POST /api/pages/[slug]/verify`
- **Auth:** none (password is the credential)
- **RL:** **verify** (5 / 60 s) — strict
- **Input:** `{ "slug": "string", "password": "string (min 1, max 128)" }`
- **Output:** `{ "token": "string (HS256, 24h, payload { slug })" }`
- **Errors:** `401` invalid password or missing page · `429` verify budget exhausted

---

## 3. File vault

### `fs_list_files`

List files for a workspace.

- **API:** `GET /api/pages/[slug]/files`
- **Auth:** Bearer if protected
- **RL:** general
- **Input:** `{ "slug": "string", "token": "string | optional" }`
- **Output:** array of file records; `uploadedAt` is `{ seconds, nanoseconds }` (Firestore-style timestamp)

### `fs_upload_file`

Upload one file (≤ 500 MB, MIME allowlist enforced). Header-only auth —
`?token=` is **not** accepted on this route. Stream the body; do not buffer.

- **API:** `POST /api/pages/[slug]/files/upload`
- **Auth:** Bearer if protected (header only)
- **RL:** **upload** (12 / 600 s) + general
- **Input:** multipart form — file bytes + optional metadata; must satisfy `uploadRequestSchema`:

```jsonc
{
  "filename": "string (1–255)",
  "mimetype": "string (must be in ALLOWED_MIME_TYPES)",
  "size": "int > 0, max 524288000 (500 MB)"
}
```

- **Output:** uploaded file metadata (fileId, names, size, mimetype, uploadedAt); emits `files_updated`
- **Errors:** `413` / `422` too large or MIME not allowed · `401` · `429` upload budget

**Allowed MIME types** (`ALLOWED_MIME_TYPES` in `src/lib/validators.ts`):

| Category | Types |
|----------|-------|
| Images | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`, `image/bmp`, `image/x-icon`, `image/vnd.microsoft.icon` |
| Documents | `application/pdf`, `text/plain`, `text/csv`, `text/markdown`, `application/json` |
| Archives | `application/zip`, `application/x-zip-compressed`, `application/x-rar-compressed`, `application/x-tar`, `application/gzip`, `application/x-7z-compressed` |
| Office | `…wordprocessingml.document`, `…spreadsheetml.sheet`, `…presentationml.presentation` |
| Audio | `audio/mpeg`, `audio/wav`, `audio/x-wav`, `audio/ogg`, `audio/flac`, `audio/x-flac`, `audio/mp4` |
| Video | `video/mp4`, `video/webm`, `video/quicktime`, `video/x-msvideo`, `video/x-matroska` |

### `fs_delete_file`

Delete one file scoped by `fileId` + `slug`; cleans B2/local storage and emits
`files_updated`.

- **API:** `DELETE /api/pages/[slug]/files/[id]`
- **Auth:** Bearer if protected
- **RL:** general
- **Input:** `{ "slug": "string", "fileId": "string", "token": "string | optional" }`
- **Output:** deletion result
- **Errors:** `404` · `401`

### `fs_download_file`

Fetch/stream a stored file by `storedName`. Supports Range; local disk first,
B2 fallback.

- **API:** `GET /api/uploads/[filename]`
- **Auth:** Bearer or `?token=` if the owning page is protected
- **RL:** general
- **Input:** `{ "filename": "string (storedName)", "token": "string | optional" }`
- **Output:** binary stream + content-type / content-length / range headers
- **Errors:** `404` · `401`

> MCP hosts that cannot return raw binaries should surface a short-lived
> signed/authorized URL or a resource URI (see [`resources.md`](./resources.md))
> rather than inlining file bytes into the model context.

---

## 4. Real-time

### `fs_subscribe_page` *(optional — only if the MCP host supports subscriptions)*

Bridge the per-slug SSE stream into MCP notifications.

- **API:** `GET /api/pages/[slug]/events` (SSE)
- **Auth:** Bearer or `?token=` if protected (EventSource cannot set headers)
- **RL:** none on the API route — the MCP server must still throttle fan-out
- **Input:** `{ "slug": "string", "token": "string | optional" }`
- **Notifications:**

| SSE event | Payload | Meaning |
|-----------|---------|---------|
| `connected` | — | stream established |
| `message` / `content_updated` | `{ type: "content_updated", content: string, clientId?: string }` | notes changed; ignore if `clientId` matches the tool caller |
| `message` / `files_updated` | `{ type: "files_updated" }` | vault changed; call `fs_list_files` |
| comment ping | `: ping` every 10 s | keep-alive |

- **Fallback:** if no subscription support, expose a poll tool at ≥ 12 s
  interval (matches the app's `usePageContent` fallback poll).

---

## 5. System

### `fs_health`

Liveness probe for the target instance.

- **API:** `GET /api/health`
- **Auth:** none · **RL:** none
- **Output:** `{ status, timestamp, uptime }` (`Cache-Control: no-store`)

---

## 6. Tool design rules

1. **Thin adapter.** Call the REST routes above; do not import `src/lib/db.ts`
   or reimplement bcrypt/JWT in the MCP process.
2. **Validate early, trust the API.** Mirror Zod limits in tool input schemas
   for fast feedback, but treat API `422` as the final word.
3. **Slug-scope tokens.** A token from `fs_verify_password` works only for its
   slug. Do not build a cross-slug session store.
4. **Secrets hygiene.** Passwords are ephemeral tool arguments — never write
   them to logs, resource caches, or conversation transcripts.
5. **Surface rate limits.** On `429`, propagate `Retry-After` (always `60` s
   from the API) into the tool error; never auto-retry in a tight loop.
6. **Streaming uploads.** Forward multipart bodies as streams; memory must
   stay flat at the 500 MB ceiling.
7. **Error mapping:** API status → MCP error code; keep the API's `error`
   string in the message so behavior matches the product.
