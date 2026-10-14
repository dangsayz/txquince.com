import type { BlogPost } from "@/content/blog";
import {
  TIER_PRICE_USD,
  RETAINER,
  CONSULT_HOLD_DAYS,
  BASE_HOURS,
  quoteCommission,
  usd,
} from "@/lib/commission";

const retainerPct = `${Math.round(RETAINER.rate * 100)}%`;
const due = RETAINER.balanceDueHours;
const hold = CONSULT_HOLD_DAYS;
const retainerFor = (tier: keyof typeof TIER_PRICE_USD) =>
  usd(quoteCommission(tier, []).retainerUsd);

const post: BlogPost = {
  slug: "planes-de-pago-fotografia-quinceanera-dfw",
  title: "Planes de pago, depósito y anticipo para fotografía de quinceañera en DFW",
  description:
    "Cómo funciona de verdad apartar a su fotógrafo de quinceañera en Dallas–Fort Worth: depósito o anticipo, cuándo se paga el saldo, qué preguntar sobre reembolsos y cómo guardar la fecha mientras decide.",
  category: "Cost & Budget",
  excerpt:
    "Un depósito aparta la fecha y el resto se paga poco antes del evento. Así funcionan los depósitos y anticipos en DFW, y cómo guardar su fecha mientras decide.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 7,
  lang: "es",
  lead: "Cuando ve el precio de la fotografía de quinceañera en un solo número, parece un muro. No lo es. Casi ninguna familia paga el total el día que reserva: usted aparta la fecha con un depósito, y el resto se paga más cerca del evento. Aquí le explicamos cómo funciona eso en Dallas–Fort Worth y en TX Quince, en pasos sencillos, para que pueda reservar con confianza.",
  content: [
    { type: "h2", text: "¿Tiene que pagar todo por adelantado? No" },
    {
      type: "p",
      text: `La respuesta corta es no. En TX Quince usted aparta su fecha con un depósito del ${retainerPct} de su paquete, y el resto se paga ${due} horas antes del evento. Eso es todo: dos pagos, los dos claros desde el día en que reserva, para que nada del costo la tome por sorpresa después.`,
    },
    {
      type: "callout",
      text: "El depósito no es un cargo adicional. Se aplica completo al total de su paquete, así que simplemente se convierte en su primer pago del mismo precio publicado.",
    },
    { type: "h2", text: "¿De cuánto es el depósito para apartar la fecha?" },
    {
      type: "p",
      text: `En el área de Dallas–Fort Worth, cada estudio lo maneja distinto: algunos piden un depósito fijo de unos cientos de dólares y otros piden un porcentaje del total, muchas veces alrededor de un tercio. En [TX Quince](/es#commissions), el depósito es el ${retainerPct} de su paquete:`,
    },
    {
      type: "ul",
      items: [
        `Sesión de retratos (${usd(TIER_PRICE_USD.study)}): depósito de ${retainerFor("study")} para apartar su fecha.`,
        `Foto + Video (${usd(TIER_PRICE_USD.cinema)}): depósito de ${retainerFor("cinema")} para apartar su fecha.`,
        `Celebración completa (${usd(TIER_PRICE_USD.production)}): depósito de ${retainerFor("production")} para apartar su fecha.`,
        `Celebración de dos días (${usd(TIER_PRICE_USD.archive)}): depósito de ${retainerFor("archive")} para apartar su fecha.`,
      ],
    },
    {
      type: "p",
      text: "Si agrega extras u horas adicionales, el total sube y el depósito sigue el mismo porcentaje. ¿Quiere ver con detalle qué incluye cada paquete antes de decidir? Revise [los paquetes](/es#commissions) o lea nuestra [guía completa de cuánto cuesta un fotógrafo de quinceañera](/es/blog/cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth).",
    },
    { type: "h2", text: "Cómo funciona el depósito" },
    {
      type: "p",
      text: "El ritmo es este, y lo hicimos a propósito sencillo, porque lo último que necesita un año de organizar una quinceañera es una cuenta más que confunda.",
    },
    {
      type: "ol",
      items: [
        "Elija su paquete y los extras que quiera: el total está publicado, así que lo ve antes de pagar nada.",
        `Llene sus datos, y revise y firme el contrato en línea. Le apartamos la fecha ${hold} días mientras lo revisamos, y todavía no se cobra nada.`,
        `Lo revisamos y aprobamos en un día. Luego paga el depósito del ${retainerPct} para asegurar su fecha.`,
        `El depósito se abona a su total, y el resto se paga ${due} horas antes del evento.`,
      ],
    },
    {
      type: "p",
      text: `Algunos estudios de DFW ofrecen planes de pago mensuales; si eso le importa, pregunte a cualquier estudio cuántos pagos son, cuándo cae el último y si el plan cuesta más que pagar de contado. Nuestra estructura es sencilla a propósito: un depósito para asegurar su fecha, y el resto ${due} horas antes del evento.`,
    },
    { type: "h2", text: "Qué asegura el depósito (y qué preguntar sobre reembolsos)" },
    {
      type: "p",
      text: "El depósito cumple una función importante: saca su fecha del calendario para que ninguna otra familia pueda apartarla. Un equipo solo puede estar en un lugar un sábado dado, así que el depósito es lo que reserva a su equipo, sus horas de cobertura y su lugar.",
    },
    {
      type: "p",
      text: "¿El depósito es reembolsable? Cada estudio tiene su política, así que pida las condiciones por escrito antes de pagar. En general, el depósito aparta una fecha por la que el estudio deja de aceptar a otras familias, así que no está pensado para devolverse si los planes cambian de su lado. Lo que siempre debe tener por escrito es qué pasa si el estudio le cancela a usted: en TX Quince, si alguna vez tuviéramos que cancelar, su depósito se le devuelve por completo.",
    },
    {
      type: "quote",
      text: "El depósito protege su fecha. El precio publicado protege su presupuesto. Las condiciones por escrito la protegen de sorpresas.",
    },
    {
      type: "cta",
      heading: "Aparte su fecha, o platique con nosotros primero",
      body: `Firme el contrato en línea y le apartamos la fecha ${hold} días mientras lo revisamos. Ya aprobado, el depósito del ${retainerPct} la asegura. ¿Quiere platicar primero? Pida una llamada rápida.`,
      href: "/es#intake",
      label: "Aparte su fecha",
    },
    { type: "h2", text: "Si todavía no está lista para decidir: guarde la fecha primero" },
    {
      type: "p",
      text: "A veces quiere platicarlo antes de pagar nada, pero tampoco quiere arriesgarse a perder su fecha. Dos caminos ayudan aquí:",
    },
    {
      type: "ul",
      items: [
        `Firme primero el contrato. Le apartamos la fecha ${hold} días mientras lo revisamos, y no se cobra nada hasta que esté aprobado. ¿Quiere platicarlo? Pida una llamada rápida sobre el horario y qué paquete le conviene.`,
        `Empiece con la Sesión de retratos. Por ${usd(TIER_PRICE_USD.study)}, es nuestro paquete de solo foto: ${BASE_HOURS.study} horas con un fotógrafo, 60 fotos editadas y un video corto para redes sociales, con un depósito de ${retainerFor("study")}.`,
      ],
    },
    {
      type: "p",
      text: "En cualquiera de los dos casos, la meta es la misma: asegurar la fecha ahora, en condiciones que entienda, y no en el arrepentimiento del próximo año. Vea el [portafolio](/portfolio) para conocer nuestro trabajo, o compare todas las opciones en [los paquetes](/es#commissions).",
    },
    { type: "h2", text: "Por qué el calendario de pagos se relaciona con reservar 9 a 12 meses antes" },
    {
      type: "p",
      text: `En Dallas–Fort Worth, los mejores sábados de primavera y otoño se apartan con nueve a doce meses de anticipación. Reservar tan temprano logra dos cosas a la vez: asegura la fecha que su hija quiere y le da a su familia el mayor tiempo posible para juntar el saldo antes de que se pague, ${due} días antes. Si espera hasta unos pocos meses antes, ese mismo saldo tiene que juntarse mucho más rápido.`,
    },
    {
      type: "p",
      text: "Cuando esté lista, [revise si su fecha está disponible](/check-your-date) en unos segundos, vea si [Dallas](/es/fotografo-de-quinceaneras/dallas) es su zona, o lea [cuándo reservar a su fotógrafo de quinceañera](/es/blog/cuando-reservar-fotografo-quinceanera-dfw) para que el calendario no decida por usted.",
    },
  ],
  faqs: [
    {
      q: "¿Ofrecen planes de pago para la fotografía de quinceañera?",
      a: `TX Quince usa una estructura sencilla de dos pagos en lugar de mensualidades: un depósito del ${retainerPct} de su paquete aparta su fecha, y el resto se paga ${due} horas antes del evento. El depósito se aplica completo, así que no hay ningún costo adicional.`,
    },
    {
      q: "¿De cuánto es el depósito para apartar la fecha?",
      a: `Es el ${retainerPct} de su paquete: ${retainerFor("study")} para la Sesión de retratos (${usd(TIER_PRICE_USD.study)}), ${retainerFor("cinema")} para Foto + Video (${usd(TIER_PRICE_USD.cinema)}), ${retainerFor("production")} para la Celebración completa (${usd(TIER_PRICE_USD.production)}) y ${retainerFor("archive")} para la Celebración de dos días (${usd(TIER_PRICE_USD.archive)}).`,
    },
    {
      q: "¿El depósito es reembolsable?",
      a: "El depósito aparta su fecha y se abona a su total, por lo que no está pensado para devolverse si los planes cambian de su lado. Si TX Quince alguna vez tuviera que cancelar, su depósito se le devuelve por completo. Con cualquier estudio, pida la política por escrito antes de pagar.",
    },
    {
      q: "¿Cuándo se paga el resto?",
      a: `El resto se paga ${due} horas antes del evento.`,
    },
    {
      q: "¿Puedo guardar mi fecha antes de pagar?",
      a: `Sí. Firme el contrato en línea y le apartamos la fecha ${hold} días mientras lo revisamos. No se cobra nada hasta que esté aprobado; luego el depósito la asegura. ¿Tiene preguntas primero? Pida una llamada rápida.`,
    },
  ],
  related: [
    "cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth",
    "cuando-reservar-fotografo-quinceanera-dfw",
  ],
};

export default post;
