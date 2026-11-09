/**
 * blog-pulse.ts — "Your blog" on the admin home (pure).
 *
 * Same tracker rows as page-behavior.ts, kept to blog posts only:
 *   reads         page views of /blog/<slug> and /es/blog/<slug>
 *   readers       different visits (sessions) that opened a post
 *   medianSeconds typical active time on a post
 *   readToEnd     share of measured reads that scrolled to 90% or more
 *   comments      what readers wrote (blog_comments), per post
 */
import { parseEngaged, type EventRow, type ViewRow } from "@/lib/page-behavior";

/** Comments on one post. `recent` = written inside the window. */
export type PostComments = { path: string; total: number; pending: number; recent: number };

export type PostPulse = {
  path: string;
  title: string;
  spanish: boolean;
  reads: number;
  /** Median active seconds; null until at least one read is measured. */
  medianSeconds: number | null;
  /** 0–1; null until measured. */
  readToEnd: number | null;
  /** Comments on this post, all time (hidden ones left out). */
  comments: number;
};

export type BlogPulse = {
  reads: number;
  readers: number;
  medianSeconds: number | null;
  readToEnd: number | null;
  /** Comments written in the window. */
  newComments: number;
  /** Comments waiting for approval (any age). */
  pendingComments: number;
  /** Busiest posts first. */
  posts: PostPulse[];
};

const POST = /^\/(es\/)?blog\/[^/]+$/;
/** "/blog/x/?a=1#c" → "/blog/x"; null when it is not a post. */
export function postPath(path: string | null): string | null {
  if (!path) return null;
  const clean = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return POST.test(clean) ? clean : null;
}

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}
const share = (depths: number[]) => (depths.length ? depths.filter((d) => d >= 90).length / depths.length : null);

export function summarizeBlog(
  views: ViewRow[],
  events: EventRow[],
  titles: Map<string, string>,
  comments: PostComments[] = [],
  limit = 5,
): BlogPulse {
  const reads = new Map<string, number>();
  const sessions = new Set<string>();
  for (const v of views) {
    const p = postPath(v.path);
    if (!p) continue;
    reads.set(p, (reads.get(p) ?? 0) + 1);
    if (v.session_id) sessions.add(v.session_id);
  }

  const eng = new Map<string, { s: number[]; d: number[] }>();
  const allS: number[] = [];
  const allD: number[] = [];
  for (const e of events) {
    if (e.event_type !== "engaged") continue;
    const p = postPath(e.path);
    const parsed = parseEngaged(e.target);
    if (!p || !parsed) continue;
    const g = eng.get(p) ?? { s: [], d: [] };
    g.s.push(parsed.seconds);
    g.d.push(parsed.depth);
    eng.set(p, g);
    allS.push(parsed.seconds);
    allD.push(parsed.depth);
  }

  const byPath = new Map(comments.map((c) => [c.path, c]));
  const paths = new Set([...reads.keys(), ...comments.filter((c) => c.total > 0).map((c) => c.path)]);
  const posts: PostPulse[] = [...paths]
    .map((path) => {
      const g = eng.get(path);
      return {
        path,
        title: titles.get(path) ?? path.replace(/^\/(es\/)?blog\//, "").replace(/-/g, " "),
        spanish: path.startsWith("/es/"),
        reads: reads.get(path) ?? 0,
        medianSeconds: g ? median(g.s) : null,
        readToEnd: g ? share(g.d) : null,
        comments: byPath.get(path)?.total ?? 0,
      };
    })
    .sort((a, b) => b.reads - a.reads || b.comments - a.comments || a.title.localeCompare(b.title))
    .slice(0, limit);

  return {
    reads: [...reads.values()].reduce((a, b) => a + b, 0),
    readers: sessions.size,
    medianSeconds: median(allS),
    readToEnd: share(allD),
    newComments: comments.reduce((a, c) => a + c.recent, 0),
    pendingComments: comments.reduce((a, c) => a + c.pending, 0),
    posts,
  };
}

/** Whole calendar days between two instants in Central time: 0 = today. */
export function daysAgo(iso: string, now = new Date(), timeZone = "America/Chicago"): number {
  const day = (d: Date) => Date.parse(`${new Intl.DateTimeFormat("en-CA", { timeZone }).format(d)}T12:00:00Z`);
  return Math.max(0, Math.round((day(now) - day(new Date(iso))) / 86_400_000));
}
export const agoLabel = (n: number) => (n === 0 ? "Today" : n === 1 ? "Yesterday" : `${n} days ago`);
