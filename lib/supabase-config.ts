/**
 * Supabase connection settings.
 *
 * The URL and anon/publishable key are public by design: they ship to every
 * browser and all data access is governed by Postgres row-level security.
 * Environment variables take precedence so a fork or staging project can
 * override the defaults without a code change.
 */
const DEFAULT_SUPABASE_URL = "https://uvjqoqbmhyesnphuexyu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2anFvcWJtaHllc25waHVleHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzOTEyNTUsImV4cCI6MjEwNDk2NzI1NX0.wTP5ZhYA2cyHHWEehYXN1GSfOkyYJ2nHmcOgkIPtpAg";

function normaliseUrl(value: string): string {
  // Accept the REST endpoint or a trailing slash and reduce to the project base URL.
  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export const SUPABASE_URL = normaliseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL,
);

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
