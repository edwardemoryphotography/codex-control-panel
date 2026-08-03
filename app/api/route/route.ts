import { NextResponse } from "next/server";
import { callLlm, hasLlmProvider } from "@/lib/llm";
import { ROUTES, parseAiDecision } from "@/lib/routing";

type RouteRequestBody = {
  task?: string;
  currentTool?: string;
  priority?: string;
  overrideEnabled?: boolean;
  hybridEnabled?: boolean;
};

function buildClassifierPrompt(body: Required<RouteRequestBody>): string {
  const lanes = ROUTES.map(
    (route) =>
      `- key: "${route.key}" → tool: ${route.tool} — ${route.map}. Use when: ${route.reason}`,
  ).join("\n");

  return [
    "You are the routing brain of a personal AI-tool dispatcher.",
    "Pick the best tool lane(s) for the task below.",
    "",
    "Available lanes:",
    lanes,
    "",
    "Rules:",
    "- Choose 1 lane normally; choose 2 lanes (ordered) only when the task clearly has two distinct phases (e.g. research then build, design then deploy).",
    `- Hybrid (2-lane) routing is ${body.hybridEnabled ? "allowed" : "NOT allowed — return exactly 1 lane"}.`,
    `- The user is currently working in: ${body.currentTool}.`,
    body.overrideEnabled
      ? "- Execution override: if switching tools would slow the user down and the current tool can reasonably finish the task (urgent wording, explicit 'do it here', or the current tool already has the needed context), set override.active to true and explain why."
      : "- Execution override is disabled: always set override.active to false.",
    `- Priority mode: ${body.priority} (speed = bias toward execution, accuracy = bias toward research/architecture, balance = neutral).`,
    "- strength is your confidence in the primary lane, 0-100.",
    "- Each reason must be one short sentence.",
    "",
    "Task:",
    body.task,
    "",
    'JSON schema: {"routes":[{"key":"<lane key>","reason":"<one sentence>"}],"override":{"active":<boolean>,"reason":"<one sentence>"},"strength":<0-100>}',
  ].join("\n");
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

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

  let body: RouteRequestBody;
  try {
    body = (await request.json()) as RouteRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const task = body.task?.trim();
  if (!task) {
    return NextResponse.json({ error: "Task is required" }, { status: 400 });
  }

  const prompt = buildClassifierPrompt({
    task,
    currentTool: body.currentTool ?? "Gemini",
    priority: body.priority ?? "balance",
    overrideEnabled: body.overrideEnabled ?? true,
    hybridEnabled: body.hybridEnabled ?? true,
  });

  try {
    const { text, provider } = await callLlm(prompt, {
      maxTokens: 400,
      jsonOnly: true,
    });

    const decision = parseAiDecision(extractJson(text));
    if (!decision) {
      return NextResponse.json(
        { error: "AI returned an unusable routing decision" },
        { status: 502 },
      );
    }

    return NextResponse.json({ decision, provider });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
