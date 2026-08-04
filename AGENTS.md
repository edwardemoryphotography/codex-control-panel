<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

This repo is a single **Next.js 16 (App Router, Turbopack)** service, `codex-control-panel`. The UI and the `/api/*` route handlers run in the same process. Package manager is **npm** (`package-lock.json`). Standard commands live in `package.json`/`README.md`: `npm run dev`, `npm run build`, `npm run lint`, `npm test` (Vitest). No database, container, or other backing service is required.

Non-obvious caveats:

- **`next dev`/`next build` rewrites the `<!-- BEGIN:nextjs-agent-rules -->` block at the top of this file on startup**, so `AGENTS.md` will show up as an uncommitted change after you run the app. This is expected (generator: `node_modules/next/dist/server/lib/generate-agent-files.js`); commit it with your work to keep the tree clean, or leave it — do not fight it.
- **The app runs fully without any AI keys.** Routing then falls back to a local keyword "doctrine router" that executes **client-side in the browser**, so the UI works offline (result shows a "Doctrine routing" badge). Because that fallback is client-side, the server routes `/api/route` and `/api/claude` return an error when no provider key is set — that is normal, not a broken setup.
- **Live AI** requires `ANTHROPIC_API_KEY` and/or `OPENAI_API_KEY` **plus** `APP_ACCESS_TOKEN`. If an AI key is set but `APP_ACCESS_TOKEN` is missing, the AI endpoints fail closed with 503. The same token must be entered in the UI under Preferences → Access key. `GET /api/health` reports the active AI configuration (never keys).
