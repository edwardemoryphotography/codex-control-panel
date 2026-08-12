# Changelog — Codex Control Panel + Codex ecosystem

This file holds shipped history that was previously in `STATE.md`. `STATE.md` is now the current-state file only.

## 2026-08-11

- fix: builds green + hardening — hub turbopack.root, /api/actions owner-gated, supabase cache doc, lint + test fixes, ci.yml; legacy npm install restores @testing-library; arch clean reinstall fixes vite rollup bug; verified 95+83 tests, all builds green
- deploy: May 19 trio — cognition-final.html, codex-operations.html, codex-territory-v36.html to codex-system-architecture/public/ (12d281d on main, Vite copies to dist/)

## 2026-08-10 and before (from STATE.md 2026-08-10)

- Codex Control Panel Lane B (local) → Foundry persistence intake UI on the primary route flow (`RoutePersistPanel`), session-memory owner token, explicit confirmations, `/api/route/persist` submit + correction fields; tests green
- Codex Control Panel v2 → liquid-glass UI (Apple Intelligence × Gemini), AI-powered routing via `/api/route` (Claude → GPT fallback, doctrine fallback offline), auto-scroll + feedback on route, lint/tests/build all green; `SUPERPROMPT.md` added
- Codex Control Panel v2 UI → liquid-glass redesign merged via PR #6 and auto-deployed
- AI routing v1 → merged via PR #7 and auto-deployed (needs Vercel env vars for live AI)
- In PR #8 (implemented, NOT yet shipped) → provider policy + structured outputs, task lifecycle honesty, owner-only auth, full request validation + body limits, API safeguards + `/api/health` with key probes, and Standards Kit v2; shipping blocked on merge + Vercel env vars + live verification
- Photographer Agent Pack V1 → live on Gumroad
- Artful Intelligence storefront (`artful-intelligence-v1.html`) → deployed to Vercel, June 9 2026
- Starforge → working prompt → Claude API → live HTML preview loop
- MacBook file system → dead Downloads symlink replaced; automated file organizer scripts verified
- Legacy Codex → live at `legacy-codex.vercel.app`
- Legacy Codex hygiene pass (2026-08-04) → lint warnings 32 → 0, dead code removed, Supabase client and tab components fully typed; lint + 24 tests + production build all green
- Legacy Codex PR #47 live-DB verification (2026-08-07) → ran all 14 read-only checks from `supabase/verification/routing_control_plane_checks.sql` against `foundry-console`: RLS, anon-zero-privilege, delete guards, correction-chain integrity, idempotency-key uniqueness, and `persist_route_atomic` grants all verified; fixed hardening migration final step, re-verified

