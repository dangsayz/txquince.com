import { PT } from "@/lib/price-text";
import type { Location } from "@/content/locations";
import type { CityContent } from "@/content/city-content";

const STUDY = PT.price.study;
const SOLO = PT.price.solo;
const CINEMA = PT.price.cinema;
const TRIO = PT.price.trio;
const COORDINATOR = PT.addon.coordinator;
const RETAINER_PCT = PT.deposit.percent;
const HRS_SOLO = PT.hours.solo;
const HRS_CINEMA = PT.hours.cinema;
const HRS_TRIO = PT.hours.trio;

export const location: Location = {
  slug: "cedar-hill",
  city: "Cedar Hill",
  county: "Dallas & Ellis counties",
  tier: "volume",
  areas: [
    "Historic Downtown Cedar Hill",
    "Lake Ridge",
    "Hillside Village",
    "Joe Pool Lake",
    "Cedar Hill State Park",
  ],
  lead: "On the hills above Joe Pool Lake, in the southwest corner of Dallas County.",
  intro: [
    "Cedar Hill sits on the eastern shore of Joe Pool Lake, with the limestone hills, state park and preserves that make it feel a world away from the city. From the parishes of the area to receptions along the Highway 67 corridor and out toward the lake, I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Cedar Hill?",
      a: "Yes — Cedar Hill is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Cedar Hill families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${PT.holdDays} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Sobre las colinas de Joe Pool Lake, en el suroeste del condado de Dallas.",
  introEs: [
    "Cedar Hill está en la orilla este de Joe Pool Lake, con colinas de piedra caliza, un parque estatal y reservas naturales que hacen que se sienta lejos de la ciudad. Desde las parroquias de la zona hasta las recepciones por el corredor de la Highway 67 y rumbo al lago, lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Cedar Hill?",
      a: "Sí — Cedar Hill es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Cedar Hill?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${PT.holdDays} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Cedar Hill sits about sixteen miles southwest of downtown Dallas, on the eastern shore of Joe Pool Lake. It borders Grand Prairie, Duncanville, DeSoto and Midlothian, and the city is mostly in Dallas County with a small southern piece in Ellis County. It is one of the hillier corners of the metroplex, and families here have a lot of green to work with: a state park, two nature preserves and a historic downtown, all inside the city.",
    "What makes the day easy to photograph is that Cedar Hill hands you very different backdrops close together. Head toward the lake and you are in limestone hills, prairie pockets and open water at Cedar Hill State Park. Turn toward Main Street and you are in Historic Downtown, with its old buildings and a self-guided walking tour. We can build your portraits around the hills, the lake, the downtown, or all three.",
    "I only ever hold one quinceañera per date. So whether your reception is along the Highway 67 corridor, near Historic Downtown, or out toward the lake, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Cedar Hill está a unas dieciséis millas al suroeste del centro de Dallas, en la orilla este de Joe Pool Lake. Colinda con Grand Prairie, Duncanville, DeSoto y Midlothian, y la ciudad está casi toda en el condado de Dallas, con una pequeña parte al sur en el condado de Ellis. Es una de las zonas más con lomas del metroplex, y aquí las familias tienen mucho verde para escoger: un parque estatal, dos reservas naturales y un centro histórico, todo dentro de la ciudad.",
    "Lo que hace fácil fotografiar el día es que Cedar Hill te da fondos muy distintos y bien cerca unos de otros. Hacia el lago estás entre colinas de piedra caliza, pedazos de pradera y agua abierta en Cedar Hill State Park. Hacia Main Street estás en el centro histórico, con sus edificios antiguos y un recorrido a pie que puedes hacer por tu cuenta. Podemos armar tus fotos alrededor de las colinas, del lago, del centro, o de los tres.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté por el corredor de la Highway 67, cerca del centro histórico, o por el lado del lago, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Cedar Hill State Park",
      why: "On the shore of Joe Pool Lake, with rugged limestone hills, pockets of prairie, a gravel swimming beach and lake views. Big natural scenery inside the city, with plenty of room for a full court.",
      whyEs: "En la orilla de Joe Pool Lake, con colinas de piedra caliza, pedazos de pradera, una playa de grava y vistas al lago. Naturaleza amplia dentro de la ciudad, con espacio de sobra para toda la corte.",
    },
    {
      name: "Penn Farm Agricultural History Center (Cedar Hill State Park)",
      why: "A historic family farm inside the state park, with old farm buildings and equipment from more than a century of farming. A rustic, weathered backdrop that looks nothing like a studio.",
      whyEs: "Una granja histórica familiar dentro del parque estatal, con construcciones y equipo agrícola de más de un siglo. Un fondo rústico y con carácter que no se parece en nada a un estudio.",
    },
    {
      name: "Dogwood Canyon Audubon Center",
      why: "A forested preserve of more than 200 acres with hiking trails and scenic overlooks. Shaded woods and soft light when you want something quieter and greener.",
      whyEs: "Una reserva boscosa de más de 200 acres con senderos y miradores. Bosque con sombra y luz suave cuando quieres algo más tranquilo y verde.",
    },
    {
      name: "Cedar Mountain Preserve",
      why: "A Dallas County preserve maintained by the city, with natural overlooks and sweeping vistas, secluded valleys and forested canyons. A good pick for portraits with the hills behind her.",
      whyEs: "Una reserva del condado de Dallas que mantiene la ciudad, con miradores naturales y vistas amplias, valles apartados y cañones con bosque. Buena opción para retratos con las colinas de fondo.",
    },
    {
      name: "Historic Downtown Cedar Hill",
      why: "The city's old downtown around Main Street, with historic buildings and a self-guided walking tour. A real small-town backdrop for portraits before the celebration.",
      whyEs: "El centro viejo de la ciudad, alrededor de Main Street, con edificios históricos y un recorrido a pie que puedes hacer por tu cuenta. Un fondo de pueblo de verdad para fotos antes de la celebración.",
    },
    {
      name: "Lester Lorch Park",
      why: "A city park with mature trees, grassy meadows and a small fishing lake, with wildflowers in spring and early summer. Open green space for relaxed group portraits.",
      whyEs: "Un parque de la ciudad con árboles grandes, praderas con pasto y un laguito para pescar, con flores silvestres en primavera y a principios del verano. Espacio verde abierto para fotos de grupo sin prisa.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Cedar Hill?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Cedar Hill day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Cedar Hill?",
      a: "My go-to spots are Cedar Hill State Park on Joe Pool Lake, including the historic Penn Farm, Dogwood Canyon Audubon Center and Cedar Mountain Preserve for green, natural light and hill views, Historic Downtown Cedar Hill for a small-town backdrop, and Lester Lorch Park for open meadows. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Cedar Hill families usually hold the reception?",
      a: "All over the area — along the Highway 67 corridor, around Belt Line Road near Historic Downtown, and out along FM 1382 toward Joe Pool Lake, plus halls in neighboring cities like Duncanville, DeSoto and Grand Prairie. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Cedar Hill?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Cedar Hill do you cover?",
      a: "All of it, with no travel fee — Cedar Hill plus Duncanville, DeSoto, Grand Prairie, Glenn Heights, Ovilla and Midlothian, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Cedar Hill?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Cedar Hill cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Cedar Hill?",
      a: "Mis lugares favoritos son Cedar Hill State Park en Joe Pool Lake, incluyendo la histórica Penn Farm, Dogwood Canyon Audubon Center y Cedar Mountain Preserve para luz verde y natural y vistas de las colinas, el centro histórico (Historic Downtown Cedar Hill) para un fondo de pueblo, y Lester Lorch Park para praderas abiertas. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Cedar Hill?",
      a: "Por toda la zona — por el corredor de la Highway 67, por Belt Line Road cerca del centro histórico, y por FM 1382 rumbo a Joe Pool Lake, además de salones en ciudades vecinas como Duncanville, DeSoto y Grand Prairie. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Cedar Hill?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Cedar Hill cubres?",
      a: "Todas, sin cargo por traslado — Cedar Hill más Duncanville, DeSoto, Grand Prairie, Glenn Heights, Ovilla y Midlothian, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
