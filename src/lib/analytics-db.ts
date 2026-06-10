import "server-only";
import { getServiceSupabase, isSupabaseConfigured } from "@/lib/supabase-server";
import { getBookings, getInquiries } from "@/lib/clients-db";
import { releasedTestimonials } from "@/content/testimonials";
import { collectionById } from "@/content/packages";
import type { ConversionChange } from "@/components/admin/ChangeLog";

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
  bySource: { source: string; leads: number; requests: number; bookedValue: number }[];
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
  utm_source: string | null;
  utm_medium: string | null;
  created_at: string;
};
type LE = { event_type: string };

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

  if (!isSupabaseConfigured()) return empty(false);

  try {
    const supabase = getServiceSupabase();
    const now = Date.now();
    const startToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const start7 = new Date(now - 7 * 86400_000).toISOString();
    const startRange = new Date(now - range * 86400_000).toISOString();

    const week = new Date(now - 7 * 86400_000).toISOString();
    const [pvRes, leRes, bookings, inquiries, imgWeekRes, vidRes, lastChangeRes] =
      await Promise.all([
        supabase
          .from("page_views")
          .select("path, referrer, session_id, utm_source, utm_medium, created_at")
          .gte("created_at", startRange)
          .order("created_at", { ascending: true }),
        supabase.from("lead_events").select("event_type").gte("created_at", startRange),
        getBookings(),
        getInquiries(),
        // Flywheel inputs: fresh proof + iteration cadence.
        supabase
          .from("portfolio_images")
          .select("id", { count: "exact", head: true })
          .gte("created_at", week),
        supabase.from("videos").select("id", { count: "exact", head: true }),
        supabase
          .from("conversion_changes")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

    const rows = (pvRes.data ?? []) as PV[];
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
    const valueOf = (collection: string | null) =>
      collection ? (collectionById(collection)?.price ?? 0) : 0;
    const bookedValue = bookings
      .filter((b) => b.status === "paid")
      .reduce((s, b) => s + valueOf(b.collection), 0);
    const pipelineValue = bookings
      .filter((b) => b.status === "requested" || b.status === "pending_payment")
      .reduce((s, b) => s + valueOf(b.collection), 0);

    // DB constraint allows new | won | lost | unsubscribed — only "new" is open.
    const openLeads = inquiries.filter(
      (i) => i.status === "new" && !i.unsubscribed_at,
    ).length;
    const totalInquiries = inquiries.length;
    const totalBookings = bookings.filter((b) => b.status === "requested" || b.status === "paid" || b.status === "pending_payment").length;
    const inquiryToBooked = totalInquiries ? Math.round((paid / totalInquiries) * 100) : 0;

    const funnel = [
      { label: "Visitors", value: uniqueSessions },
      { label: "Leads", value: totalInquiries },
      { label: "Date requests", value: totalBookings },
      { label: "Paid", value: paid },
    ];

    // ---- revenue & leads by first-touch source ----
    const srcKey = (a: Record<string, string> | null) =>
      (a?.source || "direct").toLowerCase();
    const sourceMap = new Map<string, { source: string; leads: number; requests: number; bookedValue: number }>();
    const bump = (key: string) => {
      const row = sourceMap.get(key) ?? { source: key, leads: 0, requests: 0, bookedValue: 0 };
      sourceMap.set(key, row);
      return row;
    };
    for (const i of inquiries) bump(srcKey(i.attribution)).leads += 1;
    for (const bk of bookings) {
      if (bk.status === "requested" || bk.status === "pending_payment" || bk.status === "paid") {
        const row = bump(srcKey(bk.attribution));
        row.requests += 1;
        if (bk.status === "paid") row.bookedValue += valueOf(bk.collection);
      }
    }
    const bySource = Array.from(sourceMap.values())
      .sort((a, b) => b.bookedValue - a.bookedValue || b.leads - a.leads || b.requests - a.requests)
      .slice(0, 10);

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
    const moneyPageSessions = Array.from(journeys.values()).filter((steps) =>
      steps.some((s) => /^\/(investment|portfolio|reserve|photos)/.test(s.path)),
    ).length;
    const intentTotal = ctaClicks + formStarts + dateChecks;
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

    return {
      configured: true,
      range,
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
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
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
