# LEGACY CODEX — STANDARDS KIT v2 (index)

> v1 of this file was a single giant prompt pasted identically into every agent. v2 replaces it with **one master charter plus agent-specific run cards**, so Cursor, Claude Code, and ChatGPT Codex have one source of truth but clearly different jobs, coordinated through handoff files. See `standards/CHANGELOG.md`.

## The kit

| File | Purpose |
|---|---|
| `standards/MASTER-CHARTER.md` | Permanent rules: product boundaries, task lifecycle, design language, intelligence + reality governance, security, definition of SHIPPED |
| `standards/AGENT-BEHAVIOR.md` | Baseline agent conduct shared by every tool: think-before-coding, simplicity, surgical changes, verification |
| `standards/run-cards/CURSOR.md` | Cursor: repository-local implementation and visual work |
| `standards/run-cards/CLAUDE-CODE.md` | Claude Code: architecture, data flow, adversarial review |
| `standards/run-cards/CODEX.md` | ChatGPT Codex: cross-repo coordination, verification, deployment checks, reconciliation |
| `standards/HANDOFF-CONTRACT.md` | One agent per repo, claims/releases, evidence-based completion |
| `standards/INVENTORY-TEMPLATE.md` | Read-only ecosystem discovery (requires Eddie's approval before edits) |
| `STANDARDS-VERSION` | The kit version a repo consumes (drift detection) |

## Launcher prompts (paste these — short on purpose)

**ChatGPT Codex (run this FIRST — discovery):**

> You are the Legacy Codex coordinator. Read `standards/MASTER-CHARTER.md`, `standards/run-cards/CODEX.md`, and `standards/HANDOFF-CONTRACT.md` in the `codex-control-panel` repo (Standards Kit 2.1.0). Then execute Phase 1 only: build the evidence-backed ecosystem inventory from `standards/INVENTORY-TEMPLATE.md` across my repositories (`legacy-codex`, `codex-system-architecture`, and anything else that qualifies). Modify nothing. Deliver the inventory and a proposed migration order for my approval.

**Cursor (per approved repo — implementation):**

> You are the Legacy Codex implementer for the repository `<REPO NAME>`. Read `standards/MASTER-CHARTER.md` and `standards/run-cards/CURSOR.md` from `codex-control-panel` (Standards Kit 2.1.0), then this repo's `HANDOFF.md`. The approved migration plan assigns this repo to you now. Claim it in the handoff, define the product per charter §2 before building, implement to the charter, and leave an evidence-backed handoff entry. Reference implementation: `codex-control-panel`.

**Claude Code (per open PR — review):**

> You are the Legacy Codex adversarial reviewer. Read `standards/MASTER-CHARTER.md` and `standards/run-cards/CLAUDE-CODE.md` from `codex-control-panel` (Standards Kit 2.1.0), then `HANDOFF.md` in `<REPO NAME>`. Review PR `<#>` against the charter — lifecycle honesty, intelligence governance, provenance, security safeguards — and try to break it. File findings with severity and leave a handoff entry.

## Order of operations

1. Codex: inventory (read-only) → **Eddie approves**
2. Codex: migration plan → **Eddie approves**
3. Cursor: implement one repo at a time (handoff claim → PR)
4. Claude Code: adversarial review of each PR
5. Eddie: merge + set env vars
6. Codex: run the 7-step SHIPPED ladder (charter §10) and record evidence

Nothing is "shipped" until step 6 completes with evidence.
