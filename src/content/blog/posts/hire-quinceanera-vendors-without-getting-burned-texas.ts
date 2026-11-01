import type { BlogPost } from "@/content/blog";
import { PT } from "@/lib/price-text";

/*
 * PILLAR of the "Protect your money" cluster (src/content/blog-clusters.ts).
 * Every story below is a published news report, linked inline. No family or
 * vendor is named beyond what the reports themselves name in their headlines,
 * and nothing is quoted from private posts.
 */
const post: BlogPost = {
  slug: "hire-quinceanera-vendors-without-getting-burned-texas",
  title: "How to Hire Quinceañera Vendors in Texas Without Getting Burned",
  metaTitle: "Quinceañera Vendor Scams in Texas: How to Protect Your Money",
  description:
    "Photos never delivered, venues that double-book, dresses that never arrive. What went wrong for real Texas quinceañera families, the seven rules that prevent it, and what to do if it already happened.",
  category: "Planning",
  excerpt:
    "Families save for years for one night. These are the real ways Texas quince families have lost money to vendors, and the simple rules that would have protected them.",
  publishedAt: "2026-10-31",
  readMinutes: 9,
  lead: "Families save for years for one night, and most quince vendors are honest people who work hard for it. But every year local news in Texas tells the same stories: a mother who paid for photos and video and is still waiting months later, a hall that took deposits and stopped answering, a dress that never arrived. We read those reports so you don't have to learn the hard way. Here's what actually went wrong, the seven rules that would have prevented almost all of it, and exactly what to do if it's already happening to you.",
  content: [
    { type: "h2", text: "What actually goes wrong" },
    {
      type: "p",
      text: "These aren't rumors from a Facebook group. Each one was reported by a news station, most of them here in Texas.",
    },
    { type: "h3", text: "1. Paid in full, and the photos never came" },
    {
      type: "p",
      text: "In Dallas, a mother paid more than $1,600 for quince photos and video and was still waiting more than six months later ([Univision 23 Dallas](https://www.univision.com/local/dallas-kuvn/localisimo/quinceanera-las-fotos-y-videos-por-las-que-pago-mas-de-1600-dolares)). In the Rio Grande Valley, a family paid more than $2,000 to a company they found on Facebook and had nothing almost a year later ([KRGV](https://www.krgv.com/news/empresa-del-valle-incumple-con-entrega-de-fotos-a-quincea-era/)). In Laredo, a photographer was arrested after a family paid for photos and video from a July 2025 quince and never received them ([PetaPixel](https://petapixel.com/2026/05/27/photographer-arrested-for-allegedly-failing-to-deliver-quinceanera-photos/)).",
    },
    { type: "h3", text: "2. Delivered late, and not what they paid for" },
    {
      type: "p",
      text: "Two mothers in San Diego got their photos about nine months after the party, and said they weren't professionally edited and didn't match the package they bought. Neither received a video ([NBC 7 San Diego](https://www.nbcsandiego.com/nbc-7-responds-2/san-diego-quinceanera-photos-fall-short/3998184/)).",
    },
    { type: "h3", text: "3. The middleman never paid the real vendor" },
    {
      type: "p",
      text: "A San Francisco family's limousine package included $1,500 for photos and video, but the limo company never paid the photographer, so the family waited a year for their pictures ([ABC7](https://abc7news.com/post/sf-family-hires-quinceanera-photographer-never-gets-photos/5695017/)). In San Jose, an event planner was charged with felony grand theft after collecting money from families and not paying their venues and caterers ([NBC Bay Area](https://www.nbcbayarea.com/news/local/san-jose-event-planner-quinceanera-scam/3957744/)).",
    },
    { type: "h3", text: "4. The venue took deposits, then went quiet" },
    {
      type: "p",
      text: "In San Antonio, more than a dozen families said an event hall took thousands of dollars and then cancelled, double-booked their date or stopped responding ([KENS 5](https://www.kens5.com/article/features/producers-picks/customers-claim-san-antonio-event-center-has-taken-thousands-of-dollars-from-families/273-620619829)).",
    },
    { type: "h3", text: "5. The dress wasn't ready" },
    {
      type: "p",
      text: "A McAllen mother learned a week before her twins' quince that their dresses wouldn't be ready, and the shop first refused a refund ([KRGV](https://www.krgv.com/videos/mother-devastated-after-shop-refuses-to-refund-late-quinceanera-dresses)). In Phoenix, the Arizona Attorney General sued a quince boutique that took about $44,000 in deposits and then closed ([KJZZ](https://www.kjzz.org/2024-03-07/content-1873487-arizona-ag-says-quinceanera-dress-shop-took-44k-deposits-then-suddenly-closed)).",
    },
    { type: "h3", text: "6. It wasn't really them" },
    {
      type: "p",
      text: "Tejano singer Bobby Pulido warned fans that fake accounts were using his name to charge families for quinceañera appearances he never agreed to ([Tejano Nation](https://tejanonation.net/2026/05/21/bobby-pulido-warns-fans-about-quinceanera-scam-accounts-charging-for-appearances/)). The same trick works with any popular vendor's photos and name.",
    },
    {
      type: "callout",
      text: "The pattern is almost always the same: money paid early, nothing in writing, a vendor found only through social media, and no date anyone could be held to.",
    },

    { type: "h2", text: "Seven rules that prevent almost all of it" },
    {
      type: "ol",
      items: [
        "Get a written agreement before you pay anything. It should name the business, your date, the hours, exactly what you receive, and when you receive it.",
        "Get the delivery date in writing. \"A few months\" isn't a date. Here's [what a normal turnaround looks like](/blog/how-long-to-get-quinceanera-photos-video-back).",
        "Pay a deposit to hold the date, not the whole thing months early. A deposit is normal for every kind of quince vendor; paying 100% long before the party is where families get stuck.",
        "Pay in a way that leaves a record and gives you options. Card payments come with dispute rights that cash and most app transfers don't. Keep every receipt and screenshot.",
        "Hire the real vendor, not a bundle. If a hall, limo or planner package \"includes\" photo and video, ask for the photographer's name and contract, and confirm with them directly that they're booked and paid.",
        "Check that they're real and that it's really them. Ask for full galleries from complete quinces, not just highlights, read reviews off their own page, and message the official website or number rather than a new account in a group.",
        "Keep the conversation in writing. Follow up a phone call with a text or email that repeats what you agreed to.",
      ],
    },

    { type: "h2", text: "Red flags to walk away from" },
    {
      type: "ul",
      items: [
        "Cash only, or \"send it to my personal account\", with no receipt.",
        "No contract, or a contract with no delivery date.",
        "A price far below everyone else for the same coverage.",
        "\"This price is only good today.\"",
        "They can't show you one complete quince, start to finish.",
        "A business that only exists as a Facebook page, especially one that has changed names.",
        "Slow, vague answers before you've paid. It rarely gets better after.",
      ],
    },

    { type: "h2", text: "If it's already happening to you" },
    {
      type: "p",
      text: "Start calm and in writing. Most delays get solved at step one, and every later step works better when you have a paper trail.",
    },
    {
      type: "ol",
      items: [
        "Send a written message with a deadline: what you paid, what you were promised, and the date you need it by.",
        "If you paid by card, call your card company right away and ask about a dispute. The windows are short and usually count from your statement date, so don't wait.",
        "File a complaint with the Better Business Bureau. Many vendors respond quickly once one is filed.",
        "File a consumer complaint with the Texas Attorney General's office.",
        "For money you can't get back, Texas justice courts hear small claims up to $20,000, and you don't need a lawyer to file ([Texas State Law Library](https://guides.sll.texas.gov/small-claims)).",
        "If a vendor took money and disappeared, make a police report. In the Laredo case above, it led to an arrest.",
      ],
    },
    {
      type: "callout",
      text: "This is practical guidance from public reports, not legal advice. For a large amount, a short consult with a consumer attorney is worth it.",
    },

    { type: "h2", text: "How we handle it at TX Quince" },
    {
      type: "p",
      text: `You sign a written agreement before any payment. A ${PT.deposit.percent} deposit locks in your date, and the rest is due ${PT.balanceDays} days before the party, never months early. Your day is covered by our own team, not freelancers we find last minute, and every gallery and film is edited by the two owners. If anyone on the team can't make it, one of us covers your day ourselves, no exceptions. Photos and video arrive 30 to 90 days after the party, depending on the season. Everything we deliver is yours to keep, print and share. Our [prices are published](/#commissions) and so are the [questions we think you should ask any photographer](/blog/questions-to-ask-quinceanera-photographer), including us.`,
    },
    {
      type: "cta",
      heading: "Get a plan in writing first",
      body: "Tell us her date and colors and get a private plan with our work, your date's availability and every price, before you talk money with anyone.",
      href: "/plan?src=blog-vendors",
      label: "Get my free quince plan",
    },
  ],
  faqs: [
    {
      q: "How do quinceañera vendor scams usually work?",
      a: "Most reported cases follow one pattern: a vendor found through social media takes full payment early, often in cash or an app transfer, with no written agreement or delivery date, then delays and stops responding. Bundled packages where a middleman collects money for another vendor are another common way families lose money.",
    },
    {
      q: "Is it normal to pay a deposit for a quinceañera photographer?",
      a: "Yes. A deposit to hold your date is normal for photographers, venues, DJs and dress shops. What's risky is paying the full amount long before the event without a written agreement that lists what you'll receive and when.",
    },
    {
      q: "What should a quinceañera photography contract include?",
      a: "The business name, your date and hours, the people covering it, exactly what you'll receive (number of edited photos, video length), the delivery date, the payment schedule, and what happens if either side has to cancel.",
    },
    {
      q: "What can I do if my quinceañera photographer never delivered the photos in Texas?",
      a: "Send a written demand with a deadline, dispute the charge with your card company quickly if you paid by card, file complaints with the Better Business Bureau and the Texas Attorney General's office, and if needed file in justice court, which hears small claims up to $20,000 in Texas without requiring a lawyer.",
    },
  ],
  related: [
    "questions-to-ask-quinceanera-photographer",
    "quinceanera-payment-plans-deposits-dfw",
    "how-to-choose-quinceanera-photographer-dfw",
  ],
};

export default post;
