/**
 * locations.ts — LOCAL SEO landing pages (one per DFW city we serve), bilingual.
 *
 * City selection is FACT-BASED, not a guess: each city pairs a large
 * Mexican-American family base (where quinces actually happen, by volume) with
 * household income that supports a $2,500–$5,500 collection. "volume" cities are
 * the booking engine; "premium" cities skew to Legacy. (Source: 2024 Census/ACS
 * city estimates — see the cities chosen and why in the project notes.)
 *
 * English pages live at /quinceanera-photographer/<slug>; Spanish at
 * /es/fotografo-de-quinceaneras/<slug>. The Spanish set targets a market with
 * even less competition ("fotógrafo de quinceañera en <ciudad>"). Each page is
 * unique local content wrapped around the conversion flow — not a doorway page.
 */

export type CityTier = "volume" | "premium";

export type CityFaq = { q: string; a: string };

export type Location = {
  slug: string;
  city: string;
  county: string;
  tier: CityTier;
  /** Real, well-known areas/landmarks — grounds the page locally (shared EN/ES). */
  areas: string[];

  // English
  lead: string;
  intro: [string, string];
  faqs: CityFaq[];

  // Spanish (natural Mexican Spanish, not a literal translation)
  leadEs: string;
  introEs: [string, string];
  faqsEs: CityFaq[];
};

export const locations: Location[] = [
  {
    slug: "grand-prairie",
    city: "Grand Prairie",
    county: "Dallas & Tarrant counties",
    tier: "volume",
    areas: [
      "Pioneer Parkway",
      "Dalworthington Gardens",
      "near Lone Star Park",
      "EpicCentral",
      "Joe Pool Lake",
    ],
    lead: "Right in the heart of one of DFW's largest Mexican-American communities.",
    intro: [
      "Grand Prairie sits in the sweet spot for a quinceañera — a deep, established Mexican-American community spread across the Dallas–Tarrant line, with the church-to-reception traditions still done in full. From the parishes off Pioneer Parkway to receptions out near Lone Star Park and EpicCentral, I photograph the whole day the way these families actually celebrate it.",
      "Because I only book one quinceañera a day, your celebration gets my complete attention — la misa, the portraits, el vals, and the reception, start to finish. No rushing between two events, no second photographer splitting their focus.",
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
    leadEs: "En el corazón de una de las comunidades mexicanas más grandes de DFW.",
    introEs: [
      "Grand Prairie es de los mejores lugares para una quinceañera: una comunidad mexicana arraigada que se extiende entre los condados de Dallas y Tarrant, donde todavía se hace la tradición completa, de la iglesia a la recepción. Desde las parroquias por Pioneer Parkway hasta los salones cerca de Lone Star Park y EpicCentral, fotografío todo el día tal como lo celebran las familias.",
      "Como solo reservo una quinceañera al día, tu celebración tiene toda mi atención: la misa, las fotos, el vals y la recepción, de principio a fin. Sin correr entre dos eventos, sin un segundo fotógrafo dividiendo su atención.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Grand Prairie?",
        a: "Sí — Grand Prairie es parte de mi área principal en Dallas–Fort Worth, sin cargo por traslado en todo el metroplex. Cubro la iglesia, las fotos y la recepción donde sea que se celebre tu día.",
      },
      {
        q: "¿Dónde hacen la recepción las familias de Grand Prairie?",
        a: "Desde salones por el corredor de la Highway 161 / Pioneer Parkway hasta lugares cerca de EpicCentral y Joe Pool Lake. Dime tu iglesia y tu salón cuando me escribas y armo el itinerario alrededor de los dos.",
      },
    ],
  },
  {
    slug: "irving",
    city: "Irving",
    county: "Dallas County",
    tier: "volume",
    areas: [
      "South Irving",
      "Las Colinas",
      "Williams Square (the Mustangs)",
      "Toyota Music Factory",
      "Valley Ranch",
    ],
    lead: "From the parishes of South Irving to the towers of Las Colinas.",
    intro: [
      "Irving has one of the metroplex's most rooted Mexican-American communities — the panaderías, the markets, the parishes that have hosted quinceañeras for generations. I photograph the full tradition here, from a morning misa in South Irving to portraits at Williams Square or along the Las Colinas canals and a reception at the Toyota Music Factory or a neighborhood salón.",
      "One celebration per day means your quinceañera isn't one stop on a busy Saturday — it's the only thing on my calendar. The church, el vals, the baile sorpresa, the whole night, captured properly.",
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
    leadEs: "De las parroquias del sur de Irving a las torres de Las Colinas.",
    introEs: [
      "Irving tiene una de las comunidades mexicanas más arraigadas del metroplex: las panaderías, los mercados, las parroquias que han celebrado quinceañeras por generaciones. Aquí fotografío la tradición completa, desde una misa de mañana en el sur de Irving hasta fotos en Williams Square o por los canales de Las Colinas y la recepción en el Toyota Music Factory o un salón del barrio.",
      "Una sola celebración al día significa que tu quinceañera no es una parada más en un sábado lleno: es lo único en mi calendario. La iglesia, el vals, el baile sorpresa, toda la noche, capturada como se debe.",
    ],
    faqsEs: [
      {
        q: "¿Cubres quinceañeras en Irving y Las Colinas?",
        a: "Sí — Irving está en el centro de mi área de Dallas–Fort Worth, sin cargo por traslado. Ya sea que la recepción esté en Las Colinas o en un salón del sur de Irving, fotografío todo el día.",
      },
      {
        q: "¿Podemos hacer fotos en Las Colinas?",
        a: "Claro que sí. Williams Square y los canales de Las Colinas son fondos preciosos, y podemos hacer una sesión save-the-date ahí antes del día o acomodar las fotos en el itinerario.",
      },
    ],
  },
  {
    slug: "garland",
    city: "Garland",
    county: "Dallas County",
    tier: "volume",
    areas: [
      "Downtown Garland Square",
      "Firewheel",
      "Lake Ray Hubbard",
      "South Garland",
      "Rowlett Road corridor",
    ],
    lead: "One of Dallas County's biggest, most celebration-proud communities.",
    intro: [
      "Garland is one of the largest Mexican-American communities in Dallas County, and it shows in how families do a quinceañera — full courts, full days, nothing skipped. From the parishes around downtown Garland Square to receptions near Firewheel and the Lake Ray Hubbard side of town, I document all of it.",
      "Booking one quinceañera a day is how I keep the quality where it should be. Your misa, your portraits, your entrada and vals and the celebration after — one photographer, fully present, the entire day.",
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
    leadEs: "Una de las comunidades más grandes y festivas del condado de Dallas.",
    introEs: [
      "Garland es una de las comunidades mexicanas más grandes del condado de Dallas, y se nota en cómo las familias hacen la quinceañera: cortes completas, días completos, sin saltarse nada. Desde las parroquias por el centro de Garland Square hasta las recepciones cerca de Firewheel y el lado de Lake Ray Hubbard, lo documento todo.",
      "Reservar una sola quinceañera al día es como mantengo la calidad donde debe estar. Tu misa, tus fotos, tu entrada y vals y la celebración después: un fotógrafo, presente por completo, todo el día.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Garland?",
        a: "Sí — Garland es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
      },
      {
        q: "¿Con cuánta anticipación deben reservar las familias de Garland?",
        a: "Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Reserva tu fecha con un depósito y déjala apartada.",
      },
    ],
  },
  {
    slug: "dallas",
    city: "Dallas",
    county: "Dallas County",
    tier: "volume",
    areas: [
      "Oak Cliff",
      "Bishop Arts District",
      "West Dallas",
      "Pleasant Grove",
      "Jefferson Boulevard",
      "the Kessler",
    ],
    lead: "The heart of Mexican-American Dallas — Oak Cliff, West Dallas, Pleasant Grove.",
    intro: [
      "Dallas has the largest Mexican-American community in North Texas, and its quinceañera tradition runs deepest in Oak Cliff, West Dallas, and Pleasant Grove. From a misa near Jefferson Boulevard to portraits in Bishop Arts or the Kessler and a reception across the city, I photograph the full day the way Dallas families actually celebrate it — church first, nothing left out.",
      "I only book one quinceañera a day. That means your daughter's celebration gets undivided attention from the first church photo to the last dance — not a slot squeezed between two other events.",
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
    leadEs: "El corazón del Dallas mexicano — Oak Cliff, West Dallas, Pleasant Grove.",
    introEs: [
      "Dallas tiene la comunidad mexicana más grande del norte de Texas, y la tradición de la quinceañera se vive más fuerte en Oak Cliff, West Dallas y Pleasant Grove. Desde una misa cerca de Jefferson Boulevard hasta fotos en Bishop Arts o el Kessler y una recepción en cualquier parte de la ciudad, fotografío todo el día como de verdad lo celebran las familias de Dallas: primero la iglesia, sin dejar nada fuera.",
      "Solo reservo una quinceañera al día. Eso significa que la celebración de tu hija tiene atención total, desde la primera foto en la iglesia hasta el último baile, no un huequito entre otros dos eventos.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en todo Dallas?",
        a: "Sí — todo Dallas, con un cariño especial por Oak Cliff, West Dallas y Pleasant Grove. Sin cargo por traslado en todo el metroplex. Iglesia, fotos y recepción, de principio a fin.",
      },
      {
        q: "¿Podemos hacer fotos en Bishop Arts u Oak Cliff?",
        a: "Sí — Bishop Arts y la zona del Kessler son fondos hermosos. Podemos hacer una sesión save-the-date ahí antes o acomodar las fotos en el itinerario del día.",
      },
    ],
  },
  {
    slug: "fort-worth",
    city: "Fort Worth",
    county: "Tarrant County",
    tier: "volume",
    areas: [
      "North Side / North Main",
      "the Stockyards",
      "Northside Mercado",
      "Cultural District",
      "Diamond Hill",
    ],
    lead: "Deep-rooted Northside tradition, from the parishes to the Stockyards.",
    intro: [
      "Fort Worth's Mexican-American community runs deep on the North Side — North Main, the Mercado, parishes that have celebrated quinceañeras for generations. I photograph the whole tradition here, from a morning misa to portraits near the Stockyards or the Cultural District and a reception on the west side of the metroplex.",
      "One celebration per day is my rule. Your quinceañera in Fort Worth gets a photographer who's fully there for la misa, el vals, the baile sorpresa, and every moment of the night — not divided across a packed Saturday.",
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
    leadEs: "Tradición arraigada del Northside, de las parroquias a los Stockyards.",
    introEs: [
      "La comunidad mexicana de Fort Worth se vive fuerte en el North Side — North Main, el Mercado, parroquias que han celebrado quinceañeras por generaciones. Aquí fotografío la tradición completa, desde una misa de mañana hasta fotos cerca de los Stockyards o el Cultural District y una recepción del lado oeste del metroplex.",
      "Una celebración al día es mi regla. Tu quinceañera en Fort Worth tiene un fotógrafo presente por completo para la misa, el vals, el baile sorpresa y cada momento de la noche, sin dividirse en un sábado saturado.",
    ],
    faqsEs: [
      {
        q: "¿Cubres quinceañeras en Fort Worth?",
        a: "Sí — Fort Worth y el Northside son parte de mi área principal, sin cargo por traslado. Fotografío todo el día, de la iglesia a la recepción, en cualquier parte de la ciudad.",
      },
      {
        q: "¿Podemos tomar fotos en los Stockyards?",
        a: "Sí — los Stockyards y el Cultural District son de los lugares favoritos para fotos en Fort Worth. Podemos planear una sesión save-the-date ahí o incluir las fotos en el itinerario.",
      },
    ],
  },
  {
    slug: "arlington",
    city: "Arlington",
    county: "Tarrant County",
    tier: "volume",
    areas: [
      "Entertainment District",
      "near AT&T Stadium & Globe Life",
      "South Arlington",
      "Central Arlington",
      "Lake Arlington",
    ],
    lead: "Centered in the metroplex, between Dallas and Fort Worth.",
    intro: [
      "Arlington sits right in the middle of DFW, with a large Mexican-American community and an Entertainment District that gives quinceañeras some unmistakable backdrops — AT&T Stadium and Globe Life Field a short drive from most receptions. From the church to portraits to the celebration, I photograph the full Arlington quinceañera day.",
      "Because I take just one quinceañera a day, your celebration is never competing for my attention. La misa, the portraits, el vals, and the reception — one photographer, all day, fully present.",
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
    leadEs: "En el centro del metroplex, entre Dallas y Fort Worth.",
    introEs: [
      "Arlington está justo en medio de DFW, con una comunidad mexicana grande y un Entertainment District que le da a las quinceañeras fondos inconfundibles: el AT&T Stadium y el Globe Life Field a unos minutos de la mayoría de los salones. De la iglesia a las fotos y a la celebración, fotografío todo el día de la quinceañera en Arlington.",
      "Como tomo una sola quinceañera al día, tu celebración nunca compite por mi atención. La misa, las fotos, el vals y la recepción: un fotógrafo, todo el día, presente por completo.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Arlington?",
        a: "Sí — Arlington está en el centro de mi área de Dallas–Fort Worth, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
      },
      {
        q: "¿Podemos hacer fotos en el Entertainment District?",
        a: "Sí — la zona del AT&T Stadium y el Globe Life es un fondo espectacular. Lo podemos planear como sesión save-the-date o incluirlo en el día.",
      },
    ],
  },
  {
    slug: "mansfield",
    city: "Mansfield",
    county: "Tarrant & Johnson counties",
    tier: "premium",
    areas: [
      "Historic Downtown Mansfield",
      "Walnut Creek",
      "near Mansfield National",
      "South Pointe",
      "Mansfield ISD area",
    ],
    lead: "Where DFW families go all-out on the celebration.",
    intro: [
      "Mansfield families tend to do a quinceañera in full — the complete day, the larger court, the cinematic film and album to match. It's exactly the celebration my Signature and Legacy collections are built for: two storytellers, the whole day, the long-form film and drone coverage that do a milestone like this justice.",
      "I book one quinceañera a day, so your celebration gets everything — la misa, portraits around Historic Downtown Mansfield or the Mansfield National area, el vals, and a reception captured start to finish, nothing rushed.",
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
    leadEs: "Donde las familias de DFW se lucen con la celebración.",
    introEs: [
      "Las familias de Mansfield suelen hacer la quinceañera en grande: el día completo, la corte más grande, el video cinematográfico y el álbum a la altura. Es justo la celebración para la que están hechas mis colecciones Signature y Legacy: dos narradores, todo el día, el video de larga duración y la toma con dron que le hacen justicia a un momento así.",
      "Reservo una quinceañera al día, así que tu celebración lo tiene todo: la misa, fotos por el Historic Downtown Mansfield o la zona de Mansfield National, el vals y una recepción capturada de principio a fin, sin prisas.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Mansfield?",
        a: "Sí — Mansfield es parte de mi área de Dallas–Fort Worth, sin cargo por traslado. Encaja perfecto con las colecciones Signature y Legacy, que cubren todo el día con video y álbum incluidos.",
      },
      {
        q: "¿Qué colección eligen la mayoría de las familias de Mansfield?",
        a: "La mayoría elige Signature ($3,900) por el día completo con foto y video, y muchas suben a Legacy ($5,500) por el video cinematográfico de larga duración, la toma con dron y un álbum premium. Mira todo lo que incluye cada una en la página de inversión.",
      },
    ],
  },
  {
    slug: "farmers-branch",
    city: "Farmers Branch",
    county: "Dallas County",
    tier: "premium",
    areas: [
      "Farmers Branch Historical Park",
      "Mustang Crossing",
      "The Branch",
      "Brookhaven",
      "near Mercer Crossing",
    ],
    lead: "An established community that celebrates in full.",
    intro: [
      "Farmers Branch pairs a strong, settled Mexican-American community with the means to do a quinceañera properly — and the families here tend to. From the church to portraits at the Historical Park or rose gardens and a full reception, I document the complete day the way it's meant to be remembered.",
      "One celebration per day means your quinceañera gets my full attention — la misa, el vals, the baile sorpresa, and the whole night. The Signature and Legacy collections are built for exactly this kind of all-day celebration.",
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
    leadEs: "Una comunidad establecida que celebra en grande.",
    introEs: [
      "Farmers Branch combina una comunidad mexicana fuerte y arraigada con los medios para hacer la quinceañera como se debe, y aquí las familias lo hacen. De la iglesia a las fotos en el Historical Park o los jardines de rosas y una recepción completa, documento todo el día como merece recordarse.",
      "Una celebración al día significa que tu quinceañera tiene toda mi atención: la misa, el vals, el baile sorpresa y toda la noche. Las colecciones Signature y Legacy están hechas justo para este tipo de celebración de día completo.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Farmers Branch?",
        a: "Sí — Farmers Branch es parte de mi área principal de DFW, sin cargo por traslado. Cubro todo el día, de la iglesia a la recepción, donde sea que celebres en la ciudad.",
      },
      {
        q: "¿Podemos hacer fotos en el Historical Park?",
        a: "Sí — el Farmers Branch Historical Park y los jardines de rosas son escenarios preciosos. Podemos planear una sesión save-the-date ahí o incluir las fotos en el día de la quinceañera.",
      },
    ],
  },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}

/** Up to `n` other cities for the "also serving" internal links. */
export function nearbyLocations(slug: string, n = 5): Location[] {
  return locations.filter((l) => l.slug !== slug).slice(0, n);
}
