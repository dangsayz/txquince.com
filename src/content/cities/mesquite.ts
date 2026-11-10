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
const HRS_SOLO = PT.hours.solo;
const HRS_CINEMA = PT.hours.cinema;
const HRS_TRIO = PT.hours.trio;

export const location: Location = {
  slug: "mesquite",
  city: "Mesquite",
  county: "Dallas & Kaufman counties",
  tier: "volume",
  areas: [
    "Historic Downtown Mesquite",
    "Town East Mall",
    "Mesquite Rodeo",
    "Lawson",
    "Samuell Farm",
  ],
  lead: "Just east of Dallas, with a real downtown, a rodeo of its own and room for a full court.",
  intro: [
    "Mesquite sits right on Dallas's eastern edge, next to Garland, Balch Springs and Seagoville, and it has the room for a quinceañera done the full way. From a morning misa at a parish like Divine Mercy of Our Lord, to portraits in historic downtown, to a reception along the I-635 or US 80 side of town, I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Mesquite?",
      a: "Yes — Mesquite is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Mesquite families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${HOLD_DAYS} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Justo al este de Dallas, con un centro histórico de verdad, su propio rodeo y espacio para una corte completa.",
  introEs: [
    "Mesquite está en el borde este de Dallas, junto a Garland, Balch Springs y Seagoville, y tiene el espacio para hacer la quinceañera completa. Desde una misa de mañana en una parroquia como Divine Mercy of Our Lord, hasta las fotos en el centro histórico y una recepción por el lado de la I-635 o la US 80, lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Mesquite?",
      a: "Sí — Mesquite es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Mesquite?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Mesquite is a big city on the eastern edge of Dallas, mostly in Dallas County with a part reaching into Kaufman County. It borders Garland to the north and Balch Springs and Seagoville to the south, and it's known for the Mesquite Rodeo, which has run since 1946. It's a place where a quinceañera still gets the whole day: the misa, the court, the vals, the party after.",
    "What makes the day easy to photograph is the range inside one city. Historic downtown has Front Street Station, a former train station site turned into an events area with a performance pavilion. A few minutes away are two historic farmsteads, Opal Lawrence Historical Park and the Florence Ranch Homestead, and the native-plant Butterfly Trail in Paschall Park. We can build your portraits around the brick and the plaza, the barns and porches, the flowers, or all of it.",
    "I only ever hold one quinceañera per date. So whether your reception is along I-635, off US 80 on the north side, or out toward Lawson, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Mesquite es una ciudad grande en el borde este de Dallas, casi toda en el condado de Dallas con una parte que entra al condado de Kaufman. Colinda con Garland al norte y con Balch Springs y Seagoville al sur, y es conocida por el Mesquite Rodeo, que se hace desde 1946. Aquí la quinceañera todavía se vive todo el día: la misa, la corte, el vals y la fiesta después.",
    "Lo que hace fácil fotografiar el día es la variedad que hay dentro de la misma ciudad. El centro histórico tiene Front Street Station, un antiguo sitio de la estación del tren convertido en área de eventos con un pabellón para presentaciones. A pocos minutos hay dos ranchos históricos, Opal Lawrence Historical Park y Florence Ranch Homestead, y el Butterfly Trail con plantas nativas en Paschall Park. Podemos armar tus fotos alrededor del ladrillo y la plaza, los graneros y los porches, las flores, o todo junto.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté por la I-635, por la US 80 al norte, o hacia Lawson, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Historic Downtown Mesquite and Front Street Station",
      why: "Mesquite's historic downtown centers on Front Street Station, a former train station site with an events area, a performance pavilion and a plaza walkway. A real downtown backdrop, with murals nearby, right in the city.",
      whyEs: "El centro histórico de Mesquite gira alrededor de Front Street Station, un antiguo sitio de la estación del tren con área de eventos, un pabellón para presentaciones y un andador de plaza. Un fondo urbano de verdad, con murales cerca, dentro de la misma ciudad.",
    },
    {
      name: "Opal Lawrence Historical Park",
      why: "A historic farmstead with the Lawrence family home, an 1886 barn, a restored 1840s log cabin and a nature trail. It's run by Historic Mesquite, Inc., so we check access with them before we plan a session.",
      whyEs: "Una granja histórica con la casa de la familia Lawrence, un granero de 1886, una cabaña de troncos restaurada de los años 1840 y un sendero natural. Lo administra Historic Mesquite, Inc., así que confirmamos el acceso con ellos antes de planear la sesión.",
    },
    {
      name: "Florence Ranch Homestead",
      why: "A historic ranch homestead with shaded porches and open space. Like Opal Lawrence, it's run by Historic Mesquite, Inc., so we confirm access first.",
      whyEs: "Un rancho histórico con porches con sombra y espacio abierto. Igual que Opal Lawrence, lo administra Historic Mesquite, Inc., así que confirmamos el acceso primero.",
    },
    {
      name: "Butterfly Trail at Paschall Park",
      why: "A pollinator garden and trail with native Blackland Prairie plants, butterfly-themed benches, a mural and a sculpture. Color and greenery that suit a ball gown.",
      whyEs: "Un jardín de polinizadores y un sendero con plantas nativas de la pradera Blackland, bancas con tema de mariposas, un mural y una escultura. Color y verde que le quedan muy bien a un vestido de gala.",
    },
    {
      name: "City Lake Park",
      why: "A city park with a lake at its center, green space around it and picnic areas. Easy water-and-trees portraits without leaving town.",
      whyEs: "Un parque de la ciudad con un lago en el centro, áreas verdes alrededor y zonas para días de campo. Fotos fáciles con agua y árboles sin salir de la ciudad.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Mesquite?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Mesquite day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Mesquite?",
      a: "My go-to spots are Historic Downtown Mesquite and Front Street Station, the Butterfly Trail at Paschall Park for flowers and native plants, City Lake Park for water and trees, and the two historic farmsteads, Opal Lawrence Historical Park and the Florence Ranch Homestead, for barns and porches. The parks are public; the farmsteads run on Historic Mesquite, Inc.'s schedule, so we confirm access first. We can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Mesquite families usually hold the reception?",
      a: "All over the city — along the I-635 corridor that runs through Mesquite, on the north side near US 80 and I-30, and toward Lawson on the south side near I-20. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Mesquite?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Mesquite do you cover?",
      a: "All of it, with no travel fee — Mesquite plus Garland, Sunnyvale, Balch Springs, Seagoville and Dallas, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Mesquite?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Mesquite cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Mesquite?",
      a: "Mis lugares favoritos son el centro histórico de Mesquite y Front Street Station, el Butterfly Trail en Paschall Park para flores y plantas nativas, City Lake Park para agua y árboles, y los dos ranchos históricos, Opal Lawrence Historical Park y Florence Ranch Homestead, para graneros y porches. Los parques son públicos; los ranchos siguen el horario de Historic Mesquite, Inc., así que confirmamos el acceso primero. Los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Mesquite?",
      a: "Por toda la ciudad — por el corredor de la I-635 que cruza Mesquite, al norte cerca de la US 80 y la I-30, y hacia Lawson en el sur, cerca de la I-20. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Mesquite?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Mesquite cubres?",
      a: "Todas, sin cargo por traslado — Mesquite más Garland, Sunnyvale, Balch Springs, Seagoville y Dallas, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
