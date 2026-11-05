/**
 * First-touch attribution helpers. The client (Tracker.getFirstTouch) sends a
 * small JSON blob; we never trust it — keep only known string keys, length-capped,
 * for display/aggregation only. Stored on inquiries, plans and bookings.
 */
import { normalizeSrc } from "@/lib/src-tag";

const ALLOWED_KEYS = ["source", "medium", "campaign", "referrer", "landing", "ts", "srcLanding", "srcTs"];

export function sanitizeAttribution(v: unknown): Record<string, string> | null {
  if (!v || typeof v !== "object") return null;
  const out: Record<string, string> = {};
  for (const k of ALLOWED_KEYS) {
    const val = (v as Record<string, unknown>)[k];
    if (typeof val === "string" && val.trim()) out[k] = val.trim().slice(0, 200);
  }
  // The ?src= tag (latest one seen), kept only when it is one of the allowed tags.
  const src = normalizeSrc((v as Record<string, unknown>).src);
  if (src) out.src = src;
  return Object.keys(out).length ? out : null;
}
