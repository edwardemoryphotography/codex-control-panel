import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toRoutedRequestRow,
  validateRouteProposal,
  type RouteProposal,
} from "@/lib/route-contract";
import { getSupabaseServiceClient } from "@/lib/supabase-server";

/**
 * POST /api/route/persist — the intake boundary between the Control Panel's
 * routing layer and the Foundry control plane. Persists a validated route to
 * the authoritative backend:
 *
 *   routed_requests (new row)
 *     → optional actions link (create or attach a work item)
 *     → events append (route.persisted / route.corrected)
 *     → evidence_items row with status 'pending'
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
 * Core persistence flow, isolated from HTTP and env so it is directly
 * testable with a stubbed Supabase client. Not transactional (Supabase REST
 * has no multi-table transaction) — each step reports honestly and the
 * response lists exactly what was and was not written.
 */
export async function persistRoute(
  db: SupabaseClient,
  proposal: RouteProposal,
): Promise<PersistResult> {
  // 1. The workspace must really exist — model-named projects are untrusted.
  const workspace = await db
    .from("workspaces")
    .select("id, name")
    .eq("id", proposal.workspaceId)
    .maybeSingle();
  if (workspace.error) {
    return {
      status: 502,
      body: { error: `Workspace lookup failed: ${workspace.error.message}` },
    };
  }
  if (!workspace.data) {
    return {
      status: 422,
      body: {
        error: `Workspace ${proposal.workspaceId} does not exist in the Foundry workspaces table.`,
        code: "unknown_workspace",
      },
    };
  }

  // 2. Corrections must reference a real, still-live original.
  let original: { id: string; status: string } | null = null;
  if (proposal.supersedesRequestId) {
    const found = await db
      .from("routed_requests")
      .select("id, status")
      .eq("id", proposal.supersedesRequestId)
      .maybeSingle();
    if (found.error || !found.data) {
      return {
        status: 409,
        body: {
          error: `Cannot correct route ${proposal.supersedesRequestId}: not found.`,
          code: "correction_target_missing",
        },
      };
    }
    if (found.data.status === "superseded") {
      return {
        status: 409,
        body: {
          error: `Route ${proposal.supersedesRequestId} is already superseded; correct the newest route in the chain.`,
          code: "correction_target_superseded",
        },
      };
    }
    original = found.data;
  }

  // 3. Optionally create the linked work item in the canonical actions table.
  let actionId: string | null = proposal.actionId ?? null;
  const warnings: string[] = [];
  if (proposal.createAction) {
    const action = await db
      .from("actions")
      .insert({
        action_title: proposal.intent.slice(0, 120),
        status: "TODO",
      })
      .select("id")
      .single();
    if (action.error || !action.data) {
      warnings.push(
        `Work item creation failed (${action.error?.message ?? "no row returned"}); route persisted without an actions link.`,
      );
    } else {
      actionId = action.data.id;
    }
  }

  // 4. Persist the route itself.
  const row = { ...toRoutedRequestRow(proposal), action_id: actionId };
  const inserted = await db
    .from("routed_requests")
    .insert(row)
    .select("*")
    .single();
  if (inserted.error || !inserted.data) {
    return {
      status: 502,
      body: {
        error: `Route persistence failed: ${inserted.error?.message ?? "no row returned"}`,
      },
    };
  }
  const routedRequest = inserted.data as { id: string };

  // 5. Mark the original superseded (history stays: the row itself is
  // immutable apart from lifecycle status, enforced by a DB trigger).
  if (original) {
    const superseded = await db
      .from("routed_requests")
      .update({ status: "superseded" })
      .eq("id", original.id);
    if (superseded.error) {
      warnings.push(
        `Original route ${original.id} could not be marked superseded: ${superseded.error.message}`,
      );
    }
  }

  // 6. Append the event to the canonical Foundry audit log.
  const event = await db.from("events").insert({
    workspace_id: proposal.workspaceId,
    action: original ? "route.corrected" : "route.persisted",
    target_type: "routed_request",
    target_id: routedRequest.id,
    metadata: {
      execution_lane: proposal.executionLane,
      repository: proposal.repository,
      route_source: proposal.routeSource,
      ...(original
        ? {
            supersedes_request_id: original.id,
            correction_reason: proposal.correctionReason,
          }
        : {}),
    },
  });
  const eventLogged = !event.error;
  if (event.error) {
    warnings.push(`Event append failed: ${event.error.message}`);
  }

  // 7. Evidence starts pending — nothing is verified at intake, ever.
  const evidence = await db
    .from("evidence_items")
    .insert({
      workspace_id: proposal.workspaceId,
      routed_request_id: routedRequest.id,
      action_id: actionId,
      kind: proposal.evidenceKind,
      status: "pending",
      claim: proposal.requiredEvidence,
      provenance: "unknown",
    })
    .select("id, status")
    .single();
  if (evidence.error || !evidence.data) {
    warnings.push(
      `Evidence row creation failed: ${evidence.error?.message ?? "no row returned"}`,
    );
  }

  return {
    status: 201,
    body: {
      routedRequest: inserted.data,
      workspace: workspace.data,
      actionId,
      eventLogged,
      evidence: evidence.data ?? null,
      corrected: original?.id ?? null,
      warnings,
    },
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
