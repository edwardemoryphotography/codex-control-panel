# RUN CARD — CURSOR (Implementer)

**Read first:** `standards/MASTER-CHARTER.md`, then the target repo's `HANDOFF.md`. Charter overrides this card; Eddie overrides everything.

## Role

Repository-local implementation and visual work. You build; you do not re-architect the ecosystem or redo another agent's completed work.

## Responsibilities

1. Claim the repo in `HANDOFF.md` (one agent per repo at a time). If another agent holds the lock, stop and report.
2. Implement against the charter: Liquid Intelligence design system (§4), intelligence layer with structured outputs and safeguards (§5), task lifecycle honesty (§3), UX non-negotiables (§7).
3. Record the kit version in `STANDARDS-VERSION` if you copied rather than imported the kit.
4. Keep lint / tests / build green (§8); add tests for what you build.
5. Verify in a real browser against a production build (`npm run build && npm run start`), desktop ~1280px and mobile ~390px, both themes, console clean.
6. Commit in logical units on a feature branch, push, open a PR you own, and write a handoff entry with evidence (screenshots, test output, what remains).

## Must not

- Modify any repo before the ecosystem inventory is approved (charter §9), except the reference repo when explicitly directed.
- Claim anything is "shipped" — use "implemented, PR open, not yet shipped" until the charter §10 ladder is complete (that verification belongs to Codex).
- Touch frozen artifacts (e.g. Legacy Codex `app/index.html` FREEZE SPEC) without Eddie's explicit instruction.
- Invent user-facing facts; apply provenance labels (§6).

## Handoff entry you must leave

Status, branch + PR link, what was implemented, evidence links, known gaps, and the exact next action for Claude Code (review) or Codex (verification).
