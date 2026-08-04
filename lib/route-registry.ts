/**
 * Deterministic registry the router validates model output against.
 * Model-proposed repositories, paths, and agents are untrusted until they
 * match an entry here; the canonical workspace registry stays in the Foundry
 * `workspaces` table and is checked server-side at persist time.
 *
 * Every visibility below is labeled with its provenance. None of these
 * repositories has had its visibility verified against the GitHub API by
 * this code, so they stay "unknown" — and unknown visibility is treated as
 * NOT private when sensitivity rules are applied.
 */

export type RepoVisibility = "private" | "public" | "unknown";

export interface KnownRepository {
  fullName: string;
  visibility: RepoVisibility;
  /** Provenance of the visibility value, never of the repo's existence. */
  visibilityProvenance: "verified" | "repository_evidence" | "unknown";
}

export const KNOWN_REPOSITORIES: KnownRepository[] = [
  { fullName: "edwardemoryphotography/legacy-codex", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/codex-control-panel", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/codex-system-architecture", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/agentmemory", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/claude-code-game-studios", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/camera-and-onject-detection-app-", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/-neurocreative-project", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/Artful-Intelligence", visibility: "unknown", visibilityProvenance: "unknown" },
  { fullName: "edwardemoryphotography/plugins", visibility: "unknown", visibilityProvenance: "unknown" },
];

export function findRepository(fullName: string): KnownRepository | null {
  const needle = fullName.toLowerCase();
  return (
    KNOWN_REPOSITORIES.find((repo) => repo.fullName.toLowerCase() === needle) ??
    null
  );
}

/** Execution agents the router may select. */
export const KNOWN_AGENTS = [
  "claude-code",
  "cursor",
  "codex",
  "gemini",
  "perplexity",
  "chatgpt",
  "manual",
] as const;

export type KnownAgent = (typeof KNOWN_AGENTS)[number];

/**
 * Operations that must never route without explicit owner confirmation.
 * Screened deterministically against the intent text — the model cannot
 * waive these by omitting a label.
 */
export const PROTECTED_OPERATION_PATTERNS: Array<{
  code: string;
  pattern: RegExp;
}> = [
  { code: "deletion", pattern: /\b(delete|remove|rm -rf|drop table|truncate|wipe|purge|archive all)\b/i },
  { code: "merge", pattern: /\b(merge (the |this |to )?(pr|pull request|main|branch)|auto-?merge)\b/i },
  { code: "production_deploy", pattern: /\b(deploy|promote|release) (to )?(prod|production|live)\b/i },
  { code: "migration_apply", pattern: /\b(apply|run) (the )?(supabase |database |db )?migrations?\b/i },
  { code: "secrets", pattern: /\b(rotate|change|set|update) (the )?(secret|api key|token|credential|env(ironment)? var)/i },
  { code: "security_boundary", pattern: /\b(disable|weaken|bypass|drop) (the )?(rls|auth|authentication|policy|policies)\b/i },
  { code: "force_push", pattern: /\b(force[- ]?push|push --force|reset --hard)\b/i },
];

export function screenProtectedOperations(intent: string): string[] {
  return PROTECTED_OPERATION_PATTERNS.filter(({ pattern }) =>
    pattern.test(intent)
  ).map(({ code }) => code);
}
