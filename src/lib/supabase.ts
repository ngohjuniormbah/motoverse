import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side Supabase client using the service_role key.
// Talks to Supabase over HTTPS REST — no Postgres connection string needed.
let cached: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
export const BUCKET = process.env.SUPABASE_BUCKET || "motoverse";

// adds createdAt (camelCase) alongside created_at for the frontend
export function withCreatedAt<T extends Record<string, any>>(rows: T[] | null): T[] {
  return (rows || []).map((r) => ({ ...r, createdAt: r.created_at }));
}
