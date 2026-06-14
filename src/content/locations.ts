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
    lead: "Dead center of the metroplex, with a foot in two counties.",
    intro: [
      "Grand Prairie has a quirk that shapes every quinceañera here: it straddles the Dallas–Tarrant county line, so families pull their church from one side of town and their reception from the other without thinking twice. The misa might be off Pioneer Parkway, portraits out by Joe Pool Lake, and the party in one of the ballrooms at EpicCentral or a hall near Lone Star Park — a day that can cover fifteen or twenty miles before the last dance.",
      "That's the part a lot of photographers underestimate. I plan a Grand Prairie quince around the drive times, not just the schedule — building real cushion between the church and the venue so nobody's speeding across 161 in a ball gown, and so the portraits don't get cut because we ran behind. Send me your church and your hall when you reach out and I'll map the whole route before we set a single time.",
    ],
    faqs: [
      {
        q: "My church and reception are on opposite sides of town — can you handle that?",
        a: "That's a normal Grand Prairie day, and yes. I build the timeline around the actual drive between your parish and your venue — whether that's the Pioneer Parkway corridor, EpicCentral, or out toward Joe Pool Lake — with real cushion baked in so the portraits never get squeezed when traffic runs heavy.",
      },
      {
        q: "Where do Grand Prairie families usually hold the reception?",
        a: "All over — the ballrooms at The Summit in EpicCentral, halls along Highway 161, event spaces at Lone Star Park, the lakeside spots near Joe Pool. Tell me where you've booked and I'll already know the room and the light.",
      },
    ],
    leadEs: "Justo en el centro del metroplex, con un pie en dos condados.",
    introEs: [
      "Grand Prairie tiene una particularidad que marca cada quinceañera de aquí: está partida por la línea de los condados de Dallas y Tarrant, así que las familias agarran la iglesia de un lado y el salón del otro sin pensarlo. La misa puede ser por Pioneer Parkway, las fotos junto a Joe Pool Lake, y la fiesta en uno de los salones de EpicCentral o cerca de Lone Star Park — un día que recorre quince o veinte millas antes del último baile.",
      "Eso es lo que muchos fotógrafos no calculan bien. Yo armo la quince en Grand Prairie pensando en los tiempos de traslado, no solo en el horario — dejando espacio de verdad entre la iglesia y el salón para que nadie ande corriendo por la 161 con vestido de gala, y para que las fotos no se recorten por andar atrasados. Mándame tu iglesia y tu salón cuando me escribas y te armo toda la ruta antes de fijar una sola hora.",
    ],
    faqsEs: [
      {
        q: "Mi iglesia y mi salón están en lados opuestos de la ciudad — ¿puedes con eso?",
        a: "Ese es un día normal en Grand Prairie, y sí. Armo el itinerario alrededor del traslado real entre tu parroquia y tu salón — sea el corredor de Pioneer Parkway, EpicCentral o por Joe Pool Lake — con tiempo de sobra para que las fotos nunca se aprieten cuando hay tráfico.",
      },
      {
        q: "¿Dónde hacen la recepción las familias de Grand Prairie?",
        a: "En todos lados — los salones de The Summit en EpicCentral, lugares por la Highway 161, los espacios de Lone Star Park, los puntos junto a Joe Pool Lake. Dime dónde reservaste y ya conozco el lugar y la luz.",
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
    lead: "Two cities in one — humble parishes in the south, glass towers in Las Colinas.",
    intro: [
      "Irving gives a quinceañera two completely different backdrops in the same afternoon. The morning belongs to South Irving — the panaderías, the markets, the small parishes that have blessed this community for generations, where the misa feels close and familiar. Then the portraits move north to Las Colinas, and suddenly you're standing in front of the Mustangs at Williams Square or along the canals, glass towers behind you. Same girl, same day, two completely different kinds of beautiful.",
      "Shooting Irving well means handling both — the soft, low light of an older sanctuary and the wide-open midday glare off the Las Colinas water. I light for the church I'm in and the plaza we walk out to, and I plan enough room in the timeline to actually get to Williams Square before the light goes flat.",
    ],
    faqs: [
      {
        q: "Can we take quinceañera photos at the Mustangs of Las Colinas?",
        a: "Yes — the Mustangs at Williams Square are one of the best portrait backdrops in the whole metroplex, nine bronze horses mid-stride through the fountains. The renovated plaza and the Las Colinas canals nearby give us a few different looks in one stop. Mornings and late afternoon are kindest to the light there, and I'll plan around it.",
      },
      {
        q: "Do you also cover the church side in South Irving?",
        a: "Of course. South Irving is the heart of the community and its parishes are where most of these days begin. I photograph the full day from the church through the reception, whether the party's in Las Colinas, at the Toyota Music Factory, or a neighborhood salón.",
      },
      {
        q: "Can we do the Las Colinas portraits before the day instead?",
        a: "Absolutely — a lot of Irving families do a save-the-date session at Williams Square or the canals weeks ahead, so the day itself stays relaxed. We can also fold them into the timeline if you'd rather keep it all to one day.",
      },
    ],
    leadEs: "Dos ciudades en una — las parroquias humildes del sur y las torres de Las Colinas.",
    introEs: [
      "Irving le da a una quinceañera dos fondos completamente distintos en la misma tarde. La mañana es del sur de Irving — las panaderías, los mercados, las parroquias chicas que han bendecido a esta comunidad por generaciones, donde la misa se siente cercana y familiar. Luego las fotos se mueven al norte, a Las Colinas, y de repente estás frente a los Mustangs de Williams Square o por los canales, con las torres de vidrio detrás. La misma muchacha, el mismo día, dos formas completamente distintas de verse hermosa.",
      "Fotografiar bien Irving es saber con los dos — la luz suave y baja de un santuario viejo y el reflejo abierto del mediodía sobre el agua de Las Colinas. Yo ilumino según la iglesia en la que estoy y la plaza a la que salimos, y dejo suficiente tiempo en el itinerario para llegar a Williams Square antes de que la luz se aplane.",
    ],
    faqsEs: [
      {
        q: "¿Podemos hacer fotos en los Mustangs de Las Colinas?",
        a: "Sí — los Mustangs de Williams Square son uno de los mejores fondos de todo el metroplex, nueve caballos de bronce a media carrera entre las fuentes. La plaza renovada y los canales de Las Colinas dan varios escenarios en una sola parada. La mañana y la tarde son las mejores horas para la luz ahí, y lo planeo alrededor de eso.",
      },
      {
        q: "¿También cubres la parte de la iglesia en el sur de Irving?",
        a: "Claro. El sur de Irving es el corazón de la comunidad y sus parroquias son donde empiezan la mayoría de estos días. Fotografío el día completo, de la iglesia a la recepción, ya sea que la fiesta esté en Las Colinas, en el Toyota Music Factory o en un salón del barrio.",
      },
      {
        q: "¿Podemos hacer las fotos de Las Colinas antes del día?",
        a: "Por supuesto — muchas familias de Irving hacen una sesión save-the-date en Williams Square o los canales semanas antes, para que el día en sí esté tranquilo. También las podemos acomodar en el itinerario si prefieres dejarlo todo para un día.",
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
    lead: "Big family, big court, big guest list — Garland does a quince in full.",
    intro: [
      "Garland is one of the largest communities in Dallas County, and it shows in how families here do a quinceañera. Big courts. Long guest lists. Halls built to hold three, four, eight hundred people. Nothing about a Garland quince is small, and the photography shouldn't be either.",
      "That scale is exactly why booking early matters here more than almost anywhere. The few halls in town that can actually seat 800 — the Garland Convention Center, the bigger spaces near Firewheel — fill their Saturdays a year out. The good photographers go the same way. If your date is set, lock it down.",
      "When your day comes, you get a photographer who's all in on it — one quince on the calendar, the whole day, from the parishes around Garland Square to the reception out by Lake Ray Hubbard. With a guest list that big and a court that full, the last thing you want is someone splitting attention between two events.",
    ],
    faqs: [
      {
        q: "How far ahead should Garland families book?",
        a: "Earlier than you'd think. The large halls here — the ones that can seat a 500- or 800-person reception — book their Saturdays close to a year out, and once your venue and date are set, the photographer is the next thing to lock in before the good ones are gone.",
      },
      {
        q: "We're having a big reception with a full court. Can one photographer handle it?",
        a: "Yes — and a big Garland reception is exactly where it pays to have someone who plans for it. I map the room and the court ahead of time so the entrada, the vals, and every table get covered, and the Signature collection adds a second shooter so nothing in a packed hall slips past.",
      },
    ],
    leadEs: "Familia grande, corte grande, lista de invitados grande — Garland hace la quince completa.",
    introEs: [
      "Garland es una de las comunidades más grandes del condado de Dallas, y se nota en cómo hacen aquí la quinceañera. Cortes grandes. Listas de invitados largas. Salones hechos para trescientas, cuatrocientas, ochocientas personas. Nada de una quince en Garland es chico, y la fotografía tampoco debería serlo.",
      "Justo por ese tamaño, reservar con tiempo importa aquí más que en casi cualquier otro lado. Los pocos salones del pueblo que de verdad caben 800 personas — el Garland Convention Center, los espacios grandes cerca de Firewheel — llenan sus sábados con un año de anticipación. Los buenos fotógrafos se van igual de rápido. Si ya tienes fecha, apártala.",
      "Cuando llega tu día, tienes un fotógrafo metido por completo en él — una sola quince en el calendario, todo el día, desde las parroquias por Garland Square hasta la recepción por Lake Ray Hubbard. Con una lista de invitados así de grande y una corte así de completa, lo último que quieres es a alguien dividiendo su atención entre dos eventos.",
    ],
    faqsEs: [
      {
        q: "¿Con cuánta anticipación deben reservar las familias de Garland?",
        a: "Antes de lo que crees. Los salones grandes de aquí — los que caben una recepción de 500 u 800 personas — apartan sus sábados casi con un año de anticipación, y una vez que tienes salón y fecha, el fotógrafo es lo siguiente que hay que apartar antes de que se vayan los buenos.",
      },
      {
        q: "Vamos a hacer una recepción grande con corte completa. ¿Un solo fotógrafo puede con eso?",
        a: "Sí — y una recepción grande en Garland es justo donde conviene tener a alguien que lo planea. Estudio el salón y la corte de antemano para que la entrada, el vals y cada mesa queden cubiertos, y la colección Signature suma un segundo fotógrafo para que en un salón lleno no se escape nada.",
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
    lead: "Northside roots and Stockyards light — a Fort Worth quince has its own flavor.",
    intro: [
      "Fort Worth doesn't do a quinceañera the way Dallas does, and I mean that as a compliment to both. The tradition here lives on the North Side — North Main, the Mercado, the parishes that have carried Mexican-American families through generations of baptisms, weddings, and quinces. It's tight-knit and it's proud, and the celebrations carry a little of that Cowtown character you won't find across the metroplex.",
      "And then there's the Stockyards — maybe the best portrait backdrop in North Texas, all brick streets, cattle pens, and old marquees, but only if you know how to shoot it. Midday the sun comes off that brick hard and the tourists are everywhere. I shoot the Stockyards early or in the last hour of light, working the shaded alleys and quiet corners, so your portraits get the Western character without the harsh glare or a stranger in every frame.",
    ],
    faqs: [
      {
        q: "When's the best time to shoot quinceañera portraits at the Stockyards?",
        a: "Early morning or the hour before sunset — not midday. The Stockyards get hot, bright, and packed with tourists in the middle of the day, and that brick throws harsh light. Shooting at the edges of the day gives you soft light, thinner crowds, and clean backgrounds in the alleys and side streets.",
      },
      {
        q: "Do you cover quinceañeras on the North Side?",
        a: "Yes — the North Side is home base for the Fort Worth quince, and I photograph the full day there, from a morning misa near North Main through the reception, wherever in the city it lands.",
      },
      {
        q: "Can we do the church on the North Side and portraits at the Stockyards the same day?",
        a: "Easily — they're minutes apart, which is part of what makes Fort Worth such a good quince city. We can go straight from the parish to the Stockyards for portraits, then on to your reception, all without crossing the metroplex.",
      },
    ],
    leadEs: "Raíces del Northside y la luz de los Stockyards — la quince de Fort Worth tiene su propio sabor.",
    introEs: [
      "Fort Worth no hace la quinceañera como Dallas, y lo digo como un cumplido para las dos. Aquí la tradición vive en el North Side — North Main, el Mercado, las parroquias que han acompañado a las familias mexicanas por generaciones de bautizos, bodas y quinces. Es una comunidad unida y orgullosa, y las celebraciones cargan algo de ese carácter de Cowtown que no encuentras en el resto del metroplex.",
      "Y luego están los Stockyards — quizás el mejor fondo para fotos del norte de Texas, con sus calles de ladrillo, los corrales y los letreros viejos, pero solo si sabes cómo fotografiarlo. Al mediodía el sol pega duro contra ese ladrillo y los turistas están por todos lados. Yo fotografío los Stockyards temprano o en la última hora de luz, aprovechando los callejones con sombra y los rincones tranquilos, para que tus fotos tengan el carácter del Oeste sin el reflejo fuerte ni un extraño en cada toma.",
    ],
    faqsEs: [
      {
        q: "¿Cuál es la mejor hora para hacer fotos de quinceañera en los Stockyards?",
        a: "Temprano por la mañana o la hora antes del atardecer — no al mediodía. Los Stockyards se ponen calientes, brillantes y llenos de turistas a media tarde, y ese ladrillo avienta una luz dura. Fotografiar en las orillas del día te da luz suave, menos gente y fondos limpios en los callejones y calles laterales.",
      },
      {
        q: "¿Cubres quinceañeras en el North Side?",
        a: "Sí — el North Side es la base de la quince en Fort Worth, y ahí fotografío el día completo, desde una misa de mañana cerca de North Main hasta la recepción, donde sea que caiga en la ciudad.",
      },
      {
        q: "¿Podemos hacer la iglesia en el North Side y las fotos en los Stockyards el mismo día?",
        a: "Fácil — están a minutos, y eso es parte de lo que hace a Fort Worth tan buena ciudad para una quince. Podemos ir directo de la parroquia a los Stockyards para las fotos, y luego a tu recepción, todo sin cruzar el metroplex.",
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
    lead: "Right in the middle of it all, with backdrops the size of a stadium.",
    intro: [
      "Arlington sits dead center between Dallas and Fort Worth, which makes it the easy choice for families with relatives spread across both sides of the metroplex — nobody has to drive far. It also hands you a backdrop nowhere else has: AT&T Stadium and Globe Life rising up behind the Entertainment District, big and modern and unmistakably Texas. From the church to those portraits to the reception, I shoot the whole Arlington day — just tell me if there's a Cowboys or Rangers game, because on event days the District turns into a parking lot and we'll plan the timeline around it.",
    ],
    faqs: [
      {
        q: "Can we take portraits by AT&T Stadium and Globe Life?",
        a: "Yes — the Entertainment District gives you a bold, modern backdrop you can't get anywhere else in DFW. The one catch is event days: when the Cowboys or Rangers play, traffic and parking around the stadiums get rough, so we either shoot well before gates open or pick a non-event day. Tell me your date and I'll check the schedule.",
      },
      {
        q: "Half our family's in Dallas and half's in Fort Worth — is Arlington a good middle?",
        a: "Perfect middle. Arlington's right between the two, so no side of the family has a long drive, and your church, portraits, and reception can all stay close together. I cover the full day wherever in the city it happens.",
      },
    ],
    leadEs: "Justo en medio de todo, con fondos del tamaño de un estadio.",
    introEs: [
      "Arlington está justo en el centro entre Dallas y Fort Worth, lo que la hace la opción fácil para las familias con parientes repartidos por los dos lados del metroplex — nadie tiene que manejar lejos. Y te da un fondo que ningún otro lado tiene: el AT&T Stadium y el Globe Life alzándose detrás del Entertainment District, grandes, modernos e inconfundiblemente texanos. De la iglesia a esas fotos y a la recepción, fotografío todo el día en Arlington — solo avísame si hay juego de los Cowboys o los Rangers, porque en días de evento el District se vuelve un estacionamiento y armamos el itinerario alrededor de eso.",
    ],
    faqsEs: [
      {
        q: "¿Podemos hacer fotos junto al AT&T Stadium y el Globe Life?",
        a: "Sí — el Entertainment District te da un fondo moderno y espectacular que no consigues en ningún otro lado de DFW. El único detalle son los días de evento: cuando juegan los Cowboys o los Rangers, el tráfico y el estacionamiento alrededor de los estadios se ponen pesados, así que fotografiamos bastante antes de que abran las puertas o escogemos un día sin evento. Dime tu fecha y reviso el calendario.",
      },
      {
        q: "La mitad de mi familia es de Dallas y la otra mitad de Fort Worth — ¿Arlington es buen punto medio?",
        a: "Punto medio perfecto. Arlington está justo entre las dos, así que ningún lado de la familia maneja lejos, y tu iglesia, las fotos y la recepción pueden quedar todas cerca. Cubro el día completo donde sea que se celebre en la ciudad.",
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
    lead: "A quieter, prettier quince — built around the gardens at the Historical Park.",
    intro: [
      "Farmers Branch is one of those established, settled pockets of Dallas County where families have the room to do a quinceañera beautifully and tend to take their time with it. The signature here is the setting. The Farmers Branch Historical Park — twenty-seven acres of period buildings, a restored Queen Anne cottage, and the Ruthan Rogers Rose Garden — is one of the loveliest portrait spots in the metroplex, and it's right in town.",
      "It's the kind of place that rewards a photographer who slows down. We work the rose garden, the arbors, and the old chapel grounds for portraits that feel editorial rather than rushed, and the day is built with enough room that no clock pushes us out of the garden before the light is right. The Signature and Legacy collections are made for exactly this — the full day, a real printed album, and a film to match a celebration this considered.",
    ],
    faqs: [
      {
        q: "Can we take quinceañera portraits at the Farmers Branch Historical Park?",
        a: "Yes — it's one of my favorite portrait settings anywhere. The Ruthan Rogers Rose Garden, the arbors, and the historic cottage grounds give us a half-dozen looks in one location. The park does ask for a photography reservation, so let me know early and we'll get it on the calendar.",
      },
      {
        q: "Which collection fits a Farmers Branch quince?",
        a: "Most families here go with Signature ($3,900) for the full day with photo and film, and many step up to Legacy ($5,500) for the long-form film, drone coverage, and a premium album. For a celebration this put-together, those are the natural fit — the full breakdown's on the investment page.",
      },
      {
        q: "Should we do the garden portraits as a separate session?",
        a: "It's a great option — a save-the-date session in the rose garden a few weeks before lets you enjoy the setting without watching the clock, and gives you images for invitations. We can also build the portraits into the day itself if you'd rather keep it to one.",
      },
    ],
    leadEs: "Una quince más tranquila y más bonita — armada alrededor de los jardines del Historical Park.",
    introEs: [
      "Farmers Branch es uno de esos rincones establecidos y tranquilos del condado de Dallas donde las familias tienen el espacio para hacer una quinceañera hermosa y suelen tomarse su tiempo. Lo que la distingue es el escenario. El Farmers Branch Historical Park — veintisiete acres de edificios de época, una casa Queen Anne restaurada y el Ruthan Rogers Rose Garden — es uno de los lugares más bonitos del metroplex para fotos, y está ahí mismo en la ciudad.",
      "Es el tipo de lugar que premia al fotógrafo que va sin prisa. Aprovechamos el jardín de rosas, los arcos y los terrenos de la vieja capilla para fotos que se sienten editoriales en vez de apuradas, y el día se arma con suficiente tiempo para que ningún reloj nos saque del jardín antes de que la luz esté buena. Las colecciones Signature y Legacy están hechas justo para esto — el día completo, un álbum impreso de verdad y un video a la altura de una celebración tan cuidada.",
    ],
    faqsEs: [
      {
        q: "¿Podemos hacer fotos de quinceañera en el Farmers Branch Historical Park?",
        a: "Sí — es uno de mis escenarios favoritos para fotos. El Ruthan Rogers Rose Garden, los arcos y los terrenos de la casa histórica nos dan media docena de escenarios en un solo lugar. El parque pide una reservación para fotografía, así que avísame con tiempo y lo apartamos.",
      },
      {
        q: "¿Qué colección va bien con una quince en Farmers Branch?",
        a: "La mayoría de las familias de aquí elige Signature ($3,900) por el día completo con foto y video, y muchas suben a Legacy ($5,500) por el video de larga duración, la toma con dron y un álbum premium. Para una celebración tan cuidada, esas son la opción natural — todo el detalle está en la página de inversión.",
      },
      {
        q: "¿Conviene hacer las fotos del jardín en una sesión aparte?",
        a: "Es una gran opción — una sesión save-the-date en el jardín de rosas unas semanas antes te deja disfrutar el lugar sin ver el reloj, y te da imágenes para las invitaciones. También podemos incluir las fotos en el día mismo si prefieres dejarlo para una sola fecha.",
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
