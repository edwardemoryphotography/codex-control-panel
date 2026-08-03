import { NextResponse } from "next/server";
import { callLlm, hasLlmProvider } from "@/lib/llm";

export async function POST(request: Request) {
  if (!hasLlmProvider()) {
    return NextResponse.json(
      {
        error:
          "No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.",
      },
      { status: 503 },
    );
  }

  let body: { prompt?: string };
  try {
    body = (await request.json()) as { prompt?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const { text, provider } = await callLlm(prompt, { maxTokens: 1000 });
    return NextResponse.json({ text, provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
