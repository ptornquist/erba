import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * Completes email confirmation / magic-link sign-in.
 * Supabase redirects here with `?code=` (PKCE); we exchange it for a session
 * cookie and forward the member to their intended destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Only allow same-origin relative redirects.
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam
    : "/dashboard";

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${origin}/join`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth callback: code exchange failed", error);
  }

  const failure = new URL("/join", origin);
  failure.searchParams.set("mode", "signin");
  failure.searchParams.set("error", "confirmation_failed");
  return NextResponse.redirect(failure);
}
