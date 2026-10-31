/**
 * locations.ts — LOCAL SEO landing pages (one per DFW city we serve), bilingual.
 *
 * City selection is FACT-BASED, not a guess: each city pairs a large
 * Mexican-American family base (where quinces actually happen, by volume) with
 * household income that supports a package (prices live in src/lib/commission.ts
 * — never hardcode them here). "volume" cities are the booking engine; "premium"
 * cities (Mansfield, Farmers Branch and the Collin County trio of Frisco, Plano
 * and McKinney) skew to the larger package, the Trio.
 * (Source: 2024 Census/ACS city estimates — see the cities chosen and why in the
 * project notes.)
 *
 * English pages live at /quinceanera-photographer/<slug>; Spanish at
 * /es/fotografo-de-quinceaneras/<slug>. The Spanish set targets a market with
 * even less competition ("fotógrafo de quinceañera en <ciudad>"). Each page is
 * unique local content wrapped around the conversion flow — not a doorway page.
 */

import { BASE_CREW } from "@/lib/commission";
import { PT } from "@/lib/price-text";

const RETAINER_PCT = PT.deposit.percent;

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
      "Because I only book one quinceañera a day, your celebration gets my complete attention — la misa, the portraits, el vals, and the reception, start to finish. No rushing between two events, no crew split across two Saturdays.",
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
      "Como solo reservo una quinceañera al día, tu celebración tiene toda mi atención: la misa, las fotos, el vals y la recepción, de principio a fin. Sin correr entre dos eventos, sin un equipo repartido entre dos celebraciones.",
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
        a: "Absolutely. Williams Square and the Las Colinas canals make beautiful portrait backdrops. We can make them the setting for a portrait session before the celebration — the heart of the Portrait Session, and included in the Duo and the Trio as a dress or save-the-date session after the deposit — or fit portraits into the day's timeline.",
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
        a: "Claro que sí. Williams Square y los canales de Las Colinas son fondos preciosos. Ahí podemos hacer una sesión de retrato antes de la celebración —el corazón de la Sesión de retratos, e incluida en el Dúo y el Trío como sesión con el vestido o de save the date después del depósito— o acomodar las fotos en el itinerario del día.",
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
      "Booking one quinceañera a day is how I keep the quality where it should be. Your misa, your portraits, your entrada and vals and the celebration after — one team, fully present, the entire day.",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Garland?",
        a: "Yes — Garland is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
      },
      {
        q: "How early should Garland families book?",
        a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${PT.holdDays} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
      },
    ],
    leadEs: "Una de las comunidades más grandes y festivas del condado de Dallas.",
    introEs: [
      "Garland es una de las comunidades mexicanas más grandes del condado de Dallas, y se nota en cómo las familias hacen la quinceañera: cortes completas, días completos, sin saltarse nada. Desde las parroquias por el centro de Garland Square hasta las recepciones cerca de Firewheel y el lado de Lake Ray Hubbard, lo documento todo.",
      "Reservar una sola quinceañera al día es como mantengo la calidad donde debe estar. Tu misa, tus fotos, tu entrada y vals y la celebración después: un solo equipo, presente por completo, todo el día.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Garland?",
        a: "Sí — Garland es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
      },
      {
        q: "¿Con cuánta anticipación deben reservar las familias de Garland?",
        a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${PT.holdDays} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
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
        a: "Yes — Bishop Arts and the Kessler area make gorgeous portrait backdrops. We can shoot a portrait session there before the celebration or work portraits into the day's timeline.",
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
        a: "Sí — Bishop Arts y la zona del Kessler son fondos hermosos. Podemos hacer ahí una sesión de retrato antes de la celebración o acomodar las fotos en el itinerario del día.",
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
      "One celebration per day is my rule. Your quinceañera in Fort Worth gets a team that's fully there for la misa, el vals, the baile sorpresa, and every moment of the night — not divided across a packed Saturday.",
    ],
    faqs: [
      {
        q: "Do you cover quinceañeras in Fort Worth?",
        a: "Yes — Fort Worth and the Northside are part of my core service area with no travel fee. I photograph the full day, church through reception, anywhere in the city.",
      },
      {
        q: "Can we take portraits at the Stockyards?",
        a: "Yes — the Stockyards and the Cultural District are favorite Fort Worth portrait spots. We can plan a portrait session there before the celebration or fold portraits into the quinceañera timeline.",
      },
    ],
    leadEs: "Tradición arraigada del Northside, de las parroquias a los Stockyards.",
    introEs: [
      "La comunidad mexicana de Fort Worth se vive fuerte en el North Side — North Main, el Mercado, parroquias que han celebrado quinceañeras por generaciones. Aquí fotografío la tradición completa, desde una misa de mañana hasta fotos cerca de los Stockyards o el Cultural District y una recepción del lado oeste del metroplex.",
      "Una celebración al día es mi regla. Tu quinceañera en Fort Worth tiene un equipo presente por completo para la misa, el vals, el baile sorpresa y cada momento de la noche, sin dividirse en un sábado saturado.",
    ],
    faqsEs: [
      {
        q: "¿Cubres quinceañeras en Fort Worth?",
        a: "Sí — Fort Worth y el Northside son parte de mi área principal, sin cargo por traslado. Fotografío todo el día, de la iglesia a la recepción, en cualquier parte de la ciudad.",
      },
      {
        q: "¿Podemos tomar fotos en los Stockyards?",
        a: "Sí — los Stockyards y el Cultural District son de los lugares favoritos para fotos en Fort Worth. Podemos planear ahí una sesión de retrato antes de la celebración o incluir las fotos en el itinerario.",
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
      "Because I take just one quinceañera a day, your celebration is never competing for my attention. La misa, the portraits, el vals, and the reception — one team, all day, fully present.",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Arlington?",
        a: "Yes — Arlington is central to my Dallas–Fort Worth service area, no travel fee. Church, portraits, and reception, wherever in the city your day takes place.",
      },
      {
        q: "Can we shoot portraits in the Entertainment District?",
        a: "Yes — the area around AT&T Stadium and Globe Life makes a bold portrait backdrop. We can plan it as a portrait session before the celebration or work it into the day.",
      },
    ],
    leadEs: "En el centro del metroplex, entre Dallas y Fort Worth.",
    introEs: [
      "Arlington está justo en medio de DFW, con una comunidad mexicana grande y un Entertainment District que le da a las quinceañeras fondos inconfundibles: el AT&T Stadium y el Globe Life Field a unos minutos de la mayoría de los salones. De la iglesia a las fotos y a la celebración, fotografío todo el día de la quinceañera en Arlington.",
      "Como tomo una sola quinceañera al día, tu celebración nunca compite por mi atención. La misa, las fotos, el vals y la recepción: un solo equipo, todo el día, presente por completo.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Arlington?",
        a: "Sí — Arlington está en el centro de mi área de Dallas–Fort Worth, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
      },
      {
        q: "¿Podemos hacer fotos en el Entertainment District?",
        a: "Sí — la zona del AT&T Stadium y el Globe Life es un fondo espectacular. Lo podemos planear como sesión de retrato antes de la celebración o incluirlo en el día.",
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
      `Mansfield families tend to do a quinceañera in full — the complete day, the larger court, the video and the photo album to match. It's exactly the celebration the Trio is built for: a team of ${BASE_CREW.trio} — two photographers and a videographer — the full-length film of her whole day and a printed photo album that do a milestone like this justice.`,
      "I book one quinceañera a day, so your celebration gets everything — la misa, portraits around Historic Downtown Mansfield or the Mansfield National area, el vals, and a reception captured start to finish, nothing rushed.",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Mansfield?",
        a: "Yes — Mansfield is part of my Dallas–Fort Worth service area with no travel fee. It's a natural fit for the Trio, which covers the day with photos, video and a printed photo album included.",
      },
      {
        q: "Which package do you recommend for a Mansfield quinceañera?",
        a: `For most celebrations, the Trio (${PT.price.trio}) — ${PT.hours.trio} hours with a team of ${BASE_CREW.trio} (two photographers and a videographer), a dress or save-the-date session after the deposit, the full-length film of her whole day with a 3–5 minute highlight film, 700+ edited photos and a 40-page printed photo album. Families who want someone to run the day can add the Day-of Coordinator (${PT.addon.coordinator} a day). For a separate day of portraits in her dress, add the Second Portrait Day (${PT.addon.secondday}). Compare all three on our Packages & Prices page.`,
      },
    ],
    leadEs: "Donde las familias de DFW se lucen con la celebración.",
    introEs: [
      `Las familias de Mansfield suelen hacer la quinceañera en grande: el día completo, la corte más grande, el video y el álbum a la altura. Es justo la celebración para la que está hecho el Trío: un equipo de ${BASE_CREW.trio} personas —dos fotógrafos y un videógrafo—, el video completo de todo su día y un álbum de fotos impreso que le hacen justicia a un momento así.`,
      "Reservo una quinceañera al día, así que tu celebración lo tiene todo: la misa, fotos por el Historic Downtown Mansfield o la zona de Mansfield National, el vals y una recepción capturada de principio a fin, sin prisas.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Mansfield?",
        a: "Sí — Mansfield es parte de mi área de Dallas–Fort Worth, sin cargo por traslado. Encaja perfecto con el Trío, que cubre el día con fotos, video y un álbum de fotos impreso incluidos.",
      },
      {
        q: "¿Qué paquete recomiendas para una quinceañera en Mansfield?",
        a: `Para la mayoría de las celebraciones, el Trío (${PT.price.trio}): ${PT.hours.trio} horas con un equipo de ${BASE_CREW.trio} (dos fotógrafos y un videógrafo), una sesión con el vestido o de save the date después del depósito, el video completo de todo su día con un resumen de 3 a 5 minutos, más de 700 fotos editadas y un álbum de fotos impreso de 40 páginas. Si quieren a alguien que lleve el día, pueden sumar la Coordinadora del día (${PT.addon.coordinator} por día). Para un día aparte de retratos con su vestido, suma el Segundo día de retratos (${PT.addon.secondday}). Compara los tres en nuestra página de Paquetes y precios.`,
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
      "One celebration per day means your quinceañera gets my full attention — la misa, el vals, the baile sorpresa, and the whole night. The Trio — the package I recommend for most celebrations — puts two photographers and a videographer on exactly this kind of all-day celebration, and the Day-of Coordinator can be added to run the day.",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Farmers Branch?",
        a: "Yes — Farmers Branch is part of my core DFW service area with no travel fee. I cover the full day, church through reception, wherever in the city you celebrate.",
      },
      {
        q: "Can we do portraits at the Historical Park?",
        a: "Yes — the Farmers Branch Historical Park and rose gardens are beautiful portrait settings. We can plan a portrait session there before the celebration or build portraits into the quinceañera day.",
      },
    ],
    leadEs: "Una comunidad establecida que celebra en grande.",
    introEs: [
      "Farmers Branch combina una comunidad mexicana fuerte y arraigada con los medios para hacer la quinceañera como se debe, y aquí las familias lo hacen. De la iglesia a las fotos en el Historical Park o los jardines de rosas y una recepción completa, documento todo el día como merece recordarse.",
      "Una celebración al día significa que tu quinceañera tiene toda mi atención: la misa, el vals, el baile sorpresa y toda la noche. El Trío —el paquete que recomiendo para la mayoría de las celebraciones— pone a dos fotógrafos y un videógrafo justo en este tipo de celebración de día completo, y se puede sumar la Coordinadora del día para que lleve el día.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Farmers Branch?",
        a: "Sí — Farmers Branch es parte de mi área principal de DFW, sin cargo por traslado. Cubro todo el día, de la iglesia a la recepción, donde sea que celebres en la ciudad.",
      },
      {
        q: "¿Podemos hacer fotos en el Historical Park?",
        a: "Sí — el Farmers Branch Historical Park y los jardines de rosas son escenarios preciosos. Podemos planear ahí una sesión de retrato antes de la celebración o incluir las fotos en el día de la quinceañera.",
      },
    ],
  },
  {
    slug: "frisco",
    city: "Frisco",
    county: "Collin & Denton counties",
    tier: "premium",
    areas: [
      "The Star in Frisco",
      "Frisco Square",
      "the Rail District",
      "Stonebriar",
      "the PGA Frisco area",
    ],
    lead: "Where the quinceañera is planned like a destination celebration.",
    intro: [
      "Frisco families tend to plan a quinceañera the way other cities plan a destination wedding — a hotel or resort ballroom, a full court, relatives driving up from across Texas for the weekend. From a morning misa to portraits around The Star or Frisco Square and a reception off the Dallas North Tollway, I photograph the whole tradition, set against the newest backdrops in the metroplex.",
      `Because I take one quinceañera a day, a Frisco celebration gets the full crew and the full day. The Trio (${PT.price.trio}) is the package I recommend for most families here — ${PT.hours.trio} hours of photo and video with two photographers and a videographer, a dress or save-the-date session after the deposit and a printed photo album. A coordinator who runs the day can be added for ${PT.addon.coordinator} a day.`,
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Frisco?",
        a: "Yes — Frisco is part of my Dallas–Fort Worth service area, on both the Collin and Denton County sides, with no travel fee. I cover the church, the portraits and the reception wherever your day takes us.",
      },
      {
        q: "Can we do portraits at The Star or Frisco Square?",
        a: "Yes — The Star's plazas and the civic grounds around Frisco Square both make polished, modern portrait backdrops. We can plan them as the portrait session before the celebration or build them into the day's timeline.",
      },
    ],
    leadEs: "Donde la quinceañera se planea como una celebración de destino.",
    introEs: [
      "Las familias de Frisco suelen planear la quinceañera como en otras ciudades se planea una boda de destino: un salón de hotel o de resort, la corte completa y parientes que llegan de todo Texas para el fin de semana. Desde la misa de la mañana hasta las fotos por The Star o Frisco Square y una recepción junto al Dallas North Tollway, fotografío la tradición completa con los fondos más nuevos del metroplex.",
      `Como tomo una sola quinceañera al día, una celebración en Frisco tiene al equipo completo todo el día. El Trío (${PT.price.trio}) es el paquete que recomiendo para la mayoría de las familias aquí: ${PT.hours.trio} horas de foto y video con dos fotógrafos y un videógrafo, una sesión con el vestido o de save the date después del depósito y un álbum de fotos impreso. Se puede sumar una coordinadora que lleve el día por ${PT.addon.coordinator} por día.`,
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Frisco?",
        a: "Sí — Frisco es parte de mi área de Dallas–Fort Worth, tanto del lado de Collin como de Denton, sin cargo por traslado. Cubro la iglesia, las fotos y la recepción donde sea que se celebre tu día.",
      },
      {
        q: "¿Podemos hacer fotos en The Star o en Frisco Square?",
        a: "Sí — las plazas de The Star y los jardines cívicos de Frisco Square son fondos modernos y elegantes. Los podemos planear como la sesión de retrato antes de la celebración o acomodarlos en el itinerario del día.",
      },
    ],
  },
  {
    slug: "plano",
    city: "Plano",
    county: "Collin County",
    tier: "premium",
    areas: [
      "Historic Downtown Plano",
      "Legacy West",
      "Arbor Hills Nature Preserve",
      "Oak Point Park",
      "east Plano",
    ],
    lead: "From the brick of Historic Downtown to the ballrooms of Legacy West.",
    intro: [
      "Plano is really two cities, and a quinceañera here usually touches both — the older east side around Historic Downtown and 15th Street, home to much of the city's Hispanic community, and the west side of Legacy West and the corporate campuses, where the hotel ballrooms are. From a misa on the east side to portraits at Arbor Hills Nature Preserve and a reception near the tollway, I photograph the day the way Plano families actually plan it.",
      `One quinceañera a day means yours is the only thing on my calendar — la misa, the portraits, el vals and the whole reception. For a day that runs from downtown to Legacy, I recommend the Trio (${PT.price.trio}), with photos and video by one team and a printed photo album at the end.`,
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in Plano?",
        a: "Yes — Plano is part of my core Dallas–Fort Worth service area with no travel fee, east side and west side alike. Church, portraits and reception, start to finish.",
      },
      {
        q: "Can we take portraits in Historic Downtown Plano or at Arbor Hills?",
        a: "Yes — the brick storefronts of 15th Street and the prairie trails of Arbor Hills Nature Preserve are two of my favorite Plano settings, and they pair well in a single session. We can plan them before the celebration or fold them into the day.",
      },
    ],
    leadEs: "Del ladrillo del Historic Downtown a los salones de Legacy West.",
    introEs: [
      "Plano en realidad son dos ciudades, y una quinceañera aquí casi siempre toca las dos: el lado este, más antiguo, alrededor del Historic Downtown y la calle 15, donde vive buena parte de la comunidad hispana de la ciudad, y el lado oeste de Legacy West y los corporativos, donde están los salones de hotel. Desde una misa en el lado este hasta las fotos en Arbor Hills Nature Preserve y una recepción cerca del tollway, fotografío el día como de verdad lo planean las familias de Plano.",
      `Una sola quinceañera al día significa que la tuya es lo único en mi calendario: la misa, las fotos, el vals y toda la recepción. Para un día que va del centro a Legacy, recomiendo el Trío (${PT.price.trio}), con fotos y video de un solo equipo y un álbum de fotos impreso al final.`,
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en Plano?",
        a: "Sí — Plano es parte de mi área principal de Dallas–Fort Worth, sin cargo por traslado, lo mismo en el lado este que en el oeste. Iglesia, fotos y recepción, de principio a fin.",
      },
      {
        q: "¿Podemos hacer fotos en el Historic Downtown de Plano o en Arbor Hills?",
        a: "Sí — las fachadas de ladrillo de la calle 15 y los senderos de pradera de Arbor Hills Nature Preserve son dos de mis lugares favoritos en Plano, y combinan bien en una sola sesión. Los podemos planear antes de la celebración o acomodarlos en el día.",
      },
    ],
  },
  {
    slug: "mckinney",
    city: "McKinney",
    county: "Collin County",
    tier: "premium",
    areas: [
      "Historic Downtown McKinney",
      "Chestnut Square",
      "Adriatica Village",
      "Towne Lake",
      "Craig Ranch",
    ],
    lead: "A hometown square, a growing city, and a celebration done in full.",
    intro: [
      "McKinney has what most of Collin County doesn't: a real historic downtown, built around the old county courthouse on the square, with long-rooted families on the east side and newer ones arriving every year. A McKinney quinceañera often feels like a hometown celebration — the parish, portraits on the square or at Chestnut Square, a reception out toward Craig Ranch — and I photograph every part of it.",
      `I book one quinceañera a day, so your celebration gets the whole crew from the first church frame to the last dance. For most McKinney families I recommend the Trio (${PT.price.trio}), with a printed album included, and the Day-of Coordinator (${PT.addon.coordinator} a day) when you want someone to run the day; for portraits alone, the Portrait Session (${PT.price.study}) is a ${PT.hours.study}-hour session with one photographer.`,
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras in McKinney?",
        a: "Yes — McKinney is part of my Dallas–Fort Worth service area with no travel fee. I cover the full day, church through reception, anywhere in the city.",
      },
      {
        q: "Can we do portraits on the downtown square or at Adriatica?",
        a: "Yes — the brick storefronts around the downtown square and the stone lanes and bell tower of Adriatica Village give you two very different looks in one city. We can plan them as a portrait session before the celebration or work them into the day.",
      },
    ],
    leadEs: "Una plaza de pueblo, una ciudad que crece y una celebración completa.",
    introEs: [
      "McKinney tiene lo que casi nadie más tiene en el condado de Collin: un centro histórico de verdad, alrededor del antiguo juzgado del condado en la plaza, con familias de raíces hondas en el lado este y nuevas que llegan cada año. Una quinceañera en McKinney muchas veces se siente como una fiesta de pueblo —la parroquia, fotos en la plaza o en Chestnut Square, la recepción rumbo a Craig Ranch— y yo fotografío cada parte.",
      `Reservo una quinceañera al día, así que tu celebración tiene al equipo completo desde la primera foto en la iglesia hasta el último baile. Para la mayoría de las familias de McKinney recomiendo el Trío (${PT.price.trio}), con álbum impreso incluido, y la Coordinadora del día (${PT.addon.coordinator} por día) si quieres a alguien que lleve el día; si solo quieres retratos, la Sesión de retratos (${PT.price.study}) es una sesión de ${PT.hours.study} h con un fotógrafo.`,
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en McKinney?",
        a: "Sí — McKinney es parte de mi área de Dallas–Fort Worth, sin cargo por traslado. Cubro todo el día, de la iglesia a la recepción, en cualquier parte de la ciudad.",
      },
      {
        q: "¿Podemos hacer fotos en la plaza del centro o en Adriatica?",
        a: "Sí — las fachadas de ladrillo alrededor de la plaza y los callejones de piedra y el campanario de Adriatica Village te dan dos estilos muy distintos en una misma ciudad. Los podemos planear como sesión de retrato antes de la celebración o acomodarlos en el día.",
      },
    ],
  },
];

/** Public city centroids (lat/lon) for ProfessionalService `geo` structured data. */
export const cityGeo: Record<string, { lat: number; lon: number }> = {
  "grand-prairie": { lat: 32.7459, lon: -96.9978 },
  irving: { lat: 32.814, lon: -96.9489 },
  garland: { lat: 32.9126, lon: -96.6389 },
  dallas: { lat: 32.7767, lon: -96.797 },
  "fort-worth": { lat: 32.7555, lon: -97.3308 },
  arlington: { lat: 32.7357, lon: -97.1081 },
  mansfield: { lat: 32.5632, lon: -97.1417 },
  "farmers-branch": { lat: 32.9265, lon: -96.8961 },
  frisco: { lat: 33.1507, lon: -96.8236 },
  plano: { lat: 33.0198, lon: -96.6989 },
  mckinney: { lat: 33.1972, lon: -96.6398 },
};

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}

/**
 * Other cities for the "also serving" internal links. Defaults to the FULL set
 * (every other city) so the reciprocal link graph is complete — a fixed
 * slice(0,5) silently starved the tail cities (Mansfield, Farmers Branch and
 * now Frisco, Plano, McKinney) from every page. `n` stays optional for any caller that wants a cap.
 */
export function nearbyLocations(slug: string, n = locations.length): Location[] {
  return locations.filter((l) => l.slug !== slug).slice(0, n);
}
