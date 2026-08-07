import { createHash, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toRouteProposalPayload,
  validateRouteProposal,
  type RouteProposal,
} from "@/lib/route-contract";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * POST /api/route/persist — the intake boundary between the Control Panel's
 * routing layer and the Foundry control plane. Persists a validated route
 * through persist_route_atomic(jsonb), the single write path the Foundry
 * database exposes for routed_requests / evidence_items (direct table
 * INSERT/UPDATE was revoked from every client role once that RPC landed —
 * legacy-codex migration 20260804020000_routing_control_plane_hardening.sql).
 * That one call atomically does what used to be four separate round trips
 * here: persist the route (or replay an existing one by idempotency key),
 * supersede the original on a correction, append the events audit row, and
 * insert the evidence row with status 'pending'.
 *
 * The Control Panel stores nothing itself — the Foundry database is the only
 * system of record. Owner-gated via APP_ACCESS_TOKEN (same header contract
 * as the other AI endpoints: x-codex-key or Authorization: Bearer).
 */

function tokensMatch(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function ownerAuthError(request: Request): NextResponse | null {
  const expected = process.env.APP_ACCESS_TOKEN?.trim();
  if (!expected) {
    return NextResponse.json(
      {
        error:
          "Route persistence is locked: set APP_ACCESS_TOKEN in the deployment environment.",
      },
      { status: 503 },
    );
  }
  const header = request.headers.get("x-codex-key")?.trim();
  const bearer = request.headers.get("authorization");
  const provided =
    header ||
    (bearer?.toLowerCase().startsWith("bearer ") ? bearer.slice(7).trim() : "");
  if (!provided || !tokensMatch(provided, expected)) {
    return NextResponse.json(
      { error: "Unauthorized: owner access token required." },
      { status: 401 },
    );
  }
  return null;
}

export interface PersistResult {
  status: number;
  body: Record<string, unknown>;
}

/**
 * persist_route_atomic raises a plain exception (message-only, no
 * structured SQLSTATE) for every condition it checks itself; a bare 502 is
 * the fallback for anything else — a table CHECK constraint firing despite
 * the app-level validation upstream, for example, which should not happen
 * but must still surface as a real error rather than a false success.
 */
function mapRpcError(message: string): { status: number; code: string } {
  if (message.startsWith("unknown_workspace:")) {
    return { status: 422, code: "unknown_workspace" };
  }
  if (message.startsWith("correction_target_missing:")) {
    return { status: 409, code: "correction_target_missing" };
  }
  if (message.startsWith("correction_target_wrong_workspace:")) {
    return { status: 409, code: "correction_target_wrong_workspace" };
  }
  if (message.startsWith("correction_target_superseded:")) {
    return { status: 409, code: "correction_target_superseded" };
  }
  if (message.startsWith("invalid_status:")) {
    return { status: 422, code: "invalid_status" };
  }
  if (message === "idempotency_key is required") {
    return { status: 400, code: "idempotency_key_required" };
  }
  if (message === "action_link_disabled_pending_owner_policy") {
    return { status: 409, code: "action_link_disabled" };
  }
  return { status: 502, code: "route_persistence_failed" };
}

/**
 * Core persistence flow, isolated from HTTP and env so it is directly
 * testable with a stubbed Supabase client. The RPC call is the entire flow:
 * persist_route_atomic does the workspace check, correction-target lock,
 * route insert, supersede-the-original update, events append, and evidence
 * insert as one Postgres transaction — this function's job is just to shape
 * the request and translate the RPC's result/error into an HTTP response.
 */
export async function persistRoute(
  db: SupabaseClient,
  proposal: RouteProposal,
): Promise<PersistResult> {
  // Work-item linking has no owner-only, workspace-aware policy yet, so the
  // RPC rejects action_id/create_action outright if either key is present.
  // Never forward them; surface the gap as a warning instead of a 409.
  const warnings: string[] = [];
  if (proposal.createAction || proposal.actionId) {
    warnings.push(
      "Work item linking is disabled at the database layer pending an owner-only, workspace-aware policy on actions; route persisted without an actions link.",
    );
  }

  const idempotencyKey = proposal.idempotencyKey ?? randomUUID();
  const payload = toRouteProposalPayload(proposal, idempotencyKey);

  const rpc = await db.rpc("persist_route_atomic", { p_proposal: payload });
  if (rpc.error) {
    const mapped = mapRpcError(rpc.error.message);
    return {
      status: mapped.status,
      body: { error: rpc.error.message, code: mapped.code },
    };
  }

  const result = (rpc.data ?? {}) as Record<string, unknown>;
  const rpcWarnings = Array.isArray(result.warnings)
    ? (result.warnings as string[])
    : [];

  return {
    status: result.replayed === true ? 200 : 201,
    body: { ...result, warnings: [...rpcWarnings, ...warnings] },
  };
}

export async function POST(request: Request) {
  const authError = ownerAuthError(request);
  if (authError) return authError;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateRouteProposal(payload);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Route proposal rejected.", violations: validation.violations },
      { status: 422 },
    );
  }

  const db = getSupabaseServiceClient();
  if (!db) {
    return NextResponse.json(
      {
        error:
          "Foundry backend not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the deployment environment (server-side only).",
      },
      { status: 503 },
    );
  }

  const result = await persistRoute(db, validation.proposal);
  return NextResponse.json(result.body, { status: result.status });
}
