# FileShare MCP — Resource Reference

Proposed resource surface for the FileShare MCP server. Resources give MCP
clients read access to workspace state via stable `fileshare://` URIs.
Mutations go through the tools in [`tools.md`](./tools.md) — resources are
read-only unless the host explicitly supports resource templates for writes.

**Session model:** resources authenticate via the server's in-memory
`slug → JWT` map (see [`README.md` §3](./README.md)). URIs never carry
tokens.

---

## 1. URI scheme

```
fileshare://page/<slug>                    → workspace meta + content (JSON)
fileshare://page/<slug>/meta               → meta only (no content)
fileshare://page/<slug>/files              → JSON listing of the file vault
fileshare://file/<slug>/<fileId>/meta      → one file record (metadata)
fileshare://file/<slug>/<fileId>/content   → file binary (download)
fileshare://events/<slug>                  → live subscription handle (SSE bridge)
```

Rules:

- `<slug>` must satisfy `slugSchema`: 3–48 chars, `^[a-z0-9]+(-[a-z0-9]+)*$`.
- `<fileId>` is the UUID primary key from the `files` table. The trailing
  `/meta` or `/content` segment disambiguates the two file resources — there
  is no bare `…/<fileId>` or `…/<storedName>` form. The server resolves
  `fileId` → `storedName` internally; clients never see stored names in URIs.
- URIs are opaque to clients; only the server interprets them.

---

## 2. Resource catalog

### `fileshare://page/<slug>`

Workspace document — meta plus full Markdown content.

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/pages/[slug]` |
| MIME | `application/json` — body is `{ meta: { slug, isProtected, createdAt, updatedAt }, content: string }` |
| Auth | Session (in-memory map); without a valid token the API returns the locked view `{ slug, content: "", isProtected: true }` — surface that as the resource body, not an error |
| Caching | Revalidate on `content_updated` or ≥ 12 s poll (matches app fallback) |

**Locked-page behavior:** if the page is protected and no session token is
available, return the locked view rather than an error, mirroring the REST GET
so MCP and HTTP clients see the same shape.

### `fileshare://page/<slug>/meta`

Meta only — cheap listing/preview resource.

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/pages/[slug]` (server strips `content`) |
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
| Auth | Session |
| Caching | Revalidate on `files_updated` or ≥ 12 s poll (matches `useFileList`) |

### `fileshare://file/<slug>/<fileId>/meta`

Metadata for a single file record.

| Aspect | Behavior |
|--------|----------|
| Backing API | derived from `GET /api/pages/[slug]/files` (filter by `fileId`) |
| MIME | `application/json` |
| Auth | Session (owning page) |
| Errors | `404` if `fileId` is not scoped to `<slug>` |

### `fileshare://file/<slug>/<fileId>/content`

Binary download of a stored file.

| Aspect | Behavior |
|--------|----------|
| Backing API | resolve `fileId` → `storedName` via the files listing, then `GET /api/uploads/[filename]` |
| MIME | the file's stored `mimetype` |
| Auth | Session; the server sends the JWT as a Bearer header — never as `?token=` in a URL |
| Streaming | Stream through the MCP process; support Range passthrough; local disk first, B2 fallback is handled API-side |
| Size | Up to 500 MB — hosts should prefer the `/meta` resource plus a download tool invocation over inlining bytes into model context |

### `fileshare://events/<slug>`

Live subscription handle (only if the MCP host supports resource subscribe).

| Aspect | Behavior |
|--------|----------|
| Backing API | `GET /api/pages/[slug]/events` (SSE) |
| Protocol | MCP subscribe → server opens SSE; `connected` / `message` / 10 s `: ping` |
| Payloads | `content_updated { type, content, clientId? }`, `files_updated { type }` |
| Auth | Session (Bearer header; `?token=` exists on the API for EventSource clients but the MCP server should use headers) |
| Caveat | SSE fan-out is process-local (`pageEvents` EventEmitter); no cross-instance delivery on multi-instance deploys |

---

## 3. Resource templates

For hosts that support template discovery, advertise:

| Template | URI pattern | Description |
|----------|-------------|-------------|
| Page | `fileshare://page/{slug}` | Workspace meta + content (JSON) |
| Page meta | `fileshare://page/{slug}/meta` | Meta only |
| Vault listing | `fileshare://page/{slug}/files` | File list JSON |
| File meta | `fileshare://file/{slug}/{fileId}/meta` | One file record |
| File content | `fileshare://file/{slug}/{fileId}/content` | Download stream |
| Events | `fileshare://events/{slug}` | Live SSE bridge |

`{slug}` validates against `slugSchema`; `{fileId}` is a UUID resolved
server-side.

---

## 4. Auth & token handling for resources

1. Resources do **not** accept a `token` parameter. The server attaches the
   JWT from its in-memory `slug → token` map (minted by `fs_verify_password`,
   24 h, payload `{ slug }`) as an `Authorization: Bearer` header when
   calling the API.
2. Tokens are **slug-scoped**: a token for `alpha` must be rejected for
   `beta` resources (`payload.slug` must match the URI slug); the server
   drops the map entry on any API 401.
3. Never cache a resource body for a protected page beyond the token's
   lifetime; drop cached content when the entry is evicted or expires.
4. Never put tokens in the URI path or query string — URIs must stay
   shareable/loggable without leaking credentials.

---

## 5. Content types & size ceilings

| Resource | MIME | Ceiling |
|----------|------|---------|
| page | `application/json` (`{ meta, content }`) | 500 000 chars (`updateContentSchema`) |
| meta / files | `application/json` | small (listing sizes) |
| file content | stored `mimetype` (allowlist) | 500 MB (`MAX_FILE_SIZE`) |

---

## 6. Caching & invalidation

| Trigger | Invalidate |
|---------|------------|
| `content_updated` SSE | `fileshare://page/<slug>`, `fileshare://page/<slug>/meta` |
| `files_updated` SSE | `fileshare://page/<slug>/files`, `fileshare://file/<slug>/<fileId>/meta`, `fileshare://file/<slug>/<fileId>/content` |
| `fs_rename_page` | all resources under the old and new slug |
| `fs_delete_page` | all resources under the slug |
| Session eviction / expiry | any protected resource cached under that slug |

Without SSE, poll no faster than the app fallback: **12 s** for content,
matching `usePageContent` / `useFileList`.

---

## 7. Implementation notes

- Resources are a read projection of the same REST routes tools call — do not
  add a second query path into `src/lib/db.ts`.
- Binary resources must stream; never buffer a full 500 MB body in the MCP
  process just to return it as a resource.
- When a host cannot render binaries, return the `/meta` resource plus a
  download tool invocation instead of inlining bytes.
- Respect rate-limit classes even for reads: general **300 / 60 s / IP**.
  On hosted Streamable-HTTP all users share one IP budget (README §7).
- Redact `passwordHash` and any token material from every resource body.
- There is no `fileshare://health` resource — liveness is the `fs_health`
  tool only.
