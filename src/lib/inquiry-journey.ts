/**
 * inquiry-journey.ts — the pages a family looked at before they inquired.
 *
 * Every inquiry/plan carries the browser's anonymous visitor id
 * (attribution.vid, from Tracker). page_views stores the same id per view
 * (migration 0025), so the admin can replay the path: first visit, how many
 * visits, and the pages in order, up to the moment the form was sent.
 * No cookies, no fingerprinting: only views from the same browser link up.
 */
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";

export type JourneyView = { path: string; created_at: string; session_id: string | null; referrer: string | null; utm_source: string | null };

export type JourneyStep = { path: string; at: string; /** First page of a new visit (a new tab session). */ newVisit: boolean; /** Times seen in a row (collapsed). */ count: number };

export type Journey = {
  steps: JourneyStep[];
  /** Separate visits (tab sessions) before the inquiry. */
  visits: number;
  pageViews: number;
  firstSeen: string;
  /** Whole days between the first visit and the inquiry. */
  daysToInquire: number;
  /** Steps dropped from the middle to keep the list short. */
  hidden: number;
};

const MAX_STEPS = 14;
/** Views logged a moment after the form (the thank-you page) still belong to the trip. */
const GRACE_MS = 2 * 60_000;

/** Pure: page views (any order) → the journey up to `inquiredAt`, or null when there is none. */
export function buildJourney(rows: JourneyView[], inquiredAt: string): Journey | null {
  const cutoff = new Date(inquiredAt).getTime() + GRACE_MS;
  const views = rows
    .filter((r) => new Date(r.created_at).getTime() <= cutoff && !r.path.startsWith("/thank-you"))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (!views.length) return null;

  const steps: JourneyStep[] = [];
  let lastSession: string | null | undefined;
  for (const v of views) {
    const newVisit = v.session_id !== lastSession;
    lastSession = v.session_id;
    const prev = steps[steps.length - 1];
    if (prev && !newVisit && prev.path === v.path) {
      prev.count += 1;
      continue;
    }
    steps.push({ path: v.path, at: v.created_at, newVisit, count: 1 });
  }

  // Keep the start and the run-up to the inquiry; fold the middle.
  let hidden = 0;
  let shown = steps;
  if (steps.length > MAX_STEPS) {
    const head = 4;
    const tail = MAX_STEPS - head;
    hidden = steps.length - MAX_STEPS;
    shown = [...steps.slice(0, head), ...steps.slice(-tail)];
  }

  const firstSeen = views[0].created_at;
  return {
    steps: shown,
    visits: new Set(views.map((v) => v.session_id ?? "?")).size,
    pageViews: views.length,
    firstSeen,
    daysToInquire: Math.max(0, Math.floor((new Date(inquiredAt).getTime() - new Date(firstSeen).getTime()) / 86400_000)),
    hidden,
  };
}

/** The journey for one visitor id, or null (no id, no views, or migration 0025 not run). */
export async function getJourney(visitorId: string | null | undefined, inquiredAt: string): Promise<Journey | null> {
  if (!visitorId || !isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getServiceSupabase()
      .from("page_views")
      .select("path, created_at, session_id, referrer, utm_source")
      .eq("visitor_id", visitorId)
      .lte("created_at", new Date(new Date(inquiredAt).getTime() + GRACE_MS).toISOString())
      .order("created_at", { ascending: false })
      .limit(400);
    if (error || !data) return null;
    return buildJourney(data as JourneyView[], inquiredAt);
  } catch {
    return null;
  }
}
