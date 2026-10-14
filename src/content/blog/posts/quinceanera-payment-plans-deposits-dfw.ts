import type { BlogPost } from "@/content/blog";
import {
  TIER_PRICE_USD,
  RETAINER,
  CONSULT_HOLD_DAYS,
  quoteCommission,
  usd,
} from "@/lib/commission";

const retainerPct = `${Math.round(RETAINER.rate * 100)}%`;
const retainerFloor = usd(RETAINER.floorUsd);
const due = RETAINER.balanceDueDays;
const hold = CONSULT_HOLD_DAYS;
const retainerFor = (tier: keyof typeof TIER_PRICE_USD) =>
  usd(quoteCommission(tier, []).retainerUsd);

const post: BlogPost = {
  slug: "quinceanera-payment-plans-deposits-dfw",
  title:
    "Quinceañera Photography Deposits, Retainers & Payment Plans in DFW (How to Book Without Paying All at Once)",
  description:
    "How booking a quinceañera photographer in Dallas–Fort Worth really works — deposits vs. retainers, when the balance is due, what to ask about refunds, and how to hold a date while you decide.",
  category: "Cost & Budget",
  excerpt:
    "A retainer holds your date; the balance comes due shortly before the celebration. This is how deposits and retainers work across DFW — and how to hold a date while you decide.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 7,
  lead: "The price of a quinceañera photographer can look like a wall when you see it all in one number. It isn't. Almost no family pays the full amount the day they book — you put down a deposit or retainer to hold the date, and the balance comes due closer to the celebration. We lay out exactly how that works across Dallas–Fort Worth and at TX Quince, in plain terms, so you can book with confidence. (Hablamos español — si te sientes más cómoda en español, dilo y te explicamos todo paso a paso.)",
  content: [
    { type: "h2", text: "Do you have to pay everything up front? No." },
    {
      type: "p",
      text: `Short answer: no. At TX Quince you reserve your date with a retainer of ${retainerPct} of your commission, and the balance is due ${due} days before the quinceañera. That's it — two payments, both known from the day you book, so nothing about the cost surprises you later.`,
    },
    {
      type: "callout",
      text: "The retainer is not an extra fee. It is applied in full to your commission total, so it simply becomes your first payment toward the same published price.",
    },
    { type: "h2", text: "How much is the deposit or retainer to book?" },
    {
      type: "p",
      text: `Across Dallas–Fort Worth, studios handle this differently: some ask for a flat deposit of a few hundred dollars, others ask for a percentage of the total — often around a third. At [TX Quince](/#commissions), the retainer is ${retainerPct} of your commission, with a ${retainerFloor} minimum:`,
    },
    {
      type: "ul",
      items: [
        `I. Portrait Study (${usd(TIER_PRICE_USD.study)}) — ${retainerFor("study")} retainer to reserve your date.`,
        `II. Cinema & Stills (${usd(TIER_PRICE_USD.cinema)}) — ${retainerFor("cinema")} retainer to reserve your date.`,
        `III. The Full Production (${usd(TIER_PRICE_USD.production)}) — ${retainerFor("production")} retainer to reserve your date.`,
        `IV. Multi-Day Editorial Archive (${usd(TIER_PRICE_USD.archive)}) — ${retainerFor("archive")} retainer to reserve your date.`,
      ],
    },
    {
      type: "p",
      text: "Adding an enhancement raises the total, and the retainer follows at the same percentage. Want the full breakdown of what each commission includes before you decide? See the [commissions](/#commissions), or read our [full cost guide for DFW](/blog/quinceanera-photographer-cost-dallas-fort-worth).",
    },
    { type: "h2", text: "How the retainer and balance work" },
    {
      type: "p",
      text: "The rhythm is intentionally simple, because the last thing a quince planning year needs is one more confusing bill.",
    },
    {
      type: "ol",
      items: [
        "Choose your commission and any enhancements — the total is published, so you see it before you pay anything.",
        `Reserve online with the ${retainerPct} retainer at secure checkout. Your date comes off the calendar the moment it's paid.`,
        "The retainer is applied in full to your total, so what remains is the balance — nothing added.",
        `The balance is due ${due} days before the celebration, so everything is settled well before the day itself.`,
      ],
    },
    {
      type: "p",
      text: `Some studios in DFW offer monthly payment plans instead; if that matters to you, ask any studio exactly how many payments, when the last one falls, and whether a plan costs more than paying in full. Our structure is deliberately simple: one retainer now, one balance ${due} days out.`,
    },
    { type: "h2", text: "What the retainer secures (and what to ask about refunds)" },
    {
      type: "p",
      text: "The retainer does one important job: it takes your date off the calendar so no other family can book it. A crew can only be in one place on a given Saturday, so the retainer is what reserves your directors, your hours, and your spot.",
    },
    {
      type: "p",
      text: "Is a deposit or retainer refundable? Policies vary by studio, so ask for the terms in writing before you pay. In general, a retainer holds a date that the studio then turns other families away from, so it isn't designed to be handed back if plans change on your side. What you should always get in writing is what happens if the studio has to cancel on you — at TX Quince, if we ever have to cancel, your retainer is returned in full.",
    },
    {
      type: "quote",
      text: "The retainer protects your date. The published price protects your budget. Written terms protect you from surprises.",
    },
    {
      type: "cta",
      heading: "Reserve your date — or talk to us first",
      body: `Pay the ${retainerPct} retainer at secure checkout to lock your date, or request a consultation and we'll hold the date for ${hold} days while we talk.`,
      href: "/#intake",
      label: "Reserve your date",
    },
    { type: "h2", text: "If you're not ready to commit today: hold the date first" },
    {
      type: "p",
      text: "Sometimes you want to talk it through before paying anything, but you still don't want to risk losing your date. Two paths help here:",
    },
    {
      type: "ul",
      items: [
        `Request a consultation first. Tell us your date and what you're picturing, and we hold the date for ${hold} days while we talk through coverage, the timeline, and which commission fits — no payment required to start.`,
        `Start with the Portrait Study. At ${usd(TIER_PRICE_USD.study)}, it's our photo-only commission — a three-hour editorial portrait session before the celebration, 60 retouched frames, and a motion portrait — with a ${retainerFor("study")} retainer.`,
      ],
    },
    {
      type: "p",
      text: "Either way, the goal is the same: secure the date now, on terms you understand — not next year's regret. Browse the [portfolio](/portfolio) to see the work, or compare every option on the [commissions page](/#commissions).",
    },
    { type: "h2", text: "Why payment timing ties to booking 9–12 months out" },
    {
      type: "p",
      text: `In Dallas–Fort Worth, the best spring and fall Saturdays get claimed nine to twelve months ahead. Booking that early does two things at once: it secures the date your daughter wants, and it gives your family the most time to set aside the balance before it comes due ${due} days out. Wait until a few months before and the same balance has to come together much faster.`,
    },
    {
      type: "p",
      text: "When you're ready, [check if your date is open](/check-your-date) in a few seconds, see whether [Dallas](/quinceanera-photographer/dallas) is your area, or read [when to book your quinceañera photographer](/blog/when-to-book-quinceanera-photographer-dfw) so the calendar doesn't decide for you. If you're still mapping out the whole celebration, the [Texas quince budget breakdown](/blog/quinceanera-budget-breakdown-texas) shows where photography fits among the other costs.",
    },
  ],
  faqs: [
    {
      q: "Do you offer payment plans for quinceañera photography?",
      a: `TX Quince uses a simple two-payment structure rather than a monthly plan: a retainer of ${retainerPct} of your commission (minimum ${retainerFloor}) reserves your date, and the balance is due ${due} days before the celebration. The retainer is applied in full, so there's no extra cost.`,
    },
    {
      q: "How much is the retainer to book?",
      a: `It's ${retainerPct} of your commission, with a ${retainerFloor} minimum: ${retainerFor("study")} for the Portrait Study (${usd(TIER_PRICE_USD.study)}), ${retainerFor("cinema")} for Cinema & Stills (${usd(TIER_PRICE_USD.cinema)}), ${retainerFor("production")} for The Full Production (${usd(TIER_PRICE_USD.production)}), and ${retainerFor("archive")} for the Multi-Day Editorial Archive (${usd(TIER_PRICE_USD.archive)}).`,
    },
    {
      q: "Is the retainer refundable?",
      a: "The retainer holds your date and applies to your balance, so it isn't designed to be returned if plans change on your side. If TX Quince ever has to cancel, your retainer is returned in full. With any studio, ask for the policy in writing before you pay.",
    },
    {
      q: "When is the balance due?",
      a: `The balance is due ${due} days before the celebration, so everything is settled well before the day itself.`,
    },
    {
      q: "Can I hold my date before paying anything?",
      a: `Yes. Request a consultation first and we hold your date for ${hold} days while we talk through coverage and which commission fits. When you're ready, the retainer locks it in.`,
    },
  ],
  related: [
    "quinceanera-photographer-cost-dallas-fort-worth",
    "quinceanera-budget-breakdown-texas",
    "when-to-book-quinceanera-photographer-dfw",
  ],
};

export default post;
