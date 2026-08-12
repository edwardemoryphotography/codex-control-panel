import { NextResponse } from "next/server";
import { auditLog, clientId, rateLimit, requestId, requireOwner } from "@/lib/api-guard";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const rid = requestId();
  const cid = clientId(request);

  // Owner gate when APP_ACCESS_TOKEN is configured — same header contract as
  // /api/route and /api/route/persist (x-codex-key or Authorization: Bearer).
  // Actions touches the Foundry backend, so unauthenticated list should be
  // denied when the deployment is locked.
  const auth = requireOwner(request, false);
  if (!auth.ok) {
    auditLog("actions_denied", { rid, cid, status: auth.status });
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const limit = rateLimit(`actions:${cid}`, 30);
  if (!limit.ok) {
    auditLog("actions_rate_limited", { rid, cid, retryAfterSec: limit.retryAfterSec });
    return NextResponse.json(
      { error: "Too many requests — try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  auditLog("actions_request", { rid, cid, mode: new URL(request.url).searchParams.get("mode") });

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "SUPABASE_URL / SUPABASE_ANON_KEY are not configured" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const sessionMode = searchParams.get("mode") ?? "low";
  if (sessionMode !== "high" && sessionMode !== "low") {
    return NextResponse.json(
      { error: "mode must be 'high' or 'low'" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase.rpc("initialize_session_start", {
      session_mode: sessionMode,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ actions: data ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 },
    );
  }
}
