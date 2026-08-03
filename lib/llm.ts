export type LlmProvider = "anthropic" | "openai";

/**
 * Provider selection is a policy decision made per purpose (task type),
 * separate from failover. `classify` calls are small, structured, and
 * latency-sensitive; `generate` calls are long-form completions.
 */
export type LlmPurpose = "classify" | "generate";

export type JsonSchemaSpec = {
  name: string;
  schema: Record<string, unknown>;
};

export type LlmOptions = {
  purpose?: LlmPurpose;
  maxTokens?: number;
  /**
   * When set, uses each provider's native structured-output mechanism
   * (OpenAI `response_format: json_schema` strict mode, Anthropic forced
   * tool use) instead of prompting for JSON and hoping it parses.
   */
  schema?: JsonSchemaSpec;
};

export type LlmResponse = {
  text: string;
  /** Parsed structured output when `schema` was provided. */
  json?: unknown;
  provider: LlmProvider;
  model: string;
  latencyMs: number;
  /** Recorded reasons for any providers that were skipped or failed over. */
  failovers: string[];
};

const DEFAULT_MODELS: Record<LlmProvider, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o-mini",
};

const DEFAULT_ORDER: Record<LlmPurpose, LlmProvider[]> = {
  classify: ["anthropic", "openai"],
  generate: ["anthropic", "openai"],
};

const DEFAULT_TIMEOUT_MS = 30_000;

export function configuredModel(provider: LlmProvider): {
  model: string;
  explicit: boolean;
} {
  const envVar = (
    provider === "anthropic"
      ? process.env.ANTHROPIC_MODEL
      : process.env.OPENAI_MODEL
  )?.trim();
  return envVar
    ? { model: envVar, explicit: true }
    : { model: DEFAULT_MODELS[provider], explicit: false };
}

function parseOrder(raw: string | undefined): LlmProvider[] | null {
  if (!raw) return null;
  const entries = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry): entry is LlmProvider =>
      entry === "anthropic" || entry === "openai",
    );
  return entries.length > 0 ? [...new Set(entries)] : null;
}

/**
 * Resolves the provider order for a purpose. Overridable per purpose via
 * LLM_CLASSIFY_ORDER / LLM_GENERATE_ORDER (e.g. "openai,anthropic").
 * Exported for tests.
 */
export function providerOrder(
  purpose: LlmPurpose,
  env: Record<string, string | undefined> = process.env,
): LlmProvider[] {
  const override = parseOrder(
    purpose === "classify" ? env.LLM_CLASSIFY_ORDER : env.LLM_GENERATE_ORDER,
  );
  return override ?? DEFAULT_ORDER[purpose];
}

function timeoutMs(): number {
  const parsed = Number(process.env.LLM_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

function rawProviderKey(provider: LlmProvider): string | undefined {
  return provider === "anthropic"
    ? process.env.ANTHROPIC_API_KEY
    : process.env.OPENAI_API_KEY;
}

function providerKey(provider: LlmProvider): string | undefined {
  // Keys pasted into dashboards frequently pick up a trailing newline or
  // space, which providers reject as "invalid x-api-key". Trim defensively.
  const trimmed = rawProviderKey(provider)?.trim();
  return trimmed || undefined;
}

/**
 * Non-secret sanity checks on configured keys, for the health endpoint.
 * Catches the common paste accidents behind 401 authentication_error.
 */
export function keyDiagnostics(): string[] {
  const warnings: string[] = [];
  const expectations: Record<LlmProvider, { env: string; prefix: string }> = {
    anthropic: { env: "ANTHROPIC_API_KEY", prefix: "sk-ant-" },
    openai: { env: "OPENAI_API_KEY", prefix: "sk-" },
  };

  for (const provider of ["anthropic", "openai"] as LlmProvider[]) {
    const raw = rawProviderKey(provider);
    if (!raw) continue;
    const { env, prefix } = expectations[provider];
    if (raw !== raw.trim()) {
      warnings.push(
        `${env} has leading/trailing whitespace (auto-trimmed at runtime) — re-paste it cleanly.`,
      );
    }
    const key = raw.trim();
    if (/\s/.test(key)) {
      warnings.push(
        `${env} contains internal whitespace — it is almost certainly truncated or pasted wrong.`,
      );
    } else if (!key.startsWith(prefix)) {
      warnings.push(
        `${env} does not start with "${prefix}" — check that the full key was pasted.`,
      );
    }
  }
  return warnings;
}

export type ProbeResult = {
  provider: LlmProvider;
  model: string;
  ok: boolean;
  classification:
    | "ok"
    | "invalid_key"
    | "permission_denied"
    | "model_not_found"
    | "rate_limited"
    | "error"
    | "not_configured";
  status?: number;
};

/**
 * Makes a minimal live call to validate the configured key + model
 * (charter §5.3: validate configured model availability at deployment).
 * Returns a safe classification only — never provider response bodies.
 */
export async function probeProvider(
  provider: LlmProvider,
): Promise<ProbeResult> {
  const { model } = configuredModel(provider);
  const key = providerKey(provider);
  if (!key) {
    return { provider, model, ok: false, classification: "not_configured" };
  }

  let status: number;
  try {
    if (provider === "anthropic") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1,
          messages: [{ role: "user", content: "ping" }],
        }),
      });
      status = response.status;
    } else {
      // GET /v1/models/{id} validates both the key and the model for free.
      const response = await fetch(
        `https://api.openai.com/v1/models/${encodeURIComponent(model)}`,
        {
          signal: AbortSignal.timeout(10_000),
          headers: { Authorization: `Bearer ${key}` },
        },
      );
      status = response.status;
    }
  } catch {
    return { provider, model, ok: false, classification: "error" };
  }

  const classification: ProbeResult["classification"] =
    status >= 200 && status < 300
      ? "ok"
      : status === 401
        ? "invalid_key"
        : status === 403
          ? "permission_denied"
          : status === 404
            ? "model_not_found"
            : status === 429
              ? "rate_limited"
              : "error";

  return { provider, model, ok: classification === "ok", classification, status };
}

/** True when the aggregated failure text indicates a rejected API key. */
export function isAuthFailure(message: string): boolean {
  return /\b401\b|invalid x-api-key|authentication_error|incorrect api key/i.test(
    message,
  );
}

export function hasLlmProvider(): boolean {
  return Boolean(providerKey("anthropic") || providerKey("openai"));
}

/** Configuration snapshot for the health endpoint. Never includes keys. */
export function llmStatus() {
  return {
    providers: {
      anthropic: {
        configured: Boolean(providerKey("anthropic")),
        ...configuredModel("anthropic"),
      },
      openai: {
        configured: Boolean(providerKey("openai")),
        ...configuredModel("openai"),
      },
    },
    order: {
      classify: providerOrder("classify"),
      generate: providerOrder("generate"),
    },
    timeoutMs: timeoutMs(),
  };
}

async function callAnthropic(
  apiKey: string,
  prompt: string,
  options: LlmOptions,
): Promise<{ text: string; json?: unknown; model: string }> {
  const { model } = configuredModel("anthropic");

  const structured = options.schema
    ? {
        tools: [
          {
            name: options.schema.name,
            description:
              "Report the result. Always call this tool with the answer.",
            input_schema: options.schema.schema,
            // Enforce the schema server-side rather than best-effort.
            strict: true,
          },
        ],
        tool_choice: { type: "tool", name: options.schema.name },
      }
    : {};

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs()),
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 1000,
      messages: [{ role: "user", content: prompt }],
      ...structured,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic ${response.status}: ${errorText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    content?: Array<{
      type: string;
      text?: string;
      name?: string;
      input?: unknown;
    }>;
  };

  if (options.schema) {
    const toolUse = (data.content ?? []).find(
      (block) => block.type === "tool_use" && block.name === options.schema!.name,
    );
    if (!toolUse || toolUse.input === undefined) {
      throw new Error("Anthropic did not return the structured tool output");
    }
    return { text: JSON.stringify(toolUse.input), json: toolUse.input, model };
  }

  const text = (data.content ?? [])
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!text) throw new Error("Anthropic returned an empty response");
  return { text, model };
}

async function callOpenAi(
  apiKey: string,
  prompt: string,
  options: LlmOptions,
): Promise<{ text: string; json?: unknown; model: string }> {
  const { model } = configuredModel("openai");

  const structured = options.schema
    ? {
        response_format: {
          type: "json_schema",
          json_schema: {
            name: options.schema.name,
            strict: true,
            schema: options.schema.schema,
          },
        },
      }
    : {};

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs()),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: options.maxTokens ?? 1000,
      messages: [{ role: "user", content: prompt }],
      ...structured,
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

  if (options.schema) {
    try {
      return { text, json: JSON.parse(text), model };
    } catch {
      throw new Error("OpenAI structured output was not valid JSON");
    }
  }

  return { text, model };
}

/**
 * Calls providers in the policy order for the given purpose. Failover to
 * the next provider only happens on error, and every failover is recorded
 * in the response so callers can audit why a provider was switched.
 */
export async function callLlm(
  prompt: string,
  options: LlmOptions = {},
): Promise<LlmResponse> {
  const purpose = options.purpose ?? "generate";
  const order = providerOrder(purpose);
  const failovers: string[] = [];
  const started = Date.now();

  const available = order.filter((provider) => {
    if (providerKey(provider)) return true;
    failovers.push(`${provider}: no API key configured`);
    return false;
  });

  if (available.length === 0) {
    throw new Error(
      "No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.",
    );
  }

  for (const provider of available) {
    try {
      const result =
        provider === "anthropic"
          ? await callAnthropic(providerKey(provider)!, prompt, options)
          : await callOpenAi(providerKey(provider)!, prompt, options);
      return {
        ...result,
        provider,
        latencyMs: Date.now() - started,
        failovers,
      };
    } catch (error) {
      failovers.push(
        `${provider}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  throw new Error(failovers.join(" | "));
}
