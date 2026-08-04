import { z } from "zod";
import {
  findRepository,
  KNOWN_AGENTS,
  screenProtectedOperations,
} from "./route-registry";

/**
 * The validated route contract — the single shape a route must satisfy
 * before it may be persisted to the Foundry backend (routed_requests).
 * Enum vocabularies match supabase/migrations/20260804010000_routing_control_plane.sql
 * in edwardemoryphotography/legacy-codex; the execution lanes reuse the
 * existing router lane vocabulary.
 */

export const EXECUTION_LANES = [
  "execution",
  "research",
  "architecture",
  "deployment",
  "documentation",
  "system_state",
  "override",
] as const;

export const TASK_TYPES = [
  "review",
  "implement",
  "research",
  "design",
  "document",
  "operate",
  "triage",
] as const;

export const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export const SENSITIVITIES = ["public", "internal", "private", "restricted"] as const;
export const ROUTE_SOURCES = ["model", "doctrine_fallback", "user"] as const;
export const PROVENANCE_STATES = [
  "verified",
  "repository_evidence",
  "runtime_evidence",
  "user_confirmed",
  "inference",
  "concept",
  "unknown",
] as const;
export const EVIDENCE_KINDS = [
  "merged_pr",
  "live_deployment",
  "published_artifact",
  "confirmed_action",
  "test_run",
  "custom",
] as const;

export const routeProposalSchema = z.object({
  /** The owner's original ask, preserved verbatim. */
  intent: z.string().min(8).max(4000),
  /** Must exist in the Foundry workspaces table — re-checked at persist time. */
  workspaceId: z.uuid(),
  repository: z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/),
  repositoryPath: z.string().max(500).nullish(),
  taskType: z.enum(TASK_TYPES),
  executionLane: z.enum(EXECUTION_LANES),
  selectedAgent: z.string().min(1),
  risk: z.enum(RISK_LEVELS),
  sensitivity: z.enum(SENSITIVITIES),
  requiredEvidence: z.string().min(4).max(1000),
  evidenceKind: z.enum(EVIDENCE_KINDS).default("custom"),
  rationale: z.string().min(4).max(2000),
  confidence: z.number().min(0).max(100),
  routeSource: z.enum(ROUTE_SOURCES),
  provenance: z.enum(PROVENANCE_STATES).default("inference"),
  /** Explicit owner confirmations — never inferable by the model. */
  confirmations: z
    .object({
      destructive: z.boolean().optional(),
      protectedOperation: z.boolean().optional(),
      publicExposure: z.boolean().optional(),
    })
    .default({}),
  /** Correction support: the route this proposal supersedes. */
  supersedesRequestId: z.uuid().optional(),
  correctionReason: z.string().min(4).max(1000).optional(),
  /** Create and link a Foundry actions work item alongside the route. */
  createAction: z.boolean().default(false),
  /** Link an existing actions row instead of creating one. */
  actionId: z.uuid().optional(),
});

export type RouteProposal = z.infer<typeof routeProposalSchema>;

export interface RouteViolation {
  code: string;
  message: string;
}

export type RouteValidation =
  | { ok: true; proposal: RouteProposal }
  | { ok: false; violations: RouteViolation[] };

/**
 * Deterministic server-side validation. The model may propose a route, but
 * everything it names is untrusted until it passes these checks. This never
 * calls a model and never consults the network.
 */
export function validateRouteProposal(input: unknown): RouteValidation {
  const parsed = routeProposalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      violations: parsed.error.issues.map((issue) => ({
        code: "schema",
        message: `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      })),
    };
  }

  const proposal = parsed.data;
  const violations: RouteViolation[] = [];

  // Invented repositories are rejected outright.
  const repo = findRepository(proposal.repository);
  if (!repo) {
    violations.push({
      code: "unknown_repository",
      message: `Repository "${proposal.repository}" is not in the known-repository registry.`,
    });
  }

  // Path safety: relative, forward-slash paths only.
  const path = proposal.repositoryPath ?? null;
  if (path !== null) {
    if (
      path.includes("..") ||
      path.startsWith("/") ||
      path.includes("\\") ||
      path.includes("\0") ||
      path.startsWith("~")
    ) {
      violations.push({
        code: "invalid_path",
        message: `Repository path "${path}" is not a safe relative path.`,
      });
    }
  }

  // Unverified or public repositories cannot receive private/restricted
  // content without an explicit owner confirmation.
  if (
    repo &&
    (proposal.sensitivity === "private" || proposal.sensitivity === "restricted") &&
    repo.visibility !== "private" &&
    !proposal.confirmations.publicExposure
  ) {
    violations.push({
      code: "public_private_crossing",
      message: `Sensitivity "${proposal.sensitivity}" content cannot route to ${proposal.repository} (visibility: ${repo.visibility}) without confirmations.publicExposure.`,
    });
  }

  // Protected operations require explicit confirmation regardless of what
  // the model claims about risk.
  const protectedOps = screenProtectedOperations(proposal.intent);
  if (protectedOps.length > 0 && !proposal.confirmations.protectedOperation) {
    violations.push({
      code: "protected_operation",
      message: `Intent matches protected operation(s) [${protectedOps.join(", ")}] — confirmations.protectedOperation is required.`,
    });
  }

  // Destructive-looking work additionally needs the destructive confirmation.
  if (protectedOps.includes("deletion") && !proposal.confirmations.destructive) {
    violations.push({
      code: "destructive_unconfirmed",
      message: "Deletion-shaped intent requires confirmations.destructive.",
    });
  }

  if (!KNOWN_AGENTS.includes(proposal.selectedAgent as (typeof KNOWN_AGENTS)[number])) {
    violations.push({
      code: "unknown_agent",
      message: `Agent "${proposal.selectedAgent}" is not a known execution agent.`,
    });
  }

  // Corrections must explain themselves; history is append-only.
  if (proposal.supersedesRequestId && !proposal.correctionReason) {
    violations.push({
      code: "correction_reason_required",
      message: "A correction must include correctionReason; the original route is never rewritten.",
    });
  }

  if (proposal.createAction && proposal.actionId) {
    violations.push({
      code: "action_conflict",
      message: "Provide either createAction or actionId, not both.",
    });
  }

  if (violations.length > 0) return { ok: false, violations };
  return { ok: true, proposal };
}

/** Row shape inserted into routed_requests (snake_case, DB-canonical). */
export function toRoutedRequestRow(
  proposal: RouteProposal
): Record<string, unknown> {
  return {
    workspace_id: proposal.workspaceId,
    action_id: proposal.actionId ?? null,
    supersedes_request_id: proposal.supersedesRequestId ?? null,
    intent: proposal.intent,
    task_type: proposal.taskType,
    execution_lane: proposal.executionLane,
    selected_agent: proposal.selectedAgent,
    repository: proposal.repository,
    repository_path: proposal.repositoryPath ?? null,
    risk: proposal.risk,
    sensitivity: proposal.sensitivity,
    required_evidence: proposal.requiredEvidence,
    rationale: proposal.rationale,
    confidence: proposal.confidence,
    status: proposal.supersedesRequestId
      ? "corrected"
      : proposal.routeSource === "user"
        ? "confirmed"
        : "proposed",
    route_source: proposal.routeSource,
    provenance: proposal.provenance,
  };
}
