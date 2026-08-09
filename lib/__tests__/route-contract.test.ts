import { describe, expect, it } from "vitest";
import {
  toRouteProposalPayload,
  validateRouteProposal,
} from "../route-contract";

const validProposal = {
  intent:
    "Review the Legacy Codex repository and identify stale project documentation.",
  workspaceId: "11111111-1111-4111-8111-111111111111",
  repository: "edwardemoryphotography/legacy-codex",
  repositoryPath: "docs",
  taskType: "review",
  executionLane: "documentation",
  selectedAgent: "claude-code",
  risk: "low",
  sensitivity: "internal",
  requiredEvidence: "A reviewed list of stale documentation with file paths",
  rationale: "Documentation review belongs in the documentation lane.",
  confidence: 82,
  routeSource: "model",
};

function violationsOf(input: unknown): string[] {
  const result = validateRouteProposal(input);
  return result.ok ? [] : result.violations.map((violation) => violation.code);
}

describe("validateRouteProposal — acceptance", () => {
  it("accepts the first-slice review intent", () => {
    const result = validateRouteProposal(validProposal);
    expect(result.ok).toBe(true);
  });

  it("defaults provenance to inference and evidence kind to custom", () => {
    const result = validateRouteProposal(validProposal);
    if (!result.ok) throw new Error("expected valid proposal");
    expect(result.proposal.provenance).toBe("inference");
    expect(result.proposal.evidenceKind).toBe("custom");
  });

  it("carries the doctrine fallback label through unchanged", () => {
    const result = validateRouteProposal({
      ...validProposal,
      routeSource: "doctrine_fallback",
    });
    if (!result.ok) throw new Error("expected valid proposal");
    expect(
      toRouteProposalPayload(result.proposal, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
        .route_source,
    ).toBe("doctrine_fallback");
  });
});

describe("validateRouteProposal — deterministic rejection of untrusted output", () => {
  it("rejects invented repositories", () => {
    expect(
      violationsOf({
        ...validProposal,
        repository: "edwardemoryphotography/does-not-exist",
      }),
    ).toContain("unknown_repository");
  });

  it("rejects path traversal and absolute paths", () => {
    expect(
      violationsOf({ ...validProposal, repositoryPath: "../secrets" }),
    ).toContain("invalid_path");
    expect(
      violationsOf({ ...validProposal, repositoryPath: "/etc/passwd" }),
    ).toContain("invalid_path");
  });

  it("rejects private content routed to unverified-visibility repos without confirmation", () => {
    expect(
      violationsOf({ ...validProposal, sensitivity: "restricted" }),
    ).toContain("public_private_crossing");
  });

  it("allows the crossing only with the explicit owner confirmation", () => {
    const result = validateRouteProposal({
      ...validProposal,
      sensitivity: "restricted",
      confirmations: { publicExposure: true },
    });
    expect(result.ok).toBe(true);
  });

  it("rejects destructive intents without both confirmations", () => {
    const codes = violationsOf({
      ...validProposal,
      intent: "Delete every stale doc file and purge the archive directory.",
    });
    expect(codes).toContain("protected_operation");
    expect(codes).toContain("destructive_unconfirmed");
  });

  it("rejects merge/deploy/secret/migration/RLS operations without confirmation", () => {
    for (const intent of [
      "Merge the pull request into main once checks pass",
      "Deploy to production after the build",
      "Apply the supabase migrations to the live database",
      "Rotate the secret keys for the API",
      "Disable RLS on the events table temporarily",
    ]) {
      expect(violationsOf({ ...validProposal, intent })).toContain(
        "protected_operation",
      );
    }
  });

  it("rejects unknown execution agents", () => {
    expect(
      violationsOf({ ...validProposal, selectedAgent: "skynet" }),
    ).toContain("unknown_agent");
  });

  it("requires a reason for corrections", () => {
    expect(
      violationsOf({
        ...validProposal,
        supersedesRequestId: "22222222-2222-4222-8222-222222222222",
      }),
    ).toContain("correction_reason_required");
  });

  it("rejects malformed payloads at the schema layer", () => {
    expect(violationsOf({ intent: "hi" })).toContain("schema");
    expect(
      violationsOf({ ...validProposal, confidence: 250 }),
    ).toContain("schema");
  });
});

describe("toRouteProposalPayload — persist_route_atomic(jsonb) contract", () => {
  const KEY = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

  it("carries the caller-provided idempotency key and workspace/intent facts through", () => {
    const result = validateRouteProposal(validProposal);
    if (!result.ok) throw new Error("expected valid");
    const payload = toRouteProposalPayload(result.proposal, KEY);
    expect(payload.idempotency_key).toBe(KEY);
    expect(payload.workspace_id).toBe(validProposal.workspaceId);
    expect(payload.intent).toBe(validProposal.intent);
    expect(payload.task_type).toBe(validProposal.taskType);
  });

  it("never leaves status assignment to the app — the RPC alone decides confirmed/corrected/blocked_policy", () => {
    const result = validateRouteProposal(validProposal);
    if (!result.ok) throw new Error("expected valid");
    expect(toRouteProposalPayload(result.proposal, KEY)).not.toHaveProperty(
      "status",
    );
  });

  it("carries supersedes_request_id and correction_reason for corrections", () => {
    const result = validateRouteProposal({
      ...validProposal,
      supersedesRequestId: "22222222-2222-4222-8222-222222222222",
      correctionReason: "Owner rerouted to research after reviewing the proposal.",
    });
    if (!result.ok) throw new Error("expected valid");
    const payload = toRouteProposalPayload(result.proposal, KEY);
    expect(payload.supersedes_request_id).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(payload.correction_reason).toBe(
      "Owner rerouted to research after reviewing the proposal.",
    );
  });

  it("maps confirmations through with camelCase subkeys, defaulting unset flags to false", () => {
    const result = validateRouteProposal({
      ...validProposal,
      sensitivity: "restricted",
      confirmations: { publicExposure: true },
    });
    if (!result.ok) throw new Error("expected valid");
    const payload = toRouteProposalPayload(result.proposal, KEY);
    expect(payload.confirmations).toEqual({
      destructive: false,
      protectedOperation: false,
      publicExposure: true,
    });
  });

  it("never includes action_id or create_action — the RPC rejects either key outright", () => {
    const result = validateRouteProposal({
      ...validProposal,
      createAction: true,
    });
    if (!result.ok) throw new Error("expected valid");
    const payload = toRouteProposalPayload(result.proposal, KEY);
    expect(payload).not.toHaveProperty("action_id");
    expect(payload).not.toHaveProperty("create_action");
  });
});
