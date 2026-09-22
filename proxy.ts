import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import type { Database } from "@/types/database";

const PROTECTED_PREFIXES = ["/dashboard"];

/**
 * Refreshes the Supabase session cookie on every request and guards
 * protected routes. Unauthenticated visitors are redirected to /join.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = SUPABASE_URL;
  const anonKey = SUPABASE_ANON_KEY;
  const isProtected = PROTECTED_PREFIXES.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (!url || !anonKey) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/join", request.url));
    }
    return response;
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const redirectUrl = new URL("/join", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and image optimisation routes.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
