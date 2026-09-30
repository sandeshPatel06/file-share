# FileShare — Fix Tasks & Sprint Progress

> Source: User audit + readability/contrast & collaboration review  
> Scope: UX, collaboration, files, mobile, accessibility, trust, polish  
> Priority: P0 = ship blocker / high friction · P1 = strong improvement · P2 = nice-to-have

---

## Sprint 1 — Readability, Touch Targets & Consent (Completed ✅)

- [x] **#4 Light-mode secondary text contrast**: Darkened `--text-muted` to `#3d454f` (8.0:1 AAA contrast) and `--text-subtle` to `#424a53` (7.5:1 AAA) in `src/app/globals.css`.
- [x] **#2 Cookie banner blocks content**: Refactored `CookieConsent.tsx` into a compact, low-profile bottom bar (<20% viewport on mobile) that does not obscure hero CTAs, with centered granular modal when clicking "Customize".
- [x] **#9 Workspace footer readability**: Bumped text size to `text-xs sm:text-[13px]`, increased contrast, and added collapsible "Legal" dropdown on mobile in `SharePage.tsx`.
- [x] **#6 Mobile density & touch targets**: Enlarged header action targets to ≥ 40–44px, and added mobile `More` overflow menu in `SlugBar.tsx`.

---

## Sprint 2 — Data Trust, File Vault & Recent Spaces (Completed ✅)

- [x] **#3 Data feels disposable (trust)**:
  - Added **Export All (ZIP Archive)** with Markdown notes, metadata `README.txt`, and attached assets in `src/lib/exportZip.ts` and `TextEditor.tsx`.
  - Added 30-day inactivity retention notices in workspace management modals.
  - Added "Remember unlock on this device" (`localStorage` token persistence) in `PasswordGate.tsx` and `SharePage.tsx`.
  - Added permanent workspace deletion action with `ConfirmModal` calling `DELETE /api/pages/[slug]`.
- [x] **#7 Recent spaces history**:
  - Implemented `useRecentSpaces` hook with `useSyncExternalStore` for clean, reactivity-safe `localStorage` synchronization.
  - Added "Recent Spaces" chips with pinning and quick removal on `LandingPage.tsx`.
  - Auto-registered workspace visits on `/s/[slug]`.
- [x] **#5 File vault enhancements**:
  - Added "Download All as ZIP" (`exportFilesOnlyAsZip`) in `FilePanel.tsx`.
  - Added upload cancellation per active upload item.
  - Redesigned empty-state CTA with prominent upload button and format guidance.

---

## Sprint 3 — Collaboration Collisions & Rename Redirects (Completed ✅)

- [x] **#1 Collaboration collisions & Presence**:
  - Live presence tracking via SSE in `src/app/api/pages/[slug]/events/route.ts` broadcasting `presence_updated`.
  - Active collaborator count badge in `TextEditor.tsx` status bar (`{count} Live`).
  - Soft-conflict handling in `usePageContent.ts`: detects remote edits during active local typing.
  - Interactive conflict resolution banner in `TextEditor.tsx` ("Keep Mine", "Accept Remote", "Append Below").
- [x] **#8 Rename breaks old links**:
  - Added `redirects` table schema across PostgreSQL, SQLite, and in-memory store in `src/lib/db.ts`.
  - Saved redirect mapping on slug rename in `src/app/api/pages/[slug]/rename/route.ts`.
  - Added automatic redirect handling in `src/app/s/[slug]/page.tsx` (`redirect('/s/new-slug')`).

---

## Verification Summary
- `npx tsc --noEmit`: Clean (0 errors)
- `npx eslint .`: Clean (0 errors, 0 warnings)
- Zero-registration architecture preserved.
