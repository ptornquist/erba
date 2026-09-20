import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

export { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured.");
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Client-component helper for auth. `createBrowserClient` is already a singleton.
 * Import only from `'use client'` modules — never from the server.
 */
export const supabaseClient = {
  get auth() {
    return createClient().auth;
  },
};
