/**
 * Words for the editorial homepage (EN + ES). Prices are never written here:
 * they come from the live price book. The FAQ, package names and the studio
 * manifesto come from the shared site copy (components/txq/copy.ts).
 */
export const ED = {
  en: {
    reserve: "Reserve your date",
    menu: "Menu",
    close: "Close",
    heroLines: ["Every", "moment of", "her XV"],
    heroNote: (both: string) => `Photo + video from ${both} · We reply within a day`,
    heroFilms: "Watch our films on YouTube",
    heroWhatsapp: "Chat on WhatsApp",
    statement: { label: "The studio", title: "Fifteen, forever." },
    details: { label: "Her day, moment by moment" },
    band: {
      lines: ["Her day,", "in motion."],
      sub: "Real films from real quinceañeras across Dallas–Fort Worth.",
      all: "All films",
      youtube: "Watch more on YouTube",
      play: "Play film",
      prev: "Previous film",
      next: "Next film",
    },
    collage: {
      label: "Real galleries",
      title: "Every story, start to finish.",
      body: "Full galleries from real celebrations, from the first portrait to the last dance.",
      all: "See all galleries",
      photos: (n: number) => `${n} photos`,
    },
    feature: {
      label: "Our pick",
      deposit: (pct: number, days: number) => `${pct}% deposit after we confirm your date. The rest ${days} days before.`,
      compare: "Compare all packages",
      films: "Watch our films",
    },
    packages: {
      label: "Packages",
      title: "Packages & prices",
      dek: "Every price is shown up front. Nothing is charged today.",
      book: "Reserve",
      bookAria: (name: string) => `Reserve ${name}`,
      hours: (h: number) => (h === 1 ? "1 hour" : `${h} hours`),
      pick: "Our pick",
      offer: (left: number, total: number, price: string) => `Only ${left} of ${total} dates left at ${price}`,
      crew: "Our in-house crew covers your day · Edited by Dang and Yvonne",
      panelTitle: "Send your request",
      panelDek: "Pick a package, her date and your details. We reply within a day to confirm, then send your agreement and deposit link.",
    },
    journal: { label: "Journal", title: "Planning & stories", all: "All posts" },
    faq: {
      label: "Questions",
      askTitle: "Didn’t see yours?",
      askBody: "Text it to us. We reply within a day, in English or Spanish.",
      where: "Where we work",
    },
    // Short lines cut from the booking steps (content/commissions.ts); the
    // deposit and balance numbers come from the live price book.
    steps: {
      title: "How booking works",
      items: [
        { title: "Pick your package", line: () => "Choose your date and the package you like." },
        { title: "Sign the agreement", line: () => "Sign online. No payment yet." },
        { title: "Lock in your date", line: (pct: number, days: number) => `Pay the ${pct}% deposit. The rest is due ${days} days before.` },
        { title: "Your day, captured", line: () => "From la misa to the last dance." },
      ],
    },
    // Not new promises: each line is the wording of the signed agreement
    // (lib/agreement.ts) or of the questions block (txq/copy.ts faq).
    promises: {
      title: "The fine print, in plain words",
      short: ["Full refund if we ever cancel", "An owner covers your day if needed", "Insured, with a certificate for your venue"],
      more: "Read all six terms",
      items: [
        "If we can't take your date, we'll let you know and you won't be charged anything.",
        "If we ever have to cancel, we refund everything you've paid.",
        "If you cancel, your deposit is not refundable, because we save your date and turn other families away.",
        "If anyone on the team can't make it, one of the two owners covers your day, no exceptions.",
        "We're insured and can send your church or venue a certificate of insurance.",
        "If you'd like to hear it from a mom, ask us: we'll put you in touch with a past family who's happy to take your call.",
      ],
    },
    text: "Text",
  },
  es: {
    reserve: "Reserva tu fecha",
    menu: "Menú",
    close: "Cerrar",
    heroLines: ["Cada", "momento de", "sus XV"],
    heroNote: (both: string) => `Foto y video desde ${both} · Respondemos en un día`,
    heroFilms: "Mira nuestros videos en YouTube",
    heroWhatsapp: "Escríbenos por WhatsApp",
    statement: { label: "El estudio", title: "Quince, para siempre." },
    details: { label: "Su día, momento a momento" },
    band: {
      lines: ["Su día,", "en movimiento."],
      sub: "Videos reales de quinceañeras reales en Dallas–Fort Worth.",
      all: "Todos los videos",
      youtube: "Ver más en YouTube",
      play: "Ver video",
      prev: "Video anterior",
      next: "Video siguiente",
    },
    collage: {
      label: "Galerías reales",
      title: "Cada historia, de principio a fin.",
      body: "Galerías completas de celebraciones reales, del primer retrato al último baile.",
      all: "Ver todas las galerías",
      photos: (n: number) => `${n} fotos`,
    },
    feature: {
      label: "Nuestra recomendación",
      deposit: (pct: number, days: number) =>
        `Depósito del ${pct}% cuando confirmamos tu fecha. El resto, ${days} días antes.`,
      compare: "Comparar todos los paquetes",
      films: "Mira nuestros videos",
    },
    packages: {
      label: "Paquetes",
      title: "Paquetes y precios",
      dek: "Todos los precios a la vista. Hoy no se cobra nada.",
      book: "Reservar",
      bookAria: (name: string) => `Reservar ${name}`,
      hours: (h: number) => (h === 1 ? "1 hora" : `${h} horas`),
      pick: "Nuestra recomendación",
      offer: (left: number, total: number, price: string) => `Solo quedan ${left} de ${total} fechas a ${price}`,
      crew: "Nuestro equipo de casa cubre tu día · Editado por Dang y Yvonne",
      panelTitle: "Envía tu solicitud",
      panelDek: "Elige un paquete, su fecha y tus datos. Respondemos en un día para confirmar y te mandamos el contrato y el enlace del depósito.",
    },
    journal: { label: "Blog", title: "Ideas e historias", all: "Todas las entradas" },
    faq: {
      label: "Preguntas",
      askTitle: "¿No viste la tuya?",
      askBody: "Mándanosla por texto. Respondemos en un día, en español o inglés.",
      where: "Dónde trabajamos",
    },
    steps: {
      title: "Cómo reservar",
      items: [
        { title: "Elige tu paquete", line: () => "Escoge tu fecha y el paquete que te guste." },
        { title: "Firma el contrato", line: () => "Firma en línea. Todavía no pagas nada." },
        { title: "Asegura tu fecha", line: (pct: number, days: number) => `Paga el depósito del ${pct}%. El resto, ${days} días antes.` },
        { title: "Tu día, para siempre", line: () => "De la misa al último baile." },
      ],
    },
    promises: {
      title: "La letra chica, en palabras claras",
      short: ["Te devolvemos todo si nosotros cancelamos", "Un dueño cubre tu día si hace falta", "Con seguro y certificado para tu salón"],
      more: "Leer los seis puntos",
      items: [
        "Si no podemos tomar tu fecha, te avisamos y no se te cobra nada.",
        "Si nosotros tuviéramos que cancelar, te devolvemos todo lo que hayas pagado.",
        "Si cancelas, el depósito no es reembolsable, porque apartamos tu fecha y rechazamos a otras familias.",
        "Si alguien del equipo no puede ir, uno de los dos dueños cubre tu día, sin excepción.",
        "Tenemos seguro y podemos mandarle a tu iglesia o salón un certificado de seguro.",
        "Si quieres oírlo de otra mamá, pídenoslo: te ponemos en contacto con una familia que con gusto toma tu llamada.",
      ],
    },
    text: "Texto",
  },
} as const;
