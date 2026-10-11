import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client.
 *
 * Uses the SECRET (service-role) key, which bypasses row-level security, so
 * this file must only ever be imported from server code (API routes). The
 * env vars deliberately have no NEXT_PUBLIC_ prefix, which means Next.js will
 * never bundle them into browser JavaScript.
 */

let client: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  client =
    url && key
      ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  return client;
}

export function wishesRequireApproval() {
  return process.env.WISHES_REQUIRE_APPROVAL === "true";
}
