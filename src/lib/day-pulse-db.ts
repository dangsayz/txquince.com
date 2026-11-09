import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { EMPTY_PULSE, summarizeDays, type DayPulse, type PulseView } from "@/lib/day-pulse";

/** Today's site numbers for the admin home. inquiryTimes = inquiries' created_at. */
export async function getDayPulse(inquiryTimes: string[]): Promise<DayPulse> {
  if (!isDbConfigured()) return EMPTY_PULSE;
  try {
    const db = getDb();
    const since = new Date(Date.now() - 8 * 86_400_000).toISOString();
    const [views, plans] = await Promise.all([
      (async () => {
        // visitor_id arrives with migration 0025; fall back if it isn't there.
        for (const cols of ["session_id, visitor_id, created_at", "session_id, created_at"]) {
          const res = await db.from("page_views").select(cols).gte("created_at", since).limit(50_000);
          if (!res.error) return (res.data ?? []) as unknown as PulseView[];
        }
        return [] as PulseView[];
      })(),
      db.from("quince_plans").select("created_at").gte("created_at", since),
    ]);
    const planTimes = ((plans.data ?? []) as { created_at: string }[]).map((p) => p.created_at);
    return summarizeDays(views, [...inquiryTimes.filter((t) => t >= since), ...planTimes]);
  } catch {
    return EMPTY_PULSE;
  }
}
