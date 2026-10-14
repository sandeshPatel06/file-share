# Changelog

All notable changes to FileShare are documented here.

## 2026-10-14

### Fixed

- Prevented workspace deletion from leaving orphaned files on local disk or Backblaze B2.
- Kept deletion errors generic at the API boundary instead of exposing database or filesystem details.
- Documented the current deployment, upload, export, authentication, redirect, and design-token behavior in `MINT.md` and `AGENTS.md`.

### Improved

- Hardened the Render deployment script with Node preflight checks, writable storage checks, dependency retry, timed stages, and `.next/BUILD_ID` verification.
- Migrated the Next.js 16 host redirect entrypoint from deprecated `middleware.ts` to `proxy.ts`.
- Excluded streaming uploads from the proxy matcher and configured the 520 MB proxy body limit.
- Enforced the upload MIME allowlist with staged-file cleanup on rejection.
- Added Render health-check configuration and disabled telemetry during deployment builds.

### Review Notes

- Collaboration remains last-write-wins with a short local-edit conflict window; it is not a CRDT.
- SSE fan-out and rate limiting remain process-local and are not shared across multiple service instances.
- Rename operations update several records without a cross-database transaction in the shared DB abstraction; this remains a design follow-up.
- Browser ZIP export loads selected files into client memory before compression, so very large vault exports can pressure the browser.

### Verification

- `bash -n deploy.sh`
- `npx tsc --noEmit`
- `npx eslint .`
