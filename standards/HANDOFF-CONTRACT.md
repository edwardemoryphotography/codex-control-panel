# HANDOFF CONTRACT

Prevents Cursor, Claude Code, and ChatGPT Codex from repeating audits, duplicating work, or undoing each other's changes.

## The rules

1. Every Legacy Codex repository has a `HANDOFF.md` at its root.
2. **Read before acting.** Every agent reads the target repo's `HANDOFF.md` (and this contract) before its first action there.
3. **One agent modifies a repository at a time.** Claim the repo by appending a `CLAIM` entry; release it with a `RELEASE` entry when your run ends. If a claim is held, do read-only work or stop and report.
4. **Branch and PR ownership:** the claiming agent owns its branch and PR. Other agents comment/review; they do not force-push, rebase, or open competing PRs for the same scope.
5. **Stale locks:** a claim older than 24h with no entries may be cleared by Codex with an explicit `RELEASE (stale)` entry — never silently.
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
