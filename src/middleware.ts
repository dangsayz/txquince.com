import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { authorizedParties, clerkServerEnabled, clerkSettings } from "@/lib/clerk-config";
import { getLocation } from "@/content/locations";
import { detectPlanLang } from "@/lib/plan-lang";

/** /quinceanera-photographer/<city> and /es/fotografo-de-quinceaneras/<city> (page only). */
const CITY_PAGE = /^\/(?:quinceanera-photographer|es\/fotografo-de-quinceaneras)\/([^/]+)\/?$/;

/** No route matches this path, so a rewrite to it renders app/not-found.tsx with a 404. */
const NOT_FOUND_PATH = "/_txq-not-found";

/**
 * Runs on /admin/* (bounce to sign-in when there is no session cookie) and on the two city-page routes
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
/**
 * PUBLIC accounts (Clerk, TX Quince's own app): log in / sign up / log out
 * pages and the comments API. Clerk wraps only these, so server code there can
 * call auth()/currentUser(); any new route that reads a public session must be
 * added to CLERK_ROUTES and the matcher. The Studio (/admin) does NOT use
 * Clerk: it has its own email-code session (src/lib/admin-session.ts).
 */
const CLERK_ROUTES = /^\/(?:login|signup|logout|es\/entrar|es\/registro|api\/comments)(?:\/|$)/;

const withClerk = clerkMiddleware(
  () => NextResponse.next(),
  (request) => {
    const s = clerkSettings()!;
    return {
      publishableKey: s.publishableKey,
      // No `secretKey` here: passing it as an option makes Clerk require a
      // CLERK_ENCRYPTION_KEY (every request 500s without one). Clerk reads
      // CLERK_SECRET_KEY from the Worker's env on its own.
      signInUrl: s.signInUrl,
      signUpUrl: s.signUpUrl,
      authorizedParties: authorizedParties(request.nextUrl.origin),
    };
  },
);

export async function middleware(request: NextRequest, event?: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (CLERK_ROUTES.test(pathname)) {
    return clerkServerEnabled() && event ? withClerk(request, event) : NextResponse.next();
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminGate(request);
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

/**
 * /admin/*: no session cookie → the sign-in page. This is only the fast path;
 * every admin page and API re-checks the session on the server
 * (require-admin.ts), so a forged cookie gets nothing.
 */
function adminGate(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  const hasCookie = request.cookies.has("__Host-txq_admin") || request.cookies.has("txq_admin");
  if (hasCookie) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

function isKnownCity(slug: string): boolean {
  try {
    return getLocation(decodeURIComponent(slug)) !== undefined;
  } catch {
    return false; // malformed percent-encoding
  }
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/logout",
    "/es/entrar",
    "/es/registro",
    "/api/comments/:path*",
    "/admin/:path*",
    "/quinceanera-photographer/:city",
    "/es/fotografo-de-quinceaneras/:city",
    "/plan",
    "/es/plan",
  ],
};
