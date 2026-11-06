/**
 * First-touch attribution helpers. The client (Tracker.getFirstTouch) sends a
 * small JSON blob; we never trust it — keep only known string keys, length-capped,
 * for display/aggregation only. Stored on inquiries, plans and bookings.
 *
 * Keys: source/medium/campaign/referrer/landing/ts (first visit ever),
 * src/srcLanding/srcTs (latest ?src= tag), page (the page the form was sent
 * from), vid (anonymous visitor id, links the lead to its page views) and
 * device (set by the server from the User-Agent, never by the client).
 */
import { deviceOf } from "@/lib/device";
import { normalizeSrc, sourceKey } from "@/lib/src-tag";

const ALLOWED_KEYS = ["source", "medium", "campaign", "referrer", "landing", "ts", "srcLanding", "srcTs", "page", "vid"];

export function sanitizeAttribution(v: unknown, userAgent?: string | null): Record<string, string> | null {
  const out: Record<string, string> = {};
  if (v && typeof v === "object") {
    for (const k of ALLOWED_KEYS) {
      const val = (v as Record<string, unknown>)[k];
      if (typeof val === "string" && val.trim()) out[k] = val.trim().slice(0, k === "vid" ? 64 : 200);
    }
    // The ?src= tag (latest one seen), kept only when it is one of the allowed tags.
    const src = normalizeSrc((v as Record<string, unknown>).src);
    if (src) out.src = src;
  }
  const device = deviceOf(userAgent ?? null);
  if (device) out.device = device;
  return Object.keys(out).length ? out : null;
}

const SOURCE_NAMES: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  pinterest: "Pinterest",
  quora: "Quora",
  gbp: "Google Business",
  whatsapp: "WhatsApp",
  direct: "Direct / typed in",
};

/** "instagram" → "Instagram", "google.com" → "Google", "l.instagram.com" → "Instagram". */
export function sourceName(key: string): string {
  const k = key.toLowerCase().replace(/^www\./, "");
  if (SOURCE_NAMES[k]) return SOURCE_NAMES[k];
  const known = Object.keys(SOURCE_NAMES).find((n) => n !== "direct" && (k === `${n}.com` || k.endsWith(`.${n}.com`)));
  if (known) return SOURCE_NAMES[known];
  if (/(^|\.)google\./.test(k)) return "Google";
  if (/(^|\.)bing\.com$/.test(k)) return "Bing";
  if (k === "t.co" || k === "x.com" || k === "twitter.com") return "X / Twitter";
  return key;
}

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export type AttributionSummary = {
  /** Where the family came from, as one readable name ("Instagram", "Google"). */
  source: string;
  /** The page the inquiry form was sent from ("/budget"). */
  sentFrom: string | null;
  /** The first page of the site they ever saw. */
  firstLanded: string | null;
  /** The external site that linked them in, when known. */
  referrer: string | null;
  campaign: string | null;
  device: string | null;
  /** When they first visited (ISO), from the browser's first touch. */
  firstSeen: string | null;
};

/** Everything the admin shows about where an inquiry came from, or null when nothing was recorded. */
export function summarizeAttribution(a: Record<string, string> | null | undefined): AttributionSummary | null {
  if (!a || !Object.keys(a).length) return null;
  const key = sourceKey(a);
  return {
    source: sourceName(key),
    sentFrom: a.page || null,
    firstLanded: a.landing || a.srcLanding || null,
    referrer: hostOf(a.referrer),
    campaign: a.campaign || null,
    device: a.device || null,
    firstSeen: a.ts || a.srcTs || null,
  };
}
