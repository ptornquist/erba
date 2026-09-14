import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export type TypedSupabaseClient = SupabaseClient<Database>;

let browserClient: TypedSupabaseClient | undefined;

/**
 * Returns a singleton Supabase client for use in Client Components.
 *
 * Uses cookie-based session storage (via `@supabase/ssr`) so that the session
 * created on the client is also readable by Server Components and the proxy.
 */
export function createClient(): TypedSupabaseClient {
  if (browserClient) return browserClient;

  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  browserClient = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  return browserClient;
}

/**
 * Lazily-initialised standard client. Access as `supabase.from(...)`,
 * `supabase.auth.signUp(...)`, etc. Only safe in the browser / client components.
 */
export const supabase: TypedSupabaseClient = new Proxy(
  {} as TypedSupabaseClient,
  {
    get(_target, prop, receiver) {
      const client = createClient();
      const value = Reflect.get(client, prop, receiver) as unknown;
      return typeof value === "function"
        ? (value as (...args: unknown[]) => unknown).bind(client)
        : value;
    },
  },
);
