# Codex Control Panel

Mobile-first AI dispatcher for the Legacy Codex system. Describe a task, and the panel routes it to the right tool (Gemini, Perplexity, Claude / ChatGPT, Vercel + GitHub, Notion, Codex KG), writes the execution-ready prompt, and can run it live against Anthropic or OpenAI.

Built with Next.js (App Router), React, and a custom "Liquid Intelligence" design system — Apple Intelligence-style liquid glass and Siri glow, Gemini-style gradients.

## Features

- **AI-powered routing** — `/api/route` asks Claude (falling back to GPT) to pick the doctrine lane, decide hybrid splits, and apply the execution override. When no key is configured or the call fails, a local keyword-doctrine router takes over so routing always works.
- **Live prompt runs** — `/api/claude` executes any generated prompt against Anthropic → OpenAI with automatic fallback.
- **Teachable** — correct a wrong route and the panel biases future keyword routing toward your choice (persisted locally).
- **Session memory** — history, corrections, and theme persist in `localStorage`; export the session as JSON.
- **Voice input** — browser speech recognition where available.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | one of the two | Claude routing + live runs (tried first) |
| `OPENAI_API_KEY` | one of the two | GPT routing + live runs (fallback) |
| `ANTHROPIC_MODEL` | no | Override the Claude model (default `claude-sonnet-4-6`) |
| `OPENAI_MODEL` | no | Override the GPT model (default `gpt-4o-mini`) |

Set these in Vercel → Project → Settings → Environment Variables, then redeploy. Without any key the app still works using local doctrine routing (the output badge shows "Doctrine routing" instead of "Routed by Claude/GPT").

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint (passes clean)
npm test        # vitest — unit + UI tests
```

## Deploy

Push to `main`; Vercel builds and deploys automatically. The project must be configured as a **Next.js** project (not "Other/static") so the `/api/*` route handlers run.
