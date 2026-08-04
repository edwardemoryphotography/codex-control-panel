# LEGACY CODEX — MASTER CHARTER

**Standards Kit version: 2.0.0** · Canonical home: `codex-control-panel/standards/` (until extracted to its own package)
**Precedence:** Eddie's explicit instructions > this charter > run cards > anything else. Agents read this charter and their run card before touching any repository.

---

## 1. What this charter governs

Every Legacy Codex property: `codex-control-panel`, `legacy-codex`, `codex-system-architecture`, Foundry Console, Codex Operations, Codex Territory, and any repository the approved ecosystem inventory (§9) assigns to the family. Each repository consumes this kit as a **versioned standard**: if code or tokens are copied rather than imported, the repo MUST contain a `STANDARDS-VERSION` file recording the exact kit version copied (e.g. `2.0.0`), so drift is detectable.

## 2. Product definition comes before code

No repository receives features — AI or otherwise — until its `PRODUCT.md` (or README section) answers:

1. **User** — who actually uses this?
2. **Primary job** — the single job it must do well.
3. **Source of truth** — where its displayed data really comes from.
4. **Primary workflow** — the one flow that must work end to end.
5. **Is AI actually required?** If AI does not serve the primary job, it is decorative — leave it out.
6. **What AI may decide** on its own.
7. **What requires user confirmation** before anything happens.
8. **What AI must never do** in this product.

Foundry Console, Codex Territory, the architecture site, and Legacy Codex itself have different answers. Do not give them identical generic AI.

## 3. Task lifecycle — recommendation is not execution

Any product that routes, dispatches, or orchestrates work models this explicit lifecycle:

```
Captured → Classified → Routed → Approved → Executing → Completed | Failed
```

Every task result record includes:

- **Task ID** (stable, visible in the UI, carried through history/exports)
- **Selected system or agent**, and **why it was selected**
- **Required inputs**
- **Proposed executable action**
- **Execution status** (explicitly "Not executed" until something runs)
- **Evidence of completion** (the actual output, link, or artifact)
- **Failure and recovery information** when it fails

**The interface must never imply work was executed when it was merely recommended.** Transitions from Routed to Executing require an explicit user action (Approve/Run) unless the product definition (§2) grants that decision to AI.

## 4. Design language ("Liquid Intelligence")

Apple Intelligence liquid glass × Gemini spectrum gradients. Reference implementation: `codex-control-panel` (`app/globals.css`, `components/ControlPanel.tsx`).

**Tokens (identical names in every repo):** spectrum `--g-blue #3d8bff`, `--g-indigo #6a6ff5`, `--g-purple #a259ff`, `--g-pink #f05f9f`, `--g-coral #ff7d54`, `--g-amber #ffb340`; `--gradient-brand` (130° linear across the spectrum); `--gradient-glow` (conic, animated via `@property --glow-angle`); dark canvas `#060609` / glass `rgba(28,28,34,.6)`; light canvas `#f2f2f7` / glass `rgba(255,255,255,.72)`; text `#f5f5f7` / `#1d1d1f`.

**Recipes:** liquid-glass panels (`backdrop-filter: blur(28px) saturate(1.7)`, hairline border, inset specular highlight, radius ≥ 1.75rem); Siri glow ring on primary inputs (rotating conic border + blurred bloom, active on focus/busy); three drifting ambient orbs behind a blur veil; sparkle badge + animated gradient headlines + gradient primary buttons; iOS switches (`role="switch"`), segmented controls, ≥44px pill buttons with springy press; Inter via `next/font`, tight tracking, `clamp()` type scale; all motion disabled under `prefers-reduced-motion`.

Consume these from the kit — do not restyle per repo. Propose token changes as kit version bumps, never as local edits.

## 5. Intelligence governance

### 5.1 Provider policy ≠ failover

Provider **selection** is a policy decision based on: task type, required capability, cost ceiling, latency tolerance, context size, tool requirements, provider availability, and user preference. **Failover** is what happens when the selected provider errors, and is a separate mechanism. Every failover is **recorded with its reason** (never silent). Reference: `lib/llm.ts` (`providerOrder(purpose)` for policy, ordered fallback with a `failovers` audit trail for failover).

### 5.2 Structured outputs

Never "prompt for JSON and hope it parses." Use native schema-constrained outputs: OpenAI `response_format: json_schema` with `strict: true`; Anthropic forced tool use with an `input_schema`. Then **runtime-validate anyway** (Zod or an equivalent hand-rolled validator) before using the result — provider schema enforcement is defense layer one, not the only layer.

### 5.3 Model policy

- Models configured explicitly through environment variables (`ANTHROPIC_MODEL`, `OPENAI_MODEL`); library defaults are permitted only if surfaced (health endpoint warns when a default is in effect).
- Validate configured model availability at startup or deployment (health check).
- **Record provider and model with every result**, end to end into the UI.
- Pin models when reproducibility matters.
- Apply timeouts (`AbortSignal.timeout`), retry limits, and spending/token ceilings.

### 5.4 Production safeguards (required on every AI endpoint)

Authentication/authorization where the product has users or writes shared state (single-user personal tools exposing no secrets may defer authn but MUST still have the rest); rate limiting; request-size limits; prompt-injection defenses (wrap untrusted input in delimiters, instruct the model to treat it as data); sensitive-data redaction; provider timeouts and cancellation (`AbortController`); cost and token ceilings; idempotency protection for mutating actions; request IDs on every request and response; structured audit events; usage and latency telemetry; safe client-facing error messages (full provider errors go to server logs only); a health endpoint covering AI configuration. Keys live only in server environment variables — never in client code, never in the repo.

### 5.5 Graceful degradation

Every AI feature has a deterministic local fallback and the UI labels the source honestly (e.g. "Routed by Claude (model)" vs "Doctrine routing").

## 6. Reality and provenance governance

Zero mock/synthetic/simulated user-facing content. Beyond that, every personal or project **claim** displayed in a product carries a provenance level:

- `verified` — confirmed by Eddie or an authoritative source
- `repository_evidence` — derived from code/data actually in a repo
- `concept` — an idea or plan, clearly labeled as such
- `unknown` — origin unclear; must not be presented as fact

Where practical, also record **source**, **last-verified date**, and **public/private** classification. Concepts may exist honestly; nothing may masquerade as fact.

## 7. UX and accessibility non-negotiables

1. Every primary action gives visible feedback within ~100ms (spinner, glow, progress).
2. Results are brought to the user (auto-scroll or in-place reveal) — never rendered silently below the fold.
3. Inline validation next to the control, with `role="alert"`.
4. Loading, empty, and error states for everything; errors say what to do next.
5. iPhone-first: ≥44px touch targets, safe-area insets, no horizontal scroll at 390px, both themes tested.
6. Semantic roles (`switch`, `group`, `alert`), `aria-checked`/`aria-pressed`, focus-visible rings, skip links, `sr-only` labels.

## 8. Engineering gates

Next.js App Router + TypeScript strict. `npm run lint` (0 errors), `npm test` (covering pure logic + the primary flow), and `npm run build` all pass — this is the merge gate. Persist client state in `localStorage` with an in-memory fallback, hydrating in a mount effect with constant initial state (no SSR hydration mismatches). One-step deploy: push to `main` → Vercel, configured as a Next.js project. Update `STATE.md` after any session that ships, blocks, or unblocks.

## 9. Process: discovery before modification

**Phase 0 — Read the handoff.** Open the repo's `HANDOFF.md` (see Handoff Contract) before doing anything.

**Phase 1 — Ecosystem inventory (read-only).** Before any repository is edited, produce the evidence-backed inventory using `INVENTORY-TEMPLATE.md` (repository, relationship, product role, current state, data source, deployment, risks, migration priority). **No repository is modified until Eddie approves the inventory.**

**Phase 2 — Migration plan.** An approved ordered list: which repos get worked now, later, archived, or merged, and the shared-system strategy.

**Phase 3 — Implementation.** One agent modifies a repository at a time, on its own branch, with PR ownership recorded in the handoff.

**Phase 4 — Verification and reconciliation.** Independent verification against §10, recorded with evidence.

## 10. Definition of SHIPPED (a PR is not shipped)

"PR opened" and "passes locally" are progress, not completion. A change is **shipped** only when all of the following are true, with evidence recorded in the handoff:

1. PR reviewed and **merged**.
2. Required environment variables configured in the deployment platform.
3. A **new deployment** created from the merged commit.
4. The **live deployment** tested — primary flow exercised with real input.
5. AI provider badge/metadata confirmed live (proving real AI is active, not just the local fallback below the fold).
6. Fallback path **deliberately** tested (e.g. temporarily unset key or simulate failure).
7. Production logs checked for errors.

Report status honestly: "implemented, PR open, not yet shipped" is the correct phrasing until all seven hold.
