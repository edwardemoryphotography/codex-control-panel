/**
 * Minimal request safeguards for the API route handlers: per-client rate
 * limiting (best-effort, in-memory — resets per serverless instance),
 * request IDs, and structured audit logging.
 */

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
