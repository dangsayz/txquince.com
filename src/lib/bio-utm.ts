/**
 * bio-utm.ts — attribution for the Instagram bio page (txquince.com/links).
 *
 * The bio link itself stays a clean `txquince.com/links`. Visitors there count
 * as this campaign even when Instagram's in-app browser strips the referrer
 * (Tracker.tsx reads IMPLIED_UTM), and every internal link out of /links
 * carries the same UTM so the next page view is attributed too.
 */
export const BIO_UTM = { utm_source: "instagram", utm_medium: "bio" } as const;

/** Paths that are themselves a campaign landing page. */
export const IMPLIED_UTM: Readonly<Record<string, typeof BIO_UTM>> = { "/links": BIO_UTM };

/** Add the Instagram-bio UTM to an internal path, keeping any #hash last. */
export function withBioUtm(path: string): string {
  const hashAt = path.indexOf("#");
  const base = hashAt >= 0 ? path.slice(0, hashAt) : path;
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  const queryAt = base.indexOf("?");
  const pathname = queryAt >= 0 ? base.slice(0, queryAt) : base;
  const params = new URLSearchParams(queryAt >= 0 ? base.slice(queryAt + 1) : "");
  for (const [k, v] of Object.entries(BIO_UTM)) params.set(k, v);
  return `${pathname}?${params.toString()}${hash}`;
}

/**
 * The search params analytics should record for a page view: the URL's own,
 * or — on a campaign landing page reached without any UTM — the implied ones.
 */
export function attributedSearch(pathname: string, search: URLSearchParams): URLSearchParams {
  const implied = IMPLIED_UTM[pathname];
  if (!implied || search.get("utm_source")) return search;
  const out = new URLSearchParams(search);
  for (const [k, v] of Object.entries(implied)) out.set(k, v);
  return out;
}
