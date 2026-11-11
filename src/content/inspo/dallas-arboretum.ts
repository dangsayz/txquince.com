/**
 * Dallas Arboretum (Dallas): one photo-location page (EN + ES), listed in ../inspo-places.ts.
 * Photos come from the published albums ("album-..." slugs).
 */
import type { InspoPlace } from "../inspo-places";
import { PT } from "@/lib/price-text";

export const place: InspoPlace = {
  slug: "dallas-arboretum",
  citySlug: "dallas",
  path: {
    en: "/dallas/dallas-arboretum",
    es: "/es/dallas/arboretum-de-dallas",
  },
  place: {
    name: "Dallas Arboretum and Botanical Garden",
    alternateName: "Dallas Arboretum",
    locality: "Dallas",
    region: "TX",
    containedIn: "White Rock Lake",
  },
  credit: {
    en: "the Dallas Arboretum and Botanical Garden in Dallas, TX",
    es: "el Arboretum y Jardín Botánico de Dallas, Dallas, TX",
  },
  photos: [
    {
      file: "album-arboretum-pink-garden-006",
      width: 3072,
      height: 4608,
      alt: {
        en: "Pink quinceañera gown with a big satin bow seen from behind, walking up garden stairs between tall evergreens toward a white building at the Dallas Arboretum in Dallas, TX",
        es: "Vestido rosa de quinceañera con un gran moño de satín visto de espaldas, subiendo una escalera de jardín entre árboles altos hacia un edificio blanco en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "The pink gown from behind, on garden stairs.",
        es: "El vestido rosa de espaldas, en una escalera del jardín.",
      },
    },
    {
      file: "album-arboretum-pink-garden-143",
      width: 2250,
      height: 3000,
      alt: {
        en: "Quinceañera in a pink gown with a tiara seated on a green lawn, the wide skirt spread in a full circle around her at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rosa y tiara sentada en un césped verde, con la falda amplia extendida en círculo a su alrededor en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "Pink tulle on green grass: the skirt becomes the picture.",
        es: "Tul rosa sobre pasto verde: la falda es la protagonista.",
      },
    },
    {
      file: "album-arboretum-pink-garden-178",
      width: 2000,
      height: 3000,
      alt: {
        en: "Quinceañera in a full pink gown with a tiara seated in front of a carved wooden door set in a stone doorway at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rosa de gala y tiara sentada frente a una puerta de madera tallada en un portal de piedra en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "A carved wood door gives the pale gown a dark frame.",
        es: "Una puerta de madera tallada enmarca el vestido claro.",
      },
    },
    {
      file: "album-arboretum-pink-garden-153",
      width: 2000,
      height: 3000,
      alt: {
        en: "Quinceañera in a pink gown with a large back bow, tiara and long curls reaching toward white hydrangea blooms at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rosa con un gran moño en la espalda, tiara y rizos largos, alcanzando unas flores blancas de hortensia en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "The back bow and white hydrangeas.",
        es: "El moño de la espalda y las hortensias blancas.",
      },
    },
    {
      file: "album-arboretum-pink-garden-120",
      width: 2000,
      height: 3000,
      alt: {
        en: "Quinceañera in a pink ball gown seated in a stone archway with a sunlit courtyard and flower beds behind her at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rosa de gala sentada en un arco de piedra, con un patio soleado y jardineras detrás en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "Seated in a warm stone arch.",
        es: "Sentada en un arco de piedra cálida.",
      },
    },
    {
      file: "album-arboretum-pink-garden-104",
      width: 2000,
      height: 3000,
      alt: {
        en: "Close-up of the beaded pink bodice and a handmade paper-flower bouquet with brooch pins at the Dallas Arboretum in Dallas, TX",
        es: "Acercamiento al corpiño rosa con pedrería y a un ramo de flores de papel hecho a mano con broches en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "The beaded bodice and the bouquet, up close.",
        es: "El corpiño con pedrería y el ramo, de cerca.",
      },
    },
    {
      file: "album-arboretum-red-garden-001",
      width: 3072,
      height: 4608,
      alt: {
        en: "Quinceañera in a red ball gown with a red bouquet and a crown, seated under a spreading tree in the gardens at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rojo de gala, ramo rojo y corona, sentada bajo un árbol de ramas amplias en los jardines del Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "The red gown under a spreading tree.",
        es: "El vestido rojo bajo un árbol de ramas amplias.",
      },
    },
    {
      file: "album-arboretum-red-garden-127",
      width: 2000,
      height: 3000,
      alt: {
        en: "Quinceañera in a full red gown standing on wide garden stairs between clipped topiary and stone planters at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rojo de gala de pie en una escalera ancha del jardín, entre arbustos recortados y macetas de piedra en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "Red against clipped green hedges.",
        es: "Rojo contra setos verdes bien recortados.",
      },
    },
    {
      file: "album-arboretum-red-garden-141",
      width: 2000,
      height: 3000,
      alt: {
        en: "Quinceañera in a red gown with a long train spread across garden stairs, bouquet in hand, hedges and trees on both sides at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rojo y una cola larga extendida sobre la escalera del jardín, con el ramo en la mano y setos y árboles a los lados en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "A long red train down the stairs.",
        es: "Una cola roja larga sobre la escalera.",
      },
    },
    {
      file: "album-arboretum-red-garden-154",
      width: 2250,
      height: 3000,
      alt: {
        en: "Quinceañera in a red gown with her train trailing beneath a wrought-iron garden arch covered in greenery at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rojo y la cola extendida bajo un arco de hierro forjado cubierto de vegetación en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "Under an iron garden arch.",
        es: "Bajo un arco de hierro en el jardín.",
      },
    },
    {
      file: "album-arboretum-red-garden-111",
      width: 2000,
      height: 3000,
      alt: {
        en: "Quinceañera in a red gown with a crown leaning on a vine-wrapped post in a stone gazebo at the Dallas Arboretum in Dallas, TX",
        es: "Quinceañera con vestido rojo y corona recargada en un poste cubierto de enredadera en un gazebo de piedra en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "A stone gazebo with a vine-wrapped post.",
        es: "Un gazebo de piedra con un poste cubierto de enredadera.",
      },
    },
    {
      file: "album-arboretum-red-garden-101",
      width: 2000,
      height: 3000,
      alt: {
        en: "Close-up of a red rose bouquet with pearls held against a beaded red bodice at the Dallas Arboretum in Dallas, TX",
        es: "Acercamiento a un ramo de rosas rojas con perlas sobre un corpiño rojo con pedrería en el Arboretum de Dallas, Dallas, TX",
      },
      caption: {
        en: "Red roses, pearls and beading.",
        es: "Rosas rojas, perlas y pedrería.",
      },
    },
  ],
  copy: {
    en: {
      metaTitle: "Quince Photos at the Dallas Arboretum: Pink and Red Gowns (Dallas, TX)",
      description: "Where to take quince photos in Dallas: the Dallas Arboretum and Botanical Garden. Stairs, stone arches, hedges and tree-lined paths, with photos from two real dress sessions: a pink gown and a red gown.",
      eyebrow: "Dallas · Photo spot",
      h1: "Quinceañera photos at the Dallas Arboretum",
      answer: "Looking for where to take quince photos in Dallas? Start at the Dallas Arboretum and Botanical Garden, on the shores of White Rock Lake. Its gardens give her stairs, stone arches, clipped hedges and shaded paths in one place, so the gown is the only thing that has to stand out.",
      lead: "Every photo below comes from two dress sessions we photographed there: one in a pink gown and one in a red gown. Same gardens, two very different looks, which helps if you are still choosing a dress color.",
      galleryTitle: "Two dress sessions at the Dallas Arboretum: pink and red",
      sections: [
        {
          title: "Why moms pick it for a dress session",
          items: [
            "It is a real garden, not a backdrop. The Arboretum covers 66 acres on White Rock Lake, with named gardens, paths and water features to walk through.",
            "There are many looks close together: garden stairs, stone arches, a gazebo, iron arches, hedges, lawns and a carved wood door.",
            "The Dallas Arboretum also has the DeGolyer House, a Latin Colonial Revival home from 1939 listed on the National Register of Historic Places.",
            "Gown color is easy to read here. Green is a calm background for almost any color, so the dress is what people see first.",
          ],
        },
        {
          title: "How a pink gown and a red gown read in the gardens",
          items: [
            "Pink looks soft and romantic. Against deep green it reads as pastel and glowing, and the beading and the satin bow show clearly on the lawn, the stairs and in front of stone.",
            "Red looks bold. It is the opposite of green, so it jumps out against hedges and trees, and the bouquet and the crown match the gown.",
            "Both colors photograph well on stone steps and under arches, where the skirt and the train can spread.",
            "A pink gown also works on lawns and in light, open spots. A red gown works well in shade and in front of dark greens.",
            "If you are still choosing, look at both sets and ask which one feels like your daughter.",
          ],
        },
        {
          title: "Tips for the day",
          items: [
            "Plan for soft light. Early morning or late afternoon is kinder to her skin and to the sequins than midday sun.",
            "Steam the gown the night before. Wrinkles in a long train show in every full-length photo.",
            "Bring a helper whose only job is the skirt and the train. On a lawn, a pink skirt will pick up grass stains fast, so bring a sheet to sit on between photos.",
            "Pack flats for walking between spots. The gardens have long paths and stone steps.",
            "The Arboretum sets its own photo rules. We confirm them with the family before the session, so nothing surprises you on the day.",
          ],
        },
      ],
      bookTitle: "Booking a session at the Dallas Arboretum",
      book: [
        `Book it on its own as our {{name.study}}: ${PT.price.study} for a ${PT.hours.study}-hour session with {{team.study}} and {{photos.study}} edited photos. {{sessionIn}} already include a dress or save-the-date session ({{session.photos}} photos), booked after the deposit.`,
        "There is no travel fee anywhere in Dallas–Fort Worth, and every price is published before you send anything.",
      ],
      ctaLabel: "See what fits your budget",
      cityLink: "More Dallas photo spots and packages",
      moreLinks: [
        {
          href: "/blog/pink-gown-quinceanera-photos-dallas-arboretum",
          label: "Pink gown quinceañera photos at the Dallas Arboretum",
        },
        {
          href: "/blog/red-gown-quinceanera-photos-dallas-arboretum",
          label: "Red gown quinceañera photos at the Dallas Arboretum",
        },
        {
          href: "/blog/quinceanera-dress-session-ideas-dfw",
          label: "Dress session ideas: back views, trains and tiaras",
        },
        {
          href: "/blog/best-quinceanera-photo-locations-dfw",
          label: "The best quinceañera photo locations in DFW",
        },
        {
          href: "/quinceanera-photoshoot",
          label: "The quinceañera photoshoot",
        },
      ],
      faqTitle: "Questions moms ask about the Dallas Arboretum",
      faqs: [
        {
          q: "Where can we take quince photos in Dallas?",
          a: "The Dallas Arboretum and Botanical Garden is one of the most popular spots. It sits on the shores of White Rock Lake and has garden stairs, stone arches, hedges and tree-lined paths close together.",
        },
        {
          q: "What gown color looks best at the Dallas Arboretum?",
          a: "Both pink and red work. Pink reads soft and romantic against the green, and red stands out boldly. We photographed one dress session in each color there, and you can see both on this page.",
        },
        {
          q: "How do we book a dress session there with TX Quince?",
          a: `Book the {{name.study}} (${PT.price.study}, ${PT.hours.study}-hour session, {{photos.study}} edited photos), or choose a package that includes the dress or save-the-date session ({{sessionIn}}). Current prices are always on txquince.com/budget.`,
        },
      ],
      crumbCity: "Dallas",
      crumbPlace: "Dallas Arboretum",
      switchLabel: "Ver en español",
    },
    es: {
      metaTitle: "Fotos de quince en el Arboretum de Dallas: vestido rosa y rojo (Dallas, TX)",
      description: "Dónde tomar las fotos de quince en Dallas: el Arboretum y Jardín Botánico de Dallas. Escaleras, arcos de piedra, setos y caminos con árboles, con fotos de dos sesiones reales: un vestido rosa y un vestido rojo.",
      eyebrow: "Dallas · Lugar para fotos",
      h1: "Fotos de quinceañera en el Arboretum de Dallas",
      answer: "¿Buscan dónde tomar las fotos de quince de su hija en Dallas? Empiecen por el Arboretum y Jardín Botánico de Dallas, a orillas del lago White Rock. Sus jardines tienen escaleras, arcos de piedra, setos recortados y caminos con sombra en un solo lugar, así que lo único que tiene que destacar es el vestido.",
      lead: "Todas las fotos de esta página son de dos sesiones con el vestido que tomamos ahí: una con vestido rosa y otra con vestido rojo. Los mismos jardines, dos estilos muy distintos, lo cual ayuda si todavía están eligiendo el color del vestido.",
      galleryTitle: "Dos sesiones con el vestido en el Arboretum de Dallas: rosa y rojo",
      sections: [
        {
          title: "Por qué los papás lo eligen para la sesión con el vestido",
          items: [
            "Es un jardín de verdad, no un fondo. El Arboretum tiene 66 acres a orillas del lago White Rock, con jardines con nombre, caminos y fuentes para recorrer.",
            "Hay muchos fondos cerca uno del otro: escaleras de jardín, arcos de piedra, un gazebo, arcos de hierro, setos, césped y una puerta de madera tallada.",
            "El Arboretum también tiene la DeGolyer House, una casa de estilo Latin Colonial Revival de 1939 incluida en el Registro Nacional de Lugares Históricos.",
            "El color del vestido se lee fácil aquí. El verde es un fondo tranquilo para casi cualquier color, así que el vestido es lo primero que se ve.",
          ],
        },
        {
          title: "Cómo se ven un vestido rosa y uno rojo en los jardines",
          items: [
            "El rosa se ve suave y romántico. Contra el verde intenso se ve pastel y luminoso, y la pedrería y el moño de satín se aprecian bien en el césped, en las escaleras y frente a la piedra.",
            "El rojo se ve atrevido. Es el opuesto del verde, así que resalta contra los setos y los árboles, y el ramo y la corona combinan con el vestido.",
            "Los dos colores se fotografían muy bien en escalones de piedra y bajo arcos, donde la falda y la cola se pueden extender.",
            "Un vestido rosa también funciona en el césped y en lugares abiertos con luz. Un vestido rojo funciona bien en la sombra y frente a verdes oscuros.",
            "Si todavía están eligiendo, miren los dos grupos de fotos y pregúntense cuál se parece más a su hija.",
          ],
        },
        {
          title: "Consejos para ese día",
          items: [
            "Planeen con luz suave. Temprano en la mañana o al final de la tarde favorece más su piel y los brillos del vestido que el sol del mediodía.",
            "Planchen o vaporicen el vestido la noche anterior. Las arrugas de una cola larga se notan en cada foto de cuerpo entero.",
            "Lleven a alguien cuyo único trabajo sea acomodar la falda y la cola. En el césped, una falda rosa se mancha rápido de pasto, así que lleven una sábana para sentarse entre foto y foto.",
            "Lleven zapatos bajos para caminar entre un lugar y otro. Los jardines tienen caminos largos y escalones de piedra.",
            "El Arboretum tiene sus propias reglas para tomar fotos. Las confirmamos con la familia antes de la sesión, para que nada los sorprenda ese día.",
          ],
        },
      ],
      bookTitle: "Cómo reservar una sesión en el Arboretum de Dallas",
      book: [
        `Pueden reservarla sola como nuestra {{nameEs.study}}: ${PT.price.study} por una sesión de ${PT.hours.study} h con {{teamEs.study}} y {{photos.study}} fotos editadas. {{sessionInEs}} ya incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos), que se agenda después del depósito.`,
        "No cobramos viáticos en ninguna parte de Dallas–Fort Worth, y todos los precios están publicados antes de que nos manden cualquier cosa.",
      ],
      ctaLabel: "Vean qué alcanza con su presupuesto",
      cityLink: "Más lugares para fotos y paquetes en Dallas",
      moreLinks: [
        {
          href: "/es/blog/mejores-lugares-para-fotos-de-quinceanera-dfw",
          label: "Los mejores lugares para fotos de quinceañera en DFW",
        },
        {
          href: "/es/blog/sesion-de-fotos-pre-quince-dfw",
          label: "La sesión de fotos pre-quince en DFW",
        },
        {
          href: "/es/sesion-de-fotos-quinceanera",
          label: "La sesión de fotos de quinceañera",
        },
      ],
      faqTitle: "Preguntas de los papás sobre el Arboretum de Dallas",
      faqs: [
        {
          q: "¿Dónde podemos tomar las fotos de quince en Dallas?",
          a: "El Arboretum y Jardín Botánico de Dallas es uno de los lugares favoritos. Está a orillas del lago White Rock y tiene escaleras de jardín, arcos de piedra, setos y caminos con árboles, todo cerca.",
        },
        {
          q: "¿Qué color de vestido se ve mejor en el Arboretum de Dallas?",
          a: "Funcionan tanto el rosa como el rojo. El rosa se ve suave y romántico contra el verde, y el rojo resalta con fuerza. Fotografiamos una sesión con el vestido de cada color ahí, y pueden ver las dos en esta página.",
        },
        {
          q: "¿Cómo reservamos una sesión ahí con TX Quince?",
          a: `Reserven la {{nameEs.study}} (${PT.price.study}, sesión de ${PT.hours.study} h, {{photos.study}} fotos editadas), o elijan un paquete que incluya la sesión con el vestido o de save the date ({{sessionInEs}}). Los precios actuales siempre están en txquince.com/es/presupuesto.`,
        },
      ],
      crumbCity: "Dallas",
      crumbPlace: "Arboretum de Dallas",
      switchLabel: "View in English",
    },
  },
};
