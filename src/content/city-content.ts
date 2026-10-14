/**
 * city-content.ts — UNIQUE per-city local content for the quinceañera-photographer
 * landing pages. Researched per city (real photo locations, neighborhoods, and
 * city-specific FAQs that answer the local autocomplete intents) so each page is
 * genuinely distinct — NOT a doorway page. Keyed by the same slug as locations.ts.
 *
 * Prices are NEVER typed here — they interpolate from the package price book
 * (src/lib/commission.ts), so a price change there updates every city page.
 */
import {
  TIER_PRICE_USD,
  ADD_ON_PRICE_USD,
  RETAINER,
  CONSULT_HOLD_DAYS,
  BASE_CREW,
  BASE_HOURS,
  usd,
} from "@/lib/commission";

const STUDY = usd(TIER_PRICE_USD.study);
const CINEMA = usd(TIER_PRICE_USD.cinema);
const PRODUCTION = usd(TIER_PRICE_USD.production);
const ARCHIVE = usd(TIER_PRICE_USD.archive);
const DESTINATION = usd(ADD_ON_PRICE_USD.destination);
const SAMEDAY = usd(ADD_ON_PRICE_USD.sameday);
const SUPER8 = usd(ADD_ON_PRICE_USD.super8);
const PARENTS = usd(ADD_ON_PRICE_USD.parents);
const RETAINER_PCT = `${Math.round(RETAINER.rate * 100)}%`;
const BALANCE_HOURS = RETAINER.balanceDueHours;
const HOLD_DAYS = CONSULT_HOLD_DAYS;
// Team included on the celebration day (photo/video mix is the family's choice).
const CREW_CINEMA = BASE_CREW.cinema;
const CREW_PRODUCTION = BASE_CREW.production;
const CREW_ARCHIVE = BASE_CREW.archive;
// Hours included on the day (families can add hours up to MAX_HOURS).
const HRS_STUDY = BASE_HOURS.study;
const HRS_CINEMA = BASE_HOURS.cinema;
const HRS_PRODUCTION = BASE_HOURS.production;
const HRS_ARCHIVE = BASE_HOURS.archive;

export type CityPhotoSpot = { name: string; why: string; whyEs: string };

export type CityContent = {
  intro: string[];
  introEs: string[];
  photoSpots: CityPhotoSpot[];
  faqs: { q: string; a: string }[];
  faqsEs: { q: string; a: string }[];
};

export const cityContent: Record<string, CityContent> = {
  "grand-prairie": {
    "intro": [
      "Grand Prairie is split right down the Dallas–Tarrant county line, and it carries one of the most Mexican neighborhoods in the metroplex along with it. Close to half the city is Hispanic, and the roots run deeper than most people realize — Dalworth, on the northeast side, was its own incorporated town before Grand Prairie annexed it back in 1942, and it has stayed a tight Mexican-American community ever since. You feel that every Cinco de Mayo out at Traders Village, and you feel it in how families here still do a quinceañera the full way: the Mass, the court, the vals, all of it.",
      "A Grand Prairie quince day usually opens with a morning misa at a parish on the north or central side of town, moves into portraits, and lands at a reception hall for the night. Plenty of families shoot pictures out at Joe Pool Lake or in front of the Uptown Theater's old marquee on Main Street, then head to a banquet hall along Pioneer Parkway or out toward the Highway 161 corridor near EpicCentral. Tell me your church and your salón and I'll build the timeline so nothing gets rushed and nobody's chasing the light at the end of the day.",
      `I shoot one quinceañera a day — never two — so your daughter's celebration isn't a stop on a packed Saturday. Everything runs in English and Spanish, so your tías and your padrinos always know what comes next. Packages run from ${STUDY} for the Portrait Session to ${ARCHIVE} for the Two-Day Celebration, and the one I recommend for most celebrations is the Full Celebration at ${PRODUCTION}: ${HRS_PRODUCTION} hours of photo and video with a team of ${CREW_PRODUCTION} and a day-of coordinator, a portrait session at one location, a 12–15 minute full-length video and a 40-page printed photo album. There's no travel fee anywhere in DFW, Grand Prairie included.`
    ],
    "introEs": [
      "Grand Prairie está partido justo por la línea de los condados de Dallas y Tarrant, y trae consigo uno de los barrios más mexicanos del metroplex. Casi la mitad de la ciudad es hispana, y la raíz viene de más atrás de lo que muchos creen: Dalworth, por el lado noreste, fue su propio pueblo antes de que Grand Prairie lo anexara en 1942, y desde entonces sigue siendo una comunidad mexicana bien unida. Eso se siente cada Cinco de Mayo en Traders Village, y se siente en cómo las familias de aquí todavía hacen la quinceañera completa: la misa, la corte, el vals, todo.",
      "Un día de quince en Grand Prairie casi siempre empieza con una misa de mañana en una parroquia del norte o del centro de la ciudad, sigue con las fotos y termina en un salón por la noche. Muchas familias toman fotos en Joe Pool Lake o frente a la marquesina vieja del Uptown Theater en Main Street, y luego se van a un salón por Pioneer Parkway o rumbo al corredor de la Highway 161 cerca de EpicCentral. Díme tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas y nadie ande corriendo por la luz al final del día.",
      `Fotografío una sola quinceañera al día —nunca dos— para que la celebración de tu hija no sea una parada en un sábado lleno. Todo lo manejo en inglés y español, para que tus tías y tus padrinos siempre sepan qué sigue. Los paquetes van de ${STUDY} con la Sesión de retratos a ${ARCHIVE} con la Celebración de dos días, y el que recomiendo para la mayoría de las celebraciones es la Celebración completa, en ${PRODUCTION}: ${HRS_PRODUCTION} horas de foto y video con un equipo de ${CREW_PRODUCTION} y una coordinadora del día, una sesión de retrato en una locación, un video completo de 12 a 15 minutos y un álbum de fotos impreso de 40 páginas. No hay cargo por traslado en ningún lugar de DFW, Grand Prairie incluido.`
    ],
    "photoSpots": [
      {
        "name": "Lynn Creek Park at Joe Pool Lake",
        "why": "The biggest public shoreline in Grand Prairie — a swimming beach, a marina, and wide-open water that turns gold at sunset. It's the go-to for big, airy lakeside portraits with room for the whole court.",
        "whyEs": "La orilla pública más grande de Grand Prairie: playa, marina y agua abierta que se pone dorada al atardecer. Es el lugar favorito para fotos amplias junto al lago, con espacio para toda la corte."
      },
      {
        "name": "Epic Central Park (EpicCentral, Hwy 161)",
        "why": "A modern 172-acre park with a grand lawn, a boardwalk, five lakes, and a 60-foot fountain that lights up at night for the Illuvia show. Clean architecture and dramatic evening light if you want something less traditional.",
        "whyEs": "Un parque moderno de 172 acres con un gran jardín, un boardwalk, cinco lagos y una fuente de 60 pies que se ilumina de noche con el show Illuvia. Arquitectura limpia y luz dramática de noche si quieres algo menos tradicional."
      },
      {
        "name": "Historic Downtown Grand Prairie — Main Street & the Uptown Theater",
        "why": "Old Main Street brick storefronts and the restored 1950s Uptown Theater marquee give you a vintage, editorial backdrop just minutes from the parishes — great for a portrait session before the celebration or a quick set on the day.",
        "whyEs": "Las fachadas de ladrillo del viejo Main Street y la marquesina restaurada del Uptown Theater de los años 50 te dan un fondo vintage y editorial a unos minutos de las parroquias: ideal para una sesión de retrato antes de la celebración o unas tomas rápidas el mismo día."
      },
      {
        "name": "Loyd Park at Joe Pool Lake",
        "why": "On the wooded southwest side of Joe Pool Lake, quieter than the beach, with shaded coves and tall trees. The softer, more private option when you want greenery instead of open water.",
        "whyEs": "En el lado boscoso al suroeste de Joe Pool Lake, más tranquilo que la playa, con ensenadas sombreadas y árboles altos. La opción más suave y privada cuando quieres verde en vez de agua abierta."
      },
      {
        "name": "Fish Creek Linear Park",
        "why": "A greenbelt and forest preserve threading through the middle of the city — trees, the creek, and a natural trail backdrop close to home, no long drive needed.",
        "whyEs": "Un parque lineal y reserva forestal que cruza el centro de la ciudad: árboles, el arroyo y un fondo natural de sendero cerca de casa, sin manejar lejos."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Grand Prairie?",
        "a": `Packages start at ${STUDY} for the Portrait Session (photos only, ${HRS_STUDY} hours with one photographer), then ${CINEMA} for Photo + Video and ${PRODUCTION} for the Full Celebration — the one I recommend for most Grand Prairie celebrations — up to ${ARCHIVE} for the Two-Day Celebration. Once your signed agreement is approved, a ${RETAINER_PCT} deposit locks in your date and goes toward your total, and there's no travel fee anywhere in DFW. Compare all four on our Packages & Prices page.`
      },
      {
        "q": "Where are the best places to take quince pictures in Grand Prairie?",
        "a": "Lynn Creek Park at Joe Pool Lake for open, golden-hour water; Epic Central Park off Highway 161 for the fountains and modern grounds; the Uptown Theater marquee and brick storefronts on historic Main Street for a vintage look; and quieter natural spots like Loyd Park or Fish Creek Linear Park. We pick based on the feel you want and how it fits into the day."
      },
      {
        "q": "Which areas of Grand Prairie do receptions usually happen in?",
        "a": "Most families book a banquet hall along Pioneer Parkway or out toward the Highway 161 corridor near EpicCentral, and some go for venues on the south end near Joe Pool Lake. Send me your church and your reception hall and I'll plan the timeline around both, so the drive between them is built in."
      },
      {
        "q": "Do you offer both photo and video for quinceañeras in Grand Prairie?",
        "a": `Yes — Photo + Video, the Full Celebration and the Two-Day Celebration all include video alongside the photos, shot the same day by one team: one photographer and one videographer with Photo + Video, or a team of ${CREW_PRODUCTION} or ${CREW_ARCHIVE} with the bigger packages, in whatever mix of photographers and videographers you choose. Photo + Video delivers an 8–10 minute full-length video in 4K and a 1-minute short trailer; the Full Celebration extends that to a 12–15 minute full-length video, a 90-second short trailer and four short vertical videos for social media. Because I only take one celebration a day, the video never competes with the photos for attention.`
      },
      {
        "q": "What areas near Grand Prairie do you serve?",
        "a": "Grand Prairie sits between Arlington, Irving, south Dallas and Oak Cliff, Mansfield, Cedar Hill, and Duncanville, with Dalworthington Gardens right next door — and I cover all of them with no travel fee. Wherever your church and hall land across DFW, the rate is the same."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañeras en Grand Prairie?",
        "a": `Los paquetes empiezan en ${STUDY} con la Sesión de retratos (solo fotos, ${HRS_STUDY} horas con un fotógrafo); siguen ${CINEMA} con Foto + Video y ${PRODUCTION} con la Celebración completa —la que recomiendo para la mayoría de las celebraciones en Grand Prairie— y llegan a ${ARCHIVE} con la Celebración de dos días. Ya aprobado tu contrato firmado, un depósito del ${RETAINER_PCT} asegura tu fecha y se abona a tu total, y no hay cargo por traslado en ningún lugar de DFW. Compara los cuatro en nuestra página de Paquetes y precios.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Grand Prairie?",
        "a": "Lynn Creek Park en Joe Pool Lake para el agua abierta a la hora dorada; Epic Central Park por la Highway 161 para las fuentes y los jardines modernos; la marquesina del Uptown Theater y las fachadas de ladrillo del Main Street histórico para un estilo vintage; y lugares más tranquilos y naturales como Loyd Park o Fish Creek Linear Park. Escogemos según el estilo que quieras y cómo encaje en el día."
      },
      {
        "q": "¿En qué zonas de Grand Prairie suelen ser las recepciones?",
        "a": "La mayoría de las familias reservan un salón por Pioneer Parkway o rumbo al corredor de la Highway 161 cerca de EpicCentral, y algunas eligen lugares al sur, cerca de Joe Pool Lake. Mándame tu iglesia y tu salón y armo el itinerario alrededor de los dos para que el traslado entre ellos ya esté contemplado."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Grand Prairie?",
        "a": `Sí — Foto + Video, la Celebración completa y la Celebración de dos días incluyen video junto con las fotos, grabado el mismo día por un solo equipo: un fotógrafo y un videógrafo con Foto + Video, o un equipo de ${CREW_PRODUCTION} o ${CREW_ARCHIVE} personas con los paquetes más grandes, en la combinación de fotógrafos y videógrafos que tú elijas. Foto + Video entrega un video completo en 4K de 8 a 10 minutos y un tráiler corto de 1 minuto; la Celebración completa sube a un video completo de 12 a 15 minutos, un tráiler corto de 90 segundos y cuatro videos verticales cortos para redes sociales. Como solo tomo una celebración al día, el video nunca compite con las fotos por la atención.`
      },
      {
        "q": "¿Qué áreas cerca de Grand Prairie cubres?",
        "a": "Grand Prairie está entre Arlington, Irving, el sur de Dallas y Oak Cliff, Mansfield, Cedar Hill y Duncanville, además de Dalworthington Gardens justo al lado — y cubro todas sin cargo por traslado. Donde sea que queden tu iglesia y tu salón en DFW, el precio es el mismo."
      }
    ]
  },
  "irving": {
    "intro": [
      "Irving is really two cities, and a quinceañera here usually touches both. South of Highway 183 you have the older, Spanish-speaking heart of town — the panaderías and carnicerías along Irving Boulevard, the parishes that have been baptizing and confirming the same families for decades, and the brick storefronts of the Heritage District around Main Street. North of that sit the canals and glass towers of Las Colinas. Irving is roughly 40% Hispanic, mostly families of Mexican origin, and that community is concentrated in exactly those older South Irving neighborhoods where the church-first tradition is still done in full.",
      "A typical day moves across that whole map. We start with the misa in South Irving, then drive ten minutes north so your daughter can stand under the Mustangs at Williams Square or along the Venetian bridges of the Mandalay Canal for portraits — backdrops you genuinely cannot get anywhere else in DFW. From there the reception might be a hotel ballroom near the Irving Convention Center, the entertainment district around the Toyota Music Factory, or a neighborhood salón off Irving Boulevard. I build the timeline around your actual churches and venues, not a template.",
      "I only photograph one quinceañera a day, and only quinceañeras — no weddings squeezed in, no second event pulling me away at sunset. Everything is fully bilingual, so your grandparents understand every direction during portraits and the toasts get caught in the moment. Every package with video pairs a full-length video in 4K with a short trailer you can share, and the Full Celebration adds a 40-page printed photo album to keep for years."
    ],
    "introEs": [
      "Irving en realidad son dos ciudades, y una quinceañera casi siempre toca las dos. Al sur de la 183 está el corazón mexicano de la ciudad: las panaderías y carnicerías sobre Irving Boulevard, las parroquias que llevan generaciones bautizando y confirmando a las mismas familias, y los locales de ladrillo del Heritage District por Main Street. Al norte quedan los canales y las torres de cristal de Las Colinas. Irving es casi 40% hispano, en su mayoría familias de origen mexicano, y esa comunidad está concentrada justo en esos barrios del sur de Irving donde todavía se hace la tradición completa, empezando por la iglesia.",
      "Un día típico recorre todo ese mapa. Empezamos con la misa en el sur de Irving y manejamos diez minutos al norte para que tu hija se pare bajo los Mustangs de Williams Square o sobre los puentes venecianos del Mandalay Canal para las fotos — fondos que de verdad no encuentras en ninguna otra parte de DFW. De ahí la recepción puede ser un salón de hotel cerca del Irving Convention Center, la zona de entretenimiento del Toyota Music Factory, o un salón del barrio sobre Irving Boulevard. Armo el itinerario alrededor de tus iglesias y tu salón, no de una plantilla.",
      "Solo fotografío una quinceañera al día y solo quinceañeras: nada de bodas encimadas ni un segundo evento que me jale al atardecer. Todo es bilingüe, así que tus abuelos entienden cada indicación durante las fotos y los brindis quedan capturados en el momento. Cada paquete con video trae un video completo en 4K y un tráiler corto para compartir, y la Celebración completa suma un álbum de fotos impreso de 40 páginas para guardar por años."
    ],
    "photoSpots": [
      {
        "name": "Mandalay Canal Walk at Las Colinas",
        "why": "A Venetian-style canal with stone bridges, waterfalls, and arched walkways winding beneath the Las Colinas towers — the most European backdrop in DFW and a favorite for formal gown portraits. Free to walk, right off Lake Carolyn.",
        "whyEs": "Un canal estilo veneciano con puentes de piedra, cascadas y pasajes con arcos bajo las torres de Las Colinas — el fondo más europeo de todo DFW y de los favoritos para las fotos de vestido formal. De acceso libre, junto al Lake Carolyn."
      },
      {
        "name": "The Mustangs of Las Colinas (Williams Square)",
        "why": "Nine bronze mustangs galloping across a granite stream — the largest equestrian sculpture in the world, on an open public plaza at 5221 N. O'Connor Blvd. An unmistakable, only-in-Irving frame for a few hero shots.",
        "whyEs": "Nueve mustangs de bronce galopando sobre un arroyo de granito — la escultura ecuestre más grande del mundo, en una plaza pública abierta en el 5221 N. O'Connor Blvd. Un marco inconfundible y muy de Irving para algunas tomas principales."
      },
      {
        "name": "Irving Heritage District (Main Street, South Irving)",
        "why": "The old downtown around Second and Main — vintage brick storefronts, the early-1900s Heritage House, and a small-town Texas feel just a few blocks from the South Irving parishes. Great for relaxed, between-locations portraits.",
        "whyEs": "El centro viejo por Second y Main — fachadas de ladrillo antiguo, la Heritage House de principios del siglo XX y un ambiente de pueblo a unas cuadras de las parroquias del sur de Irving. Ideal para fotos relajadas entre locaciones."
      },
      {
        "name": "Centennial Park",
        "why": "A green Heritage District park with the Heritage House (a Texas Historical Landmark) and a wall that tells Irving's story in words and pictures — shade, lawn, and history in one easy stop near the churches.",
        "whyEs": "Un parque verde del Heritage District con la Heritage House (monumento histórico de Texas) y un muro que cuenta la historia de Irving en palabras e imágenes — sombra, césped e historia en una sola parada cerca de las iglesias."
      },
      {
        "name": "Campion Trail along the Trinity River",
        "why": "A 22-mile greenbelt following the Elm Fork of the Trinity, with open river views, tall trees, and quiet meadows — the natural, golden-hour option when you want greenery instead of architecture. Trailheads in Valley Ranch and Las Colinas.",
        "whyEs": "Un cinturón verde de 22 millas que sigue el Elm Fork del Trinity, con vistas abiertas al río, árboles altos y praderas tranquilas — la opción natural de la hora dorada cuando quieres verde en vez de arquitectura. Accesos en Valley Ranch y Las Colinas."
      },
      {
        "name": "Lake Carolyn waterfront (Las Colinas)",
        "why": "Open water with the Las Colinas skyline behind it — clean reflections at sunset and room to step back for full-length gown shots, just past the end of the Mandalay Canal.",
        "whyEs": "Agua abierta con el horizonte de Las Colinas de fondo — reflejos limpios al atardecer y espacio para tomas de cuerpo entero del vestido, justo donde termina el Mandalay Canal."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Irving?",
        "a": `My packages run from ${STUDY} (Portrait Session) to ${ARCHIVE} (Two-Day Celebration). The one I recommend for most celebrations is the Full Celebration at ${PRODUCTION} — ${HRS_PRODUCTION} hours with a team of ${CREW_PRODUCTION} and a day-of coordinator, a portrait session at one location (the Mandalay Canal is a natural pick), a 12–15 minute full-length video and 700+ edited photos. Photo + Video, at ${CINEMA}, covers ${HRS_CINEMA} hours with one photographer and one videographer. There's no travel fee anywhere in Irving or the rest of DFW; see every inclusion on our Packages & Prices page.`
      },
      {
        "q": "Where are the best places to take quince pictures in Irving?",
        "a": "The Mandalay Canal Walk and the Mustangs of Las Colinas at Williams Square are the two signature backdrops — Venetian canals and the world's largest equestrian sculpture, ten minutes apart. For something greener or more historic, the Heritage District on Main Street, Centennial Park, the Campion Trail along the Trinity River, and the Lake Carolyn waterfront all photograph beautifully. We can make these your portrait session before the celebration or fold a couple into the day."
      },
      {
        "q": "Where do Irving families usually hold the reception?",
        "a": "All over the city. Hotel ballrooms cluster near the Irving Convention Center in Las Colinas, the entertainment district around the Toyota Music Factory hosts the bigger celebrations, and there are banquet halls along the Irving Boulevard corridor in South Irving, close to the parishes. Tell me your church and your venue and I'll build the timeline around both."
      },
      {
        "q": "Do you offer photo and video for quinceañeras in Irving?",
        "a": `Yes. Photo + Video (${CINEMA}), Full Celebration (${PRODUCTION}) and Two-Day Celebration (${ARCHIVE}) all include both photography and a full-length video in 4K, shot the same day by one team of ${CREW_CINEMA} to ${CREW_ARCHIVE} people, in whatever mix of photographers and videographers you choose. If you'd like a short highlight video to share right away, the Same-Day Edit (ready in 24 hours) is ${SAMEDAY}.`
      },
      {
        "q": "What areas near Irving do you cover?",
        "a": "Irving sits in the middle of everything, so I regularly photograph quinces in Coppell, Grand Prairie, Farmers Branch, Euless, Grapevine, and across Dallas — all with no travel fee anywhere in the metroplex."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Irving?",
        "a": `Mis paquetes van de ${STUDY} (Sesión de retratos) a ${ARCHIVE} (Celebración de dos días). El que recomiendo para la mayoría de las celebraciones es Celebración completa, en ${PRODUCTION}: ${HRS_PRODUCTION} horas con un equipo de ${CREW_PRODUCTION} y una coordinadora del día, una sesión de retrato en una locación (el Mandalay Canal es la opción natural), un video completo de 12 a 15 minutos y más de 700 fotos editadas. Foto + Video, en ${CINEMA}, cubre ${HRS_CINEMA} horas con un fotógrafo y un videógrafo. No hay cargo por traslado en Irving ni en el resto de DFW; mira todo lo que incluye cada uno en nuestra página de Paquetes y precios.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Irving?",
        "a": "El Mandalay Canal Walk y los Mustangs de Las Colinas en Williams Square son los dos fondos más icónicos — canales venecianos y la escultura ecuestre más grande del mundo, a diez minutos uno del otro. Si quieres algo más verde o histórico, el Heritage District sobre Main Street, el Centennial Park, el Campion Trail junto al río Trinity y la orilla del Lake Carolyn quedan preciosos. Los podemos hacer como tu sesión de retrato antes de la celebración o acomodar un par el mismo día."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Irving?",
        "a": "Por toda la ciudad. Los salones de hotel se concentran cerca del Irving Convention Center en Las Colinas, la zona de entretenimiento del Toyota Music Factory recibe las celebraciones más grandes, y hay salones de fiesta sobre el corredor de Irving Boulevard en el sur de Irving, cerca de las parroquias. Dime tu iglesia y tu salón y armo el itinerario alrededor de los dos."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Irving?",
        "a": `Sí. Foto + Video (${CINEMA}), Celebración completa (${PRODUCTION}) y Celebración de dos días (${ARCHIVE}) incluyen fotografía y un video completo en 4K, grabados el mismo día por un solo equipo de ${CREW_CINEMA} a ${CREW_ARCHIVE} personas, repartidas entre fotógrafos y videógrafos como tú prefieras. Si quieres un video corto para compartir enseguida, la Edición el mismo día (lista en 24 horas) cuesta ${SAMEDAY}.`
      },
      {
        "q": "¿Qué zonas cerca de Irving cubres?",
        "a": "Irving está en el centro de todo, así que seguido fotografío quinces en Coppell, Grand Prairie, Farmers Branch, Euless, Grapevine y por todo Dallas — todo sin cargo por traslado en el metroplex."
      }
    ]
  },
  "garland": {
    "intro": [
      "Garland is one of the largest cities in Dallas County, and it wears its Mexican heritage plainly — the pan­erias and taquerías of South Garland, the families that fill the parishes on a Saturday morning, the quinceañeras that still run the full arc from misa to el último baile. More than four in ten residents here are Hispanic, most of Mexican descent, and that shows up in how seriously a fifteenth birthday is taken. Nobody does the short version.",
      "What makes the day easy to photograph is that Garland hands you two completely different backdrops inside one city. Head east and you're on the Lake Ray Hubbard shoreline; turn toward the center of town and you're standing in a genuinely restored downtown square — brick storefronts on the National Register, the Plaza Theatre's neon marquee glowing on the corner, a new civic lawn where the DART Blue Line pulls in. We can build your portraits around the water, the square, or both.",
      "I only ever hold one quinceañera per date. So whether your reception is in a banquet hall off Broadway in South Garland, near Firewheel on the north side, or out by the lake, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both."
    ],
    "introEs": [
      "Garland es una de las ciudades más grandes del condado de Dallas, y lleva sus raíces mexicanas a la vista: las pan­erias y taquerías del sur de Garland, las familias que llenan las parroquias un sábado en la mañana, las quinceañeras que todavía se hacen completas, de la misa hasta el último baile. Más de cuatro de cada diez personas aquí son hispanas, la mayoría de origen mexicano, y eso se nota en lo en serio que se toma un quince. Aquí nadie hace la versión corta.",
      "Lo que hace fácil fotografiar el día es que Garland te da dos fondos completamente distintos dentro de la misma ciudad. Hacia el este llegas a la orilla de Lake Ray Hubbard; hacia el centro te paras en un downtown de verdad restaurado: fachadas de ladrillo en el Registro Nacional, el marqués de neón del Plaza Theatre brillando en la esquina y un pasto nuevo donde llega el tren Blue Line del DART. Podemos armar tus fotos alrededor del lago, del centro, o de los dos.",
      "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté en un salón por Broadway en el sur de Garland, cerca de Firewheel al norte, o por el lado del lago, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos."
    ],
    "photoSpots": [
      {
        "name": "Downtown Garland Square",
        "why": "Garland's restored historic square — brick storefronts on the National Register, a new civic lawn, and a lit prism gateway after dark. A real downtown backdrop without driving into Dallas.",
        "whyEs": "El centro histórico restaurado de Garland: fachadas de ladrillo en el Registro Nacional, un pasto nuevo y la torre de luces que se ilumina de noche. Un fondo urbano de verdad sin tener que ir hasta Dallas."
      },
      {
        "name": "Plaza Theatre marquee (Downtown Garland)",
        "why": "The Plaza Theatre's 1949 neon marquee anchors the corner of the square. Lit up at night it gives portraits a vintage, one-of-a-kind backdrop.",
        "whyEs": "El marqués de neón del Plaza Theatre, de 1949, en la esquina del centro. De noche se prende y les da a las fotos un fondo vintage con mucha personalidad."
      },
      {
        "name": "Spring Creek Forest Preserve",
        "why": "Old-growth woods and native prairie in north Garland, with real wildflowers in spring and early summer. Genuine green, not a studio backdrop.",
        "whyEs": "Bosque antiguo y pradera nativa al norte de Garland, con flores silvestres de verdad en primavera y a principios de verano. Verde auténtico, nada de fondo de estudio."
      },
      {
        "name": "Audubon Park & Duck Creek Greenbelt",
        "why": "Over 100 acres of natural space with a trail along Duck Creek — soft, tree-filtered light that's kind to a full court.",
        "whyEs": "Más de 100 acres de naturaleza con el sendero junto a Duck Creek. Luz suave entre los árboles que le queda muy bien a toda la corte."
      },
      {
        "name": "John Paul Jones Park on Lake Ray Hubbard",
        "why": "Garland's own Lake Ray Hubbard shoreline for open-water sunset portraits. Free, public, and quiet in the evening.",
        "whyEs": "La orilla de Lake Ray Hubbard, en Garland, para fotos de atardecer con el agua de fondo. Gratis, público y tranquilo en la tarde."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Garland?",
        "a": `Packages run from ${STUDY} for the photo-only Portrait Session to ${ARCHIVE} for the Two-Day Celebration. In between are Photo + Video at ${CINEMA} — ${HRS_CINEMA} hours with one photographer and one videographer — and Full Celebration at ${PRODUCTION}, the one I recommend for most celebrations. There's no travel fee anywhere in DFW, so your Garland day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`
      },
      {
        "q": "Where are the best places to take quince pictures in Garland?",
        "a": "My go-to spots are the restored Downtown Garland Square and the Plaza Theatre's neon marquee, Spring Creek Forest Preserve and Audubon Park along Duck Creek for green, natural light, and the Lake Ray Hubbard shoreline at John Paul Jones Park for open-water sunset portraits. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline."
      },
      {
        "q": "Where do Garland families usually hold the reception?",
        "a": "All over the city — banquet halls along the Broadway Boulevard corridor in South Garland, venues on the north side near Firewheel and the George Bush Turnpike, and halls out toward Lake Ray Hubbard. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them."
      },
      {
        "q": "Do you offer photo and video in Garland?",
        "a": `Yes. Photo + Video (${CINEMA}) pairs one photographer with one videographer for an 8–10 minute full-length video in 4K, a 1-minute short trailer and 400+ edited photos; Full Celebration (${PRODUCTION}) brings a team of ${CREW_PRODUCTION} and a day-of coordinator, a 12–15 minute full-length video and a 40-page printed photo album. If you only want portraits, the Portrait Session (${STUDY}) is photo only.`
      },
      {
        "q": "What areas around Garland do you cover?",
        "a": "All of it, with no travel fee — Garland plus Rowlett, Sachse, Mesquite, Richardson, Sunnyvale, Wylie, Murphy, and Rockwall across the lake, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Garland?",
        "a": `Los paquetes van de ${STUDY} con la Sesión de retratos, solo de foto, a ${ARCHIVE} con la Celebración de dos días. En medio están Foto + Video, en ${CINEMA} —${HRS_CINEMA} horas con un fotógrafo y un videógrafo—, y la Celebración completa, en ${PRODUCTION}, la que recomiendo para la mayoría de las celebraciones. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Garland cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Garland?",
        "a": "Mis lugares favoritos son el centro histórico restaurado (Downtown Garland Square) y el marqués de neón del Plaza Theatre, el Spring Creek Forest Preserve y Audubon Park junto a Duck Creek para luz verde y natural, y la orilla de Lake Ray Hubbard en John Paul Jones Park para fotos de atardecer sobre el agua. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Garland?",
        "a": "Por toda la ciudad — salones por el corredor de Broadway Boulevard en el sur de Garland, lugares al norte cerca de Firewheel y el George Bush Turnpike, y salones por el lado de Lake Ray Hubbard. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos."
      },
      {
        "q": "¿Ofreces foto y video en Garland?",
        "a": `Sí. Foto + Video (${CINEMA}) junta a un fotógrafo con un videógrafo para un video completo en 4K de 8 a 10 minutos, un tráiler corto de 1 minuto y más de 400 fotos editadas; Celebración completa (${PRODUCTION}) trae un equipo de ${CREW_PRODUCTION} y una coordinadora del día, un video completo de 12 a 15 minutos y un álbum de fotos impreso de 40 páginas. Si solo quieres retratos, la Sesión de retratos (${STUDY}) es solo de foto.`
      },
      {
        "q": "¿Qué zonas alrededor de Garland cubres?",
        "a": "Todas, sin cargo por traslado — Garland más Rowlett, Sachse, Mesquite, Richardson, Sunnyvale, Wylie, Murphy y Rockwall al cruzar el lago, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación."
      }
    ]
  },
  "dallas": {
    "intro": [
      "Walk Jefferson Boulevard in Oak Cliff and you can read the whole tradition straight off the shop windows: bridal stores with quinceañera ball gowns on display, paleterías and taquerías a few doors down, the same blocks Mexican families have kept alive since the 1960s. That stretch is the commercial heart of Mexican-American Dallas, and it tells you everything about how seriously this city takes a girl's fifteenth birthday.",
      "Dallas is big, and the celebrations are spread across it. A morning misa at a parish in Oak Cliff or Pleasant Grove, portraits in Bishop Arts or out by White Rock Lake, then a reception that might land anywhere from a hall off Jefferson to a salón on the east side near Mesquite. Most families here keep the order intact, church first, then the formal portraits, then the vals and the party, and I photograph the day in that sequence, the way it's meant to flow.",
      "I shoot one quinceañera a day, in English or Spanish, with no travel fee anywhere in Dallas or the wider metroplex. Every package comes with edited photos, and the packages with video add a short trailer — 1 minute with Photo + Video, 90 with the Full Celebration — so you have something to share long before the full-length video is finished. When you reach out, tell me your church and your venue and I'll build the timeline around both."
    ],
    "introEs": [
      "Camina por Jefferson Boulevard en Oak Cliff y vas a leer toda la tradición en los aparadores: tiendas de novias con vestidos de quinceañera, paleterías y taquerías a unos pasos, las mismas cuadras que las familias mexicanas han mantenido vivas desde los años sesenta. Ese tramo es el corazón comercial del Dallas mexicano, y te dice todo sobre lo en serio que esta ciudad se toma los quince años de una niña.",
      "Dallas es grande y las celebraciones están repartidas por toda la ciudad. Una misa de mañana en una parroquia de Oak Cliff o Pleasant Grove, las fotos en Bishop Arts o por White Rock Lake, y luego una recepción que lo mismo cae en un salón por Jefferson que en uno del lado este, cerca de Mesquite. Aquí casi todas las familias respetan el orden: primero la iglesia, luego las fotos formales, después el vals y la fiesta. Así fotografío el día, como debe fluir.",
      "Hago una sola quinceañera al día, en inglés o español, sin cargo por traslado en Dallas ni en todo el metroplex. Cada paquete trae fotos editadas, y los paquetes con video suman un tráiler corto —de 1 minuto con Foto + Video, de 90 con la Celebración completa— para que tengas algo que compartir mucho antes de que esté listo el video completo. Cuando me escribas, dime tu iglesia y tu salón y armo el itinerario alrededor de los dos."
    ],
    "photoSpots": [
      {
        "name": "Bishop Arts District (Oak Cliff)",
        "why": "Walkable blocks of hand-painted murals, vintage storefronts, and bright alleyways in the heart of Oak Cliff. Colorful, free to shoot, and minutes from most of the city's parishes.",
        "whyEs": "Cuadras caminables con murales pintados a mano, fachadas antiguas y callejones de colores en pleno Oak Cliff. Vistoso, sin costo para fotografiar y a minutos de la mayoría de las parroquias."
      },
      {
        "name": "Kiest Park Memorial Garden (Oak Cliff)",
        "why": "A 1930s WPA stone water rill, pergola, and formal flower beds tucked inside a large Oak Cliff park. Quiet, green, and classic for gown portraits without leaving the neighborhood.",
        "whyEs": "Un canal de piedra de los años treinta, una pérgola y jardines formales dentro de un parque grande de Oak Cliff. Tranquilo, verde y clásico para las fotos del vestido sin salir del barrio."
      },
      {
        "name": "Dallas Arboretum and Botanical Garden (White Rock Lake)",
        "why": "Manicured formal gardens, fountains, and seasonal blooms on the shore of White Rock Lake, the city's premier garden backdrop. It's ticketed and needs a photo pass, so we plan the time slot in advance.",
        "whyEs": "Jardines formales, fuentes y flores de temporada a la orilla de White Rock Lake, el mejor fondo de jardín de la ciudad. Cobra entrada y pide permiso de fotografía, así que apartamos el horario con tiempo."
      },
      {
        "name": "Latino Cultural Center (near Downtown)",
        "why": "Ricardo Legorreta's pumpkin-orange walls and purple 'lighthouse' tower with an open plaza, bold Mexican modernist color that ties the portraits straight back to the community.",
        "whyEs": "Los muros color calabaza y la torre morada estilo faro de Ricardo Legorreta, con una plaza abierta. Color modernista mexicano que conecta las fotos directamente con la comunidad."
      },
      {
        "name": "Ronald Kirk Bridge / Trinity Overlook (West Dallas)",
        "why": "A pedestrian-only bridge over the Trinity with the downtown skyline, Reunion Tower, and Calatrava's white Margaret Hunt Hill arch behind you. Best at golden hour, and free to walk on.",
        "whyEs": "Un puente peatonal sobre el río Trinity con el horizonte del centro, la Reunion Tower y el arco blanco del puente Margaret Hunt Hill de fondo. Ideal a la hora dorada y gratis para caminar."
      },
      {
        "name": "Fair Park (East Dallas)",
        "why": "A National Historic Landmark with the country's largest collection of Art Deco architecture. The Esplanade's fountains and lagoon and the grand 1936 facades make a dramatic, distinctly Dallas backdrop.",
        "whyEs": "Un sitio histórico nacional con la mayor colección de arquitectura Art Déco del país. Las fuentes y la laguna de la Esplanade y las fachadas de 1936 dan un fondo dramático y muy de Dallas."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Dallas?",
        "a": `Portrait Session is ${STUDY}, Photo + Video ${CINEMA}, Full Celebration ${PRODUCTION} — the one I recommend for most celebrations, with photos, video and a printed photo album — and Two-Day Celebration ${ARCHIVE}. Extras include a Dress Session, photos in her dress before the big day (${DESTINATION}), and a Vintage Film Clip (Super 8) added to the full-length video (${SUPER8}). There's no travel fee anywhere in Dallas or DFW, and a ${RETAINER_PCT} deposit locks in the date once your agreement is approved.`
      },
      {
        "q": "Where are the best places to take quince pictures in Dallas?",
        "a": "For portraits I keep coming back to the murals of Bishop Arts, the WPA gardens at Kiest Park in Oak Cliff, the formal grounds of the Dallas Arboretum on White Rock Lake, the colorful Latino Cultural Center near downtown, the skyline view from the Ronald Kirk Bridge in West Dallas, and the Art Deco Esplanade at Fair Park. We pick spots close to your church so the timeline stays easy."
      },
      {
        "q": "What part of Dallas do receptions usually happen in?",
        "a": "All over the city, banquet halls along the Jefferson Boulevard corridor in Oak Cliff, salones on the southeast side around Pleasant Grove and Buckner, newer spaces near West Dallas and the Design District, and halls out toward Mesquite and the east side. Tell me your venue when you book and I'll plan the night around it."
      },
      {
        "q": "Do you offer both photo and video for quinceañeras in Dallas?",
        "a": "Yes. Photo + Video, the Full Celebration and the Two-Day Celebration pair photos with a full-length video in 4K and a short trailer — up to a 20-minute full-length video and a 2-minute short trailer with the Two-Day Celebration. Everything is offered fully in English or Spanish."
      },
      {
        "q": "Do you cover the suburbs around Dallas too?",
        "a": "Yes, I photograph across all of Dallas County and the metroplex with no travel fee, including Irving, Grand Prairie, Garland, Mesquite, Farmers Branch, DeSoto, Duncanville, Cedar Hill, and Carrollton. One celebration a day, wherever in DFW your day takes us."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Dallas?",
        "a": `Sesión de retratos cuesta ${STUDY}, Foto + Video ${CINEMA}, Celebración completa ${PRODUCTION} —la que recomiendo para la mayoría de las celebraciones, con fotos, video y un álbum de fotos impreso— y la Celebración de dos días ${ARCHIVE}. Entre los extras están una Sesión con el vestido, fotos con su vestido antes del gran día (${DESTINATION}), y un Clip de película vintage (Super 8) dentro del video completo (${SUPER8}). No cobro traslado en Dallas ni en todo DFW, y un depósito del ${RETAINER_PCT} asegura la fecha una vez aprobado tu contrato.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Dallas?",
        "a": "Para las fotos siempre regreso a los murales de Bishop Arts, los jardines de Kiest Park en Oak Cliff, el Dallas Arboretum a la orilla de White Rock Lake, el colorido Latino Cultural Center cerca del centro, la vista del horizonte desde el Ronald Kirk Bridge en West Dallas y la Esplanade Art Déco de Fair Park. Elegimos lugares cerca de tu iglesia para que el itinerario quede fácil."
      },
      {
        "q": "¿En qué parte de Dallas suelen ser las recepciones?",
        "a": "Por toda la ciudad: salones por el corredor de Jefferson Boulevard en Oak Cliff, salones del lado sureste por Pleasant Grove y Buckner, lugares más nuevos cerca de West Dallas y el Design District, y salones rumbo a Mesquite y el lado este. Dime tu salón al reservar y armo la noche alrededor de él."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Dallas?",
        "a": "Sí. Foto + Video, la Celebración completa y la Celebración de dos días combinan las fotos con un video completo en 4K y un tráiler corto — hasta un video completo de 20 minutos y un tráiler corto de 2 minutos con la Celebración de dos días. Todo se ofrece por completo en inglés o español."
      },
      {
        "q": "¿También cubres los suburbios alrededor de Dallas?",
        "a": "Sí, fotografío en todo el condado de Dallas y el metroplex sin cargo por traslado, incluyendo Irving, Grand Prairie, Garland, Mesquite, Farmers Branch, DeSoto, Duncanville, Cedar Hill y Carrollton. Una sola celebración al día, donde sea que nos lleve tu día en DFW."
      }
    ]
  },
  "fort-worth": {
    "intro": [
      "Fort Worth's Mexican heritage didn't start downtown — it started a mile north of the Trinity River, where families came to work the Swift and Armour packing plants in the early 1900s and built the North Side into the city's oldest barrio. More than a century later, North Main Street, Marine Park, and the parishes around them are still where a lot of Fort Worth quinceañeras begin. Cross town to the South Freeway and you hit the other anchor: La Gran Plaza, the Hispanic mercado where families pick out the dress, the cake, and the recuerdos. I know how a quinceañera moves between these two sides of the city, and I build the day around the route your family actually takes.",
      "Fort Worth gives you a backdrop for whatever look you are after. Want something modern and dramatic? The Fort Worth Water Gardens downtown are free and open daily, all terraced concrete and falling water. Want the classic garden shots in the gown? The Japanese Garden inside the Botanic Garden has the koi ponds, red bridges, and maples for it. Want Fort Worth unmistakable in the frame? The Stockyards' brick streets and Mule Alley do that in a single block. Most days we work portraits in between the misa and the reception, but if your schedule is tight we can make the spot you love a portrait session before the celebration — the heart of the Portrait Session, and included at one location in the Full Celebration — and keep the day itself relaxed.",
      "I only photograph one quinceañera a day, and only quinceañeras — this is not a wedding studio fitting yours in on the side. That means the morning at the church, the portraits, the vals, the surprise dance, and the last hour on the floor all get the same attention. Everything runs in English and Spanish, so your tías and your abuelos understand every direction I give. There is no travel fee anywhere in Tarrant County or the rest of DFW, and every package with video comes with a short trailer and short vertical videos for social media alongside the full-length video."
    ],
    "introEs": [
      "La herencia mexicana de Fort Worth no empezó en el centro, sino una milla al norte del río Trinity, donde las familias llegaron a trabajar a los empacadores de carne Swift y Armour a principios de los 1900 y levantaron el North Side, el barrio más antiguo de la ciudad. Más de cien años después, North Main Street, Marine Park y las parroquias de por ahí siguen siendo donde arrancan muchas quinceañeras de Fort Worth. Del otro lado, por la South Freeway, está el otro punto de reunión: La Gran Plaza, el mercado donde las familias escogen el vestido, el pastel y los recuerdos. Conozco cómo se mueve una quinceañera entre estos dos lados de la ciudad y armo el día según la ruta que de verdad sigue tu familia.",
      "Fort Worth te da el fondo que quieras. ¿Algo moderno y de impacto? Los Fort Worth Water Gardens, en el centro, son gratis y abren todos los días, puro concreto en terrazas y agua cayendo. ¿Las fotos clásicas de jardín con el vestido? El Japanese Garden, dentro del Botanic Garden, tiene los estanques de koi, los puentes rojos y los maples. ¿Que se note que es Fort Worth? Las calles de ladrillo de los Stockyards y Mule Alley lo logran en una sola cuadra. Casi siempre hacemos las fotos entre la misa y la recepción, pero si el tiempo está apretado podemos hacer en el lugar que más te guste una sesión de retrato antes de la celebración —el corazón de la Sesión de retratos, e incluida en una locación con la Celebración completa— y dejar tranquilo el día de la fiesta.",
      "Solo fotografío una quinceañera al día, y solo quinceañeras: no soy un estudio de bodas que acomoda la tuya de pasada. Eso quiere decir que la mañana en la iglesia, las fotos, el vals, el baile sorpresa y la última hora en la pista reciben la misma atención. Todo es bilingüe, para que tus tías y tus abuelos entiendan cada indicación que doy. No hay cargo por traslado en todo el condado de Tarrant ni en el resto de DFW, y cada paquete con video trae un tráiler corto y videos verticales cortos para redes sociales junto con el video completo."
    ],
    "photoSpots": [
      {
        "name": "Fort Worth Water Gardens (downtown)",
        "why": "Free and open daily on the south edge of downtown — Philip Johnson's terraced concrete pools and falling water give you a bold, modern set just minutes from most churches.",
        "whyEs": "Gratis y abierto todos los días en el borde sur del centro: las terrazas de concreto y el agua cayendo de Philip Johnson te dan un fondo moderno y de impacto, a minutos de casi cualquier iglesia."
      },
      {
        "name": "Japanese Garden, Fort Worth Botanic Garden",
        "why": "A traditional strolling garden with koi ponds, red bridges, and Japanese maples — the classic garden look for the gown. It welcomes quinceañera sessions for a small photo fee plus admission.",
        "whyEs": "Un jardín de paseo con estanques de koi, puentes rojos y maples japoneses: el fondo clásico de jardín para el vestido. Reciben sesiones de quinceañera con una cuota pequeña de foto más la entrada."
      },
      {
        "name": "Fort Worth Stockyards & Mule Alley",
        "why": "Brick streets and Western facades that read as Fort Worth in a single frame. The historic district is public and walkable — best early, before the crowds build.",
        "whyEs": "Calles de ladrillo y fachadas del Viejo Oeste que se ven Fort Worth en una sola foto. El distrito histórico es público y se camina; mejor temprano, antes de que se llene de gente."
      },
      {
        "name": "Trinity Park & Trinity Trails",
        "why": "Tree-lined paths along the Trinity River next to the Zoo, off University Drive — easy, green, and beautiful at golden hour for relaxed portraits.",
        "whyEs": "Senderos arbolados junto al río Trinity, al lado del zoológico, por University Drive: verde, cómodo y precioso a la hora dorada para fotos relajadas."
      },
      {
        "name": "Marine Park, North Side",
        "why": "The green heart of the historic Northside barrio off North Main, walking distance from the parishes — a meaningful spot if your family's roots are in the neighborhood.",
        "whyEs": "El corazón verde del histórico barrio del Northside, por North Main, a unos pasos de las parroquias: un lugar con sentido si las raíces de tu familia están en el vecindario."
      },
      {
        "name": "Fort Worth Cultural District",
        "why": "Open lawns and clean modernist architecture around the museums and the Will Rogers Memorial — an elegant, uncluttered backdrop a few minutes west of downtown.",
        "whyEs": "Jardines abiertos y arquitectura moderna y limpia alrededor de los museos y el Will Rogers Memorial: un fondo elegante y despejado, a unos minutos al oeste del centro."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Fort Worth?",
        "a": `My packages are ${STUDY} (Portrait Session, photo only), ${CINEMA} (Photo + Video), ${PRODUCTION} (Full Celebration — the one I recommend for most celebrations) and ${ARCHIVE} (Two-Day Celebration). There is no travel fee anywhere in Tarrant County or DFW, so the Fort Worth price is the price. You can see exactly what is in each on our Packages & Prices page, then sign the agreement online and lock in your date with a ${RETAINER_PCT} deposit once it's approved — or email us if you'd like a quick call first.`
      },
      {
        "q": "Where are the best places to take quince pictures in Fort Worth?",
        "a": "A few favorites: the Fort Worth Water Gardens downtown (free, dramatic concrete and water), the Japanese Garden inside the Botanic Garden (koi ponds and red bridges, small photo fee), the brick streets of the Stockyards and Mule Alley, and the riverside greenery of Trinity Park. Tell me the look you want and I will match the spot — and we can make it your portrait session before the celebration or fold it into the day."
      },
      {
        "q": "What part of Fort Worth do families hold the reception?",
        "a": "All over, depending on the parish. A lot of North Side families keep it close to North Main; others book halls along the South Freeway near La Gran Plaza, the east-side corridors around East Lancaster, or the event barns out by the Stockyards. Send me your church and your venue when you reach out and I will build the timeline so the drive between them works."
      },
      {
        "q": "Do you offer photo and video for Fort Worth quinceañeras?",
        "a": `Yes. Photo + Video, Full Celebration and Two-Day Celebration come with a team of ${CREW_CINEMA}, ${CREW_PRODUCTION} or ${CREW_ARCHIVE} — on the bigger packages you choose how many take photos and how many shoot video — so you get both, with a short trailer and short vertical videos for social media alongside the full-length video. If you only want portraits, the Portrait Session (${STUDY}) is photos only: ${HRS_STUDY} hours with one photographer.`
      },
      {
        "q": "What areas around Fort Worth do you cover?",
        "a": "All of Tarrant County and the wider metroplex — Haltom City, North Richland Hills, Saginaw, White Settlement, Benbrook, Crowley, Burleson, Arlington and beyond — with no travel fee. If your church is in Fort Worth and your reception is a few towns over, that is a normal Fort Worth quinceañera day for me. Reserve your date on our booking form."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Fort Worth?",
        "a": `Mis paquetes son de ${STUDY} (Sesión de retratos, solo foto), ${CINEMA} (Foto + Video), ${PRODUCTION} (Celebración completa — la que recomiendo para la mayoría de las celebraciones) y ${ARCHIVE} (Celebración de dos días). No hay cargo por traslado en el condado de Tarrant ni en DFW, así que el precio en Fort Worth es el precio. Puedes ver qué incluye cada uno en nuestra página de Paquetes y precios y luego firmar el contrato en línea y asegurar tu fecha con un depósito del ${RETAINER_PCT} cuando esté aprobado, o escríbenos si prefieres una llamada rápida primero.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quinceañera en Fort Worth?",
        "a": "Algunos favoritos: los Fort Worth Water Gardens en el centro (gratis, concreto y agua de mucho impacto), el Japanese Garden dentro del Botanic Garden (estanques de koi y puentes rojos, con una cuota pequeña de foto), las calles de ladrillo de los Stockyards y Mule Alley, y el verde junto al río en Trinity Park. Dime el estilo que buscas y te acomodo el lugar; lo podemos hacer como tu sesión de retrato antes de la celebración o dentro del mismo día."
      },
      {
        "q": "¿En qué parte de Fort Worth hacen la recepción las familias?",
        "a": "En todos lados, según la parroquia. Muchas familias del North Side la dejan cerca de North Main; otras reservan salones por la South Freeway cerca de La Gran Plaza, por los corredores del este como East Lancaster, o en los salones tipo granero por los Stockyards. Mándame tu iglesia y tu salón cuando me escribas y armo el itinerario para que el traslado entre los dos funcione."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Fort Worth?",
        "a": `Sí. Foto + Video, Celebración completa y Celebración de dos días traen un equipo de ${CREW_CINEMA}, ${CREW_PRODUCTION} o ${CREW_ARCHIVE} personas —en los paquetes más grandes tú eliges cuántos son fotógrafos y cuántos videógrafos— para que tengas los dos, con un tráiler corto y videos verticales cortos para redes sociales junto con el video completo. Si solo quieres retratos, la Sesión de retratos (${STUDY}) es solo de fotos: ${HRS_STUDY} horas con un fotógrafo.`
      },
      {
        "q": "¿Qué zonas alrededor de Fort Worth cubres?",
        "a": "Todo el condado de Tarrant y el resto del metroplex — Haltom City, North Richland Hills, Saginaw, White Settlement, Benbrook, Crowley, Burleson, Arlington y más — sin cargo por traslado. Si tu iglesia está en Fort Worth y tu recepción queda a unos pueblos de distancia, para mí es un día normal de quinceañera en Fort Worth. Aparta tu fecha en nuestro formulario de reservación."
      }
    ]
  },
  "arlington": {
    "intro": [
      "Arlington doesn't have one old downtown the way Fort Worth or Dallas do. It spreads wide between the two of them, and quinceañera families pull from both sides. The Mexican-American community here is anchored in Old Town and the central corridors off Division Street and Cooper, where Spanish is the language of the panadería and the neighborhood parish. A quince in Arlington tends to gather guests from Grand Prairie, Mansfield, and the Mid-Cities, all a short drive away.",
      "What makes Arlington portraits different is the range packed into one city. The Entertainment District gives you the bold, unmistakable backdrops: Globe Life Field, AT&T Stadium, and the granite monument sculptures at Richard Greene Linear Park sitting right between them. Ten minutes north, River Legacy Parks opens into 1,300 acres of bottomland forest along the Trinity River, and Veterans Park puts gazebos, garden beds, and spring bluebonnets in the frame. We can shoot a stadium-sized statement and a quiet green portrait the same afternoon.",
      "I photograph one quinceañera a day in Arlington, start to finish: the Sunday misa at a central or south-side parish, portraits wherever you want them, el vals, and the reception, whether your hall is out along Pioneer Parkway or down in South Arlington near Cooper and I-20. Everything is bilingual, English or Spanish, so your grandparents follow every direction as easily as you do, and there's no travel fee anywhere in the metroplex."
    ],
    "introEs": [
      "Arlington no tiene un solo centro histórico como Fort Worth o Dallas; se extiende ancho entre las dos ciudades, y las familias de quinceañera llegan de los dos lados. La comunidad mexicana aquí se concentra en Old Town y en los corredores centrales por Division Street y Cooper, donde el español es el idioma de la panadería y de la parroquia del barrio. Una quince en Arlington suele juntar invitados de Grand Prairie, Mansfield y los Mid-Cities, todos a unos minutos.",
      "Lo que hace distintas las fotos en Arlington es la variedad que cabe en una sola ciudad. El Entertainment District te da los fondos llamativos e inconfundibles: el Globe Life Field, el AT&T Stadium y las esculturas de granito de Richard Greene Linear Park justo en medio de los dos. Diez minutos al norte, River Legacy Parks se abre en 1,300 acres de bosque junto al río Trinity, y Veterans Park pone glorietas, jardines y campos de bluebonnets en primavera. Podemos hacer una foto del tamaño de un estadio y un retrato verde y tranquilo la misma tarde.",
      "Fotografío una sola quinceañera al día en Arlington, de principio a fin: la misa del domingo en una parroquia del centro o del sur, las fotos donde tú quieras, el vals y la recepción, ya sea que tu salón esté por Pioneer Parkway o en el sur de Arlington cerca de Cooper y la I-20. Todo es bilingüe, en inglés o español, para que tus abuelos sigan cada indicación igual de fácil que tú, y sin cargo por traslado en todo el metroplex."
    ],
    "photoSpots": [
      {
        "name": "Richard Greene Linear Park (Entertainment District)",
        "why": "The granite monument sculptures by Norm Hines sit in the heart of the Entertainment District, framed by AT&T Stadium and the ballpark. It's a dramatic, almost ancient-ruins backdrop that's unmistakably Arlington, with an open lawn and a lake for softer frames.",
        "whyEs": "Las esculturas de granito de Norm Hines están en pleno Entertainment District, enmarcadas por el AT&T Stadium y el estadio de béisbol. Es un fondo dramático, casi de ruinas antiguas, inconfundiblemente de Arlington, con pasto abierto y un lago para tomas más suaves."
      },
      {
        "name": "River Legacy Parks",
        "why": "1,300 acres of forest, trails, and Trinity River overlooks in northwest Arlington: green tunnels and golden light. Professional sessions here need a quick photo permit from Arlington Parks (817-459-5473), which I help you arrange.",
        "whyEs": "1,300 acres de bosque, senderos y miradores al río Trinity en el noroeste de Arlington: túneles verdes y luz dorada. Las sesiones profesionales aquí necesitan un permiso rápido de los parques de Arlington (817-459-5473), que yo te ayudo a gestionar."
      },
      {
        "name": "Veterans Park",
        "why": "Over 100 acres in central Arlington with gazebos, manicured garden beds, a pond and fountain, and patches of bluebonnets in spring. It's the classic, romantic portrait setting, close to most central-Arlington homes.",
        "whyEs": "Más de 100 acres en el centro de Arlington con glorietas, jardines cuidados, un estanque con fuente y campos de bluebonnets en primavera. Es el escenario clásico y romántico, cerca de la mayoría de las casas del centro de Arlington."
      },
      {
        "name": "Founders Plaza & Levitt Pavilion (Downtown Arlington)",
        "why": "Across from City Hall in downtown Arlington, the open plaza and performance stage give a clean, modern urban look: brick, columns, and city lines. A good contrast to the parks.",
        "whyEs": "Frente al City Hall en el centro de Arlington, la plaza abierta y el escenario dan un look urbano y moderno: ladrillo, columnas y líneas de la ciudad. Un buen contraste con los parques."
      },
      {
        "name": "Lake Arlington / Bowman Springs Park",
        "why": "On the southwest shoreline, big shade trees and open water make this the spot for golden-hour portraits with the lake behind you: calm, wide, and uncrowded in the late afternoon.",
        "whyEs": "En la orilla suroeste, los árboles grandes con sombra y el agua abierta lo hacen el lugar para retratos a la hora dorada con el lago detrás: tranquilo, amplio y sin gente a media tarde."
      },
      {
        "name": "Knapp Heritage Park (Old Town)",
        "why": "Three of Arlington's oldest structures, 1850s log cabins and a 1909 schoolhouse, preserved in Old Town and open to the public on weekends (free). A rustic, heritage backdrop a few blocks from the historic Mexican-American part of the city.",
        "whyEs": "Tres de las construcciones más antiguas de Arlington, cabañas de troncos de los 1850 y una escuela de 1909, preservadas en Old Town y abiertas al público los fines de semana (gratis). Un fondo rústico y con historia, a unas cuadras de la parte mexicana histórica de la ciudad."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Arlington?",
        "a": `My packages run from ${STUDY} (Portrait Session) to ${ARCHIVE} (Two-Day Celebration), with the Full Celebration at ${PRODUCTION} the one I recommend for most celebrations — photos, video, a portrait session at one location and a 40-page printed photo album. Photo + Video is ${CINEMA}. There's no travel fee anywhere in Arlington or the rest of DFW. You can see exactly what's in each one on our Packages & Prices page.`
      },
      {
        "q": "Where are the best places to take quince pictures in Arlington?",
        "a": "For a bold look, the Entertainment District: Richard Greene Linear Park's granite sculptures with the stadiums behind you. For green and romantic, River Legacy Parks along the Trinity River or Veterans Park's gardens and gazebos. Lake Arlington works for golden-hour shoreline portraits, and downtown's Founders Plaza gives a clean urban frame. River Legacy needs a quick city photo permit, which I'll help arrange."
      },
      {
        "q": "What areas of Arlington do quinceañera receptions usually happen?",
        "a": "Banquet halls cluster along Pioneer Parkway toward Pantego, the Division Street corridor through central Arlington, and South Arlington near Cooper Street and I-20. I work in all of them and stay through the whole reception. Tell me where your hall is and I'll plan the day's timing around it, with no travel fee within DFW."
      },
      {
        "q": "Do you offer photo and video for a quinceañera in Arlington?",
        "a": `Yes. Photo + Video (${CINEMA}) pairs photos with an 8–10 minute full-length video in 4K, and the Full Celebration (${PRODUCTION}) extends it to a 12–15 minute full-length video, a 90-second short trailer and four short vertical videos for social media. And if you can't wait to share it, the Same-Day Edit (${SAMEDAY}) gives you a short highlight video within 24 hours.`
      },
      {
        "q": "What areas around Arlington do you serve?",
        "a": "Arlington sits in the center of everything, so besides the whole city I regularly photograph Grand Prairie, Mansfield, Pantego, Dalworthington Gardens, Kennedale, Fort Worth, and the Mid-Cities, all with no travel fee. I only take one celebration a day, though, so the surest way to hold your date is to check it early."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Arlington?",
        "a": `Mis paquetes van de ${STUDY} (Sesión de retratos) a ${ARCHIVE} (Celebración de dos días), y la Celebración completa, en ${PRODUCTION}, es la que recomiendo para la mayoría de las celebraciones: fotos, video, una sesión de retrato en una locación y un álbum de fotos impreso de 40 páginas. Foto + Video cuesta ${CINEMA}. No hay cargo por traslado en Arlington ni en el resto de DFW. Puedes ver todo lo que incluye cada uno en nuestra página de Paquetes y precios.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Arlington?",
        "a": "Para un look llamativo, el Entertainment District: las esculturas de granito de Richard Greene Linear Park con los estadios atrás. Para algo verde y romántico, River Legacy Parks junto al río Trinity o los jardines y glorietas de Veterans Park. Lake Arlington es ideal para retratos a la orilla con la luz dorada, y el Founders Plaza del centro da un marco urbano limpio. River Legacy pide un permiso rápido de foto de la ciudad, que yo te ayudo a tramitar."
      },
      {
        "q": "¿En qué zonas de Arlington se hacen las recepciones de quinceañera?",
        "a": "Los salones se concentran por Pioneer Parkway rumbo a Pantego, el corredor de Division Street en el centro de Arlington, y el sur de Arlington cerca de Cooper Street y la I-20. Trabajo en todos y me quedo toda la recepción. Dime dónde es tu salón y armo los tiempos del día alrededor de eso, sin cargo por traslado dentro de DFW."
      },
      {
        "q": "¿Ofreces foto y video para una quinceañera en Arlington?",
        "a": `Sí. Foto + Video (${CINEMA}) junta las fotos con un video completo en 4K de 8 a 10 minutos, y Celebración completa (${PRODUCTION}) la lleva a un video completo de 12 a 15 minutos, un tráiler corto de 90 segundos y cuatro videos verticales cortos para redes sociales. Y si no puedes esperar para compartirlo, la Edición el mismo día (${SAMEDAY}) te da un video corto de lo mejor en 24 horas.`
      },
      {
        "q": "¿Qué zonas alrededor de Arlington cubres?",
        "a": "Arlington está en el centro de todo, así que además de toda la ciudad fotografío seguido en Grand Prairie, Mansfield, Pantego, Dalworthington Gardens, Kennedale, Fort Worth y los Mid-Cities, todo sin cargo por traslado. Eso sí, solo tomo una celebración al día, así que lo más seguro para apartar tu fecha es revisarla con tiempo."
      }
    ]
  },
  "mansfield": {
    "intro": [
      "Mansfield sits at the southeast corner of the metroplex, on the line where Tarrant County slips into Johnson County and the subdivisions give way to creeks, country-club fairways, and one of the largest park systems in this part of DFW. The Mexican-American families here have put down real roots: you'll hear Spanish at the Saturday vigil and Sunday Mass in the bilingual parishes east of downtown, and the panaderías and taquerías along the Broad Street and US-287 corridors stay busy all weekend when there's a quince. When a family in Mansfield plans the day, they tend to give themselves room to do every part of it.",
      "That's a gift for portraits, because the backdrops are here to match. Historic Downtown Mansfield gives you brick storefronts, the 1917 Farr Best Theater marquee, and a run of hand-painted murals along Main Street; ten minutes south, Elmer W. Oliver Nature Park opens up to ponds, a wooden boardwalk, and the windmill the whole city photographs — and by March the meadows fill in with bluebonnets. Add the rose garden at Katherine Rose Memorial Park and the shaded creek bridges of the Walnut Creek Linear Trail and you can build a portrait route that never repeats the same look twice.",
      "I photograph one quinceañera a day, so the day belongs to your family alone — la misa, the formal portraits, el vals, the baile sorpresa, and the reception, start to finish, with nothing on my calendar after you. Everything runs bilingual. Mansfield is a natural fit for the Full Celebration and the Two-Day Celebration, where photos and video carry the whole night and a printed photo album holds it afterward — but it's the day, not the package, that drives how I shoot it."
    ],
    "introEs": [
      "Mansfield está en el extremo sureste del metroplex, en la línea donde el condado de Tarrant se mete en el de Johnson y los fraccionamientos dan paso a arroyos, los fairways del club de golf y uno de los sistemas de parques más grandes de esta zona de DFW. Las familias mexicanas de aquí ya echaron raíces de verdad: se escucha español en la misa de vigilia del sábado y en las misas del domingo en las parroquias bilingües al este del centro, y las panaderías y taquerías por Broad Street y la US-287 no paran el fin de semana cuando hay quince. Cuando una familia de Mansfield planea el día, se da el tiempo para hacer cada parte como se debe.",
      "Eso es una ventaja para las fotos, porque los fondos están aquí para acompañarlo. El Historic Downtown te da fachadas de ladrillo, la marquesina del Farr Best Theater de 1917 y una serie de murales pintados a mano sobre Main Street; diez minutos al sur, el Elmer W. Oliver Nature Park se abre con lagunas, un puente de madera y el molino de viento que toda la ciudad fotografía — y para marzo los campos se llenan de bluebonnets. Súmale el jardín de rosas del Katherine Rose Memorial Park y los puentes sombreados del Walnut Creek Linear Trail y armas una ruta de fotos que nunca repite el mismo look.",
      "Fotografío una sola quinceañera al día, así que el día es solo de tu familia: la misa, las fotos formales, el vals, el baile sorpresa y la recepción, de principio a fin, sin nada más en mi agenda después de ustedes. Todo es bilingüe. Mansfield encaja natural con la Celebración completa y la Celebración de dos días, donde las fotos y el video cargan toda la noche y un álbum de fotos impreso la guarda después — pero es el día, no el paquete, lo que define cómo lo fotografío."
    ],
    "photoSpots": [
      {
        "name": "Elmer W. Oliver Nature Park",
        "why": "Eighty-plus acres of ponds, wooded canopy, a wooden boardwalk, and the iconic windmill — and in March the meadows fill with bluebonnets. The most photographed open space in Mansfield, and the easiest place to get a range of nature backdrops in a single stop.",
        "whyEs": "Más de ochenta acres de lagunas, arboledas, un puente de madera y el famoso molino de viento — y en marzo los campos se llenan de bluebonnets. El espacio más fotografiado de Mansfield y el lugar más fácil para tener varios fondos naturales en una sola parada."
      },
      {
        "name": "Katherine Rose Memorial Park (Katherine's Garden)",
        "why": "A 33-acre park with a dedicated rose garden right at the front and big mature trees — soft, formal, and classic, made for the gown and court portraits.",
        "whyEs": "Un parque de 33 acres con un jardín de rosas justo al frente y árboles grandes y maduros — suave, formal y clásico, hecho para las fotos del vestido y de la corte."
      },
      {
        "name": "Historic Downtown Mansfield (Main Street murals & Farr Best Theater)",
        "why": "Brick storefronts, the 1917 Farr Best Theater marquee, and a stretch of hand-painted Main Street murals give you an urban, editorial look without leaving town.",
        "whyEs": "Fachadas de ladrillo, la marquesina del Farr Best Theater de 1917 y un tramo de murales pintados a mano sobre Main Street te dan un look urbano y editorial sin salir de la ciudad."
      },
      {
        "name": "Walnut Creek Linear Trail",
        "why": "A shaded two-mile trail linking Town, Rose, and James McKnight parks, with creek bridges and natural tree canopies — green, private-feeling frames a short walk from downtown.",
        "whyEs": "Un sendero sombreado de dos millas que une los parques Town, Rose y James McKnight, con puentes sobre el arroyo y túneles de árboles — fondos verdes y tranquilos a pocos pasos del centro."
      },
      {
        "name": "Lucretia Mills Gazebo",
        "why": "A small historic gazebo near Broad Street and Walnut Creek, dressed up seasonally — a tidy, romantic single-spot backdrop for a few standout portraits.",
        "whyEs": "Un pequeño gazebo histórico cerca de Broad Street y Walnut Creek, decorado según la temporada — un fondo romántico y ordenado para unas cuantas fotos destacadas."
      },
      {
        "name": "Britton Park at Joe Pool Lake",
        "why": "On the Mansfield side of Joe Pool Lake, with open water and big sky — the spot for a sunset and golden-hour portraits (seasonal access, small entry fee).",
        "whyEs": "Del lado de Mansfield del lago Joe Pool, con agua abierta y cielo amplio — el lugar para el atardecer y las fotos de hora dorada (acceso por temporada, con cuota pequeña de entrada)."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Mansfield?",
        "a": `Packages are ${STUDY} (Portrait Session), ${CINEMA} (Photo + Video), ${PRODUCTION} (Full Celebration, the one I recommend for most celebrations) and ${ARCHIVE} (Two-Day Celebration). A ${RETAINER_PCT} deposit locks in the date once your agreement is approved, and the rest is due ${BALANCE_HOURS} hours before the event. There's no travel fee anywhere in DFW, so Mansfield's southeast-corner location never adds to the price.`
      },
      {
        "q": "Where are the best places to take quince pictures in Mansfield?",
        "a": "My go-to spots are Elmer W. Oliver Nature Park (the windmill, ponds, and spring bluebonnets), the rose garden at Katherine Rose Memorial Park, the Main Street murals and Farr Best Theater marquee in Historic Downtown, and the shaded bridges of the Walnut Creek Linear Trail. We can shoot these as a portrait session before the celebration or fit a couple into the day's timeline."
      },
      {
        "q": "Where do Mansfield families usually hold the reception?",
        "a": "Most receptions land at event halls and banquet spaces along the US-287 and Highway 360 corridors, around the Broad Street and Matlock areas, and at downtown gathering spaces near Main Street. Tell me your church and your venue when you reach out and I'll build the timeline around both."
      },
      {
        "q": "Do you offer both photo and video for a Mansfield quinceañera?",
        "a": `Yes. Photo + Video (${CINEMA}) and Full Celebration (${PRODUCTION}) pair photos with a full-length video in 4K, and the Two-Day Celebration (${ARCHIVE}) goes further — a team of ${CREW_ARCHIVE} and a day-of coordinator, ${HRS_ARCHIVE} hours plus a second day for portraits, a 20-minute full-length video and a 2-minute short trailer. If you don't need video, the Portrait Session (${STUDY}) is photo only.`
      },
      {
        "q": "Which areas near Mansfield do you cover?",
        "a": "All of them — Mansfield sits between Arlington, Grand Prairie, Kennedale, Burleson, Midlothian, and Cedar Hill, and I photograph quinceañeras across the entire Dallas–Fort Worth metroplex with no travel fee. Wherever your misa and reception are, I'm there for the full day."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Mansfield?",
        "a": `Los paquetes son ${STUDY} (Sesión de retratos), ${CINEMA} (Foto + Video), ${PRODUCTION} (Celebración completa, la que recomiendo para la mayoría de las celebraciones) y ${ARCHIVE} (Celebración de dos días). Un depósito del ${RETAINER_PCT} asegura la fecha una vez aprobado tu contrato, y el resto se paga ${BALANCE_HOURS} horas antes del evento. No hay cargo por traslado en ningún punto de DFW, así que estar en el extremo sureste del metroplex nunca sube el precio.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Mansfield?",
        "a": "Mis lugares de cabecera son el Elmer W. Oliver Nature Park (el molino, las lagunas y los bluebonnets de primavera), el jardín de rosas del Katherine Rose Memorial Park, los murales de Main Street y la marquesina del Farr Best Theater en el Historic Downtown, y los puentes sombreados del Walnut Creek Linear Trail. Los podemos hacer como sesión de retrato antes de la celebración o acomodar un par dentro del itinerario del día."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Mansfield?",
        "a": "La mayoría de las recepciones cae en salones y espacios para eventos por los corredores de la US-287 y la Highway 360, por las zonas de Broad Street y Matlock, y en los espacios del centro cerca de Main Street. Dime tu iglesia y tu salón cuando me escribas y armo el itinerario alrededor de los dos."
      },
      {
        "q": "¿Ofreces foto y video para una quinceañera en Mansfield?",
        "a": `Sí. Foto + Video (${CINEMA}) y Celebración completa (${PRODUCTION}) combinan las fotos con un video completo en 4K, y la Celebración de dos días (${ARCHIVE}) va más allá: un equipo de ${CREW_ARCHIVE} y una coordinadora del día, ${HRS_ARCHIVE} horas más un segundo día de retratos, un video completo de 20 minutos y un tráiler corto de 2 minutos. Si no necesitas video, la Sesión de retratos (${STUDY}) es solo de foto.`
      },
      {
        "q": "¿Qué zonas cerca de Mansfield cubres?",
        "a": "Todas — Mansfield está entre Arlington, Grand Prairie, Kennedale, Burleson, Midlothian y Cedar Hill, y fotografío quinceañeras en todo el metroplex de Dallas–Fort Worth sin cargo por traslado. Donde sea que estén tu misa y tu recepción, ahí estoy todo el día."
      }
    ]
  },
  "farmers-branch": {
    "intro": [
      "Farmers Branch is compact, but its roots run deep. The City Center neighborhood — the blocks around Webb Chapel and Valley View — holds one of the highest concentrations of Mexican-American families of any neighborhood in the country, where most households speak Spanish at home and a quinceañera is something the whole street helps pull off. This is a town that knows exactly what the day means.",
      "Locals call it “the City in the Park,” and the centerpiece is the 27-acre Farmers Branch Historical Park sitting right in the middle of town. An 1890s white church, an 1885 Queen Anne cottage, brick walkways, a gazebo, and the Ruthan Rogers rose garden out front make it one of the best portrait settings in North Dallas — it looks like a different century, which is exactly the backdrop you want behind a full ballgown. (The city started life as “Mustang Branch” before the farmland gave it its name; the old depot, caboose, and log cabins on the grounds still tell that story.)",
      "I only book one celebration a day, so your Saturday is the only thing on my calendar — la misa, the portraits, your entrada, the father-daughter vals, the baile sorpresa, and the reception after, all of it documented by one team that is actually present for the whole thing. There is no travel fee anywhere in DFW, and with the packages that include video, a short trailer lets you share the day while it is still fresh."
    ],
    "introEs": [
      "Farmers Branch es chiquito, pero de raíces hondas. El barrio de City Center —las cuadras por Webb Chapel y Valley View— tiene una de las concentraciones de familias mexicanas más altas de cualquier vecindario del país: en la mayoría de las casas se habla español y una quinceañera es algo que saca adelante toda la cuadra. Aquí se sabe muy bien lo que significa el día.",
      "Le dicen “la ciudad en el parque”, y el corazón es el Farmers Branch Historical Park, de 27 acres, justo en el centro del pueblo. Una iglesia blanca de los 1890, una casita Queen Anne de 1885, caminos de ladrillo, un kiosco y el jardín de rosas Ruthan Rogers al frente lo hacen uno de los mejores lugares para fotos de todo el norte de Dallas: parece de otra época, justo el fondo que quieres detrás de un vestido de gala. (El pueblo empezó llamándose “Mustang Branch” antes de que la tierra de cultivo le diera su nombre; la vieja estación de tren, el vagón y las cabañas de troncos del parque todavía lo cuentan.)",
      "Solo reservo una celebración al día, así que tu sábado es lo único en mi calendario: la misa, las fotos, tu entrada, el vals con tu papá, el baile sorpresa y la recepción, todo documentado por un equipo que de verdad está presente toda la jornada. No hay cargo por traslado en ningún punto de DFW, y con los paquetes que incluyen video, un tráiler corto te deja compartir el día mientras sigue fresquecito."
    ],
    "photoSpots": [
      {
        "name": "Farmers Branch Historical Park (2540 Farmers Branch Ln)",
        "why": "Twenty-seven acres of restored 19th-century buildings in the middle of town — an 1890s white church, an 1885 Queen Anne cottage, a gazebo, brick walkways, and a depot with a caboose. It is the single most-used quince portrait spot in the city, and it is fully public.",
        "whyEs": "Veintisiete acres de edificios restaurados del siglo XIX en pleno centro: una iglesia blanca de los 1890, una casita Queen Anne de 1885, un kiosco, caminos de ladrillo y una estación con su vagón. Es el lugar de fotos de quince más usado de la ciudad, y es totalmente público."
      },
      {
        "name": "The Rose Gardens of Farmers Branch (off Valley View Lane)",
        "why": "A cluster of award-winning EarthKind rose gardens — including the Ruthan Rogers garden — with formal beds and arbors. In spring and fall the blooms frame a gown beautifully, and it is a short walk from the Historical Park.",
        "whyEs": "Un conjunto de jardines de rosas EarthKind premiados —incluido el Ruthan Rogers— con jardineras formales y arcos. En primavera y otoño las flores enmarcan precioso un vestido, y queda a unos pasos del Historical Park."
      },
      {
        "name": "Gussie Field Watterworth Park (2610 Valley View Ln)",
        "why": "A 104-acre park with a creek, a small lake, big shade trees, and wide open lawns — room for the full court to spread out for relaxed, natural-light group shots. The rose gardens sit right along its trail.",
        "whyEs": "Un parque de 104 acres con arroyo, un lago pequeño, árboles grandes y prados amplios: espacio para que toda la corte se acomode en fotos de grupo con luz natural. Los jardines de rosas están justo sobre su sendero."
      },
      {
        "name": "Brookhaven Trail (near Brookhaven College)",
        "why": "A shaded, tree-lined paved trail that runs by Brookhaven College and links into the Addison Trail. It gives you a quiet green-tunnel look for softer, candid portraits away from any crowd.",
        "whyEs": "Un sendero pavimentado con sombra y bordeado de árboles que pasa por Brookhaven College y conecta con el Addison Trail. Te da un túnel verde tranquilo para retratos más suaves y espontáneos, lejos del gentío."
      },
      {
        "name": "Mercer Crossing lake trail (west Farmers Branch)",
        "why": "The newer west side of the city, with a lake and a hike-and-bike trail along the water and modern architecture. It is the clean, contemporary contrast to the historic park if you want a second, more current look.",
        "whyEs": "El lado oeste más nuevo de la ciudad, con un lago y un sendero para caminar y andar en bici junto al agua, además de arquitectura moderna. Es el contraste limpio y actual al parque histórico si quieres un segundo look más contemporáneo."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Farmers Branch?",
        "a": `My packages run ${STUDY} for the Portrait Session (photo only), ${CINEMA} for Photo + Video, ${PRODUCTION} for the Full Celebration — the one I recommend for most celebrations — and ${ARCHIVE} for the Two-Day Celebration. Pricing is the same across DFW with no travel fee to Farmers Branch, and you can sign the agreement online — I'll hold the date for ${HOLD_DAYS} days while we review it, then a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`
      },
      {
        "q": "Where are the best places to take quince pictures in Farmers Branch?",
        "a": "The Farmers Branch Historical Park is the top pick — 27 acres with an 1890s white church, a Queen Anne cottage, a gazebo, and brick walkways. The Rose Gardens of Farmers Branch off Valley View Lane and the lawns and creek at Gussie Field Watterworth Park are close by, and the Brookhaven Trail and the Mercer Crossing lake give you shaded and modern looks. All of them are public; we just plan around the light and your timeline."
      },
      {
        "q": "Where do families hold quinceañera receptions in Farmers Branch?",
        "a": "Some celebrate right on the city's own Historical Park grounds, while many book banquet halls along the LBJ Freeway (I-635) corridor and the Valley View Lane area, or a salón just over the line in Carrollton or Northwest Dallas. Wherever the reception lands, I cover the church, portraits, and the party as one continuous day."
      },
      {
        "q": "Do you offer both photo and video in Farmers Branch?",
        "a": `Yes. Photo + Video (${CINEMA}) and Full Celebration (${PRODUCTION}) both pair photos with video, so you get the photos and a full-length video in 4K of the misa, the vals, and the reception. If your family wants the look of real old-style video, the Vintage Film Clip (Super 8) is ${SUPER8}.`
      },
      {
        "q": "What areas near Farmers Branch do you serve?",
        "a": "Farmers Branch sits right against Carrollton, Addison, Irving, and Northwest Dallas, and I photograph quinceañeras across all of them — plus Coppell, Lewisville, and the rest of the metroplex — with no travel fee anywhere in DFW."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Farmers Branch?",
        "a": `Mis paquetes van de ${STUDY} con la Sesión de retratos (solo foto), ${CINEMA} con Foto + Video, ${PRODUCTION} con la Celebración completa —la que recomiendo para la mayoría de las celebraciones— y ${ARCHIVE} con la Celebración de dos días. El precio es el mismo en todo DFW, sin cargo por traslado a Farmers Branch, y puedes firmar el contrato en línea: te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos, y luego un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Farmers Branch?",
        "a": "El Farmers Branch Historical Park es el favorito: 27 acres con una iglesia blanca de los 1890, una casita Queen Anne, un kiosco y caminos de ladrillo. Cerquita están las Rose Gardens de Farmers Branch por Valley View Lane y los prados y el arroyo del Gussie Field Watterworth Park, y para algo con sombra o más moderno tienes el Brookhaven Trail y el lago de Mercer Crossing. Todos son públicos; solo planeamos según la luz y tu itinerario."
      },
      {
        "q": "¿Dónde hacen las familias las recepciones de quinceañera en Farmers Branch?",
        "a": "Algunas celebran en los mismos terrenos del Historical Park de la ciudad, y muchas reservan salones por el corredor del LBJ Freeway (I-635) y la zona de Valley View Lane, o un salón cruzando a Carrollton o el noroeste de Dallas. Donde sea que caiga la recepción, cubro la iglesia, las fotos y la fiesta como un solo día continuo."
      },
      {
        "q": "¿Ofreces foto y video en Farmers Branch?",
        "a": `Sí. Foto + Video (${CINEMA}) y Celebración completa (${PRODUCTION}) combinan fotos con video, así te llevas las fotos y un video completo en 4K de la misa, el vals y la recepción. Si tu familia quiere el look de video antigua de verdad, el Clip de película vintage (Super 8) cuesta ${SUPER8}.`
      },
      {
        "q": "¿Qué áreas cerca de Farmers Branch cubres?",
        "a": "Farmers Branch pega con Carrollton, Addison, Irving y el noroeste de Dallas, y fotografío quinceañeras en todas —además de Coppell, Lewisville y el resto del metroplex— sin cargo por traslado en ningún punto de DFW."
      }
    ]
  },
  "frisco": {
    "intro": [
      "Frisco has been one of the fastest-growing cities in the country for two decades, and a quinceañera here is often planned like a destination event: a hotel or resort ballroom, a full court, and relatives driving up from across Texas for the weekend. The city straddles the Collin–Denton county line, and the families who celebrate here keep the whole tradition intact — the misa, the court of honor, the vals with Papá, the baile sorpresa — just set against a newer, more polished backdrop than the older parts of the metroplex.",
      "That backdrop is the point. The Star in Frisco gives you glass, steel and open plazas around the Ford Center; Frisco Square has the civic lawns and tree-lined streets around City Hall; and a few blocks east, the Rail District along Main Street keeps the brick, the murals and the railroad history of the original town. For something green, Frisco Commons Park has water features, a pond and big open lawns a short walk from Frisco Square, so we can move from city to garden without losing the afternoon light.",
      `I photograph one quinceañera a day, in English and Spanish, with no travel fee anywhere in DFW — Frisco included. For a Frisco celebration I recommend the Full Celebration (${PRODUCTION}): ${HRS_PRODUCTION} hours with a team of ${CREW_PRODUCTION} and a day-of coordinator, a portrait session at one location, a 12–15 minute full-length video and a 40-page printed photo album. If your family is planning a welcome dinner or a second day around the quince, the Two-Day Celebration (${ARCHIVE}) is built for exactly that — a team of ${CREW_ARCHIVE} and a day-of coordinator, ${HRS_ARCHIVE} hours on the day plus a second day for portraits.`
    ],
    "introEs": [
      "Frisco lleva dos décadas entre las ciudades que más crecen en el país, y aquí una quinceañera muchas veces se planea como evento de destino: un salón de hotel o de resort, la corte completa y parientes que llegan de todo Texas para el fin de semana. La ciudad está partida entre los condados de Collin y Denton, y las familias que celebran aquí mantienen la tradición completa —la misa, la corte de honor, el vals con papá, el baile sorpresa—, solo que con un fondo más nuevo y pulido que el de las zonas más antiguas del metroplex.",
      "Ese fondo es justo lo especial. The Star in Frisco te da cristal, acero y plazas abiertas alrededor del Ford Center; Frisco Square tiene los jardines cívicos y las calles arboladas alrededor del City Hall; y unas cuadras al este, el Rail District sobre Main Street conserva el ladrillo, los murales y la historia ferroviaria del pueblo original. Si quieres verde, Frisco Commons Park tiene fuentes, un estanque y prados amplios a unos pasos de Frisco Square, así que pasamos de la ciudad al jardín sin perder la luz de la tarde.",
      `Fotografío una sola quinceañera al día, en inglés y español, sin cargo por traslado en ningún lugar de DFW, Frisco incluido. Para una celebración en Frisco recomiendo la Celebración completa (${PRODUCTION}): ${HRS_PRODUCTION} horas con un equipo de ${CREW_PRODUCTION} y una coordinadora del día, una sesión de retrato en una locación, un video completo de 12 a 15 minutos y un álbum de fotos impreso de 40 páginas. Si tu familia planea una cena de bienvenida o un segundo día alrededor del quince, la Celebración de dos días (${ARCHIVE}) está hecha justo para eso: un equipo de ${CREW_ARCHIVE} y una coordinadora del día, ${HRS_ARCHIVE} horas el día de la fiesta más un segundo día de retratos.`
    ],
    "photoSpots": [
      {
        "name": "The Star in Frisco",
        "why": "The Dallas Cowboys' headquarters district — open plazas, modern glass and steel, and the Ford Center at its heart. Bold and contemporary; it's a busy public district, so we shoot early or between events.",
        "whyEs": "El distrito de la sede de los Dallas Cowboys: plazas abiertas, cristal y acero modernos, y el Ford Center al centro. Llamativo y contemporáneo; es una zona pública con mucho movimiento, así que fotografiamos temprano o entre eventos."
      },
      {
        "name": "Frisco Square & City Hall",
        "why": "Clean civic architecture, open lawns and tree-lined streets around Frisco's City Hall — a polished, editorial look a few minutes from most Frisco venues.",
        "whyEs": "Arquitectura cívica limpia, jardines abiertos y calles arboladas alrededor del City Hall de Frisco: un look pulido y editorial a unos minutos de la mayoría de los salones de Frisco."
      },
      {
        "name": "Frisco Commons Park",
        "why": "A large central park with water features, a pond, a pavilion and wide lawns — soft, green frames and room for the whole court to spread out.",
        "whyEs": "Un parque central grande con fuentes, un estanque, un pabellón y prados amplios: tomas verdes y suaves, con espacio para que toda la corte se acomode."
      },
      {
        "name": "Rail District / Historic Downtown Frisco (Main Street)",
        "why": "The original town along the railroad — brick storefronts, murals and a small-town feel that contrasts beautifully with the newer side of the city.",
        "whyEs": "El pueblo original junto a las vías: fachadas de ladrillo, murales y un ambiente de pueblo que contrasta precioso con el lado más nuevo de la ciudad."
      },
      {
        "name": "Frisco Heritage Center",
        "why": "Preserved early-Frisco buildings beside the Frisco Heritage Museum — a vintage, story-rich setting for a few heritage portraits. Sessions there are arranged with the city in advance.",
        "whyEs": "Construcciones antiguas de los primeros años de Frisco junto al Frisco Heritage Museum: un fondo vintage y con historia para unos retratos especiales. Las sesiones ahí se coordinan con la ciudad por adelantado."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Frisco?",
        "a": `My packages run from ${STUDY} for the Portrait Session to ${ARCHIVE} for the Two-Day Celebration, with Photo + Video at ${CINEMA} and Full Celebration at ${PRODUCTION} — the one I recommend for most celebrations. For context, most DFW quince studios publish packages between about $1,500 and $6,000; my packages are built for families who want a photographer, a videographer and a printed photo album, not just a gallery link. There's no travel fee to Frisco; compare all four on our Packages & Prices page.`
      },
      {
        "q": "Where are the best places to take quince pictures in Frisco?",
        "a": "The plazas around the Ford Center at The Star for a bold, modern look; the civic lawns of Frisco Square and the water features at Frisco Commons Park for something polished and green; the brick and murals of the Rail District on Main Street for a vintage feel; and the Frisco Heritage Center for a few heritage frames. We pick two that sit close together so the day stays easy."
      },
      {
        "q": "Where do Frisco families usually hold the reception?",
        "a": "Frisco celebrations lean toward hotel and resort ballrooms — around The Star and the Dallas North Tollway, at the resort near PGA Frisco, and at event venues along the Highway 121 and Preston Road corridors — plus private venues out in the Collin and Denton County countryside. Send me your church and your venue and I'll build the timeline around the drive between them."
      },
      {
        "q": "Do you offer photo and video for quinceañeras in Frisco?",
        "a": `Yes. Photo + Video (${CINEMA}), Full Celebration (${PRODUCTION}) and Two-Day Celebration (${ARCHIVE}) all put photographers and videographers on the same day — a team of ${CREW_CINEMA}, ${CREW_PRODUCTION} or ${CREW_ARCHIVE}, in the mix you choose. For families who want to share right away, the Same-Day Edit (${SAMEDAY}) is a short highlight video ready within 24 hours.`
      },
      {
        "q": "What areas near Frisco do you serve?",
        "a": "Frisco sits between Plano, McKinney, Allen, Prosper, Little Elm, The Colony and Celina, and I cover all of them — plus the rest of Dallas–Fort Worth — with no travel fee. Wherever your church and venue land, the package is the same."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Frisco?",
        "a": `Mis paquetes van de ${STUDY} con la Sesión de retratos a ${ARCHIVE} con la Celebración de dos días, con Foto + Video en ${CINEMA} y la Celebración completa en ${PRODUCTION}, la que recomiendo para la mayoría de las celebraciones. Como referencia, la mayoría de los estudios de quince en DFW publican paquetes de entre unos $1,500 y $6,000; mis paquetes están pensados para familias que quieren un fotógrafo, un videógrafo y un álbum de fotos impreso, no solo un enlace a una galería. No hay cargo por traslado a Frisco; compara los cuatro en nuestra página de Paquetes y precios.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Frisco?",
        "a": "Las plazas alrededor del Ford Center en The Star para un look moderno y llamativo; los jardines cívicos de Frisco Square y las fuentes de Frisco Commons Park para algo pulido y verde; el ladrillo y los murales del Rail District sobre Main Street para un estilo vintage; y el Frisco Heritage Center para unas tomas con historia. Escogemos dos que queden cerca para que el día fluya."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Frisco?",
        "a": "En Frisco las celebraciones se inclinan por salones de hotel y de resort —alrededor de The Star y el Dallas North Tollway, en el resort junto a PGA Frisco y en salones de eventos por los corredores de la Highway 121 y Preston Road—, además de lugares privados en el campo de los condados de Collin y Denton. Mándame tu iglesia y tu salón y armo el itinerario contemplando el traslado entre los dos."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Frisco?",
        "a": `Sí. Foto + Video (${CINEMA}), Celebración completa (${PRODUCTION}) y Celebración de dos días (${ARCHIVE}) juntan fotógrafos y videógrafos el mismo día: un equipo de ${CREW_CINEMA}, ${CREW_PRODUCTION} o ${CREW_ARCHIVE} personas, en la combinación que tú elijas. Para las familias que quieren compartir enseguida, la Edición el mismo día (${SAMEDAY}) es un video corto de lo mejor, listo en 24 horas.`
      },
      {
        "q": "¿Qué zonas cerca de Frisco cubres?",
        "a": "Frisco está entre Plano, McKinney, Allen, Prosper, Little Elm, The Colony y Celina, y cubro todas —además del resto de Dallas–Fort Worth— sin cargo por traslado. Donde sea que queden tu iglesia y tu salón, el paquete cuesta lo mismo."
      }
    ]
  },
  "plano": {
    "intro": [
      "Plano is two cities in one, and a quinceañera here often touches both. East of Central Expressway sits the older Plano — Historic Downtown along 15th Street, the DART station, and the east-side neighborhoods that are home to much of the city's Hispanic community. West of the tollway is Legacy: the corporate campuses, Legacy West and the Shops at Legacy, and hotel ballrooms built for big celebrations. Plano families keep the tradition whole — the misa first, then the portraits, then the vals and the fiesta — and they tend to plan every piece of it carefully.",
      "That split gives portraits real range. Historic Downtown Plano has brick storefronts, murals and Haggard Park, where the old interurban railway station still stands; Arbor Hills Nature Preserve on the west side opens into rolling prairie and woodland trails that glow at golden hour; Legacy West gives you modern architecture and landscaped walkways for an editorial, city-at-night look. And if you want wide, quiet frames, Oak Point Park and Nature Preserve in the northeast adds hundreds of acres of ponds and meadows.",
      `I photograph one quinceañera a day, fully bilingual, with no travel fee anywhere in DFW. If your day runs from a downtown misa to a Legacy ballroom, the Full Celebration (${PRODUCTION}) is the package I recommend: ${HRS_PRODUCTION} hours with a team of ${CREW_PRODUCTION} and a day-of coordinator, a portrait session at one location, a 12–15 minute full-length video and a 40-page printed photo album. Families who only want a portrait session before the day can start with the Portrait Session (${STUDY}).`
    ],
    "introEs": [
      "Plano son dos ciudades en una, y una quinceañera aquí muchas veces toca las dos. Al este de la Central Expressway está el Plano más antiguo: el Historic Downtown sobre la calle 15, la estación del DART y los barrios del lado este, donde vive buena parte de la comunidad hispana de la ciudad. Al oeste del tollway está Legacy: los corporativos, Legacy West y las Shops at Legacy, y salones de hotel hechos para celebraciones grandes. Las familias de Plano hacen la tradición completa —primero la misa, luego las fotos, después el vals y la fiesta— y suelen planear cada detalle con cuidado.",
      "Esa división les da mucha variedad a las fotos. El Historic Downtown de Plano tiene fachadas de ladrillo, murales y el Haggard Park, donde sigue en pie la vieja estación del tren interurbano; Arbor Hills Nature Preserve, del lado oeste, se abre en praderas onduladas y senderos entre árboles que brillan a la hora dorada; Legacy West te da arquitectura moderna y andadores con jardines para un look editorial de ciudad de noche. Y si quieres tomas amplias y tranquilas, Oak Point Park and Nature Preserve, al noreste, suma cientos de acres de lagunas y praderas.",
      `Fotografío una sola quinceañera al día, todo bilingüe, sin cargo por traslado en ningún lugar de DFW. Si tu día va de una misa en el centro a un salón en Legacy, la Celebración completa (${PRODUCTION}) es el paquete que recomiendo: ${HRS_PRODUCTION} horas con un equipo de ${CREW_PRODUCTION} y una coordinadora del día, una sesión de retrato en una locación, un video completo de 12 a 15 minutos y un álbum de fotos impreso de 40 páginas. Las familias que solo quieren una sesión de retratos antes del día pueden empezar con Sesión de retratos (${STUDY}).`
    ],
    "photoSpots": [
      {
        "name": "Arbor Hills Nature Preserve",
        "why": "Around 200 acres of rolling prairie, woodland and trails on Plano's west side — golden-hour light across open grass and a far greener look than you'd expect so close to the tollway.",
        "whyEs": "Unos 200 acres de pradera ondulada, bosque y senderos en el lado oeste de Plano: luz dorada sobre el pasto abierto y un look mucho más verde de lo que esperarías tan cerca del tollway."
      },
      {
        "name": "Historic Downtown Plano (15th Street)",
        "why": "Restored brick storefronts and murals along 15th Street, steps from the DART station — warm, walkable and full of texture for candid portraits between the church and the reception.",
        "whyEs": "Fachadas de ladrillo restauradas y murales sobre la calle 15, a unos pasos de la estación del DART: cálido, caminable y lleno de textura para fotos espontáneas entre la iglesia y la recepción."
      },
      {
        "name": "Haggard Park & the Interurban Railway Museum",
        "why": "A shaded downtown park beside the restored early-1900s interurban station — vintage character and big trees, a quick walk from 15th Street.",
        "whyEs": "Un parque sombreado del centro junto a la estación interurbana restaurada de principios del siglo XX: carácter vintage y árboles grandes, a una caminata corta de la calle 15."
      },
      {
        "name": "Legacy West",
        "why": "Modern architecture, landscaped walkways and evening lights — the editorial, city-at-night option on the west side. It's a privately managed district, so we keep sessions quick, quiet and within its guidelines.",
        "whyEs": "Arquitectura moderna, andadores con jardines y luces de noche: la opción editorial de ciudad nocturna en el lado oeste. Es un distrito de administración privada, así que hacemos sesiones rápidas, discretas y dentro de sus reglas."
      },
      {
        "name": "Oak Point Park and Nature Preserve",
        "why": "Hundreds of acres in northeast Plano with ponds, meadows and wide skies — room for the whole court and long, quiet golden-hour frames.",
        "whyEs": "Cientos de acres al noreste de Plano con lagunas, praderas y cielo abierto: espacio para toda la corte y tomas largas y tranquilas a la hora dorada."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Plano?",
        "a": `Portrait Session is ${STUDY}, Photo + Video ${CINEMA}, Full Celebration ${PRODUCTION} and Two-Day Celebration ${ARCHIVE}. I recommend the Full Celebration for most Plano celebrations because it covers the misa through the last dance with photos and video and ends in a printed photo album. A ${RETAINER_PCT} deposit locks in the date once your agreement is approved, and the rest is due ${BALANCE_HOURS} hours before the event; compare everything on our Packages & Prices page.`
      },
      {
        "q": "Where are the best places to take quince pictures in Plano?",
        "a": "Arbor Hills Nature Preserve for prairie and golden hour, Historic Downtown Plano's 15th Street and Haggard Park for brick and vintage character, Legacy West for a modern editorial look, and Oak Point Park and Nature Preserve for wide, quiet meadows. Downtown and Haggard Park pair easily in one stop; Arbor Hills and Legacy West sit close together on the west side."
      },
      {
        "q": "Where do Plano families usually hold the reception?",
        "a": "West Plano celebrations often land in hotel ballrooms around Legacy West and the Dallas North Tollway; east-side families book banquet halls along the Central Expressway and President George Bush Turnpike corridors and event spaces near downtown, and some choose ranch-style venues just east of the city, like Southfork Ranch in Parker. Tell me your church and your venue and I'll plan the timeline around both."
      },
      {
        "q": "Do you offer both photo and video for quinceañeras in Plano?",
        "a": `Yes. Photo + Video (${CINEMA}) pairs one photographer and one videographer for an 8–10 minute full-length video in 4K; Full Celebration (${PRODUCTION}) brings a team of ${CREW_PRODUCTION} and a day-of coordinator, a 12–15 minute full-length video and four short vertical videos for social media. If you'd like photos of her in her dress before the big day, the Dress Session is ${DESTINATION}.`
      },
      {
        "q": "What areas near Plano do you cover?",
        "a": "Plano borders Richardson, Allen, Frisco, Murphy, Parker, Carrollton and Addison, with McKinney and Wylie a short drive away, and I photograph quinceañeras across all of them — and the rest of the metroplex — with no travel fee."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Plano?",
        "a": `Sesión de retratos cuesta ${STUDY}, Foto + Video ${CINEMA}, Celebración completa ${PRODUCTION} y la Celebración de dos días ${ARCHIVE}. Para la mayoría de las celebraciones en Plano recomiendo la Celebración completa porque cubre de la misa al último baile con fotos y video, y termina en un álbum de fotos impreso. Un depósito del ${RETAINER_PCT} asegura la fecha una vez aprobado tu contrato, y el resto se paga ${BALANCE_HOURS} horas antes del evento; compara todo en nuestra página de Paquetes y precios.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Plano?",
        "a": "Arbor Hills Nature Preserve para pradera y hora dorada, la calle 15 del Historic Downtown y el Haggard Park para ladrillo y estilo vintage, Legacy West para un look moderno y editorial, y Oak Point Park and Nature Preserve para praderas amplias y tranquilas. El centro y el Haggard Park se combinan fácil en una sola parada; Arbor Hills y Legacy West quedan cerca uno del otro en el lado oeste."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Plano?",
        "a": "En el oeste de Plano muchas celebraciones son en salones de hotel alrededor de Legacy West y el Dallas North Tollway; las familias del lado este reservan salones por los corredores de la Central Expressway y el President George Bush Turnpike y espacios para eventos cerca del centro, y algunas eligen lugares tipo rancho justo al este de la ciudad, como Southfork Ranch en Parker. Dime tu iglesia y tu salón y armo el itinerario alrededor de los dos."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Plano?",
        "a": `Sí. Foto + Video (${CINEMA}) junta a un fotógrafo y un videógrafo para un video completo en 4K de 8 a 10 minutos; Celebración completa (${PRODUCTION}) trae un equipo de ${CREW_PRODUCTION} y una coordinadora del día, un video completo de 12 a 15 minutos y cuatro videos verticales cortos para redes sociales. Si quieres fotos de ella con su vestido antes del gran día, la Sesión con el vestido cuesta ${DESTINATION}.`
      },
      {
        "q": "¿Qué zonas cerca de Plano cubres?",
        "a": "Plano colinda con Richardson, Allen, Frisco, Murphy, Parker, Carrollton y Addison, con McKinney y Wylie a unos minutos, y fotografío quinceañeras en todas —y en el resto del metroplex— sin cargo por traslado."
      }
    ]
  },
  "mckinney": {
    "intro": [
      "McKinney has something most of Collin County doesn't: a real historic downtown, built around the old Collin County courthouse on the square — now the McKinney Performing Arts Center — with more than a century of brick storefronts around it. It's the county seat, with some of its longest-rooted Hispanic families on the east side and newer ones arriving every year as the city grows north and west. A McKinney quinceañera tends to feel like a hometown celebration — the parish, the square, the reception — even as the city has grown up around it.",
      "The portrait options match that hometown-meets-new-growth character. Downtown, the square gives you brick, ironwork and old storefront signs; a few blocks south, Chestnut Square Historic Village has restored 1800s homes, gardens and shaded lawns. Out west near Stonebridge Ranch, Adriatica Village is a Croatian-inspired hillside of stone lanes, archways and a bell tower — the closest thing to a European backdrop in North Texas. For water and open sky, Towne Lake gives you a lakeside trail at sunset, and the Heard Natural Science Museum & Wildlife Sanctuary adds wetland boardwalks and native prairie.",
      `I photograph one quinceañera a day, fully bilingual, with no travel fee anywhere in DFW. For most McKinney celebrations I recommend the Full Celebration (${PRODUCTION}): ${HRS_PRODUCTION} hours of photo and video, a portrait session at one location — Adriatica or Chestnut Square are natural picks — a 12–15 minute full-length video and a 40-page printed photo album. Families who want a matching keepsake for both households can add Albums for Mom & Dad (${PARENTS} for the pair).`
    ],
    "introEs": [
      "McKinney tiene algo que casi nadie más tiene en el condado de Collin: un centro histórico de verdad, construido alrededor del antiguo juzgado del condado en la plaza —hoy el McKinney Performing Arts Center— con más de un siglo de fachadas de ladrillo a su alrededor. Es la cabecera del condado, con algunas de sus familias hispanas de raíces más hondas en el lado este y nuevas que llegan cada año mientras la ciudad crece hacia el norte y el oeste. Una quinceañera en McKinney suele sentirse como fiesta de pueblo —la parroquia, la plaza, la recepción—, aunque la ciudad haya crecido tanto a su alrededor.",
      "Las opciones para fotos van con ese carácter de pueblo que crece. En el centro, la plaza te da ladrillo, herrería y letreros antiguos; unas cuadras al sur, Chestnut Square Historic Village tiene casas restauradas del siglo XIX, jardines y prados con sombra. Hacia el oeste, cerca de Stonebridge Ranch, Adriatica Village es una colina inspirada en Croacia con callejones de piedra, arcos y un campanario: lo más parecido a un fondo europeo en el norte de Texas. Para agua y cielo abierto, Towne Lake te da un sendero junto al lago al atardecer, y el Heard Natural Science Museum & Wildlife Sanctuary suma puentes de madera sobre humedales y pradera nativa.",
      `Fotografío una sola quinceañera al día, todo bilingüe, sin cargo por traslado en ningún lugar de DFW. Para la mayoría de las celebraciones en McKinney recomiendo la Celebración completa (${PRODUCTION}): ${HRS_PRODUCTION} horas de foto y video, una sesión de retrato en una locación —Adriatica o Chestnut Square son opciones naturales—, un video completo de 12 a 15 minutos y un álbum de fotos impreso de 40 páginas. Las familias que quieren un recuerdo igual para cada hogar pueden sumar los Álbumes para mamá y papá (${PARENTS} el par).`
    ],
    "photoSpots": [
      {
        "name": "Historic Downtown McKinney (the square)",
        "why": "Brick storefronts, ironwork and vintage signs circling the old Collin County courthouse — a warm, hometown backdrop that photographs beautifully in the late afternoon.",
        "whyEs": "Fachadas de ladrillo, herrería y letreros antiguos alrededor del viejo juzgado del condado de Collin: un fondo cálido, de pueblo, que queda precioso al final de la tarde."
      },
      {
        "name": "Chestnut Square Historic Village",
        "why": "Restored 1800s homes, gardens and shaded lawns a few blocks south of the square — a romantic heritage setting for the gown. It's a working event venue, so portrait time there is arranged in advance.",
        "whyEs": "Casas restauradas del siglo XIX, jardines y prados con sombra a unas cuadras al sur de la plaza: un escenario romántico y con historia para el vestido. Es un lugar de eventos en funcionamiento, así que el tiempo para fotos se aparta con anticipación."
      },
      {
        "name": "Adriatica Village",
        "why": "A Croatian-inspired village near Stonebridge Ranch with stone lanes, archways and a bell tower — Old World texture without leaving Collin County.",
        "whyEs": "Un pueblito inspirado en Croacia cerca de Stonebridge Ranch, con callejones de piedra, arcos y un campanario: textura del Viejo Mundo sin salir del condado de Collin."
      },
      {
        "name": "Towne Lake Recreation Area",
        "why": "Open water, a trail around the lake and big skies at sunset — the easy golden-hour option close to downtown, with room for the whole court.",
        "whyEs": "Agua abierta, un sendero alrededor del lago y cielo amplio al atardecer: la opción fácil para la hora dorada cerca del centro, con espacio para toda la corte."
      },
      {
        "name": "Heard Natural Science Museum & Wildlife Sanctuary",
        "why": "Wetland boardwalks, woods and native prairie on a 289-acre sanctuary south of town — a quiet, natural setting. Admission and photography rules apply, so we confirm the details before the day.",
        "whyEs": "Puentes de madera sobre humedales, bosque y pradera nativa en un santuario de 289 acres al sur de la ciudad: un fondo natural y tranquilo. Hay entrada y reglas para fotografía, así que confirmamos los detalles antes del día."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in McKinney?",
        "a": `Packages begin at ${STUDY} for the Portrait Session — photos only, ${HRS_STUDY} hours with one photographer and 60 edited photos — and run through ${CINEMA} for Photo + Video and ${PRODUCTION} for the Full Celebration — the one I recommend for most celebrations — to ${ARCHIVE} for the Two-Day Celebration. Sign the agreement online and I'll hold your date for ${HOLD_DAYS} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call. There's no travel fee to McKinney.`
      },
      {
        "q": "Where are the best places to take quince pictures in McKinney?",
        "a": "The historic square downtown, Chestnut Square Historic Village a few blocks south, Adriatica Village's stone lanes and bell tower near Stonebridge Ranch, the Towne Lake shoreline at sunset, and the boardwalks at the Heard Natural Science Museum & Wildlife Sanctuary. The square and Chestnut Square pair easily; Adriatica is worth its own stop."
      },
      {
        "q": "Where do McKinney families usually hold the reception?",
        "a": "Anywhere from event halls near downtown and along the US-75 corridor to newer venues around Craig Ranch and the State Highway 121 side of town, plus ranch and barn venues out in the countryside north and east of the city. Send me your church and your venue and I'll build the timeline so the drive between them is planned in."
      },
      {
        "q": "Do you offer photo and video for a McKinney quinceañera?",
        "a": `Yes. Photo + Video (${CINEMA}) delivers an 8–10 minute full-length video in 4K, a 1-minute short trailer and 400+ edited photos; Full Celebration (${PRODUCTION}) builds that out to a team of ${CREW_PRODUCTION} and a coordinator, a 12–15 minute full-length video, a 90-second short trailer, four short videos for social media, 700+ edited photos and the printed photo album. A Vintage Film Clip (Super 8) can be added to either full-length video for ${SUPER8}.`
      },
      {
        "q": "What areas near McKinney do you serve?",
        "a": "McKinney sits between Allen, Frisco, Prosper, Fairview, Melissa and Princeton, with Plano a short drive south, and I photograph quinceañeras across all of them and the rest of Dallas–Fort Worth with no travel fee."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en McKinney?",
        "a": `Los paquetes empiezan en ${STUDY} con la Sesión de retratos —solo fotos, ${HRS_STUDY} horas con un fotógrafo y 60 fotos editadas—; siguen ${CINEMA} con Foto + Video y ${PRODUCTION} con la Celebración completa —la que recomiendo para la mayoría de las celebraciones— y llegan a ${ARCHIVE} con la Celebración de dos días. Firma el contrato en línea y te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida. No hay cargo por traslado a McKinney.`
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en McKinney?",
        "a": "La plaza histórica del centro, Chestnut Square Historic Village a unas cuadras al sur, los callejones de piedra y el campanario de Adriatica Village cerca de Stonebridge Ranch, la orilla de Towne Lake al atardecer y los puentes de madera del Heard Natural Science Museum & Wildlife Sanctuary. La plaza y Chestnut Square se combinan fácil; Adriatica merece su propia parada."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de McKinney?",
        "a": "Desde salones cerca del centro y por el corredor de la US-75 hasta lugares más nuevos alrededor de Craig Ranch y el lado de la State Highway 121, además de ranchos y salones tipo granero en el campo al norte y al este de la ciudad. Mándame tu iglesia y tu salón y armo el itinerario con el traslado entre los dos ya contemplado."
      },
      {
        "q": "¿Ofreces foto y video para una quinceañera en McKinney?",
        "a": `Sí. Foto + Video (${CINEMA}) entrega un video completo en 4K de 8 a 10 minutos, un tráiler corto de 1 minuto y más de 400 fotos editadas; Celebración completa (${PRODUCTION}) lo lleva a un equipo de ${CREW_PRODUCTION} y una coordinadora, un video completo de 12 a 15 minutos, un tráiler corto de 90 segundos, cuatro videos cortos para redes, más de 700 fotos editadas y el álbum de fotos impreso. Se puede sumar un Clip de película vintage (Super 8) a cualquiera de los dos por ${SUPER8}.`
      },
      {
        "q": "¿Qué zonas cerca de McKinney cubres?",
        "a": "McKinney está entre Allen, Frisco, Prosper, Fairview, Melissa y Princeton, con Plano a unos minutos al sur, y fotografío quinceañeras en todas y en el resto de Dallas–Fort Worth sin cargo por traslado."
      }
    ]
  }
};

export function getCityContent(slug: string): CityContent | undefined {
  return cityContent[slug];
}
