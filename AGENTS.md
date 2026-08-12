<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Legacy Codex agent doctrine

This repository is part of the Legacy Codex execution infrastructure. All AI builders — Claude Code, Cursor, Codex, Grok Build, Hermes-adjacent agents, and future models — must use the same cognitive-transmission doctrine.

Canonical source:

`EdwardEmoryPhotography/codex-system-architecture/notion-wiki/docs/GOOSE-COOKBOOK.md`

Core rules if the canonical source is temporarily unavailable:

- **Don't preserve every experience. Preserve what the experience taught the system.**
- **CATCH THE FUCKING BOOMERANG.** Repeated analogies, corrections, artifacts, implementation evidence, and apparently separate examples may be returns from the same latent architecture. Integrate them.
- **The build can become the explanation.** Do not confuse improved observability of an existing end-state with a newly expanded vision.
- **Make the idea representable across different kinds of minds.** Preserve meaning across human narrative, machine-readable structure, and executable software.
- Before finishing work, ask: **What did this interaction teach the system that the next instance should not have to rediscover?** Encode durable lessons.

## Supabase / Vercel anti-groundhog-day gate

Before changing deployment code, configuration, or environment variables:

1. State which repo, Vercel project/environment, and Supabase project are actually in scope.
2. Inventory the exact environment-variable names read by the code before assuming a secret is missing.
3. Never invent, casually rename, rotate, expose, or hard-code secrets.
4. Distinguish local `.env`, Vercel Preview, and Vercel Production scopes.
5. Verify the deployment targets the intended Supabase project before diagnosing schema, RLS, auth, or persistence behavior.
6. Classify the failure before editing: **missing secret / wrong scope / wrong project / stale deploy / schema mismatch / RLS-auth failure / application bug**.
7. After a configuration change, trigger or inspect a fresh deploy and verify behavior on that exact deployment. **Configured != Verified != Live.**
8. If the same failure has happened before, update durable docs/tests/diagnostics so the next model inherits the fix instead of rediscovering it.

If an agent finds itself repeating environment-variable archaeology already solved elsewhere, that is a continuity defect — **catch the fucking boomerang.**
