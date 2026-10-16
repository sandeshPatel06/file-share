# FileShare MCP — Tool Reference

Proposed tool surface for the FileShare MCP server: **13 core tools + 1
optional** (`fs_subscribe_page`). Every tool maps 1:1 to an existing REST
route (source of truth: [`AGENTS.md` §3](../AGENTS.md)). The server is a thin
adapter — no direct DB access, no parallel validation stack.

**Session model:** tools take **no `token` argument**. The server holds an
in-memory `slug → JWT` map filled by `fs_verify_password` (see
[`README.md` §3](./README.md)). Every request to the API attaches
`Authorization: Bearer <map.get(slug)>` server-side.

Conventions used below:

| Column | Meaning |
|--------|---------|
| Auth | `none` = open; `session` = server attaches Bearer from the in-memory map when the page is protected |
| RL | Rate-limit class from `src/lib/rateLimiter.ts` (per IP, in-memory) |
| Errors | Canonical HTTP status the tool should surface as an MCP error |

---

## 1. Workspaces (pages)

### `fs_create_page`

Create a workspace (or report that the slug is taken).

- **API:** `POST /api/pages/create`
- **Auth:** none
- **RL:** **sensitive** (30 / 60 s) — route may bcrypt-hash (cost 12)
- **Input:**

```jsonc
{
  "slug": "string (3–48, ^[a-z0-9]+(-[a-z0-9]+)*$)",
  "password": "string (6–128) | optional"
}
```

- **Output:** `201 { slug }` on create · `200 { slug, exists: true }` if the
  slug is already taken (not an error)
- **Errors:** `422` Zod validation · `500` storage failure

### `fs_check_slug`

Slug availability (used before create/rename).

- **API:** `GET /api/pages/create?slug=…`
- **Auth:** none · **RL:** general (300 / 60 s)
- **Input:** `{ "slug": "string" }`
- **Output:** `{ "available": boolean }`

### `fs_get_page`

Read a workspace's meta and content.

- **API:** `GET /api/pages/[slug]`
- **Auth:** `session` (valid session returns full content; missing/expired
  session on a protected page returns the locked view
  `{ slug, content: "", isProtected: true }` — not an error)
- **RL:** general
- **Input:** `{ "slug": "string" }`
- **Output:** full page object, or locked view for protected pages without a session
- **Errors:** `404` missing

### `fs_update_content`

Replace the Markdown notes for a page and emit `content_updated` to SSE peers.

- **API:** `PATCH /api/pages/[slug]/content`
- **Auth:** `session`
- **RL:** general
- **Input:**

```jsonc
{
  "slug": "string",
  "content": "string (max 500000 chars)",
  "clientId": "string (max 64, optional — echoes to SSE so the sender can ignore its own echo)"
}
```

- **Output:** updated page object
- **Errors:** `404` missing · `401` bad/expired session · `422` content too large

### `fs_rename_page`

Rename a slug. Writes a `redirects` row; old slug 307-redirects via
`s/[slug]/page.tsx`. No SSE emit; no fresh token is minted — delete the
session entry for the old slug and re-verify against the new one.

- **API:** `PATCH /api/pages/[slug]/rename`
- **Auth:** `session`
- **RL:** general
- **Input:** `{ "slug": "string", "newSlug": "string (slugSchema)" }`
- **Output:** `{ newSlug }` on success · `{ newSlug, redirected: true }` if the
  target slug already exists (the API does not overwrite; it reports the
  redirect state — treat as a soft failure, not a 409)
- **Errors:** `404` missing · `401` · `422`

### `fs_delete_page`

Delete a workspace and all of its files (FK `ON DELETE CASCADE`).

- **API:** `DELETE /api/pages/[slug]`
- **Auth:** `session`
- **RL:** general
- **Input:** `{ "slug": "string" }`
- **Output:** `{ "success": true }`
- **Errors:** `404` · `401`

---

## 2. Passwords & sessions

### `fs_set_password`

Set or clear a page password. Session required only if the page is **already**
protected. Hashing is bcryptjs cost 12 on the API side.

- **API:** `PATCH /api/pages/[slug]/password`
- **Auth:** `session` (only if already protected)
- **RL:** sensitive (30 / 60 s) — bcrypt-heavy
- **Input:** `{ "slug": "string", "password": "string (6–128) | null" }`
  - non-null → protect · `null` → clear
- **Output:** updated meta (`isProtected` flag)
- **Errors:** `404` · `401` · `422`

### `fs_verify_password`

Exchange a password for a 24 h JWT and **store it in the server session
map**. The JWT is not returned to the model. Uniform `401` on any failure
(no existence oracle).

> Passwords enter the model's context when passed as tool arguments — that is
> inherent to the protocol. Where the host supports **MCP elicitation**,
> prompt the user out-of-band instead of accepting a tool argument. Never log
> or persist the password.

- **API:** `POST /api/pages/[slug]/verify`
- **Auth:** none (password is the credential)
- **RL:** **verify** (5 / 60 s) — strict
- **Input:** `{ "slug": "string", "password": "string (min 1, max 128)" }`
- **Output:** `{ "authenticated": true, "expiresIn": 86400 }` — token is held
  server-side only
- **Errors:** `401` invalid password or missing page · `429` verify budget exhausted

---

## 3. File vault

### `fs_list_files`

List files for a workspace.

- **API:** `GET /api/pages/[slug]/files`
- **Auth:** `session`
- **RL:** general
- **Input:** `{ "slug": "string" }`
- **Output:** array of file records; `uploadedAt` is `{ seconds, nanoseconds }` (Firestore-style timestamp)

### `fs_upload_file`

Upload one file (≤ 500 MB, MIME allowlist enforced). Header-only auth on the
API — `?token=` is **not** accepted on this route.

MCP tool arguments are JSON, so raw bytes cannot pass through them. The tool
takes a **local path or URL**; the server opens the stream and forwards it as
multipart. The server derives `filename`, `mimetype`, and `size` from the
source (path basename / HTTP headers / `stat`) — the model does not fill
`uploadRequestSchema` fields.

- **API:** `POST /api/pages/[slug]/files/upload`
- **Auth:** `session` (header only)
- **RL:** **upload** (12 / 600 s) + general
- **Input:**

```jsonc
{
  "slug": "string",
  "path": "string — local filesystem path readable by the MCP server | optional",
  "url": "string — http(s) URL the server can fetch | optional"
}
// Exactly one of path | url must be present.
```

- **Output:** uploaded file metadata (fileId, names, size, mimetype, uploadedAt); emits `files_updated`
- **Errors:** `400` neither/both of path/url · `413` / `422` too large or MIME not allowed · `401` · `429` upload budget

**Allowed MIME types** (`ALLOWED_MIME_TYPES` in `src/lib/validators.ts`):

| Category | Types |
|----------|-------|
| Images | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`, `image/bmp`, `image/x-icon`, `image/vnd.microsoft.icon` |
| Documents | `application/pdf`, `text/plain`, `text/csv`, `text/markdown`, `application/json` |
| Archives | `application/zip`, `application/x-zip-compressed`, `application/x-rar-compressed`, `application/x-tar`, `application/gzip`, `application/x-7z-compressed` |
| Office | `…wordprocessingml.document`, `…spreadsheetml.sheet`, `…presentationml.presentation` |
| Audio | `audio/mpeg`, `audio/wav`, `audio/x-wav`, `audio/ogg`, `audio/flac`, `audio/x-flac`, `audio/mp4` |
| Video | `video/mp4`, `video/webm`, `video/quicktime`, `video/x-msvideo`, `video/x-matroska` |

> `image/svg+xml` is on the allowlist; if `/api/uploads/*` serves it inline
> from the app origin this is a stored-XSS risk. Flag for a separate security
> review — out of scope for these docs.

### `fs_delete_file`

Delete one file scoped by `fileId` + `slug`; cleans B2/local storage and emits
`files_updated`.

- **API:** `DELETE /api/pages/[slug]/files/[id]`
- **Auth:** `session`
- **RL:** general
- **Input:** `{ "slug": "string", "fileId": "string" }`
- **Output:** deletion result
- **Errors:** `404` · `401`

### `fs_download_file`

Fetch a stored file and return its bytes to the host. Supports Range on the
API side; local disk first, B2 fallback.

There is **no short-lived signed URL** in the product — the only URL-based
auth is `?token=` with a 24 h JWT, which would put a long-lived credential in
a URL (and contradict [`resources.md` §4](./resources.md)). Therefore: the
MCP server streams bytes through itself using the in-session token as a
Bearer header. Never place a JWT in a query string.

- **API:** `GET /api/uploads/[filename]`
- **Auth:** `session`
- **RL:** general
- **Input:** `{ "slug": "string", "fileId": "string" }` — server resolves `fileId` → `storedName` via the files listing
- **Output:** binary content + content-type (hosts that cannot render binaries should surface the file meta resource instead of inlining bytes)
- **Errors:** `404` · `401`

---

## 4. Real-time

### `fs_subscribe_page` *(optional — only if the MCP host supports subscriptions)*

Bridge the per-slug SSE stream into MCP notifications.

- **API:** `GET /api/pages/[slug]/events` (SSE)
- **Auth:** `session` (API also accepts `?token=` since EventSource cannot set headers; the MCP server uses its own HTTP client and can set the Bearer header)
- **RL:** none on the API route — the MCP server must still throttle fan-out
- **Input:** `{ "slug": "string" }`
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

Liveness probe for the target instance. This is the **only** health surface —
there is no `fileshare://health` resource.

- **API:** `GET /api/health`
- **Auth:** none · **RL:** none
- **Output:** `{ status, timestamp, uptime }` (`Cache-Control: no-store`)

---

## 6. Tool design rules

1. **Thin adapter.** Call the REST routes above; do not import `src/lib/db.ts`
   or reimplement bcrypt/JWT in the MCP process.
2. **Validate early, trust the API.** Mirror Zod limits in tool input schemas
   for fast feedback, but treat API `422` as the final word.
3. **In-memory sessions only.** The `slug → token` map (README §3) is the
   sole session store — per-process, per-slug, never persisted. Do not build
   a cross-slug or multi-user session layer.
4. **Secrets hygiene.** Passwords are ephemeral tool arguments — never write
   them to logs or resource caches. Prefer MCP elicitation where the host
   supports it. JWTs never leave the server process.
5. **Surface rate limits.** On `429`, propagate the API's `Retry-After`
   header as-is (the API hardcodes `60` for every limiter, including the
   600 s upload window — see README §9); never auto-retry in a tight loop.
6. **Streaming uploads.** Open the source path/URL and forward the body as a
   stream; memory must stay flat at the 500 MB ceiling.
7. **Error mapping:** API status → MCP error code; keep the API's `error`
   string in the message so behavior matches the product.
