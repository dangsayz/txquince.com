import { PT } from "@/lib/price-text";
import type { Location } from "@/content/locations";
import type { CityContent } from "@/content/city-content";

const STUDY = PT.price.study;
const SOLO = PT.price.solo;
const CINEMA = PT.price.cinema;
const TRIO = PT.price.trio;
const COORDINATOR = PT.addon.coordinator;
const RETAINER_PCT = PT.deposit.percent;
const HOLD_DAYS = PT.holdDays;
const HRS_STUDY = PT.hours.study;
const HRS_SOLO = PT.hours.solo;
const HRS_CINEMA = PT.hours.cinema;
const HRS_TRIO = PT.hours.trio;

export const location: Location = {
  slug: "desoto",
  city: "DeSoto",
  county: "Dallas County",
  tier: "volume",
  areas: [
    "DeSoto Town Center",
    "Pleasant Run Road",
    "Hampton Road",
    "Windmill Hill",
    "Roy Orr Trail along Ten Mile Creek",
  ],
  lead: "A southern Dallas County city with trails, woods and a town center for portraits.",
  intro: [
    "DeSoto sits in southern Dallas County along Interstate 35E, with its Town Center at Hampton Road and Pleasant Run Road. From the church to portraits at Windmill Hill to a reception along Pleasant Run Road, I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in DeSoto?",
      a: "Yes — DeSoto is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should DeSoto families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${HOLD_DAYS} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Una ciudad del sur del condado de Dallas con senderos, bosque y un centro para tus fotos.",
  introEs: [
    "DeSoto está en el sur del condado de Dallas, sobre la Interstate 35E, con su Town Center en Hampton Road y Pleasant Run Road. Desde la iglesia hasta las fotos en Windmill Hill y la recepción por Pleasant Run Road, lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en DeSoto?",
      a: "Sí — DeSoto es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de DeSoto?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "DeSoto sits in southern Dallas County, with Interstate 35E running through town and its Town Center at Hampton Road and Pleasant Run Road. It is a city of neighborhood parks, a creek-side trail and a large wooded preserve, which makes it an easy place to plan a quinceañera day around the portraits as much as the party.",
    "What makes the day easy to photograph is that DeSoto hands you very different backdrops inside one city. Head to Windmill Hill and you're on forest trails; follow the Roy Orr Trail along Ten Mile Creek and you're on a wide paved path; stop at Briarwood Park and there's a landscaped pond with a pavilion over it; and the Town Center has its own outdoor amphitheater. We can build your portraits around the woods, the water, the Town Center, or a mix.",
    "I only ever hold one quinceañera per date. So whether your reception is along Pleasant Run Road, near Hampton Road, or out along the Interstate 35E corridor, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "DeSoto está en el sur del condado de Dallas, con la Interstate 35E cruzando la ciudad y su Town Center en Hampton Road y Pleasant Run Road. Es una ciudad de parques de vecindario, un sendero junto al arroyo y una reserva grande con bosque, y por eso es fácil armar el día de la quinceañera pensando tanto en las fotos como en la fiesta.",
    "Lo que hace fácil fotografiar el día es que DeSoto te da fondos muy distintos dentro de la misma ciudad. En Windmill Hill estás entre senderos de bosque; por el Roy Orr Trail, junto a Ten Mile Creek, tienes un camino ancho y pavimentado; en Briarwood Park hay un estanque con un pabellón encima; y el Town Center tiene su propio anfiteatro al aire libre. Podemos armar tus fotos alrededor del bosque, del agua, del Town Center, o de todo un poco.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté por Pleasant Run Road, cerca de Hampton Road, o por el corredor de la Interstate 35E, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Paul S. Dryer Preserve at Windmill Hill",
      why: "A forested preserve maintained by the City of DeSoto, with soft-surface trails, picnic tables and a bridge named in tribute to a well-known musician. Real woods for portraits with deep green behind the gown.",
      whyEs: "Una reserva con bosque que mantiene la ciudad de DeSoto, con senderos de tierra, mesas de picnic y un puente que lleva el nombre de un músico muy conocido. Bosque de verdad para fotos con verde profundo detrás del vestido.",
    },
    {
      name: "Roy Orr Trail",
      why: "A 3.6-mile, 8-foot-wide concrete trail that follows Ten Mile Creek through the middle of DeSoto and links neighborhoods to the Town Center. A long, smooth path that works well for walking portraits with the whole court.",
      whyEs: "Un sendero de concreto de 3.6 millas y 8 pies de ancho que sigue Ten Mile Creek por el centro de DeSoto y conecta los vecindarios con el Town Center. Un camino largo y liso que funciona muy bien para fotos caminando con toda la corte.",
    },
    {
      name: "Briarwood Park",
      why: "A neighborhood park on W. Beltline Road built along a creek, with a landscaped pond cut into a rocky hillside, ducks, and a pavilion that overlooks the water. A quiet, soft backdrop for gown portraits.",
      whyEs: "Un parque de vecindario en W. Beltline Road, hecho a lo largo de un arroyo, con un estanque con paisajismo en una ladera de roca, patos y un pabellón con vista al agua. Un fondo tranquilo y suave para las fotos del vestido.",
    },
    {
      name: "DeSoto Town Center",
      why: "The city's civic hub at Hampton Road and Pleasant Run Road, with an outdoor amphitheater beside the city buildings. A more urban, architectural set when you want something other than trees.",
      whyEs: "El centro cívico de la ciudad, en Hampton Road y Pleasant Run Road, con un anfiteatro al aire libre junto a los edificios de la ciudad. Un fondo más urbano y de arquitectura para cuando quieres algo distinto a los árboles.",
    },
    {
      name: "DeSoto Ranch Nature Trail",
      why: "A heavily wooded park site in a largely undeveloped part of DeSoto, along a tributary of Ten Mile Creek. Natural, quiet and green, away from the traffic.",
      whyEs: "Un parque muy arbolado en una zona casi sin construir de DeSoto, junto a un afluente de Ten Mile Creek. Natural, tranquilo y verde, lejos del tráfico.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in DeSoto?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your DeSoto day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in DeSoto?",
      a: "My go-to spots are the Paul S. Dryer Preserve at Windmill Hill and the DeSoto Ranch Nature Trail for woods and natural light, the Roy Orr Trail along Ten Mile Creek for a long paved path, Briarwood Park for its pond and pavilion, and the DeSoto Town Center for a more urban set. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do DeSoto families usually hold the reception?",
      a: "All over the city — halls along the Pleasant Run Road and Hampton Road corridors near the Town Center, venues along Interstate 35E, and places out toward Beltline Road. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in DeSoto?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around DeSoto do you cover?",
      a: "All of it, with no travel fee — DeSoto plus Cedar Hill, Duncanville, Lancaster, Glenn Heights, Red Oak, and Dallas, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en DeSoto?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en DeSoto cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en DeSoto?",
      a: "Mis lugares favoritos son el Paul S. Dryer Preserve en Windmill Hill y el DeSoto Ranch Nature Trail para bosque y luz natural, el Roy Orr Trail junto a Ten Mile Creek para un camino largo y pavimentado, Briarwood Park por su estanque y su pabellón, y el DeSoto Town Center para un fondo más urbano. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de DeSoto?",
      a: "Por toda la ciudad — salones por los corredores de Pleasant Run Road y Hampton Road cerca del Town Center, lugares sobre la Interstate 35E y otros rumbo a Beltline Road. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en DeSoto?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de DeSoto cubres?",
      a: "Todas, sin cargo por traslado — DeSoto más Cedar Hill, Duncanville, Lancaster, Glenn Heights, Red Oak y Dallas, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
