import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
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

  const { data, error } = await supabase.rpc("initialize_session_start", {
    session_mode: sessionMode,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ actions: data ?? [] });
}
