# STATE.md — Edward Emory Photography / Artful Intelligence

## Legacy Codex inactive Mission recovery — 2026-10-07

- **Initial recovery merged / production deployed:** [PR #113](https://github.com/edwardemoryphotography/legacy-codex/pull/113) merged as `149029e83b4476878d42de8b567baad0e043a078`. Canonical project `frontend` [production deployment](https://vercel.com/edwardemoryphotographys-projects/frontend/4ez185c1VLUQoDcS4Xfn5TyVS3x1) is READY at that exact commit. Strategic Delta distinguishes saved-but-inactive from empty, exposes explicit saved Mission selection and Make Primary, saves a missing finish line first, preserves same ID/blockers/capacity, and keeps completed missions as history. No Action is created implicitly.
- **Reviewed safety follow-up / in review:** [PR #114](https://github.com/edwardemoryphotography/legacy-codex/pull/114), head `5ed6f6af0f7112b0c2e2f30f59855f6cb383f753`, serializes board reads, lifecycle writes and creation; disables competing optimistic controls; requires authoritative refresh after failed compensation/cleanup; and withholds stale-board prediction after failed reads. Independent review found no remaining blocking findings. Local full suite (397/397 in 40 files), production build/TypeScript and whitespace checks passed; touched-file lint has 0 errors / 2 existing warnings. Hosted CI/security/approval checks are pending. This follow-up is not merged or production deployed yet. Regression doubles are not runtime/product proof; no synthetic production records were created.
- **Runtime gap / next:** Original owner-iPhone recovery remains unverified. No owner browser tab was available; the canonical browser open was blocked with `net::ERR_BLOCKED_BY_CLIENT`. This is unavailable evidence, not product failure. After the reviewed follow-up is released, Eddie selects his existing mission, supplies a finish line only if missing, makes it Primary and reloads. Finish when the same mission persists as Primary without a duplicate, and the next-move card never says “Nothing captured yet” while saved missions exist.


_Last updated: 2026-10-05 (Goose inheritance remediation; other entries retain their original dates)_

**This is the canonical cross-project state file** (Master Charter §8, as of Standards Kit 2.1.0). Full history is now in `docs/CHANGELOG.md`. `legacy-codex` keeps only a short pointer plus repo-local-only notes. If you're working in a satellite repo, update the state here, not in a local copy.

---

## Legacy Codex route-correction continuity repair — 2026-10-05

- **Merged / production deployed:** [PR #110](https://github.com/edwardemoryphotography/legacy-codex/pull/110) merged as `fa6a63616bebab2b540a35d67bf3c1ab30b7b981`. Canonical Vercel project `frontend` [deployment](https://vercel.com/edwardemoryphotographys-projects/frontend/CkQQponpDMDwHr1Sxi3SZKxNwkbU) is READY at that exact commit and owns https://legacy-codex.vercel.app/.
- **Repair / ownership:** A failed account route-correction write now remains an ID-bearing browser overlay through focus, reload, remount and mission switches; the overlay is cleared only when the exact correction ID is acknowledged, preventing both lost human guidance and double application after an ambiguous response. The UI can retry the exact bounded token/lane payload without storing raw task text. Reconciliation stays tied to the original Mission; `mission_events` remains transitional Mission-ledger persistence and does not supersede canonical routing ownership.
- **Verification / live boundary:** Final local suite passed 371/371 tests in 39 files; TypeScript, production build and hosted CI passed; lint has 0 errors / 8 existing warnings. The canonical live site loaded Connected in the existing cloud-browser identity and restored the real Primary mission, saved in-progress Action and note, plus account routing lessons. No synthetic record was created and no account write was forced. That smoke check proves the release is live and prior continuity still reads; it does not prove a naturally failed account write recovers in the owner's original iPhone session.
- **Next:** If a real correction save reports browser-only on the owner's existing production browser, leave or reload without clearing data, confirm the same routing preference remains, press **Retry account save**, then refresh and confirm it no longer reports browser-only or applies twice. Record the exact result against commit `fa6a636`.

## Goose inheritance remediation — 2026-10-05

- **Legacy Codex:** [PR #109](https://github.com/edwardemoryphotography/legacy-codex/pull/109) closes missing lesson inheritance in analysis, brief, operation assistance and task handoffs. It selects up to 16 active scoped rules through paginated JWT/RLS reads with an eight-second failure budget, preserves full conditions/provenance, persists explicit idempotent token-only routing corrections in the transitional Mission ledger, and preserves stale evidence across repository/check-source outages without hiding successfully observed PR state. Final tested/published tree: `cbd6e3d4f701c4b036282351c155f51bb318beeb`. Merged as `264e4e2e22389a03eefa8c52d2a9dd62989fb983`; [production deployment](https://vercel.com/edwardemoryphotographys-projects/frontend/CUZm5cQizPn2fkVbV1HccNcjSERZ) is READY at that commit and owns https://legacy-codex.vercel.app/. After deployment, root returned HTTP 200 and unauthenticated routing/review-capability reads returned the expected HTTP 401. The deployment error/fatal query found no entries in its checked 30-minute window; these boundary observations do not prove owner workflows.
- **Standalone Control Panel:** [PR #23](https://github.com/edwardemoryphotography/codex-control-panel/pull/23) merged as `e8a43a6dbda2671bc5e6aa103d52a54f25408d41`. Anthropic/OpenAI runtime prompts and generated tool handoffs now inherit public cognitive doctrine. [Production deployment](https://vercel.com/edwardemoryphotographys-projects/codex-control-panel/21kmAPt3iWcC4UF3DdrVzKzwsyCg) is READY at that commit and owns https://codex-control-panel-two.vercel.app/. Root returned HTTP 200; the deployment error/fatal query found no entries in its checked 30-minute window. These observations do not prove useful model behavior.
- **Verification:** Legacy local suite 364/364 tests in 38 files, TypeScript/build pass, lint zero errors/eight existing warnings; Control Panel 98/98 tests in eight files, TypeScript/lint/build pass. Independent read-only reviews and hosted findings were reconciled. Isolated protocol tests and repository evidence are not real-account workflow proof.
- **Remaining / owner proof:** Real-account pagination, lesson retirement propagation, durable correction retry/restoration across devices, asynchronous account changes, useful reasoning and original-iPhone behavior remain unverified. Use genuine existing missions and the existing production identity; do not create demonstration records or transfer anonymous identity to previews. Mission events remain transitional; canonical Foundry routing/evidence ownership and the unresolved verified workspace/account link are unchanged. No credentials, models, allowlists, schema, production records or aliases were changed.

## Legacy Codex recommendation quality and Resume repair — 2026-10-04

- **Merged / production deployed:** [PR #106](https://github.com/edwardemoryphotography/legacy-codex/pull/106) merged as `d4888cda475f24ccddfdaadbfc46604f21b0c3af`; its recommendation-quality contract is shipped, not a draft. The authorized [PR #108 follow-up](https://github.com/edwardemoryphotography/legacy-codex/pull/108) merged as `935ffa274cd06c8ca0ed8702665a8015718005f9`. Canonical Vercel project `frontend` (`prj_irrXhfz1elCLhO1Pdgd0ffM4wfz2`) [deployment dpl_GRXaiti3DNuh5BtzChyamhC1vgNU](https://vercel.com/edwardemoryphotographys-projects/frontend/GRXaiti3DNuh5BtzChyamhC1vgNU) is READY at that exact main commit and owns https://legacy-codex.vercel.app/. The merged/published tree `cb1088dcb30a202bf5c04f9fc3b7ca0906b0e1ee` equals the tested local tree.
- **Repair / concrete consequences:** The saved-action panel and Idea → Recommendation → Saved action strip follow the resolved mission ID rather than Primary presence. A remaining Secondary's existing Action stays reachable when Primary is completed, paused or abandoned. Resume now requires an exact bounded canonical `action_title` (outer whitespace aside), alongside authenticated ID, target-Mission ownership, unfinished status and citation. A clipped label, missing title, over-bound title or unrelated operation cannot authorize Resume; no saved content is shortened or rewritten. Context packet version 5 retires older cached contracts. [The hosted stage finding](https://github.com/edwardemoryphotography/legacy-codex/pull/108#discussion_r4179200184) was reproduced and repaired before merge.
- **Verification / limits:** Final local suite passed 348/348 tests in 35 files; TypeScript, production build and diff checks passed; lint has 0 errors / 8 existing warnings. Five new cases reproduced the original two defects before repair; three additional stage assertions reproduced the hosted-review finding. Independent read-only review found no blocking defects; CI verify, approval routing and security review passed on final branch `263591249fb50be4eb0c82d6f543e7753e2b53ed`. [Merged-main verification passed](https://github.com/edwardemoryphotography/legacy-codex/actions/runs/37232752209). Canonical root returned HTTP 200 and unauthenticated review-capability GET returned expected 401. Vercel's deployment-scoped error/fatal log query reported no entries in the checked 30-minute window; that is not owner-workflow proof. Cloud Browser blocked the local build with `net::ERR_BLOCKED_BY_CLIENT` and had no existing Legacy Codex owner session. Rendered live owner interaction, original-iPhone continuity and useful recommendation quality remain unverified, not failed. Protocol/component fixtures are not real missions or provider-quality evidence.
- **Ownership / unchanged boundaries:** The review still compares supported moves, returns an observable move finish condition, resumes an existing unfinished Action or asks one deciding question. It never implicitly saves, executes or routes a Resume proposal. Supplied steps, corrections, blocker/capacity/conflict gates, owner allowlist, RLS and the existing model remain. `evidence_snapshots` is derived; `evidence_items` owns canonical truth and verified workspace/account plumbing remains unresolved. Transitional Delta-ledger persistence is not a canonical ownership superseding decision. No schema, credentials, allowlist, model selection, production records or aliases were manually changed.
- **Next / real quality proof:** In the owner's existing production browser, evaluate genuine mission states using the [quality protocol](https://github.com/edwardemoryphotography/legacy-codex/blob/main/docs/STRATEGIC-DELTA-QUALITY.md): actionable dependency, existing unfinished Action, substantive correction, capacity/blocker and missing/conflicting evidence. For Resume, check the same real Action/title/note after reload without a duplicate; if the real board has only Secondary active, verify its card and Saved action stage remain reachable. Record useful / partly useful / missed-the-point with the exact reason, provenance, sources and finish condition. Do not manufacture this state, create demonstration records, clear browser data or transfer the owner's anonymous identity to a preview.

## Legacy Codex scoped project learning — 2026-10-01

- **Merged / production deployed:** [legacy-codex PR #92](https://github.com/edwardemoryphotography/legacy-codex/pull/92) merged as `668353e691532c611e835395242ebaba5cfa4b00`. Canonical Vercel project `frontend` (`prj_irrXhfz1elCLhO1Pdgd0ffM4wfz2`) deployment `dpl_G5e1JEKtUoQGqkyyUkgJ4QFduuz4` is READY at that exact commit and owns https://legacy-codex.vercel.app/. Canonical root fetch returned HTTP 200 with Legacy Codex title; unauthenticated review-capability GET returned 401; GET to the new POST-only lesson route returned 405. These checks establish deployment and boundary behavior, not successful owner reasoning.
- **Implemented / doctrine preserved:** Project review reads supporting evidence, commitments, notes and corrections for up to four relevance-selected owned projects, plus up to eight additional summary-only discovery sources. Explicit IDs and shared terms are retrieval hypotheses, not proof of dependencies. Human-edited lessons become active only through an explicit owner confirmation with conditions, project/account scope and frozen review references. Append-only retirement excludes the exact rule, and both writes invalidate affected cached reasoning. Read/retire remains available without a provider key; completed POST reviews return lessons to avoid restore races. Mission/lesson content stays inside bounded excerpts. The Goose incident, Cookbook-to-MasterChef method and shared runtime projection remain; the canonical Cookbook retains doctrine ownership. No schema, credentials, model selection, allowlist, aliases or synthetic records changed.
- **Verification / remaining gate:** Final reviewed branch `4c1b4bfb2b12493470679d1afb3b5a0b248b0853` passed CI verify, approval routing and security review. Local suite passed 264/264 tests, TypeScript and normal production build; lint had 0 errors / 8 existing warnings. New boundary checks use the actual Codex/Goose corpus. The published tree matched the tested local tree. Initial automated-review findings about key-independent lesson access and lost lesson lists were fixed. Successful owner-authenticated review quality and confirm → reload → reuse → retire behavior remain unverified: the existing owner browser session was unavailable, loopback browser access was blocked, and preview fetches encountered Vercel Authentication. A read-only production check before promotion found no review/lesson records; that does not establish an outage.
- **Next / working proof:** In the browser already holding Eddie's real projects, open Mission → Review project → Why this → Lessons carried forward. Confirm only a supported real lesson with its conditions; reload and run the next review, inspecting source attribution and whether the rule is applied appropriately. Retire a rule only if it should genuinely stop applying and check the next review excludes it. Preserve the existing saved-action/resumption loop. Sharing the URL with Vaughn does not grant a separate visitor model access or transfer Eddie's anonymous identity. [Five-step release and proof plan](Legacy_Codex_Intelligence_Release.txt).

## Legacy Codex project reconstruction and self-review — 2026-09-30

- **Shipped / production deployed:** [legacy-codex PR #90](https://github.com/edwardemoryphotography/legacy-codex/pull/90) merged as `1dd38e0002d4f2b2aa4c8c4684eab9bce8af33b6`. Canonical Vercel project `frontend` (`prj_irrXhfz1elCLhO1Pdgd0ffM4wfz2`) deployment `dpl_9kteRQwvf11k8rdyjpWrNCQcUZu6` is READY at that exact commit and owns https://legacy-codex.vercel.app/. Canonical page fetch returned HTTP 200 with Legacy Codex title; unauthenticated `GET /api/delta-review` returned the expected 401. Final branch `3d182dffe5e1c55695a2242695dbfea50c8cecff` passed standard verify (261/261 tests, TypeScript, normal production build, lint 0 errors / 8 existing warnings), approval routing and security review.
- **Implemented:** Explicit Review project reads authenticated, RLS-scoped mission context, related projects, linked evidence, commitments/resumption notes, saved project notes and human corrections; up to two explicitly linked public GitHub text files can supplement it. The model reconstructs intent, then critiques its proposal against the original sources. Why this? exposes the bigger picture, reasoning bridge, overlooked connection, self-check, unknowns, citations and bounds. Completed reviews supersede same-mission clause-only model proposals even when no move can be grounded; human-supplied steps and existing engine gates remain. Evidence conflict existence is checked across all linked rows before excerpt limits, including for Secondary missions. Context-matching cached reviews restore without another provider call; changing context or one-hour expiry invalidates them.
- **Doctrine preserved:** Codex → Root → North Star retains the Goose incident and cookbook-to-MasterChef method with canonical and pinned source links. Shared runtime instructions inherit reconstruction, boomerang, transferable lessons, disconfirmation and truth distinctions. Doctrine ownership remains `codex-system-architecture/notion-wiki/docs/GOOSE-COOKBOOK.md`. The North Star is to preserve rich human intent so another intelligence can reconstruct, execute, verify and continue it.
- **Unverified / bounded:** Successful owner-authenticated output, reasoning quality, correction/review/reload behavior and original-phone UI for this new review path are not runtime-verified: execution/browser access was unavailable in this session. HTTP and deployment checks do not prove those behaviors. This is a bounded reconstruction and critique loop, not autonomous code repair or permanent learning. No schema, credentials, model selection, aliases, allowlist or demonstration records changed. Earlier saved-action runtime proof remains distinct.
- **Next / Eddie's chosen demo scope:** Demonstrate Eddie's existing workflow to Vaughn using the account/browser that already holds his projects and saved action. Add one real project-context note, press Review project, inspect Why this?, correct any missed intent and verify the existing action after reload. No friend-account AI access is added; a new visitor has separate account scope. [Seven-step walkthrough](Legacy_Codex_Vaughn_Workflow.txt).

## Legacy Codex Vaughn UI/UX readiness — 2026-09-17

- **Shipped / resolved:** PR #79 closed as superseded, without merging or deleting its branch. Its two real merge conflicts are in MissionTab.tsx and ConstraintValidatorTab.tsx. Analyzer orb behavior was already shipped in #68/#70; #78 replaced the old Right Now card; #81's cognition-field redesign merged September 9 and is included in current production. Do not revive the duplicate hero to resolve this obsolete PR.
- **Deployed / runtime checked:** https://legacy-codex.vercel.app/ resolves to Vercel project frontend (prj_irrXhfz1elCLhO1Pdgd0ffM4wfz2), READY deployment dpl_3j4ngpxmqYmQTjC5pUFCcA8LFjoi at 689c621e6e3aa304fb5c52fe0eac04fce7f25de7. Live desktop browser connected, rendered Mission and its Why explanation, exposed New mission controls, read the existing completed action in Resumption Log, and reported live Claude analysis enabled. No relevant application console errors; Vercel found no runtime errors in the checked one-hour window.
- **Source verification:** Exact production source passed 191/191 tests, production build, TypeScript, and lint (0 errors, 8 existing warnings). No application source, aliases, credentials, schema, or deployment configuration changed.
- **Approved production proof — 2026-09-17:** Eddie explicitly approved creating one real Vaughn demonstration mission and one linked action and testing save/start/note/pause/reload/resume. That approval remains valid; do not ask again for this same bounded flow. Mission `e21a444a-a287-4d08-b7be-509ee4faa03e` (“Show Vaughn the first working Legacy Codex UI/UX”) was created through the canonical UI, given its real finish line, and promoted to Primary. Action `90bc74c5-cc13-4164-9dc0-494ee46d6821` (“Verify the canonical mission-to-action walkthrough for Vaughn”) was saved, started, and paused with a real resumption note. After reload the UI reconnected and displayed Ready to resume with that full note. A subsequent read-only Supabase query independently confirmed the exact action ID, mission linkage, status TODO, exact note, and linked_action_count = 1. No duplicate exists for this mission. Vercel reported no runtime errors in the checked one-hour window.
- **Final resume proof — 2026-09-17:** Browser access recovered with the same anonymous session and the existing mission/action intact. Clicking Start / resume after reload changed the action to In progress. Read-only SQL confirmed action `90bc74c5-cc13-4164-9dc0-494ee46d6821` has status IN_PROGRESS, the exact saved note, mission `e21a444a-a287-4d08-b7be-509ee4faa03e`, and linked_action_count = 1. Resumption Log independently rendered the same action In progress and its textarea ID `resume-90bc74c5-cc13-4164-9dc0-494ee46d6821`. The approved save → start → note → pause → reload → resume → cross-tab continuity proof is complete. The earlier outage was environmental and is resolved.
- **Product limitation observed:** Strategic Delta correctly reported insufficient context to derive a concrete operation for the first clause of this mission’s finish line. The explicit saved-action workflow worked. This run does not establish autonomous next-move quality for arbitrary ideas.
- **Next:** Show Vaughn the current canonical UI at https://legacy-codex.vercel.app/ using a real outcome and explicit next action. No further approval, orb integration, merge, or deployment is required for the verified workflow. The demonstration records remain in the verified cloud-browser session; a different physical iPhone/browser has its own anonymous identity. The broader prediction-quality limitation above remains distinct from persistence.

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
- **Next:** Verify the existing mission from Eddie's original browser session, preserving its stored authentication. Continue from this release; do not recreate repositories or reopen completed release mechanics. Eddie explicitly authorized this bounded app repair and taking it through release without routine Git approvals; the general app freeze still applies to unrelated work.
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
