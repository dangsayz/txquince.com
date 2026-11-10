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
  slug: "duncanville",
  city: "Duncanville",
  county: "Dallas County",
  tier: "volume",
  areas: [
    "Armstrong Park and City Hall",
    "Main Street",
    "Wheatland Road",
    "Fairmeadows",
    "US 67 corridor",
  ],
  lead: "A close-knit Best Southwest city with room for a full day of celebration.",
  intro: [
    "Duncanville sits in southwestern Dallas County, with Dallas on three sides and Cedar Hill to the south, and families here plan a quinceañera the full way. From a morning misa at a parish like Holy Spirit Catholic Church to portraits at Armstrong Park beside City Hall and a reception along the Wheatland Road or US 67 side of town, I document all of it.",
    "We keep the quality where it should be by editing every gallery and film ourselves, as the owners. Your misa, your portraits, your entrada and vals and the celebration after — a TX Quince team, fully present, the entire day.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Duncanville?",
      a: "Yes — Duncanville is part of my core DFW service area with no travel fee. Church, portraits, and reception, wherever in the city your celebration happens.",
    },
    {
      q: "How early should Duncanville families book?",
      a: `As early as you can — I take a limited number of quinceañeras each season and the best Saturdays go first, often a year out. Pick a package and sign the agreement online, and I'll hold your date for ${HOLD_DAYS} days while we review it; once it's approved, a ${RETAINER_PCT} deposit locks it in. Want to talk first? Ask for a quick call.`,
    },
  ],
  leadEs: "Una ciudad unida del suroeste de Dallas, con lugar para un día completo de celebración.",
  introEs: [
    "Duncanville está en el suroeste del condado de Dallas, con Dallas por tres lados y Cedar Hill al sur, y las familias de aquí planean la quinceañera completa. Desde una misa en la mañana en una parroquia como Holy Spirit Catholic Church, hasta las fotos en Armstrong Park junto al City Hall y una recepción por el lado de Wheatland Road o de la US 67, lo documento todo.",
    "Mantenemos la calidad donde debe estar porque nosotros, los dueños, editamos cada galería y cada video. Tu misa, tus fotos, tu entrada y vals y la celebración después: un equipo de TX Quince, presente por completo, todo el día.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Duncanville?",
      a: "Sí — Duncanville es parte de mi área principal de DFW, sin cargo por traslado. Iglesia, fotos y recepción, donde sea que se celebre en la ciudad.",
    },
    {
      q: "¿Con cuánta anticipación deben reservar las familias de Duncanville?",
      a: `Lo antes posible — tomo un número limitado de quinceañeras por temporada y los mejores sábados se van primero, muchas veces con un año de anticipación. Elige un paquete y firma el contrato en línea, y te aparto la fecha ${HOLD_DAYS} días mientras lo revisamos; ya aprobado, un depósito del ${RETAINER_PCT} la asegura. ¿Quieres platicar primero? Pide una llamada rápida.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Duncanville is a city in southwestern Dallas County, part of the Best Southwest area along with Cedar Hill, DeSoto and Lancaster. Dallas wraps it on the north, east and west, US 67 runs through the east side and Interstate 20 crosses the north. For a quinceañera, that means church, portraits and reception can all sit close together, with no long drives between them.",
    "What makes the day easy to photograph is that Duncanville keeps its best backdrops in a few minutes of each other. Armstrong Park sits right beside City Hall and has gardens, a gazebo and an amphitheater, and the park's historic windmill is a few steps away. Lakeside Park and Waterview Park bring in open water and green space. We can build your portraits around any of them, or around the church and the park together.",
    "I only ever hold one quinceañera per date. So whether your reception is along Wheatland Road, off US 67, or just across the line in a neighboring city, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both.",
  ],
  introEs: [
    "Duncanville es una ciudad del suroeste del condado de Dallas, parte del área Best Southwest junto con Cedar Hill, DeSoto y Lancaster. Dallas la rodea por el norte, el este y el oeste, la US 67 cruza por el lado este y la Interstate 20 pasa por el norte. Para una quinceañera, eso quiere decir que la iglesia, las fotos y la recepción pueden quedar cerca unas de otras, sin manejadas largas de por medio.",
    "Lo que hace fácil fotografiar el día es que Duncanville tiene sus mejores fondos a pocos minutos unos de otros. Armstrong Park está junto al City Hall y tiene jardines, un gazebo y un anfiteatro, y el molino histórico del parque queda a unos pasos. Lakeside Park y Waterview Park suman agua y áreas verdes. Podemos armar tus fotos alrededor de cualquiera de ellos, o entre la iglesia y el parque.",
    "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté por Wheatland Road, cerca de la US 67, o apenas cruzando a una ciudad vecina, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos.",
  ],
  photoSpots: [
    {
      name: "Armstrong Park",
      why: "Duncanville's main community park, right next to City Hall, with garden areas, a gazebo and pavilion, and a lighted walking trail. Pretty, shaded and close to everything in town.",
      whyEs: "El parque comunitario principal de Duncanville, justo junto al City Hall, con áreas de jardín, un gazebo y un pabellón, y un sendero iluminado para caminar. Bonito, con sombra y cerca de todo en la ciudad.",
    },
    {
      name: "Poe-Hobden Amphitheater (Armstrong Park)",
      why: "A covered amphitheater inside Armstrong Park that was dedicated in 1989. Its canopy and stage give a ready-made frame for a formal portrait of the quinceañera with her court.",
      whyEs: "Un anfiteatro techado dentro de Armstrong Park, dedicado en 1989. Su techo y su escenario son un marco ya hecho para un retrato formal de la quinceañera con su corte.",
    },
    {
      name: "Duncanville Historical Park windmill (Armstrong Park)",
      why: "The park's historic sites include a restored windmill and a historic music room. A rustic, old-Texas backdrop for a portrait in a ball gown.",
      whyEs: "Los sitios históricos del parque incluyen un molino restaurado y un salón de música histórico. Un fondo rústico del Texas de antes para un retrato con vestido de gala.",
    },
    {
      name: "Lakeside Park",
      why: "A large park on Hill City Drive with open green space, two pavilions, a walking trail and a fishing lake. Good for relaxed portraits with water in the background.",
      whyEs: "Un parque grande sobre Hill City Drive con mucho espacio verde, dos pabellones, un sendero para caminar y un lago de pesca. Bueno para fotos relajadas con agua de fondo.",
    },
    {
      name: "Waterview Park",
      why: "A quiet park on Whitecliff Drive with a fishing pond. A calmer, more private spot for a portrait by the water.",
      whyEs: "Un parque tranquilo sobre Whitecliff Drive con un estanque de pesca. Un lugar más calmado y privado para una foto junto al agua.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Duncanville?",
      a: `Packages run from ${STUDY} for the photo-only {{name.study}} to ${TRIO} for {{name.trio}}, the one I recommend for most celebrations, with {{team.trio}} for ${HRS_TRIO} hours. In between are {{name.solo}} at ${SOLO}, ${HRS_SOLO} hours with one shooter taking photos and video at once from a {{cameras.solo}} camera setup, and {{name.cinema}} at ${CINEMA} — ${HRS_CINEMA} hours with {{team.cinema}}. There's no travel fee anywhere in DFW, so your Duncanville day is priced exactly like one in Dallas — see our Packages & Prices page for what's in each.`,
    },
    {
      q: "Where are the best places to take quince pictures in Duncanville?",
      a: "My go-to spots are Armstrong Park beside City Hall, with its gardens, gazebo, amphitheater and historic windmill, Lakeside Park for open green space and water, and Waterview Park for a quieter pond setting. All are public — we can use them for a portrait session before the celebration or work them into the day's timeline.",
    },
    {
      q: "Where do Duncanville families usually hold the reception?",
      a: "Around the city and just beyond it — along the Wheatland Road and Main Street side of town, off the US 67 and Interstate 20 corridors, and in neighboring Dallas, Cedar Hill and DeSoto. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them.",
    },
    {
      q: "Do you offer photo and video in Duncanville?",
      a: `Yes. {{name.cinema}} (${CINEMA}) pairs {{team.cinema}} for the full-length 4K film of her whole day, a {{highlight.cinema}} highlight and {{photos.cinema}} edited photos; {{name.trio}} (${TRIO}) adds a second photographer, a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. {{sessionIn}} include a dress or save-the-date session ({{session.photos}} edited photos) after the deposit, and a Day-of Coordinator who runs the day can be added for ${COORDINATOR} a day. For a smaller budget, {{name.solo}} (${SOLO}) gets you photos and the full-length film from one shooter with a {{cameras.solo}} camera setup, with {{photos.solo}} edited photos. If you only want portraits, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "What areas around Duncanville do you cover?",
      a: "All of it, with no travel fee — Duncanville plus Cedar Hill, DeSoto, Lancaster, Dallas, Grand Prairie and Mansfield, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date on our booking form.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Duncanville?",
      a: `Los paquetes van de ${STUDY} con la {{nameEs.study}}, solo de foto, a ${TRIO} con {{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones, con {{teamEs.trio}} durante ${HRS_TRIO} horas. En medio están {{nameEs.solo}}, en ${SOLO}: ${HRS_SOLO} horas con una sola persona que toma fotos y graba a la vez con {{cameras.solo}} cámaras; y {{nameEs.cinema}}, en ${CINEMA}: ${HRS_CINEMA} horas con {{teamEs.cinema}}. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Duncanville cuesta igual que uno en Dallas — mira nuestra página de Paquetes y precios para ver qué trae cada uno.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Duncanville?",
      a: "Mis lugares favoritos son Armstrong Park junto al City Hall, con sus jardines, gazebo, anfiteatro y molino histórico, Lakeside Park para espacio verde y agua, y Waterview Park para un ambiente más tranquilo junto al estanque. Todos son públicos — los podemos usar para una sesión de retrato antes de la celebración o acomodarlos en el día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Duncanville?",
      a: "Por toda la ciudad y un poco más allá — por el lado de Wheatland Road y Main Street, por los corredores de la US 67 y la Interstate 20, y en las ciudades vecinas de Dallas, Cedar Hill y DeSoto. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos.",
    },
    {
      q: "¿Ofreces foto y video en Duncanville?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) lleva {{teamEs.cinema}} para el video completo en 4K de todo su día, un resumen de {{highlightEs.cinema}} y {{photos.cinema}} fotos editadas; {{nameEs.trio}} (${TRIO}) suma un segundo fotógrafo, un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. {{sessionInEs}} incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos editadas) después del depósito, y puedes sumar una Coordinadora del día que lleve el día por ${COORDINATOR} por día. Con un presupuesto más chico, {{nameEs.solo}} (${SOLO}) te da fotos y el video completo con una sola persona y {{cameras.solo}} cámaras, con {{photos.solo}} fotos editadas. Si solo quieres retratos, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas alrededor de Duncanville cubres?",
      a: "Todas, sin cargo por traslado — Duncanville más Cedar Hill, DeSoto, Lancaster, Dallas, Grand Prairie y Mansfield, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en nuestro formulario de reservación.",
    },
  ],
};
