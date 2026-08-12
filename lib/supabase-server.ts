import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedServiceClient: SupabaseClient | null = null;
let cachedAnonClient: SupabaseClient | null = null;

/**
 * Server-only Supabase client for the Foundry backend. Uses the service-role
 * key because the routing control plane tables (routed_requests,
 * evidence_items) are owner-only under RLS and this API is itself gated by
 * the owner access token. The key is read exclusively from server env —
 * it must never appear in client code or NEXT_PUBLIC_ variables.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  if (!cachedServiceClient) {
    cachedServiceClient = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }

  return cachedServiceClient;
}

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  // Module-global cache is safe here because the anon client carries no
  // per-user JWT — it is the same public key for every request. If a
  // future endpoint needs a user-scoped client (e.g. auth.getUser()), do
  // NOT reuse this singleton; create a per-request client instead.
  if (!cachedAnonClient) {
    cachedAnonClient = createClient(url, anonKey);
  }

  return cachedAnonClient;
}
