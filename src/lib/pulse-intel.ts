/**
 * pulse-intel.ts — turns the dashboard numbers into plain language (pure).
 *
 * For each number: WHAT it is, a READ of what it says right now, and what TO
 * DO about it. Plus the briefing: the few lines that open the panel. Every
 * sentence is computed from the live stats; nothing is canned praise.
 */
import type { RangedStats } from "@/lib/analytics-db";

export type Tone = "good" | "warn" | "info";
export type Intel = { title: string; what: string; read: string; todo: string[]; tone: Tone };
export type PulseStats = Pick<
  RangedStats,
  | "range" | "uniqueSessions" | "uniqueVisitors" | "rangeViews" | "rangeLeads" | "rangeBooked" | "previous"
  | "bounceRate" | "pagesPerSession" | "flow" | "flowBottleneck" | "topReferrers" | "topPages" | "utmSources"
  | "liveNow" | "bookedValue" | "pipelineValue" | "requests" | "pendingHolds" | "paid"
>;

const pct = (now: number, before: number) => (before ? Math.round(((now - before) / before) * 100) : null);
const n = (v: number) => v.toLocaleString("en-US");
const usd = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`;
function change(now: number, before: number, unit: string) {
  const p = pct(now, before);
  if (p === null) return now ? `${n(now)} ${unit}, and nothing to compare with in the period before.` : `No ${unit} yet.`;
  if (p === 0) return `${n(now)} ${unit}, flat against the period before.`;
  return `${n(now)} ${unit}, ${p > 0 ? "up" : "down"} ${Math.abs(p)}% from ${n(before)} the period before.`;
}

export function metricIntel(s: PulseStats): Record<"visits" | "unique" | "views" | "leads" | "bounce" | "booked" | "pipeline" | "live", Intel> {
  const visitsUp = (pct(s.uniqueSessions, s.previous.visitors) ?? 0) > 0;
  const topRef = s.topReferrers[0];
  const repeat = s.uniqueVisitors ? Math.round((s.uniqueSessions / s.uniqueVisitors) * 10) / 10 : 0;
  const leadRate = s.uniqueVisitors ? Math.round((s.rangeLeads / s.uniqueVisitors) * 1000) / 10 : 0;

  return {
    visits: {
      title: "Visits",
      what: "Every time someone opens the site in a browser tab. One mom opening your link three times is three visits. Your own browsing on this computer isn't counted.",
      read: change(s.uniqueSessions, s.previous.visitors, "visits") + (topRef ? ` Most arrive from ${topRef.label}.` : ""),
      todo: visitsUp
        ? ["Traffic is rising: post in the same groups again this week while it's working.", "Tag every link you share with ?ref= (e.g. ?ref=fb-group-irving) to see exactly which post did it."]
        : ["Share the /plan link in 2 or 3 Facebook group threads where moms are asking for vendors.", "Post one Reel with a link in bio tagged ?ref=ig-bio."],
      tone: visitsUp ? "good" : "info",
    },
    unique: {
      title: "Unique visitors",
      what: "Different people (browsers), counted once each however many times they come back. Visits counts every return; this counts the person. Visits from before the upgrade count each tab, so this number gets more exact from now on.",
      read: s.uniqueVisitors
        ? `${n(s.uniqueVisitors)} people made ${n(s.uniqueSessions)} visits, about ${repeat} each. ${repeat >= 1.5 ? "Families are coming back to look again: they're deciding." : "Most look once and leave."}`
        : "No visitors in this period yet.",
      todo: repeat >= 1.5
        ? ["Returning visitors are close to deciding. Make the next step easy: 'Get my free plan' near the top.", "Reply fast to anything that comes in; they're comparing you right now."]
        : ["Give people a reason to come back: the price guide, the plan page, a new gallery each week.", "Ask every lead where they found you and add it as a ?ref= tag."],
      tone: repeat >= 1.5 ? "good" : "info",
    },
    views: {
      title: "Page views",
      what: "Every page opened, across all visits. More page views per visit means people are exploring, not bouncing.",
      read: `${change(s.rangeViews, s.previous.views, "page views")} About ${s.pagesPerSession} pages per visit.`,
      todo: s.pagesPerSession < 2
        ? ["Most visits see one page. Link from the homepage straight to real galleries and the price guide.", "Add 'See her full gallery' links under the favorites."]
        : ["People explore. Make sure every page ends with one clear next step (plan, date check, text)."],
      tone: s.pagesPerSession < 2 ? "warn" : "good",
    },
    leads: {
      title: "Leads",
      what: "New inquiries plus new quince plans in this period: people who gave you a way to reach them.",
      read: s.rangeLeads
        ? `${change(s.rangeLeads, s.previous.leads, "leads")} That's ${leadRate}% of unique visitors.`
        : `No leads in the last ${s.range} days from ${n(s.uniqueVisitors)} visitors.`,
      todo: s.rangeLeads
        ? ["Reply to each lead within the hour; speed wins quince bookings.", "Mark each one Replied / Booked / Lost in Plans so the funnel stays honest."]
        : ["Visitors aren't reaching out. Put the 'Get my free plan' button above the fold on the homepage and in every blog post.", "Reply in Facebook threads with the /plan link instead of 'DM me'."],
      tone: s.rangeLeads ? "good" : "warn",
    },
    bounce: {
      title: "Bounce rate",
      what: "Share of visits that saw only one page and left.",
      read: `${s.bounceRate}% of visits leave after one page.`,
      todo: s.bounceRate > 60
        ? ["Lead with real photos and the price in the first screen; that's what moms came for.", "Check the page load on a phone over cellular."]
        : ["Healthy. Keep the first screen focused on work and the next step."],
      tone: s.bounceRate > 60 ? "warn" : "good",
    },
    booked: {
      title: "Booked value",
      what: "Total value of every paid booking, from the price each family booked at.",
      read: `${usd(s.bookedValue)} booked across ${s.paid} paid ${s.paid === 1 ? "celebration" : "celebrations"}${s.rangeBooked ? `, ${s.rangeBooked} in the last ${s.range} days` : ""}.`,
      todo: ["Ask every booked family for a short review and a photo you can share; it's your best ad."],
      tone: s.rangeBooked ? "good" : "info",
    },
    pipeline: {
      title: "In the pipeline",
      what: "Value of date requests and holds that haven't paid yet.",
      read: s.pipelineValue ? `${usd(s.pipelineValue)} waiting: ${s.requests} requests and ${s.pendingHolds} holds.` : "Nothing waiting on payment.",
      todo: s.pipelineValue ? ["Send the deposit link today; holds expire and families move on."] : ["Fill it: every plan lead is a hold waiting to happen."],
      tone: s.pipelineValue ? "warn" : "info",
    },
    live: {
      title: "On the site now",
      what: "People active in the last 5 minutes.",
      read: s.liveNow.length ? `${s.liveNow.length} on the site right now${s.liveNow[0] ? `, one on ${s.liveNow[0].path === "/" ? "the homepage" : s.liveNow[0].path}` : ""}.` : "Nobody on the site this minute.",
      todo: ["If you just posted a link, this shows it landing in real time."],
      tone: s.liveNow.length ? "good" : "info",
    },
  };
}

const STEP_INTEL: { what: string; todo: string[] }[] = [
  { what: "Visits in this period: the top of the funnel.", todo: ["Grow it with tagged links in Facebook groups and Instagram."] },
  { what: "Visits that opened real work or prices: a gallery, the portfolio, the plan or price guide, a blog post or venue page.", todo: ["Put galleries and prices one tap from the homepage.", "Link the favorites to full galleries."] },
  { what: "Clicks that show intent: checking a date, starting a form, tapping Reserve.", todo: ["Put 'Check your date' and 'Get my free plan' right next to the photos and prices."] },
  { what: "People who gave you a way to reach them: inquiries and quince plans.", todo: ["Shorter forms convert better: the plan form asks only six things.", "Say clearly that it's free and there's nothing to pay."] },
  { what: "Deposits paid in this period.", todo: ["Reply within the hour, send the plan or deposit link the same day, follow up on day 2 and day 5."] },
];

export function stepIntel(s: PulseStats, i: number): Intel {
  const step = s.flow[i];
  const prev = i ? s.flow[i - 1] : null;
  const rate = prev && prev.value ? Math.round((step.value / prev.value) * 100) : null;
  const isB = s.flowBottleneck?.step === i;
  return {
    title: step.label,
    what: STEP_INTEL[i]?.what ?? "",
    read: prev
      ? `${n(step.value)} of ${n(prev.value)} made it from "${prev.label}" (${rate ?? 0}%).${isB ? ` That's the weakest step: a healthy rate is about ${s.flowBottleneck!.baseline}%.` : ""}`
      : `${n(step.value)} visits started the funnel.`,
    todo: isB && s.flowBottleneck ? [s.flowBottleneck.action, ...(STEP_INTEL[i]?.todo ?? [])] : STEP_INTEL[i]?.todo ?? [],
    tone: isB ? "warn" : "info",
  };
}

/** The opening briefing: 2–4 short lines, most important first. */
export function briefing(s: PulseStats): string[] {
  const lines: string[] = [];
  const v = pct(s.uniqueSessions, s.previous.visitors);
  lines.push(
    v === null
      ? `${n(s.uniqueSessions)} visits from ${n(s.uniqueVisitors)} people in the last ${s.range} days.`
      : `Traffic ${v >= 0 ? "up" : "down"} ${Math.abs(v)}%: ${n(s.uniqueSessions)} visits from ${n(s.uniqueVisitors)} people in ${s.range} days.`,
  );
  if (s.flowBottleneck) {
    const b = s.flowBottleneck;
    lines.push(`Bottleneck: ${s.flow[b.step - 1].label.toLowerCase()} → ${s.flow[b.step].label.toLowerCase()} at ${b.rate}% (healthy ≈ ${b.baseline}%).`);
  }
  lines.push(s.rangeLeads ? `${n(s.rangeLeads)} new ${s.rangeLeads === 1 ? "lead" : "leads"}. Reply within the hour.` : "No new leads yet. Priority: turn visits into plans.");
  if (s.pipelineValue) lines.push(`${usd(s.pipelineValue)} is waiting on a deposit.`);
  else if (s.topReferrers[0]) lines.push(`Top source: ${s.topReferrers[0].label}.`);
  return lines.slice(0, 4);
}
