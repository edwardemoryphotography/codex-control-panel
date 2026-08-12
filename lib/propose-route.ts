import type { RouteResult, RouteKey } from "./routing";
import {
  EVIDENCE_KINDS,
  EXECUTION_LANES,
  RISK_LEVELS,
  SENSITIVITIES,
  TASK_TYPES,
  type RouteProposal,
} from "./route-contract";
import { KNOWN_AGENTS, KNOWN_REPOSITORIES } from "./route-registry";

const LANE_TO_AGENT: Record<RouteKey, (typeof KNOWN_AGENTS)[number]> = {
  execution: "gemini",
  research: "perplexity",
  architecture: "claude-code",
  deployment: "cursor",
  documentation: "chatgpt",
  system_state: "codex",
  override: "gemini",
};

const LANE_TO_TASK: Record<RouteKey, (typeof TASK_TYPES)[number]> = {
  execution: "implement",
  research: "research",
  architecture: "design",
  deployment: "operate",
  documentation: "document",
  system_state: "triage",
  override: "implement",
};

const LANE_TO_REPO: Record<RouteKey, string> = {
  execution: "edwardemoryphotography/codex-control-panel",
  research: "edwardemoryphotography/legacy-codex",
  architecture: "edwardemoryphotography/legacy-codex",
  deployment: "edwardemoryphotography/codex-control-panel",
  documentation: "edwardemoryphotography/codex-system-architecture",
  system_state: "edwardemoryphotography/legacy-codex",
  override: "edwardemoryphotography/codex-control-panel",
};

export type EditableRouteProposal = {
  intent: string;
  workspaceId: string;
  repository: string;
  repositoryPath: string;
  taskType: (typeof TASK_TYPES)[number];
  executionLane: (typeof EXECUTION_LANES)[number];
  selectedAgent: (typeof KNOWN_AGENTS)[number];
  risk: (typeof RISK_LEVELS)[number];
  sensitivity: (typeof SENSITIVITIES)[number];
  requiredEvidence: string;
  evidenceKind: (typeof EVIDENCE_KINDS)[number];
  rationale: string;
  confidence: number;
  routeSource: RouteProposal["routeSource"];
  provenance: RouteProposal["provenance"];
  confirmations: {
    destructive: boolean;
    protectedOperation: boolean;
    publicExposure: boolean;
  };
  supersedesRequestId: string;
  correctionReason: string;
  createAction: boolean;
};

/** Map a UI route result into an editable Foundry route proposal draft. */
export function draftProposalFromRouteResult(
  result: RouteResult,
  workspaceId = "",
): EditableRouteProposal {
  const lane = result.primaryKey;
  const doctrineFallback =
    !result.source || result.source === "doctrine" || result.source === "Doctrine";

  return {
    intent: result.task,
    workspaceId,
    repository: LANE_TO_REPO[lane] ?? KNOWN_REPOSITORIES[0]?.fullName ?? "",
    repositoryPath: "",
    taskType: LANE_TO_TASK[lane],
    executionLane: lane,
    selectedAgent: LANE_TO_AGENT[lane],
    risk: "medium",
    sensitivity: "internal",
    requiredEvidence: `Verified completion evidence for: ${result.nextAction}`,
    evidenceKind: "confirmed_action",
    rationale: result.prompts[0]?.reason ?? result.nextAction,
    confidence: Math.max(0, Math.min(100, result.strength)),
    routeSource: doctrineFallback ? "doctrine_fallback" : "model",
    provenance: "inference",
    // Confirmations always start false — never inferred or auto-enabled.
    confirmations: {
      destructive: false,
      protectedOperation: false,
      publicExposure: false,
    },
    supersedesRequestId: "",
    correctionReason: "",
    // The backend strips createAction and only surfaces a warning — action
    // linking isn't supported yet, so a new draft must not default to on.
    createAction: false,
  };
}

/** Convert the editable draft into the API payload shape. */
export function toPersistPayload(draft: EditableRouteProposal): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    intent: draft.intent.trim(),
    workspaceId: draft.workspaceId.trim(),
    repository: draft.repository.trim(),
    repositoryPath: draft.repositoryPath.trim() || null,
    taskType: draft.taskType,
    executionLane: draft.executionLane,
    selectedAgent: draft.selectedAgent,
    risk: draft.risk,
    sensitivity: draft.sensitivity,
    requiredEvidence: draft.requiredEvidence.trim(),
    evidenceKind: draft.evidenceKind,
    rationale: draft.rationale.trim(),
    confidence: draft.confidence,
    routeSource: draft.routeSource,
    provenance: draft.provenance,
    confirmations: {
      destructive: draft.confirmations.destructive || undefined,
      protectedOperation: draft.confirmations.protectedOperation || undefined,
      publicExposure: draft.confirmations.publicExposure || undefined,
    },
    createAction: draft.createAction,
  };

  if (draft.supersedesRequestId.trim()) {
    payload.supersedesRequestId = draft.supersedesRequestId.trim();
    payload.correctionReason = draft.correctionReason.trim();
  }

  return payload;
}

export function routeSourceLabel(source: RouteProposal["routeSource"]): string {
  switch (source) {
    case "doctrine_fallback":
      return "Doctrine fallback (not AI-model routing)";
    case "model":
      return "AI model routing";
    case "user":
      return "Owner-specified routing";
    default:
      return source;
  }
}
