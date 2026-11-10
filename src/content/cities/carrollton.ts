import { PT } from "@/lib/price-text";
import type { Location } from "@/content/locations";
import type { CityContent } from "@/content/city-content";

const STUDY = PT.price.study;
const SOLO = PT.price.solo;
const CINEMA = PT.price.cinema;
const TRIO = PT.price.trio;
const COORDINATOR = PT.addon.coordinator;
const RETAINER_PCT = PT.deposit.percent;
const HRS_STUDY = PT.hours.study;
const HRS_SOLO = PT.hours.solo;
const HRS_CINEMA = PT.hours.cinema;
const HRS_TRIO = PT.hours.trio;

export const location: Location = {
  slug: "carrollton",
  city: "Carrollton",
  county: "Dallas, Denton & Collin counties",
  tier: "volume",
  areas: [
    "Historic Downtown Carrollton",
    "Trinity Mills",
    "Old Denton Road corridor",
    "Josey Ranch Lake",
    "Elm Fork Nature Preserve",
  ],
  lead: "A historic square, a river-bottom preserve, and room for a full quinceañera day.",
  intro: [
    "Carrollton sits north of Dallas along I-35E and spreads across parts of Dallas, Denton and Collin counties. It is a city of brick-lined downtown blocks, creekside greenbelts and busy corridors like Belt Line Road and Old Denton Road, and families here plan a quinceañera the full way. From the morning misa to receptions off Belt Line Road or up toward Hebron Parkway, I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Carrollton?",
      a: "Yes — Carrollton is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Carrollton families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${PT.holdDays} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Un centro histórico, un bosque junto al río y todo el espacio para un quince completo.",
  introEs: [
    "Carrollton está al norte de Dallas, a lo largo de la I-35E, y se extiende por partes de los condados de Dallas, Denton y Collin. Es una ciudad de cuadras de ladrillo en el centro, senderos junto a los arroyos y avenidas muy transitadas como Belt Line Road y Old Denton Road, y las familias de aquí hacen el quince completo. Desde la misa de la mañana hasta recepciones por Belt Line Road o rumbo a Hebron Parkway, lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Carrollton?",
      a: "Sí — Carrollton es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Carrollton?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${PT.holdDays} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Carrollton is one of the few Texas cities that sits in three counties at once — Dallas, Denton and Collin — and it feels like several places in one. The Elm Fork of the Trinity River runs along its east side, I-35E and the President George Bush Turnpike cross it, and the DART Green Line brings you straight into Historic Downtown Carrollton. Along Old Denton Road you'll find a busy strip of restaurants and shops, and families all over the city plan a fifteenth birthday the full way, from misa to el último baile.",
    "What makes the day easy to photograph is that Carrollton hands you very different backdrops inside one city. In the middle of town there's a brick-lined historic square with a gazebo on the lawn and the 1949 Plaza Theater building; a few miles away there's the wooded Elm Fork Nature Preserve and the creekside greenbelt along Furneaux Creek. We can build your portraits around the square, the trees, or both.",
    "I only ever hold one quinceañera per date. So whether your reception is in a banquet hall off Belt Line Road, along Old Denton Road, or up toward Hebron Parkway, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Carrollton es de las pocas ciudades de Texas que están en tres condados a la vez —Dallas, Denton y Collin— y se siente como varios lugares en uno. El Elm Fork del río Trinity corre por el lado este, la I-35E y la President George Bush Turnpike la cruzan, y el tren Green Line del DART te deja directo en el centro histórico de Carrollton. Por Old Denton Road hay una zona movida de restaurantes y negocios, y las familias de toda la ciudad hacen el quince completo, de la misa hasta el último baile.",
    "Lo que hace fácil fotografiar el día es que Carrollton te da fondos muy distintos dentro de la misma ciudad. En el centro hay una plaza histórica con calles de ladrillo, un kiosco en el pasto y el edificio del Plaza Theater, de 1949; a unos kilómetros está el Elm Fork Nature Preserve, con mucho árbol, y el sendero junto a Furneaux Creek. Podemos armar tus fotos alrededor de la plaza, del bosque, o de los dos.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté en un salón por Belt Line Road, por Old Denton Road o rumbo a Hebron Parkway, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Historic Downtown Carrollton Square",
      why: "Carrollton's original town square, with brick-lined streets, local shops and restaurants, and a gazebo standing on the lawn at the center. The 1949 Plaza Theater building sits on the square, so you get an old-town backdrop without leaving the city.",
      whyEs: "La plaza original de Carrollton, con calles de ladrillo, negocios y restaurantes locales y un kiosco en el centro del pasto. El edificio del Plaza Theater, de 1949, está en la misma plaza, así que tienes un fondo de pueblo antiguo sin salir de la ciudad.",
    },
    {
      name: "A.W. Perry Homestead Museum & Gravley Park",
      why: "A 1909 farmhouse with a wrap-around porch, set in a park with walking paths and a Victorian-style gazebo. The city welcomes professional photographers on the grounds and around the building exteriors (not inside), so we check the museum's schedule before booking a time.",
      whyEs: "Una casa de 1909 con porche que rodea la casa, dentro de un parque con senderos y un kiosco de estilo victoriano. La ciudad permite a fotógrafos profesionales usar los terrenos y los exteriores (no el interior), así que revisamos el calendario del museo antes de apartar el horario.",
    },
    {
      name: "Josey Ranch Lake Park",
      why: "A small lake with a fishing pier, picnic areas and a paved path that circles the water, set on a greenbelt that links to nearby parks. Open water and trees without driving far from the center of town.",
      whyEs: "Un lago pequeño con muelle de pesca, áreas de picnic y un sendero pavimentado que rodea el agua, sobre un cinturón verde que conecta con otros parques. Agua y árboles sin alejarse del centro de la ciudad.",
    },
    {
      name: "Elm Fork Nature Preserve",
      why: "A densely wooded area along the Elm Fork of the Trinity River, with a walking trail that winds through mature trees. It's wilder than the city parks, so we scout the path together before the day.",
      whyEs: "Un área muy arbolada junto al Elm Fork del río Trinity, con un sendero entre árboles grandes. Es más natural que los parques de la ciudad, así que revisamos el camino juntos antes del día.",
    },
    {
      name: "Greenbelt Park along Furneaux Creek",
      why: "Woods, meadows and ponds along Furneaux Creek, with wildflowers like bluebonnets and Indian blankets in season. Natural green and soft light for a full court.",
      whyEs: "Bosque, pradera y estanques a lo largo de Furneaux Creek, con flores silvestres como bluebonnets y Indian blankets en temporada. Verde natural y luz suave para toda la corte.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Carrollton?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Carrollton day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Carrollton?",
      a: "My go-to spots are Historic Downtown Carrollton Square with its brick streets and gazebo, the A.W. Perry Homestead Museum grounds and Gravley Park, Josey Ranch Lake Park for open water, and the Elm Fork Nature Preserve and the Furneaux Creek greenbelt for green, natural light. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Carrollton families usually hold the reception?",
      a: "All over the city — banquet halls along the Belt Line Road corridor, venues near Old Denton Road and the President George Bush Turnpike, and halls up toward Hebron Parkway. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Carrollton?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Carrollton do you cover?",
      a: "All of it, with no travel fee — Carrollton plus Farmers Branch, Addison, Coppell, Lewisville, The Colony, Plano and Frisco, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Carrollton?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Carrollton cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Carrollton?",
      a: "Mis lugares favoritos son la plaza del centro histórico de Carrollton con sus calles de ladrillo y su kiosco, los terrenos del A.W. Perry Homestead Museum y Gravley Park, Josey Ranch Lake Park para fotos con agua, y el Elm Fork Nature Preserve y el sendero junto a Furneaux Creek para luz verde y natural. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Carrollton?",
      a: "Por toda la ciudad — salones por el corredor de Belt Line Road, lugares cerca de Old Denton Road y la President George Bush Turnpike, y salones rumbo a Hebron Parkway. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Carrollton?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Carrollton cubres?",
      a: "Todas, sin cargo por traslado — Carrollton más Farmers Branch, Addison, Coppell, Lewisville, The Colony, Plano y Frisco, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};

// Referenced so the shared price constants stay identical to the model entry.
void HRS_STUDY;
