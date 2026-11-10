/**
 * own-traffic.ts — which page views are NOT a real family, so the Studio
 * numbers count only real visitors. Pure helpers (tested in own-traffic.test.ts);
 * the stored list of the owner's networks lives in own-traffic-db.ts.
 *
 * Three kinds of traffic never count:
 *   1. Robots: search crawlers, link previews, uptime checks and our own test
 *      tools (Playwright / headless Chrome: the secret shopper, design checks).
 *   2. The owner: any browser that carries a Studio sign-in cookie.
 *   3. The owner's network: every device on a connection the owner used to
 *      open Studio from a computer (home wifi), so the household is out too.
 */

/**
 * Lowercase "bot" (Googlebot, bingbot) or a capital-B "Bot" suffix (AhrefsBot)
 * is a crawler; "CUBOT" (a phone brand) is not, so that part is case-sensitive.
 */
const BOT_WORD = /[a-z]bot\b|Bot\b/;
const AUTOMATION =
  /HeadlessChrome|Playwright|Puppeteer|PhantomJS|Selenium|Electron|Lighthouse|PageSpeed|PTST|GTmetrix|Pingdom|UptimeRobot|StatusCake|Site24x7|crawl|spider|slurp|scrap|facebookexternalhit|WhatsApp\/|Mediapartners|Google-InspectionTool|Google-Read-Aloud|bingpreview|preview|monitor|curl\/|wget\/|python|node-fetch|undici|axios|okhttp|Go-http-client|Java\/|libwww|HTTrack|ChatGPT|GPTBot|OAI-|Claude|anthropic|Perplexity|Bytespider|CCBot/i;

/** True when the User-Agent is a robot or a test tool, or there is none (browsers always send one). */
export function isAutomatedUA(ua: string | null | undefined): boolean {
  const s = ua?.trim();
  if (!s) return true;
  return BOT_WORD.test(s) || AUTOMATION.test(s);
}

/**
 * The network an IP belongs to: the address itself for IPv4, the /64 prefix
 * for IPv6 (a home connection gives every device its own IPv6 address inside
 * one /64). Null when the IP is unknown or not an address.
 */
export function networkKey(ip: string | null | undefined): string | null {
  const v = ip?.trim().toLowerCase();
  if (!v || v === "unknown") return null;
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(v);
  const v4 = mapped ? mapped[1] : v;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v4)) return v4.split(".").every((n) => Number(n) <= 255) ? `4:${v4}` : null;
  if (!/^[0-9a-f:]+$/.test(v) || !v.includes(":")) return null;
  const halves = v.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (fill < 0 || (halves.length === 1 && head.length !== 8)) return null;
  const groups = [...head, ...Array<string>(fill).fill("0"), ...tail];
  if (groups.length !== 8 || groups.some((g) => g.length < 1 || g.length > 4)) return null;
  return `6:${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}`;
}

/** Saved shape: network hash → when the owner was last seen on it (ISO). */
export type OwnerNetworks = Record<string, string>;

export const OWNER_NET_DAYS = 45;
export const OWNER_NET_MAX = 12;
const REFRESH_MS = 6 * 3_600_000;

/** Drop networks the owner has not used for OWNER_NET_DAYS; keep the newest OWNER_NET_MAX. */
export function pruneNetworks(nets: OwnerNetworks, now = Date.now()): OwnerNetworks {
  const cutoff = now - OWNER_NET_DAYS * 86_400_000;
  const live = Object.entries(nets)
    .filter(([k, at]) => /^[0-9a-f]{64}$/.test(k) && Date.parse(at) >= cutoff)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, OWNER_NET_MAX);
  return Object.fromEntries(live);
}

/** The list after the owner is seen on `hash` now, or null when nothing needs saving. */
export function touchNetwork(nets: OwnerNetworks, hash: string, now = Date.now()): OwnerNetworks | null {
  const seen = Date.parse(nets[hash] ?? "");
  if (Number.isFinite(seen) && now - seen < REFRESH_MS) return null;
  return pruneNetworks({ ...nets, [hash]: new Date(now).toISOString() }, now);
}

export function parseNetworks(value: unknown): OwnerNetworks {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: OwnerNetworks = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) if (typeof v === "string") out[k] = v;
  return out;
}
