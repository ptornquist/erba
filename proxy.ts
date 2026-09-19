import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing, localizePath, stripLocalePrefix, hasRetiredLocalePrefix } from "@/i18n/routing";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase-config";
import type { Database } from "@/types/database";

const intlMiddleware = createIntlMiddleware(routing);

function isProtectedPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

/**
 * Session refresh. Unauthenticated visitors to
 * the dashboard are sent to /login.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (hasRetiredLocalePrefix(pathname)) {
    const { pathname: stripped } = stripLocalePrefix(pathname);
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url, 308);
  }

  const skipIntl =
    pathname.startsWith("/auth") || pathname.startsWith("/api");

  const response = skipIntl
    ? NextResponse.next({ request })
    : intlMiddleware(request);

  const { locale, pathname: stripped } = stripLocalePrefix(pathname);
  const isProtected = isProtectedPath(stripped);
  const loginPath = localizePath(locale, "/login");

  const url = SUPABASE_URL;
  const anonKey = SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (isProtected) {
      return NextResponse.redirect(new URL(loginPath, request.url));
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
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set("next", pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
