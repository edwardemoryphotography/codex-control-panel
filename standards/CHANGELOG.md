# Legacy Codex Standards Kit — Changelog

## 2.1.1 — 2026-08-11

- **FREEZE SPEC phantom-path cleanup (correction to 2.1.0)** — the 2.1.0 entry below claimed the `app/index.html` phantom path was replaced "everywhere it was flagged in this release." That was inaccurate: two live references survived the pass — `standards/INVENTORY-TEMPLATE.md` (a descriptive note) and `standards/run-cards/CURSOR.md` (an active "must not" instruction Cursor reads). Both now carry the approved wording from `STATE.md` §FROZEN instead of the phantom path. A repo-wide grep found no other surviving occurrences outside historical changelog/STATE.md entries that intentionally quote the old wrong path as context for the correction — those are left as-is.

## 2.1.0 — 2026-08-10

Consolidation pass across the four Codex-family repos (`codex-control-panel`, `legacy-codex`, `codex-system-architecture`, `Artful-Intelligence`) to stop drifting copies of agent/standards docs. Additive only — no removed rules, hence a minor bump.

- **`standards/AGENT-BEHAVIOR.md` (new)** — absorbed from `codex-system-architecture/CLAUDE.md` § Agent behavior, a ~50-line generic (non-project-specific) behavioral guide adapted from the Karpathy guidelines (think-before-coding, simplicity-first, surgical changes, goal-driven execution, verification-before-claiming-done). It was sitting duplicated-in-spirit across three repos in three different wordings; this is now the one canonical copy. `codex-system-architecture/CLAUDE.md` was shortened to a pointer.
- **`standards/run-cards/CLAUDE-CODE.md`** — absorbed three Claude-Code-specific tooling notes that were duplicated across `Artful-Intelligence/AGENTS.md` and the user's global `~/.claude/CLAUDE.md`: the `claude mcp add` registration method, move-to-repo-root-before-editing, and canonical-vs-archived repo verification.
- **`STATE.md` (hub)** — absorbed two real shipped entries (`Legacy Codex hygiene pass 2026-08-04`, `PR #47 routing-control-plane live-DB verification 2026-08-07`) that existed only in `legacy-codex`'s `main` branch copy of `STATE.md` and were about to be lost when that repo's copy was replaced with a pointer. Added a new § CANONICAL REPOS section (absorbed from `Artful-Intelligence/AGENTS.md` § Agent Guardrails and the user's global CLAUDE.md) recording canonical-vs-archived paths for the ecosystem. Corrected/flagged the § FROZEN entry: the frozen path has always been written as `legacy-codex`'s `app/index.html`, which does not exist in that repo (it's a Next.js App Router app; real entry point is `src/app/page.tsx`) — this is now stated explicitly rather than propagated silently into more docs. `codex-control-panel/STATE.md` is now the single canonical cross-project status file (Master Charter §8); satellite repos keep only short local pointers.
- **Master Charter** — precedence line now includes `AGENT-BEHAVIOR.md`; added an explicit "adoption is not automatic" note so §4 (design tokens) and §3/§5 (AI task lifecycle) aren't read as binding on repos that don't build that surface; §8 names the hub `STATE.md` as canonical.
- **`legacy-codex`** — PR #35 (`claude/workspace-docs-setup-kb2cmo`) had drifted into merge conflict with `main`: `main` had grown a real "cognitive doctrine" + "deployment sanity gate" section in `AGENTS.md` and two new shipped entries in `STATE.md` that PR #35's branch would have silently deleted. Reconciled rather than blind-merged: doctrine/gate sections kept, PR #35's router pattern kept, `STATE.md` reduced to a pointer + repo-local FREEZE/LESSONS notes, `CLAUDE.md` updated with the newer `/api/analyze` and deployment-model sections that only existed on `main`.
- **FREEZE SPEC wording finalized 2026-08-10 (Eddie-approved)** — replaces the `app/index.html` phantom path everywhere it was flagged in this release with: "in `legacy-codex`, don't rewrite `src/app/` (`page.tsx`, `layout.tsx`, `globals.css`, `api/`), `src/components/`, `src/lib/`, or `src/hooks/` unless Eddie explicitly says 'REWRITE THE APP CODE'. Docs, config, and coordination files are not frozen." Every copy carries a permanent "do not restore the old wording" note so a future agent doesn't revert the fix.

## 2.0.0 — 2026-08-03

Restructured from a single super prompt (v1, `SUPERPROMPT.md`) into a governed kit:

- **Master Charter** — permanent rules: product-definition-before-code, explicit task lifecycle (Captured → Classified → Routed → Approved → Executing → Completed/Failed) with "recommendation is not execution", design tokens, intelligence governance (provider policy separated from failover, native structured outputs + runtime validation, explicit model policy, production safeguards), provenance labels (`verified` / `repository_evidence` / `concept` / `unknown`), discovery-before-modification process, and a 7-step definition of SHIPPED that separates "PR opened" from "shipped".
- **Run cards** — distinct jobs: Cursor (implementation), Claude Code (architecture + adversarial review), ChatGPT Codex (coordination, verification, deployment checks, reconciliation).
- **Handoff Contract** — one agent per repo, claims/releases, evidence-based completion, honest status vocabulary.
- **Inventory Template** — evidence-backed ecosystem discovery requiring Eddie's approval before edits.
- Repos copying (rather than importing) the kit must record the version in `STANDARDS-VERSION`.

## 1.0.0 — 2026-08-03

Initial single-document super prompt: Liquid Intelligence design system, intelligence layer with Claude→GPT failover, UX non-negotiables, engineering gates, definition of done.
