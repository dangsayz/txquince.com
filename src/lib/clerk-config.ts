/**
 * clerk-config.ts — how TX Quince talks to Clerk.
 *
 * TX Quince does not own a Clerk application. It is a SATELLITE of the
 * Quince Network application (primary domain quincenetwork.com), so one
 * account works on both sites. Sign-in and sign-up happen on Quince Network;
 * txquince.com reads the shared session through clerk.txquince.com.
 *
 * Everything here is public (publishable key, domains, URLs) except
 * CLERK_SECRET_KEY, which is a Worker secret (`wrangler secret put`).
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
  isSatellite: boolean;
  /** The satellite's own domain (txquince.com). Required because the key is shared. */
  domain?: string;
  signInUrl: string;
  signUpUrl: string;
};

const env = (name: string) => (process.env[name] ?? "").trim();

/** Quince Network hosts the sign-in and sign-up pages for both sites. */
export const PRIMARY_SIGN_IN_URL = "https://www.quincenetwork.com/sign-in";
export const PRIMARY_SIGN_UP_URL = "https://www.quincenetwork.com/sign-up";

export function clerkSettings(): ClerkSettings | null {
  const publishableKey = env("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  if (!publishableKey) return null;
  const isSatellite = env("NEXT_PUBLIC_CLERK_IS_SATELLITE") === "true";
  return {
    publishableKey,
    isSatellite,
    domain: isSatellite ? env("NEXT_PUBLIC_CLERK_DOMAIN") || "txquince.com" : undefined,
    signInUrl: env("NEXT_PUBLIC_CLERK_SIGN_IN_URL") || PRIMARY_SIGN_IN_URL,
    signUpUrl: env("NEXT_PUBLIC_CLERK_SIGN_UP_URL") || PRIMARY_SIGN_UP_URL,
  };
}

/** Server side is usable only with both keys (the secret verifies sessions). */
export function clerkServerEnabled(): boolean {
  return clerkSettings() !== null && env("CLERK_SECRET_KEY") !== "";
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
