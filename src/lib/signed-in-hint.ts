/**
 * Signed in to a TX Quince account? Clerk keeps small readable `__client_uat`
 * cookies on this domain: "0" (or missing) when signed out, a timestamp when
 * signed in. There can be two (plain and suffixed); ANY non-zero one counts.
 * A display hint only: the server checks the real session. Visitors never
 * load Clerk for this.
 */
export function signedInHint(cookie: string = typeof document === "undefined" ? "" : document.cookie): boolean {
  for (const m of cookie.matchAll(/(?:^|;\s*)__client_uat(?:_[^=;]+)?=(\d+)/g)) if (m[1] !== "0") return true;
  return false;
}

/** Fired on this page when a log in / log out finishes without a page load. */
export const AUTH_CHANGED_EVENT = "txq:auth-changed";
export function announceAuthChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
