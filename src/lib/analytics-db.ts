import "server-only";
import { cache } from "react";
import { getDb, isDbConfigured } from "@/lib/db";
import { platformOf, PLATFORMS, type Platform } from "@/lib/social";
import { getBookings, getInquiries } from "@/lib/clients-db";
import { releasedTestimonials } from "@/content/testimonials";
import { collectionById } from "@/content/packages";
import { sourceKey, visitSourceKey, WHATSAPP_SOURCE } from "@/lib/src-tag";
import { summarizeBehavior, type BehaviorSummary, type EventRow, type ViewRow } from "@/lib/page-behavior";

export type ConversionChange = {
  id: string;
  created_at: string;
  title: string;
  area: string | null;
  reason: string | null;
  target_metric: string | null;
  baseline: Record<string, number> | null;
  status: string;
  notes: string | null;
};

export type RangedStats = {
  configured: boolean;
  range: number;
  // traffic
  today: number;
  last7: number;
  rangeViews: number;
  uniqueSessions: number;
  pagesPerSession: number;
  bounceRate: number;
  daily: { date: string; count: number }[];
  /** Per day in the range: page views, distinct visitors, new leads (inquiries + plans). */
  series: { date: string; views: number; visitors: number; unique: number; leads: number }[];
  /** Distinct browsers in the range (visitor_id; older rows fall back to their session). */
  uniqueVisitors: number;
  /** The same totals for the period just before this one, for "vs previous" deltas. */
  previous: { views: number; visitors: number; unique: number; leads: number; booked: number };
  /** New leads (inquiries + quince plans) and paid bookings inside the range. */
  rangeLeads: number;
  rangeBooked: number;
  /** One consistent window: visitors → saw work/prices → took action → lead → booked. */
  flow: { label: string; value: number }[];
  /** The step whose drop-off is worst vs. a healthy baseline (null = not enough data yet). */
  flowBottleneck: { step: number; rate: number; baseline: number; action: string } | null;
  /** Visits and new leads in the range that each social platform brought (first touch). */
  byPlatform: Record<Platform, { visits: number; leads: number }>;
  /** Why visits don't reach the work: where they landed / came from, and how many of each went on. */
  dropoff: {
    lost: number;
    onePage: number;
    landings: { label: string; sessions: number; reached: number }[];
    sources: { label: string; sessions: number; reached: number }[];
    /** Per device (phone / tablet / desktop); empty until migration 0026 has data. */
    devices: { label: string; sessions: number; reached: number; onePage: number }[];
  };
  topPages: { label: string; count: number }[];
  topReferrers: { label: string; count: number }[];
  utmSources: { label: string; count: number }[];
  formStarts: number;
  ctaClicks: number;
  shares: number;
  dateChecks: number;
  // bookings / money
  requests: number;
  paid: number;
  paymentReview: number;
  paymentReviewValue: number;
  pendingHolds: number;
  openLeads: number;
  totalInquiries: number;
  bookedValue: number;
  pipelineValue: number;
  inquiryToBooked: number;
  funnel: { label: string; value: number }[];
  /** Per source: visits (sessions), WhatsApp chats started (button taps, own "whatsapp" row), leads, date requests, booked $. */
  bySource: { source: string; visits: number; chats: number; leads: number; requests: number; bookedValue: number }[];
  insights: { type: "success" | "warning" | "info"; text: string }[];
  /** Sessions active in the last 5 minutes — who's on the site right now. */
  liveNow: { path: string; seconds: number; pages: number }[];
  /** Per-page behavior: where families spend time and where they leave. */
  engagement: { path: string; views: number; avgSeconds: number; exitRate: number }[];
  /** The weakest funnel edge vs. healthy baseline — the thing to fix next. */
  bottleneck: { edge: string; rate: number; baseline: number; action: string } | null;
  /** Weekly flywheel — computed to-dos from live data (events → proof → rank). */
  flywheel: { label: string; done: boolean; detail: string }[];
};

type PV = {
  path: string;
  referrer: string | null;
  session_id: string | null;
  visitor_id?: string | null;
  device?: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  created_at: string;
};
type LE = { event_type: string; session_id?: string | null; target?: string | null };

function hostOf(ref: string | null): string | null {
  if (!ref) return null;
  try {
    return new URL(ref).hostname.replace(/^www\./, "");
  } catch {
    return ref;
  }
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function rank(map: Map<string, number>, limit = 8) {
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getDashboardStats(range = 14): Promise<RangedStats> {
  const empty = (configured: boolean): RangedStats => ({
    configured,
    range,
    today: 0,
    last7: 0,
    rangeViews: 0,
    uniqueSessions: 0,
    pagesPerSession: 0,
    bounceRate: 0,
    daily: [],
    series: [],
    previous: { views: 0, visitors: 0, unique: 0, leads: 0, booked: 0 },
    uniqueVisitors: 0,
    rangeLeads: 0,
    rangeBooked: 0,
    flow: [],
    flowBottleneck: null,
    byPlatform: Object.fromEntries(PLATFORMS.map((p) => [p, { visits: 0, leads: 0 }])) as RangedStats["byPlatform"],
    dropoff: { lost: 0, onePage: 0, landings: [], sources: [], devices: [] },
    topPages: [],
    topReferrers: [],
    utmSources: [],
    formStarts: 0,
    ctaClicks: 0,
    shares: 0,
    dateChecks: 0,
    requests: 0,
    paid: 0,
    paymentReview: 0,
    paymentReviewValue: 0,
    pendingHolds: 0,
    openLeads: 0,
    totalInquiries: 0,
    bookedValue: 0,
    pipelineValue: 0,
    inquiryToBooked: 0,
    funnel: [],
    bySource: [],
    insights: [],
    liveNow: [],
    engagement: [],
    bottleneck: null,
    flywheel: [],
  });

  if (!isDbConfigured()) return empty(false);

  try {
    const db = getDb();
    const now = Date.now();
    const startToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const start7 = new Date(now - 7 * 86400_000).toISOString();
    const startRange = new Date(now - range * 86400_000).toISOString();
    const startPrev = new Date(now - 2 * range * 86400_000).toISOString();

    const week = new Date(now - 7 * 86400_000).toISOString();
    const [pvRes, leRes, bookings, inquiries, imgWeekRes, vidRes, lastChangeRes, plansRes] =
      await Promise.all([
        // visitor_id (0025) and device (0026) arrive with migrations; until
        // they run, fall back to the columns that exist.
        (async () => {
          const q = (cols: string) =>
            db.from("page_views").select(cols).gte("created_at", startPrev).order("created_at", { ascending: true });
          const base = "path, referrer, session_id, utm_source, utm_medium, created_at";
          for (const cols of [`${base}, visitor_id, device`, `${base}, visitor_id`, base]) {
            const res = await q(cols);
            if (!res.error) return res;
          }
          return { data: [] as unknown[], error: null };
        })(),
        db.from("lead_events").select("event_type, session_id, target").gte("created_at", startRange),
        getBookings(),
        getInquiries(),
        // Flywheel inputs: fresh proof + iteration cadence.
        db
          .from("portfolio_images")
          .select("id", { count: "exact", head: true })
          .gte("created_at", week),
        db.from("videos").select("id", { count: "exact", head: true }),
        db
          .from("conversion_changes")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Quince plans count as leads (table from migration 0023; absent → none).
        db.from("quince_plans").select("created_at, attribution").gte("created_at", startPrev),
      ]);

    const allRows = (pvRes.data ?? []) as PV[];
    const rows = allRows.filter((r) => r.created_at >= startRange);
    const prevRows = allRows.filter((r) => r.created_at < startRange);
    const events = (leRes.data ?? []) as LE[];

    // ---- traffic ----
    const today = rows.filter((r) => r.created_at >= startToday).length;
    const last7 = rows.filter((r) => r.created_at >= start7).length;
    const rangeViews = rows.length;

    const sessionPages = new Map<string, Set<string>>();
    const pageMap = new Map<string, number>();
    const refMap = new Map<string, number>();
    const utmMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();
    for (let i = range - 1; i >= 0; i--) {
      dailyMap.set(new Date(now - i * 86400_000).toISOString().slice(0, 10), 0);
    }

    for (const r of rows) {
      pageMap.set(r.path, (pageMap.get(r.path) ?? 0) + 1);
      const k = dayKey(r.created_at);
      if (dailyMap.has(k)) dailyMap.set(k, (dailyMap.get(k) ?? 0) + 1);
      const host = hostOf(r.referrer);
      if (host) refMap.set(host, (refMap.get(host) ?? 0) + 1);
      if (r.utm_source) {
        const label = r.utm_medium ? `${r.utm_source} / ${r.utm_medium}` : r.utm_source;
        utmMap.set(label, (utmMap.get(label) ?? 0) + 1);
      }
      const sid = r.session_id ?? "anon";
      if (!sessionPages.has(sid)) sessionPages.set(sid, new Set());
      sessionPages.get(sid)!.add(r.path);
    }

    const uniqueSessions = sessionPages.size;
    const totalSessionPages = Array.from(sessionPages.values()).reduce((s, p) => s + p.size, 0);
    const pagesPerSession = uniqueSessions ? Math.round((totalSessionPages / uniqueSessions) * 10) / 10 : 0;
    const bounceSessions = Array.from(sessionPages.values()).filter((p) => p.size === 1).length;
    const bounceRate = uniqueSessions ? Math.round((bounceSessions / uniqueSessions) * 100) : 0;

    const formStarts = events.filter((e) => e.event_type === "form_started").length;
    const ctaClicks = events.filter((e) => e.event_type === "cta_clicked").length;
    const shares = events.filter((e) => e.event_type === "share").length;
    // Homepage date-checker usage — the checked→held gap is the sharpest funnel signal.
    const dateChecks = events.filter((e) => e.event_type === "date_checked").length;

    // ---- bookings / money ----
    const requests = bookings.filter((b) => b.status === "requested").length;
    const paid = bookings.filter((b) => b.status === "paid").length;
    const pendingHolds = bookings.filter((b) => b.status === "pending_payment").length;
    // Money collected but NOT auto-confirmed (lost the date race or amount mismatch)
    // — needs the operator to verify or refund. Value = deposit actually charged.
    const reviewBookings = bookings.filter((b) => b.status === "payment_review");
    const paymentReview = reviewBookings.length;
    const paymentReviewValue =
      reviewBookings.reduce((s, b) => s + (b.deposit_amount_cents ?? 0), 0) / 100;
    // A booking's value: the total stored on it when it was made (today's
    // packages keep it in metadata.total_usd); older rows fall back to the
    // retired collection's list price.
    const valueOf = (b: (typeof bookings)[number]) => {
      const total = Number(b.metadata?.total_usd);
      if (Number.isFinite(total) && total > 0) return total;
      return b.collection ? (collectionById(b.collection)?.price ?? 0) : 0;
    };
    const bookedValue = bookings
      .filter((b) => b.status === "paid")
      .reduce((s, b) => s + valueOf(b), 0);
    const pipelineValue = bookings
      .filter((b) => b.status === "requested" || b.status === "pending_payment")
      .reduce((s, b) => s + valueOf(b), 0);

    // DB constraint allows new | won | lost | unsubscribed — only "new" is open.
    const openLeads = inquiries.filter(
      (i) => i.status === "new" && !i.unsubscribed_at,
    ).length;
    const totalInquiries = inquiries.length;
    const totalBookings = bookings.filter((b) => b.status === "requested" || b.status === "paid" || b.status === "pending_payment").length;
    const inquiryToBooked = totalInquiries ? Math.round((paid / totalInquiries) * 100) : 0;

    const funnel = [
      { label: "Visits", value: uniqueSessions },
      { label: "Leads", value: totalInquiries },
      { label: "Date requests", value: totalBookings },
      { label: "Paid", value: paid },
    ];

    // ---- revenue & leads by first-touch source ----
    // The ?src= tag when there is one (instagram, pinterest…), else the first-touch source.
    const srcKey = sourceKey;
    const sourceMap = new Map<string, RangedStats["bySource"][number]>();
    const bump = (key: string) => {
      const row = sourceMap.get(key) ?? { source: key, visits: 0, chats: 0, leads: 0, requests: 0, bookedValue: 0 };
      sourceMap.set(key, row);
      return row;
    };
    // Visits: each session counted once, by its first page (?src=gbp → "gbp").
    {
      const seen = new Set<string>();
      for (const r of rows) {
        const sid = r.session_id ?? `anon-${r.created_at}`;
        if (seen.has(sid)) continue;
        seen.add(sid);
        bump(visitSourceKey(r.utm_source, hostOf(r.referrer))).visits += 1;
      }
    }
    // WhatsApp button taps are their own source: a chat started off-site.
    bump(WHATSAPP_SOURCE).chats += events.filter((e) => e.event_type === "contact_whatsapp").length;
    for (const i of inquiries) bump(srcKey(i.attribution)).leads += 1;
    for (const bk of bookings) {
      if (bk.status === "requested" || bk.status === "pending_payment" || bk.status === "paid") {
        const row = bump(srcKey(bk.attribution));
        row.requests += 1;
        if (bk.status === "paid") row.bookedValue += valueOf(bk);
      }
    }
    const bySource = Array.from(sourceMap.values())
      .filter((r) => r.visits || r.chats || r.leads || r.requests)
      .sort((a, b) => b.bookedValue - a.bookedValue || b.leads - a.leads || b.chats - a.chats || b.requests - a.requests || b.visits - a.visits)
      .slice(0, 12);

    // ---- session journeys: dwell per page, exits, live-now ----
    // Dwell for page N = gap to page N+1 in the same session (capped at 10 min;
    // a session's final page has unknown dwell and counts as its exit).
    const journeys = new Map<string, { path: string; t: number }[]>();
    for (const r of rows) {
      const sid = r.session_id ?? "anon";
      if (!journeys.has(sid)) journeys.set(sid, []);
      journeys.get(sid)!.push({ path: r.path, t: new Date(r.created_at).getTime() });
    }

    const pageStats = new Map<string, { views: number; dwell: number; samples: number; exits: number }>();
    const stat = (p: string) => {
      const s = pageStats.get(p) ?? { views: 0, dwell: 0, samples: 0, exits: 0 };
      pageStats.set(p, s);
      return s;
    };
    const liveNow: RangedStats["liveNow"] = [];
    const liveCutoff = now - 5 * 60_000;

    for (const steps of journeys.values()) {
      for (let i = 0; i < steps.length; i++) {
        const s = stat(steps[i].path);
        s.views += 1;
        if (i < steps.length - 1) {
          const gap = (steps[i + 1].t - steps[i].t) / 1000;
          if (gap > 0 && gap <= 600) {
            s.dwell += gap;
            s.samples += 1;
          }
        } else {
          s.exits += 1;
        }
      }
      const last = steps[steps.length - 1];
      if (last.t >= liveCutoff) {
        liveNow.push({
          path: last.path,
          seconds: Math.round((last.t - steps[0].t) / 1000),
          pages: steps.length,
        });
      }
    }
    liveNow.sort((a, b) => b.seconds - a.seconds);

    const engagement: RangedStats["engagement"] = Array.from(pageStats.entries())
      .map(([path, s]) => ({
        path,
        views: s.views,
        avgSeconds: s.samples ? Math.round(s.dwell / s.samples) : 0,
        exitRate: s.views ? Math.round((s.exits / s.views) * 100) : 0,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // ---- bottleneck finder: weakest funnel edge vs. healthy baseline ----
    // Only judge an edge once its denominator is meaningful (≥20).
    // "Saw work or prices": opened a gallery / price / plan page or a blog or
    // venue article, or scrolled the homepage's own galleries into view
    // (work_viewed events, sent by the Tracker).
    const WORK_PAGE = /^\/(es\/)?(investment|portfolio|reserve|photos|fotos-recientes|plan|budget|presupuesto|quince-prices-dfw|precios-quince-dfw|saved|check-your-date|consulta|quinceanera-photo|sesion-de-fotos|quinceanera-videographer|videografo|fotografo|quinceanera-photographer)/;
    const workViewSids = new Set(events.filter((e) => e.event_type === "work_viewed" && e.session_id).map((e) => e.session_id!));
    const reachedWork = (sid: string, steps: { path: string }[]) =>
      workViewSids.has(sid) || steps.some((st) => WORK_PAGE.test(st.path) || /^\/(es\/)?(blog|venues|salones)\//.test(st.path));
    const moneyPageSessions = Array.from(journeys.entries()).filter(([sid, steps]) => reachedWork(sid, steps)).length;
    const INTENT = new Set(["cta_clicked", "form_started", "date_checked"]);
    const intentEvents = events.filter((e) => INTENT.has(e.event_type));
    // People, not clicks: one session tapping three buttons is one "took action".
    const intentTotal = new Set(intentEvents.map((e, i) => e.session_id ?? `anon-${i}`)).size;
    const totalRequests = bookings.filter((b) =>
      ["requested", "pending_payment", "paid"].includes(b.status),
    ).length;
    const edges: { edge: string; num: number; den: number; baseline: number; action: string }[] = [
      { edge: "Visitors → viewing your work/pricing", num: moneyPageSessions, den: uniqueSessions, baseline: 0.35, action: "The homepage isn't pulling people deeper — strengthen the work section + CTAs above the fold." },
      { edge: "Browsers → intent (date checks, CTA, form starts)", num: intentTotal, den: moneyPageSessions, baseline: 0.25, action: "They look but don't act — sharpen pricing clarity, availability urgency, and proof next to the ask." },
      { edge: "Intent → an actual lead or date request", num: totalInquiries + totalRequests, den: intentTotal, baseline: 0.3, action: "They start but don't finish — shorten the form, reassure on payment, check mobile friction." },
      { edge: "Date requests → paid deposits", num: paid, den: totalRequests, baseline: 0.5, action: "Requests stall before money — send deposit links faster and tighten the follow-up sequence." },
    ];
    let bottleneck: RangedStats["bottleneck"] = null;
    let worst = 1;
    for (const e of edges) {
      if (e.den < 20) continue;
      const rate = e.num / e.den;
      const vsBaseline = rate / e.baseline;
      if (vsBaseline < worst) {
        worst = vsBaseline;
        bottleneck = { edge: e.edge, rate: Math.round(rate * 100), baseline: Math.round(e.baseline * 100), action: e.action };
      }
    }

    // ---- weekly flywheel: events → proof → content → rank → premium clients ----
    const photosThisWeek = imgWeekRes.count ?? 0;
    const filmCount = vidRes.count ?? 0;
    const quotes = releasedTestimonials().length;
    const lastChangeAt = (lastChangeRes.data as { created_at?: string } | null)?.created_at;
    const lastChangeDays = lastChangeAt
      ? Math.floor((now - new Date(lastChangeAt).getTime()) / 86400_000)
      : Infinity;
    const igTagged = Array.from(utmMap.keys()).some((k) => k.toLowerCase().includes("instagram"));
    const flywheel: RangedStats["flywheel"] = [
      {
        label: "Upload this weekend's gallery",
        done: photosThisWeek > 0,
        detail: photosThisWeek > 0 ? `${photosThisWeek} new photo${photosThisWeek === 1 ? "" : "s"} this week` : "No new photos in 7 days — fresh proof is the flywheel's fuel",
      },
      {
        label: "Publish one real film",
        done: filmCount > 0,
        detail: filmCount > 0 ? `${filmCount} film${filmCount === 1 ? "" : "s"} live` : "Zero films live — the film section hides until one exists",
      },
      {
        label: "Collect a mom quote (text is enough)",
        done: quotes > 0,
        detail: quotes > 0 ? `${quotes} released quote${quotes === 1 ? "" : "s"}` : "Zero testimonials — your strongest missing trust block",
      },
      {
        label: "Drive tagged Instagram traffic",
        done: igTagged,
        detail: igTagged ? "Instagram-tagged visits detected" : "No instagram-tagged visits — update the bio link + post",
      },
      {
        label: "Log an improvement + baseline",
        done: lastChangeDays <= 14,
        detail: Number.isFinite(lastChangeDays) ? `Last entry ${lastChangeDays}d ago` : "No change-log entries yet",
      },
    ];

    // ---- insights ----
    const insights: RangedStats["insights"] = [];
    if (rangeViews === 0) {
      insights.push({
        type: "info",
        text: "No traffic captured yet. Once visitors arrive, live numbers appear here automatically.",
      });
    } else {
      if (bounceRate > 70)
        insights.push({ type: "warning", text: `${bounceRate}% bounce rate is high — add internal links and proof near the top of landing pages.` });
      else if (bounceRate && bounceRate < 50)
        insights.push({ type: "success", text: `${bounceRate}% bounce rate — visitors are exploring more than one page.` });
      if (pagesPerSession >= 2.5)
        insights.push({ type: "success", text: `${pagesPerSession} pages/session — families are comparing your work before reaching out.` });
      const topRef = rank(refMap, 1)[0];
      if (topRef) insights.push({ type: "info", text: `${topRef.label} is your top referrer this window (${topRef.count} views).` });
      if (utmMap.size === 0 && rangeViews > 10)
        insights.push({ type: "info", text: "No UTM-tagged links detected — tag your Instagram bio + directory links to see what converts." });
    }
    if (dateChecks >= 5 && requests === 0)
      insights.push({ type: "warning", text: `${dateChecks} date checks but no holds this window — families verify the date, then stall. The friction is after the check: review pricing clarity and trust on /reserve.` });
    if (paymentReview > 0)
      insights.push({ type: "warning", text: `${paymentReview} payment${paymentReview === 1 ? "" : "s"} need review — money was collected but the date wasn't auto-confirmed. Verify or refund.` });
    if (requests > 0)
      insights.push({ type: "warning", text: `${requests} date request${requests === 1 ? "" : "s"} awaiting your confirmation + deposit link.` });
    if (pipelineValue > 0)
      insights.push({ type: "info", text: `$${pipelineValue.toLocaleString()} in pipeline value is held but not yet paid.` });

    // ---- per-day series + previous period ----
    const plans = ((plansRes as { data?: { created_at: string }[] | null })?.data ?? []) as { created_at: string }[];
    const leadTimes = [...inquiries.map((i) => i.created_at), ...plans.map((p) => p.created_at)];
    const who = (r: PV) => (r.visitor_id ? `v:${r.visitor_id}` : `s:${r.session_id ?? "anon"}`);
    const seriesMap = new Map<string, { views: number; sids: Set<string>; vids: Set<string>; leads: number }>();
    for (const d of dailyMap.keys()) seriesMap.set(d, { views: 0, sids: new Set(), vids: new Set(), leads: 0 });
    for (const r of rows) {
      const day = seriesMap.get(dayKey(r.created_at));
      if (!day) continue;
      day.views += 1;
      day.sids.add(r.session_id ?? "anon");
      day.vids.add(who(r));
    }
    for (const t of leadTimes) {
      if (t < startRange) continue;
      const day = seriesMap.get(dayKey(t));
      if (day) day.leads += 1;
    }
    const series = Array.from(seriesMap.entries()).map(([date, v]) => ({ date, views: v.views, visitors: v.sids.size, unique: v.vids.size, leads: v.leads }));
    const uniqueVisitors = new Set(rows.map(who)).size;
    const rangeLeads = leadTimes.filter((t) => t >= startRange).length;
    const paidAt = (b: (typeof bookings)[number]) => (b as { paid_at?: string | null }).paid_at ?? null;
    const rangeBooked = bookings.filter((b) => b.status === "paid" && (paidAt(b) ?? "") >= startRange).length;
    const previous = {
      views: prevRows.length,
      visitors: new Set(prevRows.map((r) => r.session_id ?? "anon")).size,
      unique: new Set(prevRows.map(who)).size,
      leads: leadTimes.filter((t) => t >= startPrev && t < startRange).length,
      booked: bookings.filter((b) => b.status === "paid" && (paidAt(b) ?? "") >= startPrev && (paidAt(b) ?? "") < startRange).length,
    };

    // ---- drop-off: where visits that never reached the work came in ----
    const firstRow = new Map<string, PV>();
    for (const r of rows) {
      const sid = r.session_id ?? "anon";
      if (!firstRow.has(sid)) firstRow.set(sid, r);
    }
    const landAgg = new Map<string, { sessions: number; reached: number }>();
    const srcAgg = new Map<string, { sessions: number; reached: number }>();
    const devAgg = new Map<string, { sessions: number; reached: number; onePage: number }>();
    let lost = 0;
    let onePage = 0;
    for (const [sid, steps] of journeys) {
      const first = firstRow.get(sid);
      if (!first) continue;
      const ok = reachedWork(sid, steps);
      const single = new Set(steps.map((x) => x.path)).size === 1;
      if (!ok) {
        lost += 1;
        if (single) onePage += 1;
      }
      if (first.device) {
        const label = first.device === "phone" ? "Phone" : first.device === "tablet" ? "Tablet" : "Desktop";
        const d = devAgg.get(label) ?? { sessions: 0, reached: 0, onePage: 0 };
        d.sessions += 1;
        if (ok) d.reached += 1;
        if (single) d.onePage += 1;
        devAgg.set(label, d);
      }
      const land = first.path === "/" ? "Homepage" : first.path === "/es" ? "Spanish homepage" : first.path;
      const src = first.utm_source || hostOf(first.referrer) || "Direct / app";
      for (const [m, k] of [[landAgg, land], [srcAgg, src]] as const) {
        const row = m.get(k) ?? { sessions: 0, reached: 0 };
        row.sessions += 1;
        if (ok) row.reached += 1;
        m.set(k, row);
      }
    }
    const topAgg = (m: Map<string, { sessions: number; reached: number }>) =>
      Array.from(m.entries()).map(([label, v]) => ({ label, ...v })).sort((a, b) => b.sessions - a.sessions).slice(0, 5);
    const devices = Array.from(devAgg.entries()).map(([label, v]) => ({ label, ...v })).sort((a, b) => b.sessions - a.sessions);
    // ---- per social platform: visits (session's first page) and leads (first touch) ----
    const byPlatform = Object.fromEntries(PLATFORMS.map((p) => [p, { visits: 0, leads: 0 }])) as RangedStats["byPlatform"];
    for (const first of firstRow.values()) {
      const p = platformOf(first.utm_source) ?? platformOf(hostOf(first.referrer));
      if (p) byPlatform[p].visits += 1;
    }
    const leadAttr = [
      ...inquiries.filter((i) => i.created_at >= startRange).map((i) => i.attribution),
      ...((plansRes as { data?: { created_at: string; attribution?: Record<string, string> | null }[] | null })?.data ?? [])
        .filter((pl) => pl.created_at >= startRange)
        .map((pl) => pl.attribution ?? null),
    ];
    for (const a of leadAttr) {
      const p = platformOf(a?.source) ?? platformOf(a?.referrer);
      if (p) byPlatform[p].leads += 1;
    }
    const dropoff = { lost, onePage, landings: topAgg(landAgg), sources: topAgg(srcAgg), devices };

    // ---- the flow: one window, five steps ----
    const flow = [
      { label: "Visits", value: uniqueSessions },
      { label: "Saw work or prices", value: moneyPageSessions },
      { label: "Took action", value: intentTotal },
      { label: "Leads", value: rangeLeads },
      { label: "Booked", value: rangeBooked },
    ];
    // Healthy step-to-step rates; the worst ratio vs. healthy is the bottleneck.
    const FLOW_RULES = [
      { baseline: 0.35, action: "Most visitors leave without opening your work or prices. Put real galleries and the package prices higher on the homepage and landing pages." },
      { baseline: 0.25, action: "They look but don't act. Make the next step obvious next to the work: check your date, get a plan, text us." },
      { baseline: 0.3, action: "They start but don't finish. Shorten the form, say there's nothing to pay, and test it on a phone." },
      { baseline: 0.5, action: "Leads stall before paying. Reply within the hour, send the plan or deposit link the same day, and follow up on day 2 and day 5." },
    ];
    let flowBottleneck: RangedStats["flowBottleneck"] = null;
    let worstRatio = 1;
    for (let i = 1; i < flow.length; i++) {
      const den = flow[i - 1].value;
      if (den < 10) continue;
      const rate = flow[i].value / den;
      const ratio = rate / FLOW_RULES[i - 1].baseline;
      if (ratio < worstRatio) {
        worstRatio = ratio;
        flowBottleneck = { step: i, rate: Math.round(rate * 100), baseline: Math.round(FLOW_RULES[i - 1].baseline * 100), action: FLOW_RULES[i - 1].action };
      }
    }

    return {
      configured: true,
      range,
      series,
      uniqueVisitors,
      previous,
      rangeLeads,
      rangeBooked,
      flow,
      flowBottleneck,
      dropoff,
      byPlatform,
      today,
      last7,
      rangeViews,
      uniqueSessions,
      pagesPerSession,
      bounceRate,
      daily: Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })),
      topPages: rank(
        new Map(Array.from(pageMap.entries()).map(([p, c]) => [p === "/" ? "Homepage" : p, c])),
      ),
      topReferrers: rank(refMap),
      utmSources: rank(utmMap),
      formStarts,
      ctaClicks,
      shares,
      dateChecks,
      requests,
      paid,
      paymentReview,
      paymentReviewValue,
      pendingHolds,
      openLeads,
      totalInquiries,
      bookedValue,
      pipelineValue,
      inquiryToBooked,
      funnel,
      bySource,
      insights,
      liveNow: liveNow.slice(0, 12),
      engagement,
      bottleneck,
      flywheel,
    };
  } catch {
    return empty(true);
  }
}

/** Recent change-log entries (non-archived first), for the dashboard panel. */
export async function getConversionChanges(): Promise<ConversionChange[]> {
  if (!isDbConfigured()) return [];
  try {
    const db = getDb();
    const { data, error } = await db
      .from("conversion_changes")
      .select("id, created_at, title, area, reason, target_metric, baseline, status, notes")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error || !data) return [];
    return data as ConversionChange[];
  } catch {
    return [];
  }
}

/* ---------------- What visitors do (admin home) ---------------- */

/** The tracker rows behind the admin home, read once per request. */
export const loadBehaviorRows = cache(async (days: number): Promise<{ views: ViewRow[]; events: EventRow[] }> => {
  const db = getDb();
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const PAGE = 1000;
  const MAX = 30_000;
  async function all<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
    const out: T[] = [];
    for (let from = 0; from < MAX; from += PAGE) {
      const { data, error } = await build(from, from + PAGE - 1);
      if (error || !data) break;
      out.push(...data);
      if (data.length < PAGE) break;
    }
    return out;
  }
  const [views, events] = await Promise.all([
    all<ViewRow>((a, b) => db.from("page_views").select("path, session_id, created_at").gte("created_at", since).order("created_at", { ascending: true }).range(a, b)),
    all<EventRow>((a, b) =>
      db.from("lead_events").select("event_type, path, target").in("event_type", ["engaged", "click"]).gte("created_at", since).order("created_at", { ascending: true }).range(a, b),
    ),
  ]);
  return { views, events };
});

/**
 * Page-by-page behavior for the last `days` days: visits, time on page,
 * scroll depth, where visits end and the most-tapped things
 * (see src/lib/page-behavior.ts). Reads in pages of 1,000 rows (the API's cap).
 */
export async function getPageBehavior(days = 14): Promise<BehaviorSummary & { configured: boolean; days: number }> {
  const none = { pages: [], leak: null, measuredTotal: 0, days };
  if (!isDbConfigured()) return { ...none, configured: false };
  try {
    const { views, events } = await loadBehaviorRows(days);
    return { ...summarizeBehavior(views, events), configured: true, days };
  } catch {
    return { ...none, configured: true };
  }
}
