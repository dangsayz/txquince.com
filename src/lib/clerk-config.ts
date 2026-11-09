/**
 * clerk-config.ts — how TX Quince talks to Clerk.
 *
 * TX Quince has its own Clerk application ("TX Quince",
 * app_3LsbmZ7P1ci9zz1YTrNcZQVwpSb; production on txquince.com, Frontend API
 * clerk.txquince.com). Log in and sign up happen on this site (/login,
 * /signup and the Spanish /es/entrar, /es/registro). Accounts are separate
 * from Quince Network for now; sharing them later means Clerk Pro + a
 * satellite domain (see docs/clerk.md).
 *
 * Everything here is public except CLERK_SECRET_KEY, a Worker secret.
 * Kept free of "server-only" so the middleware (edge) and server components
 * can both import it.
 *
 * With no publishable key, Clerk is OFF: no provider renders, the middleware
 * skips Clerk, and every admin check answers "not signed in". That keeps
 * `next dev` and CI working without keys, and Clerk's keyless dev mode (which
 * would create a throwaway Clerk app) never starts.
 */

export type ClerkSettings = {
  publishableKey: string;
  signInUrl: string;
  signUpUrl: string;
};

const env = (name: string) => (process.env[name] ?? "").trim();

export function clerkSettings(): ClerkSettings | null {
  const publishableKey = env("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  if (!publishableKey) return null;
  return {
    publishableKey,
    signInUrl: env("NEXT_PUBLIC_CLERK_SIGN_IN_URL") || "/login",
    signUpUrl: env("NEXT_PUBLIC_CLERK_SIGN_UP_URL") || "/signup",
  };
}

/** Server side is usable only with both keys (the secret verifies sessions). */
export function clerkServerEnabled(): boolean {
  return clerkSettings() !== null && env("CLERK_SECRET_KEY") !== "";
}

/** Origins a session token may come from (blocks tokens minted elsewhere). */
export function authorizedParties(requestOrigin: string): string[] {
  const list = ["https://txquince.com", "https://www.txquince.com"];
  const site = env("NEXT_PUBLIC_SITE_URL");
  if (site) list.push(site.replace(/\/$/, ""));
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) list.push(requestOrigin);
  return [...new Set(list)];
}

/**
 * Where a sign-in may send someone back to: a path on this site only. A raw
 * "?next=" would let a crafted link bounce a fresh session to another site.
 */
export function safeNext(asked: string | null | undefined, fallback = "/"): string {
  const v = (asked ?? "").trim();
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback;
  return v;
}
