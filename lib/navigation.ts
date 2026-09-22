/**
 * Full-page navigation to a same-origin path.
 *
 * Used after auth transitions (sign-in, sign-up, sign-out): the Next.js client
 * router may hold a prefetched response for the destination that was produced
 * *before* the session cookie existed (e.g. a redirect to /join), and a
 * soft `router.push()` would replay it. A document navigation always hits the
 * server with the fresh cookies.
 */
export function hardNavigate(path: string): void {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  window.location.assign(new URL(safePath, window.location.origin).href);
}
