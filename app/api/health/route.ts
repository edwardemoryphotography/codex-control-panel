import { NextResponse } from "next/server";
import { hasLlmProvider, llmStatus } from "@/lib/llm";

/**
 * Health endpoint covering AI configuration. Reports which providers are
 * configured, which models are in effect (and whether they were set
 * explicitly via env or are library defaults), and the provider policy.
 * Never exposes key material.
 */
export async function GET() {
  const status = llmStatus();
  return NextResponse.json({
    ok: true,
    aiConfigured: hasLlmProvider(),
    ...status,
    warnings: [
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
    ],
  });
}
