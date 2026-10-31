import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getLocation } from "@/content/locations";
import { detectPlanLang } from "@/lib/plan-lang";

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
  if (pathname === "/plan" || pathname === "/es/plan") return planLanguage(request);

  const slug = CITY_PAGE.exec(pathname)?.[1];
  if (slug !== undefined && !isKnownCity(slug)) {
    return NextResponse.rewrite(new URL(NOT_FOUND_PATH, request.url));
  }
  return NextResponse.next();
}

/**
 * /plan intake links get pasted into Spanish and English Facebook groups. The
 * language comes from the link (?lang=es|en) or, without one, the phone's
 * language (Accept-Language); Spanish lives at /es/plan like every Spanish
 * page, so the header, footer and dock match. One edge redirect, query kept
 * (date, colors, src), `lang` dropped once it has done its job.
 */
function planLanguage(request: NextRequest) {
  const url = request.nextUrl;
  const param = url.searchParams.get("lang");
  const onSpanish = url.pathname === "/es/plan";
  // An explicit param always wins; without one, only the English URL guesses.
  const want = param === "es" || param === "en"
    ? param
    : onSpanish ? "es" : detectPlanLang(null, request.headers.get("accept-language"));
  const target = want === "es" ? "/es/plan" : "/plan";
  if (target === url.pathname && param === null) {
    const res = NextResponse.next();
    res.headers.set("Vary", "Accept-Language");
    return res;
  }
  const next = url.clone();
  next.pathname = target;
  next.searchParams.delete("lang");
  const res = NextResponse.redirect(next, 307);
  res.headers.set("Vary", "Accept-Language");
  return res;
}

function isKnownCity(slug: string): boolean {
  try {
    return getLocation(decodeURIComponent(slug)) !== undefined;
  } catch {
    return false; // malformed percent-encoding
  }
}

export const config = {
  matcher: ["/admin/:path*", "/quinceanera-photographer/:city", "/es/fotografo-de-quinceaneras/:city", "/plan", "/es/plan"],
};
