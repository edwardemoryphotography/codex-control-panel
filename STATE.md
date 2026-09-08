# STATE.md — Edward Emory Photography / Artful Intelligence

_Last updated: 2026-09-08 (Legacy Codex save/resume and live analyzer output verified; other entries retain their original dates)_

**This is the canonical cross-project state file** (Master Charter §8, as of Standards Kit 2.1.0). Full history is now in `docs/CHANGELOG.md`. `legacy-codex` keeps only a short pointer plus repo-local-only notes. If you're working in a satellite repo, update the state here, not in a local copy.

This file describes dated project truth, priorities, and lessons. It does not authorize new actions or impose hidden approval gates. Current explicit user intent and the applicable agent authority model govern execution; historical priority/hold notes below do not override a newer request.

---

## Instruction hierarchy cleanup — 2026-09-08

- **Implemented and verified:** Current explicit user intent governs reversible coding work. Retired local/hub freeze gates and redundant inventory, tool-role, and skill confirmations; preserved specific sensitive-action authorization and platform protections. Local authority is in `legacy-codex/AGENTS.md`; shared conduct is in Standards Kit 2.2.0. Legacy Codex lint/types/173 tests/build and Control Panel lint/types/95 tests/build passed; knowledge-preservation and contradiction review passed.
- **Blocked:** No missing human product decision for this instruction task. Two existing skill description-length validator findings remain unchanged; application runtime/device evidence above and below retains its own dated scope.
- **Next / adoption evidence:** Integrate [Legacy Codex PR #82](https://github.com/edwardemoryphotography/legacy-codex/pull/82) and the [paired standards change](https://github.com/edwardemoryphotography/codex-control-panel/tree/codex/current-intent-authority) through repository gates. Consult their GitHub merge state for adoption; this implementation checkpoint does not claim application deployment or runtime verification.

## Legacy Codex Sep 2–6 shipped rollup

Merged on `edwardemoryphotography/legacy-codex` and live on production (`frontend` / https://legacy-codex.vercel.app) at tip `be17ccb` (`chore: update evidence snapshot`), which includes PR73 merge `ba00323`. GitHub commit status is success. The same tip is also deployed on `legacy-codex`, `codex-starforge-dashboard`, and `legacy-codex-vercel-diagnostic`.

- Home-screen next action is larger and easier to act on (#66, 2026-09-02)
- ThinkingOrb + BorderBeam visual language (#68, 2026-09-04)
- Mission is one focus surface with Orb and Beam (#70, 2026-09-04)
- Mission-context next-move plus in-place connection recovery (#71, 2026-09-05)
- `transitions-dev` / `transitions-polish` skills (#69, 2026-09-05)
- Save/resume the same next action across Mission and Resumption Log (#72, 2026-09-05)
- Evidence snapshot CI no longer false-greens (#67, 2026-09-05)
- PR72 uniqueness / concurrent-save repair (#73, 2026-09-06)

A persistent real production session has now verified save → start → note → pause → reload → resume of the same action ID with no duplicate. Recovery of Eddie’s historical anonymous identity specifically from his original physical iPhone remains a distinct device/session-continuity check.

---

## Legacy Codex live repair — 2026-09-05

- **Shipped:** PR71 merged as `161f38d1ad887da5b1530674ca07cc5ea717daea`; the canonical https://legacy-codex.vercel.app/ served that repair at descendant `12b6326`. The Mission Orb/Beam design, context-aware local next-move rules, and in-place connection recovery are deployed. Live browser reached Connected and the button returned the correct no-Primary clarification for its actual empty session. Retained suite: 93 passing tests; lint 0 errors / 5 existing warnings; TypeScript and production build passed. Follow-up `6038fc1` removes auth-stub tests and records verification; application source is unchanged.
- **Unverified:** Eddie's existing phone session and saved-mission recovery. His exact connection failure did not reproduce. A fresh anonymous connection is not owner-session verification. Predictive Strategic Delta remains incomplete. Saved-action implementation and its verification boundary are tracked below.
- **Next:** Verify the existing mission from Eddie's original browser session, preserving its stored authentication. Continue from this release; do not recreate repositories or reopen completed release mechanics. Eddie explicitly authorized this bounded app repair and taking it through release without routine Git approvals; unrelated work remains outside that task's scope. The historical blanket freeze was retired on 2026-09-08; current authority is in `legacy-codex/AGENTS.md`.
- **Continuity:** Canonical Vercel project is `frontend` (`prj_irrXhfz1elCLhO1Pdgd0ffM4wfz2`), Supabase is `foundry-console` (`pkydkbuodikttfeawqsw`). Failed session reads must not silently create replacement anonymous users. Preview and production identities are separate; do not clear browser data or reassign mission ownership as a repair shortcut.


## Saved action / resume verification — 2026-09-07

- **Shipped:** Legacy Codex PR72 introduced mission-linked canonical actions; PR73 repaired state replacement and the one-unfinished-action invariant. A persistent real production session at `https://legacy-codex.vercel.app` then completed the full proof loop against Supabase `pkydkbuodikttfeawqsw`: mission `8d561af2-1c61-4302-8f4e-6d97f5423448` saved and promoted; exactly one linked action `df2f3ffe-137b-4a73-862a-bcfdd417969c` saved; action started, paused with a note, page reloaded showing Ready to resume with the same ID/note, then resumed without an error or duplicate. The action and verification mission were subsequently completed with production evidence.
- **Analyzer repair:** PR76 merged as `2bcf8e401490f9659cc17d9780a0de7b28535491`; canonical production deployment `dpl_yvzgfdQFiLL1WP79rzYUGf9YKR8P` is READY. `POST /api/analyze` now returns the correct unauthenticated 401 boundary instead of the reproduced `MISSING_SUPABASE_URL` 500. Vercel reported no runtime errors in the verification window.
- **Verification gates:** 93 tests passed; TypeScript and production build passed; lint returned 0 errors / 5 pre-existing warnings. No aliases or projects changed, no synthetic rows were created, and no secret values were copied.
- **Independent check / remaining analyzer gate (2026-09-08):** The available cloud session independently resumed the existing action, reloaded it, and confirmed the same action ID and note in Mission and Resumption Log; SQL counted exactly one linked action at that check. This does not prove original-iPhone recovery. Analyzer configuration and unauthenticated 401 checks passed, but successful authenticated model output remains unverified. Automatic approval review rejected uploading the public production configuration artifact for lack of specific outbound-upload approval. Next: obtain that approval before the live analysis test. Canonical production is READY at `505128c4f00c7fa326db59013a8be178293d309f` (`dpl_H3DaFiB1WVnvpy4RTmpjGUJSyHgz`) on September 8.
- **Analyzer end-to-end verified (2026-09-08):** Eddie explicitly approved uploading the public configuration file. The live Constraint Validator accepted `production-next-config.txt` (201 bytes copied from real `next.config.mjs`); Analyze Files completed and rendered a substantial Claude response with summary, signals, risks, checklist, and next step. This verifies the browser upload, authenticated backend, provider call, and returned output on canonical production `505128c4f00c7fa326db59013a8be178293d309f` (`dpl_H3DaFiB1WVnvpy4RTmpjGUJSyHgz`). The earlier upload-approval and analyzer-output gates are now resolved. Model recommendations are not independently verified findings and were not applied. Original physical-iPhone session recovery remains distinct.
- **Still distinct:** Recovery of Eddie's historical anonymous identity specifically from his original physical iPhone was not tested from this cloud session. That remains a device/session-continuity check, not an unresolved defect in the now-verified general save/pause/reload/resume workflow.

## ✅ SHIPPED (recent — full history in docs/CHANGELOG.md)

- **2026-09-06 Legacy Codex #66–#73** → merged and production-deployed at `be17ccb` on `frontend` / https://legacy-codex.vercel.app — see Sep 2–6 rollup above. Owner-session save/resume still unverified.
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

## Historical safeguards and deferred work

- **Legacy Codex FREEZE SPEC — retired 2026-09-08 by Eddie's explicit instruction.** The historical requirement to say "REWRITE THE APP CODE" before changing `src/app/`, `src/components/`, `src/lib/`, or `src/hooks/` no longer applies. The phantom `app/index.html` path was corrected on 2026-08-10; preserve that lesson, not the permission gate. `legacy-codex/AGENTS.md` owns current authority and `standards/AGENT-BEHAVIOR.md` owns shared conduct.
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

## ⚙️ Durable operating lessons

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
