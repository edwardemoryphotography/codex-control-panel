import { NextResponse } from "next/server";
import { callLlm, hasLlmProvider } from "@/lib/llm";
import { auditLog, clientId, rateLimit, requestId } from "@/lib/api-guard";

const MAX_PROMPT_CHARS = 12_000;
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

  if (!hasLlmProvider()) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.",
        requestId: rid,
      },
      { status: 503 },
    );
  }

  let body: { prompt?: string };
  try {
    body = (await request.json()) as { prompt?: string };
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body", requestId: rid },
      { status: 400 },
    );
  }

  const prompt = body.prompt?.trim();
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
    auditLog("run.error", {
      requestId: rid,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        error: "Live run failed — copy the prompt and run it manually instead.",
        requestId: rid,
      },
      { status: 502 },
    );
  }
}
