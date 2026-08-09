# ECOSYSTEM INVENTORY — TEMPLATE

Read-only discovery across every Legacy Codex-related repository. Every field needs evidence (file path, commit, URL) — no guesses. **No repository is modified until Eddie approves this inventory** (Master Charter §9).

## Per-repository record

| Field | Purpose | Evidence required |
|---|---|---|
| Repository | Exact repository name | GitHub URL |
| Relationship | Why it belongs to Legacy Codex | Naming, content, or cross-references |
| Product role | What it is supposed to do | README/code inspection |
| Current state | `static` / `prototype` / `functional` / `deployed` / `abandoned` | Build attempt, last commit date, live check |
| Data source | Real source of displayed information | Code paths that produce the data |
| Deployment | Current live environment (URL, platform, project config) | Live URL check, platform settings if visible |
| Risks | Auth gaps, exposed secrets, simulated claims, broken workflows | Specific files/lines/screens |
| Migration priority | `now` / `later` / `archive` / `merge (into X)` | One-sentence rationale |
| Standards version | Contents of `STANDARDS-VERSION` if present | File contents or "absent" |

## Known candidates (verify, then extend)

`codex-control-panel` (reference implementation) · `legacy-codex` (note: FREEZE SPEC on `app/index.html`) · `codex-system-architecture` · Foundry Console (repo not yet located — confirm whether it exists) · Codex Operations / Codex Territory (May 19 artifacts — confirm where they live)

## Output

One markdown table (or one record block per repo) + a proposed migration order, delivered to Eddie for approval before Phase 2.
