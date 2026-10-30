import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getLocation } from "@/content/locations";

/** /quinceanera-photographer/<city> and /es/fotografo-de-quinceaneras/<city> (page only). */
const CITY_PAGE = /^\/(?:quinceanera-photographer|es\/fotografo-de-quinceaneras)\/([^/]+)\/?$/;

/** No route matches this path, so a rewrite to it renders app/not-found.tsx with a 404. */
const NOT_FOUND_PATH = "/_txq-not-found";

/**
 * Runs on /admin/* (Supabase session refresh) and on the two city-page routes
 * only; the rest of the public site stays untouched (and fast).
 *
 * City pages: a slug that is not in src/content/locations.ts must be a real
 * 404. The page's own notFound() is too late for that: the root loading.tsx
 * boundary has already started streaming, so the response goes out as a 200
 * with a noindex tag (a soft 404 — /quinceanera-photographer/houston was one).
 * `dynamicParams = false` would also do it under `next start`, but under
 * OpenNext on Workers it 404s the prerendered cities too, so the check lives
 * here, before rendering, as Next's loading.js docs recommend.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return updateSession(request);

  const slug = CITY_PAGE.exec(pathname)?.[1];
  if (slug !== undefined && !isKnownCity(slug)) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }
  return NextResponse.next();
}

function isKnownCity(slug: string): boolean {
  try {
    return getLocation(decodeURIComponent(slug)) !== undefined;
  } catch {
    return false; // malformed percent-encoding
  }
}

export const config = {
  matcher: ["/admin/:path*", "/quinceanera-photographer/:city", "/es/fotografo-de-quinceaneras/:city"],
};
