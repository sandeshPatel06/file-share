# FileShare MCP Server

Model Context Protocol (MCP) documentation for exposing FileShare workspace
capabilities — pages, Markdown content, file vault, password locks — to MCP
clients (Claude Desktop, Claude Code, Cursor, and any MCP-compatible host).

> **Status:** documentation only. No MCP server implementation exists in this
> repository yet. These docs define the contract a future server must follow.
> Source of truth for the underlying HTTP surface remains
> [`AGENTS.md` §3](../AGENTS.md) and the route handlers under `src/app/api/**`.

---

## 1. What an MCP server adds

FileShare is a zero-registration HTTP API. An MCP server wraps that API so AI
assistants can:

- **Create and manage workspaces** (`/s/[slug]`) without the user opening a browser.
- **Read/write Markdown notes** with the same validation the app enforces (Zod, 500 000 char cap).
- **List, upload, and delete files** in the 500 MB vault (MIME allowlist enforced).
- **Set / verify / clear passwords** and manage per-slug JWT sessions.
- **Stream real-time updates** (SSE) as MCP subscriptions where the client supports them.

It does **not** change the product model: no accounts, no OAuth, no new storage
engine. The MCP server is a thin adapter over the existing REST API.

## 2. Positioning in the architecture

```
MCP client (Claude / Cursor / …)
        │  stdio or Streamable HTTP
        ▼
FileShare MCP server (proposed)
        │  per-connection slug → JWT map
        │  HTTP + Bearer header (per request)
        ▼
Next.js API  (/api/pages/*, /api/uploads/*)
        │
   db.ts · events.ts · b2.ts
```

Rules the implementation must obey (from `AGENTS.md`):

- Do not bypass the REST layer — call the public API routes, not `src/lib/db.ts` directly.
- Never invent or log secrets (`JWT_SECRET`, B2 keys, `DATABASE_URL`).
- Preserve the zero-registration model: every tool works with plain slugs; password is optional.
- Rate limits are enforced server-side; the MCP server must surface `429` + `Retry-After` to the client instead of retrying blindly.
- Protected pages: obtain a JWT via `POST /api/pages/[slug]/verify` and send it as `Authorization: Bearer <token>`; tokens are slug-scoped and expire after **24 h**.

## 3. Session model (per-connection slug → token map)

Tools take **no `token` argument** and **no raw JWT**. The server keeps one
**in-memory** `Map<slug, token>` **per MCP session** — each client connection
gets its own map:

1. `fs_verify_password({ slug, password })` → server calls the API, stores the
   returned JWT under `slug` in the calling connection's map, and reports
   success to the client. The JWT itself is not returned to the model.
2. Every other tool looks up the calling connection's `map.get(slug)` and
   attaches `Authorization: Bearer <token>` on the outgoing request.
3. Entries are dropped on: 401 from the API, token-expiry horizon (24 h),
   connection close, or process exit. **No persistence** — restarting the
   server clears all sessions. stdio has exactly one connection, so
   single-user behavior is unchanged.
4. Tokens are **slug-scoped**: a token minted for `alpha` is never presented
   against `beta`; the API rejects mismatched payloads and the server must
   delete the stale entry on 401.

The per-connection map **is** the isolation boundary: never share one
process-global `slug → token` map across clients.

## 4. Document map

| File | Contents |
|------|----------|
| [`tools.md`](./tools.md) | Tool names, input/output schemas, mapped API route, errors, rate-limit class |
| [`resources.md`](./resources.md) | Resource URIs (`fileshare://…`), read/subscribe behavior, templates |
| [`config.example.json`](./config.example.json) | Sample MCP client configuration (env-based, no hardcoded secrets) |

## 5. Server configuration contract

The server reads its own env — it is an API client, not a database peer:

```env
# Target API (canonical production host)
FILESHARE_API_URL=https://fileshare.shptechnology.online

# Optional: only needed if the server talks to a local/dev instance
# FILESHARE_API_URL=http://localhost:3000

# Optional: upload/download guards (see tools.md fs_upload_file / fs_download_file)
# FILESHARE_UPLOAD_ROOTS=/path/to/uploads,/other/allowed/root
# FILESHARE_INLINE_MAX_BYTES=10485760

# Never commit real values
# JWT_SECRET / B2_* / DATABASE_URL belong to the app, not the MCP server
```

## 6. Client installation (generic)

> **Placeholder:** `<your-server-package>` below is not a published npm name.
> Publish or reserve the package before sharing copy-paste configs — an
> unclaimed name can be registered by someone else and run code on users'
> machines.

Register the server in any MCP host (Claude Code / Claude Desktop style):

```json
{
  "mcpServers": {
    "fileshare": {
      "command": "npx",
      "args": ["-y", "<your-server-package>"],
      "env": {
        "FILESHARE_API_URL": "https://fileshare.shptechnology.online"
      }
    }
  }
}
```

Local dev only needs `FILESHARE_API_URL=http://localhost:3000`.

See [`config.example.json`](./config.example.json) for the minimal sample.

## 7. Security model for the MCP surface

| Concern | Rule |
|---------|------|
| Auth | Per-slug JWT only (HS256, 24 h), held server-side in the calling MCP session's map (§3) — tokens are scoped to **(MCP session, slug)**, never process-global. No global admin token exists. |
| Passwords | Passwords enter the model's context when passed as tool arguments — that is inherent to the protocol. Where the host supports **MCP elicitation**, prefer prompting the user out-of-band instead of a tool argument. Either way the server must never persist a password or write it to logs. |
| Slug scope | A token minted for slug `alpha` must not be presented against `beta`; the API rejects mismatched payloads and the server drops the entry. |
| Uploads | The server streams file bytes from a local path or URL (see `fs_upload_file`); never buffers 500 MB in the MCP process. Paths must resolve inside the `FILESHARE_UPLOAD_ROOTS` allowed roots; URLs are `http(s)` only with loopback/private/link-local ranges (incl. `169.254.169.254`) blocked and re-checked on every redirect hop; every upload needs explicit host-user confirmation first. |
| Content | Max **500 000** chars per update (`updateContentSchema`). Reject earlier with a clear tool error. |
| Not E2E encrypted | Server-side content is readable. Do not claim zero-knowledge in tool descriptions or UI copy. |
| Rate limits | Mirror API classes: verify **5/60 s/IP**, sensitive **30/60 s/IP**, uploads **12/10 min/IP**, general **300/60 s/IP**. |
| Hosted deployments | Limits are **per IP, in-memory**. A hosted Streamable-HTTP server puts all users behind one IP, so they share e.g. the 5/60 s verify budget. Prefer **stdio** for single-user local use; document the shared-IP caveat if you host HTTP. |

## 8. Real-time behavior

- The REST API exposes SSE at `GET /api/pages/[slug]/events` (`event: connected`, `event: message`, 10 s ping).
- Events: `content_updated` (with `content` payload) and `files_updated`.
- If the MCP host supports subscriptions, the server may bridge SSE → MCP notifications (resource subscribe). Otherwise expose a polling tool with a documented interval (app poll fallback is 12 s; do not poll tighter than that).
- SSE has **no rate limiter**, but the stream is per-slug and process-local (`pageEvents` EventEmitter). Multi-instance deploys will not fan out across processes — acceptable for the current single-service deploy.

## 9. Hard limits quick reference

| Limit | Value | Source |
|-------|-------|--------|
| Slug length / pattern | 3–48 chars, `^[a-z0-9]+(-[a-z0-9]+)*$` | `slugSchema` |
| Content size | 500 000 chars | `updateContentSchema` |
| Upload size | 500 MB (`500 * 1024 * 1024`) | `MAX_FILE_SIZE` |
| Password length | 6–128 chars | `createPageSchema` / `setPasswordSchema` |
| JWT lifetime | 24 h, HS256, payload `{ slug }` | `src/lib/jwt.ts` |
| Verify attempts | 5 / 60 s / IP | `verifyLimiter` |
| Upload attempts | 12 / 600 s / IP | `uploadLimiter` |

**`Retry-After` quirk:** `rateLimiter.ts` hardcodes `Retry-After: 60` for
every 429, including the upload limiter whose window is 600 s. Propagate the
header value as-is; do not assume it reflects the true window. When surfacing
a 429 for an **upload**, also tell the client the real **600 s** window in
addition to the API's `Retry-After: 60`.

## 10. Verification checklist (when implementing)

- [ ] Every tool maps 1:1 to an existing API route in `AGENTS.md` §3 — no parallel stack
- [ ] Tools take no token argument; JWTs live only in the per-connection in-memory session map
- [ ] Zod limits above are enforced client-side in the tool **and** respected from API errors
- [ ] Protected-page flows obtain JWT via `verify`, scope it to one slug, never persist passwords
- [ ] `429` responses are surfaced with `Retry-After`, not auto-retried in a loop
- [ ] Uploads stream from a path/URL; memory use stays flat for 500 MB files
- [ ] Upload path/URL guards enforced: `FILESHARE_UPLOAD_ROOTS` check after symlink resolution, SSRF blocked (loopback/private/link-local incl. `169.254.169.254`, re-checked per redirect), explicit user confirmation before every upload
- [ ] SSE bridge (if built) handles the 10 s ping and reconnects on stream close (app fallback poll: 12 s)
- [ ] No secrets in tool args, logs, resource bodies, or example configs
- [ ] Package name is published/reserved before any copy-paste config ships
- [ ] `npx tsc --noEmit` and `npx eslint .` clean for any added server code
