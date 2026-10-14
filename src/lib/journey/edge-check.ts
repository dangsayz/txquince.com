/**
 * edge-check.ts — a REAL 404 for unknown private links.
 *
 * The site's root loading.tsx makes every page stream, and a streamed page
 * can't change its status: notFound() after the shell is out still answers
 * 200 (+ noindex). So the proxy (middleware) asks, before rendering, whether a
 * /my/booking/{token} or /es/mi-reserva/{token} link is live: one indexed
 * lookup by sha256(token). Unknown → rewrite to a path that doesn't exist, so
 * Next renders the normal 404 page with a 404 status.
 *
 * Runtime-neutral on purpose (fetch + WebCrypto only). The page itself still
 * re-checks everything; this only decides the status code.
 */
const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;
const PRIVATE_PATH = /^\/(?:my\/booking|es\/mi-reserva)\/([^/]+)(?:\/contract)?\/?$/;

export function privateTokenFromPath(pathname: string): string | null | undefined {
  const m = pathname.match(PRIVATE_PATH);
  if (!m) return undefined; // not a private page
  return TOKEN_RE.test(m[1]!) ? m[1]! : null; // null = malformed
}

async function sha256Hex(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** true = live link; false = 404; null = couldn't check (let the page decide). */
export async function privateLinkIsLive(token: string, now = new Date()): Promise<boolean | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const hash = await sha256Hex(token);
    const res = await fetch(
      `${url.replace(/\/+$/, "")}/rest/v1/booking_access_tokens?select=expires_at,revoked_at&token_hash=eq.${hash}&limit=1`,
      { headers: { apikey: key, authorization: `Bearer ${key}` }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as { expires_at: string; revoked_at: string | null }[];
    const row = rows[0];
    return Boolean(row && !row.revoked_at && Date.parse(row.expires_at) > now.getTime());
  } catch {
    return null;
  }
}
