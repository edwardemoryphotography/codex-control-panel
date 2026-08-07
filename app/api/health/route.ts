import { NextResponse } from "next/server";
import {
  hasLlmProvider,
  keyDiagnostics,
  llmStatus,
  probeProvider,
} from "@/lib/llm";
import { clientId, rateLimit, requireOwner } from "@/lib/api-guard";

/**
 * Health endpoint covering AI configuration. Reports which providers are
 * configured, which models are in effect (and whether they were set
 * explicitly via env or are library defaults), the provider policy, and
 * key-format warnings. Never exposes key material.
 *
 * `GET /api/health?probe=1` additionally makes a minimal live call to each
 * configured provider to validate the key and model against the real API
 * (classifications only — e.g. "invalid_key" — never provider payloads).
 */
export async function GET(request: Request) {
  const status = llmStatus();
  const warnings = [
    ...(!hasLlmProvider()
      ? ["No AI provider configured — app runs on local doctrine routing only."]
      : []),
    ...(status.providers.anthropic.configured &&
    !status.providers.anthropic.explicit
      ? ["ANTHROPIC_MODEL not set — using library default; pin it for reproducibility."]
      : []),
    ...(status.providers.openai.configured && !status.providers.openai.explicit
      ? ["OPENAI_MODEL not set — using library default; pin it for reproducibility."]
      : []),
    ...keyDiagnostics(),
  ];

  const wantsProbe =
    new URL(request.url).searchParams.get("probe") === "1";

  if (!wantsProbe) {
    return NextResponse.json({
      ok: true,
      aiConfigured: hasLlmProvider(),
      ...status,
      warnings,
    });
  }

  // Probes hit real (paid) provider APIs — require owner auth + rate limit.
  const auth = requireOwner(request, hasLlmProvider());
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status },
    );
  }

  const limit = rateLimit(`probe:${clientId(request)}`, 5);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many probes — try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const probes = await Promise.all([
    probeProvider("anthropic"),
    probeProvider("openai"),
  ]);

  return NextResponse.json({
    ok: true,
    aiConfigured: hasLlmProvider(),
    ...status,
    warnings,
    probes,
    liveAiAvailable: probes.some((probe) => probe.ok),
  });
}
