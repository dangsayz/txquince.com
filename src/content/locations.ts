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

  // English. intro is a variable-length set of paragraphs ON PURPOSE — each
  // city is written in its own voice and runs its own length, so these pages
  // never read like one template with the name swapped out.
  lead: string;
  intro: string[];
  faqs: CityFaq[];

  // Spanish (natural Mexican Spanish, not a literal translation)
  leadEs: string;
  introEs: string[];
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
    lead: "Oak Cliff, West Dallas, Pleasant Grove — where the DFW quinceañera grew up.",
    intro: [
      "If your family is from Oak Cliff, you already know Jefferson Boulevard. The dress shops, the panaderías, the photo studios that have been making quinceañera portraits on that strip since the late 1970s — that corridor has been the heart of the Dallas quince for longer than most photographers have been alive. I shoot here all the time, and I shoot it with respect for what it is: the largest, oldest Mexican-American community in North Texas, where families still do the day in full and the church still comes first.",
      "A Dallas quince day moves fast, and it moves across the whole city — a morning misa near Jefferson or in West Dallas, portraits in Bishop Arts or down at the Kessler, then a reception anywhere from Pleasant Grove to a downtown hall. The thing families tell me they regret most about a past event isn't the venue or the dress. It's the moments the photographer missed because he was rushing or watching the clock. The entrada, the vals, your dad's face during the brindis — those happen once, and they happen fast.",
      "That's why I only take one quinceañera a day. Your Saturday is the only thing on my calendar — no leaving early for a second event, no rushing the timeline. We build a shot list together beforehand so nothing important slips past, and I actually direct your court and your family, so the photos look like you instead of stiff and generic.",
    ],
    faqs: [
      {
        q: "Do you photograph quinceañeras across Dallas?",
        a: "Yes — all of Dallas, and especially the neighborhoods where the tradition runs deepest: Oak Cliff, West Dallas, and Pleasant Grove. No travel fee anywhere in the city. I cover the full day, from the first church photo to the last dance.",
      },
      {
        q: "Do you know the photo rules at Dallas Catholic churches?",
        a: "Yes. Most parishes in the Diocese of Dallas ask the photographer to hang back during the Mass — no walking the aisles, no flash during the liturgy. I've shot these churches long enough to catch the moments that matter — the entrada, the kneeling, the blessing — without stepping on the celebration or getting a talking-to from the priest. Tell me which parish you're at and I'll already know the room.",
      },
      {
        q: "Where do Dallas families take quinceañera portraits?",
        a: "Bishop Arts and the Kessler are the classic Oak Cliff backdrops, and Jefferson Boulevard itself — the murals, the old marquee signs — makes for portraits that actually feel like home. We can shoot a save-the-date session ahead of time or fold portraits into the day. Tell me what feels like your Dallas and we'll build around it.",
      },
    ],
    leadEs: "Oak Cliff, West Dallas, Pleasant Grove — donde creció la quinceañera de DFW.",
    introEs: [
      "Si tu familia es de Oak Cliff, ya conoces Jefferson Boulevard. Las tiendas de vestidos, las panaderías, los estudios de fotografía que han hecho retratos de quinceañera en esa calle desde finales de los años setenta — ese corredor ha sido el corazón de la quince en Dallas desde antes de que muchos fotógrafos nacieran. Aquí fotografío seguido, y lo hago con respeto por lo que es: la comunidad mexicana más grande y antigua del norte de Texas, donde las familias todavía hacen el día completo y la iglesia sigue siendo lo primero.",
      "Un día de quince en Dallas va rápido, y va por toda la ciudad — una misa de mañana cerca de Jefferson o en West Dallas, fotos en Bishop Arts o en el Kessler, y luego una recepción que puede estar desde Pleasant Grove hasta un salón del downtown. Lo que más me dicen las familias que lamentan de un evento pasado no es el salón ni el vestido. Son los momentos que el fotógrafo dejó pasar por andar de prisa o pendiente del reloj. La entrada, el vals, la cara de tu papá en el brindis — eso pasa una sola vez, y pasa rápido.",
      "Por eso solo tomo una quinceañera al día. Tu sábado es lo único en mi calendario — sin irse temprano a otro evento, sin apurar el itinerario. Armamos juntos una lista de fotos antes del día para que no se escape nada importante, y de verdad dirijo a tu corte y a tu familia, para que las fotos se vean como ustedes y no tiesas y genéricas.",
    ],
    faqsEs: [
      {
        q: "¿Fotografías quinceañeras en todo Dallas?",
        a: "Sí — todo Dallas, y en especial los barrios donde la tradición se vive más fuerte: Oak Cliff, West Dallas y Pleasant Grove. Sin cargo por traslado en toda la ciudad. Cubro el día completo, desde la primera foto en la iglesia hasta el último baile.",
      },
      {
        q: "¿Conoces las reglas de fotos en las iglesias católicas de Dallas?",
        a: "Sí. La mayoría de las parroquias de la Diócesis de Dallas piden que el fotógrafo se mantenga atrás durante la misa — sin caminar por los pasillos, sin flash durante la liturgia. Llevo suficiente tiempo fotografiando en estas iglesias para captar los momentos que importan — la entrada, cuando se arrodilla, la bendición — sin estorbar la celebración ni que el padre me llame la atención. Dime en qué parroquia es y ya conozco el lugar.",
      },
      {
        q: "¿Dónde hacen las fotos las familias de Dallas?",
        a: "Bishop Arts y el Kessler son los fondos clásicos de Oak Cliff, y el mismo Jefferson Boulevard — los murales, los letreros viejos — da fotos que de verdad se sienten como en casa. Podemos hacer una sesión save-the-date antes o acomodar las fotos en el día. Dime qué se siente como tu Dallas y armamos todo alrededor de eso.",
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
    lead: "Mansfield families don't cut corners on the day — and neither do I.",
    intro: [
      "Mansfield has grown into one of the most prosperous corners of the metroplex, and the quinceañeras here reflect it — bigger courts, full-day celebrations, a film and album to match. When a family puts this much into a single day, the photography can't be the afterthought. This is exactly what my Signature and Legacy collections are built for: two storytellers, the whole day, a cinematic film and a real printed album — not a USB stick and a handshake.",
      "What sets a Mansfield quince apart is how put-together the day is, and a day that organized deserves a photographer who isn't scrambling. I take one celebration a day, so I'm there from the misa through the last song — never watching the clock to get to a second event. We'll find the right light around Historic Downtown Mansfield or Oliver Nature Park for portraits, keep the timeline calm, and you'll have your gallery back when I promise it, not three months later.",
    ],
    faqs: [
      {
        q: "Which collection do most Mansfield families choose?",
        a: "Most go with Signature ($3,900) for the full day with photo and film, and a good number step up to Legacy ($5,500) for the long-form cinematic film, drone coverage, and a premium album. For the way families here do a quince, those two are the natural fit — see exactly what's included on the investment page.",
      },
      {
        q: "Will you stay for the whole reception?",
        a: "Yes — and it's worth asking every photographer you talk to. Because I only book one quinceañera a day, I'm not slipping out of your reception early to make a second event. Signature and Legacy both cover the full day, so the baile sorpresa, the last dance, and the send-off all make the gallery — not cut off at hour six.",
      },
      {
        q: "How long until we get the photos and film?",
        a: "Galleries come back in a few weeks, not the months some families end up waiting. Late delivery is one of the most common quinceañera complaints out there, so I keep my calendar light enough to actually edit and deliver on time. You'll get a sneak peek first, then the full gallery and film.",
      },
    ],
    leadEs: "Las familias de Mansfield no escatiman en el día — y yo tampoco.",
    introEs: [
      "Mansfield se ha convertido en una de las zonas más prósperas del metroplex, y las quinceañeras aquí lo reflejan — cortes más grandes, celebraciones de día completo, un video y un álbum a la altura. Cuando una familia invierte tanto en un solo día, la fotografía no puede ser lo último en la lista. Para esto están hechas mis colecciones Signature y Legacy: dos narradores, todo el día, un video cinematográfico y un álbum impreso de verdad — no una memoria USB y un apretón de manos.",
      "Lo que distingue a una quince en Mansfield es lo bien organizado que está el día, y un día así de cuidado merece un fotógrafo que no ande corriendo. Tomo una sola celebración al día, así que estoy presente desde la misa hasta la última canción — sin ver el reloj para llegar a otro evento. Buscamos la luz adecuada por el Historic Downtown Mansfield o el Oliver Nature Park para las fotos, mantenemos el itinerario tranquilo, y tendrás tu galería cuando te la prometo, no tres meses después.",
    ],
    faqsEs: [
      {
        q: "¿Qué colección eligen la mayoría de las familias de Mansfield?",
        a: "La mayoría elige Signature ($3,900) por el día completo con foto y video, y muchas suben a Legacy ($5,500) por el video cinematográfico de larga duración, la toma con dron y un álbum premium. Por cómo hacen la quince las familias de aquí, esas dos son la opción natural — mira todo lo que incluye cada una en la página de inversión.",
      },
      {
        q: "¿Te quedas toda la recepción?",
        a: "Sí — y vale la pena preguntárselo a cada fotógrafo que entrevistes. Como solo reservo una quinceañera al día, no me salgo temprano de tu recepción para llegar a otro evento. Signature y Legacy cubren el día completo, así que el baile sorpresa, el último baile y la despedida quedan todos en la galería — no cortados a la sexta hora.",
      },
      {
        q: "¿Cuánto tardan en llegar las fotos y el video?",
        a: "Las galerías llegan en unas semanas, no en los meses que algunas familias terminan esperando. La entrega tardía es una de las quejas más comunes sobre las quinceañeras, así que mantengo mi calendario ligero para de verdad editar y entregar a tiempo. Primero recibes un adelanto, luego la galería completa y el video.",
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
