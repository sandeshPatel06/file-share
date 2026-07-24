<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Rules & Architecture Guidelines

## Core Development Rules
1. **DO NOT run `npm run build`**: Never execute `npm run build` during development checks (use `npx tsc --noEmit` and `npx eslint .`).
2. **DO NOT use browser / browser subagents**: Do not attempt to use browser tools or open browser subagents for testing in this repository.

## System Architecture Summary
- **Database (`src/lib/db.ts`)**: SQLite database at `data/fileshare.db` using `better-sqlite3`. Foreign keys are enabled with `ON UPDATE CASCADE` to allow space slug renames without referential constraint errors.
- **Real-Time Sync (`src/app/api/pages/[slug]/events/route.ts`)**: Server-Sent Events (SSE) push live note changes using a central `EventEmitter` instance (`src/lib/events.ts`).
- **File Upload Vault (`src/app/api/pages/[slug]/files/upload/route.ts`)**: Files are stored on the local disk under `uploads/` with defensive database record provisioning.
- **AI Formatting (`src/components/TextEditor.tsx`)**: Markdown formatting engine (`handleAICopilotFormat`) auto-corrects headings, lists, task checkboxes, and punctuation.
