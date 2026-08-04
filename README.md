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
| `ANTHROPIC_API_KEY` | one of the two | Claude routing + AI drafts |
| `OPENAI_API_KEY` | one of the two | GPT routing + AI drafts |
| `APP_ACCESS_TOKEN` | yes, when AI keys are set | Owner-only lock for the paid AI endpoints. When AI keys are configured but this is missing, AI endpoints fail closed (503). Enter the same value in the app under Preferences → Access key. |
| `ANTHROPIC_MODEL` | recommended | Pin the Claude model (default `claude-sonnet-4-6`; `/api/health` warns when defaulted) |
| `OPENAI_MODEL` | recommended | Pin the GPT model (default `gpt-4o-mini`; `/api/health` warns when defaulted) |
| `LLM_CLASSIFY_ORDER` | no | Provider policy for routing decisions, e.g. `openai,anthropic` (default `anthropic,openai`) |
| `LLM_GENERATE_ORDER` | no | Provider policy for live runs (default `anthropic,openai`) |
| `LLM_TIMEOUT_MS` | no | Per-provider timeout (default `30000`) |

Set these in Vercel → Project → Settings → Environment Variables, then redeploy. Without any key the app still works using local doctrine routing (the output badge shows "Doctrine routing" instead of "Routed by Claude/GPT"). Check `GET /api/health` to see the active AI configuration (providers, models, policy order — never keys).

## API safeguards

All AI endpoints are owner-locked (`APP_ACCESS_TOKEN`, constant-time comparison, fail-closed when AI keys are present) and carry request IDs, per-client rate limits, a real request-body byte limit, full runtime validation of every field (type-checked with safe 400 responses), provider timeouts with recorded failover reasons, structured audit logs (Vercel function logs), and safe client-facing error messages. The routing classifier uses native structured outputs (OpenAI `json_schema` strict mode / Anthropic strict tool use) plus server-side runtime validation, and wraps the task text as untrusted data to resist prompt injection.

## Honesty model

Routing produces a recommendation — the panel never executes the routed action. "Generate draft" produces an AI draft of a step with a general LLM (provider and exact model shown), and each draft's status, output, and timestamps are persisted on the task record so history and session exports preserve the full lifecycle.

## Standards

This repo is the reference implementation of the **Legacy Codex Standards Kit** (see `standards/`, version in `STANDARDS-VERSION`). Agent coordination happens in `HANDOFF.md`.

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
