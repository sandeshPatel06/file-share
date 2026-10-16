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
engine. The MCP server is a thin, stateless adapter over the existing REST API.

## 2. Positioning in the architecture

```
MCP client (Claude / Cursor / …)
        │  stdio or Streamable HTTP
        ▼
FileShare MCP server (proposed)
        │  HTTP + Bearer JWT (per slug)
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

## 3. Document map

| File | Contents |
|------|----------|
| [`tools.md`](./tools.md) | Tool names, input/output schemas, mapped API route, errors, rate-limit class |
| [`resources.md`](./resources.md) | Resource URIs (`fileshare://…`), read/subscribe behavior, templates |
| [`config.example.json`](./config.example.json) | Sample MCP client configuration (env-based, no hardcoded secrets) |

## 4. Server configuration contract

The server reads the same environment the app uses. At minimum:

```env
# Target API (canonical production host)
FILESHARE_API_URL=https://fileshare.shptechnology.online

# Optional: only needed if the server talks to a local/dev instance
# FILESHARE_API_URL=http://localhost:3000

# Optional: pre-issued session token for a known slug (otherwise tools
# obtain tokens via the verify tool at runtime)
# FILESHARE_PAGE_TOKEN=…

# Never commit real values
# JWT_SECRET / B2_* / DATABASE_URL belong to the app, not the MCP server
```

The MCP server itself does **not** need `JWT_SECRET`, B2, or `DATABASE_URL` —
it is an API client, not a database peer.

## 5. Client installation (generic)

Register the server in any MCP host. Example (Claude Code / Claude Desktop style):

```json
{
  "mcpServers": {
    "fileshare": {
      "command": "npx",
      "args": ["-y", "@fileshare/mcp-server"],
      "env": {
        "FILESHARE_API_URL": "https://fileshare.shptechnology.online"
      }
    }
  }
}
```

See [`config.example.json`](./config.example.json) for the full annotated sample.

## 6. Security model for the MCP surface

| Concern | Rule |
|---------|------|
| Auth | Per-slug JWT only (HS256, 24 h). No global admin token exists. |
| Passwords | Tools may accept a password **argument**, but it must never be persisted by the server or written to logs/transcripts. Prefer one-shot verify → in-memory token. |
| Slug scope | A token minted for slug `alpha` must not be presented against `beta`; the API rejects mismatched payloads. |
| Uploads | Server must stream multipart bodies (busboy on the API side); never buffer 500 MB in the MCP process. |
| Content | Max **500 000** chars per update (`updateContentSchema`). Reject earlier with a clear tool error. |
| Not E2E encrypted | Server-side content is readable. Do not claim zero-knowledge in tool descriptions or UI copy. |
| Rate limits | Mirror API classes: verify **5/60 s/IP**, sensitive **30/60 s/IP**, uploads **12/10 min/IP**, general **300/60 s/IP**. |

## 7. Real-time behavior

- The REST API exposes SSE at `GET /api/pages/[slug]/events` (`event: connected`, `event: message`, 10 s ping).
- Events: `content_updated` (with `content` payload) and `files_updated`.
- If the MCP host supports subscriptions, the server may bridge SSE → MCP notifications (resource subscribe). Otherwise expose a polling tool with a documented interval (app poll fallback is 12 s; do not poll tighter than that).
- SSE has **no rate limiter**, but the stream is per-slug and process-local (`pageEvents` EventEmitter). Multi-instance deploys will not fan out across processes — acceptable for the current single-service deploy.

## 8. Hard limits quick reference

| Limit | Value | Source |
|-------|-------|--------|
| Slug length / pattern | 3–48 chars, `^[a-z0-9]+(-[a-z0-9]+)*$` | `slugSchema` |
| Content size | 500 000 chars | `updateContentSchema` |
| Upload size | 500 MB (`500 * 1024 * 1024`) | `MAX_FILE_SIZE` |
| Password length | 6–128 chars | `createPageSchema` / `setPasswordSchema` |
| JWT lifetime | 24 h, HS256, payload `{ slug }` | `src/lib/jwt.ts` |
| Verify attempts | 5 / 60 s / IP | `verifyLimiter` |
| Upload attempts | 12 / 600 s / IP | `uploadLimiter` |

## 9. Verification checklist (when implementing)

- [ ] Every tool maps 1:1 to an existing API route in `AGENTS.md` §3 — no parallel stack
- [ ] Zod limits above are enforced client-side in the tool **and** respected from API errors
- [ ] Protected-page flows obtain JWT via `verify`, scope it to one slug, never persist passwords
- [ ] `429` responses are surfaced with `retryAfter`, not auto-retried in a loop
- [ ] Uploads stream; memory use stays flat for 500 MB files
- [ ] SSE bridge (if built) handles the 10 s ping and reconnects on stream close (app fallback poll: 12 s)
- [ ] No secrets in tool args, logs, resource bodies, or example configs
- [ ] `npx tsc --noEmit` and `npx eslint .` clean for any added server code
