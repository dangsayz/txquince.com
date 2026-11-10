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
  slug: "balch-springs",
  city: "Balch Springs",
  county: "Dallas County",
  tier: "volume",
  areas: [
    "Elam Road",
    "Hickory Tree Road",
    "Shepherd Lane",
    "the Interstate 635 corridor",
    "Five Points",
  ],
  lead: "A close-knit Dallas County city right next to Mesquite and southeast Dallas.",
  intro: [
    "Balch Springs sits in Dallas County about sixteen miles east of downtown Dallas, with Mesquite to the north and east and Dallas to the south and west. From the churches around Elam Road to receptions near Hickory Tree Road and the Interstate 635 corridor, I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Balch Springs?",
      a: "Yes — Balch Springs is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Balch Springs families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${PT.holdDays} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Una ciudad unida del condado de Dallas, pegada a Mesquite y al sureste de Dallas.",
  introEs: [
    "Balch Springs está en el condado de Dallas, a unas dieciséis millas al este del centro de Dallas, con Mesquite al norte y al este y Dallas al sur y al oeste. Desde las iglesias por Elam Road hasta las recepciones cerca de Hickory Tree Road y el corredor de la Interstate 635, lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Balch Springs?",
      a: "Sí — Balch Springs es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Balch Springs?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${PT.holdDays} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Balch Springs is a compact city in Dallas County, about sixteen miles east of downtown Dallas. Mesquite wraps around it to the north and east and Dallas to the south and west, and Interstate 635 runs straight through the middle, so a family here is never far from a church, a salón or a park in any of the three cities. The name comes from the springs that were here long before the city, and families still treat a fifteenth birthday as the full day it is meant to be.",
    "What makes the day easy to photograph is how much green you can reach from here. Inside the city there are neighborhood parks with ponds, a gazebo and shaded walking trails, and a few minutes into Mesquite you find a butterfly garden trail and a lakeside park. We can build your portraits around the water, the gardens, or both.",
    "I only ever hold one quinceañera per date. So whether your reception is in a hall near Hickory Tree Road, along the Interstate 635 corridor, or just over the line in Mesquite, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Balch Springs es una ciudad compacta del condado de Dallas, a unas dieciséis millas al este del centro de Dallas. Mesquite la rodea por el norte y el este y Dallas por el sur y el oeste, y la Interstate 635 la cruza justo por en medio, así que aquí tu familia nunca queda lejos de una iglesia, un salón o un parque en cualquiera de las tres ciudades. El nombre viene de los manantiales que había aquí mucho antes de la ciudad, y las familias siguen tomando los quince años como el día completo que debe ser.",
    "Lo que hace fácil fotografiar el día es cuánto verde hay cerca. Dentro de la ciudad hay parques de barrio con estanques, un gazebo y senderos con sombra, y a unos minutos, en Mesquite, hay un sendero con jardín de mariposas y un parque junto a un lago. Podemos armar tus fotos alrededor del agua, de los jardines, o de los dos.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté en un salón cerca de Hickory Tree Road, por el corredor de la Interstate 635, o apenas cruzando la línea en Mesquite, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Walter E. Luedeke Park",
      why: "A city park off Hickory Tree Road with walking trails, a storybook walk, pavilions and a pond in the back. Easy to reach, with water and greenery in one stop.",
      whyEs: "Un parque de la ciudad sobre Hickory Tree Road con senderos para caminar, un recorrido de cuentos, pabellones y un estanque en la parte de atrás. Fácil de llegar, con agua y vegetación en una sola parada.",
    },
    {
      name: "Veterans Memorial Park",
      why: "On Elam Road next to the city's veterans memorial, with a gazebo and a pond with ducks. A quiet, classic setting for gown portraits.",
      whyEs: "Sobre Elam Road, junto al monumento a los veteranos de la ciudad, con un gazebo y un estanque con patos. Un lugar tranquilo y clásico para las fotos del vestido.",
    },
    {
      name: "Woodland Park",
      why: "A large park with lighted walking trails, a pavilion and a playground. Plenty of room to walk the court through for group shots.",
      whyEs: "Un parque grande con senderos iluminados, un pabellón y un área de juegos. Hay mucho espacio para caminar con toda la corte y tomar fotos de grupo.",
    },
    {
      name: "Butterfly Trail at Paschall Park (Mesquite)",
      why: "Just over the line in Mesquite, a nature walk lined with native Texas Blackland Prairie plants, butterfly benches, a mural and a pollinator garden. Color and texture that photograph well against a ball gown.",
      whyEs: "Apenas cruzando la línea en Mesquite, un sendero rodeado de plantas nativas de la pradera Blackland de Texas, con bancas de mariposa, un mural y un jardín de polinizadores. Color y textura que lucen muy bien junto a un vestido de quince.",
    },
    {
      name: "City Lake Park (Mesquite)",
      why: "A lakeside park in neighboring Mesquite with a half-mile trail around the water. A good pick for open-water portraits close to home.",
      whyEs: "Un parque junto a un lago en Mesquite, la ciudad vecina, con un sendero de media milla alrededor del agua. Buena opción para fotos con el agua de fondo cerca de casa.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Balch Springs?",
      a: `Packages run from ${PT.price.study} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Balch Springs day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Balch Springs?",
      a: "My go-to spots are Walter E. Luedeke Park and Veterans Memorial Park for ponds and greenery, and Woodland Park for walking trails with room for the whole court. A few minutes away in Mesquite, the Butterfly Trail at Paschall Park and City Lake Park add a garden and a lake. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Balch Springs families usually hold the reception?",
      a: "All over the area — halls in town along roads like Elam Road, Hickory Tree Road and Shepherd Lane, venues along the Interstate 635 corridor, and halls just over the line in Mesquite and Dallas. VM Ballroom in Balch Springs is one reception hall that has its own page on this site. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Balch Springs?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Balch Springs do you cover?",
      a: "All of it, with no travel fee — Balch Springs plus neighboring Mesquite and Dallas, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Balch Springs?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Balch Springs cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Balch Springs?",
      a: "Mis lugares favoritos son Walter E. Luedeke Park y Veterans Memorial Park para estanques y áreas verdes, y Woodland Park para senderos con espacio para toda la corte. A unos minutos, en Mesquite, el Butterfly Trail en Paschall Park y City Lake Park suman un jardín y un lago. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Balch Springs?",
      a: "Por toda la zona — salones en la ciudad por calles como Elam Road, Hickory Tree Road y Shepherd Lane, lugares por el corredor de la Interstate 635, y salones apenas cruzando la línea en Mesquite y Dallas. VM Ballroom, en Balch Springs, es un salón de recepciones que tiene su propia página en este sitio. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Balch Springs?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Balch Springs cubres?",
      a: "Todas, sin cargo por traslado — Balch Springs más las ciudades vecinas de Mesquite y Dallas, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
