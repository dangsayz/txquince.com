/**
 * security-headers.ts — response headers for every route (next.config.ts).
 *
 * Kept free of "@/" imports and server-only code so next.config.ts can load
 * it directly, and tests can assert on exactly what ships.
 *
 * The Content-Security-Policy ships as REPORT-ONLY. Browsers log violations
 * and POST them to /api/csp-report, but block nothing. Once the reports are
 * clean, switch the header name to `Content-Security-Policy` (see
 * docs/SECURITY-LOCKDOWN.md, "CSP").
 *
 * The allowlist is built from what the site actually loads:
 *   - scripts: Next's own chunks + inline bootstrap (no nonces: most pages are
 *     static/ISR, and nonces force every page dynamic), Turnstile, and the
 *     Cloudflare Web Analytics beacon
 *   - frames: Turnstile, YouTube (nocookie + www), Vimeo
 *   - images: same origin (/api/img, /api/photos/media), YouTube posters, the
 *     R2 public media domain, the Supabase origin (legacy storage URLs)
 *   - connect: same origin APIs, Supabase auth (admin login), the analytics beacon
 *   - fonts: next/font self-hosts Google Fonts at build time, so 'self' is enough
 * Stripe Checkout is a full-page redirect (window.location), which CSP does
 * not govern, and Stripe.js is not loaded.
 *
 * Known, harmless report: zod v4 probes `Function("")` once to decide whether
 * it can JIT; it catches the failure and runs jitless. Expect one
 * "script-src blocked eval" report per page load from a /_next chunk.
 */

export type HeaderEntry = { key: string; value: string };

export type CspOptions = {
  dev?: boolean;
  /** Supabase project URL (auth from the admin login page). */
  supabaseUrl?: string;
  /** Public R2/media base URL (NEXT_PUBLIC_R2_BASE_URL). */
  mediaBaseUrl?: string;
  /** Where browsers POST violation reports. */
  reportUri?: string;
  /**
   * true when the policy is sent as the ENFORCING `Content-Security-Policy`.
   * Adds upgrade-insecure-requests, which browsers ignore (with a console
   * warning) in a Report-Only policy.
   */
  enforce?: boolean;
};

export const DEFAULT_SUPABASE_ORIGIN = "https://db.txquince.com";
export const DEFAULT_MEDIA_ORIGIN = "https://media.txquince.com";
export const CSP_REPORT_PATH = "/api/csp-report";

function origin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.origin : null;
  } catch {
    return null;
  }
}

const uniq = (list: (string | null | undefined)[]) => [...new Set(list.filter(Boolean) as string[])];

export function buildCsp(opts: CspOptions = {}): string {
  const supabase = uniq([DEFAULT_SUPABASE_ORIGIN, origin(opts.supabaseUrl)]);
  const media = uniq([DEFAULT_MEDIA_ORIGIN, origin(opts.mediaBaseUrl)]);

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(opts.dev ? ["'unsafe-eval'"] : []),
      "https://challenges.cloudflare.com",
      "https://static.cloudflareinsights.com",
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://i.ytimg.com", ...media, ...supabase],
    "font-src": ["'self'", "data:"],
    "media-src": ["'self'", "blob:", ...media],
    "connect-src": [
      "'self'",
      ...supabase,
      "https://challenges.cloudflare.com",
      "https://cloudflareinsights.com",
      ...(opts.dev ? ["ws:", "wss:"] : []),
    ],
    "frame-src": [
      "https://challenges.cloudflare.com",
      "https://www.youtube-nocookie.com",
      "https://www.youtube.com",
      "https://player.vimeo.com",
    ],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const parts = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (opts.enforce && !opts.dev) parts.push("upgrade-insecure-requests");
  parts.push(`report-uri ${opts.reportUri ?? CSP_REPORT_PATH}`);
  return parts.join("; ");
}

export function securityHeaders(opts: CspOptions = {}): HeaderEntry[] {
  return [
    // 2 years. includeSubDomains/preload are deliberately left off until every
    // *.txquince.com host is confirmed HTTPS-only (docs/SECURITY-LOCKDOWN.md).
    { key: "Strict-Transport-Security", value: "max-age=63072000" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    // Nothing on this site is meant to be framed by another site (admin included).
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Content-Security-Policy-Report-Only", value: buildCsp(opts) },
  ];
}
