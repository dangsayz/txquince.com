import type { BlogPost } from "@/content/blog";
import { BASE_CREW } from "@/lib/commission";
import { PT } from "@/lib/price-text";

const study = PT.price.study;
const solo = PT.price.solo;
const cinema = PT.price.cinema;
const trio = PT.price.trio;
const retainerPct = PT.deposit.percent;

const post: BlogPost = {
  slug: "quinceanera-photographer-cost-dallas-fort-worth",
  title: "How Much Does a Quinceañera Photographer Cost in Dallas–Fort Worth?",
  description:
    "Real 2026 pricing for quinceañera photos & video in Dallas–Fort Worth — market ranges, what each package includes, photo vs video, retainers, and how to avoid hidden fees.",
  category: "Cost & Budget",
  excerpt:
    "What DFW studios actually charge, what each published package includes, and exactly what drives the price up or down — no “inquire for pricing” games.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 7,
  lead: "If you've started calling around, you've already noticed the problem: half the photographers won't tell you a price until you fill out a form. So let's put the numbers on the table — what the Dallas–Fort Worth market charges, what each of our packages includes, and what actually changes the cost — so you can budget your daughter's quinceañera with no surprises.",
  content: [
    { type: "h2", text: "The short answer" },
    {
      type: "p",
      text: `In Dallas–Fort Worth, most quinceañera studios publish photo-only packages around $1,500–$3,000 and photo + video packages around $3,000–$5,500. Luxury quince collections run $5,500–$8,000 and up, and for comparison, luxury Dallas wedding photo + video averages about $10,000. At [TX Quince](/#commissions), packages are published on the site — no quote form required: the ${study} Portrait Session, ${solo} Solo, ${cinema} Duo, and ${trio} Trio.`,
    },
    {
      type: "p",
      text: "Those prices hold across the whole metroplex — your package costs the same whether the quince is in [Irving](/quinceanera-photographer/irving), [Arlington](/quinceanera-photographer/arlington), or [Garland](/quinceanera-photographer/garland), with no venue-based markup and no surprise quote.",
    },
    {
      type: "callout",
      text: "Why so many studios hide pricing: it lets them quote each family differently. Fixed, published pricing is the fairer model — you know what everyone pays before you ever reach out.",
    },
    { type: "h2", text: "What you're actually paying for" },
    {
      type: "p",
      text: "The number on the package is four things bundled together — coverage hours, the number of artists, whether you get video as well as photos, and how the finished work is delivered.",
    },
    {
      type: "ul",
      items: [
        "Coverage hours — a quince day runs long: getting ready, la misa, portraits, and the reception. Full-day coverage is the difference between a highlight and the whole story.",
        `One artist vs. a team — one photographer and one videographer on the Duo (${BASE_CREW.cinema} in all), two photographers and one videographer on the Trio (${BASE_CREW.trio}) — means the church and the reception entrance are both covered at once, with reverse angles you can't fake with one camera. A coordinator who runs the day can be added for ${PT.addon.coordinator} a day.`,
        "Photo vs. photo + video — video is a separate craft and a separate edit. Our Solo gets you both from one shooter running a 2–3 camera setup, so a camera is on the action wherever it happens; the Duo and the Trio put a dedicated photographer and videographer on the day.",
        "Delivery — a private online gallery, and on the video packages the full-length film of her whole day plus a highlight (1 minute on the Duo, 3–5 minutes on the Trio, an add-on with the Solo). The Trio adds a printed album.",
      ],
    },
    { type: "h2", text: "Photo only, or photo and video?" },
    {
      type: "p",
      text: `This one choice changes the price more than any other — and it's the most common regret. Families who book photo-only most often wish, afterward, that they had the vals and the surprise dance on video. If the budget only stretches one way, prioritize the moments that move: the [vals and the surprise dance](/portfolio) are made for video. Our ${study} Portrait Session is photo only — a ${PT.hours.study}-hour session with one photographer — while every package from ${solo} up pairs photos with the full-length film of her day, and from ${cinema} up a short highlight comes with it. Compare them side by side on the [packages page](/#commissions); for most families, our pick is the Trio at ${trio}.`,
    },
    { type: "h2", text: "The deposit and the balance" },
    {
      type: "p",
      text: `You don't pay the full amount up front. You pick a package and sign the agreement online, and we hold your date for ${PT.holdDays} days while we review it. Once it's approved (within one day), a deposit of ${retainerPct} of your package locks in your date and goes toward your total; the rest is due ${PT.balanceDays} days before the event. Want to talk first? Ask for a quick call.`,
    },
    {
      type: "cta",
      heading: "See every package and what's included",
      body: "Published prices, full inclusions, and add-ons — all on one page.",
      href: "/#commissions",
      label: "Compare packages",
    },
    { type: "h2", text: "What drives the price up (and what doesn't)" },
    {
      type: "ul",
      items: [
        `Up: adding video, a larger team, more hours on the day (from ${PT.extra.from} per extra hour with us, up to ${PT.hours.max} hours in all), a Second Portrait Day (${PT.addon.secondday}), or extras like a Same-Day Edit, ready in 24 hours (${PT.addon.sameday}).`,
        "Up a little: travel far outside the metroplex (inside DFW there's usually no travel fee).",
        "Doesn't change the price with honest studios: your venue, your guest count, or the day of the week — be wary of anyone who quotes by those.",
      ],
    },
    { type: "h2", text: "How to budget it without regret" },
    {
      type: "ol",
      items: [
        "Decide photo-only vs. photo + video first — it sets your whole range.",
        "Book the photographer early; the best dates go 9–12 months out, and the deposit locks both the date and today's price.",
        "Plan for photo and video to take roughly 8–15% of the total celebration budget — that's the share most families give it.",
        "Compare full galleries, not highlight videos — ask to see a complete quince start to finish.",
      ],
    },
    {
      type: "p",
      text: "When you're ready, you can [check if your date is open](/check-your-date) in a few seconds, or read [when to book your photographer](/blog/when-to-book-quinceanera-photographer-dfw) so you don't lose your Saturday. To see exactly how the deposit and balance work, read our guide to [deposits and paying for your quince photographer](/blog/quinceanera-payment-plans-deposits-dfw). For local coverage, see our [quinceañera photographer in Dallas](/quinceanera-photographer/dallas) or [Fort Worth](/quinceanera-photographer/fort-worth).",
    },
  ],
  faqs: [
    {
      q: "How much should I budget for quinceañera photography in DFW?",
      a: `Most DFW studios publish photo-only packages around $1,500–$3,000 and photo + video around $3,000–$5,500, with luxury quince collections at $5,500–$8,000 and up. TX Quince publishes four packages: the Portrait Session at ${study} (photo only), the Solo at ${solo} (photo + video from one shooter), the Duo at ${cinema}, and the Trio at ${trio}.`,
    },
    {
      q: "Do I need both a photographer and a videographer?",
      a: "You don't need both, but the moments families most regret missing — the vals, the surprise dance, the toasts — are the ones that come alive on video. If your budget allows, a combined photo + video team captures both without two separate vendors to coordinate.",
    },
    {
      q: "How far in advance should I book?",
      a: "Nine to twelve months is ideal in Dallas–Fort Worth, especially for spring and fall Saturdays. Booking early secures both your date and the current price.",
    },
    {
      q: "How does the deposit work?",
      a: `The deposit is ${retainerPct} of your package, paid after we approve your signed agreement. It locks in your date and goes toward your total, and the rest is due ${PT.balanceDays} days before the event. We hold your date for ${PT.holdDays} days while we review the agreement. Prefer to talk first? Ask for a quick call.`,
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
