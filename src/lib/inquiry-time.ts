/**
 * inquiry-time.ts — "how long has this family been waiting?" helpers for the
 * admin inquiry screens (pure; server, client and tests).
 *
 * Times show in Dallas time (America/Chicago), the studio's clock.
 */

const TZ = "America/Chicago";

/** "Just now", "12 min", "3 h", "2 days", "5 wk" since an ISO time. */
export function waitLabel(iso: string, now: Date = new Date()): string {
  const ms = Math.max(0, now.getTime() - new Date(iso).getTime());
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 21) return `${d} days`;
  return `${Math.floor(d / 7)} wk`;
}

/** Whole hours since an ISO time (for urgency). */
export function hoursSince(iso: string, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 3_600_000));
}

/** "Nov 5, 2026, 8:05 PM" in Dallas time. */
export function dallasDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: TZ });
}

/** Today's date in Dallas as YYYY-MM-DD. */
function dallasDay(now: Date): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Days from today (Dallas) until an event date (YYYY-MM-DD); negative once it has passed. */
export function daysUntil(eventDate: string, now: Date = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return null;
  const utcDay = (ymd: string) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utcDay(eventDate) - utcDay(dallasDay(now))) / 86_400_000);
}

export function countdownLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return days < 60 ? `In ${days} days` : `In ${Math.round(days / 30.4)} months`;
  return days === -1 ? "Yesterday" : `${-days} days ago`;
}

/** US phone digits with country code ("14699880601" / "(469) 988-0601" → "14699880601"), or null. */
export function phoneDigits(raw: string | null | undefined): string | null {
  const d = (raw ?? "").replace(/\D/g, "");
  if (d.length === 10) return `1${d}`;
  if (d.length === 11 && d.startsWith("1")) return d;
  return d.length >= 7 ? d : null;
}

/** "(469) 988-0601" for US numbers; anything else as given. */
export function formatPhone(raw: string | null | undefined): string {
  const d = phoneDigits(raw);
  if (d && d.length === 11 && d.startsWith("1")) return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return (raw ?? "").trim();
}
