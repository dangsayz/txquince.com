/**
 * Day pulse: the admin home's "today on your site" numbers, counted in Texas
 * time (America/Chicago), so "today" starts at local midnight, not UTC.
 * summarizeDays is pure (tested in day-pulse.test.ts); getDayPulse reads the
 * last 8 days of page views and quince plans from the database.
 */

const TZ = "America/Chicago";
const DAY_MS = 86_400_000;
const LIVE_MS = 5 * 60_000;

const dallasDay = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
export const texasDay = (t: number | string | Date) => dallasDay.format(new Date(t));

export type PulseView = { session_id: string | null; visitor_id?: string | null; created_at: string };

export type DayPulse = {
  configured: boolean;
  /** Distinct people (browser, else session) who opened any page today. */
  visitorsToday: number;
  /** The same count for yesterday, up to this same time of day. */
  visitorsYesterdaySoFar: number;
  viewsToday: number;
  /** New families today: inquiries + free quince plans. */
  newFamiliesToday: number;
  /** Sessions with a page view in the last 5 minutes. */
  liveNow: number;
  /** The last 7 Texas days, oldest first; the last entry is today. */
  week: { date: string; visitors: number; families: number }[];
};

export const EMPTY_PULSE: DayPulse = {
  configured: false,
  visitorsToday: 0,
  visitorsYesterdaySoFar: 0,
  viewsToday: 0,
  newFamiliesToday: 0,
  liveNow: 0,
  week: [],
};

export function summarizeDays(views: PulseView[], leadTimes: string[], now = Date.now()): DayPulse {
  // Texas-day keys for the last 7 days, by calendar math on today's key, so a
  // DST change (23- or 25-hour day) never skips or repeats a day.
  const anchor = Date.parse(`${texasDay(now)}T12:00:00Z`);
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) days.push(new Date(anchor - i * DAY_MS).toISOString().slice(0, 10));
  const today = days[6];
  const yesterday = days[5];
  const people = new Map(days.map((d) => [d, new Set<string>()]));
  const families = new Map(days.map((d) => [d, 0]));
  const yesterdaySoFar = new Set<string>();
  const liveSessions = new Set<string>();
  let viewsToday = 0;

  for (const v of views) {
    const t = new Date(v.created_at).getTime();
    if (!Number.isFinite(t) || t > now) continue;
    const who = v.visitor_id ? `v:${v.visitor_id}` : `s:${v.session_id ?? "anon"}`;
    const day = texasDay(t);
    people.get(day)?.add(who);
    if (day === today) viewsToday += 1;
    if (day === yesterday && t + DAY_MS <= now) yesterdaySoFar.add(who);
    if (now - t <= LIVE_MS) liveSessions.add(v.session_id ?? who);
  }
  for (const at of leadTimes) {
    const t = new Date(at).getTime();
    if (!Number.isFinite(t) || t > now) continue;
    const day = texasDay(t);
    if (families.has(day)) families.set(day, (families.get(day) ?? 0) + 1);
  }

  return {
    configured: true,
    visitorsToday: people.get(today)!.size,
    visitorsYesterdaySoFar: yesterdaySoFar.size,
    viewsToday,
    newFamiliesToday: families.get(today) ?? 0,
    liveNow: liveSessions.size,
    week: days.map((date) => ({ date, visitors: people.get(date)!.size, families: families.get(date) ?? 0 })),
  };
}
