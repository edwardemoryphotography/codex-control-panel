export type LlmProvider = "anthropic" | "openai";

export type LlmResponse = {
  text: string;
  provider: LlmProvider;
};

export type LlmOptions = {
  maxTokens?: number;
  /** Nudges providers toward emitting a single JSON object. */
  jsonOnly?: boolean;
};

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

async function callAnthropic(
  apiKey: string,
  prompt: string,
  options: LlmOptions,
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: options.maxTokens ?? 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic ${response.status}: ${errorText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };

  const text = (data.content ?? [])
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Anthropic returned an empty response");
  return text;
}

async function callOpenAi(
  apiKey: string,
  prompt: string,
  options: LlmOptions,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_completion_tokens: options.maxTokens ?? 1000,
      messages: [{ role: "user", content: prompt }],
      ...(options.jsonOnly
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI ${response.status}: ${errorText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}

export function hasLlmProvider(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Calls the first configured provider, falling back to the next one when a
 * call fails. Order: Anthropic (Claude) → OpenAI (GPT).
 */
export async function callLlm(
  prompt: string,
  options: LlmOptions = {},
): Promise<LlmResponse> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!anthropicKey && !openAiKey) {
    throw new Error(
      "No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.",
    );
  }

  const finalPrompt = options.jsonOnly
    ? `${prompt}\n\nRespond with a single valid JSON object and nothing else — no prose, no markdown fences.`
    : prompt;

  const failures: string[] = [];

  if (anthropicKey) {
    try {
      const text = await callAnthropic(anthropicKey, finalPrompt, options);
      return { text, provider: "anthropic" };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (openAiKey) {
    try {
      const text = await callOpenAi(openAiKey, finalPrompt, options);
      return { text, provider: "openai" };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(failures.join(" | "));
}
