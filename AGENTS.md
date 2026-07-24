<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Agent Rules

1. **DO NOT run `npm run build`**: Never execute `npm run build` during tasks or development checks.
2. **DO NOT use browser / browser subagents**: Do not attempt to use browser tools or open browser subagents for testing in this repository.
