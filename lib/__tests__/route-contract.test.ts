import { describe, expect, it } from "vitest";
import {
  toRoutedRequestRow,
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
    expect(toRoutedRequestRow(result.proposal).route_source).toBe(
      "doctrine_fallback",
    );
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

describe("toRoutedRequestRow — status semantics", () => {
  it("model proposals persist as proposed", () => {
    const result = validateRouteProposal(validProposal);
    if (!result.ok) throw new Error("expected valid");
    expect(toRoutedRequestRow(result.proposal).status).toBe("proposed");
  });

  it("user-sourced routes persist as confirmed", () => {
    const result = validateRouteProposal({
      ...validProposal,
      routeSource: "user",
    });
    if (!result.ok) throw new Error("expected valid");
    expect(toRoutedRequestRow(result.proposal).status).toBe("confirmed");
  });

  it("corrections persist as corrected and reference the original", () => {
    const result = validateRouteProposal({
      ...validProposal,
      supersedesRequestId: "22222222-2222-4222-8222-222222222222",
      correctionReason: "Owner rerouted to research after reviewing the proposal.",
    });
    if (!result.ok) throw new Error("expected valid");
    const row = toRoutedRequestRow(result.proposal);
    expect(row.status).toBe("corrected");
    expect(row.supersedes_request_id).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
  });
});
