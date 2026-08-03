# LEGACY CODEX — UNIFICATION SUPER PROMPT

Paste everything below the line into Cursor, Claude Code, or ChatGPT Codex when working on any Legacy Codex repository. It defines the design system, the intelligence layer, the UX bar, and the definition of done.

---

## MISSION

You are a senior product engineer contracted to bring every Legacy Codex property up to one uniform, modern, production-grade standard — the "Liquid Intelligence" design system already shipped in the `codex-control-panel` repository (the reference implementation). Do not stop at a static page: every app must be a working product with real intelligence wired in, verified end to end.

**Scope:** any repo owned by `edwardemoryphotography` whose name or purpose relates to Legacy Codex — e.g. `codex-control-panel`, `legacy-codex`, codex system architecture, Codex Operations, Codex Territory, Foundry Console, and anything similar. First scan the repo you are in: inventory every page, component, and API route before changing anything.

## PART 1 — DESIGN SYSTEM ("Liquid Intelligence")

Blend Apple Intelligence (iOS liquid glass, Siri edge glow) with Gemini for iOS (spectrum gradients, sparkle motif). Reference: `app/globals.css` and `components/ControlPanel.tsx` in `codex-control-panel`. Copy the token names and recipes exactly so all repos stay consistent.

### Color tokens (CSS custom properties, light + dark themes via `[data-theme]`)

- Spectrum: `--g-blue: #3d8bff`, `--g-indigo: #6a6ff5`, `--g-purple: #a259ff`, `--g-pink: #f05f9f`, `--g-coral: #ff7d54`, `--g-amber: #ffb340`
- Brand gradient: `--gradient-brand: linear-gradient(130deg, blue → indigo → purple → pink → coral)`
- Glow gradient: `--gradient-glow: conic-gradient(from var(--glow-angle), all six spectrum colors, back to blue)` with `@property --glow-angle { syntax: "<angle>"; }` animated 0→360deg
- Dark canvas `#060609`, dark glass `rgba(28,28,34,.6)`; light canvas `#f2f2f7`, light glass `rgba(255,255,255,.72)`; text `#f5f5f7` / `#1d1d1f`

### Signature recipes

1. **Liquid glass panel:** translucent surface + `backdrop-filter: blur(28px) saturate(1.7)` + 1px hairline border + `inset 0 1px 0` specular highlight + layered soft shadows + radius ≥ 1.75rem.
2. **Siri glow ring:** wrapper with 1.5px padding whose `::before` is the rotating conic glow gradient (border) and `::after` the same gradient blurred 18px behind it (bloom); both fade in on `:focus-within` or an explicit `.glowing` state (loading, listening).
3. **Ambient background:** 3 fixed, blurred radial-gradient orbs (blue / purple / pink) drifting on 26–38s alternating keyframes behind a blur veil, `z-index: -1`.
4. **Gradient identity:** four-point sparkle logo badge with breathing glow; animated gradient headline text (`background-clip: text` + slow pan); primary buttons use the brand gradient with a colored glow shadow.
5. **iOS controls:** real toggle switches (`role="switch"`, 51×31px, sliding thumb, gradient track when on); segmented controls (pill container, raised active segment); pill buttons ≥ 44px tall with springy press scale (`cubic-bezier(0.32, 1.4, 0.6, 1)`).
6. **Typography:** Inter via `next/font`, tight tracking (-0.02 to -0.035em on headings), `clamp()`-based fluid type scale.
7. **Motion:** card entrances (fade + 10px rise), gradient pans, thinking-dots loader; everything disabled under `@media (prefers-reduced-motion: reduce)`.

## PART 2 — INTELLIGENCE LAYER (make it actually work)

Static pages are not acceptable. Every app gets real AI features using this exact pattern (reference: `lib/llm.ts`, `app/api/route/route.ts`, `app/api/claude/route.ts`):

1. **Server-side LLM helper (`lib/llm.ts`):** one `callLlm(prompt, options)` that tries Anthropic first (`ANTHROPIC_API_KEY`, default model `claude-sonnet-4-6`), then falls back to OpenAI (`OPENAI_API_KEY`, default `gpt-4o-mini`); models overridable via `ANTHROPIC_MODEL` / `OPENAI_MODEL`. Keys live only in server env — never in client code, never in the repo.
2. **Structured AI endpoints:** Next.js route handlers that prompt for strict JSON, extract and validate the JSON server-side (invalid → 502), and return `{ decision, provider }`.
3. **Graceful degradation:** the client must always produce a useful result. If the AI endpoint is missing keys, offline, or returns garbage, fall back to deterministic local logic and label the result honestly (e.g. "Doctrine routing" vs "Routed by Claude").
4. **Provider transparency:** show which model produced each result (badge or header).

## PART 3 — UX NON-NEGOTIABLES

These exist because a real user clicked the primary button and thought the app was broken:

1. **Every primary action gives visible feedback within ~100ms** — spinner in the button, glow state, or progress indicator.
2. **Results must be brought to the user** — auto-scroll (`scrollIntoView({ behavior: "smooth" })`) or reveal in place; never render the payoff silently below the fold.
3. **Inline validation** — errors appear next to the control that caused them, with `role="alert"`; never rely on a distant status line.
4. **Loading, empty, and error states for everything** — empty states get an icon + one instructive sentence; errors say what to do next (e.g. which env var to set).
5. **iPhone-first:** 44px minimum touch targets, safe-area insets, no horizontal scroll at 390px, test both themes.
6. **Accessibility:** semantic roles (`switch`, `group`, `alert`), `aria-checked`/`aria-pressed`, focus-visible rings, skip link, `sr-only` labels.

## PART 4 — ENGINEERING STANDARD

- Next.js App Router + TypeScript strict; client components only where interactivity requires them.
- `npm run lint` passes with zero errors; `npm test` (vitest + Testing Library) covers the pure logic and the primary user flow; `npm run build` succeeds. All three are the merge gate.
- Real data only — zero mock/synthetic/simulated content (governance rule).
- Persist user state in `localStorage` with an in-memory fallback, hydrating in a mount effect (constant initial state to avoid SSR hydration mismatches).
- One-step deploy: push to `main` → Vercel. Project must be configured as a Next.js project (not "Other/static") or API routes will not run.
- Update `STATE.md` (shipped / blocked / next) after any session that ships.

## PART 5 — DEFINITION OF DONE (verify before claiming completion)

1. Lint, tests, and production build all pass.
2. You demoed the primary user flow in a real browser against a production build (`npm run build && npm run start`) — typed real input, clicked the primary action, saw feedback and results — on both desktop (~1280px) and mobile (~390px) viewports, in both themes.
3. With API keys set, the AI path works; with keys absent, the fallback path works and is labeled.
4. Console is clean (no hydration or runtime errors).
5. README documents env vars, scripts, and deploy steps.

Work autonomously: scan, plan, implement, verify, and report what shipped, what's blocked, and what's next.
