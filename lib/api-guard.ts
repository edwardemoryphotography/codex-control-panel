/**
 * Minimal request safeguards for the API route handlers: owner-only
 * authentication, real request-body size limits, per-client rate limiting
 * (best-effort, in-memory — resets per serverless instance; for true
 * distributed limiting use Upstash Redis or Vercel KV — see docs/DEPLOY_VERIFY.md),
 * request IDs, and structured audit logging (visible in Vercel function logs;
 * for dashboards use Vercel Analytics or Sentry).
 */

import { createHash, timingSafeEqual } from "node:crypto";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  id: string,
  limit: number,
  windowMs = 60_000,
  now = Date.now(),
): { ok: boolean; retryAfterSec: number } {
  // Opportunistic pruning keeps the map bounded.
  if (buckets.size > 1000) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  const bucket = buckets.get(id);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}

export function clientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "anonymous";
}

export function requestId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export function auditLog(
  event: string,
  fields: Record<string, unknown>,
): void {
  // One structured line per request — visible in Vercel function logs.
  console.log(JSON.stringify({ evt: event, at: new Date().toISOString(), ...fields }));
}

function tokensMatch(provided: string, expected: string): boolean {
  // Hashing first equalizes lengths so timingSafeEqual never throws and the
  // comparison stays constant-time regardless of input length.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export function accessTokenFrom(request: Request): string {
  const header = request.headers.get("x-codex-key");
  if (header) return header.trim();
  const bearer = request.headers.get("authorization");
  if (bearer?.toLowerCase().startsWith("bearer ")) {
    return bearer.slice(7).trim();
  }
  return "";
}

export type OwnerAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

/**
 * Owner-only gate for endpoints that spend money on AI providers.
 *
 * - `APP_ACCESS_TOKEN` set → the request must present the matching token
 *   (`x-codex-key` header or `Authorization: Bearer`), compared in
 *   constant time.
 * - `APP_ACCESS_TOKEN` unset while provider keys ARE configured → fail
 *   closed with 503: paid endpoints refuse to run unauthenticated.
 * - Neither configured → allow; the endpoint will 503 on the missing
 *   provider anyway and nothing paid can happen.
 */
export function requireOwner(
  request: Request,
  aiConfigured: boolean,
  env: Record<string, string | undefined> = process.env,
): OwnerAuthResult {
  const expected = env.APP_ACCESS_TOKEN?.trim();

  if (!expected) {
    if (aiConfigured) {
      return {
        ok: false,
        status: 503,
        error:
          "AI endpoints are locked: set APP_ACCESS_TOKEN in the deployment environment, then enter the same key under Preferences → Access key.",
      };
    }
    return { ok: true };
  }

  const provided = accessTokenFrom(request);
  if (!provided || !tokensMatch(provided, expected)) {
    return {
      ok: false,
      status: 401,
      error:
        "Access key missing or incorrect. Enter the deployment's APP_ACCESS_TOKEN under Preferences → Access key.",
    };
  }
  return { ok: true };
}

const DEFAULT_BODY_LIMIT_BYTES = 32_768;

export type BodyReadResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413; error: string };

/**
 * Reads and parses a JSON body while enforcing a real byte limit — both on
 * the declared Content-Length and on the actual bytes read — instead of
 * checking individual field lengths after parsing.
 */
export async function readJsonBody(
  request: Request,
  maxBytes = DEFAULT_BODY_LIMIT_BYTES,
): Promise<BodyReadResult> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    return {
      ok: false,
      status: 413,
      error: `Request body too large (max ${maxBytes} bytes).`,
    };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, status: 400, error: "Unreadable request body" };
  }

  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    return {
      ok: false,
      status: 413,
      error: `Request body too large (max ${maxBytes} bytes).`,
    };
  }

  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON body" };
  }
}
