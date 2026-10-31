import type { BlogPost } from "@/content/blog";
import { PT } from "@/lib/price-text";

const retainerPct = PT.deposit.percent;
const due = PT.balanceDays;
const hold = PT.holdDays;

const post: BlogPost = {
  slug: "quinceanera-payment-plans-deposits-dfw",
  title:
    "Quinceañera Photography Deposits & Payment Plans in DFW (How to Book Without Paying All at Once)",
  description:
    "How booking a quinceañera photographer in Dallas–Fort Worth really works — deposits vs. retainers, when the balance is due, what to ask about refunds, and how to hold a date while you decide.",
  category: "Cost & Budget",
  excerpt:
    "A deposit holds your date; the rest comes due shortly before the event. This is how deposits work across DFW — and how to hold a date while you decide.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 7,
  lead: "The price of a quinceañera photographer can look like a wall when you see it all in one number. It isn't. Almost no family pays the full amount the day they book — you put down a deposit to hold the date, and the rest comes due closer to the event. We lay out exactly how that works across Dallas–Fort Worth and at TX Quince, in plain terms, so you can book with confidence. (Hablamos español — si te sientes más cómoda en español, dilo y te explicamos todo paso a paso.)",
  content: [
    { type: "h2", text: "Do you have to pay everything up front? No." },
    {
      type: "p",
      text: `Short answer: no. At TX Quince you reserve your date with a deposit of ${retainerPct} of your package, and the rest is due ${due} days before the event. That's it — two payments, both known from the day you book, so nothing about the cost surprises you later.`,
    },
    {
      type: "callout",
      text: "The deposit is not an extra fee. It is applied in full to your package total, so it simply becomes your first payment toward the same published price.",
    },
    { type: "h2", text: "How much is the deposit to book?" },
    {
      type: "p",
      text: `Across Dallas–Fort Worth, studios handle this differently: some ask for a flat deposit of a few hundred dollars, others ask for a percentage of the total — often around a third. At [TX Quince](/#commissions), the deposit is ${retainerPct} of your package:`,
    },
    {
      type: "ul",
      items: [
        `Portrait Session (${PT.price.study}) — ${PT.deposit.study} deposit to reserve your date.`,
        `The Solo (${PT.price.solo}) — ${PT.deposit.solo} deposit to reserve your date.`,
        `The Duo (${PT.price.cinema}) — ${PT.deposit.cinema} deposit to reserve your date.`,
        `The Trio (${PT.price.trio}) — ${PT.deposit.trio} deposit to reserve your date.`,
      ],
    },
    {
      type: "p",
      text: "Adding extras or extra hours raises the total, and the deposit follows at the same percentage. Want the full breakdown of what each package includes before you decide? See the [packages](/#commissions), or read our [full cost guide for DFW](/blog/quinceanera-photographer-cost-dallas-fort-worth).",
    },
    { type: "h2", text: "How the deposit works" },
    {
      type: "p",
      text: "The rhythm is intentionally simple, because the last thing a quince planning year needs is one more confusing bill.",
    },
    {
      type: "ol",
      items: [
        "Pick your package and any extras — the total is published, so you see it before you pay anything.",
        `Fill in your details, then review and sign the agreement online. We hold your date for ${hold} days while we look it over, and no payment is taken yet.`,
        `We review and approve it within one day. Then you pay the ${retainerPct} deposit to lock in your date.`,
        `The deposit goes toward your total, and the rest is due ${due} days before the event.`,
      ],
    },
    {
      type: "p",
      text: `Some studios in DFW offer monthly payment plans instead; if that matters to you, ask any studio exactly how many payments, when the last one falls, and whether a plan costs more than paying in full. Our structure is deliberately simple: one deposit to lock in your date, and the rest ${due} days before the event.`,
    },
    { type: "h2", text: "What the deposit secures (and what to ask about refunds)" },
    {
      type: "p",
      text: "The deposit does one important job: it takes your date off the calendar so no other family can book it. A crew can only be in one place on a given Saturday, so the deposit is what reserves your team, your hours, and your spot.",
    },
    {
      type: "p",
      text: "Is a deposit refundable? Policies vary by studio, so ask for the terms in writing before you pay. In general, a deposit holds a date that the studio then turns other families away from, so it isn't designed to be handed back if plans change on your side. What you should always get in writing is what happens if the studio has to cancel on you — at TX Quince, if we ever have to cancel, your deposit is returned in full.",
    },
    {
      type: "quote",
      text: "The deposit protects your date. The published price protects your budget. Written terms protect you from surprises.",
    },
    {
      type: "cta",
      heading: "Reserve your date — or talk to us first",
      body: `Sign the agreement online and we hold your date for ${hold} days while we review it. Once it's approved, the ${retainerPct} deposit locks it in. Want to talk first? Ask for a quick call.`,
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
        `Sign the agreement first. We hold your date for ${hold} days while we review it, and nothing is charged until it's approved. Want to talk it through? Ask for a quick call about the timeline and which package fits.`,
        `Start with the Portrait Session. At ${PT.price.study}, it's our photo-only package — a ${PT.hours.study}-hour session with one photographer and 60 edited photos — with a ${PT.deposit.study} deposit.`,
      ],
    },
    {
      type: "p",
      text: "Either way, the goal is the same: secure the date now, on terms you understand — not next year's regret. Browse the [portfolio](/portfolio) to see the work, or compare every option on the [packages page](/#commissions).",
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
      a: `TX Quince uses a simple two-payment structure rather than a monthly plan: a deposit of ${retainerPct} of your package reserves your date, and the rest is due ${due} days before the event. The deposit is applied in full, so there's no extra cost.`,
    },
    {
      q: "How much is the deposit to book?",
      a: `It's ${retainerPct} of your package: ${PT.deposit.study} for the Portrait Session (${PT.price.study}), ${PT.deposit.solo} for the Solo (${PT.price.solo}), ${PT.deposit.cinema} for the Duo (${PT.price.cinema}), and ${PT.deposit.trio} for the Trio (${PT.price.trio}).`,
    },
    {
      q: "Is the deposit refundable?",
      a: "The deposit holds your date and goes toward your total, so it isn't designed to be returned if plans change on your side. If TX Quince ever has to cancel, your deposit is returned in full. With any studio, ask for the policy in writing before you pay.",
    },
    {
      q: "When is the rest due?",
      a: `The rest is due ${due} days before the event.`,
    },
    {
      q: "Can I hold my date before paying anything?",
      a: `Yes. Sign the agreement online and we hold your date for ${hold} days while we review it. No payment is taken until it's approved; then the deposit locks it in. Have questions first? Ask for a quick call.`,
    },
  ],
  related: [
    "quinceanera-photographer-cost-dallas-fort-worth",
    "quinceanera-budget-breakdown-texas",
    "when-to-book-quinceanera-photographer-dfw",
  ],
};

export default post;
