import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isLocale, localizePath, routing } from "@/i18n/routing";

/**
 * Completes email confirmation / magic-link sign-in.
 * Supabase redirects here with `?code=` (PKCE); we exchange it for a session
 * cookie and forward the member to their intended destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const locale =
    cookieLocale && isLocale(cookieLocale)
      ? cookieLocale
      : routing.defaultLocale;
  const loginPath = localizePath(locale, "/login");

  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : localizePath(locale, "/dashboard");

  if (!isSupabaseConfigured) {
    return NextResponse.redirect(`${origin}${loginPath}`);
  }

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Auth callback: code exchange failed", error);
  }

  const failure = new URL(loginPath, origin);
  failure.searchParams.set("error", "confirmation_failed");
  return NextResponse.redirect(failure);
}
