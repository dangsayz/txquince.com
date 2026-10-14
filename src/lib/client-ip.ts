/**
 * client-ip.ts — the ONE place that decides who a request came from.
 *
 * Production runs on Cloudflare Workers, where Cloudflare's edge sets
 * `CF-Connecting-IP` itself and overwrites any value a client sends. That
 * header is the only one we trust in production.
 *
 * `X-Forwarded-For` and `X-Real-IP` are plain request headers that anyone can
 * set. They are only read outside production (local `next dev` / `next start`
 * behind a dev proxy), so a forged header can never become the IP stored on a
 * signed agreement or dodge a per-IP rate limit in production.
 */

type HasHeaders = { headers: Pick<Headers, "get"> };

/** Longest IPv6 text form is 45 chars; anything longer is not an address. */
const MAX_LEN = 45;
const IP_CHARS = /^[0-9a-fA-F:.]+$/;

function clean(value: string | null | undefined): string | null {
  const v = value?.trim();
  if (!v || v.length > MAX_LEN || !IP_CHARS.test(v)) return null;
  return v;
}

export function clientIp(req: HasHeaders): string {
  const cf = clean(req.headers.get("cf-connecting-ip"));
  if (cf) return cf;

  if (process.env.NODE_ENV !== "production") {
    const xff = clean(req.headers.get("x-forwarded-for")?.split(",")[0]);
    if (xff) return xff;
    const real = clean(req.headers.get("x-real-ip"));
    if (real) return real;
  }

  return "unknown";
}
