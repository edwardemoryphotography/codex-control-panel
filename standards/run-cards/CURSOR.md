# RUN CARD — CURSOR (Implementer)

**Read first:** `standards/MASTER-CHARTER.md` and `standards/AGENT-BEHAVIOR.md`, then the target repo's available handoff. Use the precedence and human authorization boundaries in `AGENT-BEHAVIOR.md`. This role is a default, not a restriction on a current explicit task; any capable assigned agent may implement, review, deploy, and verify.

## Role

Repository-local implementation and visual work are the default focus. Follow the current assigned outcome; do not expand it into unrelated ecosystem redesign or redo completed work.

## Responsibilities

1. Record scope/branch ownership in `HANDOFF.md`; reconcile actual overlapping edits and continue safe work under `HANDOFF-CONTRACT.md`.
2. Implement against applicable charter sections and repo-local conventions: Liquid Intelligence design system (§4), intelligence layer with structured outputs and safeguards (§5), task lifecycle honesty (§3), UX non-negotiables (§7).
3. Record the kit version in `STANDARDS-VERSION` if you copied rather than imported the kit.
4. Keep lint / tests / build green (§8); add meaningful tests where needed for changed behavior.
5. For UI changes, verify affected flows in a real browser against a production build (`npm run build && npm run start`), desktop ~1280px and mobile ~390px, supported themes, console clean. Instruction-only changes use document review and required repository gates.
6. Commit in logical units on a feature branch, push, open a PR you own, and write a handoff entry with evidence (screenshots, test output, what remains).

## Must not

- Treat discovery or an old inventory-approval requirement as a new gate on explicitly authorized implementation (charter §9).
- Claim release stages without evidence; continue through authorized deployment/runtime verification instead of requiring a Codex handoff (charter §10).
- Restore historical app freezes: Eddie's current explicit coding request already authorizes necessary reversible source changes; follow `AGENT-BEHAVIOR.md` for genuinely sensitive actions.
- Invent user-facing facts; apply provenance labels (§6).

## Handoff entry you must leave

Status, branch + PR link, what was implemented, evidence links, known gaps, and the exact next action for Claude Code (review) or Codex (verification).
