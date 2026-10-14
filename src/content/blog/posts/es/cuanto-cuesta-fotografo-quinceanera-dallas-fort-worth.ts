import type { BlogPost } from "@/content/blog";
import {
  TIER_PRICE_USD,
  ADD_ON_PRICE_USD,
  RETAINER,
  CONSULT_HOLD_DAYS,
  BASE_CREW,
  usd,
} from "@/lib/commission";

const study = usd(TIER_PRICE_USD.study);
const cinema = usd(TIER_PRICE_USD.cinema);
const production = usd(TIER_PRICE_USD.production);
const archive = usd(TIER_PRICE_USD.archive);
const retainerPct = `${Math.round(RETAINER.rate * 100)}%`;
const retainerFloor = usd(RETAINER.floorUsd);

const post: BlogPost = {
  slug: "cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth",
  title: "¿Cuánto cuesta un fotógrafo de quinceañera en Dallas–Fort Worth?",
  metaTitle:
    "¿Cuánto cuesta un fotógrafo de quinceañera en Dallas–Fort Worth? Precios 2026",
  description:
    "Precios reales 2026 de fotografía y video de quinceañera en Dallas–Fort Worth: rangos del mercado, qué incluye cada comisión, foto o video, el anticipo y cómo evitar costos ocultos.",
  category: "Cost & Budget",
  excerpt:
    "Lo que cobran de verdad los estudios de DFW, qué incluye cada comisión publicada y qué sube o baja el costo — sin el juego de “escríbanos para cotizar”.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 7,
  lang: "es",
  lead: "Si ya empezó a llamar estudios, seguro notó el problema: la mitad no le dice un precio hasta que llene un formulario. Esta guía pone los números sobre la mesa — cuánto cobra el mercado de Dallas–Fort Worth, qué incluye cada una de nuestras comisiones y qué cambia el total — para que pueda presupuestar la quinceañera de su hija con tranquilidad y sin sorpresas.",
  content: [
    { type: "h2", text: "La respuesta corta" },
    {
      type: "p",
      text: `En Dallas–Fort Worth, la mayoría de los estudios de quinceañera publican paquetes de solo foto de unos $1,500 a $3,000, y de foto y video de unos $3,000 a $5,500. Las colecciones de lujo para quinceañera van de $5,500 a $8,000 o más, y como referencia, la foto y el video de una boda de lujo en Dallas promedian unos $10,000. En [TX Quince](/es#commissions) las comisiones están publicadas en el sitio, sin formulario de cotización: Estudio de retrato (${study}), Cine y fotografía (${cinema}), La producción completa (${production}) y Archivo editorial de varios días (${archive}).`,
    },
    {
      type: "p",
      text: "Y el precio es el mismo en todo el metroplex — su comisión cuesta igual ya sea que la quinceañera sea en [Irving](/es/fotografo-de-quinceaneras/irving), [Arlington](/es/fotografo-de-quinceaneras/arlington) o [Garland](/es/fotografo-de-quinceaneras/garland), sin recargo por el salón y sin cotización sorpresa.",
    },
    {
      type: "callout",
      text: "Por qué tantos estudios esconden el precio: así pueden cotizarle distinto a cada familia. El precio fijo y publicado es el modelo más justo — usted sabe lo que paga todo el mundo antes de siquiera escribir.",
    },
    { type: "h2", text: "Qué está pagando en realidad" },
    {
      type: "p",
      text: "El número de un plan es en realidad cuatro cosas juntas: las horas de cobertura, cuántos artistas trabajan ese día, si recibe video además de fotos, y cómo se entrega el trabajo final.",
    },
    {
      type: "ul",
      items: [
        "Horas de cobertura — el día de unos quince es largo: el arreglo, la misa de acción de gracias, las fotos formales y la fiesta. La cobertura de día completo es la diferencia entre un resumen y la historia entera.",
        `Un artista o un equipo dirigido — ${BASE_CREW.cinema} directores en Cine y fotografía, ${BASE_CREW.production} más una coordinadora del día en La producción completa, repartidos entre foto y video como usted prefiera — significa que la iglesia y la entrada al salón quedan cubiertas al mismo tiempo, con ángulos opuestos que una sola cámara no puede inventar.`,
        "Foto, o foto y video — el video es un oficio aparte y una edición aparte. Una comisión con ambos son dos narradores, no una persona haciendo malabares con la cámara y el tripié.",
        "Entrega — una galería privada en línea, la película editada y los reels y, en las comisiones mayores, un libro encuadernado en lino y el archivo completo sin editar.",
      ],
    },
    { type: "h2", text: "¿Solo foto, o foto y video?" },
    {
      type: "p",
      text: `Esta es la decisión que más mueve el precio — y el arrepentimiento más común. Las familias que reservan solo foto, después, suelen desear haber tenido [el vals y el baile sorpresa](/portfolio) en video. El vals, los chambelanes y las damas, el cambio de zapatillas, el brindis: son momentos que se viven en movimiento. Nuestro Estudio de retrato (${study}) es solo foto — una sesión editorial de retrato de tres horas antes de la celebración — y todas las comisiones desde ${cinema} combinan foto y video. Compárelas lado a lado en [las comisiones](/es#commissions); la mayoría de las familias elige La producción completa (${production}). Y si quiere profundizar, lea [foto o video para la quinceañera](/es/blog/foto-o-video-quinceanera).`,
    },
    { type: "h2", text: "El anticipo y el saldo" },
    {
      type: "p",
      text: `No paga todo por adelantado. Un anticipo del ${retainerPct} de su comisión (mínimo ${retainerFloor}) aparta su fecha y se aplica completo a su total; el saldo se paga ${RETAINER.balanceDueDays} días antes de la celebración. Puede reservar en línea con el anticipo mediante pago seguro, o pedir primero una consulta y le guardamos la fecha ${CONSULT_HOLD_DAYS} días mientras platicamos. Vea cómo funciona [el anticipo paso a paso](/es/blog/planes-de-pago-fotografia-quinceanera-dfw).`,
    },
    {
      type: "cta",
      heading: "Vea cada comisión y todo lo que incluye",
      body: "Precios publicados, inclusiones completas y extras, todo en una página.",
      href: "/es#commissions",
      label: "Comparar comisiones",
    },
    { type: "h2", text: "Qué sube el precio (y qué no debería)" },
    {
      type: "ul",
      items: [
        `Sube: agregar video, un equipo más grande, más horas de cobertura, un segundo día, o extras como una sesión de retrato en otro destino (${usd(ADD_ON_PRICE_USD.destination)}) o una edición de la fiesta el mismo día (${usd(ADD_ON_PRICE_USD.sameday)}).`,
        "Sube un poco: viajar lejos del área metropolitana (dentro de DFW normalmente no hay cargo por traslado).",
        "No cambia el precio con un estudio honesto: su salón, el número de invitados o el día de la semana — desconfíe de quien cotice por eso.",
      ],
    },
    {
      type: "callout",
      text: "En TX Quince no le cobramos por número de invitados ni por el día de la semana. Un sábado de octubre cuesta lo mismo que un domingo de marzo. El precio publicado es el precio.",
    },
    { type: "h2", text: "Cómo presupuestar sin arrepentirse" },
    {
      type: "ol",
      items: [
        "Decida primero solo foto o foto y video — eso define todo su rango de precio.",
        "Reserve al fotógrafo temprano; las mejores fechas se van con 9 a 12 meses de anticipación, y el anticipo congela tanto la fecha como el precio de hoy.",
        "Cuente con que la foto y el video ocupen más o menos del 8 al 15% del presupuesto total de la fiesta — es la proporción que le da la mayoría de las familias.",
        "Compare galerías completas, no solo videos de momentos destacados — pida ver unos quince de principio a fin.",
      ],
    },
    {
      type: "p",
      text: "Cuando esté lista, puede [verificar si su fecha está disponible](/check-your-date) en unos segundos, o leer [cuándo reservar a su fotógrafo](/es/blog/cuando-reservar-fotografo-quinceanera-dfw) para no perder su sábado. Si busca cobertura local, conozca a nuestro [fotógrafo de quinceañeras en Dallas](/es/fotografo-de-quinceaneras/dallas) y en [Fort Worth](/es/fotografo-de-quinceaneras/fort-worth). Para apartar su fecha, vaya directo a [reservar](/es#intake).",
    },
  ],
  faqs: [
    {
      q: "¿Cuánto debo presupuestar para la fotografía de quinceañera en DFW?",
      a: `La mayoría de los estudios de DFW publican solo foto entre unos $1,500 y $3,000, y foto y video entre unos $3,000 y $5,500; las colecciones de lujo van de $5,500 a $8,000 o más. TX Quince publica cuatro comisiones: ${study} (solo foto), ${cinema}, ${production} y ${archive}.`,
    },
    {
      q: "¿Necesito fotógrafo y videógrafo?",
      a: "No es obligatorio tener ambos, pero los momentos que las familias más lamentan no haber filmado —el vals, el baile sorpresa, el brindis— son justo los que cobran vida en video. Si su presupuesto lo permite, un equipo combinado de foto y video captura los dos sin tener que coordinar dos proveedores distintos.",
    },
    {
      q: "¿Con cuánta anticipación debo reservar?",
      a: "Lo ideal en Dallas–Fort Worth es de nueve a doce meses, sobre todo para los sábados de primavera y otoño. Reservar temprano asegura tanto su fecha como el precio actual.",
    },
    {
      q: "¿Cómo funciona el anticipo?",
      a: `El anticipo es el ${retainerPct} de su comisión (mínimo ${retainerFloor}). Aparta su fecha y se aplica completo a su total, y el saldo se paga ${RETAINER.balanceDueDays} días antes de la celebración. ¿Prefiere platicar primero? Pida una consulta y le guardamos la fecha ${CONSULT_HOLD_DAYS} días.`,
    },
    {
      q: "¿Cobran más por número de invitados o por el salón?",
      a: "No. El precio publicado no depende de cuántos invitados tenga ni del salón que elija. Lo que sí mueve el costo es agregar video, un equipo más grande, más horas o un extra. Si un estudio cotiza por invitados o por el día de la semana, tome eso como una señal de alerta.",
    },
  ],
  related: [
    "foto-o-video-quinceanera",
    "cuando-reservar-fotografo-quinceanera-dfw",
    "planes-de-pago-fotografia-quinceanera-dfw",
  ],
};

export default post;
