# LEGACY CODEX — STANDARDS KIT v2 (index)

> v1 of this file was a single giant prompt pasted identically into every agent. v2 replaces it with **one master charter plus agent-specific run cards**, so coding agents share one source of truth and optional role defaults, coordinated through handoff files. Current explicit task intent determines the job; run cards do not limit a tool's authorized capabilities. See `standards/CHANGELOG.md`.

## The kit

| File | Purpose |
|---|---|
| `standards/MASTER-CHARTER.md` | Permanent rules: product boundaries, task lifecycle, design language, intelligence + reality governance, security, definition of SHIPPED |
| `standards/AGENT-BEHAVIOR.md` | Baseline agent conduct shared by every tool: think-before-coding, simplicity, surgical changes, verification |
| `standards/run-cards/CURSOR.md` | Cursor: repository-local implementation and visual work |
| `standards/run-cards/CLAUDE-CODE.md` | Claude Code: architecture, data flow, adversarial review |
| `standards/run-cards/CODEX.md` | ChatGPT Codex: cross-repo coordination, verification, deployment checks, reconciliation |
| `standards/HANDOFF-CONTRACT.md` | Non-overlapping scope, claims/releases, evidence-based completion |
| `standards/INVENTORY-TEMPLATE.md` | Evidence-backed ecosystem discovery when requested; no blanket edit gate |
| `STANDARDS-VERSION` | The kit version a repo consumes (drift detection) |

## Launcher prompts (optional task examples)

These examples apply only when Eddie chooses that scope. A discovery-only example is not a standing instruction to stop implementation requests.

**Discovery-only task (any agent):**

> You are the Legacy Codex coordinator. Read `standards/MASTER-CHARTER.md`, `standards/run-cards/CODEX.md`, and `standards/HANDOFF-CONTRACT.md` in the `codex-control-panel` repo (Standards Kit 2.2.0). Then execute Phase 1 only: build the evidence-backed ecosystem inventory from `standards/INVENTORY-TEMPLATE.md` across my repositories (`legacy-codex`, `codex-system-architecture`, and anything else that qualifies). Modify nothing. Deliver the inventory and a proposed migration order for my approval.

**Implementation task (any capable agent):**

> You are the Legacy Codex implementer for the repository `<REPO NAME>`. Read `standards/MASTER-CHARTER.md` and `standards/run-cards/CURSOR.md` from `codex-control-panel` (Standards Kit 2.2.0), then this repo's `HANDOFF.md`. The current request assigns this repo and outcome to you now. Claim it in the handoff, define the product per charter §2 before building, implement to the charter, and leave an evidence-backed handoff entry. Reference implementation: `codex-control-panel`.

**Claude Code (per open PR — review):**

> You are the Legacy Codex adversarial reviewer. Read `standards/MASTER-CHARTER.md` and `standards/run-cards/CLAUDE-CODE.md` from `codex-control-panel` (Standards Kit 2.2.0), then `HANDOFF.md` in `<REPO NAME>`. Review PR `<#>` against the charter — lifecycle honesty, intelligence governance, provenance, security safeguards — and try to break it. File findings with severity and leave a handoff entry.

## Order of operations

1. Read relevant repository guidance and existing evidence; inspect the requested scope.
2. Infer routine details and plan the smallest sufficient solution. Ask only for missing material decisions or required specific authorization under `AGENT-BEHAVIOR.md`.
3. Preserve concurrent work, record scope, implement, and verify with applicable repository gates.
4. Publish the commit/PR and continue through merge, deployment, and runtime verification when those are part of the authorized outcome, respecting actual repository protections.
5. Record evidence for Merged → Deployed → Runtime Verified → Live, applicable gaps, and durable lessons. Instruction-only work does not require application deployment/runtime checks.
