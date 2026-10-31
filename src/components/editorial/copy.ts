/**
 * Words for the editorial homepage (EN + ES). Prices are never written here:
 * they come from the live price book. The FAQ, package names and the studio
 * manifesto come from the shared site copy (components/txq/copy.ts).
 */
export const ED = {
  en: {
    reserve: "Reserve your date",
    heroLines: ["Every moment", "of her XV"],
    heroNote: (from: string) => `Packages from ${from} · We reply within a day`,
    statement: {
      label: "The studio · El estudio",
      title: "Her fifteen, made like a fashion film.",
    },
    details: { label: "Her day, moment by moment" },
    band: {
      title: "Her day, in motion.",
      sub: "Real films from real quinceañeras across Dallas–Fort Worth.",
      all: "All films",
      play: "Play film",
    },
    collage: {
      label: "Real galleries · Galerías reales",
      title: "Every story, start to finish.",
      all: "See all galleries",
      photos: (n: number) => `${n} photos`,
    },
    feature: {
      label: "Most families choose",
      deposit: (pct: number, days: number) => `${pct}% deposit after we confirm your date. The rest ${days} days before.`,
      compare: "Compare all packages",
    },
    packages: {
      label: "Packages · Paquetes",
      title: "Packages & prices",
      dek: "Every price is shown up front. Nothing is charged today.",
      book: "Reserve",
      bookAria: (name: string) => `Reserve the ${name}`,
      hours: (h: number) => (h === 1 ? "1 hour" : `${h} hours`),
      hoursTwoDays: (h: number) => `${h} hrs · 2 days`,
      team: (n: number) => (n === 1 ? "1 photographer" : `Team of ${n}`),
      pick: "Most chosen",
      panelTitle: "Send your request",
      panelDek: "Pick a package, her date and your details. We reply within a day to confirm, then send your agreement and deposit link.",
    },
    journal: { label: "From the journal", all: "All posts" },
    faq: {
      label: "Questions · Preguntas",
      askTitle: "Didn’t see yours?",
      askBody: "Text it to us. We reply within a day, in English or Spanish.",
      where: "Where we work · Dónde trabajamos",
    },
    text: "Text",
  },
  es: {
    reserve: "Reserva tu fecha",
    heroLines: ["Cada momento", "de sus XV"],
    heroNote: (from: string) => `Paquetes desde ${from} · Respondemos en un día`,
    statement: {
      label: "El estudio · The studio",
      title: "Sus quince, como una película de moda.",
    },
    details: { label: "Su día, momento a momento" },
    band: {
      title: "Su día, en movimiento.",
      sub: "Videos reales de quinceañeras reales en Dallas–Fort Worth.",
      all: "Todos los videos",
      play: "Ver video",
    },
    collage: {
      label: "Galerías reales · Real galleries",
      title: "Cada historia, de principio a fin.",
      all: "Ver todas las galerías",
      photos: (n: number) => `${n} fotos`,
    },
    feature: {
      label: "La que más eligen las familias",
      deposit: (pct: number, days: number) =>
        `Depósito del ${pct}% cuando confirmamos tu fecha. El resto, ${days} días antes.`,
      compare: "Comparar todos los paquetes",
    },
    packages: {
      label: "Paquetes · Packages",
      title: "Paquetes y precios",
      dek: "Todos los precios a la vista. Hoy no se cobra nada.",
      book: "Reservar",
      bookAria: (name: string) => `Reservar ${name}`,
      hours: (h: number) => (h === 1 ? "1 hora" : `${h} horas`),
      hoursTwoDays: (h: number) => `${h} h · 2 días`,
      team: (n: number) => (n === 1 ? "1 fotógrafo" : `Equipo de ${n}`),
      pick: "La más elegida",
      panelTitle: "Envía tu solicitud",
      panelDek: "Elige un paquete, su fecha y tus datos. Respondemos en un día para confirmar y te mandamos el contrato y el enlace del depósito.",
    },
    journal: { label: "Del blog", all: "Todas las entradas" },
    faq: {
      label: "Preguntas · Questions",
      askTitle: "¿No viste la tuya?",
      askBody: "Mándanosla por texto. Respondemos en un día, en español o inglés.",
      where: "Dónde trabajamos · Where we work",
    },
    text: "Texto",
  },
} as const;
