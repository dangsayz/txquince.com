import type { BlogPost } from "@/content/blog";
import {
  TIER_PRICE_USD,
  RETAINER,
  CONSULT_HOLD_DAYS,
  quoteCommission,
  usd,
} from "@/lib/commission";

const retainerPct = `${Math.round(RETAINER.rate * 100)}%`;
const retainerFloor = usd(RETAINER.floorUsd);
const due = RETAINER.balanceDueDays;
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
    "Un anticipo aparta la fecha y el saldo se paga poco antes de la celebración. Así funcionan los depósitos y anticipos en DFW, y cómo guardar su fecha mientras decide.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 7,
  lang: "es",
  lead: "Cuando ve el precio de la fotografía de quinceañera en un solo número, parece un muro. No lo es. Casi ninguna familia paga el total el día que reserva: usted aparta la fecha con un depósito o anticipo, y el saldo se paga más cerca de la celebración. Aquí le explicamos cómo funciona eso en Dallas–Fort Worth y en TX Quince, en pasos sencillos, para que pueda reservar con confianza.",
  content: [
    { type: "h2", text: "¿Tiene que pagar todo por adelantado? No" },
    {
      type: "p",
      text: `La respuesta corta es no. En TX Quince usted aparta su fecha con un anticipo del ${retainerPct} de su comisión, y el saldo se paga ${due} días antes de la quinceañera. Eso es todo: dos pagos, los dos claros desde el día en que reserva, para que nada del costo la tome por sorpresa después.`,
    },
    {
      type: "callout",
      text: "El anticipo no es un cargo adicional. Se aplica completo al total de su comisión, así que simplemente se convierte en su primer pago del mismo precio publicado.",
    },
    { type: "h2", text: "¿De cuánto es el depósito o anticipo para apartar la fecha?" },
    {
      type: "p",
      text: `En el área de Dallas–Fort Worth, cada estudio lo maneja distinto: algunos piden un depósito fijo de unos cientos de dólares y otros piden un porcentaje del total, muchas veces alrededor de un tercio. En [TX Quince](/es#commissions), el anticipo es el ${retainerPct} de su comisión, con un mínimo de ${retainerFloor}:`,
    },
    {
      type: "ul",
      items: [
        `I. Estudio de retrato (${usd(TIER_PRICE_USD.study)}): anticipo de ${retainerFor("study")} para apartar su fecha.`,
        `II. Cine y fotografía (${usd(TIER_PRICE_USD.cinema)}): anticipo de ${retainerFor("cinema")} para apartar su fecha.`,
        `III. La producción completa (${usd(TIER_PRICE_USD.production)}): anticipo de ${retainerFor("production")} para apartar su fecha.`,
        `IV. Archivo editorial de varios días (${usd(TIER_PRICE_USD.archive)}): anticipo de ${retainerFor("archive")} para apartar su fecha.`,
      ],
    },
    {
      type: "p",
      text: "Si agrega un extra, el total sube y el anticipo sigue el mismo porcentaje. ¿Quiere ver con detalle qué incluye cada comisión antes de decidir? Revise [las comisiones](/es#commissions) o lea nuestra [guía completa de cuánto cuesta un fotógrafo de quinceañera](/es/blog/cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth).",
    },
    { type: "h2", text: "Cómo funcionan el anticipo y el saldo" },
    {
      type: "p",
      text: "El ritmo es este, y lo hicimos a propósito sencillo, porque lo último que necesita un año de organizar una quinceañera es una cuenta más que confunda.",
    },
    {
      type: "ol",
      items: [
        "Elija su comisión y los extras que quiera: el total está publicado, así que lo ve antes de pagar nada.",
        `Reserve en línea con el anticipo del ${retainerPct} mediante pago seguro. Su fecha sale del calendario en cuanto se recibe el pago.`,
        "El anticipo se aplica completo a su total, así que lo que queda es el saldo, sin nada agregado.",
        `El saldo se paga ${due} días antes de la celebración, para que todo quede liquidado con tiempo antes del gran día.`,
      ],
    },
    {
      type: "p",
      text: `Algunos estudios de DFW ofrecen planes de pago mensuales; si eso le importa, pregunte a cualquier estudio cuántos pagos son, cuándo cae el último y si el plan cuesta más que pagar de contado. Nuestra estructura es sencilla a propósito: un anticipo ahora y el saldo ${due} días antes.`,
    },
    { type: "h2", text: "Qué asegura el anticipo (y qué preguntar sobre reembolsos)" },
    {
      type: "p",
      text: "El anticipo cumple una función importante: saca su fecha del calendario para que ninguna otra familia pueda apartarla. Un equipo solo puede estar en un lugar un sábado dado, así que el anticipo es lo que reserva a sus directores, sus horas de cobertura y su lugar.",
    },
    {
      type: "p",
      text: "¿El depósito o anticipo es reembolsable? Cada estudio tiene su política, así que pida las condiciones por escrito antes de pagar. En general, el anticipo aparta una fecha por la que el estudio deja de aceptar a otras familias, así que no está pensado para devolverse si los planes cambian de su lado. Lo que siempre debe tener por escrito es qué pasa si el estudio le cancela a usted: en TX Quince, si alguna vez tuviéramos que cancelar, su anticipo se le devuelve por completo.",
    },
    {
      type: "quote",
      text: "El anticipo protege su fecha. El precio publicado protege su presupuesto. Las condiciones por escrito la protegen de sorpresas.",
    },
    {
      type: "cta",
      heading: "Aparte su fecha, o platique con nosotros primero",
      body: `Pague el anticipo del ${retainerPct} mediante pago seguro para apartar su fecha, o pida una consulta y le guardamos la fecha ${hold} días mientras platicamos.`,
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
        `Pida primero una consulta. Cuéntenos su fecha y lo que se imagina, y le guardamos la fecha ${hold} días mientras hablamos de la cobertura, el horario y qué comisión le conviene, sin pagar nada para empezar.`,
        `Empiece con el Estudio de retrato. Por ${usd(TIER_PRICE_USD.study)}, es nuestra comisión de solo foto: una sesión editorial de retrato de tres horas antes de la celebración, 60 fotos retocadas y un retrato en movimiento, con un anticipo de ${retainerFor("study")}.`,
      ],
    },
    {
      type: "p",
      text: "En cualquiera de los dos casos, la meta es la misma: asegurar la fecha ahora, en condiciones que entienda, y no en el arrepentimiento del próximo año. Vea el [portafolio](/portfolio) para conocer nuestro trabajo, o compare todas las opciones en [las comisiones](/es#commissions).",
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
      a: `TX Quince usa una estructura sencilla de dos pagos en lugar de mensualidades: un anticipo del ${retainerPct} de su comisión (mínimo ${retainerFloor}) aparta su fecha, y el saldo se paga ${due} días antes de la celebración. El anticipo se aplica completo, así que no hay ningún costo adicional.`,
    },
    {
      q: "¿De cuánto es el anticipo para apartar la fecha?",
      a: `Es el ${retainerPct} de su comisión, con un mínimo de ${retainerFloor}: ${retainerFor("study")} para el Estudio de retrato (${usd(TIER_PRICE_USD.study)}), ${retainerFor("cinema")} para Cine y fotografía (${usd(TIER_PRICE_USD.cinema)}), ${retainerFor("production")} para La producción completa (${usd(TIER_PRICE_USD.production)}) y ${retainerFor("archive")} para el Archivo editorial de varios días (${usd(TIER_PRICE_USD.archive)}).`,
    },
    {
      q: "¿El anticipo es reembolsable?",
      a: "El anticipo aparta su fecha y se aplica a su saldo, por lo que no está pensado para devolverse si los planes cambian de su lado. Si TX Quince alguna vez tuviera que cancelar, su anticipo se le devuelve por completo. Con cualquier estudio, pida la política por escrito antes de pagar.",
    },
    {
      q: "¿Cuándo se paga el saldo?",
      a: `El saldo se paga ${due} días antes de la celebración, para que todo quede liquidado con tiempo antes del gran día.`,
    },
    {
      q: "¿Puedo guardar mi fecha antes de pagar?",
      a: `Sí. Pida primero una consulta y le guardamos la fecha ${hold} días mientras platicamos de la cobertura y de qué comisión le conviene. Cuando esté lista, el anticipo la asegura.`,
    },
  ],
  related: [
    "cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth",
    "cuando-reservar-fotografo-quinceanera-dfw",
  ],
};

export default post;
