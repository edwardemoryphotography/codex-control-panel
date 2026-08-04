import { describe, it, expect } from "vitest";
import {
  draftProposalFromRouteResult,
  routeSourceLabel,
  toPersistPayload,
} from "../propose-route";
import type { RouteResult } from "../routing";

const baseResult: RouteResult = {
  createdAt: "2026-08-04T00:00:00.000Z",
  task: "Implement Foundry routing inbox",
  mode: "single",
  strength: 72,
  primaryRoute: "execution → Gemini",
  primaryKey: "execution",
  nextAction: "Build the inbox",
  currentTool: "Claude",
  override: { active: false, reason: "" },
  prompts: [
    {
      part: "Primary",
      tool: "Gemini",
      category: "execution",
      reason: "Build-heavy UI work",
      prompt: "Build it",
    },
  ],
  source: "doctrine",
};

describe("propose-route helpers", () => {
  it("drafts confirmations as false and labels doctrine fallback", () => {
    const draft = draftProposalFromRouteResult(baseResult, "");
    expect(draft.confirmations).toEqual({
      destructive: false,
      protectedOperation: false,
      publicExposure: false,
    });
    expect(draft.routeSource).toBe("doctrine_fallback");
    expect(routeSourceLabel(draft.routeSource)).toMatch(/not AI-model routing/i);
  });

  it("includes correction fields only when superseding", () => {
    const draft = draftProposalFromRouteResult(baseResult, "11111111-1111-4111-8111-111111111111");
    draft.supersedesRequestId = "22222222-2222-4222-8222-222222222222";
    draft.correctionReason = "Wrong repository";
    const payload = toPersistPayload(draft);
    expect(payload.supersedesRequestId).toBe(
      "22222222-2222-4222-8222-222222222222",
    );
    expect(payload.correctionReason).toBe("Wrong repository");
  });
});
