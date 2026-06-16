export type RouteKey =
  | "execution"
  | "research"
  | "architecture"
  | "deployment"
  | "documentation"
  | "system_state"
  | "override";

export type RouteDef = {
  key: RouteKey;
  label: string;
  tool: string;
  map: string;
  reason: string;
  role: string;
  output: string;
  keywords: string[];
};

export type ScoredRoute = RouteDef & { score: number };

export type PromptPart = {
  part: string;
  tool: string;
  category: string;
  reason: string;
  prompt: string;
};

export type RouteResult = {
  createdAt: string;
  task: string;
  mode: string;
  strength: number;
  primaryRoute: string;
  primaryKey: RouteKey;
  nextAction: string;
  currentTool: string;
  override: { active: boolean; reason: string };
  prompts: PromptPart[];
};

export type Corrections = Record<string, Partial<Record<RouteKey, number>>>;

export const ROUTES: RouteDef[] = [
  {
    key: "execution",
    label: "execution",
    tool: "Gemini",
    map: "Runtime, code, execution, iteration",
    reason:
      "Build-heavy: needs runtime output, code generation, or iteration.",
    role: "ROLE: Execution engine. Build the deliverable now. Return production-ready code or a completed artifact. Avoid theory unless it directly unlocks the build.",
    output:
      "OUTPUT: final files, implementation steps only when required, no pseudo-code.",
    keywords: [
      "build",
      "code",
      "implement",
      "execute",
      "script",
      "app",
      "automation",
      "generate",
      "debug",
      "fix",
      "refactor",
      "prototype",
      "create",
      "runtime",
      "workflow",
      "agent",
      "tool",
      "ui",
      "frontend",
      "backend",
      "html",
      "css",
      "javascript",
      "python",
    ],
  },
  {
    key: "research",
    label: "research",
    tool: "Perplexity",
    map: "Web truth, research, fact checks",
    reason:
      "Depends on current facts, validation, comparison, or web truth.",
    role: "ROLE: Web truth engine. Validate current facts, patterns, APIs, or references. Cite sources inline and keep output structured for immediate use.",
    output:
      "OUTPUT: verified findings, a clear recommendation, concise citations.",
    keywords: [
      "research",
      "compare",
      "latest",
      "current",
      "verify",
      "fact-check",
      "market",
      "pricing",
      "competitor",
      "browse",
      "find",
      "source",
      "trend",
      "news",
      "documentation",
      "docs",
      "api status",
      "version",
    ],
  },
  {
    key: "architecture",
    label: "architecture",
    tool: "Claude / ChatGPT",
    map: "Architecture, reasoning, decomposition",
    reason:
      "Needs decomposition, reasoning, planning, decision structure, or system design.",
    role: "ROLE: Architect. Convert ambiguity into a buildable system. End-state first, reverse-engineer, simplify, structure, then output for execution.",
    output:
      "OUTPUT: END STATE, SYSTEM BREAKDOWN, EXECUTION PATH, RISKS / BOTTLENECKS, NEXT ACTION.",
    keywords: [
      "architecture",
      "system",
      "design",
      "strategy",
      "reason",
      "breakdown",
      "plan",
      "framework",
      "spec",
      "scope",
      "reverse engineer",
      "clarify",
      "bottleneck",
      "roadmap",
      "decide",
    ],
  },
  {
    key: "deployment",
    label: "deployment",
    tool: "Vercel + GitHub",
    map: "Deploy, publish, repo, CI/CD",
    reason: "Shipping, repos, branches, CI/CD, domains, or release steps.",
    role: "ROLE: Deployment operator. Turn the deliverable into a shippable repo and deployment path with exact commands, branch flow, and release steps.",
    output:
      "OUTPUT: repo setup, branch strategy, deploy commands, verification steps.",
    keywords: [
      "deploy",
      "deployment",
      "publish",
      "vercel",
      "github",
      "repo",
      "branch",
      "commit",
      "pull request",
      "ci",
      "cd",
      "domain",
      "hosting",
      "release",
      "ship",
    ],
  },
  {
    key: "documentation",
    label: "documentation",
    tool: "Notion",
    map: "Docs, specs, SOPs, capture",
    reason:
      "Mainly capture, SOP, notes, knowledge structuring, or handoff docs.",
    role: "ROLE: Documentation operator. Convert the work into a clean SOP, spec, project brief, or operating doc with headings and checklists.",
    output:
      "OUTPUT: a publishable document structure with an action checklist.",
    keywords: [
      "document",
      "documentation",
      "notion",
      "notes",
      "sop",
      "wiki",
      "brief",
      "summary",
      "meeting",
      "spec sheet",
      "playbook",
      "template",
      "outline",
    ],
  },
  {
    key: "system_state",
    label: "system state",
    tool: "Codex KG",
    map: "State, memory, system map",
    reason:
      "Updates memory, project state, relationships, or ongoing context.",
    role: "ROLE: System state operator. Update memory, entities, relationships, decisions, and current project state succinctly.",
    output:
      "OUTPUT: structured fields — entities, tasks, decisions, open loops.",
    keywords: [
      "memory",
      "state",
      "kg",
      "knowledge graph",
      "context",
      "remember",
      "log",
      "history",
      "status",
      "session",
      "graph",
      "relationship",
      "source of truth",
    ],
  },
];

export const routeByTool = Object.fromEntries(
  ROUTES.map((r) => [r.tool, r]),
) as Record<string, RouteDef>;

export const routeByKey = Object.fromEntries(
  ROUTES.map((r) => [r.key, r]),
) as Record<RouteKey, RouteDef>;

export const doctrineBlock = [
  "Routing Doctrine:",
  ...ROUTES.map((r) => `- ${r.map} -> ${r.tool}`),
  "- Core rule: if switching tools slows execution and the current tool can finish, stay put.",
].join("\n");

export const TOOL_OPTIONS = ROUTES.map((r) => r.tool);

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "then",
  "that",
  "this",
  "into",
  "your",
  "from",
  "have",
  "will",
  "make",
  "need",
  "want",
  "task",
]);

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function salientTokens(text: string): string[] {
  return [
    ...new Set(
      normalizeText(text)
        .split(" ")
        .filter((w) => w.length > 3 && !STOP.has(w)),
    ),
  ].slice(0, 8);
}

export function scoreRoute(
  text: string,
  priority: string,
  corrections: Corrections,
): ScoredRoute[] {
  const normalized = normalizeText(text);
  const tokens = salientTokens(text);

  return ROUTES.map((def) => {
    let score = 0;
    for (const kw of def.keywords) {
      if (normalized.includes(kw)) score += kw.includes(" ") ? 3 : 2;
    }
    for (const tok of tokens) {
      const bias = corrections[tok];
      if (bias?.[def.key]) score += bias[def.key] ?? 0;
    }
    if (priority === "accuracy" && (def.key === "research" || def.key === "architecture")) {
      score += 0.5;
    }
    if (priority === "speed" && def.key === "execution") score += 0.5;
    return { ...def, score };
  }).sort((a, b) => b.score - a.score);
}

export function detectOverride(
  text: string,
  topRoute: ScoredRoute,
  currentTool: string,
  enabled: boolean,
): { active: boolean; reason: string } {
  if (!enabled) return { active: false, reason: "Execution override disabled." };

  const explicitStay =
    /(do it here|stay here|do not switch|don'?t switch|keep it here|handle it here|execute override)/i.test(
      text,
    );
  const urgent = /(urgent|quick|fast|immediately|now|asap)/i.test(text);
  const buildHeavy = /(build|write|generate|create|implement|ship|finish)/i.test(
    text,
  );
  const currentCanBuild = ["Perplexity", "Gemini", "Claude / ChatGPT"].includes(
    currentTool,
  );
  const topIsThink = ["Perplexity", "Claude / ChatGPT"].includes(topRoute.tool);

  if ((explicitStay || (urgent && buildHeavy)) && currentCanBuild) {
    return {
      active: true,
      reason: "Override: speed beats perfect routing for this task.",
    };
  }
  if (topIsThink && currentTool === "Gemini" && buildHeavy) {
    return {
      active: true,
      reason:
        "Override: Gemini can finish the artifact without handoff friction.",
    };
  }
  if (
    topRoute.tool === "Gemini" &&
    currentTool === "Claude / ChatGPT" &&
    /(architecture|spec|system|plan)/i.test(text)
  ) {
    return {
      active: true,
      reason: "Override: already in deep reasoning context.",
    };
  }
  return { active: false, reason: "Doctrine stands; handoff cost is justified." };
}

export function splitTask(
  text: string,
  ranked: ScoredRoute[],
  allowHybrid: boolean,
): ScoredRoute[] | null {
  const candidates = ranked.filter((r) => r.score > 0);
  if (!allowHybrid || candidates.length < 2) return null;

  const [first, second] = candidates;
  const gap = first.score - second.score;
  const signals =
    /(then|and then|plus|also|while|split|part a|part b|research.*build|design.*build|plan.*execute|spec.*implement)/i.test(
      text,
    );

  return signals || gap <= 2 ? [first, second] : null;
}

export function buildPrompt(
  tool: string,
  task: string,
  category: string,
  ctx: { currentTool: string; priority: string },
): string {
  const route = routeByTool[tool] ?? routeByKey.architecture;
  return [
    route.role,
    doctrineBlock,
    `Current tool context: ${ctx.currentTool}`,
    `Detected category: ${category}`,
    `Priority mode: ${ctx.priority}`,
    "",
    "Task:",
    task.trim(),
    "",
    route.output,
  ].join("\n");
}

export function deriveNextAction(
  routeSet: Array<{ tool: string }>,
  override: { active: boolean },
): string {
  if (override.active) {
    return `Stay in ${routeSet[0].tool} and complete the task immediately.`;
  }
  if (routeSet.length > 1) {
    return "Send Part A first, hand Part B off after the first output lands.";
  }

  const actions: Record<string, string> = {
    Gemini:
      "Run the prompt in Gemini and request the first working artifact.",
    Perplexity:
      "Run in Perplexity and use cited findings to inform the next build step.",
    "Claude / ChatGPT":
      "Run in Claude / ChatGPT and convert the response into an execution-ready spec.",
    "Vercel + GitHub":
      "Create the repo/branch and follow the shipping checklist.",
    Notion: "Capture the output in Notion as a reusable operating doc.",
    "Codex KG":
      "Update Codex KG so system state reflects the latest decisions.",
  };

  return actions[routeSet[0].tool] ?? "Run the generated prompt.";
}

export function matchStrength(ranked: ScoredRoute[]): number {
  const positive = ranked.filter((r) => r.score > 0);
  const total = positive.reduce((sum, route) => sum + route.score, 0);
  if (!total) return 0;
  return Math.round((ranked[0].score / total) * 100);
}

export type RouteSetItem = ScoredRoute & { reason?: string };

export type BuildResultInput = {
  task: string;
  currentTool: string;
  overrideEnabled: boolean;
  hybridEnabled: boolean;
  priority: string;
  corrections: Corrections;
};

export function buildResult(input: BuildResultInput): RouteResult {
  const ranked = scoreRoute(input.task, input.priority, input.corrections);
  const top =
    ranked[0] && ranked[0].score > 0
      ? ranked[0]
      : { ...routeByKey.architecture, score: 0 };
  const hybrid = splitTask(input.task, ranked, input.hybridEnabled);
  const override = detectOverride(
    input.task,
    top,
    input.currentTool,
    input.overrideEnabled,
  );

  let routeSet: RouteSetItem[] = hybrid ?? [top];

  if (override.active) {
    routeSet = [
      {
        key: "override" as RouteKey,
        label: "execution override",
        tool: input.currentTool,
        map: "",
        reason: override.reason,
        role: "",
        output: "",
        keywords: [],
        score: top.score + 1,
      },
      ...(hybrid ? hybrid.slice(0, 1) : []),
    ].slice(0, hybrid ? 2 : 1);
  }

  const prompts = routeSet.map((route, index) => ({
    part:
      routeSet.length > 1 ? `Part ${String.fromCharCode(65 + index)}` : "Primary",
    tool: route.tool,
    category: route.label,
    reason: route.reason ?? routeByTool[route.tool]?.reason ?? "",
    prompt: buildPrompt(route.tool, input.task, route.label, {
      currentTool: input.currentTool,
      priority: input.priority,
    }),
  }));

  return {
    createdAt: new Date().toISOString(),
    task: input.task,
    mode:
      routeSet.length > 1
        ? "Hybrid"
        : override.active
          ? "Override"
          : "Single route",
    strength: matchStrength(ranked),
    primaryRoute: routeSet[0].tool,
    primaryKey: routeSet[0].key,
    nextAction: deriveNextAction(routeSet, override),
    currentTool: input.currentTool,
    override,
    prompts,
  };
}

export function applyCorrection(
  task: string,
  fromKey: RouteKey,
  toKey: RouteKey,
  corrections: Corrections,
): Corrections {
  if (fromKey === toKey) return corrections;

  const next = { ...corrections };
  for (const tok of salientTokens(task)) {
    const entry = { ...(next[tok] ?? {}) };
    entry[toKey] = Math.min(6, (entry[toKey] ?? 0) + 2);
    if (entry[fromKey]) entry[fromKey] = Math.max(0, entry[fromKey] - 1);
    next[tok] = entry;
  }
  return next;
}
