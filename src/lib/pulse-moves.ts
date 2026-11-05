/**
 * pulse-moves.ts — the "next moves" the dashboard suggested and the owner
 * chose to try. Each one lives in conversion_changes (area "pulse:<metric>")
 * with the metric's value at the start as its baseline; here every active
 * move is re-measured over the days since it started and judged.
 */
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getDashboardStats, type RangedStats } from "@/lib/analytics-db";
import { judgeMove, metricValue, MOVE_METRICS, type MoveVerdict } from "@/lib/pulse-intel";

export type PulseMove = {
  id: string;
  title: string;
  metric: string;
  metricLabel: string;
  startedAt: string;
  days: number;
  status: "active" | "reviewed" | "archived";
  before: number | null;
  now: number | null;
  verdict: MoveVerdict | null;
  notes: string | null;
};

type Row = {
  id: string;
  created_at: string;
  title: string;
  area: string | null;
  target_metric: string | null;
  baseline: { metric?: { key: string; value: number } } | null;
  status: string;
  notes: string | null;
};

export async function getPulseMoves(): Promise<PulseMove[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getServiceSupabase()
    .from("conversion_changes")
    .select("id, created_at, title, area, target_metric, baseline, status, notes")
    .like("area", "pulse:%")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error || !data) return [];
  const rows = data as Row[];

  // One stats read per distinct "days since start" among active moves.
  const cache = new Map<number, Promise<RangedStats>>();
  const statsFor = (days: number) => {
    const d = Math.min(Math.max(days, 1), 90);
    if (!cache.has(d)) cache.set(d, getDashboardStats(d));
    return cache.get(d)!;
  };

  return Promise.all(
    rows.map(async (r) => {
      const metric = r.target_metric ?? r.area?.slice(6) ?? "visits";
      const days = Math.max(1, Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400_000));
      const before = r.baseline?.metric?.value ?? null;
      let now: number | null = null;
      let verdict: MoveVerdict | null = null;
      if (r.status === "active" && before !== null) {
        const m = metricValue(await statsFor(days), metric);
        if (m) {
          now = m.value;
          verdict = judgeMove(metric, before, m.value, m.base, days);
        }
      }
      return {
        id: r.id,
        title: r.title,
        metric,
        metricLabel: MOVE_METRICS[metric]?.label ?? metric,
        startedAt: r.created_at,
        days,
        status: (["active", "reviewed", "archived"].includes(r.status) ? r.status : "active") as PulseMove["status"],
        before,
        now,
        verdict,
        notes: r.notes,
      };
    }),
  );
}
