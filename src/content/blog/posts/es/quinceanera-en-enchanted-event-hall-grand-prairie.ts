import type { BlogPost } from "@/content/blog";
import { PT } from "@/lib/price-text";

/*
 * BORRADOR — not registered yet. Spanish twin of
 * quinceanera-at-enchanted-event-hall-grand-prairie.ts. Fill the same PHOTO
 * SLOTS and EVENT STORY, then register both together (see the EN file).
 */

const study = PT.price.study;
const solo = PT.price.solo;
const cinema = PT.price.cinema;
const trio = PT.price.trio;

const post: BlogPost = {
  slug: "quinceanera-en-enchanted-event-hall-grand-prairie",
  title: "Quinceañera en Enchanted Event Hall, Grand Prairie: fotos y guía",
  description:
    "Guía para celebrar una quinceañera en Enchanted Event Hall, en South Carrier Parkway en Grand Prairie: capacidad, la entrada, consejos de fotografía y preguntas para el recorrido.",
  category: "Locations",
  excerpt:
    "Enchanted Event Hall en Grand Prairie: capacidad, la entrada con puertas de hierro, consejos para las fotos y preguntas para el recorrido.",
  publishedAt: "2026-11-08",
  readMinutes: 6,
  lang: "es",
  venues: ["enchanted-event-hall"],
  lead: "Enchanted Event Hall es un salón de eventos en 3005 S Carrier Pkwy, Suite 112, en Grand Prairie, entre Arlington y el sur de Dallas. Desde el estacionamiento parece un local de plaza comercial; al cruzar sus puertas de hierro en arco es un salón completo para quinceañera. Fotografiamos una quinceañera ahí este mes, así que esta guía cubre lo que las familias quieren saber antes de reservar: qué es el salón, para cuántos invitados alcanza, qué preguntar en el recorrido y cómo planear la noche para que salga bien en fotos.",
  content: [
    // FOTO — portada.
    { type: "h2", text: "Qué es Enchanted Event Hall y para quién es" },
    {
      type: "p",
      text: "Enchanted Event Hall está en una plaza comercial sobre South Carrier Parkway, en el sur de Grand Prairie, cerca de la I-20 y la Highway 360. Queda cómodo para familias de Arlington, Mansfield, Cedar Hill, Duncanville y Oak Cliff. Según su anuncio, el salón recibe hasta 200 invitados sentados (250 de pie), un tamaño mediano para una quinceañera en DFW.",
    },
    {
      type: "ul",
      items: [
        "Dirección: 3005 S Carrier Pkwy, Suite 112, Grand Prairie, TX 75052",
        "Capacidad: hasta 200 sentados y 250 de pie, según el salón",
        "Estacionamiento: en el lote de la plaza; no hay valet",
        "Cerca: nuestra página de [fotógrafo de quinceañeras en Grand Prairie](/es/fotografo-de-quinceaneras/grand-prairie) cubre iglesias y lugares para fotos de la zona",
      ],
    },
    { type: "h2", text: "La entrada: letras doradas, cordones rojos y puertas de hierro" },
    {
      type: "p",
      text: "El frente del edificio ayuda más que en muchos salones. Un letrero grande en letra cursiva dorada y blanca dice \"Enchanted Event Hall\", el personal pone postes dorados con cordones de terciopelo rojo, y la entrada es un par de puertas de hierro negro en arco. De noche, la luz de color se ve a través del vidrio. Es una alfombra roja lista para la llegada: la quinceañera bajando del carro, la corte a los lados de los cordones, la familia entrando junta.",
    },
    // FOTO — la llegada en las puertas de hierro.
    { type: "h2", text: "Nuestra quinceañera en Enchanted Event Hall" },
    // HISTORIA — llenar con detalles reales de Dang. Sin nombres.
    {
      type: "p",
      text: "TX Quince fotografió una quinceañera en Enchanted Event Hall en noviembre de 2026. Conocer el salón antes del día importa: dónde se ve mejor la entrada, dónde pararse para el vals y el baile sorpresa, y cuándo tomar las fotos familiares sin quitarle a la quinceañera su propia fiesta.",
    },
    // FOTOS + VIDEO.
    { type: "h2", text: "Cuánto cuesta una quinceañera en Enchanted Event Hall" },
    {
      type: "p",
      text: "Enchanted Event Hall no publica precios en línea; la cotización llega al final del recorrido, algo normal en los salones de DFW. El precio cambia con tu número de invitados, el día de la semana (los sábados cuestan más) y lo que incluye el paquete: mesas, mantelería, comida, DJ y decoración. Pide la cotización desglosada además del precio del paquete.",
    },
    {
      type: "p",
      text: `Lo que cobre el salón, la foto y el video son una línea aparte y fija. Nuestros [paquetes](/es#commissions) están publicados en ${study}, ${solo}, ${cinema} y ${trio}, y un depósito del ${PT.deposit.percent} asegura la fecha cuando se aprueba tu contrato, con el resto ${PT.balanceDays} días antes del evento. No hay cargo por traslado a Grand Prairie.`,
    },
    { type: "h2", text: "Preguntas para tu recorrido" },
    {
      type: "ol",
      items: [
        "¿Qué incluye exactamente el paquete y cómo se ve desglosado?",
        "¿Cuál es la capacidad real sentados, con pista de baile, para mi número de invitados?",
        "¿Puedo traer mi propio equipo de foto y video sin cargo extra?",
        "¿A qué hora tenemos acceso, cuándo entran los proveedores y a qué hora se termina?",
        "¿Cómo funcionan los depósitos y qué pasa si necesitamos cambiar la fecha?",
      ],
    },
    {
      type: "cta",
      heading: "¿Celebras en Enchanted Event Hall?",
      body: "Ya fotografiamos una quinceañera en este salón. Revisa tu fecha antes de que se llenen los sábados.",
      href: "/check-your-date?venue=enchanted-event-hall",
      label: "Revisa tu fecha",
    },
  ],
};

export default post;
