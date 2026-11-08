import type { BlogPost } from "@/content/blog";
import { PT } from "@/lib/price-text";

/*
 * DRAFT — not registered in src/content/blog.ts yet, so it is not live.
 *
 * Venue-post workflow (same for every new venue):
 *   1. Dang sends the storefront photo → venue added to venues.json + this draft.
 *   2. Edited photos land in media-inbox/"Enchanted Event Hall"/ → run the venue
 *      ingest; replace each PHOTO SLOT below with an `image` block
 *      ({ type: "image", slug, alt, caption }). No names in slugs, alt or captions.
 *   3. Videos arrive → link the film / reel where marked.
 *   4. Fill the EVENT STORY section with what actually happened (theme, colors,
 *      moments) — only true details from Dang.
 *   5. Register: import in blog.ts (posts + esPosts), add the EN↔ES pair, set
 *      publishedAt to the publish day, then update Grokbot's facts doc.
 *
 * Venue facts: address from the Birdeye listing (matches the "112" over the
 * door in Dang's photo); capacity + parking from the venue's Zola listing.
 * Re-check both before publishing.
 */

const study = PT.price.study;
const solo = PT.price.solo;
const cinema = PT.price.cinema;
const trio = PT.price.trio;

const post: BlogPost = {
  slug: "quinceanera-at-enchanted-event-hall-grand-prairie",
  title: "Quinceañera at Enchanted Event Hall, Grand Prairie: Photos & Planning Guide",
  metaTitle: "Quinceañera at Enchanted Event Hall, Grand Prairie TX",
  description:
    "A practical guide to a quinceañera at Enchanted Event Hall on South Carrier Parkway in Grand Prairie: capacity, the entrance, photography tips and what to ask on your venue tour.",
  category: "Locations",
  excerpt:
    "Enchanted Event Hall in Grand Prairie, from guest capacity and the iron-door entrance to photography tips and tour questions.",
  publishedAt: "2026-11-08",
  readMinutes: 6,
  venues: ["enchanted-event-hall"],
  lead: "Enchanted Event Hall is a banquet hall at 3005 S Carrier Pkwy, Suite 112, in Grand Prairie, between Arlington and south Dallas. From the parking lot it looks like a storefront in a shopping center; step through the arched iron doors and it is a full quinceañera room. We photographed a quinceañera there this month, so this guide covers what families want to know before booking: what the hall is, how it fits your guest count, what to ask on the tour, and how to plan the night so it photographs well.",
  content: [
    // PHOTO SLOT — cover: wide shot of the room set for the party (or the
    // storefront at night with the gold sign and red ropes).
    { type: "h2", text: "What Enchanted Event Hall is, and who it fits" },
    {
      type: "p",
      text: "Enchanted Event Hall sits in a shopping center on South Carrier Parkway in south Grand Prairie, a short drive from I-20 and Highway 360. That makes it easy for families coming from Arlington, Mansfield, Cedar Hill, Duncanville and Oak Cliff. Its listing puts the room at up to 200 seated guests (250 standing), which is mid-size for a DFW quinceañera.",
    },
    {
      type: "ul",
      items: [
        "Address: 3005 S Carrier Pkwy, Suite 112, Grand Prairie, TX 75052",
        "Capacity: up to 200 seated, 250 standing, per the venue's listing",
        "Parking: self-park in the shopping-center lot; no valet",
        "Nearby: our [Grand Prairie quinceañera photographer](/quinceanera-photographer/grand-prairie) page covers churches and portrait spots in the area",
      ],
    },
    { type: "h2", text: "The entrance: gold script, red ropes, iron doors" },
    {
      type: "p",
      text: "The front of the building does more work than most halls. A big gold-and-white script sign reads \"Enchanted Event Hall\" over the entry, the staff sets out gold stanchions with red velvet ropes, and the doors are a pair of arched black iron doors with scrollwork. At night, colored uplighting glows through the glass. It is a ready-made red-carpet moment for arrivals: the quinceañera stepping out of the car, the court lined up along the ropes, the family walking in together.",
    },
    // PHOTO SLOT — the arrival at the iron doors / court along the red ropes.
    {
      type: "ul",
      items: [
        "Plan a five-minute arrival photo before the grand entrance. Once guests are inside, the front is yours.",
        "The storefront lights are bright and white. Shoot arrivals at dusk, when the sky still has color, or ask your photographer to bring off-camera light.",
        "The ropes look best with the court standing on both sides, not just the quinceañera alone.",
      ],
    },
    { type: "h2", text: "Our quinceañera at Enchanted Event Hall" },
    // EVENT STORY — fill from Dang: theme and colors, the entrance, vals,
    // surprise dance, last doll, cake, anything special about the night.
    // Only real details. No names.
    {
      type: "p",
      text: "TX Quince photographed a quinceañera at Enchanted Event Hall in November 2026. Knowing the room before the day matters: where the entrance reads best, where to stand for the vals and the surprise dance, and when to pull the family for portraits without taking the quinceañera away from her own party.",
    },
    // PHOTO SLOTS — entrance, vals, surprise dance, family portrait, details.
    // VIDEO — link the highlight film / reel here when it is ready.
    { type: "h2", text: "What a quinceañera at Enchanted Event Hall costs" },
    {
      type: "p",
      text: "Enchanted Event Hall does not publish prices online, so the number comes at the end of a tour. That is normal for DFW banquet halls. Expect it to move with three things: your guest count, the day of the week (Saturdays cost more everywhere), and what the package includes, such as tables, linens, catering, DJ and décor. Ask for an itemized quote as well as the package price. It is the only way to compare halls fairly.",
    },
    {
      type: "p",
      text: "If your guest list is well past 200 seated, look at the larger halls in our [DFW reception venue guide](/blog/quinceanera-reception-venues-dfw). A room your count barely fits is the venue regret we hear most.",
    },
    {
      type: "p",
      text: `Whatever the hall quotes, photos and video are a separate, fixed line. Our [packages](/#commissions) are published at ${study}, ${solo}, ${cinema} and ${trio}, and a deposit of ${PT.deposit.percent} locks in the date once your agreement is approved, with the rest due ${PT.balanceDays} days before the event. There is no travel fee to Grand Prairie.`,
    },
    { type: "h2", text: "How to make Enchanted Event Hall photograph well" },
    {
      type: "ol",
      items: [
        "Shoot portraits before the reception. The dress deserves daylight. A [pre-quince session](/blog/pre-quince-photo-session-dfw) at Joe Pool Lake or another outdoor spot means the hall only has to carry the party.",
        "Ask about the uplighting. Strong blue and purple washes look great in person but fight skin tones on camera. Ask for a warmer setting during the entrance, vals and cake, and save the color for the dance floor.",
        "Keep the big moments inside your coverage window. Entrance, vals, brindis, surprise dance: confirm the run of show with the hall and your photographer together.",
        "Confirm outside vendors before you sign. Ask at the tour, in writing, whether you can bring your own photo and video team with no extra fee.",
      ],
    },
    { type: "h2", text: "Questions to ask on your Enchanted Event Hall tour" },
    {
      type: "ol",
      items: [
        "What exactly is in the package (tables, linens, catering, DJ, décor, security, cleanup), and what does the itemized version look like?",
        "What is the real seated capacity with a dance floor for my guest count, not the maximum?",
        "Can I bring my own photographer and video team with no vendor fee?",
        "When do we get access, when do vendors load in, and what is the hard end time?",
        "How do deposits work, and what happens if we need to move the date?",
      ],
    },
    {
      type: "cta",
      heading: "Celebrating at Enchanted Event Hall?",
      body: "We've photographed a quinceañera in this room. Check your date before the Saturdays around yours are gone.",
      href: "/check-your-date?venue=enchanted-event-hall",
      label: "Check your date",
    },
    {
      type: "p",
      text: "Keep planning: compare halls across the metroplex in the [DFW reception venue guide](/blog/quinceanera-reception-venues-dfw), and put the full numbers together with the [quinceañera budget breakdown for Texas](/blog/quinceanera-budget-breakdown-texas).",
    },
  ],
  faqs: [
    {
      q: "Where is Enchanted Event Hall?",
      a: "3005 S Carrier Pkwy, Suite 112, Grand Prairie, TX 75052, in a shopping center in south Grand Prairie near I-20.",
    },
    {
      q: "How many guests fit at Enchanted Event Hall?",
      a: "The venue's listing says up to 200 seated guests and 250 standing. Confirm the seated number with a dance floor on your tour.",
    },
    {
      q: "Does TX Quince photograph at Enchanted Event Hall?",
      a: "Yes. We have photographed a quinceañera there, and there is no travel fee to Grand Prairie.",
    },
  ],
  related: [
    "quinceanera-reception-venues-dfw",
    "quinceanera-reception-details-to-photograph",
    "quinceanera-budget-breakdown-texas",
  ],
};

export default post;
