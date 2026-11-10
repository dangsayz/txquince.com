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
  slug: "lewisville",
  city: "Lewisville",
  county: "Denton County",
  tier: "volume",
  areas: [
    "Old Town Lewisville",
    "Vista Ridge",
    "Castle Hills",
    "Hebron",
    "Lewisville Lake",
  ],
  lead: "A lakeside Denton County city with a real historic downtown, right in the Dallas–Fort Worth service area.",
  intro: [
    "Lewisville sits at the southern end of Denton County, on the northern edge of the Dallas–Fort Worth metroplex, with Lewisville Lake along its western side. Families plan a quinceañera here around Old Town, the lake and the I-35E corridor, with the church, the portraits and the reception often spread across the city and its neighbors.",
    "A TX Quince team covers your celebration from start to finish — la misa, the portraits, el vals, and the reception — and every gallery and film is edited by us, the owners. No rushing through the moments that matter.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Lewisville?",
      a: "Yes — Lewisville is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Lewisville families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${PT.holdDays} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Una ciudad junto al lago en el condado de Denton, con un centro histórico de verdad, dentro de mi área de servicio de Dallas–Fort Worth.",
  introEs: [
    "Lewisville está en el extremo sur del condado de Denton, en el borde norte del metroplex de Dallas–Fort Worth, con Lewisville Lake por su lado oeste. Aquí las familias planean la quinceañera alrededor de Old Town, el lago y el corredor de la I-35E, y la iglesia, las fotos y la recepción muchas veces quedan repartidas por la ciudad y sus vecinos.",
    "Un equipo de TX Quince cubre tu celebración de principio a fin —la misa, las fotos, el vals y la recepción—, y nosotros, los dueños, editamos cada galería y cada video. Sin prisas en los momentos que importan.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Lewisville?",
      a: "Sí — Lewisville es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Lewisville?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${PT.holdDays} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Lewisville is one of the larger cities in southern Denton County, and it has two different faces inside one city limit. On the west side is Lewisville Lake, with its parks and shoreline. In the middle is Old Town, the historic downtown, where Main Street, the Lewisville Grand Theater and Wayne Ferguson Plaza sit within a few blocks of each other. For a family planning a fifteenth birthday, that is a lot of choice before you even pick a dress.",
    "What makes the day easy to photograph is how much is close together. Old Town gives you brick storefronts, murals and a landscaped plaza; the lake gives you open water and trees; and Interstate 35E runs through the middle of town, so moving between a church, your portraits and a reception hall is simple. We can build your portraits around Old Town, the lake, or both.",
    "I only ever hold one quinceañera per date. So whether your reception is near Old Town, out toward Vista Ridge, or over by the lake, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Lewisville es una de las ciudades más grandes del sur del condado de Denton, y tiene dos caras dentro de los mismos límites. Del lado oeste está Lewisville Lake, con sus parques y su orilla. En el centro está Old Town, el centro histórico, donde Main Street, el Lewisville Grand Theater y Wayne Ferguson Plaza quedan a unas cuantas cuadras uno del otro. Para una familia que planea unos quince años, eso es mucho de dónde escoger antes de siquiera elegir el vestido.",
    "Lo que hace fácil fotografiar el día es lo cerca que está todo. Old Town te da fachadas de ladrillo, murales y una plaza con jardines; el lago te da agua abierta y árboles; y la Interstate 35E cruza por el medio de la ciudad, así que moverse entre la iglesia, las fotos y el salón es sencillo. Podemos armar tus fotos alrededor de Old Town, del lago, o de los dos.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté cerca de Old Town, rumbo a Vista Ridge, o por el lado del lago, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Wayne Ferguson Plaza (Old Town)",
      why: "A 1.5-acre plaza in historic downtown with a water wall, a long water course, green lawn, wildflower and prairie-grass plantings, and a lot of shade trees. A polished backdrop for gown portraits right in the middle of Old Town.",
      whyEs: "Una plaza en el centro histórico con una pared de agua, un canal largo de agua, pasto verde, flores silvestres y pastos de pradera, y muchos árboles que dan sombra. Un fondo muy cuidado para las fotos del vestido, justo en el corazón de Old Town.",
    },
    {
      name: "Old Town Lewisville",
      why: "The city's historic downtown, centered on Main Street, with older storefronts and murals on local walls. Easy walking between spots, so the court can move from one backdrop to the next.",
      whyEs: "El centro histórico de la ciudad, alrededor de Main Street, con fachadas antiguas y murales en las paredes del lugar. Se camina fácil entre un punto y otro, así que la corte puede pasar de un fondo al siguiente.",
    },
    {
      name: "Lewisville Grand Theater sculpture garden",
      why: "A courtyard with rotating sculpture exhibits at the Grand Theater on Charles Street in Old Town. A small, artful corner for portraits, a short walk from the plaza.",
      whyEs: "Un patio con esculturas que van cambiando, en el Grand Theater sobre Charles Street en Old Town. Un rincón chico y artístico para retratos, a unos pasos de la plaza.",
    },
    {
      name: "Lewisville Lake Park",
      why: "A large city park on the south shore of Lewisville Lake with a swimming beach, pavilions and picnic areas. Open water and trees for sunset portraits.",
      whyEs: "Un parque grande de la ciudad en la orilla sur de Lewisville Lake, con playa, pabellones y áreas de picnic. Agua abierta y árboles para fotos de atardecer.",
    },
    {
      name: "Lewisville Lake Environmental Learning Area (LLELA)",
      why: "A protected preserve of prairie, forest and wetlands on the edge of Lewisville Lake, with walking trails. Natural green and wide skies, nothing like a studio backdrop.",
      whyEs: "Una reserva protegida de pradera, bosque y humedales a la orilla de Lewisville Lake, con senderos para caminar. Verde natural y cielos amplios, nada que ver con un fondo de estudio.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Lewisville?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Lewisville day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Lewisville?",
      a: "My go-to spots are Wayne Ferguson Plaza and the rest of Old Town, the sculpture garden at the Lewisville Grand Theater, Lewisville Lake Park for open-water sunset portraits, and the LLELA preserve for natural green and trails. Check each place's current rules and hours before the day — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Lewisville families usually hold the reception?",
      a: "All over the city and its neighbors — halls near Old Town and Main Street, venues along the I-35E corridor, and places out toward Vista Ridge and the lake. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Lewisville?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Lewisville do you cover?",
      a: "All of it, with no travel fee — Lewisville plus Carrollton, Flower Mound, Highland Village, The Colony, Coppell and Denton, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Lewisville?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Lewisville cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Lewisville?",
      a: "Mis lugares favoritos son Wayne Ferguson Plaza y el resto de Old Town, el jardín de esculturas del Lewisville Grand Theater, Lewisville Lake Park para fotos de atardecer sobre el agua, y la reserva LLELA para verde natural y senderos. Revisa las reglas y horarios actuales de cada lugar antes del día — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Lewisville?",
      a: "Por toda la ciudad y sus vecinos — salones cerca de Old Town y Main Street, lugares por el corredor de la I-35E, y otros rumbo a Vista Ridge y el lago. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Lewisville?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Lewisville cubres?",
      a: "Todas, sin cargo por traslado — Lewisville más Carrollton, Flower Mound, Highland Village, The Colony, Coppell y Denton, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
