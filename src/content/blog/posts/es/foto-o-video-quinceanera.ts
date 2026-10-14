import type { BlogPost } from "@/content/blog";
import { TIER_PRICE_USD, usd } from "@/lib/commission";

const study = usd(TIER_PRICE_USD.study);
const cinema = usd(TIER_PRICE_USD.cinema);
const production = usd(TIER_PRICE_USD.production);
const archive = usd(TIER_PRICE_USD.archive);

const post: BlogPost = {
  slug: "foto-o-video-quinceanera",
  title: "¿Foto o video para su quinceañera? ¿Necesita los dos?",
  metaTitle:
    "¿Foto o video para la quinceañera? ¿Necesita los dos? Guía DFW",
  description:
    "Qué guarda la foto y qué solo guarda el video — el vals, el baile sorpresa, los discursos, las caras de los papás. Cómo decidir sin presión, con el panorama real de costo en Dallas–Fort Worth.",
  category: "Photography & Film",
  excerpt:
    "La foto detiene el instante perfecto. El video guarda el sonido y el movimiento — el vals, el baile sorpresa, el brindis. Cómo decidir entre los dos, sin presión.",
  publishedAt: "2026-06-09",
  updatedAt: "2026-10-14",
  readMinutes: 8,
  lang: "es",
  lead: "Casi todas las mamás que planean unos quince llegan a la misma pregunta: ¿de verdad hace falta el video, o con un fotógrafo basta? Es una duda válida, y la respuesta depende de qué momentos no se imagina perdiendo. En esta guía verá qué guarda la foto, qué solo guarda el video, qué incluye de verdad un video de quinceañera y el panorama real de costo en Dallas–Fort Worth, para que decida sin adivinar.",
  content: [
    { type: "h2", text: "La respuesta corta" },
    {
      type: "p",
      text: "Técnicamente no necesita los dos. Muchísimas familias reservan solo foto y quedan felices. Pero la foto y el video guardan cosas distintas, y los momentos que se viven en movimiento — el vals, los discursos, el baile sorpresa, la cara de su hija cuando arranca la música — solo quedan completos en video. Si el presupuesto alcanza para ambos, un mismo equipo que haga foto y video es la forma más sencilla de lograrlo. En [TX Quince](/es#commissions), el Estudio de retrato es nuestra comisión de solo foto; Cine y fotografía, La producción completa y el Archivo editorial de varios días incluyen los dos.",
    },
    { type: "h2", text: "Qué guarda la foto que el video no puede" },
    {
      type: "p",
      text: "Una fotografía detiene el tiempo. Es el cuadro que imprime, cuelga en la pared y le entrega a su hija dentro de veinte años. Las fotos son deliberadas, compuestas y hechas para durar — los retratos formales con las dos familias, los detalles del vestido y de la zapatilla, esa mirada perfecta de un lado a otro del salón. Una foto la sostiene en la mano. El video se desliza en la pantalla; la foto se enmarca.",
    },
    {
      type: "p",
      text: "La foto también es como se comparte la mayor parte del día — la galería que sus familiares en México abrirán a la mañana siguiente, las impresiones para los abuelos, la imagen que se vuelve la tarjeta de agradecimiento. Si solo va a hacer una cosa, la fotografía profesional es la base. Por eso todas [las comisiones de TX Quince](/es#commissions) la incluyen.",
    },
    { type: "h2", text: "Qué guarda el video que una foto jamás podrá" },
    {
      type: "p",
      text: "El video guarda las dos cosas que una imagen fija no puede físicamente: el movimiento y el sonido. Y en unos quince, ahí es justo donde vive la emoción.",
    },
    {
      type: "ul",
      items: [
        "Las voces — su brindis, las palabras de los padrinos, el sacerdote durante la misa, la canción que eligió su hija. Una foto de un discurso es una persona con un micrófono; el video son las palabras mismas.",
        "El vals — es coreografía. Solo tiene sentido en movimiento, girando por la pista con la corte de chambelanes y damas. Un solo cuadro no puede contar esa historia.",
        "El baile sorpresa — está hecho para verse de principio a fin: el cambio de ritmo, la sorpresa en la cara de los invitados, los aplausos. Es el clip que la familia vuelve a poner durante años.",
        "Las reacciones — la cara de su papá durante el baile padre e hija, su mamá conteniendo las lágrimas, el salón estallando. Pasan en un segundo y medio. El video las atrapa; el obturador casi siempre las pierde.",
      ],
    },
    {
      type: "p",
      text: "Dos de esos momentos — el vals y el baile sorpresa — son lo que las familias más desean haber tenido en video después de la fiesta. Vea cómo se sienten en pantalla en nuestros [cortos cinematográficos del portafolio](/portfolio).",
    },
    { type: "h2", text: "El caso emocional del video" },
    {
      type: "p",
      text: "No vamos a meterle miedo para venderle un plan más grande. Pero sí le decimos lo que vemos: las familias que se saltan el video casi siempre se arrepienten un año después. De la foto casi nadie se arrepiente — la tiene, es hermosa, listo. El video es lo que la gente desea tener cuando ya pasó, porque para entonces el día se fue y no hay segunda oportunidad de grabar una voz o un baile.",
    },
    {
      type: "callout",
      text: "Nunca nadie nos ha dicho que se arrepiente de tener el video de los quince de su hija. El arrepentimiento siempre corre para el otro lado. Lo hemos visto pasar muchas veces.",
    },
    { type: "h2", text: "Qué incluye de verdad un video de quinceañera" },
    {
      type: "p",
      text: "“Video” suena vago, así que vale la pena precisar qué es un buen video de quinceañera. Un video bien hecho es una historia editada —no una hora de grabación cruda que nadie ve—, casi siempre entregada en dos formas:",
    },
    {
      type: "ul",
      items: [
        "Una edición documental — el corte largo que recorre el día en orden: el arreglo, la misa, los brindis, el vals, el baile. Es el recuerdo que se sienta a ver con la familia entera.",
        "Un cinematográfico de 3 a 5 minutos — el corto editado con música que captura el sentimiento de todo el día. Es el que de verdad va a compartir, y el que su hija va a publicar.",
      ],
    },
    {
      type: "p",
      text: "En nuestras comisiones de foto y video, la película viene con un teaser corto y reels verticales editados para compartir — y el Archivo editorial de varios días suma un adelanto en 48 horas — para que tenga algo que publicar mientras el día sigue fresco, en lugar de esperar meses.",
    },
    {
      type: "cta",
      heading: "Vea exactamente cuáles comisiones incluyen video",
      body: "El Estudio de retrato es solo foto. Cine y fotografía, La producción completa y el Archivo editorial de varios días combinan un director de foto con un director de video. Compárelas lado a lado.",
      href: "/es#commissions",
      label: "Comparar comisiones",
    },
    { type: "h2", text: "Un equipo para los dos, o dos proveedores aparte" },
    {
      type: "p",
      text: "Si se decide por ambos, la siguiente pregunta es si contratar a un equipo que haga foto y video, o reservar a un fotógrafo por un lado y a un videógrafo por otro. Tenemos nuestra opinión, y el caso práctico a favor de un solo equipo se sostiene por cuatro razones.",
    },
    {
      type: "ul",
      items: [
        "Coordinación — dos proveedores que nunca se han visto tienen que negociar ángulos, luz y quién se para dónde durante el vals. Un solo equipo ya resolvió eso; no verá a dos extraños tapándose las tomas.",
        "Un solo contacto — un contrato, un itinerario, un anticipo y una persona que conoce su día completo. No dos cadenas de correos y dos facturas que perseguir.",
        "Un mismo estilo — la foto y el video comparten la misma mirada, así la galería y el video se sienten del mismo día, no de dos eventos distintos grabados por gente con gustos diferentes.",
        "Costo — y esta es la parte que sorprende a casi todas las familias: con el mismo nivel de oficio, reservar ambos con un mismo equipo normalmente sale más barato que contratar a dos personas por separado.",
      ],
    },
    { type: "h2", text: "El panorama real de costo en DFW" },
    {
      type: "p",
      text: "En Dallas–Fort Worth, la mayoría de los estudios de quinceañera publican paquetes de solo foto de unos $1,500 a $3,000, y un videógrafo aparte puede sumar una cantidad parecida encima. Los paquetes combinados de foto y video suelen ir de unos $3,000 a $5,500, y las colecciones de lujo de $5,500 a $8,000 o más — normalmente menos que contratar por separado a un fotógrafo y un videógrafo del mismo nivel, porque el equipo ya está en el lugar y el día se planea una sola vez. En el total de la fiesta, la foto y el video suelen ocupar del 8 al 15% del presupuesto.",
    },
    {
      type: "p",
      text: `Anclado a nuestras comisiones: el Estudio de retrato cuesta ${study} — solo foto, una sesión editorial de retrato de tres horas antes de la celebración. Cine y fotografía cuesta ${cinema} por foto y video — ocho horas con un director de foto y un director de video, una película 4K de 8 a 10 minutos, un teaser y reels. La producción completa, por ${production}, es la que recomendamos para la mayoría de las celebraciones — once horas, un segundo fotógrafo, una sesión de retrato, una película de 12 a 15 minutos y un libro encuadernado en lino. El Archivo editorial de varios días, por ${archive}, cubre dos días con un equipo de cuatro. Para ver qué incluye cada comisión y [cuáles incluyen ambos](/es#commissions), revise las comisiones; y para una mirada más amplia al costo, lea [cuánto cuesta un fotógrafo de quinceañera en DFW](/es/blog/cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth).`,
    },
    { type: "h2", text: "Si el presupuesto solo alcanza para uno" },
    {
      type: "p",
      text: "A veces los dos no caben en el presupuesto este año, y está bien — aquí no hay respuesta equivocada, solo una forma clara de elegir. Pregúntese una cosa: ¿qué importa más para su familia, el cuadro enmarcado que va a colgar en la pared, o el registro en movimiento de los discursos y los bailes?",
    },
    {
      type: "ol",
      items: [
        "Si quiere algo para sostener, imprimir y exhibir — elija foto. Es el recuerdo que dura, y es la base con la que empezaríamos a cualquiera.",
        "Si los momentos que más le importan tienen movimiento y sonido — el vals, el baile sorpresa, los brindis — inclínese por el video, porque esos no sobreviven como fotos fijas.",
        "Si puede estirar un poco el presupuesto, elija la colección que incluye ambos en vez de sumar un segundo proveedor — es mejor valor y un día más tranquilo.",
      ],
    },
    {
      type: "p",
      text: "¿Sigue dudando? Si lo suyo es el video por el movimiento, fíjese cuánto pesa [el cambio de zapatillas](/es/blog/el-cambio-de-zapatillas-quinceanera) en pantalla — ese instante que pasa de niña a mujer se vive mejor en movimiento. Cuando esté lista, puede [verificar si su fecha está disponible](/check-your-date) en unos segundos, o ir directo a [reservar su fecha](/es#intake) para congelar el precio de hoy.",
    },
  ],
  faqs: [
    {
      q: "¿Necesito videógrafo para mi quinceañera?",
      a: "No es obligatorio — muchas familias reservan solo foto y quedan felices. Pero los momentos que más se lamenta no haber grabado — el vals, el baile sorpresa, los brindis, las reacciones de su hija — solo quedan completos en video, porque están hechos de movimiento y sonido. Si el presupuesto lo permite, el video es lo que la gente lamenta saltarse, no lo que lamenta tener.",
    },
    {
      q: "¿Qué es más importante, foto o video?",
      a: "La foto es la base — los cuadros fijos, enmarcables e imprimibles que va a colgar en la pared y compartir con la familia. El video guarda lo que la foto no puede: los discursos, la música, los bailes y las reacciones en movimiento. Si solo puede hacer uno, elija foto como recuerdo; si los momentos con movimiento y sonido son los que más le importan, inclínese por el video. Lo ideal es un equipo combinado que le dé los dos.",
    },
    {
      q: "¿Qué incluye el video de quinceañera?",
      a: "Un buen video es una historia editada, no una grabación cruda, casi siempre entregada en dos piezas: una edición documental que recorre el día completo en orden, y un cinematográfico de 3 a 5 minutos editado con música. En las comisiones de foto y video de TX Quince también incluye un teaser corto y reels verticales, para que tenga algo que compartir mientras el día sigue fresco.",
    },
    {
      q: "¿Sale más barato contratar foto y video juntos?",
      a: "Normalmente sí, con el mismo nivel de oficio. En DFW, los paquetes combinados de foto y video suelen ir de unos $3,000 a $5,500, por lo general menos que contratar por separado a un fotógrafo y un videógrafo comparables, porque el equipo ya está en el lugar y el día se planea una sola vez.",
    },
    {
      q: "¿Cuáles comisiones de TX Quince incluyen foto y video?",
      a: `El Estudio de retrato (${study}) es solo foto. Cine y fotografía (${cinema}), La producción completa (${production}) y el Archivo editorial de varios días (${archive}) incluyen foto y video con un director de foto y un director de video. La producción completa es la que recomendamos para la mayoría de las celebraciones. Puede comparar todo lo que incluye cada una en las comisiones de nuestra página principal.`,
    },
    {
      q: "¿Un mismo equipo puede hacer la foto y el video?",
      a: "Sí — y normalmente es la mejor opción. Un solo equipo significa ángulos coordinados durante el vals y el baile sorpresa, un solo contacto y un solo contrato, un mismo estilo entre la galería y el video, y menor costo que contratar a dos proveedores aparte. Todas las comisiones de foto y video de TX Quince están armadas justo así.",
    },
  ],
  related: [
    "cuanto-cuesta-fotografo-quinceanera-dallas-fort-worth",
    "el-cambio-de-zapatillas-quinceanera",
    "cuando-reservar-fotografo-quinceanera-dfw",
  ],
};

export default post;
