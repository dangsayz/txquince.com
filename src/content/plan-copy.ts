/**
 * plan-copy.ts — every word of the personalized quince plan flow, English +
 * Spanish. `es` is typed against `en`, so a missing translation fails the
 * build (same rule as src/components/txq/copy.ts). Spanish is written for
 * DFW families first, not translated as an afterthought.
 */
import type { PlanLang } from "@/lib/plan";

const en = {
  intake: {
    metaTitle: "Your Free Quince Plan · Dallas–Fort Worth",
    metaDescription:
      "Tell us her date and colors and get a private quince plan: photos in your colors, your date's availability, package prices and a free day-of timeline.",
    eyebrow: "Your quince plan / DFW",
    title: "Your quince plan, in one minute.",
    intro:
      "Tell us her date and colors. You'll get a private page with our work in your colors, your date's availability, our prices and a free quince-day timeline.",
    promise: "No account. Nothing to pay to see your plan.",
    language: "Language",
    date: "Quince date",
    dateHint: "Future dates only",
    city: "City",
    cityPlaceholder: "Dallas, Fort Worth, Arlington…",
    colors: "Her colors",
    colorsHint: "Tap all that apply (up to 5).",
    moreColors: "More colors",
    fewerColors: "Fewer colors",
    theme: "Theme",
    themePlaceholder: "Charra, Encanto, Paris, Vintage…",
    optional: "Optional",
    name: "Your name",
    namePlaceholder: "First and last",
    contact: "Phone or email",
    contactPlaceholder: "(214) 555-0100 or you@email.com",
    contactHint: "We send your plan link here. Text, WhatsApp or email, whatever you prefer.",
    submit: "See my plan",
    sending: "Building your plan…",
    fine: "By sending, you agree we can contact you about your quince. We never post your details anywhere. See our",
    privacy: "privacy policy",
    errors: {
      event_date: "Choose a future date within the next three years.",
      city: "Tell us the city.",
      name: "Please enter your name.",
      contact: "Enter a phone number or an email we can reach you at.",
      form: "Please check the highlighted fields.",
      generic: "Something went wrong. Please try again.",
      network: "Check your connection and try again.",
      verification: "Please complete the verification below.",
      rateLimited: "Too many tries. Please wait a minute and try again.",
      unavailable: "We couldn't save your plan. Please try again shortly, or text us.",
    },
  },
  plan: {
    metaTitle: "Your Quince Plan",
    eyebrow: "Quince plan",
    title: (date: string) => `Your quince on ${date}`,
    inColors: "Colors",
    status: {
      label: "Your date",
      available: "Open",
      limited: "Limited",
      booked: "Booked",
      mine: "Reserved for you",
      availableNote: "Your date is open right now. Dates aren't held until the deposit, so families usually hold theirs early.",
      limitedNote: "Only a little room left on this date. Hold it now if it's the one.",
      bookedNote: "This date is already booked. Text us and we'll add you to the waitlist in case it opens up.",
      yours: "Your date is reserved. Thank you! We'll be in touch to plan the details.",
    },
    paidBanner: "Thank you! Your payment went through. We'll confirm your date by email and text shortly.",
    gallery: {
      match: "Our work in your colors",
      nearby: "Our work in colors close to yours",
      best: "Some of our favorite work",
      bestNote: "We don't have photos tagged in these exact colors yet, so here is a selection of our best work.",
      noColorsNote: "Real DFW quinceañeras we photographed.",
      seeAll: "See the full portfolio",
      empty: "Our portfolio is loading. Open the full portfolio to see our work.",
    },
    packages: {
      title: "Packages",
      dek: "Photo and video by the same team, with every price published.",
      from: "Deposit",
      recommended: "Most chosen",
      compare: "Compare everything in each package",
    },
    hold: {
      title: "Hold my date",
      body: (deposit: string, date: string) =>
        `${deposit} holds ${date} just for you. It goes toward your package total. We'll text or call within a day to choose your package and sign the agreement.`,
      button: (deposit: string) => `Hold my date · ${deposit}`,
      opening: "Opening secure checkout…",
      secure: "Secure checkout by Stripe. We never see your card number.",
      bookedButton: "Text us about the waitlist",
      error: "We couldn't open checkout. Please try again or text us.",
      taken: "That date was just taken. Text us and we'll help.",
      notLive: "Online deposits aren't open right now. Text us and we'll hold your date by hand.",
    },
    timeline: {
      title: "Your free quince-day timeline",
      body: "A day-of schedule built around sunset on your date, plus a countdown checklist with real dates.",
      open: "Open my timeline",
    },
    questions: "Questions? Text us, we answer in English or Spanish.",
    share: "This page is private to your family. It never shows your name or contact details.",
  },
  timeline: {
    metaTitle: "Quince Day Timeline",
    eyebrow: "Quince-day timeline",
    title: "Your quince-day timeline",
    sunset: "Sunset in DFW",
    dayTitle: "The day",
    dayNote: "A starting point that works for most DFW quinceañeras. We build the final schedule with you and your venue.",
    checklistTitle: "Countdown checklist",
    print: "Save as PDF / Print",
    back: "Back to my plan",
    by: "By",
  },
} as const satisfies Record<string, unknown>;

type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : { [K in keyof T]: Widen<T[K]> };

export type PlanCopy = Widen<typeof en>;

const es: PlanCopy = {
  intake: {
    metaTitle: "Tu plan de quince gratis · Dallas–Fort Worth",
    metaDescription:
      "Dinos la fecha y los colores y recibe un plan de quince privado: fotos en tus colores, disponibilidad de tu fecha, precios y un cronograma gratis del día.",
    eyebrow: "Tu plan de quince / DFW",
    title: "Tu plan de quince, en un minuto.",
    intro:
      "Dinos la fecha y sus colores. Recibes una página privada con nuestro trabajo en tus colores, la disponibilidad de tu fecha, nuestros precios y un cronograma gratis del día de la fiesta.",
    promise: "Sin crear cuenta. No pagas nada por ver tu plan.",
    language: "Idioma",
    date: "Fecha de la quince",
    dateHint: "Solo fechas futuras",
    city: "Ciudad",
    cityPlaceholder: "Dallas, Fort Worth, Arlington…",
    colors: "Sus colores",
    colorsHint: "Toca todos los que apliquen (hasta 5).",
    moreColors: "Más colores",
    fewerColors: "Menos colores",
    theme: "Tema",
    themePlaceholder: "Charra, Encanto, París, Vintage…",
    optional: "Opcional",
    name: "Tu nombre",
    namePlaceholder: "Nombre y apellido",
    contact: "Teléfono o correo",
    contactPlaceholder: "(214) 555-0100 o tu@correo.com",
    contactHint: "Aquí te mandamos el enlace de tu plan. Mensaje, WhatsApp o correo, como prefieras.",
    submit: "Ver mi plan",
    sending: "Preparando tu plan…",
    fine: "Al enviar, aceptas que te contactemos sobre tu quince. Nunca publicamos tus datos. Consulta nuestra",
    privacy: "política de privacidad",
    errors: {
      event_date: "Elige una fecha futura dentro de los próximos tres años.",
      city: "Dinos la ciudad.",
      name: "Escribe tu nombre.",
      contact: "Escribe un teléfono o un correo donde te podamos contactar.",
      form: "Revisa los campos señalados.",
      generic: "Algo salió mal. Inténtalo de nuevo.",
      network: "Revisa tu conexión e inténtalo de nuevo.",
      verification: "Completa la verificación de abajo.",
      rateLimited: "Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
      unavailable: "No pudimos guardar tu plan. Inténtalo en unos minutos o mándanos un mensaje.",
    },
  },
  plan: {
    metaTitle: "Tu plan de quince",
    eyebrow: "Plan de quince",
    title: (date: string) => `Tu quince el ${date}`,
    inColors: "Colores",
    status: {
      label: "Tu fecha",
      available: "Disponible",
      limited: "Pocos lugares",
      booked: "Reservada",
      mine: "Apartada para ti",
      availableNote: "Tu fecha está libre ahorita. Las fechas no se apartan hasta el depósito, por eso las familias suelen apartarla con tiempo.",
      limitedNote: "Queda poco espacio en esta fecha. Apártala ya si es la tuya.",
      bookedNote: "Esta fecha ya está reservada. Mándanos un mensaje y te anotamos en la lista de espera por si se libera.",
      yours: "Tu fecha está reservada. ¡Gracias! Te contactamos para planear los detalles.",
    },
    paidBanner: "¡Gracias! Tu pago se realizó. Te confirmamos la fecha por correo y mensaje en breve.",
    gallery: {
      match: "Nuestro trabajo en tus colores",
      nearby: "Nuestro trabajo en colores parecidos a los tuyos",
      best: "Algunos de nuestros trabajos favoritos",
      bestNote: "Todavía no tenemos fotos marcadas con estos colores exactos, así que aquí tienes una selección de nuestro mejor trabajo.",
      noColorsNote: "Quinceañeras reales de DFW que fotografiamos.",
      seeAll: "Ver todo el portafolio",
      empty: "El portafolio está cargando. Abre el portafolio completo para ver nuestro trabajo.",
    },
    packages: {
      title: "Paquetes",
      dek: "Foto y video con el mismo equipo, con todos los precios publicados.",
      from: "Depósito",
      recommended: "El más elegido",
      compare: "Compara todo lo que incluye cada paquete",
    },
    hold: {
      title: "Apartar mi fecha",
      body: (deposit: string, date: string) =>
        `Con ${deposit} apartas el ${date} solo para ti. Se abona al total de tu paquete. Te escribimos o llamamos en un día para elegir el paquete y firmar el contrato.`,
      button: (deposit: string) => `Apartar mi fecha · ${deposit}`,
      opening: "Abriendo el pago seguro…",
      secure: "Pago seguro con Stripe. Nunca vemos el número de tu tarjeta.",
      bookedButton: "Escríbenos por la lista de espera",
      error: "No pudimos abrir el pago. Inténtalo de nuevo o mándanos un mensaje.",
      taken: "Alguien acaba de apartar esa fecha. Mándanos un mensaje y te ayudamos.",
      notLive: "Los depósitos en línea no están abiertos ahorita. Mándanos un mensaje y te apartamos la fecha nosotros.",
    },
    timeline: {
      title: "Tu cronograma gratis del día",
      body: "Un horario del día pensado según la puesta del sol en tu fecha, más una lista de pendientes con fechas reales.",
      open: "Abrir mi cronograma",
    },
    questions: "¿Preguntas? Mándanos un mensaje, contestamos en español o inglés.",
    share: "Esta página es privada para tu familia. Nunca muestra tu nombre ni tus datos de contacto.",
  },
  timeline: {
    metaTitle: "Cronograma del día de la quince",
    eyebrow: "Cronograma del día",
    title: "El cronograma de tu quince",
    sunset: "Puesta del sol en DFW",
    dayTitle: "El día",
    dayNote: "Un punto de partida que funciona para la mayoría de las quinceañeras en DFW. El horario final lo armamos contigo y con tu salón.",
    checklistTitle: "Lista de pendientes",
    print: "Guardar como PDF / Imprimir",
    back: "Volver a mi plan",
    by: "Para el",
  },
};

export const PLAN_COPY: Record<PlanLang, PlanCopy> = { en, es };

/** Colors shown before "More colors" on the intake form (most-requested in DFW). */
export const POPULAR_COLOR_IDS = [
  "fucsia",
  "rosa",
  "rosa-palo",
  "rojo",
  "vino",
  "morado",
  "lila",
  "azul-rey",
  "celeste",
  "esmeralda",
  "dorado",
  "plateado",
  "blanco",
  "champagne",
] as const;
