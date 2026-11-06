import "server-only";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { EMPTY_PULSE, summarizeDays, type DayPulse, type PulseView } from "@/lib/day-pulse";

/** Today's site numbers for the admin home. inquiryTimes = inquiries' created_at. */
export async function getDayPulse(inquiryTimes: string[]): Promise<DayPulse> {
  if (!isSupabaseConfigured()) return EMPTY_PULSE;
  try {
    const supabase = getServiceSupabase();
    const since = new Date(Date.now() - 8 * 86_400_000).toISOString();
    const [views, plans] = await Promise.all([
      (async () => {
        // visitor_id arrives with migration 0025; fall back if it isn't there.
        for (const cols of ["session_id, visitor_id, created_at", "session_id, created_at"]) {
          const res = await supabase.from("page_views").select(cols).gte("created_at", since).limit(50_000);
          if (!res.error) return (res.data ?? []) as unknown as PulseView[];
        }
        return [] as PulseView[];
      })(),
      supabase.from("quince_plans").select("created_at").gte("created_at", since),
    ]);
    const planTimes = ((plans.data ?? []) as { created_at: string }[]).map((p) => p.created_at);
    return summarizeDays(views, [...inquiryTimes.filter((t) => t >= since), ...planTimes]);
  } catch {
    return EMPTY_PULSE;
  }
}
