import { NextResponse } from "next/server";
import { callLlm, hasLlmProvider, isAuthFailure } from "@/lib/llm";
import {
  auditLog,
  clientId,
  rateLimit,
  readJsonBody,
  requireOwner,
  requestId,
} from "@/lib/api-guard";

const MAX_PROMPT_CHARS = 12_000;
const MAX_BODY_BYTES = 65_536;
const RATE_LIMIT_PER_MINUTE = 10;

export async function POST(request: Request) {
  const rid = requestId();

  const limit = rateLimit(clientId(request), RATE_LIMIT_PER_MINUTE);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests — try again shortly.", requestId: rid },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const aiConfigured = hasLlmProvider();
  const auth = requireOwner(request, aiConfigured);
  if (!auth.ok) {
    auditLog("run.denied", { requestId: rid, status: auth.status });
    return NextResponse.json(
      { error: auth.error, requestId: rid },
      { status: auth.status },
    );
  }

  if (!aiConfigured) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.",
        requestId: rid,
      },
      { status: 503 },
    );
  }

  const read = await readJsonBody(request, MAX_BODY_BYTES);
  if (!read.ok) {
    return NextResponse.json(
      { error: read.error, requestId: rid },
      { status: read.status },
    );
  }

  const raw =
    typeof read.value === "object" && read.value !== null
      ? (read.value as { prompt?: unknown })
      : {};
  if (typeof raw.prompt !== "string") {
    return NextResponse.json(
      { error: "prompt must be a string", requestId: rid },
      { status: 400 },
    );
  }
  const prompt = raw.prompt.trim();
  if (!prompt) {
    return NextResponse.json(
      { error: "Prompt is required", requestId: rid },
      { status: 400 },
    );
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return NextResponse.json(
      {
        error: `Prompt is too long (max ${MAX_PROMPT_CHARS} characters).`,
        requestId: rid,
      },
      { status: 413 },
    );
  }

  try {
    const response = await callLlm(prompt, {
      purpose: "generate",
      maxTokens: 1000,
    });

    auditLog("run.ok", {
      requestId: rid,
      provider: response.provider,
      model: response.model,
      latencyMs: response.latencyMs,
      failovers: response.failovers,
      promptChars: prompt.length,
    });

    return NextResponse.json({
      text: response.text,
      provider: response.provider,
      model: response.model,
      requestId: rid,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    auditLog("run.error", { requestId: rid, error: detail });
    return NextResponse.json(
      {
        error: isAuthFailure(detail)
          ? "The AI provider rejected the server's API key. Re-paste the key in your deployment environment (no quotes or trailing spaces), redeploy, then verify at /api/health?probe=1."
          : "Draft generation failed — copy the prompt and run it manually instead.",
        requestId: rid,
      },
      { status: 502 },
    );
  }
}
