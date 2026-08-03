import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Trimmed: a value pasted into the Vercel dashboard commonly carries a
  // trailing newline or space, which the API rejects as an invalid key.
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
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

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    // Log upstream detail server-side; don't return it to the browser, which
    // would expose the provider's raw error body and request id.
    console.error(
      `Anthropic API ${response.status}: ${await response.text()}`,
    );
    return NextResponse.json(
      {
        error:
          response.status === 401
            ? "The server's ANTHROPIC_API_KEY was rejected. Rotate the key and redeploy."
            : `Claude API request failed (${response.status})`,
      },
      { status: response.status },
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

  if (!text) {
    return NextResponse.json({ error: "Empty response from Claude" }, { status: 502 });
  }

  return NextResponse.json({ text });
}
