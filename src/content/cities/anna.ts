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
  slug: "anna",
  city: "Anna",
  county: "Collin County",
  tier: "volume",
  areas: [
    "Downtown Anna (Fourth Street)",
    "Sherley Heritage Park",
    "Natural Springs Park",
    "Slayter Creek Park",
    "Powell Parkway corridor",
  ],
  lead: "A historic railroad town in northern Collin County, a short drive up US 75.",
  intro: [
    "Anna sits along US 75 in northern Collin County, with Melissa, Van Alstyne and McKinney close by. Families here can go from the misa to portraits at the town's old railroad depot to a reception in Anna or a short drive down the highway, and I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Anna?",
      a: "Yes — Anna is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Anna families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${PT.holdDays} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Un pueblo histórico del ferrocarril en el norte del condado de Collin, a un paso por la US 75.",
  introEs: [
    "Anna está sobre la US 75, en el norte del condado de Collin, con Melissa, Van Alstyne y McKinney muy cerca. Aquí las familias pueden ir de la misa a las fotos en la vieja estación de tren del pueblo y luego a una recepción en Anna o a un corto trayecto por la autopista, y lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Anna?",
      a: "Sí — Anna es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Anna?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${PT.holdDays} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Anna is a small Collin County town with real railroad history. The Houston and Texas Central line reached the area in the 1870s, the town was platted in 1883, and the depot the railroad built in 1885 still stands as the oldest surviving railroad station in Texas. It sits today in Sherley Heritage Park, a few steps from the old downtown blocks along Fourth Street.",
    "That gives an Anna quinceañera a backdrop most suburbs can't offer. We can build your portraits around the depot and the train-themed park, or the pond, gazebo and walking paths at Natural Springs Park. And because Anna sits on US 75 with Melissa and McKinney a short drive south, the lakes and the historic square there are easy to add if you want a different look.",
    "I only ever hold one quinceañera per date. So whether your reception is in Anna, along the Powell Parkway corridor, or in a hall a short drive down US 75, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Anna es un pueblo chico del condado de Collin con historia de verdad del ferrocarril. La línea de Houston and Texas Central llegó a la zona en la década de 1870, el pueblo se trazó en 1883, y la estación que construyó el ferrocarril en 1885 sigue en pie como la estación de tren más antigua que se conserva en Texas. Hoy está en Sherley Heritage Park, a unos pasos de las cuadras del centro viejo sobre la Fourth Street.",
    "Eso le da a una quinceañera en Anna un fondo que la mayoría de los suburbios no tiene. Podemos armar tus fotos alrededor de la estación y el parque con tema de trenes, o del estanque, el kiosko y los senderos de Natural Springs Park. Y como Anna está sobre la US 75, con Melissa y McKinney a poco trayecto hacia el sur, los lagos y la plaza histórica de allá se pueden sumar fácil si quieres otro ambiente.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté en Anna, por el corredor de Powell Parkway, o en un salón a poco trayecto por la US 75, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Sherley Heritage Park (Anna)",
      why: "Anna's most historic park, with the restored 1885 train depot, a community-built train-themed playground and a Mogul locomotive. Brick, rails and old wood make a one-of-a-kind backdrop for a ball gown.",
      whyEs: "El parque más histórico de Anna, con la estación de tren restaurada de 1885, un área de juegos con tema de trenes hecha por la comunidad y una locomotora Mogul. Ladrillo, rieles y madera vieja le dan un fondo único al vestido.",
    },
    {
      name: "Natural Springs Park (Anna)",
      why: "A pond with a fishing pier, a gazebo, walking trails and a large open lawn, plus a prairie garden with a walking path and benches. Water, greenery and a gazebo in one stop.",
      whyEs: "Un estanque con muelle de pesca, un kiosko, senderos para caminar y un área verde grande, además de un jardín de pradera con sendero y bancas. Agua, vegetación y kiosko en un solo lugar.",
    },
    {
      name: "Downtown Anna along Fourth Street",
      why: "The historic part of Anna's downtown runs along Fourth Street, close to the depot at Sherley Heritage Park. Older storefront blocks make a simple town-square backdrop without leaving the city.",
      whyEs: "La parte histórica del centro de Anna corre sobre la Fourth Street, cerca de la estación en Sherley Heritage Park. Las cuadras con fachadas antiguas dan un fondo sencillo de pueblo sin salir de la ciudad.",
    },
    {
      name: "Melissa Lake Park (Melissa)",
      why: "A short drive south in neighboring Melissa, this park has a 10-acre lake, concrete walking trails, an amphitheater and open green space. Lake views and wide paths for a full court.",
      whyEs: "A poco trayecto hacia el sur, en la vecina Melissa, este parque tiene un lago de 10 acres, senderos de concreto, un anfiteatro y áreas verdes abiertas. Vista al lago y caminos amplios para toda la corte.",
    },
    {
      name: "Towne Lake Recreation Area (McKinney)",
      why: "In McKinney, a lake with a fishing pier and a paved path around the water. Open lakeside light for sunset portraits.",
      whyEs: "En McKinney, un lago con muelle de pesca y un sendero pavimentado alrededor del agua. Luz abierta junto al lago para fotos de atardecer.",
    },
    {
      name: "Historic Downtown McKinney (McKinney)",
      why: "A courthouse square laid out in 1848, in one of the largest historic districts in Texas, with shops, murals and public art around it. A true historic-square look when you want something bigger than a small-town downtown.",
      whyEs: "Una plaza del palacio de justicia trazada en 1848, dentro de uno de los distritos históricos más grandes de Texas, con tiendas, murales y arte público alrededor. Un look de plaza histórica de verdad cuando quieres algo más grande que un centro de pueblo.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Anna?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Anna day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Anna?",
      a: "My go-to spots are Sherley Heritage Park with the restored 1885 train depot, Natural Springs Park for the pond, gazebo and walking paths, and the historic blocks of downtown along Fourth Street. If you want a lake, Melissa Lake Park in Melissa and Towne Lake Recreation Area in McKinney are a short drive away, and the square in Historic Downtown McKinney is another option. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Anna families usually hold the reception?",
      a: "In Anna itself and along the Powell Parkway corridor, and in venues a short drive down US 75 toward Melissa and McKinney. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Anna?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Anna do you cover?",
      a: "All of it, with no travel fee — Anna plus Melissa, Van Alstyne, McKinney and the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Anna?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Anna cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Anna?",
      a: "Mis lugares favoritos son Sherley Heritage Park con la estación de tren restaurada de 1885, Natural Springs Park para el estanque, el kiosko y los senderos, y las cuadras históricas del centro sobre la Fourth Street. Si quieres un lago, Melissa Lake Park en Melissa y Towne Lake Recreation Area en McKinney quedan a poco trayecto, y la plaza del Historic Downtown McKinney es otra opción. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Anna?",
      a: "En la misma Anna y por el corredor de Powell Parkway, y en salones a poco trayecto por la US 75 rumbo a Melissa y McKinney. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Anna?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Anna cubres?",
      a: "Todas, sin cargo por traslado — Anna más Melissa, Van Alstyne, McKinney y el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
