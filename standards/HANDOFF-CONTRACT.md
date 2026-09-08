# HANDOFF CONTRACT

Prevents Cursor, Claude Code, and ChatGPT Codex from repeating audits, duplicating work, or undoing each other's changes.

## The rules

1. Every Legacy Codex repository has a `HANDOFF.md` at its root.
2. **Read before editing.** Read this contract and the target repo's existing handoff before modifying its scope. If absent, bootstrap the handoff during the authorized task; missing documentation is not a new permission gate.
3. **Prevent conflicting writes.** Record scope, branch, and PR in a `CLAIM` entry; release with `RELEASE` when the run ends. Inspect active claims and branch activity. Continue safe non-overlapping work in an isolated checkout; reconcile an actual overlapping edit before writing it. A historical claim is not a repository-wide permission gate.
4. **Branch and PR ownership:** preserve others' work. When continuing an existing task, inspect and reuse its PR, record the continuation, and append commits without rewriting shared history. Do not create competing PRs for the same scope or overwrite concurrent changes. Shared-history rewrites require specific authorization under `AGENT-BEHAVIOR.md`.
5. **Stale claims:** a claim older than 24h with no entries or newer branch activity may be cleared by the assigned agent with an explicit `RELEASE (stale)` entry — never silently. A current user instruction to continue work may transfer ownership sooner; record the evidence and preserve concurrent edits.
6. **Evidence-based completion:** no entry may say "done" without links or artifacts (PR, test output, screenshots, live URL check). Use the honest status vocabulary below.
7. Entries are append-only, newest last. Never rewrite history.

## Status vocabulary

`inventoried` · `planned` · `implementing` · `implemented — PR open, not yet shipped` · `in review` · `changes requested` · `merged — not yet shipped` · `SHIPPED (evidence attached)` · `blocked (reason)` · `archived`

## Entry template

```markdown
---
### [2026-08-03 20:15 UTC] AGENT: Cursor — CLAIM
Branch: cursor/foundry-liquid-ui-2000 · PR: #12
Scope: apply design system + intelligence layer to task screen
Status: implementing

### [2026-08-03 22:40 UTC] AGENT: Cursor — RELEASE
Status: implemented — PR open, not yet shipped
Evidence: PR #12; 32 tests passing (CI link); screenshots in PR body
Gaps: no live-run feature yet (product definition says not required)
Next: Claude Code adversarial review of PR #12
```

## Bootstrap

If `HANDOFF.md` does not exist in a repo, the first agent creates it with a header linking to this contract and the current Standards Kit version, then adds its first entry.
