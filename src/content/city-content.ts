/**
 * city-content.ts — UNIQUE per-city local content for the quinceañera-photographer
 * landing pages. Researched per city (real photo locations, neighborhoods, and
 * city-specific FAQs that answer the local autocomplete intents) so each page is
 * genuinely distinct — NOT a doorway page. Keyed by the same slug as locations.ts.
 *
 * Prices are NEVER typed here — they are price tokens (src/lib/price-text.ts)
 * filled from the live price book when the page renders, so a price change at
 * /admin/prices updates every city page without a deploy.
 */
import { PT } from "@/lib/price-text";
import { extraCityContent } from "@/content/cities";

const STUDY = PT.price.study;
const SOLO = PT.price.solo;
const CINEMA = PT.price.cinema;
const TRIO = PT.price.trio;
const SAMEDAY = PT.addon.sameday;
const SUPER8 = PT.addon.super8;
const PARENTS = PT.addon.parents;
const SECONDDAY = PT.addon.secondday;
const COORDINATOR = PT.addon.coordinator;
const RETAINER_PCT = PT.deposit.percent;
const BALANCE_DAYS = PT.balanceDays;
const HOLD_DAYS = PT.holdDays;
// Hours included on the day (families can add hours up to the book's longest day).
const HRS_STUDY = PT.hours.study;
const HRS_SOLO = PT.hours.solo;
const HRS_CINEMA = PT.hours.cinema;
const HRS_TRIO = PT.hours.trio;

export type CityPhotoSpot = {
  name: string;
  why: string;
  whyEs: string;
  /** Spanish display name; the Spanish page falls back to `name` when missing. */
  nameEs?: string;
  /** Slug of this spot's photo-inspiration page (src/content/inspo-places.ts), if it has one. */
  inspo?: string;
};

/** One step of a city's own "whole day" timeline. */
export type CityDayStep = { when: string; title: string; body: string };

/** A city's own day timeline; the page falls back to the shared one when missing. */
export type CityDay = {
  /** Heading before the italic part, e.g. "A Dallas quince,". */
  title: string;
  /** Italic end of the heading. */
  em: string;
  dek: string;
  steps: CityDayStep[];
};

export type CityContent = {
  intro: string[];
  introEs: string[];
  photoSpots: CityPhotoSpot[];
  faqs: { q: string; a: string }[];
  faqsEs: { q: string; a: string }[];
  /** City-specific lead for the packages section (price tokens only). Falls back to the shared lead. */
  packagesLead?: string;
  packagesLeadEs?: string;
  /** City-specific day timeline. Falls back to the shared timeline (EN) or no section (ES). */
  day?: CityDay;
  dayEs?: CityDay;
};

export const cityContent: Record<string, CityContent> = {
  "grand-prairie": {
    "intro": [
      "Grand Prairie is split right down the Dallas–Tarrant county line, and it carries one of the most Mexican neighborhoods in the metroplex along with it. Close to half the city is Hispanic, and the roots run deeper than most people realize — Dalworth, on the northeast side, was its own incorporated town before Grand Prairie annexed it back in 1942, and it has stayed a tight Mexican-American community ever since. You feel that every Cinco de Mayo out at Traders Village, and you feel it in how families here still do a quinceañera the full way: the Mass, the court, the vals, all of it.",
      "A Grand Prairie quince day usually opens with a morning misa at a parish on the north or central side of town, moves into portraits, and lands at a reception hall for the night. Plenty of families shoot pictures out at Joe Pool Lake or in front of the Uptown Theater's old marquee on Main Street, then head to a banquet hall along Pioneer Parkway or out toward the Highway 161 corridor near EpicCentral. Tell me your church and your salón and I'll build the timeline so nothing gets rushed and nobody's chasing the light at the end of the day.",
      `Your daughter's celebration is covered start to finish by a TX Quince team, and every gallery and film is edited by us, the owners. Everything runs in English and Spanish, so your tías and your padrinos always know what comes next. Packages run from ${STUDY} for the {{name.study}} to ${TRIO} for {{name.trio}}, and {{name.trio}} is the one we recommend for most celebrations: ${HRS_TRIO} hours of photo and video with {{team.trio}}, a dress or save-the-date session after the deposit, the full-length film of her whole day with a {{highlight.trio}} highlight film, and {{photos.trio}} edited photos with a printed album. There's no travel fee anywhere in DFW, Grand Prairie included.`
    ],
    "introEs": [
      "Grand Prairie está partido justo por la línea de los condados de Dallas y Tarrant, y trae consigo uno de los barrios más mexicanos del metroplex. Casi la mitad de la ciudad es hispana, y la raíz viene de más atrás de lo que muchos creen: Dalworth, por el lado noreste, fue su propio pueblo antes de que Grand Prairie lo anexara en 1942, y desde entonces sigue siendo una comunidad mexicana bien unida. Eso se siente cada Cinco de Mayo en Traders Village, y se siente en cómo las familias de aquí todavía hacen la quinceañera completa: la misa, la corte, el vals, todo.",
      "Un día de quince en Grand Prairie casi siempre empieza con una misa de mañana en una parroquia del norte o del centro de la ciudad, sigue con las fotos y termina en un salón por la noche. Muchas familias toman fotos en Joe Pool Lake o frente a la marquesina vieja del Uptown Theater en Main Street, y luego se van a un salón por Pioneer Parkway o rumbo al corredor de la Highway 161 cerca de EpicCentral. Díme tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas y nadie ande corriendo por la luz al final del día.",
      `Un equipo de TX Quince cubre la celebración de tu hija de principio a fin, y nosotros, los dueños, editamos cada galería y cada video. Todo lo manejamos en inglés y español, para que tus tías y tus padrinos siempre sepan qué sigue. Los paquetes van de ${STUDY} con la {{nameEs.study}} a ${TRIO} con {{nameEs.trio}}, que es el que recomendamos para la mayoría de las celebraciones: ${HRS_TRIO} horas de foto y video con {{teamEs.trio}}, una sesión con el vestido o de save the date después del depósito, el video completo de todo su día con un resumen de {{highlightEs.trio}} y {{photos.trio}} fotos editadas con un álbum impreso. No hay cargo por traslado en ningún lugar de DFW, Grand Prairie incluido.`
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
        "a": `Packages start at ${STUDY} for the {{name.study}} (photos only, a ${HRS_STUDY}-hour session with {{team.study}}), then ${SOLO} for {{name.solo}} (photos and video from one shooter with a {{cameras.solo}} camera setup), ${CINEMA} for {{name.cinema}} and ${TRIO} for {{name.trio}} — the one I recommend for most Grand Prairie celebrations. Once your signed agreement is approved, a ${RETAINER_PCT} deposit locks in your date and goes toward your total, and there's no travel fee anywhere in DFW. Compare all four on our Packages & Prices page.`
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
        "a": `Yes. {{name.solo}} (${SOLO}) is the budget-friendly way to get both: one shooter with a {{cameras.solo}} camera setup takes the photos and films at the same time, for the full-length film of her day and {{photos.solo}} edited photos. {{name.cinema}} and {{name.trio}} put a dedicated team on the day: {{team.cinema}} with {{name.cinema}}, or {{team.trio}} with {{name.trio}}. Each one delivers the full-length film of her whole day in 4K — la misa, every presentation and toast in full and 15–20 minutes of the dance floor — with a {{highlight.cinema}} highlight in {{name.cinema}}, and a {{highlight.trio}} highlight film and four short vertical videos for social media in {{name.trio}}. Whichever you choose, every gallery and film is edited by us, the owners.`
      },
      {
        "q": "What areas near Grand Prairie do you serve?",
        "a": "Grand Prairie sits between Arlington, Irving, south Dallas and Oak Cliff, Mansfield, Cedar Hill, and Duncanville, with Dalworthington Gardens right next door — and I cover all of them with no travel fee. Wherever your church and hall land across DFW, the rate is the same."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañeras en Grand Prairie?",
        "a": `Los paquetes empiezan en ${STUDY} con la {{nameEs.study}} (solo fotos, una sesión de ${HRS_STUDY} h con {{teamEs.study}}); siguen ${SOLO} con {{nameEs.solo}} (foto y video con una sola persona y {{cameras.solo}} cámaras), ${CINEMA} con {{nameEs.cinema}} y ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones en Grand Prairie. Ya aprobado tu contrato firmado, un depósito del ${RETAINER_PCT} asegura tu fecha y se abona a tu total, y no hay cargo por traslado en ningún lugar de DFW. Compara los cuatro en nuestra página de Paquetes y precios.`
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
        "a": `Sí. {{nameEs.solo}} (${SOLO}) es la forma más económica de tener las dos cosas: una sola persona con {{cameras.solo}} cámaras toma las fotos y graba al mismo tiempo, para el video completo de su día y {{photos.solo}} fotos editadas. {{nameEs.cinema}} y {{nameEs.trio}} ponen un equipo dedicado ese día: {{teamEs.cinema}} con {{nameEs.cinema}}, o {{teamEs.trio}} con {{nameEs.trio}}. Los dos entregan el video completo en 4K de todo su día —la misa, cada presentación y cada brindis completos, y de 15 a 20 minutos de la pista de baile—, con un resumen de {{highlightEs.cinema}} en {{nameEs.cinema}}, y un resumen de {{highlightEs.trio}} y cuatro videos verticales cortos para redes sociales en {{nameEs.trio}}. Elijas el que elijas, nosotros, los dueños, editamos cada galería y cada video.`
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
      "We only photograph quinceañeras — no weddings squeezed in — and a TX Quince team stays with your celebration from start to finish, with every gallery and film edited by us, the owners. Everything is fully bilingual, so your grandparents understand every direction during portraits and the toasts get caught in the moment. Every package with video pairs the full-length 4K film of her whole day with a short highlight you can share, and {{name.trio}} adds a 40-page printed photo album to keep for years."
    ],
    "introEs": [
      "Irving en realidad son dos ciudades, y una quinceañera casi siempre toca las dos. Al sur de la 183 está el corazón mexicano de la ciudad: las panaderías y carnicerías sobre Irving Boulevard, las parroquias que llevan generaciones bautizando y confirmando a las mismas familias, y los locales de ladrillo del Heritage District por Main Street. Al norte quedan los canales y las torres de cristal de Las Colinas. Irving es casi 40% hispano, en su mayoría familias de origen mexicano, y esa comunidad está concentrada justo en esos barrios del sur de Irving donde todavía se hace la tradición completa, empezando por la iglesia.",
      "Un día típico recorre todo ese mapa. Empezamos con la misa en el sur de Irving y manejamos diez minutos al norte para que tu hija se pare bajo los Mustangs de Williams Square o sobre los puentes venecianos del Mandalay Canal para las fotos — fondos que de verdad no encuentras en ninguna otra parte de DFW. De ahí la recepción puede ser un salón de hotel cerca del Irving Convention Center, la zona de entretenimiento del Toyota Music Factory, o un salón del barrio sobre Irving Boulevard. Armo el itinerario alrededor de tus iglesias y tu salón, no de una plantilla.",
      "Solo fotografiamos quinceañeras, nada de bodas encimadas, y un equipo de TX Quince acompaña tu celebración de principio a fin, con cada galería y cada video editados por nosotros, los dueños. Todo es bilingüe, así que tus abuelos entienden cada indicación durante las fotos y los brindis quedan capturados en el momento. Cada paquete con video trae el video completo en 4K de todo su día y un resumen corto para compartir, y {{nameEs.trio}} suma un álbum de fotos impreso de 40 páginas para guardar por años."
    ],
    "photoSpots": [
      {
        "name": "Mandalay Canal Walk at Las Colinas",
        "inspo": "mandalay-canal",
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
        "a": `My packages run from ${STUDY} ({{name.study}}) to ${TRIO} ({{name.trio}}). {{name.trio}} is the one I recommend for most celebrations — ${HRS_TRIO} hours with {{team.trio}}, a dress or save-the-date session after the deposit (the Mandalay Canal is a natural pick), the full-length film of her whole day with a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a printed album. {{name.cinema}}, at ${CINEMA}, covers ${HRS_CINEMA} hours with {{team.cinema}}, the same dress or save-the-date session, and the full-length film with a {{highlight.cinema}} highlight. {{name.solo}}, at ${SOLO}, is one shooter with a {{cameras.solo}} camera setup taking photos and video at once for ${HRS_SOLO} hours: the full-length film of her day and {{photos.solo}} edited photos. If you'd like someone to run the day, the Day-of Coordinator is ${COORDINATOR} a day. There's no travel fee anywhere in Irving or the rest of DFW; see every inclusion on our Packages & Prices page.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) and {{name.trio}} (${TRIO}) both include photography and the full-length 4K film of her whole day, shot the same day by one team ({{team.cinema}} or {{team.trio}}). If you'd like a short highlight video to share right away, the Same-Day Edit (ready in 24 hours) is ${SAMEDAY}. On a tighter budget, {{name.solo}} (${SOLO}) covers photos and the full-length film with one shooter and a {{cameras.solo}} camera setup, plus {{photos.solo}} edited photos.`
      },
      {
        "q": "What areas near Irving do you cover?",
        "a": "Irving sits in the middle of everything, so I regularly photograph quinces in Coppell, Grand Prairie, Farmers Branch, Euless, Grapevine, and across Dallas — all with no travel fee anywhere in the metroplex."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Irving?",
        "a": `Mis paquetes van de ${STUDY} ({{nameEs.study}}) a ${TRIO} ({{nameEs.trio}}). {{nameEs.trio}} es el que recomiendo para la mayoría de las celebraciones: ${HRS_TRIO} horas con {{teamEs.trio}}, una sesión con el vestido o de save the date después del depósito (el Mandalay Canal es la opción natural), el video completo de todo su día con un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum impreso. {{nameEs.cinema}}, en ${CINEMA}, cubre ${HRS_CINEMA} horas con {{teamEs.cinema}}, la misma sesión con el vestido o de save the date y el video completo con un resumen de {{highlightEs.cinema}}. {{nameEs.solo}}, en ${SOLO}, es una sola persona con {{cameras.solo}} cámaras que toma fotos y graba a la vez durante ${HRS_SOLO} horas: el video completo de su día y {{photos.solo}} fotos editadas. Si quieres a alguien que lleve el día, la Coordinadora del día cuesta ${COORDINATOR} por día. No hay cargo por traslado en Irving ni en el resto de DFW; mira todo lo que incluye cada uno en nuestra página de Paquetes y precios.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) y {{nameEs.trio}} (${TRIO}) incluyen fotografía y el video completo en 4K de todo su día, grabados el mismo día por un solo equipo ({{teamEs.cinema}} o {{teamEs.trio}}). Si quieres un video corto para compartir enseguida, la Edición el mismo día (lista en 24 horas) cuesta ${SAMEDAY}. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) cubre las fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, {{photos.solo}} fotos editadas.`
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
        "a": `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Garland day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`
      },
      {
        "q": "What areas around Garland do you cover?",
        "a": "All of it, with no travel fee — Garland plus Rowlett, Sachse, Mesquite, Richardson, Sunnyvale, Wylie, Murphy, and Rockwall across the lake, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Garland?",
        "a": `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Garland cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`
      },
      {
        "q": "¿Qué zonas alrededor de Garland cubres?",
        "a": "Todas, sin cargo por traslado — Garland más Rowlett, Sachse, Mesquite, Richardson, Sunnyvale, Wylie, Murphy y Rockwall al cruzar el lago, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación."
      }
    ]
  },
  "dallas": {
    "intro": [
      "Walk West Jefferson Boulevard in Oak Cliff and the tradition is right there in the shop windows: quinceañera gowns, tiaras, matching pillows and Bibles. Hispanic shop owners have filled this stretch since the late 1970s, when the first bridal and quince shops moved in. For a lot of Dallas families, the planning starts here, long before the misa.",
      "Dallas is big, so the day usually crosses town. A misa at your parish in Oak Cliff, West Dallas or Pleasant Grove. Portraits at Kiest Park, in Bishop Arts, or at the Dallas Arboretum on White Rock Lake. Then a reception at a salón in the city or out in Irving or Mesquite. Tell us your church and your salón, and we plan the drive and the light between them, so nobody rushes the portraits.",
      "A TX Quince team covers the whole day in English or Spanish, and we, the owners, edit every gallery and film. There's no travel fee anywhere in Dallas or the rest of DFW. {{sessionIn}} include a dress or save-the-date session after the deposit, and {{name.cinema}} and {{name.trio}} add a highlight film ({{highlight.cinema}} and {{highlight.trio}}), so you have something to share before the full-length film is ready.",
    ],
    "introEs": [
      "Camina por West Jefferson Boulevard en Oak Cliff y la tradición está en los aparadores: vestidos de quinceañera, tiaras, cojines y biblias que hacen juego. Los comerciantes hispanos llenaron esta calle desde finales de los setenta, cuando llegaron las primeras tiendas de novias y de quince. Para muchas familias de Dallas, la planeación empieza aquí, mucho antes de la misa.",
      "Dallas es grande, así que el día casi siempre cruza la ciudad. La misa en tu parroquia de Oak Cliff, West Dallas o Pleasant Grove. Las fotos en Kiest Park, en Bishop Arts o en el Dallas Arboretum, junto a White Rock Lake. Y la recepción en un salón de la ciudad o en Irving o Mesquite. Dinos tu iglesia y tu salón, y planeamos el trayecto y la luz entre los dos, para que las fotos no salgan a las carreras.",
      "Un equipo de TX Quince cubre todo el día en español o en inglés, y nosotros, los dueños, editamos cada galería y cada video. No cobramos traslado en Dallas ni en el resto de DFW. {{sessionInEs}} incluyen una sesión con el vestido o de save the date después del depósito, y {{nameEs.cinema}} y {{nameEs.trio}} suman un video resumen ({{highlightEs.cinema}} y {{highlightEs.trio}}), para que tengas algo que compartir antes de que esté listo el video completo.",
    ],
    "photoSpots": [
      {
        "name": "Dallas Arboretum and Botanical Garden (White Rock Lake)",
        "nameEs": "Dallas Arboretum (White Rock Lake)",
        "inspo": "dallas-arboretum",
        "why": "Formal gardens, fountains and seasonal color on the shore of White Rock Lake, and one of our most-used spots for dress sessions. Everyone in the group pays admission; a portrait session needs no separate photo permit. Come already dressed, because changing in the public restrooms isn't allowed (the garden rents a private dressing room). Tripods and lights are only allowed from 3 to 5 pm, so we plan the shoot around that window.",
        "whyEs": "Jardines formales, fuentes y flores de temporada a la orilla de White Rock Lake, y uno de los lugares donde más hacemos sesiones con el vestido. Todos en el grupo pagan entrada; una sesión de retratos no necesita permiso aparte. Lleguen ya vestidos, porque no se permite cambiarse en los baños públicos (el jardín renta un cuarto privado para vestirse). Los tripiés y las luces solo se permiten de 3 a 5 pm, así que planeamos la sesión en ese horario.",
      },
      {
        "name": "Kiest Park Memorial Garden (Oak Cliff)",
        "nameEs": "Jardín conmemorativo de Kiest Park (Oak Cliff)",
        "why": "A 1934 memorial garden in Oak Cliff: a long stone water rill, a rebuilt pergola and formal beds, with Depression-era stonework around the park. Quiet, green and classic for gown portraits without leaving the neighborhood.",
        "whyEs": "Un jardín conmemorativo de 1934 en Oak Cliff: un canal largo de piedra, una pérgola restaurada y jardines formales, con obras de piedra de los años treinta alrededor del parque. Tranquilo, verde y clásico para las fotos del vestido sin salir del barrio.",
      },
      {
        "name": "Bishop Arts District (Oak Cliff)",
        "nameEs": "Bishop Arts District (Oak Cliff)",
        "why": "Walkable blocks of murals, small storefronts and bright doors in the heart of Oak Cliff. Colorful, public and close to the Jefferson corridor.",
        "whyEs": "Cuadras caminables con murales, tienditas y puertas de colores en pleno Oak Cliff. Colorido, público y cerca del corredor de Jefferson.",
      },
      {
        "name": "Latino Cultural Center (Live Oak Street)",
        "nameEs": "Latino Cultural Center (calle Live Oak)",
        "why": "Ricardo Legorreta's orange walls and purple tower, bold Mexican modernist color that ties the portraits back to the community. The center is open Tuesday to Saturday, 10 to 5, so we confirm with the staff before we plan a shoot there.",
        "whyEs": "Los muros naranjas y la torre morada de Ricardo Legorreta, color modernista mexicano que conecta las fotos con la comunidad. El centro abre de martes a sábado, de 10 a 5, así que confirmamos con el personal antes de planear una sesión ahí.",
      },
      {
        "name": "Ronald Kirk Bridge (West Dallas)",
        "nameEs": "Puente Ronald Kirk (West Dallas)",
        "why": "A walking-only bridge over the Trinity, with the downtown skyline, Reunion Tower and the white Margaret Hunt Hill arch behind her. Free, and best at golden hour.",
        "whyEs": "Un puente peatonal sobre el río Trinity, con el horizonte del centro, la Reunion Tower y el arco blanco del Margaret Hunt Hill detrás de ella. Gratis, y mejor a la hora dorada.",
      },
      {
        "name": "Fair Park (East Dallas)",
        "nameEs": "Fair Park (este de Dallas)",
        "why": "Built for the 1936 Texas Centennial Exposition and now a National Historic Landmark. Art Deco facades and the long reflecting pool of the Esplanade make a dramatic, very Dallas backdrop.",
        "whyEs": "Construido para la Exposición del Centenario de Texas de 1936 y hoy sitio histórico nacional. Las fachadas Art Déco y el largo espejo de agua de la Esplanade dan un fondo dramático y muy de Dallas.",
      },
    ],
    "packagesLead": "Every price is published, and a Dallas date costs the same as any date in DFW. A {{deposit.percent}} deposit holds it and goes toward your total. {{name.trio}}, our pick for most Dallas families, puts {{team.trio}} on her day and adds a printed album.",
    "packagesLeadEs": "Todos los precios están publicados, y una fecha en Dallas cuesta lo mismo que cualquier fecha en DFW. Un depósito del {{deposit.percent}} la aparta y se abona a tu total. {{nameEs.trio}}, nuestra recomendación para la mayoría de las familias de Dallas, pone {{teamEs.trio}} en su día y suma un álbum impreso.",
    "day": {
      "title": "A Dallas quince,",
      "em": "church to last dance.",
      "dek": "Here's how the day unfolds for most Dallas families, and how we cover each part of it.",
      "steps": [
        { "when": "Morning", "title": "Getting ready", "body": "Most Dallas families get ready at home. We photograph the dress, the shoes and the details, and the padrinos arriving with what they sponsor: the tiara, the cojín, the last doll." },
        { "when": "Midday", "title": "La misa", "body": "At your parish, in Oak Cliff, West Dallas, Pleasant Grove or wherever your family worships. Each parish sets its own photo rules, so we ask the office ahead and work quietly from where the priest wants us." },
        { "when": "Afternoon", "title": "Portraits", "body": "The window between the misa and the salón. From an Oak Cliff church, Kiest Park or Bishop Arts keeps the drive short. If she wants the Arboretum, we plan around its admission and its 3 to 5 pm equipment window, or move it to the dress session." },
        { "when": "Early evening", "title": "La entrada", "body": "At the salón, in the city or out in Irving or Mesquite. We arrive before her, so the grand entrance and the brindis are covered from the first second." },
        { "when": "Evening", "title": "El vals & baile sorpresa", "body": "The waltz with her father, the vals with her chambelanes and the surprise dance. Dallas halls differ a lot in light and space, so we walk the room first and pick our angles." },
        { "when": "Night", "title": "The celebration", "body": "La última muñeca, dinner and the dance floor until your hours end. Want a longer night? Ask us about adding hours." },
      ]
    },
    "dayEs": {
      "title": "Un quince en Dallas,",
      "em": "de la iglesia al último baile.",
      "dek": "Así se vive el día para la mayoría de las familias de Dallas, y así cubrimos cada parte.",
      "steps": [
        { "when": "Mañana", "title": "Arreglarse", "body": "Casi todas las familias de Dallas se arreglan en casa. Fotografiamos el vestido, los zapatos y los detalles, y a los padrinos llegando con lo que regalan: la tiara, el cojín, la última muñeca." },
        { "when": "Mediodía", "title": "La misa", "body": "En tu parroquia, en Oak Cliff, West Dallas, Pleasant Grove o donde vaya tu familia. Cada parroquia pone sus propias reglas de fotos, así que preguntamos en la oficina antes y trabajamos en silencio desde donde el padre nos indique." },
        { "when": "Tarde", "title": "Retratos", "body": "El tiempo entre la misa y el salón. Desde una iglesia de Oak Cliff, Kiest Park o Bishop Arts dejan el trayecto corto. Si ella quiere el Arboretum, lo planeamos con la entrada y el horario de equipo de 3 a 5 pm, o lo pasamos a la sesión con el vestido." },
        { "when": "Atardecer", "title": "La entrada", "body": "En el salón, en la ciudad o en Irving o Mesquite. Llegamos antes que ella, para cubrir la entrada y el brindis desde el primer segundo." },
        { "when": "Noche", "title": "El vals y el baile sorpresa", "body": "El vals con su papá, el vals con sus chambelanes y el baile sorpresa. Los salones de Dallas cambian mucho en luz y espacio, así que recorremos el salón primero y escogemos los ángulos." },
        { "when": "Noche", "title": "La fiesta", "body": "La última muñeca, la cena y la pista hasta que terminen tus horas. ¿Quieren más noche? Pregúntanos por horas extra." },
      ]
    },
    "faqs": [
      { "q": "How much does a quinceañera photographer cost in Dallas?", "a": "{{name.study}} is {{price.study}}, {{name.moments}} is {{price.moments}}, {{name.solo}} is {{price.solo}} (one shooter for photos and video), {{name.cinema}} is {{price.cinema}} and {{name.trio}} is {{price.trio}}, our pick for most celebrations, with {{team.trio}} and a printed album. There's no travel fee anywhere in Dallas or DFW. A {{deposit.percent}} deposit locks the date once your agreement is approved, and the rest is due {{balance.days}} days before the event." },
      { "q": "Do we need a permit for quince photos at the Dallas Arboretum?", "a": "No separate permit for a portrait session. Everyone in the group pays admission. Professional photography starts at 9 am, and tripods or lights are only allowed from 3 to 5 pm. She has to arrive already dressed, because changing in the public restrooms isn't allowed; the garden rents a private dressing room. Photo shoots are not allowed in the Children's Adventure Garden. We check the garden's current rules before your date." },
      { "q": "Where are quince receptions usually held in Dallas?", "a": "All over the city and the suburbs around it. Our Dallas-area celebrations have taken us to salones in Dallas, Irving and Mesquite. Send us your venue when you check your date, and we build the night around it." },
      { "q": "Can you photograph inside our church during the misa?", "a": "Yes, within your parish's rules. Each parish in the Diocese of Dallas sets its own rules for photos during the Mass, such as no flash or staying at the back. We ask the parish office ahead and follow them, so the misa is never interrupted." },
      { "q": "Do you cover the cities around Dallas?", "a": "Yes, with no travel fee: Irving, Grand Prairie, Garland, Mesquite, Farmers Branch, Carrollton, DeSoto, Duncanville, Cedar Hill and the rest of DFW." },
    ],
    "faqsEs": [
      { "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Dallas?", "a": "{{nameEs.study}} cuesta {{price.study}}, {{nameEs.moments}} {{price.moments}}, {{nameEs.solo}} {{price.solo}} (una sola persona para foto y video), {{nameEs.cinema}} {{price.cinema}} y {{nameEs.trio}} {{price.trio}}, nuestra recomendación para la mayoría de las celebraciones, con {{teamEs.trio}} y un álbum impreso. No cobramos traslado en Dallas ni en todo DFW. Un depósito del {{deposit.percent}} asegura la fecha cuando se aprueba tu contrato, y el resto se paga {{balance.days}} días antes del evento." },
      { "q": "¿Necesitamos permiso para fotos de quince en el Dallas Arboretum?", "a": "No hace falta un permiso aparte para una sesión de retratos. Todos en el grupo pagan entrada. La fotografía profesional empieza a las 9 am, y los tripiés o luces solo se permiten de 3 a 5 pm. Ella tiene que llegar ya vestida, porque no se permite cambiarse en los baños públicos; el jardín renta un cuarto privado para vestirse. No se permiten sesiones en el Children's Adventure Garden. Revisamos las reglas vigentes del jardín antes de tu fecha." },
      { "q": "¿Dónde suelen ser las recepciones de quince en Dallas?", "a": "Por toda la ciudad y los suburbios de alrededor. Nuestras celebraciones en la zona de Dallas nos han llevado a salones en Dallas, Irving y Mesquite. Mándanos tu salón cuando consultes tu fecha y armamos la noche alrededor de él." },
      { "q": "¿Pueden tomar fotos dentro de la iglesia durante la misa?", "a": "Sí, dentro de las reglas de tu parroquia. Cada parroquia de la Diócesis de Dallas pone sus propias reglas de fotos en la misa, como no usar flash o quedarse atrás. Preguntamos en la oficina parroquial antes y las seguimos, para que la misa nunca se interrumpa." },
      { "q": "¿Cubren las ciudades alrededor de Dallas?", "a": "Sí, sin cargo por traslado: Irving, Grand Prairie, Garland, Mesquite, Farmers Branch, Carrollton, DeSoto, Duncanville, Cedar Hill y el resto de DFW." },
    ],
  },
  "fort-worth": {
    "intro": [
      "Fort Worth's Mexican-American story starts north of the Trinity. When the Swift and Armour packing plants opened there in the early 1900s, families came for the work and built a barrio along North Main Street. The North Side and its parishes still matter to many Fort Worth families. On the south side, La Gran Plaza on the South Freeway is the other anchor: a Hispanic mall where families shop for the quince dress.",
      "Fort Worth gives you three different looks without a long drive. Gardens: the Japanese Garden inside the Fort Worth Botanic Garden, with koi ponds, bridges and maples. Western: the brick streets of the Stockyards and Mule Alley, where we've photographed quince portraits. Clean and modern: the lawns and museum walls of the Cultural District. We fit portraits between the misa and the reception, or move the spot she loves to the dress session so the day itself stays relaxed.",
      "A TX Quince team covers your day in English and Spanish, so abuelos and padrinos always know what comes next, and we, the owners, edit every gallery and film. There's no travel fee in Fort Worth, the rest of Tarrant County or anywhere in DFW. {{name.cinema}} and {{name.trio}} add a highlight film and short vertical videos for social media to the full-length film of her day.",
    ],
    "introEs": [
      "La historia mexicana de Fort Worth empieza al norte del río Trinity. Cuando abrieron ahí los empacadores de carne Swift y Armour a principios de los 1900, las familias llegaron por el trabajo y levantaron un barrio a lo largo de North Main Street. El North Side y sus parroquias siguen siendo importantes para muchas familias de Fort Worth. Del lado sur, La Gran Plaza, en la South Freeway, es el otro punto de reunión: un centro comercial hispano donde las familias compran el vestido de quince.",
      "Fort Worth te da tres estilos distintos sin manejar lejos. Jardín: el Japanese Garden dentro del Fort Worth Botanic Garden, con estanques de koi, puentes y maples. Vaquero: las calles de ladrillo de los Stockyards y Mule Alley, donde ya hemos hecho retratos de quince. Limpio y moderno: los jardines y las paredes de los museos del Cultural District. Hacemos las fotos entre la misa y la recepción, o pasamos el lugar que ella quiere a la sesión con el vestido para que el día de la fiesta sea tranquilo.",
      "Un equipo de TX Quince cubre tu día en español y en inglés, para que los abuelos y los padrinos siempre sepan qué sigue, y nosotros, los dueños, editamos cada galería y cada video. No cobramos traslado en Fort Worth, en el resto del condado de Tarrant ni en todo DFW. {{nameEs.cinema}} y {{nameEs.trio}} suman un video resumen y videos verticales cortos para redes sociales al video completo de su día.",
    ],
    "photoSpots": [
      {
        "name": "Japanese Garden, Fort Worth Botanic Garden",
        "nameEs": "Japanese Garden del Fort Worth Botanic Garden",
        "why": "A 7.5-acre strolling garden from 1973, with koi ponds, bridges and Japanese maples. Quince sessions buy a two-hour photo pass plus admission. The last pass sells two hours before closing, and none are sold during the garden's Japanese festivals or its Día de Muertos procession, so we check your date first.",
        "whyEs": "Un jardín de paseo de 1973, de 7.5 acres, con estanques de koi, puentes y maples japoneses. Las sesiones de quince compran un pase de fotos de dos horas más la entrada. El último pase se vende dos horas antes de cerrar, y no se venden durante los festivales japoneses ni la procesión de Día de Muertos, así que revisamos tu fecha primero.",
      },
      {
        "name": "Fort Worth Stockyards & Mule Alley",
        "nameEs": "Stockyards de Fort Worth y Mule Alley",
        "why": "Brick streets and Western storefronts that say Fort Worth in one frame. We've photographed quince portraits here. Public and walkable; go early, before the crowds.",
        "whyEs": "Calles de ladrillo y fachadas del Viejo Oeste que dicen Fort Worth en una sola foto. Ya hemos hecho retratos de quince aquí. Es público y se camina; mejor temprano, antes de que llegue la gente.",
      },
      {
        "name": "Marine Park, North Side",
        "nameEs": "Marine Park, North Side",
        "why": "A North Side park on NW 20th Street, just west of North Main, dedicated in 1894. Big old trees and a 1930s shelter, and a meaningful spot if your family's roots are in the neighborhood.",
        "whyEs": "Un parque del North Side en la calle NW 20th, al oeste de North Main, inaugurado en 1894. Árboles grandes y un pabellón de los años treinta, y un lugar con sentido si las raíces de tu familia están en el vecindario.",
      },
      {
        "name": "Trinity Park & Trinity Trails",
        "nameEs": "Trinity Park y Trinity Trails",
        "why": "Tree-lined paths along the Trinity River off University Drive. Easy, green and soft at golden hour for relaxed portraits.",
        "whyEs": "Senderos con árboles junto al río Trinity, por University Drive. Cómodo, verde y suave a la hora dorada para fotos relajadas.",
      },
      {
        "name": "Fort Worth Cultural District",
        "nameEs": "Cultural District de Fort Worth",
        "why": "Open lawns and clean modern architecture around the museums and Will Rogers Memorial Center, a few minutes west of downtown. Elegant and uncluttered.",
        "whyEs": "Jardines abiertos y arquitectura moderna y limpia alrededor de los museos y el Will Rogers Memorial Center, a unos minutos al oeste del centro. Elegante y despejado.",
      },
      {
        "name": "Fort Worth Water Gardens (downtown)",
        "nameEs": "Fort Worth Water Gardens (centro)",
        "why": "Philip Johnson's terraced pools and falling water on the south edge of downtown. The city has a renovation planned through 2027, so we check what's open before we plan a shoot there.",
        "whyEs": "Las terrazas de agua de Philip Johnson en el borde sur del centro. La ciudad tiene una renovación planeada hasta 2027, así que revisamos qué está abierto antes de planear una sesión ahí.",
      },
    ],
    "packagesLead": "The Fort Worth price is the published price, with no travel fee from the North Side to Benbrook. A {{deposit.percent}} deposit holds the date and goes toward your total. {{name.trio}}, our pick for most families, puts {{team.trio}} on her day and adds a printed album.",
    "packagesLeadEs": "El precio en Fort Worth es el precio publicado, sin cargo por traslado del North Side a Benbrook. Un depósito del {{deposit.percent}} aparta la fecha y se abona a tu total. {{nameEs.trio}}, nuestra recomendación para la mayoría de las familias, pone {{teamEs.trio}} en su día y suma un álbum impreso.",
    "day": {
      "title": "A Fort Worth quince,",
      "em": "church to last dance.",
      "dek": "Here's how the day unfolds for most Fort Worth families, and how we cover each part of it.",
      "steps": [
        { "when": "Morning", "title": "Getting ready", "body": "On the North Side, the south side or in a town like Haltom City or Saginaw, we start at home with the dress, the details, and the padrinos arriving with the tiara, the cojín and the last doll." },
        { "when": "Midday", "title": "La misa", "body": "At your parish. Each parish in the Diocese of Fort Worth sets its own rules for the misa and for photos, so we ask the office ahead and work quietly from where the priest wants us." },
        { "when": "Afternoon", "title": "Portraits", "body": "From a North Side church, Marine Park and the Stockyards are close by. For the Japanese Garden, we time it to the two-hour photo pass and the garden's closing time." },
        { "when": "Early evening", "title": "La entrada", "body": "At the salón, in Fort Worth or a few towns over, like Haltom City. We arrive before her, so the grand entrance and the brindis are covered from the first second." },
        { "when": "Evening", "title": "El vals & baile sorpresa", "body": "The waltz with her father, the vals with her chambelanes and the surprise dance. We walk the room first and pick our angles, so the court's months of practice are on camera from start to finish." },
        { "when": "Night", "title": "The celebration", "body": "La última muñeca, dinner and the dance floor until your hours end. Want a longer night? Ask us about adding hours." },
      ]
    },
    "dayEs": {
      "title": "Un quince en Fort Worth,",
      "em": "de la iglesia al último baile.",
      "dek": "Así se vive el día para la mayoría de las familias de Fort Worth, y así cubrimos cada parte.",
      "steps": [
        { "when": "Mañana", "title": "Arreglarse", "body": "En el North Side, en el lado sur o en un pueblo como Haltom City o Saginaw, empezamos en casa con el vestido, los detalles y los padrinos llegando con la tiara, el cojín y la última muñeca." },
        { "when": "Mediodía", "title": "La misa", "body": "En tu parroquia. Cada parroquia de la Diócesis de Fort Worth pone sus propias reglas para la misa y para las fotos, así que preguntamos en la oficina antes y trabajamos en silencio desde donde el padre nos indique." },
        { "when": "Tarde", "title": "Retratos", "body": "Desde una iglesia del North Side, Marine Park y los Stockyards quedan cerca. Para el Japanese Garden, lo cuadramos con el pase de fotos de dos horas y la hora de cierre del jardín." },
        { "when": "Atardecer", "title": "La entrada", "body": "En el salón, en Fort Worth o a unos pueblos, como Haltom City. Llegamos antes que ella, para cubrir la entrada y el brindis desde el primer segundo." },
        { "when": "Noche", "title": "El vals y el baile sorpresa", "body": "El vals con su papá, el vals con sus chambelanes y el baile sorpresa. Recorremos el salón primero y escogemos los ángulos, para que los meses de ensayo de la corte queden grabados de principio a fin." },
        { "when": "Noche", "title": "La fiesta", "body": "La última muñeca, la cena y la pista hasta que terminen tus horas. ¿Quieren más noche? Pregúntanos por horas extra." },
      ]
    },
    "faqs": [
      { "q": "How much does a quinceañera photographer cost in Fort Worth?", "a": "{{name.study}} is {{price.study}} (photos only), {{name.moments}} is {{price.moments}}, {{name.solo}} is {{price.solo}} (photos and video from one shooter), {{name.cinema}} is {{price.cinema}} and {{name.trio}} is {{price.trio}}, our pick for most celebrations. There's no travel fee anywhere in Tarrant County or DFW, so the Fort Worth price is the price. Sign the agreement online, and a {{deposit.percent}} deposit locks the date once it's approved." },
      { "q": "Can we take quince photos at the Fort Worth Botanic Garden?", "a": "Yes. Quinceañera sessions buy a two-hour photo pass plus admission at the garden. The last pass sells two hours before closing, and no passes are sold during the Japanese festivals or the Día de Muertos procession. Professional photos are not allowed in the Rainforest Conservatory. We check your date and the current rules before we plan it." },
      { "q": "Where do Fort Worth families hold the reception?", "a": "It depends on the family. Our Tarrant County celebrations have taken us to salones in Fort Worth and Haltom City. Send us your church and your venue, and we plan the timeline so the drive between them works." },
      { "q": "Can you photograph inside our church during the misa?", "a": "Yes, within your parish's rules. Each parish in the Diocese of Fort Worth sets its own rules for photos during the Mass, such as no flash or staying at the back. We ask the parish office ahead and follow them, so the misa is never interrupted." },
      { "q": "What areas around Fort Worth do you cover?", "a": "All of Tarrant County and the rest of DFW, with no travel fee: Haltom City, North Richland Hills, Saginaw, White Settlement, Benbrook, Crowley, Burleson, Arlington and more. A church in Fort Worth and a salón a few towns over is a normal day for us." },
    ],
    "faqsEs": [
      { "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Fort Worth?", "a": "{{nameEs.study}} cuesta {{price.study}} (solo fotos), {{nameEs.moments}} {{price.moments}}, {{nameEs.solo}} {{price.solo}} (foto y video con una sola persona), {{nameEs.cinema}} {{price.cinema}} y {{nameEs.trio}} {{price.trio}}, nuestra recomendación para la mayoría de las celebraciones. No cobramos traslado en el condado de Tarrant ni en DFW, así que el precio en Fort Worth es el precio. Firma el contrato en línea, y un depósito del {{deposit.percent}} asegura la fecha cuando se aprueba." },
      { "q": "¿Podemos tomar fotos de quince en el Fort Worth Botanic Garden?", "a": "Sí. Las sesiones de quinceañera compran un pase de fotos de dos horas más la entrada del jardín. El último pase se vende dos horas antes de cerrar, y no se venden pases durante los festivales japoneses ni la procesión de Día de Muertos. No se permiten fotos profesionales en el Rainforest Conservatory. Revisamos tu fecha y las reglas vigentes antes de planearlo." },
      { "q": "¿Dónde hacen la recepción las familias de Fort Worth?", "a": "Depende de la familia. Nuestras celebraciones en el condado de Tarrant nos han llevado a salones en Fort Worth y Haltom City. Mándanos tu iglesia y tu salón, y planeamos el itinerario para que el trayecto funcione." },
      { "q": "¿Pueden tomar fotos dentro de la iglesia durante la misa?", "a": "Sí, dentro de las reglas de tu parroquia. Cada parroquia de la Diócesis de Fort Worth pone sus propias reglas de fotos en la misa, como no usar flash o quedarse atrás. Preguntamos en la oficina parroquial antes y las seguimos, para que la misa nunca se interrumpa." },
      { "q": "¿Qué zonas alrededor de Fort Worth cubren?", "a": "Todo el condado de Tarrant y el resto de DFW, sin cargo por traslado: Haltom City, North Richland Hills, Saginaw, White Settlement, Benbrook, Crowley, Burleson, Arlington y más. Una iglesia en Fort Worth y un salón a unos pueblos de distancia es un día normal para nosotros." },
    ],
  },
  "arlington": {
    "intro": [
      "Arlington doesn't have one old downtown the way Fort Worth or Dallas do. It spreads wide between the two of them, and quinceañera families pull from both sides. The Mexican-American community here is anchored in Old Town and the central corridors off Division Street and Cooper, where Spanish is the language of the panadería and the neighborhood parish. A quince in Arlington tends to gather guests from Grand Prairie, Mansfield, and the Mid-Cities, all a short drive away.",
      "What makes Arlington portraits different is the range packed into one city. The Entertainment District gives you the bold, unmistakable backdrops: Globe Life Field, AT&T Stadium, and the granite monument sculptures at Richard Greene Linear Park sitting right between them. Ten minutes north, River Legacy Parks opens into 1,300 acres of bottomland forest along the Trinity River, and Veterans Park puts gazebos, garden beds, and spring bluebonnets in the frame. We can shoot a stadium-sized statement and a quiet green portrait the same afternoon.",
      "A TX Quince team covers your Arlington quinceañera start to finish: the Sunday misa at a central or south-side parish, portraits wherever you want them, el vals, and the reception, whether your hall is out along Pioneer Parkway or down in South Arlington near Cooper and I-20. Everything is bilingual, English or Spanish, so your grandparents follow every direction as easily as you do. There's no travel fee anywhere in the metroplex, and every gallery and film is edited by us, the owners."
    ],
    "introEs": [
      "Arlington no tiene un solo centro histórico como Fort Worth o Dallas; se extiende ancho entre las dos ciudades, y las familias de quinceañera llegan de los dos lados. La comunidad mexicana aquí se concentra en Old Town y en los corredores centrales por Division Street y Cooper, donde el español es el idioma de la panadería y de la parroquia del barrio. Una quince en Arlington suele juntar invitados de Grand Prairie, Mansfield y los Mid-Cities, todos a unos minutos.",
      "Lo que hace distintas las fotos en Arlington es la variedad que cabe en una sola ciudad. El Entertainment District te da los fondos llamativos e inconfundibles: el Globe Life Field, el AT&T Stadium y las esculturas de granito de Richard Greene Linear Park justo en medio de los dos. Diez minutos al norte, River Legacy Parks se abre en 1,300 acres de bosque junto al río Trinity, y Veterans Park pone glorietas, jardines y campos de bluebonnets en primavera. Podemos hacer una foto del tamaño de un estadio y un retrato verde y tranquilo la misma tarde.",
      "Un equipo de TX Quince cubre tu quinceañera en Arlington de principio a fin: la misa del domingo en una parroquia del centro o del sur, las fotos donde tú quieras, el vals y la recepción, ya sea que tu salón esté por Pioneer Parkway o en el sur de Arlington cerca de Cooper y la I-20. Todo es bilingüe, en inglés o español, para que tus abuelos sigan cada indicación igual de fácil que tú. No hay cargo por traslado en todo el metroplex, y nosotros, los dueños, editamos cada galería y cada video."
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
        "a": `My packages run from ${STUDY} ({{name.study}}) to ${TRIO} ({{name.trio}}), and {{name.trio}} is the one I recommend for most celebrations: {{team.trio}}, a dress or save-the-date session after the deposit, the full-length film of her whole day with a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{name.solo}} is ${SOLO} and {{name.cinema}} is ${CINEMA}. There's no travel fee anywhere in Arlington or the rest of DFW. You can see exactly what's in each one on our Packages & Prices page.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) pairs photos with the full-length 4K film of her whole day and a {{highlight.cinema}} highlight, and {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film and four short vertical videos for social media. And if you can't wait to share it, the Same-Day Edit (${SAMEDAY}) gives you a short highlight video within 24 hours. On a tighter budget, {{name.solo}} (${SOLO}) covers photos and the full-length film with one shooter and a {{cameras.solo}} camera setup, plus {{photos.solo}} edited photos.`
      },
      {
        "q": "What areas around Arlington do you serve?",
        "a": "Arlington sits in the center of everything, so besides the whole city we regularly photograph Grand Prairie, Mansfield, Pantego, Dalworthington Gardens, Kennedale, Fort Worth, and the Mid-Cities, all with no travel fee. Spring and fall Saturdays fill early, though, so the surest way to hold your date is to check it soon."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Arlington?",
        "a": `Mis paquetes van de ${STUDY} ({{nameEs.study}}) a ${TRIO} ({{nameEs.trio}}), y {{nameEs.trio}} es el que recomiendo para la mayoría de las celebraciones: {{teamEs.trio}}, una sesión con el vestido o de save the date después del depósito, el video completo de todo su día con un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{nameEs.solo}} cuesta ${SOLO} y {{nameEs.cinema}}, ${CINEMA}. No hay cargo por traslado en Arlington ni en el resto de DFW. Puedes ver todo lo que incluye cada uno en nuestra página de Paquetes y precios.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) junta las fotos con el video completo en 4K de todo su día y un resumen de {{highlightEs.cinema}}, y {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}} y cuatro videos verticales cortos para redes sociales. Y si no puedes esperar para compartirlo, la Edición el mismo día (${SAMEDAY}) te da un video corto de lo mejor en 24 horas. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) cubre las fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, {{photos.solo}} fotos editadas.`
      },
      {
        "q": "¿Qué zonas alrededor de Arlington cubres?",
        "a": "Arlington está en el centro de todo, así que además de toda la ciudad fotografiamos seguido en Grand Prairie, Mansfield, Pantego, Dalworthington Gardens, Kennedale, Fort Worth y los Mid-Cities, todo sin cargo por traslado. Eso sí, los sábados de primavera y otoño se llenan pronto, así que lo más seguro para apartar tu fecha es revisarla con tiempo."
      }
    ]
  },
  "mansfield": {
    "intro": [
      "Mansfield sits at the southeast corner of the metroplex, on the line where Tarrant County slips into Johnson County and the subdivisions give way to creeks, country-club fairways, and one of the largest park systems in this part of DFW. The Mexican-American families here have put down real roots: you'll hear Spanish at the Saturday vigil and Sunday Mass in the bilingual parishes east of downtown, and the panaderías and taquerías along the Broad Street and US-287 corridors stay busy all weekend when there's a quince. When a family in Mansfield plans the day, they tend to give themselves room to do every part of it.",
      "That's a gift for portraits, because the backdrops are here to match. Historic Downtown Mansfield gives you brick storefronts, the 1917 Farr Best Theater marquee, and a run of hand-painted murals along Main Street; ten minutes south, Elmer W. Oliver Nature Park opens up to ponds, a wooden boardwalk, and the windmill the whole city photographs — and by March the meadows fill in with bluebonnets. Add the rose garden at Katherine Rose Memorial Park and the shaded creek bridges of the Walnut Creek Linear Trail and you can build a portrait route that never repeats the same look twice.",
      "A TX Quince team stays with your family the whole day — la misa, the formal portraits, el vals, the baile sorpresa, and the reception, start to finish — and every gallery and film is edited by us, the owners. Everything runs bilingual. Mansfield is a natural fit for {{name.trio}}, where photos and video carry the whole night and a printed photo album holds it afterward — but it's the day, not the package, that drives how we shoot it."
    ],
    "introEs": [
      "Mansfield está en el extremo sureste del metroplex, en la línea donde el condado de Tarrant se mete en el de Johnson y los fraccionamientos dan paso a arroyos, los fairways del club de golf y uno de los sistemas de parques más grandes de esta zona de DFW. Las familias mexicanas de aquí ya echaron raíces de verdad: se escucha español en la misa de vigilia del sábado y en las misas del domingo en las parroquias bilingües al este del centro, y las panaderías y taquerías por Broad Street y la US-287 no paran el fin de semana cuando hay quince. Cuando una familia de Mansfield planea el día, se da el tiempo para hacer cada parte como se debe.",
      "Eso es una ventaja para las fotos, porque los fondos están aquí para acompañarlo. El Historic Downtown te da fachadas de ladrillo, la marquesina del Farr Best Theater de 1917 y una serie de murales pintados a mano sobre Main Street; diez minutos al sur, el Elmer W. Oliver Nature Park se abre con lagunas, un puente de madera y el molino de viento que toda la ciudad fotografía — y para marzo los campos se llenan de bluebonnets. Súmale el jardín de rosas del Katherine Rose Memorial Park y los puentes sombreados del Walnut Creek Linear Trail y armas una ruta de fotos que nunca repite el mismo look.",
      "Un equipo de TX Quince acompaña a tu familia todo el día —la misa, las fotos formales, el vals, el baile sorpresa y la recepción, de principio a fin—, y nosotros, los dueños, editamos cada galería y cada video. Todo es bilingüe. Mansfield encaja natural con {{nameEs.trio}}, donde las fotos y el video cargan toda la noche y un álbum de fotos impreso la guarda después — pero es el día, no el paquete, lo que define cómo lo fotografiamos."
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
        "a": `Packages are ${STUDY} ({{name.study}}), ${SOLO} ({{name.solo}}), ${CINEMA} ({{name.cinema}}) and ${TRIO} ({{name.trio}}, the one I recommend for most celebrations). A ${RETAINER_PCT} deposit locks in the date once your agreement is approved, and the rest is due ${BALANCE_DAYS} days before the event. There's no travel fee anywhere in DFW, so Mansfield's southeast-corner location never adds to the price.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) and {{name.trio}} (${TRIO}) pair photos with the full-length 4K film of her whole day, and {{sessionIn}} include a dress or save-the-date session after the deposit; {{name.trio}} goes further — {{team.trio}}, ${HRS_TRIO} hours, a {{highlight.trio}} highlight film and a printed photo album. For a separate day of portraits in her dress, the Second Portrait Day (${SECONDDAY}) adds photos and video at up to 2 locations. On a tighter budget, {{name.solo}} (${SOLO}) covers both with one shooter and a {{cameras.solo}} camera setup: the full-length film of her day and {{photos.solo}} edited photos. If you don't need video, the {{name.study}} (${STUDY}) is photo only.`
      },
      {
        "q": "Which areas near Mansfield do you cover?",
        "a": "All of them — Mansfield sits between Arlington, Grand Prairie, Kennedale, Burleson, Midlothian, and Cedar Hill, and I photograph quinceañeras across the entire Dallas–Fort Worth metroplex with no travel fee. Wherever your misa and reception are, I'm there for the full day."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Mansfield?",
        "a": `Los paquetes son ${STUDY} ({{nameEs.study}}), ${SOLO} ({{nameEs.solo}}), ${CINEMA} ({{nameEs.cinema}}) y ${TRIO} ({{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones). Un depósito del ${RETAINER_PCT} asegura la fecha una vez aprobado tu contrato, y el resto se paga ${BALANCE_DAYS} días antes del evento. No hay cargo por traslado en ningún punto de DFW, así que estar en el extremo sureste del metroplex nunca sube el precio.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) y {{nameEs.trio}} (${TRIO}) combinan las fotos con el video completo en 4K de todo su día, y {{sessionInEs}} incluyen una sesión con el vestido o de save the date después del depósito; {{nameEs.trio}} va más allá: {{teamEs.trio}}, ${HRS_TRIO} horas, un resumen de {{highlightEs.trio}} y un álbum de fotos impreso. Para un día aparte de retratos con su vestido, el Segundo día de retratos (${SECONDDAY}) suma fotos y video en hasta 2 lugares. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) cubre las dos cosas con una sola persona y {{cameras.solo}} cámaras: el video completo de su día y {{photos.solo}} fotos editadas. Si no necesitas video, la {{nameEs.study}} (${STUDY}) es solo de foto.`
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
      "Your Saturday is documented by a TX Quince team that is actually present for the whole thing — la misa, the portraits, your entrada, the father-daughter vals, the baile sorpresa, and the reception after — and every gallery and film is edited by us, the owners. There is no travel fee anywhere in DFW, and with the packages that include video, a short highlight lets you share the day while it is still fresh."
    ],
    "introEs": [
      "Farmers Branch es chiquito, pero de raíces hondas. El barrio de City Center —las cuadras por Webb Chapel y Valley View— tiene una de las concentraciones de familias mexicanas más altas de cualquier vecindario del país: en la mayoría de las casas se habla español y una quinceañera es algo que saca adelante toda la cuadra. Aquí se sabe muy bien lo que significa el día.",
      "Le dicen “la ciudad en el parque”, y el corazón es el Farmers Branch Historical Park, de 27 acres, justo en el centro del pueblo. Una iglesia blanca de los 1890, una casita Queen Anne de 1885, caminos de ladrillo, un kiosco y el jardín de rosas Ruthan Rogers al frente lo hacen uno de los mejores lugares para fotos de todo el norte de Dallas: parece de otra época, justo el fondo que quieres detrás de un vestido de gala. (El pueblo empezó llamándose “Mustang Branch” antes de que la tierra de cultivo le diera su nombre; la vieja estación de tren, el vagón y las cabañas de troncos del parque todavía lo cuentan.)",
      "Tu sábado lo documenta un equipo de TX Quince que de verdad está presente toda la jornada —la misa, las fotos, tu entrada, el vals con tu papá, el baile sorpresa y la recepción—, y nosotros, los dueños, editamos cada galería y cada video. No hay cargo por traslado en ningún punto de DFW, y con los paquetes que incluyen video, un resumen corto te deja compartir el día mientras sigue fresquecito."
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
        "a": `My packages run ${STUDY} for the {{name.study}} (photo only), ${SOLO} for {{name.solo}} (photo and video from one shooter), ${CINEMA} for {{name.cinema}} and ${TRIO} for {{name.trio}} — the one I recommend for most celebrations. Pricing is the same across DFW with no travel fee to Farmers Branch, and you can sign the agreement online — I'll hold the date for ${HOLD_DAYS} days while we review it, then a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) and {{name.trio}} (${TRIO}) both pair photos with video, so you get the photos and the full-length 4K film of her whole day: the misa, the vals, every toast and the reception. If your family wants the look of real old-style video, the Vintage Film Clip (Super 8) is ${SUPER8}. On a tighter budget, {{name.solo}} (${SOLO}) pairs photos and video too, with one shooter filming and taking photos at once from a {{cameras.solo}} camera setup.`
      },
      {
        "q": "What areas near Farmers Branch do you serve?",
        "a": "Farmers Branch sits right against Carrollton, Addison, Irving, and Northwest Dallas, and I photograph quinceañeras across all of them — plus Coppell, Lewisville, and the rest of the metroplex — with no travel fee anywhere in DFW."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Farmers Branch?",
        "a": `Mis paquetes van de ${STUDY} con la {{nameEs.study}} (solo foto), ${SOLO} con {{nameEs.solo}} (foto y video con una sola persona), ${CINEMA} con {{nameEs.cinema}} y ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones. El precio es el mismo en todo DFW, sin cargo por traslado a Farmers Branch, y puedes firmar el contrato en línea: te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos, y luego un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) y {{nameEs.trio}} (${TRIO}) combinan fotos con video, así te llevas las fotos y el video completo en 4K de todo su día: la misa, el vals, cada brindis y la recepción. Si tu familia quiere el look de video antigua de verdad, el Clip de película vintage (Super 8) cuesta ${SUPER8}. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) también combina foto y video, con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras.`
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
      `A TX Quince team covers your day in English and Spanish, with no travel fee anywhere in DFW — Frisco included — and we, the owners, edit every gallery and film ourselves. For most Frisco families we recommend {{name.trio}} (${TRIO}): ${HRS_TRIO} hours with {{team.trio}}, a dress or save-the-date session after the deposit, the full-length film of her whole day with a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. If you want a coordinator who runs the day, add the Day-of Coordinator (${COORDINATOR} a day). And if your family wants a separate day for portraits in her dress, the Second Portrait Day (${SECONDDAY}) adds one, with photos and video at up to 2 locations.`
    ],
    "introEs": [
      "Frisco lleva dos décadas entre las ciudades que más crecen en el país, y aquí una quinceañera muchas veces se planea como evento de destino: un salón de hotel o de resort, la corte completa y parientes que llegan de todo Texas para el fin de semana. La ciudad está partida entre los condados de Collin y Denton, y las familias que celebran aquí mantienen la tradición completa —la misa, la corte de honor, el vals con papá, el baile sorpresa—, solo que con un fondo más nuevo y pulido que el de las zonas más antiguas del metroplex.",
      "Ese fondo es justo lo especial. The Star in Frisco te da cristal, acero y plazas abiertas alrededor del Ford Center; Frisco Square tiene los jardines cívicos y las calles arboladas alrededor del City Hall; y unas cuadras al este, el Rail District sobre Main Street conserva el ladrillo, los murales y la historia ferroviaria del pueblo original. Si quieres verde, Frisco Commons Park tiene fuentes, un estanque y prados amplios a unos pasos de Frisco Square, así que pasamos de la ciudad al jardín sin perder la luz de la tarde.",
      `Un equipo de TX Quince cubre tu día en inglés y español, sin cargo por traslado en ningún lugar de DFW, Frisco incluido, y nosotros, los dueños, editamos cada galería y cada video. Para la mayoría de las familias de Frisco recomendamos {{nameEs.trio}} (${TRIO}): ${HRS_TRIO} horas con {{teamEs.trio}}, una sesión con el vestido o de save the date después del depósito, el video completo de todo su día con un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. Si quieres una coordinadora que lleve el día, suma la Coordinadora del día (${COORDINATOR} por día). Y si tu familia quiere un día aparte para retratos con su vestido, el Segundo día de retratos (${SECONDDAY}) lo suma, con fotos y video en hasta 2 lugares.`
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
        "a": `My packages run from ${STUDY} for the {{name.study}} to ${TRIO} for {{name.trio}} — the one I recommend for most celebrations — with {{name.solo}} at ${SOLO} and {{name.cinema}} at ${CINEMA} in between. For context, most DFW quince studios publish packages between about $1,500 and $6,000; my packages are built for families who want a photographer, a videographer and a printed photo album, not just a gallery link. There's no travel fee to Frisco; compare all four on our Packages & Prices page.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) and {{name.trio}} (${TRIO}) both put photographers and videographers on the same day — a team ({{team.cinema}} or {{team.trio}}). For families who want to share right away, the Same-Day Edit (${SAMEDAY}) is a short highlight video ready within 24 hours. On a tighter budget, {{name.solo}} (${SOLO}) gets you photos and video from one shooter with a {{cameras.solo}} camera setup.`
      },
      {
        "q": "What areas near Frisco do you serve?",
        "a": "Frisco sits between Plano, McKinney, Allen, Prosper, Little Elm, The Colony and Celina, and I cover all of them — plus the rest of Dallas–Fort Worth — with no travel fee. Wherever your church and venue land, the package is the same."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Frisco?",
        "a": `Mis paquetes van de ${STUDY} con la {{nameEs.study}} a ${TRIO} con {{nameEs.trio}} —el que recomiendo para la mayoría de las celebraciones—, con {{nameEs.solo}} en ${SOLO} y {{nameEs.cinema}} en ${CINEMA} en medio. Como referencia, la mayoría de los estudios de quince en DFW publican paquetes de entre unos $1,500 y $6,000; mis paquetes están pensados para familias que quieren un fotógrafo, un videógrafo y un álbum de fotos impreso, no solo un enlace a una galería. No hay cargo por traslado a Frisco; compara los cuatro en nuestra página de Paquetes y precios.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) y {{nameEs.trio}} (${TRIO}) juntan fotógrafos y videógrafos el mismo día: un equipo ({{teamEs.cinema}} o {{teamEs.trio}}). Para las familias que quieren compartir enseguida, la Edición el mismo día (${SAMEDAY}) es un video corto de lo mejor, listo en 24 horas. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) te da fotos y video con una sola persona y {{cameras.solo}} cámaras.`
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
      `Every Plano quinceañera we cover is fully bilingual, with no travel fee anywhere in DFW: a TX Quince team photographs the day, and we, the owners, edit every gallery and film. If your day runs from a downtown misa to a Legacy ballroom, {{name.trio}} (${TRIO}) is the package we recommend: ${HRS_TRIO} hours with {{team.trio}}, a dress or save-the-date session after the deposit, the full-length film of her whole day with a {{highlight.trio}} highlight film, and a 40-page printed photo album. Families who only want a portrait session before the day can start with the {{name.study}} (${STUDY}).`
    ],
    "introEs": [
      "Plano son dos ciudades en una, y una quinceañera aquí muchas veces toca las dos. Al este de la Central Expressway está el Plano más antiguo: el Historic Downtown sobre la calle 15, la estación del DART y los barrios del lado este, donde vive buena parte de la comunidad hispana de la ciudad. Al oeste del tollway está Legacy: los corporativos, Legacy West y las Shops at Legacy, y salones de hotel hechos para celebraciones grandes. Las familias de Plano hacen la tradición completa —primero la misa, luego las fotos, después el vals y la fiesta— y suelen planear cada detalle con cuidado.",
      "Esa división les da mucha variedad a las fotos. El Historic Downtown de Plano tiene fachadas de ladrillo, murales y el Haggard Park, donde sigue en pie la vieja estación del tren interurbano; Arbor Hills Nature Preserve, del lado oeste, se abre en praderas onduladas y senderos entre árboles que brillan a la hora dorada; Legacy West te da arquitectura moderna y andadores con jardines para un look editorial de ciudad de noche. Y si quieres tomas amplias y tranquilas, Oak Point Park and Nature Preserve, al noreste, suma cientos de acres de lagunas y praderas.",
      `Cada quinceañera que cubrimos en Plano es totalmente bilingüe y sin cargo por traslado en ningún lugar de DFW: un equipo de TX Quince fotografía el día y nosotros, los dueños, editamos cada galería y cada video. Si tu día va de una misa en el centro a un salón en Legacy, {{nameEs.trio}} (${TRIO}) es el paquete que recomendamos: ${HRS_TRIO} horas con {{teamEs.trio}}, una sesión con el vestido o de save the date después del depósito, el video completo de todo su día con un resumen de {{highlightEs.trio}} y un álbum de fotos impreso de 40 páginas. Las familias que solo quieren una sesión de retratos antes del día pueden empezar con {{nameEs.study}} (${STUDY}).`
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
        "a": `{{name.study}} is ${STUDY}, {{name.solo}} ${SOLO}, {{name.cinema}} ${CINEMA} and {{name.trio}} ${TRIO}. I recommend {{name.trio}} for most Plano celebrations because {{team.trio}} cover the misa through the last dance, with the full-length film of her whole day and a printed photo album; if you'd like a coordinator who runs the day, the Day-of Coordinator is ${COORDINATOR} a day. A ${RETAINER_PCT} deposit locks in the date once your agreement is approved, and the rest is due ${BALANCE_DAYS} days before the event; compare everything on our Packages & Prices page.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day and a {{highlight.cinema}} highlight; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film and four short vertical videos for social media. {{sessionIn}} include a dress or save-the-date session — {{session.photos}} edited photos of her in her dress before the big day — booked after the deposit. On a tighter budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup.`
      },
      {
        "q": "What areas near Plano do you cover?",
        "a": "Plano borders Richardson, Allen, Frisco, Murphy, Parker, Carrollton and Addison, with McKinney and Wylie a short drive away, and I photograph quinceañeras across all of them — and the rest of the metroplex — with no travel fee."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Plano?",
        "a": `{{nameEs.study}} cuesta ${STUDY}, {{nameEs.solo}} ${SOLO}, {{nameEs.cinema}} ${CINEMA} y {{nameEs.trio}} ${TRIO}. Para la mayoría de las celebraciones en Plano recomiendo {{nameEs.trio}}, porque {{teamEs.trio}} cubren de la misa al último baile, con el video completo de todo su día y un álbum de fotos impreso; si quieres una coordinadora que lleve el día, la Coordinadora del día cuesta ${COORDINATOR} por día. Un depósito del ${RETAINER_PCT} asegura la fecha una vez aprobado tu contrato, y el resto se paga ${BALANCE_DAYS} días antes del evento; compara todo en nuestra página de Paquetes y precios.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día y un resumen de {{highlightEs.cinema}}; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}} y cuatro videos verticales cortos para redes sociales. {{sessionInEs}} incluyen una sesión con el vestido o de save the date —{{session.photos}} fotos editadas de ella con su vestido antes del gran día—, que se agenda después del depósito. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras.`
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
      `A TX Quince team photographs your McKinney celebration, fully bilingual and with no travel fee anywhere in DFW, and the finished gallery and film come from us: the owners edit every one. For most McKinney celebrations we recommend {{name.trio}} (${TRIO}): ${HRS_TRIO} hours with {{team.trio}}, a dress or save-the-date session after the deposit — Adriatica or Chestnut Square are natural picks — the full-length film of her whole day, {{photos.trio}} edited photos and a 40-page printed photo album. Families who want a matching keepsake for both households can add Albums for Mom & Dad (${PARENTS} for the pair), and a Day-of Coordinator who runs the day is ${COORDINATOR} a day.`
    ],
    "introEs": [
      "McKinney tiene algo que casi nadie más tiene en el condado de Collin: un centro histórico de verdad, construido alrededor del antiguo juzgado del condado en la plaza —hoy el McKinney Performing Arts Center— con más de un siglo de fachadas de ladrillo a su alrededor. Es la cabecera del condado, con algunas de sus familias hispanas de raíces más hondas en el lado este y nuevas que llegan cada año mientras la ciudad crece hacia el norte y el oeste. Una quinceañera en McKinney suele sentirse como fiesta de pueblo —la parroquia, la plaza, la recepción—, aunque la ciudad haya crecido tanto a su alrededor.",
      "Las opciones para fotos van con ese carácter de pueblo que crece. En el centro, la plaza te da ladrillo, herrería y letreros antiguos; unas cuadras al sur, Chestnut Square Historic Village tiene casas restauradas del siglo XIX, jardines y prados con sombra. Hacia el oeste, cerca de Stonebridge Ranch, Adriatica Village es una colina inspirada en Croacia con callejones de piedra, arcos y un campanario: lo más parecido a un fondo europeo en el norte de Texas. Para agua y cielo abierto, Towne Lake te da un sendero junto al lago al atardecer, y el Heard Natural Science Museum & Wildlife Sanctuary suma puentes de madera sobre humedales y pradera nativa.",
      `Un equipo de TX Quince fotografía tu celebración en McKinney, todo bilingüe y sin cargo por traslado en ningún lugar de DFW, y la galería y el video terminados salen de nuestras manos: los dueños editamos cada uno. Para la mayoría de las celebraciones en McKinney recomendamos {{nameEs.trio}} (${TRIO}): ${HRS_TRIO} horas con {{teamEs.trio}}, una sesión con el vestido o de save the date después del depósito —Adriatica o Chestnut Square son opciones naturales—, el video completo de todo su día, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. Las familias que quieren un recuerdo igual para cada hogar pueden sumar los Álbumes para mamá y papá (${PARENTS} el par), y una Coordinadora del día que lleve el día cuesta ${COORDINATOR} por día.`
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
        "a": `Packages begin at ${STUDY} for the {{name.study}} — photos only, a ${HRS_STUDY}-hour session with {{team.study}} and {{photos.study}} edited photos — and run through ${SOLO} for {{name.solo}} and ${CINEMA} for {{name.cinema}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations. Sign the agreement online and I'll hold your date for ${HOLD_DAYS} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call. There's no travel fee to McKinney.`
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
        "a": `Yes. {{name.cinema}} (${CINEMA}) delivers the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, four short videos for social media, {{photos.trio}} edited photos and the printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit. A Vintage Film Clip (Super 8) can be added to either full-length film for ${SUPER8}. On a tighter budget, {{name.solo}} (${SOLO}) covers photos and the full-length film with one shooter and a {{cameras.solo}} camera setup, plus {{photos.solo}} edited photos.`
      },
      {
        "q": "What areas near McKinney do you serve?",
        "a": "McKinney sits between Allen, Frisco, Prosper, Fairview, Melissa and Princeton, with Plano a short drive south, and I photograph quinceañeras across all of them and the rest of Dallas–Fort Worth with no travel fee."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en McKinney?",
        "a": `Los paquetes empiezan en ${STUDY} con la {{nameEs.study}} —solo fotos, una sesión de ${HRS_STUDY} h con {{teamEs.study}} y {{photos.study}} fotos editadas—; siguen ${SOLO} con {{nameEs.solo}} y ${CINEMA} con {{nameEs.cinema}}, y llegan a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones. Firma el contrato en línea y te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida. No hay cargo por traslado a McKinney.`
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
        "a": `Sí. {{nameEs.cinema}} (${CINEMA}) entrega el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, cuatro videos cortos para redes, {{photos.trio}} fotos editadas y el álbum de fotos impreso. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito. Se puede sumar un Clip de película vintage (Super 8) a cualquiera de los dos videos completos por ${SUPER8}. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) cubre las fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, {{photos.solo}} fotos editadas.`
      },
      {
        "q": "¿Qué zonas cerca de McKinney cubres?",
        "a": "McKinney está entre Allen, Frisco, Prosper, Fairview, Melissa y Princeton, con Plano a unos minutos al sur, y fotografío quinceañeras en todas y en el resto de Dallas–Fort Worth sin cargo por traslado."
      }
    ]
  },
  ...extraCityContent,
};

export function getCityContent(slug: string): CityContent | undefined {
  return cityContent[slug];
}
