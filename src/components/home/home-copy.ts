/**
 * home-copy.ts — words for the redesigned homepage sections (EN + ES).
 *
 * Prices are never written here: package rows read the live price book, and
 * the FAQ answers come from copy.ts, which is filled from the same book.
 */
import type { TierId } from "@/lib/commission";

export type HomePrint = {
  src: string;
  width: number;
  height: number;
  cap: { en: string; es: string };
  alt: { en: string; es: string };
};

/** The eight keepsake prints scattered around the hero (real TX Quince photos). */
export const HERO_PRINTS: HomePrint[] = [
  {
    src: "/home/shoe-change.webp",
    width: 480,
    height: 719,
    cap: { en: "The shoe change", es: "El cambio de zapatos" },
    alt: {
      en: "A father changes his daughter's shoes during her quinceañera reception",
      es: "Un papá le cambia los zapatos a su hija en la recepción de su quinceañera",
    },
  },
  {
    src: "/home/balloons.webp",
    width: 480,
    height: 720,
    cap: { en: "Pink balloons", es: "Globos rosas" },
    alt: {
      en: "Quinceañera in a blush gown holding pink heart balloons in front of a historic stone building",
      es: "Quinceañera con vestido rosa palo y globos de corazón frente a un edificio histórico de piedra",
    },
  },
  {
    src: "/home/papa-dance.webp",
    width: 480,
    height: 721,
    cap: { en: "Dancing with Papá", es: "El vals con papá" },
    alt: {
      en: "Quinceañera in a black gown dancing with her father beneath lighted marquee letters",
      es: "Quinceañera con vestido negro bailando con su papá bajo letras iluminadas",
    },
  },
  {
    src: "/home/under-trees.webp",
    width: 480,
    height: 640,
    cap: { en: "Under the trees", es: "Bajo los árboles" },
    alt: {
      en: "Quinceañera in a red gown seated on a stone wall beneath tall trees",
      es: "Quinceañera con vestido rojo sentada en un muro de piedra bajo árboles altos",
    },
  },
  {
    src: "/home/ballroom.webp",
    width: 480,
    height: 640,
    cap: { en: "The ballroom", es: "El salón" },
    alt: {
      en: "Quinceañera in a blush gown beneath a gilded dome and crystal chandelier",
      es: "Quinceañera con vestido rosa palo bajo una cúpula dorada y un candelabro de cristal",
    },
  },
  {
    src: "/home/golden-hour.webp",
    width: 480,
    height: 720,
    cap: { en: "Golden hour", es: "Hora dorada" },
    alt: {
      en: "Quinceañera in a champagne gown and tiara in a cactus garden at sunset",
      es: "Quinceañera con vestido champán y tiara en un jardín de cactus al atardecer",
    },
  },
  {
    src: "/home/gifts.webp",
    width: 480,
    height: 719,
    cap: { en: "Her gifts", es: "Sus regalos" },
    alt: {
      en: "Quinceañera in a black and gold gown behind a large red gift box at her party",
      es: "Quinceañera con vestido negro y dorado detrás de una gran caja de regalo roja en su fiesta",
    },
  },
  {
    src: "/home/canal.webp",
    width: 480,
    height: 640,
    cap: { en: "By the canal", es: "Junto al canal" },
    alt: {
      en: "Quinceañera in a red ball gown with a long train at dusk",
      es: "Quinceañera con vestido rojo de cola larga al anochecer",
    },
  },
];

/** Caption for a hero slot print the admin swapped for another photo. */
export const SWAP_CAPTION = [
  { en: "Portraits", es: "Retratos" },
  { en: "Her day", es: "Su día" },
] as const;

/** Package rows: the chips beside each price (hours and team come from the book). */
export const PACKAGE_DETAIL: Record<TierId, { en: string; es: string }> = {
  study: { en: "Photos only · 60 edited photos", es: "Solo fotos · 60 fotos editadas" },
  cinema: { en: "8–10 min video + trailer · 400+ photos", es: "Video de 8–10 min + tráiler · 400+ fotos" },
  production: {
    en: "Coordinator · portraits · 12–15 min video · 700+ photos · album",
    es: "Coordinadora · retratos · video de 12–15 min · 700+ fotos · álbum",
  },
  archive: { en: "20 min video · 1,000+ photos · large album", es: "Video de 20 min · 1,000+ fotos · álbum grande" },
};

/** Topic tag per FAQ item in copy.ts, in the same order. */
export const FAQ_TAGS = {
  en: ["Prices", "Packages", "Your team", "The day", "Booking", "The day", "En español", "Booking", "Photoshoot", "Travel"],
  es: ["Precios", "Paquetes", "Tu equipo", "El día", "Reservar", "El día", "Idioma", "Reservar", "Sesión de fotos", "Viajes"],
} as const;

export const HOME = {
  en: {
    topbar: "Now booking 2027 quinceañeras",
    topbarText: "Text or WhatsApp",
    topbarReply: "we reply within a day",
    sub: "Full galleries and films of her whole day, from getting ready to the last song. In English or Spanish.",
    seePackages: "See packages & prices",
    trust: ["Real DFW families", "Prices shown up front", "English y español"],
    trustShort: (from: string) => `From ${from} · We reply within a day`,
    stories: {
      label: "Real quinceañeras · Galerías reales",
      title: "Every story, from the first photo to the last.",
      dek: "Full galleries from real celebrations across Dallas–Fort Worth.",
      all: "See all galleries",
      view: "View the gallery",
      photos: (n: number) => `${n} photos`,
      lead: "The whole day, start to finish",
    },
    films: {
      label: "TX Quince Films",
      title: "Her day, in motion.",
      all: "All films",
      prev: "Previous film",
      next: "Next film",
      kind: (i: number) => `Nº ${String(i + 1).padStart(2, "0")} · Film`,
    },
    how: {
      label: "How it works · Cómo funciona",
      title: "Three easy steps.",
      steps: [
        { t: "Pick a package", b: "Every price is on this page. Choose the one that fits, add hours or extras." },
        { t: "Send it to us", b: "Pick her date and send your request. Nothing is charged today." },
        { t: "We confirm in a day", b: "We reply to confirm your date, then send your agreement and deposit link." },
      ],
    },
    packages: {
      label: "Packages · Paquetes",
      title: "Packages & prices",
      dek: "Every price is shown up front. Nothing is charged today.",
      pick: "Most families choose this",
      book: "Book",
      bookAria: (name: string) => `Book the ${name}`,
      hours: (h: number) => (h === 1 ? "1 hour" : `${h} hours`),
      hoursTwoDays: (h: number) => `${h} hrs · 2 days`,
      team: (n: number) => (n === 1 ? "1 photographer" : `Team of ${n}`),
      after: "Add hours, a Dress Session or a Same-Day Edit in the next step.",
      panelTitle: "Send your request",
      panelDek: "Choose a package above or here, pick her date, and send it. We reply within a day.",
    },
    about: {
      label: "Meet the studio · Conócenos",
      chips: ["English y español", "Dallas–Fort Worth", "One quince per day"],
      more: "More about us",
      blog: "From our blog",
    },
    faq: {
      label: "Questions · Preguntas",
      dek: "The ones DFW families ask most, answered straight, with real prices.",
      askTitle: "Didn’t see yours?",
      askBody: "Text it to us. We reply within a day, in English or Spanish.",
      where: "Where we work · Dónde trabajamos",
    },
    footer: {
      invite: "Save the date · Reserva la fecha",
      title: "Let’s plan her day",
      body: "Text or WhatsApp us her date. We reply within a day, in English or Spanish.",
      line: "¡Felices XV!",
      about: "Quinceañera photos and films for families across Dallas–Fort Worth.",
      explore: "Explore",
      cities: "Cities",
      hello: "Say hola",
      made: "Hecho con cariño en Dallas–Fort Worth",
    },
  },
  es: {
    topbar: "Ya reservamos quinceañeras 2027",
    topbarText: "Texto o WhatsApp",
    topbarReply: "respondemos en un día",
    sub: "Galerías completas y videos de todo su día, desde que se arregla hasta la última canción. En español o inglés.",
    seePackages: "Ver paquetes y precios",
    trust: ["Familias reales de DFW", "Precios a la vista", "English y español"],
    trustShort: (from: string) => `Desde ${from} · Respondemos en un día`,
    stories: {
      label: "Quinceañeras reales · Real galleries",
      title: "Cada historia, de la primera foto a la última.",
      dek: "Galerías completas de celebraciones reales en Dallas–Fort Worth.",
      all: "Ver todas las galerías",
      view: "Ver la galería",
      photos: (n: number) => `${n} fotos`,
      lead: "Todo el día, de principio a fin",
    },
    films: {
      label: "Videos TX Quince",
      title: "Su día, en movimiento.",
      all: "Todos los videos",
      prev: "Video anterior",
      next: "Video siguiente",
      kind: (i: number) => `Nº ${String(i + 1).padStart(2, "0")} · Video`,
    },
    how: {
      label: "Cómo funciona · How it works",
      title: "Tres pasos sencillos.",
      steps: [
        { t: "Elige un paquete", b: "Todos los precios están aquí. Elige el que te quede y agrega horas o extras." },
        { t: "Envíanoslo", b: "Elige su fecha y envía tu solicitud. Hoy no se cobra nada." },
        { t: "Confirmamos en un día", b: "Te respondemos para confirmar la fecha y te mandamos el contrato y el enlace del depósito." },
      ],
    },
    packages: {
      label: "Paquetes · Packages",
      title: "Paquetes y precios",
      dek: "Todos los precios a la vista. Hoy no se cobra nada.",
      pick: "La que más eligen las familias",
      book: "Reservar",
      bookAria: (name: string) => `Reservar ${name}`,
      hours: (h: number) => (h === 1 ? "1 hora" : `${h} horas`),
      hoursTwoDays: (h: number) => `${h} h · 2 días`,
      team: (n: number) => (n === 1 ? "1 fotógrafo" : `Equipo de ${n}`),
      after: "En el siguiente paso puedes agregar horas, una sesión con el vestido o un video del mismo día.",
      panelTitle: "Envía tu solicitud",
      panelDek: "Elige un paquete arriba o aquí, escoge su fecha y envíala. Respondemos en un día.",
    },
    about: {
      label: "Conócenos · Meet the studio",
      chips: ["English y español", "Dallas–Fort Worth", "Una quince por día"],
      more: "Más sobre nosotros",
      blog: "De nuestro blog",
    },
    faq: {
      label: "Preguntas · Questions",
      dek: "Lo que más preguntan las familias de DFW, con respuestas claras y precios reales.",
      askTitle: "¿No viste la tuya?",
      askBody: "Mándanosla por texto. Respondemos en un día, en español o inglés.",
      where: "Dónde trabajamos · Where we work",
    },
    footer: {
      invite: "Reserva la fecha · Save the date",
      title: "Planeemos su día",
      body: "Mándanos su fecha por texto o WhatsApp. Respondemos en un día, en español o inglés.",
      line: "¡Felices XV!",
      about: "Fotos y videos de quinceañera para familias en todo Dallas–Fort Worth.",
      explore: "Explora",
      cities: "Ciudades",
      hello: "Di hola",
      made: "Hecho con cariño en Dallas–Fort Worth",
    },
  },
} as const;
