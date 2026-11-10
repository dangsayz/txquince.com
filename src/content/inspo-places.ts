/**
 * inspo-places.ts — one photo-spot "inspiration" page per location
 * (EN /{city}/{place}, ES /es/{city}/{place-es}). Built for a mom who wants
 * this look for her daughter: the first paragraph answers "where to take quince
 * photos in {city}", then Dang's photos from a real session there, shown whole.
 *
 * Rules every entry follows:
 * - Photos are Dang's, resized and compressed only (public/spots/{slug}/,
 *   1600px + 800px WebP): no crop, no overlay, no color change.
 * - Never a girl's name or initials anywhere (copy, alt, file names, slugs).
 * - No permit rules, opening hours or prices typed here. Prices are price
 *   tokens (src/lib/price-text.ts) filled from the live book at render.
 * - The place is a schema.org Place, never a LocalBusiness: TX Quince is the
 *   business (the site-wide ProfessionalService, `${site.url}/#business`).
 *
 * To add a location: drop its photos in public/spots/{slug}/, add an entry
 * here, and add two 3-line route files (see src/app/irving/mandalay-canal).
 */
import { PT } from "@/lib/price-text";

type L = { en: string; es: string };

export type InspoPhoto = {
  /** File stem in public/spots/{slug}/ ({file}.webp and {file}-800.webp), or an album photo slug ("album-<id>-<nnn>"). */
  file: string;
  width: number;
  height: number;
  alt: L;
  caption: L;
};

export type InspoSection = { title: string; body?: string[]; items?: string[] };

export type InspoCopy = {
  metaTitle: string;
  description: string;
  eyebrow: string;
  h1: string;
  /** First paragraph: answers "where to take quince photos in {city}". */
  answer: string;
  lead: string;
  galleryTitle: string;
  sections: InspoSection[];
  bookTitle: string;
  book: string[];
  ctaLabel: string;
  cityLink: string;
  moreLinks: { href: string; label: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  crumbCity: string;
  crumbPlace: string;
  switchLabel: string;
};

export type InspoPlace = {
  slug: string;
  /** City page this spot links to (locations.ts slug); "" when its city has no page. */
  citySlug: string;
  path: L;
  /** schema.org Place (never a LocalBusiness). */
  place: {
    name: string;
    alternateName?: string;
    locality: string;
    region: string;
    containedIn?: string;
  };
  credit: L;
  photos: InspoPhoto[];
  copy: { en: InspoCopy; es: InspoCopy };
};

const CREDIT_EN = "the Mandalay Canal in Las Colinas, Irving, TX";
const CREDIT_ES = "el Mandalay Canal en Las Colinas, Irving, TX";

const mandalay: InspoPlace = {
  slug: "mandalay-canal",
  citySlug: "irving",
  path: { en: "/irving/mandalay-canal", es: "/es/irving/canal-mandalay" },
  place: {
    name: "Mandalay Canal",
    alternateName: "Mandalay Canal Walk at Las Colinas",
    locality: "Irving",
    region: "TX",
    containedIn: "Las Colinas",
  },
  credit: { en: CREDIT_EN, es: CREDIT_ES },
  photos: [
    {
      file: "mandalay-canal-gown-bow-profile-02",
      width: 1600,
      height: 2844,
      alt: {
        en: "Quinceañera in a red ball gown seen from behind, hands on her waist and the satin bow and train spread across a stone courtyard at the Mandalay Canal in Las Colinas, Irving, TX",
        es: "Quinceañera con vestido rojo de gala vista de espaldas, con las manos en la cintura y el moño y la cola extendidos sobre un patio de piedra en el Mandalay Canal de Las Colinas, Irving, TX",
      },
      caption: {
        en: "The full back view: bow, train and an arched courtyard.",
        es: "La vista completa de espaldas: el moño, la cola y un patio con arcos.",
      },
    },
    {
      file: "mandalay-canal-gown-bow-profile-01",
      width: 1600,
      height: 2133,
      alt: {
        en: "Quinceañera in a red gown glancing over her shoulder, the long bow train fanned out on the paving under ivy-covered walls at the Mandalay Canal in Las Colinas, Irving",
        es: "Quinceañera con vestido rojo mirando sobre el hombro, con la cola del moño extendida sobre el piso bajo muros con hiedra en el Mandalay Canal de Las Colinas, Irving",
      },
      caption: {
        en: "A glance over the shoulder, with ivy and warm stone behind.",
        es: "Una mirada sobre el hombro, con hiedra y piedra cálida detrás.",
      },
    },
    {
      file: "mandalay-canal-gown-back-bow-courtyard-01",
      width: 1600,
      height: 2400,
      alt: {
        en: "Back of a red sparkle quinceañera gown with a big bow and an off-the-shoulder corset, gold crown on a braided updo, walking through a courtyard at the Mandalay Canal in Las Colinas",
        es: "Espalda de un vestido rojo de quinceañera con brillos, un gran moño y corsé con hombros caídos, corona dorada sobre un peinado trenzado, caminando por un patio del Mandalay Canal en Las Colinas",
      },
      caption: {
        en: "Walking the courtyard: the bow and the corset in motion.",
        es: "Caminando por el patio: el moño y el corsé en movimiento.",
      },
    },
    {
      file: "mandalay-canal-gown-train-doors-01",
      width: 1600,
      height: 2400,
      alt: {
        en: "Red quinceañera gown and train fanned out over stone steps between two dark wood doors, a tiara on her long braid, at the Mandalay Canal in Las Colinas, Irving, TX",
        es: "Vestido rojo de quinceañera con la cola extendida sobre escalones de piedra entre dos puertas de madera oscura, con tiara sobre su trenza larga, en el Mandalay Canal de Las Colinas, Irving, TX",
      },
      caption: {
        en: "The train on the steps, framed by two dark doors.",
        es: "La cola sobre los escalones, entre dos puertas oscuras.",
      },
    },
    {
      file: "mandalay-canal-gown-back-stairs-bw-01",
      width: 1600,
      height: 2400,
      alt: {
        en: "Black-and-white photo of a quinceañera from behind, long curls under a crystal crown and a beaded corset, facing wide stone stairs at the Mandalay Canal in Las Colinas, Irving",
        es: "Foto en blanco y negro de una quinceañera de espaldas, rizos largos bajo una corona de cristal y corsé con pedrería, frente a una escalinata de piedra en el Mandalay Canal de Las Colinas, Irving",
      },
      caption: {
        en: "The same stairs in black and white.",
        es: "La misma escalinata en blanco y negro.",
      },
    },
    {
      file: "mandalay-canal-gown-back-garden-01",
      width: 1600,
      height: 2400,
      alt: {
        en: "Quinceañera in a red gown from behind with long dark curls and a gold crown, green garden and stone windows behind her at the Mandalay Canal in Las Colinas, Irving, TX",
        es: "Quinceañera con vestido rojo de espaldas, rizos largos oscuros y corona dorada, con jardín verde y ventanas de piedra detrás en el Mandalay Canal de Las Colinas, Irving, TX",
      },
      caption: {
        en: "Green garden walls for a softer look.",
        es: "Muros de jardín verdes para un estilo más suave.",
      },
    },
    {
      file: "mandalay-canal-gown-back-hair-garden-01",
      width: 1600,
      height: 2400,
      alt: {
        en: "Half-up curls and gold crown on a quinceañera in a red ball gown, turning toward ivy and a stone building at the Mandalay Canal in Las Colinas, Irving",
        es: "Rizos semirrecogidos y corona dorada en una quinceañera con vestido rojo de gala, girando hacia la hiedra y un edificio de piedra en el Mandalay Canal de Las Colinas, Irving",
      },
      caption: {
        en: "Half-up curls and the crown, turning into the greenery.",
        es: "Rizos semirrecogidos y la corona, girando hacia la vegetación.",
      },
    },
    {
      file: "mandalay-canal-crown-hair-detail-01",
      width: 1600,
      height: 2400,
      alt: {
        en: "Close-up from behind of a gold quinceañera tiara on a half-up hairstyle with long dark curls, garden greenery and stone at the Mandalay Canal in Las Colinas, Irving, TX",
        es: "Acercamiento de espaldas a una tiara dorada de quinceañera sobre un peinado semirrecogido con rizos largos, con jardín y piedra en el Mandalay Canal de Las Colinas, Irving, TX",
      },
      caption: {
        en: "The gold tiara and curls, up close.",
        es: "La tiara dorada y los rizos, de cerca.",
      },
    },
    {
      file: "mandalay-canal-crown-closeup-01",
      width: 1600,
      height: 2400,
      alt: {
        en: "Close-up of a red crystal quinceañera crown on dark hair, a warm stone column softly out of focus behind it, at the Mandalay Canal in Las Colinas, Irving",
        es: "Acercamiento a una corona de cristales rojos de quinceañera sobre cabello oscuro, con una columna de piedra cálida desenfocada detrás, en el Mandalay Canal de Las Colinas, Irving",
      },
      caption: {
        en: "A red crystal crown, with warm stone behind.",
        es: "Una corona de cristales rojos, con piedra cálida detrás.",
      },
    },
  ],
  copy: {
    en: {
      metaTitle: "Quince Photos at the Mandalay Canal, Las Colinas (Irving, TX)",
      description:
        "Where to take quince photos in Irving and Las Colinas: the Mandalay Canal. Courtyards, stone steps, dark wood doors and gardens in one walk, with photos from a real red-gown dress session.",
      eyebrow: "Irving · Las Colinas · Photo spot",
      h1: "Quinceañera photos at the Mandalay Canal in Las Colinas",
      answer:
        "Looking for where to take quince photos in Irving or Las Colinas? Start at the Mandalay Canal in Las Colinas, Irving, TX. Its Venetian-style canal, stone bridges and arched walkways under the Las Colinas towers give her a European-looking backdrop without leaving Dallas–Fort Worth.",
      lead: "Every photo below comes from one dress session we photographed there. In one walk she had an arched courtyard, wide stone steps, dark wood doors and green garden walls, so the session never needed a second location.",
      galleryTitle: "One dress session at the Mandalay Canal",
      sections: [
        {
          title: "Why moms pick it for a dress session",
          items: [
            "It looks like Europe. Stone, arches, ivy and old wooden doors give the gown a storybook setting.",
            "There are many backdrops close together: courtyards, steps, doors and gardens, so she gets variety without changing locations.",
            "Rich gown colors stand out. A red gown like this one glows against the warm stone and the green ivy.",
            "Back views work beautifully here, which helps a girl who feels shy in front of the camera. The bow, the train and the crown do the talking.",
          ],
        },
        {
          title: "The looks you can get in one session",
          items: [
            "The full back view in the courtyard, with the train spread toward the camera.",
            "The train fanned over the stone steps, between two dark doors.",
            "A black-and-white frame on the wide stairs, for a timeless print.",
            "Softer frames against the garden walls: the curls, the crown and the corset.",
            "Close-ups of the tiara and the crown, for the album and the invitations.",
          ],
        },
        {
          title: "Tips for the day",
          items: [
            "Plan for soft light. Early morning or late afternoon is kinder to her skin and to the sequins than midday sun.",
            "Steam the gown the night before. Wrinkles in a long train show in every full-length photo.",
            "Bring a helper whose only job is the skirt and the train.",
            "Pack flats for walking between spots. The walkways and steps are stone.",
            "Bring the crown pins and a small mirror. Crowns slip after an hour of walking.",
          ],
        },
      ],
      bookTitle: "Booking a session at the Mandalay Canal",
      book: [
        `Book it on its own as our {{name.study}}: ${PT.price.study} for a ${PT.hours.study}-hour session with {{team.study}} and {{photos.study}} edited photos. {{sessionIn}} already include a dress or save-the-date session ({{session.photos}} photos), booked after the deposit.`,
        "There is no travel fee anywhere in Dallas–Fort Worth, and every price is published before you send anything.",
      ],
      ctaLabel: "See what fits your budget",
      cityLink: "More Irving photo spots and packages",
      moreLinks: [
        { href: "/blog/quinceanera-dress-session-ideas-dfw", label: "Dress session ideas: back views, trains and tiaras" },
        { href: "/blog/best-quinceanera-photo-locations-dfw", label: "The best quinceañera photo locations in DFW" },
      ],
      faqTitle: "Questions moms ask about the Mandalay Canal",
      faqs: [
        {
          q: "Where can we take quince photos in Irving or Las Colinas?",
          a: "The Mandalay Canal in Las Colinas, Irving, TX is one of the most popular spots. Its Venetian-style canal, stone bridges, courtyards and arched walkways give a European look, with many backdrops close together.",
        },
        {
          q: "Is the Mandalay Canal good for a dress session?",
          a: "Yes. In one walk you can photograph a courtyard, stone steps, dark wood doors and garden walls, so a whole dress session can happen in one place. Rich gown colors like red stand out against the warm stone.",
        },
        {
          q: "How do we book a dress session there with TX Quince?",
          a: `Book the {{name.study}} (${PT.price.study}, ${PT.hours.study}-hour session, {{photos.study}} edited photos), or choose a package that includes the dress or save-the-date session ({{sessionIn}}). Current prices are always on txquince.com/budget.`,
        },
      ],
      crumbCity: "Irving",
      crumbPlace: "Mandalay Canal",
      switchLabel: "Ver en español",
    },
    es: {
      metaTitle: "Fotos de quince en el Mandalay Canal, Las Colinas (Irving, TX)",
      description:
        "Dónde tomar las fotos de quince en Irving y Las Colinas: el Mandalay Canal. Patios, escalones de piedra, puertas de madera y jardines en un solo recorrido, con fotos de una sesión real.",
      eyebrow: "Irving · Las Colinas · Lugar para fotos",
      h1: "Fotos de quinceañera en el Mandalay Canal de Las Colinas",
      answer:
        "¿Buscan dónde tomar las fotos de quince de su hija en Irving o Las Colinas? Empiecen por el Mandalay Canal en Las Colinas, Irving, TX. Su canal estilo veneciano, sus puentes de piedra y sus pasajes con arcos bajo las torres de Las Colinas le dan un fondo con aire europeo sin salir de Dallas–Fort Worth.",
      lead: "Todas las fotos de esta página son de una sola sesión con el vestido que tomamos ahí. En un solo recorrido tuvo un patio con arcos, una escalinata de piedra, puertas de madera oscura y muros de jardín, así que la sesión no necesitó un segundo lugar.",
      galleryTitle: "Una sesión con el vestido en el Mandalay Canal",
      sections: [
        {
          title: "Por qué los papás lo eligen para la sesión con el vestido",
          items: [
            "Parece Europa. La piedra, los arcos, la hiedra y las puertas de madera le dan al vestido un escenario de cuento.",
            "Hay muchos fondos cerca uno del otro: patios, escalones, puertas y jardines, para que tenga variedad sin cambiar de lugar.",
            "Los colores intensos resaltan. Un vestido rojo como este brilla contra la piedra cálida y la hiedra verde.",
            "Las fotos de espaldas se ven preciosas aquí, y eso ayuda mucho si su hija es tímida frente a la cámara. El moño, la cola y la corona hablan por ella.",
          ],
        },
        {
          title: "Lo que pueden lograr en una sola sesión",
          items: [
            "La vista completa de espaldas en el patio, con la cola extendida hacia la cámara.",
            "La cola sobre los escalones de piedra, entre dos puertas oscuras.",
            "Una foto en blanco y negro en la escalinata, para una impresión que no pasa de moda.",
            "Fotos más suaves junto a los muros del jardín: los rizos, la corona y el corsé.",
            "Acercamientos a la tiara y la corona, para el álbum y las invitaciones.",
          ],
        },
        {
          title: "Consejos para ese día",
          items: [
            "Planeen con luz suave. Temprano en la mañana o al final de la tarde favorece más su piel y los brillos del vestido que el sol del mediodía.",
            "Planchen o vaporicen el vestido la noche anterior. Las arrugas de una cola larga se notan en cada foto de cuerpo entero.",
            "Lleven a alguien cuyo único trabajo sea acomodar la falda y la cola.",
            "Lleven zapatos bajos para caminar entre un lugar y otro. Los pasillos y escalones son de piedra.",
            "Lleven los pasadores de la corona y un espejito. Las coronas se mueven después de una hora caminando.",
          ],
        },
      ],
      bookTitle: "Cómo reservar una sesión en el Mandalay Canal",
      book: [
        `Pueden reservarla sola como nuestra {{nameEs.study}}: ${PT.price.study} por una sesión de ${PT.hours.study} h con {{teamEs.study}} y {{photos.study}} fotos editadas. {{sessionInEs}} ya incluyen una sesión con el vestido o de save the date ({{session.photos}} fotos), que se agenda después del depósito.`,
        "No cobramos viáticos en ninguna parte de Dallas–Fort Worth, y todos los precios están publicados antes de que nos manden cualquier cosa.",
      ],
      ctaLabel: "Vean qué alcanza con su presupuesto",
      cityLink: "Más lugares para fotos y paquetes en Irving",
      moreLinks: [
        { href: "/es/blog/mejores-lugares-para-fotos-de-quinceanera-dfw", label: "Los mejores lugares para fotos de quinceañera en DFW" },
        { href: "/es/sesion-de-fotos-quinceanera", label: "La sesión de fotos de quinceañera" },
      ],
      faqTitle: "Preguntas de los papás sobre el Mandalay Canal",
      faqs: [
        {
          q: "¿Dónde podemos tomar las fotos de quince en Irving o Las Colinas?",
          a: "El Mandalay Canal en Las Colinas, Irving, TX es uno de los lugares favoritos. Su canal estilo veneciano, sus puentes de piedra, patios y pasajes con arcos le dan un aire europeo, con muchos fondos cerca uno del otro.",
        },
        {
          q: "¿El Mandalay Canal es bueno para la sesión con el vestido?",
          a: "Sí. En un solo recorrido se puede fotografiar un patio, escalones de piedra, puertas de madera oscura y muros de jardín, así que toda la sesión puede hacerse en un solo lugar. Los colores intensos como el rojo resaltan contra la piedra cálida.",
        },
        {
          q: "¿Cómo reservamos una sesión ahí con TX Quince?",
          a: `Reserven la {{nameEs.study}} (${PT.price.study}, sesión de ${PT.hours.study} h, {{photos.study}} fotos editadas), o elijan un paquete que incluya la sesión con el vestido o de save the date ({{sessionInEs}}). Los precios actuales siempre están en txquince.com/es/presupuesto.`,
        },
      ],
      crumbCity: "Irving",
      crumbPlace: "Mandalay Canal",
      switchLabel: "View in English",
    },
  },
};

// Newer spots live one per file in ./inspo and use photos from the published albums.
// (Type-only import in those files, so there is no runtime cycle.)
import { place as dallasArboretum } from "./inspo/dallas-arboretum";
import { place as fgsRanch } from "./inspo/fgs-ranch";
import { place as dreamhaus } from "./inspo/dreamhaus";

export const INSPO_PLACES: InspoPlace[] = [mandalay, dallasArboretum, fgsRanch, dreamhaus];

export function getInspoPlace(slug: string): InspoPlace | undefined {
  return INSPO_PLACES.find((p) => p.slug === slug);
}

/** Inspo pages for a city (by locations.ts slug), for the city page's links. */
export function inspoPlacesForCity(citySlug: string): InspoPlace[] {
  return INSPO_PLACES.filter((p) => p.citySlug === citySlug);
}

export function inspoImageSrc(place: InspoPlace, file: string, w: 800 | 1600 = 1600): string {
  // A photo from a published album (src/content/albums.ts) is served by /api/img.
  if (file.startsWith("album-")) return `/api/img/${file}?w=${w === 800 ? 828 : 1920}`;
  return `/spots/${place.slug}/${file}${w === 800 ? "-800" : ""}.webp`;
}
