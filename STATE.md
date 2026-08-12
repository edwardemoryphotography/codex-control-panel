# STATE.md — Edward Emory Photography / Artful Intelligence

_Last updated: 2026-08-10_

**This is the canonical cross-project state file** (Master Charter §8, as of Standards Kit 2.1.0). `legacy-codex` previously kept an independently-drifting copy; it now keeps only a short pointer plus repo-local-only notes. If you're working in a satellite repo, update the state here, not in a local copy.

---

## ✅ SHIPPED

- **Codex Control Panel Lane B (local)** → Foundry persistence intake UI on the primary route flow (`RoutePersistPanel`), session-memory owner token, explicit confirmations, `/api/route/persist` submit + correction fields; tests green. Branch: `cursor/autonomous-project-hygiene-control-panel-ui-4e59` (push blocked — no GitHub credentials in this agent environment)
- **Codex Control Panel v2** → liquid-glass UI (Apple Intelligence × Gemini), AI-powered routing via `/api/route` (Claude → GPT fallback, doctrine fallback offline), auto-scroll + feedback on route, lint/tests/build all green; `SUPERPROMPT.md` added for unifying all Legacy Codex repos
- **Codex Control Panel v2 UI** → liquid-glass redesign (Apple Intelligence × Gemini) merged via PR #6 and auto-deployed
- **AI routing v1** → merged via PR #7 and auto-deployed (needs Vercel env vars for live AI)
- **In PR #8 (implemented, NOT yet shipped)** → provider policy + structured outputs, task lifecycle honesty (task IDs, draft-vs-execution honesty, persisted run records), owner-only auth (`APP_ACCESS_TOKEN`), full request validation + body limits, API safeguards + `/api/health` with key probes, and Standards Kit v2 (`standards/` — master charter + run cards + handoff contract); shipping blocked on merge + Vercel `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`/`APP_ACCESS_TOKEN` + live verification
- **Photographer Agent Pack V1** → live on Gumroad (`edwardemory.gumroad.com/l/photographer-agent-pack-v1`)
- **Artful Intelligence storefront** (`artful-intelligence-v1.html`) → deployed to Vercel, June 9 2026
- **Starforge** → working prompt → Claude API → live HTML preview loop
- **MacBook file system** → dead Downloads symlink replaced; automated file organizer scripts verified
- **Legacy Codex** → live at `legacy-codex.vercel.app`
- **Legacy Codex hygiene pass (2026-08-04)** → lint warnings 32 → 0, dead code removed, Supabase client and tab components fully typed; lint + 24 tests + production build all green (absorbed from `legacy-codex/STATE.md` main, 2026-08-10)
- **Legacy Codex PR #47 (routing control plane) live-DB verification (2026-08-07)** → ran all 14 read-only checks from `supabase/verification/routing_control_plane_checks.sql` against `foundry-console` (`pkydkbuodikttfeawqsw`): RLS, anon-zero-privilege, delete guards, correction-chain integrity, idempotency-key uniqueness, and `persist_route_atomic` grants all verified as PR #47 intended. Found and fixed a real gap: the hardening migration's final revoke/drop/trigger step had never taken effect; applied a follow-up migration closing it, re-verified (absorbed from `legacy-codex/STATE.md` main, 2026-08-10)

---

## 🔴 BLOCKED / STALLED

- **Muse 2 EEG system** → Docker errors blocking; WHOOP integration unstarted (energy-gated stall)
- **Netlify MCP** → OAuth broken as of June 9; do not use until re-authenticated and a read-only call confirms it works
- **Cognition documentary deck** (`cognition-final.html`) → built May 19, not deployed
- **Codex Operations panel** (`codex-operations.html`) → built May 19, not deployed
- **Codex Territory Dashboard** (`codex-territory-v36.html`) → built May 19, not deployed

---

## 🚧 NEXT (priority order)

1. First real buyer / user-test of Agent Pack V1 → this is the gate before any new product work
2. Deploy the May 19 trio: Cognition + Operations + Territory
3. Namibia workshop relaunch planning (2027–2028) with Richard Morsback
4. Reach out to Nick (National Geographic contact) for career path conversation
5. Starforge → SwiftUI WKWebView wrapper for iPhone demo

---

## 🔒 FROZEN — DO NOT TOUCH

- **Legacy Codex FREEZE SPEC** → in `legacy-codex`, don't rewrite `src/app/` (`page.tsx`, `layout.tsx`, `globals.css`, `api/`), `src/components/`, `src/lib/`, or `src/hooks/` unless Eddie explicitly says "REWRITE THE APP CODE". Docs, config, and coordination files are not frozen. **Corrected 2026-08-10:** this rule previously named `app/index.html`, which does not exist in the repo (it's Next.js App Router; the real entry is `src/app/page.tsx`) — the freeze was guarding a phantom path while the actual app code sat unprotected. Eddie has approved this corrected wording. **Do not restore the old `app/index.html` wording.**
- **Artful Intelligence brand launch** → on hold pending Eddie's decision on @Freddy_v association
- **AI-powered CMS architecture** (Claude Code + Firecrawl + MongoDB) → parked; 5 scoping questions pending; no buyer yet

---

## 🗂 CANONICAL REPOS

Where each project actually lives, so no agent edits a stale duplicate. Absorbed 2026-08-10 from `Artful-Intelligence/AGENTS.md` § Agent Guardrails (repeated there and in the user's global CLAUDE.md).

| Project | Canonical | Notes |
|---|---|---|
| Artful Intelligence | `~/Development/Artful-Intelligence` | Older copies archived under `~/Development/archive/` — do not edit those |
| Legacy Codex | `~/legacy-codex` | Production truth is `https://legacy-codex.vercel.app`; compare local tree to `origin/main` before assuming it matches production — a stale duplicate Vercel project (`edwardemory-photography-legacy-codex`) also exists and should be ignored |
| Codex Control Panel | `~/Development/codex-control-panel` | This repo — reference implementation of the Standards Kit |
| Codex System Architecture | `~/Development/codex-system-architecture` | Visual documentation SPA; separate Supabase project (`supabase-indigo-paddle`) from `legacy-codex`'s `foundry-console` (`pkydkbuodikttfeawqsw`) — do not assume shared tables |

---

## ⚙️ ACTIVE GOVERNANCE RULES

- No new frameworks until a current artifact is user-tested by a real buyer
- Shipped proof beats doctrine
- Monetization requires: named buyer + price band + first deliverable ≤14 days + sales channel + why they'd pay now
- Deployment friction is the primary recurring bottleneck — one-step flows only
- Real data only — zero mock/synthetic/simulated content, ever
- Plans >~40 lines → self-contained HTML artifact, not a doc

---

## 🛠️ STACK & KEYS REFERENCE

| Thing | Value |
|---|---|
| GitHub | EdwardEmoryPhotography |
| Vercel teamId | `team_vp0GcqRDdFkQQ3NRZU9NJ11O` |
| Artful Intelligence project | `prj_NxOtPIdA833whnS4TvybcfWJNLqK` |
| Artful Intelligence config | Static "Other" — files must be at repo root |
| Proven deploy path | GitHub Contents API via curl (fetch SHA → PUT with base64) |
| Gumroad | `edwardemory.gumroad.com` |
| Email | `pro@edwardemory.com` |
| Instagram | `@freddy_v` |

---

## 📝 UPDATE PROTOCOL

Before starting any session: read this file.  
After any session that ships, blocks, or unblocks something: update this file.  
Three lines minimum: what shipped / what's blocked / what's next.
