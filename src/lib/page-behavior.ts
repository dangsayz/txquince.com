/**
 * page-behavior.ts — "What visitors do" on each page (pure; /admin home).
 *
 * Inputs are the first-party tracker's rows (components/Tracker.tsx):
 *   page_views  one per page view: path, session_id, created_at
 *   lead_events "engaged": target "t=<active seconds>;d=<deepest scroll %>"
 *               "click":   target = the tapped link or button's own words
 * Out comes one row per page: visits, typical time on page (median), how far
 * people scroll, how many visits END there (the last page of a session), and
 * the most-tapped things. The "leak" is the busiest page that loses the most.
 */
export type ViewRow = { path: string; session_id: string | null; created_at: string };
export type EventRow = { event_type: string; path: string | null; target: string | null };

export type PageBehavior = {
  path: string;
  label: string;
  visits: number;
  /** Visits we have time/scroll for (sent on leaving the page). */
  measured: number;
  /** Median active seconds on the page; null until measured. */
  medianSeconds: number | null;
  /** Average deepest scroll, 0–100; null until measured. */
  avgDepth: number | null;
  /** Share of measured visits that scrolled to 90% or more. */
  readToEnd: number | null;
  /** Share of visits that were the last page of the session (0–1). */
  exitRate: number;
  topClicks: { label: string; count: number }[];
};

export type BehaviorSummary = {
  pages: PageBehavior[];
  /** The busiest page (at least MIN_VISITS) that loses the biggest share. */
  leak: PageBehavior | null;
  measuredTotal: number;
};

/** Pages where leaving is the goal (a thank-you is a finish, not a leak). */
const FINISH = /^\/(es\/)?(thank-you|gracias|reserve\/success|unsubscribed)/;
const MIN_VISITS = 10;

const LABELS: Record<string, string> = { "/": "Home", "/es": "Home (Spanish)", "/budget": "Budget", "/es/presupuesto": "Budget (Spanish)", "/check-your-date": "Check your date", "/es/consulta": "Check your date (Spanish)" };
export const pageLabel = (path: string) => LABELS[path] ?? path;

export function parseEngaged(target: string | null): { seconds: number; depth: number } | null {
  if (!target) return null;
  const t = /(?:^|;)t=(\d+)/.exec(target);
  const d = /(?:^|;)d=(\d+)/.exec(target);
  if (!t || !d) return null;
  return { seconds: Math.min(Number(t[1]), 1800), depth: Math.min(Number(d[1]), 100) };
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

export function summarizeBehavior(views: ViewRow[], events: EventRow[], limit = 10): BehaviorSummary {
  const visits = new Map<string, number>();
  const exits = new Map<string, number>();
  const lastBySession = new Map<string, ViewRow>();
  for (const v of views) {
    visits.set(v.path, (visits.get(v.path) ?? 0) + 1);
    if (!v.session_id) continue;
    const prev = lastBySession.get(v.session_id);
    if (!prev || prev.created_at <= v.created_at) lastBySession.set(v.session_id, v);
  }
  for (const v of lastBySession.values()) exits.set(v.path, (exits.get(v.path) ?? 0) + 1);

  const eng = new Map<string, { s: number[]; d: number[] }>();
  const clicks = new Map<string, Map<string, number>>();
  let measuredTotal = 0;
  for (const e of events) {
    if (!e.path) continue;
    if (e.event_type === "engaged") {
      const p = parseEngaged(e.target);
      if (!p) continue;
      const g = eng.get(e.path) ?? { s: [], d: [] };
      g.s.push(p.seconds);
      g.d.push(p.depth);
      eng.set(e.path, g);
      measuredTotal += 1;
    } else if (e.event_type === "click" && e.target) {
      const m = clicks.get(e.path) ?? new Map<string, number>();
      m.set(e.target, (m.get(e.target) ?? 0) + 1);
      clicks.set(e.path, m);
    }
  }

  const pages: PageBehavior[] = [...visits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, n]) => {
      const g = eng.get(path);
      const measured = g?.s.length ?? 0;
      return {
        path,
        label: pageLabel(path),
        visits: n,
        measured,
        medianSeconds: g ? median(g.s) : null,
        avgDepth: g ? Math.round(g.d.reduce((a, b) => a + b, 0) / g.d.length) : null,
        readToEnd: g ? g.d.filter((d) => d >= 90).length / g.d.length : null,
        exitRate: Math.min(1, (exits.get(path) ?? 0) / n),
        topClicks: [...(clicks.get(path) ?? new Map<string, number>()).entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([label, count]) => ({ label, count })),
      };
    });

  const leak =
    pages
      .filter((p) => p.visits >= MIN_VISITS && !FINISH.test(p.path))
      .sort((a, b) => b.exitRate * b.visits - a.exitRate * a.visits)[0] ?? null;

  return { pages, leak, measuredTotal };
}

/** "45s", "2m 05s". */
export function fmtSeconds(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

/* ---------------- The leak: what to fix first ---------------- */

export type FixStep = { title: string; why: string };

const NAV_TAP = /^(menu|menú|open menu|close)$/i;

/**
 * Plain next steps for the page that loses the most visits, worked out from
 * its own numbers (no fixed list): how fast people decide, how far they
 * scroll, what they tap and how many leave. Most urgent first, at most four.
 */
export function fixSteps(p: PageBehavior): FixStep[] {
  const steps: FixStep[] = [];
  const leave = Math.round(p.exitRate * 100);
  const taps = p.topClicks.filter((c) => !NAV_TAP.test(c.label.trim()));
  const menu = p.topClicks[0] && NAV_TAP.test(p.topClicks[0].label.trim()) ? p.topClicks[0] : null;

  if (p.medianSeconds !== null && p.medianSeconds < 10) {
    steps.push({
      title: "Say what you do in the first screen",
      why: `People decide in about ${fmtSeconds(p.medianSeconds)}. The first screen needs one line that says what you offer and where, and one clear button.`,
    });
  }
  if (p.avgDepth !== null && p.avgDepth < 35) {
    steps.push({
      title: "Move your best proof to the top",
      why: `Most visits stop ${p.avgDepth}% of the way down, so ${100 - p.avgDepth}% of the page is rarely seen. Put your strongest photo, a review and the price starting point where everyone sees them.`,
    });
  }
  if (menu) {
    steps.push({
      title: "Put the menu's top links on the page",
      why: taps.length
        ? `The most-tapped thing is the menu (${menu.count} taps): people are looking for something. Show buttons for what they tap next: ${taps.slice(0, 2).map((c) => `“${c.label}”`).join(" and ")}.`
        : `The most-tapped thing is the menu (${menu.count} taps): people are looking for something. Show your two main pages as buttons in the first screen.`,
    });
  } else if (taps[0]) {
    steps.push({
      title: `Make “${taps[0].label}” easy to reach`,
      why: `It is the most-tapped thing here (${taps[0].count} taps). Put it in the first screen so people do not have to look for it.`,
    });
  }
  if (leave >= 60) {
    steps.push({
      title: "Give one clear next step",
      why: `${leave}% of visits end on this page. End each section with the same single action, so there is always an obvious place to go next.`,
    });
  }
  if (p.measured < 10) {
    steps.push({
      title: "Wait for more data before big changes",
      why: `Time and scroll are measured for ${p.measured} ${p.measured === 1 ? "visit" : "visits"} so far. Make the small fixes first and check again in a few days.`,
    });
  }
  return steps.slice(0, 4);
}
