import type { BlogPost } from "@/content/blog";
import {
  TIER_PRICE_USD,
  ADD_ON_PRICE_USD,
  RETAINER,
  CONSULT_HOLD_DAYS,
  usd,
} from "@/lib/commission";

const study = usd(TIER_PRICE_USD.study);
const cinema = usd(TIER_PRICE_USD.cinema);
const production = usd(TIER_PRICE_USD.production);
const archive = usd(TIER_PRICE_USD.archive);
const retainerPct = `${Math.round(RETAINER.rate * 100)}%`;
const retainerFloor = usd(RETAINER.floorUsd);

const post: BlogPost = {
  slug: "quinceanera-photographer-cost-dallas-fort-worth",
  title: "How Much Does a Quinceañera Photographer Cost in Dallas–Fort Worth?",
  description:
    "Real 2026 pricing for quinceañera photography & film in Dallas–Fort Worth — market ranges, what each commission includes, photo vs film, retainers, and how to avoid hidden fees.",
  category: "Cost & Budget",
  excerpt:
    "What DFW studios actually charge, what each published commission includes, and exactly what drives the price up or down — no “inquire for pricing” games.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 7,
  lead: "If you've started calling around, you've already noticed the problem: half the photographers won't tell you a price until you fill out a form. So let's put the numbers on the table — what the Dallas–Fort Worth market charges, what each of our commissions includes, and what actually changes the cost — so you can budget your daughter's quinceañera with no surprises.",
  content: [
    { type: "h2", text: "The short answer" },
    {
      type: "p",
      text: `In Dallas–Fort Worth, most quinceañera studios publish photo-only packages around $1,500–$3,000 and photo + video packages around $3,000–$5,500. Luxury quince collections run $5,500–$8,000 and up, and for comparison, luxury Dallas wedding photo + film averages about $10,000. At [TX Quince](/#commissions), commissions are published on the site — no quote form required: the ${study} Portrait Study, ${cinema} Cinema & Stills, ${production} Full Production, and ${archive} Multi-Day Editorial Archive.`,
    },
    {
      type: "p",
      text: "Those prices hold across the whole metroplex — your commission costs the same whether the quince is in [Irving](/quinceanera-photographer/irving), [Arlington](/quinceanera-photographer/arlington), or [Garland](/quinceanera-photographer/garland), with no venue-based markup and no surprise quote.",
    },
    {
      type: "callout",
      text: "Why so many studios hide pricing: it lets them quote each family differently. Fixed, published pricing is the fairer model — you know what everyone pays before you ever reach out.",
    },
    { type: "h2", text: "What you're actually paying for" },
    {
      type: "p",
      text: "The number on the package is four things bundled together — coverage hours, the number of artists, whether you get film as well as photos, and how the finished work is delivered.",
    },
    {
      type: "ul",
      items: [
        "Coverage hours — a quince day runs long: getting ready, la misa, portraits, and the reception. Full-day coverage is the difference between a highlight and the whole story.",
        "One artist vs. a directed crew — a stills director and a motion director (plus a second stills artist on larger commissions) mean the church and the reception entrance are both covered at once, with reverse angles you can't fake with one camera.",
        "Photo vs. photo + film — film is a separate craft and a separate edit. A commission with both is two storytellers, not one person juggling a camera and a tripod.",
        "Delivery — a private online gallery, the edited film and reels, and on the larger commissions a linen-bound monograph and the raw archive.",
      ],
    },
    { type: "h2", text: "Photo only, or photo and film?" },
    {
      type: "p",
      text: `This one choice changes the price more than any other — and it's the most common regret. Families who book photo-only most often wish, afterward, that they had the vals and the surprise dance on video. If the budget only stretches one way, prioritize the moments that move: the [vals and the surprise dance](/portfolio) are made for film. Our ${study} Portrait Study is photo only — a three-hour editorial portrait session before the celebration — while every commission from ${cinema} up pairs stills and film. Compare them side by side on the [commissions page](/#commissions); most families choose The Full Production at ${production}.`,
    },
    { type: "h2", text: "The retainer and the balance" },
    {
      type: "p",
      text: `You don't pay the full amount up front. A retainer of ${retainerPct} of your commission (minimum ${retainerFloor}) reserves your date and is applied in full to your total; the balance is due ${RETAINER.balanceDueDays} days before the celebration. You can reserve online with the retainer at secure checkout, or request a consultation first and we'll hold the date for ${CONSULT_HOLD_DAYS} days while we talk.`,
    },
    {
      type: "cta",
      heading: "See every commission and what's included",
      body: "Published prices, full inclusions, and enhancements — all on one page.",
      href: "/#commissions",
      label: "Compare commissions",
    },
    { type: "h2", text: "What drives the price up (and what doesn't)" },
    {
      type: "ul",
      items: [
        `Up: adding film, a larger crew, more coverage hours, a second day, or enhancements like a destination portrait session (${usd(ADD_ON_PRICE_USD.destination)}) or a same-day reception edit (${usd(ADD_ON_PRICE_USD.sameday)}).`,
        "Up a little: travel far outside the metroplex (inside DFW there's usually no travel fee).",
        "Doesn't change the price with honest studios: your venue, your guest count, or the day of the week — be wary of anyone who quotes by those.",
      ],
    },
    { type: "h2", text: "How to budget it without regret" },
    {
      type: "ol",
      items: [
        "Decide photo-only vs. photo + film first — it sets your whole range.",
        "Book the photographer early; the best dates go 9–12 months out, and the retainer locks both the date and today's price.",
        "Plan for photo and film to take roughly 8–15% of the total celebration budget — that's the share most families give it.",
        "Compare full galleries, not highlight reels — ask to see a complete quince start to finish.",
      ],
    },
    {
      type: "p",
      text: "When you're ready, you can [check if your date is open](/check-your-date) in a few seconds, or read [when to book your photographer](/blog/when-to-book-quinceanera-photographer-dfw) so you don't lose your Saturday. To see exactly how the retainer and balance work, read our guide to [retainers and paying for your quince photographer](/blog/quinceanera-payment-plans-deposits-dfw). For local coverage, see our [quinceañera photographer in Dallas](/quinceanera-photographer/dallas) or [Fort Worth](/quinceanera-photographer/fort-worth).",
    },
  ],
  faqs: [
    {
      q: "How much should I budget for quinceañera photography in DFW?",
      a: `Most DFW studios publish photo-only packages around $1,500–$3,000 and photo + video around $3,000–$5,500, with luxury quince collections at $5,500–$8,000 and up. TX Quince publishes four commissions: ${study} (photo only), ${cinema}, ${production}, and ${archive}.`,
    },
    {
      q: "Do I need both a photographer and a videographer?",
      a: "You don't need both, but the moments families most regret missing — the vals, the surprise dance, the toasts — are the ones that come alive on film. If your budget allows, a combined photo + film team captures both without two separate vendors to coordinate.",
    },
    {
      q: "How far in advance should I book?",
      a: "Nine to twelve months is ideal in Dallas–Fort Worth, especially for spring and fall Saturdays. Booking early secures both your date and the current price.",
    },
    {
      q: "How does the retainer work?",
      a: `The retainer is ${retainerPct} of your commission (minimum ${retainerFloor}). It reserves your date and is applied in full to your total, and the balance is due ${RETAINER.balanceDueDays} days before the celebration. Prefer to talk first? Request a consultation and we hold the date for ${CONSULT_HOLD_DAYS} days.`,
    },
  ],
  related: [
    "when-to-book-quinceanera-photographer-dfw",
    "quinceanera-photo-vs-video",
    "quinceanera-budget-breakdown-texas",
    "quinceanera-payment-plans-deposits-dfw",
  ],
};

export default post;
