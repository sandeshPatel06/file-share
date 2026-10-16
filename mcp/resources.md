# FileShare MCP — Resource Reference

Proposed resource surface for the FileShare MCP server. Resources give MCP
clients read access to workspace state via stable `fileshare://` URIs.
Mutations go through the tools in [`tools.md`](./tools.md) — resources are
read-only unless the host explicitly supports resource templates for writes.

---

## 1. URI scheme

```
fileshare://page/<slug>              → workspace meta + Markdown content
fileshare://page/<slug>/meta         → meta only (no content)
fileshare://page/<slug>/files        → JSON listing of the file vault
fileshare://file/<slug>/<fileId>     → one file record (metadata)
fileshare://file/<slug>/<storedName> → file binary (download)
fileshare://events/<slug>            → live subscription handle (SSE bridge)
fileshare://health                   → instance health snapshot
```

Rules:

- `<slug>` must satisfy `slugSchema`: 3–48 chars, `^[a-z0-9]+(-[a-z0-9]+)*$`.
- `<fileId>` is the UUID primary key from the `files` table.
- `<storedName>` is the on-disk / B2 object key (use the API route
  `GET /api/uploads/[filename]` under the hood for binary reads).
- URIs are opaque to clients; only the server interprets them.

---

## 2. Resource catalog

### `fileshare://page/<slug>`

Workspace document — meta plus full Markdown content.

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/pages/[slug]` |
| MIME | `text/markdown` (content) with a JSON meta preamble, or `application/json` containing `{ meta, content }` — pick one and document it in the server README |
| Auth | Bearer if protected; without a valid token the API returns the locked view `{ slug, content: "", isProtected: true }` |
| Caching | Suggested: revalidate on `content_updated` or ≥ 12 s poll (matches app fallback) |

**Locked-page behavior:** if the page is protected and no token is available,
return the locked view rather than an error, mirroring the REST GET so MCP and
HTTP clients see the same shape.

### `fileshare://page/<slug>/meta`

Meta only — cheap listing/preview resource.

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/pages/[slug]` (or a meta-only helper if one is added later) |
| MIME | `application/json` |
| Fields | `slug`, `isProtected`, `createdAt`, `updatedAt` (no content, no `passwordHash`) |
| Auth | Same as page resource |

### `fileshare://page/<slug>/files`

JSON listing of the vault for a workspace.

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/pages/[slug]/files` |
| MIME | `application/json` |
| Shape | Array of `{ fileId, originalName, storedName, mimetype, size, downloadURL, uploadedAt }`; `uploadedAt` is `{ seconds, nanoseconds }` |
| Auth | Bearer if protected |
| Caching | Revalidate on `files_updated` or ≥ 12 s poll (matches `useFileList`) |

### `fileshare://file/<slug>/<fileId>`

Metadata for a single file record.

| Aspect | Behavior |
|--------|----------|
| Backing API | derived from `GET /api/pages/[slug]/files` (filter by `fileId`) |
| MIME | `application/json` |
| Auth | Bearer if the owning page is protected |
| Errors | `404` if `fileId` is not scoped to `<slug>` |

### `fileshare://file/<slug>/<storedName>`

Binary download of a stored file.

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/uploads/[filename]` |
| MIME | the file's stored `mimetype` |
| Auth | Bearer or `?token=` if the page is protected |
| Streaming | Support Range; forward `Content-Length` / `Content-Range`; local disk first, B2 fallback is handled API-side |
| Size | Up to 500 MB — clients should prefer a URL or partial read over inlining bytes into model context |

### `fileshare://events/<slug>`

Live subscription handle (only if the MCP host supports resource subscribe).

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/pages/[slug]/events` (SSE) |
| Protocol | MCP subscribe → server opens SSE; `connected` / `message` / 10 s `: ping` |
| Payloads | `content_updated { type, content, clientId? }`, `files_updated { type }` |
| Auth | Bearer or `?token=` if protected |
| Caveat | SSE fan-out is process-local (`pageEvents` EventEmitter); no cross-instance delivery on multi-instance deploys |

### `fileshare://health`

Instance liveness snapshot.

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/health` |
| MIME | `application/json` |
| Shape | `{ status, timestamp, uptime }` |
| Auth | none |

---

## 3. Resource templates

For hosts that support template discovery, advertise:

| Template | URI pattern | Description |
|----------|-------------|-------------|
| Page | `fileshare://page/{slug}` | Workspace meta + content |
| Page meta | `fileshare://page/{slug}/meta` | Meta only |
| Vault listing | `fileshare://page/{slug}/files` | File list JSON |
| File meta | `fileshare://file/{slug}/{fileId}` | One file record |
| File binary | `fileshare://file/{slug}/{storedName}` | Download stream |
| Events | `fileshare://events/{slug}` | Live SSE bridge |

`{slug}` validates against `slugSchema`; `{fileId}` and `{storedName}` are
opaque strings resolved server-side.

---

## 4. Auth & token handling for resources

1. Resources with a `token` parameter accept the same HS256 JWT minted by
   `fs_verify_password` (24 h, payload `{ slug }`).
2. Tokens are **slug-scoped**: a token for `alpha` must be rejected for `beta`
   resources (`payload.slug` must match the URI slug).
3. Never cache a resource body for a protected page beyond the token's
   lifetime; drop cached content when the token expires.
4. Do not put tokens in the URI path — pass them as headers or a server-side
   session lookup so URIs stay shareable/loggable without leaking credentials.

---

## 5. Content types & size ceilings

| Resource | MIME | Ceiling |
|----------|------|---------|
| page / content | `text/markdown` or `application/json` | 500 000 chars (`updateContentSchema`) |
| meta / files / health | `application/json` | small (listing sizes) |
| file binary | stored `mimetype` (allowlist) | 500 MB (`MAX_FILE_SIZE`) |

---

## 6. Caching & invalidation

| Trigger | Invalidate |
|---------|------------|
| `content_updated` SSE | `fileshare://page/<slug>`, `…/meta` |
| `files_updated` SSE | `fileshare://page/<slug>/files`, `…/file/…` |
| `fs_rename_page` | all resources under the old and new slug |
| `fs_delete_page` | all resources under the slug |
| Token expiry | any protected resource cached with that token |

Without SSE, poll no faster than the app fallback: **12 s** for content,
matching `usePageContent` / `useFileList`.

---

## 7. Implementation notes

- Resources are a read projection of the same REST routes tools call — do not
  add a second query path into `src/lib/db.ts`.
- Binary resources must stream; never buffer a full 500 MB body in the MCP
  process just to return it as a resource.
- When a host cannot render binaries, return the meta resource plus a
  download tool invocation instead of inlining bytes.
- Respect rate-limit classes even for reads: general **300 / 60 s / IP**.
- Redact `passwordHash` and any token material from every resource body.
