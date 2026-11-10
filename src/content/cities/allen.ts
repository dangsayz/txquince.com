import { PT } from "@/lib/price-text";
import type { Location } from "@/content/locations";
import type { CityContent } from "@/content/city-content";

const STUDY = PT.price.study;
const SOLO = PT.price.solo;
const CINEMA = PT.price.cinema;
const TRIO = PT.price.trio;
const SECONDDAY = PT.addon.secondday;
const RETAINER_PCT = PT.deposit.percent;
const BALANCE_DAYS = PT.balanceDays;
const HRS_TRIO = PT.hours.trio;

export const location: Location = {
  slug: "allen",
  city: "Allen",
  county: "Collin County",
  tier: "premium",
  areas: [
    "Allen Heritage Village",
    "Downtown Allen (Main Street & the train depot)",
    "The Village at Watters Creek",
    "Bethany Lakes",
    "Allen Station",
  ],
  lead: "Where DFW families go all-out on the celebration.",
  intro: [
    `Many families planning a quinceañera in Allen want the full day — the complete celebration, the larger court, the video and the photo album to match. It's exactly the celebration {{name.trio}} is built for: {{team.trio}}, the full-length film of her whole day and a printed photo album that do a milestone like this justice.`,
    "A TX Quince team gives your celebration everything — la misa, portraits around Allen Heritage Village or the Village at Watters Creek, el vals, and a reception captured start to finish, nothing rushed. Then we, the owners, edit every gallery and film.",
  ],
  faqs: [
    {
      q: "Do you photograph quinceañeras in Allen?",
      a: "Yes — Allen is part of my Dallas–Fort Worth service area with no travel fee. It's a natural fit for {{name.trio}}, which covers the day with photos, video and a printed photo album included.",
    },
    {
      q: "Which package do you recommend for an Allen quinceañera?",
      a: `For most celebrations, {{name.trio}} (${PT.price.trio}) — ${PT.hours.trio} hours with {{team.trio}}, a dress or save-the-date session after the deposit, the full-length film of her whole day with a {{highlight.trio}} highlight film, {{photos.trio}} edited photos and a 40-page printed photo album. Families who want someone to run the day can add the Day-of Coordinator (${PT.addon.coordinator} a day). For a separate day of portraits in her dress, add the Second Portrait Day (${PT.addon.secondday}). Compare all three on our Packages & Prices page.`,
    },
  ],
  leadEs: "Donde las familias de DFW se lucen con la celebración.",
  introEs: [
    `Muchas familias que planean una quinceañera en Allen quieren el día completo: la celebración entera, la corte más grande, el video y el álbum a la altura. Es justo la celebración para la que está hecho {{nameEs.trio}}: {{teamEs.trio}}, el video completo de todo su día y un álbum de fotos impreso que le hacen justicia a un momento así.`,
    "Un equipo de TX Quince le da todo a tu celebración: la misa, fotos por el Allen Heritage Village o el Village at Watters Creek, el vals y una recepción capturada de principio a fin, sin prisas. Después, nosotros, los dueños, editamos cada galería y cada video.",
  ],
  faqsEs: [
    {
      q: "¿Fotografías quinceañeras en Allen?",
      a: "Sí — Allen es parte de mi área de Dallas–Fort Worth, sin cargo por traslado. Encaja perfecto con {{nameEs.trio}}, que cubre el día con fotos, video y un álbum de fotos impreso incluidos.",
    },
    {
      q: "¿Qué paquete recomiendas para una quinceañera en Allen?",
      a: `Para la mayoría de las celebraciones, {{nameEs.trio}} (${PT.price.trio}): ${PT.hours.trio} horas con {{teamEs.trio}}, una sesión con el vestido o de save the date después del depósito, el video completo de todo su día con un resumen de {{highlightEs.trio}}, {{photos.trio}} fotos editadas y un álbum de fotos impreso de 40 páginas. Si quieren a alguien que lleve el día, pueden sumar la Coordinadora del día (${PT.addon.coordinator} por día). Para un día aparte de retratos con su vestido, suma el Segundo día de retratos (${PT.addon.secondday}). Compara los tres en nuestra página de Paquetes y precios.`,
    },
  ],
};

export const content: CityContent = {
  intro: [
    "Allen sits in southwestern Collin County, along US-75 between Plano to the south and McKinney to the north, with Frisco, Fairview, Lucas and Parker around its other edges. It began as a railroad town, and you can still see that in the old depot and the restored historic buildings near Main Street, while the rest of the city grew into neighborhoods threaded with creeks, ponds and hike-and-bike trails. Families here have plenty of choices for the day, from a parish like St. Jude Catholic Church on North Greenville Avenue, which holds a Spanish-language Mass on Sunday evenings, to a long list of parks for portraits.",
    "That's a gift for photos, because the backdrops are close together. Allen Heritage Village gives you restored historic churches and homes, a barn and garden beds, all tied into the Cottonwood Creek Trail; the Allen Train Depot sits a short drive away with its steam locomotive and caboose. For soft green, Bethany Lakes Park has ponds, trails and a fishing pier, Celebration Park winds its trails along a pond, and the Village Green at Watters Creek adds lawn, tree canopy and sculpture. You can build a portrait route that never repeats the same look twice.",
    "A TX Quince team stays with your family the whole day — la misa, the formal portraits, el vals, the baile sorpresa, and the reception, start to finish — and every gallery and film is edited by us, the owners. Everything runs bilingual. Allen is a natural fit for {{name.trio}}, where photos and video carry the whole night and a printed photo album holds it afterward — but it's the day, not the package, that drives how we shoot it.",
  ],
  introEs: [
    "Allen está en el suroeste del condado de Collin, sobre la US-75, entre Plano al sur y McKinney al norte, con Frisco, Fairview, Lucas y Parker en sus otros bordes. Empezó como un pueblo del ferrocarril, y todavía se nota en la vieja estación y en los edificios históricos restaurados cerca de Main Street, mientras que el resto de la ciudad creció en colonias cruzadas por arroyos, lagunas y senderos para caminar y andar en bici. Las familias de aquí tienen muchas opciones para el día, desde una parroquia como St. Jude Catholic Church, en North Greenville Avenue, que tiene misa en español los domingos por la tarde, hasta una larga lista de parques para las fotos.",
    "Eso es una ventaja para las fotos, porque los fondos quedan cerca unos de otros. El Allen Heritage Village te da iglesias y casas históricas restauradas, un granero y jardines, todo conectado con el Cottonwood Creek Trail; el Allen Train Depot queda a unos minutos con su locomotora de vapor y su vagón. Para el verde suave, Bethany Lakes Park tiene lagunas, senderos y un muelle de pesca, Celebration Park lleva sus senderos junto a una laguna, y el Village Green de Watters Creek suma pasto, sombra de árboles y esculturas. Armas una ruta de fotos que nunca repite el mismo look.",
    "Un equipo de TX Quince acompaña a tu familia todo el día —la misa, las fotos formales, el vals, el baile sorpresa y la recepción, de principio a fin—, y nosotros, los dueños, editamos cada galería y cada video. Todo es bilingüe. Allen encaja natural con {{nameEs.trio}}, donde las fotos y el video cargan toda la noche y un álbum de fotos impreso la guarda después — pero es el día, no el paquete, lo que define cómo lo fotografiamos.",
  ],
  photoSpots: [
    {
      name: "Allen Heritage Village",
      why: "A city park of restored historic buildings: two churches including the Prairie-style Allen Christian Church, four homes, a historic barn and garden areas, with a wide walkway through the middle. Old wood, porches and steeples make a classic backdrop for a full gown.",
      whyEs: "Un parque de la ciudad con edificios históricos restaurados: dos iglesias, entre ellas la Allen Christian Church de estilo Prairie, cuatro casas, un granero histórico y jardines, con un camino ancho por el centro. La madera vieja, los porches y los campanarios son un fondo clásico para un vestido de gala.",
    },
    {
      name: "Allen Train Depot (Ebenezer Allen #20 locomotive)",
      why: "The depot at 100 E. Main Street sits with a restored steam locomotive and a caboose, a strong vintage frame for portraits that tell the story of the town.",
      whyEs: "La estación en 100 E. Main Street está junto a una locomotora de vapor restaurada y un vagón, un fondo de época muy bueno para fotos que cuentan la historia del pueblo.",
    },
    {
      name: "Bethany Lakes Park",
      why: "A 47-acre park with winding trails, ponds, a fishing pier and an amphitheater, plus the Allen Veterans Memorial with its granite monoliths around a tall flagpole. Water and trees in one stop.",
      whyEs: "Un parque de 47 acres con senderos, lagunas, un muelle de pesca y un anfiteatro, además del Allen Veterans Memorial con sus monolitos de granito alrededor de un asta bandera alta. Agua y árboles en una sola parada.",
    },
    {
      name: "Celebration Park",
      why: "A large park whose scenic walking trails wind through greenery and along a pond, with open space and shaded pavilions for a relaxed group shot with the court.",
      whyEs: "Un parque grande cuyos senderos pasan entre áreas verdes y junto a una laguna, con espacios abiertos y pabellones con sombra para una foto de grupo relajada con la corte.",
    },
    {
      name: "The Village Green at Watters Creek",
      why: "Lush lawn under a canopy of trees with sculptures and patio dining around it in the Village at Watters Creek, an easy spot for a polished, modern look.",
      whyEs: "Pasto verde bajo la sombra de los árboles, con esculturas y restaurantes con terraza alrededor, en el Village at Watters Creek. Un lugar fácil para un look pulido y moderno.",
    },
    {
      name: "Cottonwood Creek Trail",
      why: "A creek-side trail through the woods that passes one of Allen's signature public art installations and its bridges, and connects to Allen Heritage Village.",
      whyEs: "Un sendero junto al arroyo, entre árboles, que pasa por una de las instalaciones de arte público más conocidas de Allen y sus puentes, y conecta con el Allen Heritage Village.",
    },
  ],
  faqs: [
    {
      q: "How much does a quinceañera photographer cost in Allen?",
      a: `Packages are ${STUDY} ({{name.study}}), ${SOLO} ({{name.solo}}), ${CINEMA} ({{name.cinema}}) and ${TRIO} ({{name.trio}}, the one I recommend for most celebrations). A ${RETAINER_PCT} deposit locks in the date once your agreement is approved, and the rest is due ${BALANCE_DAYS} days before the event. There's no travel fee anywhere in DFW, so Allen's spot in Collin County never adds to the price.`,
    },
    {
      q: "Where are the best places to take quince pictures in Allen?",
      a: "My go-to spots are Allen Heritage Village (the restored churches and homes), the Allen Train Depot with its steam locomotive, the ponds and trails at Bethany Lakes Park, and the Village Green at Watters Creek. We can shoot these as a portrait session before the celebration or fit a couple into the day's timeline.",
    },
    {
      q: "Where do Allen families usually hold the reception?",
      a: "Families here usually look along the US-75 corridor and the main roads that cross it, like Stacy Road, Exchange Parkway and McDermott Drive, as well as nearby Plano, McKinney and Frisco. Tell me your church and your venue when you reach out and I'll build the timeline around both.",
    },
    {
      q: "Do you offer both photo and video for an Allen quinceañera?",
      a: `Yes. {{name.cinema}} (${CINEMA}) and {{name.trio}} (${TRIO}) pair photos with the full-length 4K film of her whole day, and {{sessionIn}} include a dress or save-the-date session after the deposit; {{name.trio}} goes further — {{team.trio}}, ${HRS_TRIO} hours, a {{highlight.trio}} highlight film and a printed photo album. For a separate day of portraits in her dress, the Second Portrait Day (${SECONDDAY}) adds photos and video at up to 2 locations. On a tighter budget, {{name.solo}} (${SOLO}) covers both with one shooter and a {{cameras.solo}} camera setup: the full-length film of her day and {{photos.solo}} edited photos. If you don't need video, the {{name.study}} (${STUDY}) is photo only.`,
    },
    {
      q: "Which areas near Allen do you cover?",
      a: "All of them — Allen sits between Plano, McKinney, Frisco, Fairview, Lucas and Parker, and I photograph quinceañeras across the entire Dallas–Fort Worth metroplex with no travel fee. Wherever your misa and reception are, I'm there for the full day.",
    },
  ],
  faqsEs: [
    {
      q: "¿Cuánto cuesta un fotógrafo de quinceañera en Allen?",
      a: `Los paquetes son ${STUDY} ({{nameEs.study}}), ${SOLO} ({{nameEs.solo}}), ${CINEMA} ({{nameEs.cinema}}) y ${TRIO} ({{nameEs.trio}}, el que recomiendo para la mayoría de las celebraciones). Un depósito del ${RETAINER_PCT} asegura la fecha una vez aprobado tu contrato, y el resto se paga ${BALANCE_DAYS} días antes del evento. No hay cargo por traslado en ningún punto de DFW, así que estar en el condado de Collin nunca sube el precio.`,
    },
    {
      q: "¿Cuáles son los mejores lugares para tomar fotos de quince en Allen?",
      a: "Mis lugares de cabecera son el Allen Heritage Village (las iglesias y casas históricas restauradas), el Allen Train Depot con su locomotora de vapor, las lagunas y senderos de Bethany Lakes Park y el Village Green de Watters Creek. Los podemos hacer como sesión de retrato antes de la celebración o acomodar un par dentro del itinerario del día.",
    },
    {
      q: "¿Dónde hacen la recepción las familias de Allen?",
      a: "Las familias de aquí suelen buscar por el corredor de la US-75 y las avenidas que la cruzan, como Stacy Road, Exchange Parkway y McDermott Drive, y también en las ciudades vecinas de Plano, McKinney y Frisco. Dime tu iglesia y tu salón cuando me escribas y armo el itinerario alrededor de los dos.",
    },
    {
      q: "¿Ofreces foto y video para una quinceañera en Allen?",
      a: `Sí. {{nameEs.cinema}} (${CINEMA}) y {{nameEs.trio}} (${TRIO}) combinan las fotos con el video completo en 4K de todo su día, y {{sessionInEs}} incluyen una sesión con el vestido o de save the date después del depósito; {{nameEs.trio}} va más allá: {{teamEs.trio}}, ${HRS_TRIO} horas, un resumen de {{highlightEs.trio}} y un álbum de fotos impreso. Para un día aparte de retratos con su vestido, el Segundo día de retratos (${SECONDDAY}) suma fotos y video en hasta 2 lugares. Con un presupuesto más ajustado, {{nameEs.solo}} (${SOLO}) cubre las dos cosas con una sola persona y {{cameras.solo}} cámaras: el video completo de su día y {{photos.solo}} fotos editadas. Si no necesitas video, la {{nameEs.study}} (${STUDY}) es solo de foto.`,
    },
    {
      q: "¿Qué zonas cerca de Allen cubres?",
      a: "Todas — Allen está entre Plano, McKinney, Frisco, Fairview, Lucas y Parker, y fotografío quinceañeras en todo el metroplex de Dallas–Fort Worth sin cargo por traslado. Donde sea que estén tu misa y tu recepción, ahí estoy todo el día.",
    },
  ],
};
