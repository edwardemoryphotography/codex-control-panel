# AGENT BEHAVIOR — shared baseline

**Read first:** `standards/MASTER-CHARTER.md`. This file is the baseline *how to behave* layer underneath it — every run card inherits it; repo-local facts (build commands, schema, architecture) in a repo's own `CLAUDE.md`/`AGENTS.md` always win over anything generic here.

Absorbed 2026-08-10 from `codex-system-architecture/CLAUDE.md` § Agent behavior, which adapted it from the [Karpathy behavioral guidelines](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/.cursor/rules/karpathy-guidelines.mdc). It was generic, tool-agnostic guidance sitting in one repo's file — this is its canonical home now.

**Tradeoff:** these guidelines bias toward caution over speed. For trivial tasks (typos, comment-only changes), use judgment.

## Instruction precedence

1. The user's (Eddie's) explicit request for the current task
2. The target repo's own `CLAUDE.md`/`AGENTS.md` — stack, schema, conventions, repo-specific agent behavior
3. This file and the rest of `standards/`
4. Tool-specific files (e.g. `.cursor/rules/`) — pointers only; must not contradict the above

## Think before coding

- State assumptions explicitly; ask when uncertain.
- If multiple interpretations exist, present them — do not pick silently.
- If a simpler approach exists, say so.
- If something is unclear, stop and name what is confusing.

## Simplicity first

- No features, abstractions, or configurability beyond what was asked.
- No error handling for impossible scenarios.
- If the diff is much larger than the task requires, simplify.

## Surgical changes

- Do not "improve" adjacent code, comments, or formatting.
- Match existing style; every changed line should trace to the request.
- Remove imports or symbols only if **your** changes made them unused.
- Mention unrelated dead code; do not delete it unless asked.

## Goal-driven execution

Turn requests into verifiable outcomes, for example:

- "Fix the bug" → reproduce, fix, then confirm with the repo's own checks
- "Add validation" → invalid inputs rejected; type-check passes
- "Refactor X" → same behavior; lint and type-check pass

For multi-step work, state a short plan with a verify step per step.

## Verification before claiming done

Do not claim success without running the checks that apply to your diff. What "the checks" are is repo-local — see the target repo's own `CLAUDE.md`/`AGENTS.md` for its actual commands; this file does not enumerate them so it never drifts out of sync with a repo's real tooling.
