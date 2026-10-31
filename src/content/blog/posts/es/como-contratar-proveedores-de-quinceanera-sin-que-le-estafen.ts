import type { BlogPost } from "@/content/blog";
import { PT } from "@/lib/price-text";

/*
 * PILAR del grupo "Proteja su dinero" (src/content/blog-clusters.ts).
 * Cada caso es un reportaje publicado, con enlace. No se cita a nadie de
 * publicaciones privadas.
 */
const post: BlogPost = {
  slug: "como-contratar-proveedores-de-quinceanera-sin-que-le-estafen",
  title: "Cómo contratar proveedores para la quinceañera en Texas sin que le estafen",
  metaTitle: "Estafas en quinceañeras en Texas: cómo proteger su dinero",
  description:
    "Fotos que nunca llegan, salones que apartan la misma fecha dos veces, vestidos que no están listos. Lo que les pasó a familias reales en Texas, siete reglas para evitarlo y qué hacer si ya le está pasando.",
  category: "Planning",
  excerpt:
    "Las familias ahorran años para una sola noche. Estas son las formas reales en que familias de Texas han perdido dinero con proveedores, y las reglas sencillas que las habrían protegido.",
  publishedAt: "2026-10-31",
  readMinutes: 9,
  lang: "es",
  lead: "Las familias ahorran durante años para una sola noche, y la mayoría de los proveedores de quinceañeras son gente honesta y trabajadora. Pero cada año las noticias de Texas cuentan las mismas historias: una mamá que pagó fotos y video y sigue esperando meses después, un salón que cobró depósitos y dejó de contestar, un vestido que nunca llegó. Leímos esos reportajes para que usted no tenga que aprenderlo por las malas. Esto es lo que salió mal, las siete reglas que lo habrían evitado casi todo y exactamente qué hacer si ya le está pasando.",
  content: [
    { type: "h2", text: "Lo que de verdad sale mal" },
    {
      type: "p",
      text: "No son rumores de un grupo de Facebook. Cada caso lo reportó un canal de noticias, la mayoría aquí en Texas.",
    },
    { type: "h3", text: "1. Pagaron todo y las fotos nunca llegaron" },
    {
      type: "p",
      text: "En Dallas, una madre pagó más de $1,600 por fotos y video de los quince de su hija y más de seis meses después seguía esperando ([Univision 23 Dallas](https://www.univision.com/local/dallas-kuvn/localisimo/quinceanera-las-fotos-y-videos-por-las-que-pago-mas-de-1600-dolares)). En el Valle del Río Grande, una familia pagó más de $2,000 a una empresa que encontró en Facebook y casi un año después no tenía nada ([KRGV](https://www.krgv.com/news/empresa-del-valle-incumple-con-entrega-de-fotos-a-quincea-era/)). En Laredo, arrestaron a un hombre al que una familia le pagó fotos y video de unos XV años y nunca entregó nada ([El Mañana](https://elmanana.com.mx/laredo-texas/2026/5/26/detienen-martin-por-enganar-quinceanera-le-adelantan-pago-de-550-dolares-por-fotos-video-se-sordea-173232.html)).",
    },
    { type: "h3", text: "2. Llegaron tarde y no era lo que pagaron" },
    {
      type: "p",
      text: "Dos madres en San Diego recibieron las fotos unos nueve meses después de la fiesta y dijeron que no estaban editadas profesionalmente ni correspondían al paquete. Ninguna recibió el video ([Telemundo 20](https://www.telemundo20.com/responde/madre-san-diego-decepcionadas-con-fotos-quinceanera-mejor-tomaba-celular/2511646/)).",
    },
    { type: "h3", text: "3. El intermediario nunca le pagó al proveedor real" },
    {
      type: "p",
      text: "El paquete de limusina de una familia en San Francisco incluía $1,500 para fotos y video, pero la compañía nunca le pagó al fotógrafo, y la familia esperó un año por sus fotos ([ABC7](https://abc7news.com/post/sf-family-hires-quinceanera-photographer-never-gets-photos/5695017/)). En San José, acusaron de robo mayor a un organizador de eventos que cobró a varias familias y no les pagó a los salones ni a la comida ([NBC Bay Area](https://www.nbcbayarea.com/news/local/san-jose-event-planner-quinceanera-scam/3957744/)).",
    },
    { type: "h3", text: "4. El salón cobró el depósito y desapareció" },
    {
      type: "p",
      text: "En San Antonio, más de una docena de familias dijeron que un salón de eventos cobró miles de dólares y luego canceló, apartó su fecha a otra familia o dejó de responder ([KENS 5](https://www.kens5.com/article/features/producers-picks/customers-claim-san-antonio-event-center-has-taken-thousands-of-dollars-from-families/273-620619829)).",
    },
    { type: "h3", text: "5. El vestido no estuvo listo" },
    {
      type: "p",
      text: "Una mamá de McAllen se enteró una semana antes de los quince de sus gemelas que los vestidos no estarían listos, y la tienda al principio se negó a devolverle el dinero ([KRGV](https://www.krgv.com/videos/mother-devastated-after-shop-refuses-to-refund-late-quinceanera-dresses)). En Phoenix, la fiscalía de Arizona demandó a una tienda de vestidos de quince que cobró unos $44,000 en depósitos y luego cerró ([KJZZ](https://www.kjzz.org/2024-03-07/content-1873487-arizona-ag-says-quinceanera-dress-shop-took-44k-deposits-then-suddenly-closed)).",
    },
    { type: "h3", text: "6. No era quien decía ser" },
    {
      type: "p",
      text: "El cantante tejano Bobby Pulido advirtió que cuentas falsas usaban su nombre para cobrarles a familias por presentaciones en quinceañeras que él nunca aceptó ([Tejano Nation](https://tejanonation.net/2026/05/21/bobby-pulido-warns-fans-about-quinceanera-scam-accounts-charging-for-appearances/)). El mismo truco funciona con las fotos y el nombre de cualquier proveedor conocido.",
    },
    {
      type: "callout",
      text: "Casi siempre se repite el patrón: pago adelantado, nada por escrito, un proveedor que solo existe en redes sociales y ninguna fecha de entrega que se pueda exigir.",
    },

    { type: "h2", text: "Siete reglas que evitan casi todo" },
    {
      type: "ol",
      items: [
        "Pida un contrato por escrito antes de pagar cualquier cosa. Debe tener el nombre del negocio, su fecha, las horas, exactamente lo que recibe y cuándo lo recibe.",
        "Pida la fecha de entrega por escrito. \"En unos meses\" no es una fecha. Pregunte qué tendrá mientras tanto, como un adelanto para compartir con la familia.",
        "Pague un depósito para apartar la fecha, no todo con meses de anticipación. El depósito es normal con cualquier proveedor; pagar el 100% mucho antes de la fiesta es donde las familias se quedan atoradas.",
        "Pague de una forma que deje registro y le dé opciones. Los pagos con tarjeta permiten disputar el cargo; el efectivo y la mayoría de las transferencias por app no. Guarde cada recibo y captura de pantalla.",
        "Contrate al proveedor real, no un paquete. Si un salón, una limusina o un organizador \"incluye\" foto y video, pida el nombre y el contrato del fotógrafo, y confirme directamente con él que está reservado y pagado.",
        "Confirme que es real y que de verdad es esa persona. Pida galerías completas de quinceañeras enteras, no solo lo mejor, lea reseñas fuera de su propia página y escriba al sitio web o número oficial, no a una cuenta nueva en un grupo.",
        "Deje todo por escrito. Después de una llamada, mande un mensaje o correo que repita lo que acordaron.",
      ],
    },

    { type: "h2", text: "Señales para alejarse" },
    {
      type: "ul",
      items: [
        "Solo efectivo, o \"mándalo a mi cuenta personal\", sin recibo.",
        "Sin contrato, o un contrato sin fecha de entrega.",
        "Un precio muy por debajo de todos los demás por la misma cobertura.",
        "\"Este precio es solo por hoy.\"",
        "No le pueden enseñar una quinceañera completa, de principio a fin.",
        "Un negocio que solo existe como página de Facebook, sobre todo si ha cambiado de nombre.",
        "Respuestas lentas y vagas antes de que usted pague. Casi nunca mejora después.",
      ],
    },

    { type: "h2", text: "Si ya le está pasando" },
    {
      type: "p",
      text: "Empiece con calma y por escrito. La mayoría de los retrasos se resuelven en el primer paso, y todo lo demás funciona mejor cuando hay constancia.",
    },
    {
      type: "ol",
      items: [
        "Mande un mensaje por escrito con fecha límite: lo que pagó, lo que le prometieron y la fecha en que lo necesita.",
        "Si pagó con tarjeta, llame de inmediato a su banco y pregunte por una disputa. Los plazos son cortos y casi siempre cuentan desde la fecha del estado de cuenta, así que no espere.",
        "Ponga una queja en el Better Business Bureau (BBB). Muchos proveedores responden rápido cuando la reciben.",
        "Presente una queja de consumidor ante la oficina del Procurador General de Texas.",
        "Para el dinero que no pueda recuperar, las cortes de juez de paz de Texas atienden reclamos menores de hasta $20,000, y no necesita abogado ([Biblioteca Jurídica del Estado de Texas](https://guides.sll.texas.gov/small-claims)).",
        "Si un proveedor cobró y desapareció, haga un reporte con la policía. En el caso de Laredo, terminó en un arresto.",
      ],
    },
    {
      type: "callout",
      text: "Esta es una guía práctica basada en reportajes públicos, no asesoría legal. Si se trata de una cantidad grande, vale la pena una consulta corta con un abogado de protección al consumidor.",
    },

    { type: "h2", text: "Cómo lo hacemos en TX Quince" },
    {
      type: "p",
      text: `Usted firma un contrato por escrito antes de cualquier pago. Un depósito del ${PT.deposit.percent} asegura su fecha y el resto se paga ${PT.balanceDays} días antes de la fiesta, nunca con meses de anticipación. Su día lo cubre nuestro propio equipo, no personas que conseguimos a última hora, y los dos dueños editan cada galería y cada película. Todo lo que entregamos es suyo para guardar, imprimir y compartir. Nuestros [precios están publicados](/es#commissions) y también las [preguntas que creemos que debe hacerle a cualquier fotógrafo](/es/blog/preguntas-para-tu-fotografo-de-quinceanera), incluso a nosotros.`,
    },
    {
      type: "cta",
      heading: "Primero, un plan por escrito",
      body: "Díganos la fecha y los colores y reciba un plan privado con nuestro trabajo, la disponibilidad de su fecha y todos los precios, antes de hablar de dinero con nadie.",
      href: "/es/plan?src=blog-proveedores",
      label: "Recibir mi plan de quince gratis",
    },
  ],
  faqs: [
    {
      q: "¿Cómo funcionan casi siempre las estafas con proveedores de quinceañera?",
      a: "La mayoría de los casos reportados siguen un patrón: un proveedor encontrado en redes sociales cobra todo por adelantado, muchas veces en efectivo o por transferencia, sin contrato ni fecha de entrega, y luego se retrasa y deja de responder. Los paquetes donde un intermediario cobra por otro proveedor son otra forma común de perder dinero.",
    },
    {
      q: "¿Es normal pagar un depósito al fotógrafo de quinceañera?",
      a: "Sí. Un depósito para apartar la fecha es normal con fotógrafos, salones, DJ y tiendas de vestidos. Lo arriesgado es pagar el total mucho antes del evento sin un contrato que diga qué recibirá y cuándo.",
    },
    {
      q: "¿Qué debe incluir el contrato de fotografía de quinceañera?",
      a: "El nombre del negocio, su fecha y horario, quién cubre el evento, exactamente lo que recibirá (cantidad de fotos editadas, duración del video), la fecha de entrega, el calendario de pagos y qué pasa si alguna de las partes cancela.",
    },
    {
      q: "¿Qué hago si el fotógrafo de la quinceañera nunca entregó las fotos en Texas?",
      a: "Mande una demanda por escrito con fecha límite, dispute el cargo con su banco cuanto antes si pagó con tarjeta, ponga quejas en el BBB y ante el Procurador General de Texas y, si hace falta, presente un reclamo en la corte de juez de paz, que atiende casos de hasta $20,000 en Texas sin necesidad de abogado.",
    },
  ],
  related: [
    "preguntas-para-tu-fotografo-de-quinceanera",
    "planes-de-pago-fotografia-quinceanera-dfw",
    "como-elegir-fotografo-de-quinceanera-dfw",
  ],
};

export default post;
