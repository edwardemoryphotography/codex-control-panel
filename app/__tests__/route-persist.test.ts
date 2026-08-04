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
 * Minimal stub of the Supabase query chains persistRoute uses. Records every
 * insert/update so tests can assert exactly what would be written. No real
 * network, no real records.
 */
function stubDb(options: { workspaceExists?: boolean; originalStatus?: string | null } = {}) {
  const { workspaceExists = true, originalStatus = null } = options;
  const writes: Array<{ table: string; op: string; values: Record<string, unknown> }> = [];

  const db = {
    from(table: string) {
      return {
        select() {
          return {
            eq(_col: string, value: string) {
              return {
                async maybeSingle() {
                  if (table === "workspaces") {
                    return workspaceExists
                      ? { data: { id: value, name: "Legacy Codex" }, error: null }
                      : { data: null, error: null };
                  }
                  if (table === "routed_requests") {
                    return originalStatus
                      ? { data: { id: value, status: originalStatus }, error: null }
                      : { data: null, error: null };
                  }
                  return { data: null, error: null };
                },
              };
            },
          };
        },
        insert(values: Record<string, unknown>) {
          writes.push({ table, op: "insert", values });
          const inserted = {
            id: `${table}-row-1`,
            ...values,
          };
          const result = {
            select() {
              return {
                async single() {
                  return { data: inserted, error: null };
                },
              };
            },
          };
          // events insert is awaited directly without .select()
          return Object.assign(
            Promise.resolve({ data: inserted, error: null }),
            result,
          );
        },
        update(values: Record<string, unknown>) {
          return {
            async eq(_col: string, value: string) {
              writes.push({ table, op: "update", values: { ...values, id: value } });
              return { error: null };
            },
          };
        },
      };
    },
  } as unknown as SupabaseClient;

  return { db, writes };
}

describe("persistRoute — the first vertical slice", () => {
  it("persists route → event → pending evidence against a real workspace", async () => {
    const { db, writes } = stubDb();
    const result = await persistRoute(db, proposal());

    expect(result.status).toBe(201);

    const routeWrite = writes.find((w) => w.table === "routed_requests");
    expect(routeWrite?.values.intent).toContain("stale project documentation");
    expect(routeWrite?.values.status).toBe("proposed");
    expect(routeWrite?.values.route_source).toBe("model");

    const eventWrite = writes.find((w) => w.table === "events");
    expect(eventWrite?.values.action).toBe("route.persisted");
    expect(eventWrite?.values.target_type).toBe("routed_request");

    const evidenceWrite = writes.find((w) => w.table === "evidence_items");
    expect(evidenceWrite?.values.status).toBe("pending");
    expect(evidenceWrite?.values.provenance).toBe("unknown");
    expect(result.body.eventLogged).toBe(true);
  });

  it("rejects workspaces that do not exist — invented projects never persist", async () => {
    const { db, writes } = stubDb({ workspaceExists: false });
    const result = await persistRoute(db, proposal());
    expect(result.status).toBe(422);
    expect(result.body.code).toBe("unknown_workspace");
    expect(writes).toHaveLength(0);
  });

  it("creates and links a work item when requested", async () => {
    const { db, writes } = stubDb();
    const result = await persistRoute(db, proposal({ createAction: true }));
    expect(result.status).toBe(201);
    const actionWrite = writes.find((w) => w.table === "actions");
    expect(actionWrite?.values.status).toBe("TODO");
    const routeWrite = writes.find((w) => w.table === "routed_requests");
    expect(routeWrite?.values.action_id).toBe("actions-row-1");
  });

  it("corrections append a new row and supersede the original without deleting it", async () => {
    const { db, writes } = stubDb({ originalStatus: "confirmed" });
    const result = await persistRoute(
      db,
      proposal({
        supersedesRequestId: ORIGINAL_ID,
        correctionReason: "Owner rerouted to research.",
      }),
    );
    expect(result.status).toBe(201);

    const routeWrite = writes.find(
      (w) => w.table === "routed_requests" && w.op === "insert",
    );
    expect(routeWrite?.values.status).toBe("corrected");
    expect(routeWrite?.values.supersedes_request_id).toBe(ORIGINAL_ID);

    // The original is updated to superseded — never deleted.
    const update = writes.find(
      (w) => w.table === "routed_requests" && w.op === "update",
    );
    expect(update?.values.status).toBe("superseded");
    expect(writes.some((w) => w.op === "delete")).toBe(false);

    const eventWrite = writes.find((w) => w.table === "events");
    expect(eventWrite?.values.action).toBe("route.corrected");
  });

  it("refuses to correct a route that is already superseded", async () => {
    const { db } = stubDb({ originalStatus: "superseded" });
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
