const DEFAULT_URL = "";
const DEFAULT_ANON_KEY = "";

function normaliseUrl(value: string): string {
  return value.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

export const SUPABASE_URL = normaliseUrl(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_URL,
);

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_ANON_KEY;

export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20;
