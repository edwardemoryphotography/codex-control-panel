# Legacy Codex Standards Kit — Changelog

## 2.0.0 — 2026-08-03

Restructured from a single super prompt (v1, `SUPERPROMPT.md`) into a governed kit:

- **Master Charter** — permanent rules: product-definition-before-code, explicit task lifecycle (Captured → Classified → Routed → Approved → Executing → Completed/Failed) with "recommendation is not execution", design tokens, intelligence governance (provider policy separated from failover, native structured outputs + runtime validation, explicit model policy, production safeguards), provenance labels (`verified` / `repository_evidence` / `concept` / `unknown`), discovery-before-modification process, and a 7-step definition of SHIPPED that separates "PR opened" from "shipped".
- **Run cards** — distinct jobs: Cursor (implementation), Claude Code (architecture + adversarial review), ChatGPT Codex (coordination, verification, deployment checks, reconciliation).
- **Handoff Contract** — one agent per repo, claims/releases, evidence-based completion, honest status vocabulary.
- **Inventory Template** — evidence-backed ecosystem discovery requiring Eddie's approval before edits.
- Repos copying (rather than importing) the kit must record the version in `STANDARDS-VERSION`.

## 1.0.0 — 2026-08-03

Initial single-document super prompt: Liquid Intelligence design system, intelligence layer with Claude→GPT failover, UX non-negotiables, engineering gates, definition of done.
