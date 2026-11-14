import type { BlogPost } from "@/content/blog";
import { PT } from "@/lib/price-text";

// Venue guide. Facts (address, rooms, seated counts, outside catering, floors,
// draping, 2019 renovation, phone, site) come from the venue's public listings
// on The Vendry and Eventective, checked Nov 14, 2026. The cover is the owner's
// own photo of the entrance. No rating is quoted: no source states one.
const study = PT.price.study;
const solo = PT.price.solo;
const cinema = PT.price.cinema;
const trio = PT.price.trio;

const post: BlogPost = {
  slug: "quinceanera-at-the-oasis-ballroom-irving",
  title: "Quinceañera at The Oasis Ballroom, Irving: Rooms, Cost & Photo Guide",
  metaTitle: "Quinceañera at The Oasis Ballroom, Irving | Guide",
  description:
    "Planning a quinceañera at The Oasis Ballroom in Irving? Its three ballrooms (80 to 400 seated), how pricing works, what to ask on the tour and how to plan the photos.",
  category: "Locations",
  excerpt:
    "Three ballrooms under one sign on West Airport Freeway, from an 80-seat room to a 400-seat hall. What The Oasis Ballroom is, which room fits your guest list, and how to make it photograph well.",
  publishedAt: "2026-11-14",
  readMinutes: 6,
  venues: ["the-oasis-ballroom"],
  related: [
    "pink-and-gold-quinceanera-convention-plaza-ballroom-irving",
    "quinceanera-reception-venues-dfw",
    "quinceanera-budget-breakdown-texas",
  ],
  lead: "The Oasis Ballroom is a banquet venue at 3225 W Airport Fwy, Suite 200, in Irving, with three ballrooms that seat from 80 to 400 guests. We have photographed celebrations here more than once. This guide covers what families ask us before they book it: which room fits, how the pricing works, what to ask on the tour, and how to plan the night so the room looks as good in the photos as it does in person.",
  content: [
    {
      type: "image",
      slug: "oasis-ballroom-irving-entrance-sign-dusk",
      caption: "The front entrance at dusk, on West Airport Freeway in Irving.",
    },
    { type: "h2", text: "What The Oasis Ballroom is" },
    {
      type: "p",
      text: "The Oasis Ballroom sits on West Airport Freeway (Highway 183) in Irving, in the Belt Line area, an easy drive for families in Irving, Grand Prairie, Euless, Arlington and northwest Dallas. It hosts quinceañeras, weddings and birthday parties. From the parking lot you see the lit sign, two arched brick towers with lanterns, and glass doors marked 200. Inside are three separate ballrooms, so more than one event can run on the same night.",
    },
    {
      type: "ul",
      items: [
        "Address: 3225 W Airport Fwy, Suite 200, Irving, TX 75062",
        "Rooms: three ballrooms, from about 1,500 to 10,000 square feet, per the venue",
        "Largest seated count: 400 guests, in the Sahara Room",
        "Features listed: hardwood floors, ceiling draping, a walk-in cooler, ADA accessible",
        "Renovated: 2019, per its listing",
        "Phone: (214) 519-3320",
        "Online: theoasisballroom.com and @theoasisballroom on Instagram",
      ],
    },
    { type: "h2", text: "Which room fits your guest list" },
    {
      type: "p",
      text: "The venue's listings give a maximum seated count for each room. Those are maximums. A quinceañera needs a dance floor, a head table, a DJ booth and room for the court to move, so plan on fewer seats than the number on paper.",
    },
    {
      type: "ul",
      items: [
        "The Sahara Room: up to 400 seated. The one for a big family quince with a full court.",
        "The Arabian Room: up to 300 seated. The middle size, and where most DFW quinceañera guest lists land.",
        "The Mojave Room: up to 80 seated. Small: a family-only celebration, a dinner after the Mass, or a birthday.",
      ],
    },
    {
      type: "p",
      text: "Ask the coordinator to show you the floor plan for your real guest count, with the dance floor in place. If you are near the top of a room's number, look at the next room up. A room your list barely fits is the most common venue regret we hear about.",
    },
    { type: "h2", text: "What a quinceañera at The Oasis Ballroom costs" },
    {
      type: "p",
      text: "The Oasis Ballroom does not publish prices. You get a quote after a tour, which is normal for DFW banquet halls. The number moves with the room, the day (Saturdays cost more everywhere), the hours, and what is bundled in. Its listing says outside catering is allowed, which gives you room to compare caterers instead of taking one menu. Ask for an itemized quote so you can compare it fairly against other halls.",
    },
    {
      type: "p",
      text: `Photos and video are a separate, fixed line. Our [packages](/#commissions) are published at ${study}, ${solo}, ${cinema} and ${trio}. A deposit of ${PT.deposit.percent} holds your date once your agreement is approved, and the rest is due ${PT.balanceDays} days before the event. The venue quote is the number that moves; your coverage does not have to.`,
    },
    { type: "h2", text: "How to make The Oasis Ballroom photograph well" },
    {
      type: "p",
      text: "A ballroom is a party room first. The families who get the best galleries from a hall like this plan four things:",
    },
    {
      type: "ol",
      items: [
        "Use the front at golden hour. The arched brick towers and lit sign make a strong arrival photo in the last light, like the photo at the top of this page. Plan the limo or family arrival for around sunset and we get the quinceañera, her dress and the venue name in one frame.",
        "Ask about the uplighting. Strong color washes look great in person and turn skin green or purple on camera. Ask for warm or neutral light during the entrance, the waltz and the cake, and save the color for the dance floor.",
        "Do the portraits before the party. The dress deserves daylight. A [pre-quince session](/blog/pre-quince-photo-session-dfw), or portraits earlier that day, means the ballroom only has to carry the celebration. The [Mandalay Canal Walk in Las Colinas](/blog/black-floral-gown-quinceanera-mandalay-canal-las-colinas) is also in Irving and works well for it.",
        "Put the big moments inside your coverage hours. Entrance, waltz, crowning, brindis, surprise dance: set the run of show with the coordinator and your photographer together, so nothing lands after the cameras leave.",
      ],
    },
    { type: "h2", text: "Questions to ask on your Oasis Ballroom tour" },
    {
      type: "ol",
      items: [
        "Which room do you recommend for my guest count with a dance floor, and can I see that floor plan?",
        "What is in the package: tables, chairs, linens, draping, DJ, security, cleanup? What does the itemized quote look like?",
        "Outside catering is allowed. Are there fees, or rules for food, a bar or a cake?",
        "Can I bring my own photographer and video team with no vendor fee? Please put it in writing.",
        "When do we get the room, when can vendors load in, and what is the hard end time?",
        "Will another event be in the other ballrooms the same night, and how do the entrances and parking work then?",
        "How do deposits and payments work, and what happens if we need to move the date?",
      ],
    },
    { type: "h2", text: "More Irving quinceañera venues" },
    {
      type: "p",
      text: "Comparing halls in Irving? See a full [pink and gold quinceañera at Convention Plaza Ballroom](/blog/pink-and-gold-quinceanera-convention-plaza-ballroom-irving), our [Irving quinceañera photography](/irving) page, and the [DFW reception venue guide](/blog/quinceanera-reception-venues-dfw). Then put the full numbers together with the [quinceañera budget breakdown for Texas](/blog/quinceanera-budget-breakdown-texas).",
    },
    {
      type: "cta",
      heading: "Celebrating at The Oasis Ballroom?",
      body: "Type your budget and see which photo and video package fits, with every price published. Nothing is charged to send a request.",
      href: "/budget",
      label: "Open the budget page",
    },
    { type: "p", text: "Prefer to talk it through? [Text](sms:+19729148617) or [call](tel:+19729148617) (972) 914-8617, in English or Spanish." },
  ],
  faqs: [
    {
      q: "Where is The Oasis Ballroom in Irving?",
      a: "The Oasis Ballroom is at 3225 W Airport Fwy, Suite 200, Irving, TX 75062, on Highway 183 in the Belt Line area of Irving.",
    },
    {
      q: "How many guests does The Oasis Ballroom hold?",
      a: "It has three ballrooms. Per its listings, the Sahara Room seats up to 400, the Arabian Room up to 300 and the Mojave Room up to 80. Plan for fewer seats once a dance floor is in.",
    },
    {
      q: "How much does The Oasis Ballroom cost for a quinceañera?",
      a: "The venue does not publish prices. You get a quote after a tour, based on the room, the day, the hours and what is included. Call (214) 519-3320 or visit theoasisballroom.com.",
    },
    {
      q: "Can I bring outside catering to The Oasis Ballroom?",
      a: "The venue's listing says outside catering is allowed. Ask on your tour about any fees or rules for food, a bar or a cake, and get them in writing.",
    },
  ],
};

export default post;
