/**
 * locations.ts — LOCAL SEO landing pages (one per DFW city we serve).
 *
 * City selection is FACT-BASED, not a guess: each city pairs a large
 * Mexican-American family base (where quinces actually happen, by volume) with
 * household income that supports a $2,500–$5,500 collection. "volume" cities are
 * the booking engine; "premium" cities skew to Legacy. (Source: 2024 Census/ACS
 * city estimates — see the cities chosen and why in the project notes.)
 *
 * Each page is unique local content (intro + neighborhoods + city FAQ) wrapped
 * around the shared conversion components — NOT a templated doorway page. Add a
 * city by appending one entry here; the route, sitemap, and hub pick it up.
 */

export type CityTier = "volume" | "premium";

export type Location = {
  slug: string;
  city: string;
  county: string;
  tier: CityTier;
  /** One-line positioning under the H1. */
  lead: string;
  /** 2 short paragraphs of genuinely local copy. */
  intro: [string, string];
  /** Real, well-known areas/landmarks — grounds the page locally. */
  areas: string[];
  /** City-specific FAQ (in addition to the shared ones the page adds). */
  faqs: { q: string; a: string }[];
};

export const locations: Location[] = [
  {
    slug: "grand-prairie",
    city: "Grand Prairie",
    county: "Dallas & Tarrant counties",
    tier: "volume",
    lead: "Right in the heart of one of DFW's largest Mexican-American communities.",
    intro: [
      "Grand Prairie sits in the sweet spot for a quinceañera — a deep, established Mexican-American community spread across the Dallas–Tarrant line, with the church-to-reception traditions still done in full. From the parishes off Pioneer Parkway to receptions out near Lone Star Park and EpicCentral, I photograph the whole day the way these families actually celebrate it.",
      "Because I only book one quinceañera a day, your celebration gets my complete attention — la misa, the portraits, el vals, and the reception, start to finish. No rushing between two events, no second photographer splitting their focus.",
    ],
    areas: [
      "Pioneer Parkway",
      "Dalworthington Gardens",
      "near Lone Star Park",
      "EpicCentral",
      "Joe Pool Lake",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Grand Prairie?",
        a: "Yes — Grand Prairie is part of my core Dallas–Fort Worth service area, with no travel fee anywhere in the metroplex. I cover the church, portraits, and reception wherever your day takes us across the city.",
      },
      {
        q: "Where do Grand Prairie families usually hold the reception?",
        a: "Anywhere from banquet halls along the Highway 161 / Pioneer Parkway corridor to venues near EpicCentral and Joe Pool Lake. Tell me your church and venue when you reach out and I'll build the timeline around both.",
      },
    ],
  },
  {
    slug: "irving",
    city: "Irving",
    county: "Dallas County",
    tier: "volume",
    lead: "From the parishes of South Irving to the towers of Las Colinas.",
    intro: [
      "Irving has one of the metroplex's most rooted Mexican-American communities — the panaderías, the markets, the parishes that have hosted quinceañeras for generations. I photograph the full tradition here, from a morning misa in South Irving to portraits at Williams Square or along the Las Colinas canals and a reception at the Toyota Music Factory or a neighborhood salón.",
      "One celebration per day means your quinceañera isn't one stop on a busy Saturday — it's the only thing on my calendar. The church, el vals, the baile sorpresa, the whole night, captured properly.",
    ],
    areas: [
      "South Irving",
      "Las Colinas",
      "Williams Square (the Mustangs)",
      "Toyota Music Factory",
      "Valley Ranch",
    ],
    faqs: [
      {
        q: "Do you cover quinceañeras in Irving and Las Colinas?",
        a: "Yes — Irving is central to my Dallas–Fort Worth service area, no travel fee. Whether the reception is in Las Colinas or a hall in South Irving, I photograph the full day.",
      },
      {
        q: "Can we do portraits in Las Colinas?",
        a: "Absolutely. Williams Square and the Las Colinas canals make beautiful portrait backdrops, and we can build a save-the-date session there before the day or fit portraits into the timeline.",
      },
    ],
  },
  {
    slug: "garland",
    city: "Garland",
    county: "Dallas County",
    tier: "volume",
    lead: "One of Dallas County's biggest, most celebration-proud communities.",
    intro: [
      "Garland is one of the largest Mexican-American communities in Dallas County, and it shows in how families do a quinceañera — full courts, full days, nothing skipped. From the parishes around downtown Garland Square to receptions near Firewheel and the Lake Ray Hubbard side of town, I document all of it.",
      "Booking one quinceañera a day is how I keep the quality where it should be. Your misa, your portraits, your entrada and vals and the celebration after — one photographer, fully present, the entire day.",
    ],
    areas: [
      "Downtown Garland Square",
      "Firewheel",
      "Lake Ray Hubbard",
      "South Garland",
      "Rowlett Road corridor",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Garland?",
        a: "Yes — Garland is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
      },
      {
        q: "How early should Garland families book?",
        a: "As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Reserve your date with a deposit and lock it in.",
      },
    ],
  },
  {
    slug: "dallas",
    city: "Dallas",
    county: "Dallas County",
    tier: "volume",
    lead: "The heart of Mexican-American Dallas — Oak Cliff, West Dallas, Pleasant Grove.",
    intro: [
      "Dallas has the largest Mexican-American community in North Texas, and its quinceañera tradition runs deepest in Oak Cliff, West Dallas, and Pleasant Grove. From a misa near Jefferson Boulevard to portraits in Bishop Arts or the Kessler and a reception across the city, I photograph the full day the way Dallas families actually celebrate it — church first, nothing left out.",
      "I only book one quinceañera a day. That means your daughter's celebration gets undivided attention from the first church photo to the last dance — not a slot squeezed between two other events.",
    ],
    areas: [
      "Oak Cliff",
      "Bishop Arts District",
      "West Dallas",
      "Pleasant Grove",
      "Jefferson Boulevard",
      "the Kessler",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras across Dallas?",
        a: "Yes — all of Dallas, with a special love for Oak Cliff, West Dallas, and Pleasant Grove. No travel fee anywhere in the metroplex. Church, portraits, and reception, start to finish.",
      },
      {
        q: "Can we do portraits in Bishop Arts or Oak Cliff?",
        a: "Yes — Bishop Arts and the Kessler area make gorgeous portrait backdrops. We can shoot a save-the-date session there beforehand or work portraits into the day's timeline.",
      },
    ],
  },
  {
    slug: "fort-worth",
    city: "Fort Worth",
    county: "Tarrant County",
    tier: "volume",
    lead: "Deep-rooted Northside tradition, from the parishes to the Stockyards.",
    intro: [
      "Fort Worth's Mexican-American community runs deep on the North Side — North Main, the Mercado, parishes that have celebrated quinceañeras for generations. I photograph the whole tradition here, from a morning misa to portraits near the Stockyards or the Cultural District and a reception on the west side of the metroplex.",
      "One celebration per day is my rule. Your quinceañera in Fort Worth gets a photographer who's fully there for la misa, el vals, the baile sorpresa, and every moment of the night — not divided across a packed Saturday.",
    ],
    areas: [
      "North Side / North Main",
      "the Stockyards",
      "Northside Mercado",
      "Cultural District",
      "Diamond Hill",
    ],
    faqs: [
      {
        q: "Do you cover quinceañeras in Fort Worth?",
        a: "Yes — Fort Worth and the Northside are part of my core service area with no travel fee. I photograph the full day, church through reception, anywhere in the city.",
      },
      {
        q: "Can we take portraits at the Stockyards?",
        a: "Yes — the Stockyards and the Cultural District are favorite Fort Worth portrait spots. We can plan a save-the-date session there or fold portraits into the quinceañera timeline.",
      },
    ],
  },
  {
    slug: "arlington",
    city: "Arlington",
    county: "Tarrant County",
    tier: "volume",
    lead: "Centered in the metroplex, between Dallas and Fort Worth.",
    intro: [
      "Arlington sits right in the middle of DFW, with a large Mexican-American community and an Entertainment District that gives quinceañeras some unmistakable backdrops — AT&T Stadium and Globe Life Field a short drive from most receptions. From the church to portraits to the celebration, I photograph the full Arlington quinceañera day.",
      "Because I take just one quinceañera a day, your celebration is never competing for my attention. La misa, the portraits, el vals, and the reception — one photographer, all day, fully present.",
    ],
    areas: [
      "Entertainment District",
      "near AT&T Stadium & Globe Life",
      "South Arlington",
      "Central Arlington",
      "Lake Arlington",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Arlington?",
        a: "Yes — Arlington is central to my Dallas–Fort Worth service area, no travel fee. Church, portraits, and reception, wherever in the city your day takes place.",
      },
      {
        q: "Can we shoot portraits in the Entertainment District?",
        a: "Yes — the area around AT&T Stadium and Globe Life makes a bold portrait backdrop. We can plan it as a save-the-date session or work it into the day.",
      },
    ],
  },
  {
    slug: "mansfield",
    city: "Mansfield",
    county: "Tarrant & Johnson counties",
    tier: "premium",
    lead: "Where DFW families go all-out on the celebration.",
    intro: [
      "Mansfield families tend to do a quinceañera in full — the complete day, the larger court, the cinematic film and album to match. It's exactly the celebration my Signature and Legacy collections are built for: two storytellers, the whole day, the long-form film and drone coverage that do a milestone like this justice.",
      "I book one quinceañera a day, so your celebration gets everything — la misa, portraits around Historic Downtown Mansfield or the Mansfield National area, el vals, and a reception captured start to finish, nothing rushed.",
    ],
    areas: [
      "Historic Downtown Mansfield",
      "Walnut Creek",
      "near Mansfield National",
      "South Pointe",
      "Mansfield ISD area",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Mansfield?",
        a: "Yes — Mansfield is part of my Dallas–Fort Worth service area with no travel fee. It's a natural fit for the Signature and Legacy collections, which cover the full day with film and album included.",
      },
      {
        q: "Which collection do most Mansfield families choose?",
        a: "Most go with Signature ($3,900) for the full day with photo and film, and many step up to Legacy ($5,500) for the long-form cinematic film, drone coverage, and a premium album. See exactly what's included on the investment page.",
      },
    ],
  },
  {
    slug: "farmers-branch",
    city: "Farmers Branch",
    county: "Dallas County",
    tier: "premium",
    lead: "An established community that celebrates in full.",
    intro: [
      "Farmers Branch pairs a strong, settled Mexican-American community with the means to do a quinceañera properly — and the families here tend to. From the church to portraits at the Historical Park or rose gardens and a full reception, I document the complete day the way it's meant to be remembered.",
      "One celebration per day means your quinceañera gets my full attention — la misa, el vals, the baile sorpresa, and the whole night. The Signature and Legacy collections are built for exactly this kind of all-day celebration.",
    ],
    areas: [
      "Farmers Branch Historical Park",
      "Mustang Crossing",
      "The Branch",
      "Brookhaven",
      "near Mercer Crossing",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Farmers Branch?",
        a: "Yes — Farmers Branch is part of my core DFW service area with no travel fee. I cover the full day, church through reception, wherever in the city you celebrate.",
      },
      {
        q: "Can we do portraits at the Historical Park?",
        a: "Yes — the Farmers Branch Historical Park and rose gardens are beautiful portrait settings. We can plan a save-the-date session there or build portraits into the quinceañera day.",
      },
    ],
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}

/** Up to `n` other cities, nearest-tier first, for the "also serving" links. */
export function nearbyLocations(slug: string, n = 5): Location[] {
  return locations.filter((l) => l.slug !== slug).slice(0, n);
}
