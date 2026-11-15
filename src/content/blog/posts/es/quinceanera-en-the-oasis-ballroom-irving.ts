import type { BlogPost } from "@/content/blog";
import { PT } from "@/lib/price-text";

// Guía del salón. Los datos (dirección, salones, capacidad, catering externo,
// pisos, cortinas, remodelación 2019, teléfono, sitio) vienen de los anuncios
// públicos del salón en The Vendry y Eventective, revisados el 14 nov 2026. La
// portada es foto propia de la entrada. No se cita calificación: ninguna fuente la da.
const study = PT.price.study;
const solo = PT.price.solo;
const cinema = PT.price.cinema;
const trio = PT.price.trio;

const post: BlogPost = {
  slug: "quinceanera-en-the-oasis-ballroom-irving",
  lang: "es",
  title: "Quinceañera en The Oasis Ballroom, Irving: salones, precios y fotos",
  metaTitle: "Quinceañera en The Oasis Ballroom, Irving | Guía",
  description:
    "¿Planea su quinceañera en The Oasis Ballroom en Irving? Sus tres salones (de 80 a 400 invitados sentados), cómo funcionan los precios, qué preguntar y cómo planear las fotos.",
  category: "Locations",
  excerpt:
    "Tres salones bajo un mismo letrero en West Airport Freeway, desde uno para 80 personas hasta uno para 400. Qué es The Oasis Ballroom, qué salón le queda a su lista de invitados y cómo lograr que se vea bien en las fotos.",
  publishedAt: "2026-11-14",
  readMinutes: 6,
  venues: ["the-oasis-ballroom"],
  related: [
    "quinceanera-rosa-y-dorado-convention-plaza-ballroom-irving",
    "salones-para-quinceaneras-dfw",
    "cuanto-cuesta-una-quinceanera-presupuesto-texas",
  ],
  lead: "The Oasis Ballroom es un salón de eventos en 3225 W Airport Fwy, Suite 200, en Irving, con tres salones para 80 a 400 invitados sentados. Ya hemos fotografiado celebraciones aquí más de una vez. Esta guía responde lo que las familias nos preguntan antes de reservarlo: qué salón les queda, cómo funcionan los precios, qué preguntar en el recorrido y cómo planear la noche para que el salón se vea tan bien en las fotos como en persona.",
  content: [
    {
      type: "image",
      slug: "oasis-ballroom-irving-entrance-sign-dusk",
      alt: "El letrero iluminado de The Oasis Ballroom sobre las puertas de vidrio de la Suite 200, entre dos torres de ladrillo en arco con faroles, bajo un cielo azul al atardecer en West Airport Freeway, Irving",
      caption: "La entrada al atardecer, sobre West Airport Freeway en Irving.",
    },
    { type: "h2", text: "Qué es The Oasis Ballroom" },
    {
      type: "p",
      text: "The Oasis Ballroom está sobre West Airport Freeway (la carretera 183) en Irving, en la zona de Belt Line, cerca para familias de Irving, Grand Prairie, Euless, Arlington y el noroeste de Dallas. Aquí se celebran quinceañeras, bodas y cumpleaños. Desde el estacionamiento se ve el letrero iluminado, dos torres de ladrillo en arco con faroles y las puertas de vidrio con el número 200. Adentro hay tres salones separados, así que puede haber más de un evento la misma noche.",
    },
    {
      type: "ul",
      items: [
        "Dirección: 3225 W Airport Fwy, Suite 200, Irving, TX 75062",
        "Salones: tres, de unos 1,500 a 10,000 pies cuadrados, según el salón",
        "Capacidad mayor: 400 invitados sentados, en el Sahara Room",
        "Detalles anunciados: pisos de madera, cortinas en el techo, cuarto frío, acceso para sillas de ruedas",
        "Remodelado: 2019, según su anuncio",
        "Teléfono: (214) 519-3320",
        "En línea: theoasisballroom.com y @theoasisballroom en Instagram",
      ],
    },
    { type: "h2", text: "Qué salón le queda a su lista de invitados" },
    {
      type: "p",
      text: "Los anuncios del salón dan la capacidad máxima sentada de cada salón. Son máximos. Una quinceañera necesita pista de baile, mesa principal, cabina del DJ y espacio para que la corte se mueva, así que calcule menos lugares que el número en papel.",
    },
    {
      type: "ul",
      items: [
        "Sahara Room: hasta 400 sentados. Para una quince grande con corte completa.",
        "Arabian Room: hasta 300 sentados. El tamaño mediano, donde cae la mayoría de las listas de invitados en DFW.",
        "Mojave Room: hasta 80 sentados. Pequeño: una celebración solo con familia, una cena después de la misa o un cumpleaños.",
      ],
    },
    {
      type: "p",
      text: "Pida a la coordinadora el plano del salón con su número real de invitados y la pista de baile puesta. Si está cerca del máximo de un salón, vea el siguiente más grande. Reservar un salón donde apenas cabe su lista es el arrepentimiento más común que escuchamos.",
    },
    { type: "h2", text: "Cuánto cuesta una quinceañera en The Oasis Ballroom" },
    {
      type: "p",
      text: "The Oasis Ballroom no publica precios. La cotización se da después del recorrido, algo normal en los salones de DFW. El número cambia según el salón, el día (los sábados cuestan más en todas partes), las horas y lo que incluye el paquete. Su anuncio dice que se permite catering externo, así que puede comparar banquetes en vez de aceptar un solo menú. Pida la cotización desglosada para compararla bien con otros salones.",
    },
    {
      type: "p",
      text: `Las fotos y el video son una línea aparte y fija. Nuestros [paquetes](/es#commissions) están publicados en ${study}, ${solo}, ${cinema} y ${trio}. Un depósito del ${PT.deposit.percent} aparta su fecha cuando se aprueba su contrato, y el resto se paga ${PT.balanceDays} días antes del evento. La cotización del salón es la que cambia; la cobertura no tiene por qué.`,
    },
    { type: "h2", text: "Cómo lograr que The Oasis Ballroom salga bien en las fotos" },
    {
      type: "p",
      text: "Un salón de baile es primero un lugar de fiesta. Las familias que reciben las mejores galerías en un salón así planean cuatro cosas:",
    },
    {
      type: "ol",
      items: [
        "Aprovechen la entrada al atardecer. Las torres de ladrillo y el letrero iluminado dan una gran foto de llegada con la última luz, como la foto al inicio de esta página. Planeen la llegada de la limosina o de la familia cerca de la puesta del sol y tendremos a la quinceañera, su vestido y el nombre del salón en una sola foto.",
        "Pregunten por la iluminación de colores. Los colores fuertes se ven increíbles en persona, pero en cámara pintan la piel de verde o morado. Pidan luz cálida o neutral para la entrada, el vals y el pastel, y dejen los colores para la pista.",
        "Hagan los retratos antes de la fiesta. El vestido merece luz de día. Una [sesión pre-quince](/es/blog/sesion-de-fotos-pre-quince-dfw), o retratos más temprano ese día, deja que el salón solo cargue con la celebración. El [Mandalay Canal Walk en Las Colinas](/es/blog/quinceanera-vestido-negro-floral-canal-mandalay-las-colinas) también está en Irving y funciona muy bien.",
        "Pongan los momentos grandes dentro de las horas de cobertura. Entrada, vals, coronación, brindis, baile sorpresa: armen el programa con la coordinadora y su fotógrafo juntos, para que nada pase cuando las cámaras ya se fueron.",
      ],
    },
    // Photo slot. Renders nothing until the album "oasis-ballroom-irving"
    // exists in src/content/albums.ts; then up to 24 photos appear here, in
    // EN and ES. Event 2026-11-14; photos are delivered about 30 days later.
    { type: "gallery", album: "oasis-ballroom-irving", limit: 24 },
    { type: "h2", text: "Preguntas para su recorrido en The Oasis Ballroom" },
    {
      type: "ol",
      items: [
        "¿Qué salón me recomienda para mi número de invitados con pista de baile, y puedo ver ese plano?",
        "¿Qué incluye el paquete: mesas, sillas, mantelería, cortinas, DJ, seguridad, limpieza? ¿Cómo se ve la cotización desglosada?",
        "Se permite catering externo. ¿Hay cargos o reglas para la comida, la barra o el pastel?",
        "¿Puedo traer mi propio fotógrafo y equipo de video sin cargo de proveedor? Por favor, por escrito.",
        "¿A qué hora nos entregan el salón, cuándo pueden entrar los proveedores y cuál es la hora final?",
        "¿Habrá otro evento en los otros salones esa misma noche, y cómo funcionan entonces las entradas y el estacionamiento?",
        "¿Cómo funcionan los depósitos y pagos, y qué pasa si necesitamos cambiar la fecha?",
      ],
    },
    { type: "h2", text: "Más salones para quinceañeras en Irving" },
    {
      type: "p",
      text: "¿Está comparando salones en Irving? Vea una [quinceañera rosa y dorado en Convention Plaza Ballroom](/es/blog/quinceanera-rosa-y-dorado-convention-plaza-ballroom-irving), nuestra página de [fotografía de quinceañeras en Irving](/es/fotografo-de-quinceaneras/irving) y la [guía de salones para quinceañeras en DFW](/es/blog/salones-para-quinceaneras-dfw). Después junte todos los números con [cuánto cuesta una quinceañera en Texas](/es/blog/cuanto-cuesta-una-quinceanera-presupuesto-texas).",
    },
    {
      type: "cta",
      heading: "¿Celebra en The Oasis Ballroom?",
      body: "Escriba su presupuesto y vea qué paquete de foto y video le queda, con todos los precios publicados. Enviar una solicitud no tiene costo.",
      href: "/es/presupuesto",
      label: "Abrir la página de presupuesto",
    },
    { type: "p", text: "¿Prefiere platicarlo? [Mándenos un texto](sms:+19729148617) o [llame](tel:+19729148617) al (972) 914-8617, en español o inglés." },
  ],
  faqs: [
    {
      q: "¿Dónde está The Oasis Ballroom en Irving?",
      a: "The Oasis Ballroom está en 3225 W Airport Fwy, Suite 200, Irving, TX 75062, sobre la carretera 183 en la zona de Belt Line en Irving.",
    },
    {
      q: "¿Cuántos invitados caben en The Oasis Ballroom?",
      a: "Tiene tres salones. Según sus anuncios, el Sahara Room sienta hasta 400, el Arabian Room hasta 300 y el Mojave Room hasta 80. Calcule menos lugares con la pista de baile puesta.",
    },
    {
      q: "¿Cuánto cuesta The Oasis Ballroom para una quinceañera?",
      a: "El salón no publica precios. La cotización se da después del recorrido, según el salón, el día, las horas y lo que incluye. Llame al (214) 519-3320 o visite theoasisballroom.com.",
    },
    {
      q: "¿Puedo llevar catering externo a The Oasis Ballroom?",
      a: "El anuncio del salón dice que se permite catering externo. Pregunte en el recorrido por cargos o reglas para la comida, la barra o el pastel, y pídalo por escrito.",
    },
  ],
};

export default post;
