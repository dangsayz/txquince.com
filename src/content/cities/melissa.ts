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

// Referenced so unused-constant lint stays quiet if a model sentence changes.
void HRS_STUDY;

export const location: Location = {
  slug: "melissa",
  city: "Melissa",
  county: "Collin County",
  tier: "volume",
  areas: [
    "Melissa Lake Park",
    "City Hall Plaza Park",
    "Highway 5 corridor",
    "FM 545",
    "US 75 corridor",
  ],
  lead: "A Collin County city along US 75, where a fifteenth is still the full day.",
  intro: [
    "Melissa sits in north-central Collin County, a short drive from McKinney and Anna. Families here plan a quinceañera the full way, from the misa to the last dance. From the parks and trails in town to receptions along US 75, Highway 5 and FM 545, I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Melissa?",
      a: "Yes — Melissa is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Melissa families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${HOLD_DAYS} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Una ciudad del condado de Collin sobre la US 75, donde los quince todavía se celebran todo el día.",
  introEs: [
    "Melissa está en el centro-norte del condado de Collin, a unos minutos de McKinney y Anna. Aquí las familias hacen la quinceañera completa, de la misa al último baile. Desde los parques y senderos del pueblo hasta las recepciones por la US 75, la Highway 5 y la FM 545, lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Melissa?",
      a: "Sí — Melissa es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Melissa?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Melissa sits in north-central Collin County, a short drive from McKinney and Anna, with US 75 along its western side and Highway 5 running through the middle of town. It is a city of parks, trails and a lake, and families here plan a quinceañera the full way: the misa, the court, the vals and the last dance.",
    "What makes the day easy to photograph is that you have room to choose. Melissa Lake Park has a lake, a walking trail and pavilions, City Hall Plaza Park has gardens and a walking loop, and the historic square in nearby McKinney is a short drive away. We can build your portraits around the water, the gardens, the square, or all three.",
    "I only ever hold one quinceañera per date. So whether your reception is in Melissa, McKinney or Anna, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Melissa está en el centro-norte del condado de Collin, a unos minutos de McKinney y Anna, con la US 75 por el lado oeste y la Highway 5 cruzando por el centro del pueblo. Es una ciudad de parques, senderos y un lago, y las familias de aquí hacen la quinceañera completa: la misa, la corte, el vals y el último baile.",
    "Lo que hace fácil fotografiar el día es que tienes de dónde escoger. Melissa Lake Park tiene un lago, un sendero y pabellones, City Hall Plaza Park tiene jardines y un circuito para caminar, y la plaza histórica de McKinney, aquí cerca, queda a unos minutos. Podemos armar tus fotos alrededor del agua, de los jardines, de la plaza, o de los tres.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté en Melissa, McKinney o Anna, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Melissa Lake Park",
      why: "A 10-acre stocked lake with concrete walking trails, two pavilions, an amphitheater and open green space. Water and wide sky for portraits with room for the whole court.",
      whyEs: "Un lago de 10 acres con senderos de concreto, dos pabellones, un anfiteatro y espacio verde abierto. Agua y cielo amplio para fotos con lugar para toda la corte.",
    },
    {
      name: "City Hall Plaza Park",
      why: "Pollinator-friendly gardens, open green space, a pavilion and a walking loop right behind Melissa City Hall. A quiet, tidy setting that stays close to town.",
      whyEs: "Jardines para polinizadores, espacio verde abierto, un pabellón y un circuito para caminar justo detrás del City Hall de Melissa. Un lugar tranquilo y cuidado, cerca del centro.",
    },
    {
      name: "Melissa Hike & Bike Trail (Melissa Road)",
      why: "A trail along Melissa Road from US 75 to Fannin Road with lampposts, covered seating with wrought-iron benches and a pavilion. Good for a simple walking set and evening light.",
      whyEs: "Un sendero a lo largo de Melissa Road, de la US 75 a Fannin Road, con faroles, áreas techadas con bancas de hierro forjado y un pabellón. Bueno para unas fotos caminando y para la luz de la tarde.",
    },
    {
      name: "Historic Downtown McKinney (nearby)",
      why: "The square in neighboring McKinney is centered on the former Collin County Courthouse and surrounded by shops, with restaurants nearby. A real downtown backdrop a short drive from Melissa.",
      whyEs: "La plaza de McKinney, el vecino de Melissa, gira alrededor del antiguo palacio de justicia del condado de Collin y está rodeada de tiendas y restaurantes. Un fondo de centro histórico de verdad, a unos minutos de Melissa.",
    },
    {
      name: "Slayter Creek Park (Anna, nearby)",
      why: "A city park in neighboring Anna at 425 W Rosamond Pkwy with a large pavilion and a walking trail. A simple, open spot close to Melissa.",
      whyEs: "Un parque de la ciudad de Anna, vecina de Melissa, en 425 W Rosamond Pkwy, con un pabellón grande y un sendero para caminar. Un lugar sencillo y abierto, cerca de Melissa.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Melissa?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Melissa day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Melissa?",
      a: "My go-to spots are Melissa Lake Park for the lake and walking trails, City Hall Plaza Park for gardens and green space, the Hike & Bike Trail along Melissa Road, and the historic square in nearby McKinney. Slayter Creek Park in Anna is another option close by. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Melissa families usually hold the reception?",
      a: "All over the area — along the US 75 corridor, in town off Highway 5 and FM 545, and just over in McKinney and Anna. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Melissa?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Melissa do you cover?",
      a: "All of it, with no travel fee — Melissa plus McKinney, Anna, Allen, Plano, Frisco, Princeton and Van Alstyne, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Melissa?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Melissa cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Melissa?",
      a: "Mis lugares favoritos son Melissa Lake Park para el lago y los senderos, City Hall Plaza Park para los jardines y el espacio verde, el Hike & Bike Trail sobre Melissa Road y la plaza histórica de McKinney, aquí cerca. Slayter Creek Park, en Anna, es otra opción cercana. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Melissa?",
      a: "Por toda la zona — sobre el corredor de la US 75, en el pueblo por la Highway 5 y la FM 545, y también en McKinney y Anna. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Melissa?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Melissa cubres?",
      a: "Todas, sin cargo por traslado — Melissa más McKinney, Anna, Allen, Plano, Frisco, Princeton y Van Alstyne, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
