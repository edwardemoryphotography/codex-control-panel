# STATE.md — Edward Emory Photography / Artful Intelligence

_Last updated: 2026-09-05 (Legacy Codex repair; other entries retain their original dates)_

**This is the canonical cross-project state file** (Master Charter §8, as of Standards Kit 2.1.0). Full history is now in `docs/CHANGELOG.md`. `legacy-codex` keeps only a short pointer plus repo-local-only notes. If you're working in a satellite repo, update the state here, not in a local copy.

---

## Legacy Codex live repair — 2026-09-05

- **Shipped:** PR71 merged as `161f38d1ad887da5b1530674ca07cc5ea717daea`; the canonical https://legacy-codex.vercel.app/ served that repair at descendant `12b6326`. The Mission Orb/Beam design, context-aware local next-move rules, and in-place connection recovery are deployed. Live browser reached Connected and the button returned the correct no-Primary clarification for its actual empty session. Retained suite: 93 passing tests; lint 0 errors / 5 existing warnings; TypeScript and production build passed. Follow-up `6038fc1` removes auth-stub tests and records verification; application source is unchanged.
- **Unverified:** Eddie's existing phone session and saved-mission recovery. His exact connection failure did not reproduce. A fresh anonymous connection is not owner-session verification. Predictive Strategic Delta remains incomplete. Saved-action implementation and its verification boundary are tracked below.
- **Next:** Verify the existing mission from Eddie's original browser session, preserving its stored authentication. Continue from this release; do not recreate repositories or reopen completed release mechanics. Eddie explicitly authorized this bounded app repair and taking it through release without routine Git approvals; the general app freeze still applies to unrelated work.
- **Continuity:** Canonical Vercel project is `frontend` (`prj_irrXhfz1elCLhO1Pdgd0ffM4wfz2`), Supabase is `foundry-console` (`pkydkbuodikttfeawqsw`). Failed session reads must not silently create replacement anonymous users. Preview and production identities are separate; do not clear browser data or reassign mission ownership as a repair shortcut.


## Saved action / resume repair — 2026-09-06 UTC

- **Merged baseline:** legacy-codex PR72 (`b5d379b`) adds mission-linked canonical `actions`, shared by Mission and Resumption Log. Deployment checks succeeded; an owner-session save/pause/reload/resume was not verified. User-reported DONE is not evidence truth.
- **Repair in progress:** [legacy-codex PR73](https://github.com/edwardemoryphotography/legacy-codex/pull/73), head `7e77f838e6144f23f8e71884d2edd05cd3213253`, uses functional React state replacement and derives chooser visibility from committed state. Production Supabase `pkydkbuodikttfeawqsw` now has `actions_one_unfinished_per_mission`, covering all mission-linked non-DONE rows regardless of `is_next_action`. Index metadata verified. Preflight found zero mission-linked actions and zero duplicate groups; no user rows were changed or fabricated. 93 existing tests, TypeScript and production build pass; lint 0 errors/5 pre-existing warnings. PR73 merged as `ba003233f3640871cb65bea78a0599d49fb32f0f`; GitHub CI run 34001417217 passed. Production deployment pending; owner-session behavior remains unverified.
- **Blocked / unverified:** Eddie's original iPhone authentication context is not accessible in this workspace. No claim of successful owner-session writes, reload, or resume. The PR71 evidence-gate defects are outside this repair and remain unresolved.
- **Next / finish line:** Confirm deployment of the merged repair; in the original iPhone browser (without clearing data), save one real mission-linked action, start it, save a starting-point note and pause, reload, then resume the same action. Record the same action ID, note, status and absence of duplicates/errors. A fresh anonymous session or code tests cannot satisfy this finish line.

## ✅ SHIPPED (recent — full history in docs/CHANGELOG.md)

- **2026-08-11 fix: builds green + hardening** → hub turbopack.root, /api/actions owner-gated + audited, supabase cache doc, lint/test fixes, ci.yml; legacy @testing-library restore; arch vite split 594kB→220kB via manualChunks; all builds green (95+83 tests)
- **2026-08-11 deploy: May 19 trio** → cognition-final.html, codex-operations.html, codex-territory-v36.html to codex-system-architecture/public/ (12d281d on main) — see `docs/DEPLOY_VERIFY.md`

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
