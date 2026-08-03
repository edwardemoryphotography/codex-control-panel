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

// Trimmed: a value pasted into a hosting dashboard commonly carries a trailing
// newline or space, which providers reject as an invalid key. Trimming also
// makes a whitespace-only value read as "not configured" rather than being
// sent upstream and coming back as an opaque 401.
const anthropicKey = () => process.env.ANTHROPIC_API_KEY?.trim();
const openAiKey = () => process.env.OPENAI_API_KEY?.trim();

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
    // Log upstream detail server-side. These messages are aggregated into the
    // 502 body the browser receives, so the provider's raw error and request id
    // must not travel in them.
    console.error(`Anthropic ${response.status}: ${await response.text()}`);
    throw new Error(
      response.status === 401
        ? "The server's ANTHROPIC_API_KEY was rejected. Rotate the key and redeploy."
        : `Anthropic request failed (${response.status})`,
    );
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
    console.error(`OpenAI ${response.status}: ${await response.text()}`);
    throw new Error(
      response.status === 401
        ? "The server's OPENAI_API_KEY was rejected. Rotate the key and redeploy."
        : `OpenAI request failed (${response.status})`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("OpenAI returned an empty response");
  return text;
}

export function hasLlmProvider(): boolean {
  return Boolean(anthropicKey() || openAiKey());
}

/**
 * Calls the first configured provider, falling back to the next one when a
 * call fails. Order: Anthropic (Claude) → OpenAI (GPT).
 */
export async function callLlm(
  prompt: string,
  options: LlmOptions = {},
): Promise<LlmResponse> {
  const anthropic = anthropicKey();
  const openAi = openAiKey();

  if (!anthropic && !openAi) {
    throw new Error(
      "No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.",
    );
  }

  const finalPrompt = options.jsonOnly
    ? `${prompt}\n\nRespond with a single valid JSON object and nothing else — no prose, no markdown fences.`
    : prompt;

  const failures: string[] = [];

  if (anthropic) {
    try {
      const text = await callAnthropic(anthropic, finalPrompt, options);
      return { text, provider: "anthropic" };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  if (openAi) {
    try {
      const text = await callOpenAi(openAi, finalPrompt, options);
      return { text, provider: "openai" };
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  throw new Error(failures.join(" | "));
}
