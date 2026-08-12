import { afterEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { persistRoute, POST } from "../api/route/persist/route";
import type { RouteProposal } from "@/lib/route-contract";
import { validateRouteProposal } from "@/lib/route-contract";

const WORKSPACE_ID = "11111111-1111-4111-8111-111111111111";
const ORIGINAL_ID = "22222222-2222-4222-8222-222222222222";

function proposal(overrides: Partial<RouteProposal> = {}): RouteProposal {
  const result = validateRouteProposal({
    intent:
      "Review the Legacy Codex repository and identify stale project documentation.",
    workspaceId: WORKSPACE_ID,
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
  });
  if (!result.ok) throw new Error("fixture proposal must be valid");
  return { ...result.proposal, ...overrides };
}

/**
 * persist_route_atomic is the only write path the schema exposes now — the
 * app has nothing left to stub but the single RPC call. `onCall` lets each
 * test control the returned {data, error} without reimplementing Postgres.
 */
function stubDb(
  onCall: (payload: Record<string, unknown>) => {
    data?: Record<string, unknown> | null;
    error?: { message: string } | null;
  },
) {
  const calls: Array<{ fn: string; payload: Record<string, unknown> }> = [];
  const db = {
    rpc(fn: string, args: { p_proposal: Record<string, unknown> }) {
      calls.push({ fn, payload: args.p_proposal });
      const result = onCall(args.p_proposal);
      return Promise.resolve({
        data: result.data ?? null,
        error: result.error ?? null,
      });
    },
  } as unknown as SupabaseClient;

  return { db, calls };
}

describe("persistRoute — the single RPC write path", () => {
  it("calls persist_route_atomic with a resolved idempotency key and returns its result as 201", async () => {
    const { db, calls } = stubDb(() => ({
      data: {
        routedRequest: { id: "route-1", status: "confirmed" },
        workspace: { id: WORKSPACE_ID, name: "Legacy Codex" },
        actionId: null,
        eventLogged: true,
        evidence: { id: "evidence-1", status: "pending" },
        corrected: null,
        warnings: [],
        replayed: false,
      },
    }));

    const result = await persistRoute(db, proposal());

    expect(calls).toHaveLength(1);
    expect(calls[0]?.fn).toBe("persist_route_atomic");
    expect(typeof calls[0]?.payload.idempotency_key).toBe("string");
    expect(calls[0]?.payload.workspace_id).toBe(WORKSPACE_ID);
    expect(calls[0]?.payload.intent).toContain("stale project documentation");

    expect(result.status).toBe(201);
    expect(result.body.eventLogged).toBe(true);
    expect((result.body.routedRequest as { status: string }).status).toBe(
      "confirmed",
    );
  });

  it("uses the caller-supplied idempotency key when present instead of generating one", async () => {
    const KEY = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const { db, calls } = stubDb(() => ({
      data: { routedRequest: {}, evidence: {}, replayed: false, warnings: [] },
    }));

    await persistRoute(db, proposal({ idempotencyKey: KEY }));

    expect(calls[0]?.payload.idempotency_key).toBe(KEY);
  });

  it("returns 200 (not 201) on an idempotency-key replay — nothing new was created", async () => {
    const { db } = stubDb(() => ({
      data: {
        routedRequest: { id: "route-1", status: "confirmed" },
        evidence: { id: "evidence-1", status: "pending" },
        workspace: { id: WORKSPACE_ID },
        corrected: null,
        eventLogged: true,
        replayed: true,
      },
    }));

    const result = await persistRoute(db, proposal());
    expect(result.status).toBe(200);
    expect(result.body.replayed).toBe(true);
    // The replay branch omits `warnings` entirely; persistRoute must not crash on that.
    expect(result.body.warnings).toEqual([]);
  });

  it("maps unknown_workspace to 422 — invented workspaces never persist", async () => {
    const { db } = stubDb(() => ({
      error: { message: `unknown_workspace:${WORKSPACE_ID}` },
    }));

    const result = await persistRoute(db, proposal());
    expect(result.status).toBe(422);
    expect(result.body.code).toBe("unknown_workspace");
  });

  it("maps correction_target_superseded to 409", async () => {
    const { db } = stubDb(() => ({
      error: { message: `correction_target_superseded:${ORIGINAL_ID}` },
    }));

    const result = await persistRoute(
      db,
      proposal({
        supersedesRequestId: ORIGINAL_ID,
        correctionReason: "Late correction.",
      }),
    );
    expect(result.status).toBe(409);
    expect(result.body.code).toBe("correction_target_superseded");
  });

  it("maps correction_target_missing to 409", async () => {
    const { db } = stubDb(() => ({
      error: { message: `correction_target_missing:${ORIGINAL_ID}` },
    }));

    const result = await persistRoute(
      db,
      proposal({
        supersedesRequestId: ORIGINAL_ID,
        correctionReason: "Owner rerouted to research.",
      }),
    );
    expect(result.status).toBe(409);
    expect(result.body.code).toBe("correction_target_missing");
  });

  it("passes supersedes_request_id and correction_reason through for corrections", async () => {
    const { db, calls } = stubDb(() => ({
      data: {
        routedRequest: { id: "route-2", status: "corrected" },
        evidence: {},
        corrected: ORIGINAL_ID,
        eventLogged: true,
        replayed: false,
        warnings: [],
      },
    }));

    const result = await persistRoute(
      db,
      proposal({
        supersedesRequestId: ORIGINAL_ID,
        correctionReason: "Owner rerouted to research.",
      }),
    );

    expect(calls[0]?.payload.supersedes_request_id).toBe(ORIGINAL_ID);
    expect(calls[0]?.payload.correction_reason).toBe(
      "Owner rerouted to research.",
    );
    expect(result.status).toBe(201);
    expect(result.body.corrected).toBe(ORIGINAL_ID);
  });

  it("warns instead of failing when createAction is requested — action linking is disabled at the DB layer", async () => {
    const { db, calls } = stubDb(() => ({
      data: { routedRequest: {}, evidence: {}, replayed: false, warnings: [] },
    }));

    const result = await persistRoute(db, proposal({ createAction: true }));

    expect(calls[0]?.payload).not.toHaveProperty("action_id");
    expect(calls[0]?.payload).not.toHaveProperty("create_action");
    expect(result.status).toBe(201);
    expect(
      (result.body.warnings as string[]).some((w) =>
        w.includes("Work item linking is disabled"),
      ),
    ).toBe(true);
  });

  it("falls back to 502 for an unrecognized RPC error", async () => {
    const { db } = stubDb(() => ({
      error: { message: 'new row for relation "routed_requests" violates check constraint "routed_requests_nonblank_facts"' },
    }));

    const result = await persistRoute(db, proposal());
    expect(result.status).toBe(502);
    expect(result.body.code).toBe("route_persistence_failed");
  });
});

describe("POST /api/route/persist — unauthorized access", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function post(body: unknown, headers: Record<string, string> = {}) {
    return POST(
      new Request("http://localhost/api/route/persist", {
        method: "POST",
        headers: { "content-type": "application/json", ...headers },
        body: JSON.stringify(body),
      }),
    );
  }

  it("returns 503 (locked) when no owner token is configured", async () => {
    vi.stubEnv("APP_ACCESS_TOKEN", "");
    const response = await post({});
    expect(response.status).toBe(503);
  });

  it("returns 401 for a wrong owner token — reads and writes are refused", async () => {
    vi.stubEnv("APP_ACCESS_TOKEN", "correct-token");
    const response = await post({}, { "x-codex-key": "wrong-token" });
    expect(response.status).toBe(401);
  });

  it("rejects invalid proposals with 422 before touching any backend", async () => {
    vi.stubEnv("APP_ACCESS_TOKEN", "correct-token");
    const response = await post(
      { intent: "too short" },
      { "x-codex-key": "correct-token" },
    );
    expect(response.status).toBe(422);
  });

  it("returns honest 503 when the Foundry backend env is absent", async () => {
    vi.stubEnv("APP_ACCESS_TOKEN", "correct-token");
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const response = await post(
      {
        intent:
          "Review the Legacy Codex repository and identify stale project documentation.",
        workspaceId: WORKSPACE_ID,
        repository: "edwardemoryphotography/legacy-codex",
        taskType: "review",
        executionLane: "documentation",
        selectedAgent: "claude-code",
        risk: "low",
        sensitivity: "internal",
        requiredEvidence: "A reviewed list of stale documentation",
        rationale: "Documentation review.",
        confidence: 80,
        routeSource: "model",
      },
      { "x-codex-key": "correct-token" },
    );
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error: string };
    expect(body.error).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
});
