/**
 * city-content.ts — UNIQUE per-city local content for the quinceañera-photographer
 * landing pages. Researched per city (real photo locations, neighborhoods, and
 * city-specific FAQs that answer the local autocomplete intents) so each page is
 * genuinely distinct — NOT a doorway page. Keyed by the same slug as locations.ts.
 */

export type CityPhotoSpot = { name: string; why: string; whyEs: string };

export type CityContent = {
  intro: string[];
  introEs: string[];
  photoSpots: CityPhotoSpot[];
  faqs: { q: string; a: string }[];
  faqsEs: { q: string; a: string }[];
};

export const cityContent: Record<string, CityContent> = {
  "grand-prairie": {
    "intro": [
      "Grand Prairie is split right down the Dallas–Tarrant county line, and it carries one of the most Mexican neighborhoods in the metroplex along with it. Close to half the city is Hispanic, and the roots run deeper than most people realize — Dalworth, on the northeast side, was its own incorporated town before Grand Prairie annexed it back in 1942, and it has stayed a tight Mexican-American community ever since. You feel that every Cinco de Mayo out at Traders Village, and you feel it in how families here still do a quinceañera the full way: the Mass, the court, the vals, all of it.",
      "A Grand Prairie quince day usually opens with a morning misa at a parish on the north or central side of town, moves into portraits, and lands at a reception hall for the night. Plenty of families shoot pictures out at Joe Pool Lake or in front of the Uptown Theater's old marquee on Main Street, then head to a banquet hall along Pioneer Parkway or out toward the Highway 161 corridor near EpicCentral. Tell me your church and your salón and I'll build the timeline so nothing gets rushed and nobody's chasing the light at the end of the day.",
      "I shoot one quinceañera a day — never two — so your daughter's celebration isn't a stop on a packed Saturday. Everything runs in English and Spanish, so your tías and your padrinos always know what comes next. Collections run from $1,800 to $5,500, and the one most families book pairs photo and film; every collection comes with full print rights and the high-resolution files, and the film collections include a same-week sneak peek so you have something to share before the rest is even finished. There's no travel fee anywhere in DFW, Grand Prairie included."
    ],
    "introEs": [
      "Grand Prairie está partido justo por la línea de los condados de Dallas y Tarrant, y trae consigo uno de los barrios más mexicanos del metroplex. Casi la mitad de la ciudad es hispana, y la raíz viene de más atrás de lo que muchos creen: Dalworth, por el lado noreste, fue su propio pueblo antes de que Grand Prairie lo anexara en 1942, y desde entonces sigue siendo una comunidad mexicana bien unida. Eso se siente cada Cinco de Mayo en Traders Village, y se siente en cómo las familias de aquí todavía hacen la quinceañera completa: la misa, la corte, el vals, todo.",
      "Un día de quince en Grand Prairie casi siempre empieza con una misa de mañana en una parroquia del norte o del centro de la ciudad, sigue con las fotos y termina en un salón por la noche. Muchas familias toman fotos en Joe Pool Lake o frente a la marquesina vieja del Uptown Theater en Main Street, y luego se van a un salón por Pioneer Parkway o rumbo al corredor de la Highway 161 cerca de EpicCentral. Díme tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas y nadie ande corriendo por la luz al final del día.",
      "Fotografío una sola quinceañera al día —nunca dos— para que la celebración de tu hija no sea una parada en un sábado lleno. Todo lo manejo en inglés y español, para que tus tías y tus padrinos siempre sepan qué sigue. Las colecciones van de $1,800 a $5,500, y la que más reservan junta foto y video; todas incluyen los derechos de impresión y los archivos en alta resolución, y las de video traen un adelanto la misma semana para que tengas algo que compartir antes de que el resto esté listo. No hay cargo por traslado en ningún lugar de DFW, Grand Prairie incluido."
    ],
    "photoSpots": [
      {
        "name": "Lynn Creek Park at Joe Pool Lake",
        "why": "The biggest public shoreline in Grand Prairie — a swimming beach, a marina, and wide-open water that turns gold at sunset. It's the go-to for big, airy lakeside portraits with room for the whole court.",
        "whyEs": "La orilla pública más grande de Grand Prairie: playa, marina y agua abierta que se pone dorada al atardecer. Es el lugar favorito para fotos amplias junto al lago, con espacio para toda la corte."
      },
      {
        "name": "Epic Central Park (EpicCentral, Hwy 161)",
        "why": "A modern 172-acre park with a grand lawn, a boardwalk, five lakes, and a 60-foot fountain that lights up at night for the Illuvia show. Clean architecture and dramatic evening light if you want something less traditional.",
        "whyEs": "Un parque moderno de 172 acres con un gran jardín, un boardwalk, cinco lagos y una fuente de 60 pies que se ilumina de noche con el show Illuvia. Arquitectura limpia y luz dramática de noche si quieres algo menos tradicional."
      },
      {
        "name": "Historic Downtown Grand Prairie — Main Street & the Uptown Theater",
        "why": "Old Main Street brick storefronts and the restored 1950s Uptown Theater marquee give you a vintage, editorial backdrop just minutes from the parishes — great for a save-the-date session or a quick set on the day.",
        "whyEs": "Las fachadas de ladrillo del viejo Main Street y la marquesina restaurada del Uptown Theater de los años 50 te dan un fondo vintage y editorial a unos minutos de las parroquias: ideal para una sesión save-the-date o unas tomas rápidas el mismo día."
      },
      {
        "name": "Loyd Park at Joe Pool Lake",
        "why": "On the wooded southwest side of Joe Pool Lake, quieter than the beach, with shaded coves and tall trees. The softer, more private option when you want greenery instead of open water.",
        "whyEs": "En el lado boscoso al suroeste de Joe Pool Lake, más tranquilo que la playa, con ensenadas sombreadas y árboles altos. La opción más suave y privada cuando quieres verde en vez de agua abierta."
      },
      {
        "name": "Fish Creek Linear Park",
        "why": "A greenbelt and forest preserve threading through the middle of the city — trees, the creek, and a natural trail backdrop close to home, no long drive needed.",
        "whyEs": "Un parque lineal y reserva forestal que cruza el centro de la ciudad: árboles, el arroyo y un fondo natural de sendero cerca de casa, sin manejar lejos."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Grand Prairie?",
        "a": "Collections run from $1,800 for Moments up to $5,500 for Legacy, with Signature at $3,900 the one most Grand Prairie families book because it covers both photo and film. A save-the-date session is $500. Every collection includes full print rights and the high-resolution files, and there's no travel fee anywhere in DFW."
      },
      {
        "q": "Where are the best places to take quince pictures in Grand Prairie?",
        "a": "Lynn Creek Park at Joe Pool Lake for open, golden-hour water; Epic Central Park off Highway 161 for the fountains and modern grounds; the Uptown Theater marquee and brick storefronts on historic Main Street for a vintage look; and quieter natural spots like Loyd Park or Fish Creek Linear Park. We pick based on the feel you want and how it fits into the day."
      },
      {
        "q": "Which areas of Grand Prairie do receptions usually happen in?",
        "a": "Most families book a banquet hall along Pioneer Parkway or out toward the Highway 161 corridor near EpicCentral, and some go for venues on the south end near Joe Pool Lake. Send me your church and your reception hall and I'll plan the timeline around both, so the drive between them is built in."
      },
      {
        "q": "Do you offer both photo and video for quinceañeras in Grand Prairie?",
        "a": "Yes — the Signature and Legacy collections include film alongside photography, shot the same day by one team, with a same-week sneak peek so you have something to share right after. Because I only take one celebration a day, the video never competes with the photos for attention."
      },
      {
        "q": "What areas near Grand Prairie do you serve?",
        "a": "Grand Prairie sits between Arlington, Irving, south Dallas and Oak Cliff, Mansfield, Cedar Hill, and Duncanville, with Dalworthington Gardens right next door — and I cover all of them with no travel fee. Wherever your church and hall land across DFW, the rate is the same."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañeras en Grand Prairie?",
        "a": "Las colecciones van desde $1,800 (Moments) hasta $5,500 (Legacy), y la Signature de $3,900 es la que más reservan las familias de Grand Prairie porque incluye foto y video. La sesión save-the-date cuesta $500. Todas las colecciones incluyen los derechos de impresión y los archivos en alta resolución, y no hay cargo por traslado en ningún lugar de DFW."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Grand Prairie?",
        "a": "Lynn Creek Park en Joe Pool Lake para el agua abierta a la hora dorada; Epic Central Park por la Highway 161 para las fuentes y los jardines modernos; la marquesina del Uptown Theater y las fachadas de ladrillo del Main Street histórico para un estilo vintage; y lugares más tranquilos y naturales como Loyd Park o Fish Creek Linear Park. Escogemos según el estilo que quieras y cómo encaje en el día."
      },
      {
        "q": "¿En qué zonas de Grand Prairie suelen ser las recepciones?",
        "a": "La mayoría de las familias reservan un salón por Pioneer Parkway o rumbo al corredor de la Highway 161 cerca de EpicCentral, y algunas eligen lugares al sur, cerca de Joe Pool Lake. Mándame tu iglesia y tu salón y armo el itinerario alrededor de los dos para que el traslado entre ellos ya esté contemplado."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Grand Prairie?",
        "a": "Sí — las colecciones Signature y Legacy incluyen video junto con la fotografía, grabado el mismo día por un solo equipo, con un adelanto la misma semana para que tengas algo que compartir enseguida. Como solo tomo una celebración al día, el video nunca compite con las fotos por la atención."
      },
      {
        "q": "¿Qué áreas cerca de Grand Prairie cubres?",
        "a": "Grand Prairie está entre Arlington, Irving, el sur de Dallas y Oak Cliff, Mansfield, Cedar Hill y Duncanville, además de Dalworthington Gardens justo al lado — y cubro todas sin cargo por traslado. Donde sea que queden tu iglesia y tu salón en DFW, el precio es el mismo."
      }
    ]
  },
  "irving": {
    "intro": [
      "Irving is really two cities, and a quinceañera here usually touches both. South of Highway 183 you have the older, Spanish-speaking heart of town — the panaderías and carnicerías along Irving Boulevard, the parishes that have been baptizing and confirming the same families for decades, and the brick storefronts of the Heritage District around Main Street. North of that sit the canals and glass towers of Las Colinas. Irving is roughly 40% Hispanic, mostly families of Mexican origin, and that community is concentrated in exactly those older South Irving neighborhoods where the church-first tradition is still done in full.",
      "A typical day moves across that whole map. We start with the misa in South Irving, then drive ten minutes north so your daughter can stand under the Mustangs at Williams Square or along the Venetian bridges of the Mandalay Canal for portraits — backdrops you genuinely cannot get anywhere else in DFW. From there the reception might be a hotel ballroom near the Irving Convention Center, the entertainment district around the Toyota Music Factory, or a neighborhood salón off Irving Boulevard. I build the timeline around your actual churches and venues, not a template.",
      "I only photograph one quinceañera a day, and only quinceañeras — no weddings squeezed in, no second event pulling me away at sunset. Everything is fully bilingual, so your grandparents understand every direction during portraits and the toasts get caught in the moment. On the film collections you get a same-week sneak peek while the night is still fresh, full print rights, and the high-resolution images to keep."
    ],
    "introEs": [
      "Irving en realidad son dos ciudades, y una quinceañera casi siempre toca las dos. Al sur de la 183 está el corazón mexicano de la ciudad: las panaderías y carnicerías sobre Irving Boulevard, las parroquias que llevan generaciones bautizando y confirmando a las mismas familias, y los locales de ladrillo del Heritage District por Main Street. Al norte quedan los canales y las torres de cristal de Las Colinas. Irving es casi 40% hispano, en su mayoría familias de origen mexicano, y esa comunidad está concentrada justo en esos barrios del sur de Irving donde todavía se hace la tradición completa, empezando por la iglesia.",
      "Un día típico recorre todo ese mapa. Empezamos con la misa en el sur de Irving y manejamos diez minutos al norte para que tu hija se pare bajo los Mustangs de Williams Square o sobre los puentes venecianos del Mandalay Canal para las fotos — fondos que de verdad no encuentras en ninguna otra parte de DFW. De ahí la recepción puede ser un salón de hotel cerca del Irving Convention Center, la zona de entretenimiento del Toyota Music Factory, o un salón del barrio sobre Irving Boulevard. Armo el itinerario alrededor de tus iglesias y tu salón, no de una plantilla.",
      "Solo fotografío una quinceañera al día y solo quinceañeras: nada de bodas encimadas ni un segundo evento que me jale al atardecer. Todo es bilingüe, así que tus abuelos entienden cada indicación durante las fotos y los brindis quedan capturados en el momento. En las colecciones con video tienes un adelanto la misma semana, cuando la noche todavía está fresca, además de todos los derechos de impresión y las fotos en alta resolución para guardar."
    ],
    "photoSpots": [
      {
        "name": "Mandalay Canal Walk at Las Colinas",
        "why": "A Venetian-style canal with stone bridges, waterfalls, and arched walkways winding beneath the Las Colinas towers — the most European backdrop in DFW and a favorite for formal gown portraits. Free to walk, right off Lake Carolyn.",
        "whyEs": "Un canal estilo veneciano con puentes de piedra, cascadas y pasajes con arcos bajo las torres de Las Colinas — el fondo más europeo de todo DFW y de los favoritos para las fotos de vestido formal. De acceso libre, junto al Lake Carolyn."
      },
      {
        "name": "The Mustangs of Las Colinas (Williams Square)",
        "why": "Nine bronze mustangs galloping across a granite stream — the largest equestrian sculpture in the world, on an open public plaza at 5221 N. O'Connor Blvd. An unmistakable, only-in-Irving frame for a few hero shots.",
        "whyEs": "Nueve mustangs de bronce galopando sobre un arroyo de granito — la escultura ecuestre más grande del mundo, en una plaza pública abierta en el 5221 N. O'Connor Blvd. Un marco inconfundible y muy de Irving para algunas tomas principales."
      },
      {
        "name": "Irving Heritage District (Main Street, South Irving)",
        "why": "The old downtown around Second and Main — vintage brick storefronts, the early-1900s Heritage House, and a small-town Texas feel just a few blocks from the South Irving parishes. Great for relaxed, between-locations portraits.",
        "whyEs": "El centro viejo por Second y Main — fachadas de ladrillo antiguo, la Heritage House de principios del siglo XX y un ambiente de pueblo a unas cuadras de las parroquias del sur de Irving. Ideal para fotos relajadas entre locaciones."
      },
      {
        "name": "Centennial Park",
        "why": "A green Heritage District park with the Heritage House (a Texas Historical Landmark) and a wall that tells Irving's story in words and pictures — shade, lawn, and history in one easy stop near the churches.",
        "whyEs": "Un parque verde del Heritage District con la Heritage House (monumento histórico de Texas) y un muro que cuenta la historia de Irving en palabras e imágenes — sombra, césped e historia en una sola parada cerca de las iglesias."
      },
      {
        "name": "Campion Trail along the Trinity River",
        "why": "A 22-mile greenbelt following the Elm Fork of the Trinity, with open river views, tall trees, and quiet meadows — the natural, golden-hour option when you want greenery instead of architecture. Trailheads in Valley Ranch and Las Colinas.",
        "whyEs": "Un cinturón verde de 22 millas que sigue el Elm Fork del Trinity, con vistas abiertas al río, árboles altos y praderas tranquilas — la opción natural de la hora dorada cuando quieres verde en vez de arquitectura. Accesos en Valley Ranch y Las Colinas."
      },
      {
        "name": "Lake Carolyn waterfront (Las Colinas)",
        "why": "Open water with the Las Colinas skyline behind it — clean reflections at sunset and room to step back for full-length gown shots, just past the end of the Mandalay Canal.",
        "whyEs": "Agua abierta con el horizonte de Las Colinas de fondo — reflejos limpios al atardecer y espacio para tomas de cuerpo entero del vestido, justo donde termina el Mandalay Canal."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Irving?",
        "a": "My collections run $1,800 (Moments) to $5,500 (Legacy), with the most popular being the $3,900 Signature, which pairs photography and film. A save-the-date session is $500. Every collection includes full print rights and the high-resolution images, and there is no travel fee anywhere in Irving or the rest of DFW."
      },
      {
        "q": "Where are the best places to take quince pictures in Irving?",
        "a": "The Mandalay Canal Walk and the Mustangs of Las Colinas at Williams Square are the two signature backdrops — Venetian canals and the world's largest equestrian sculpture, ten minutes apart. For something greener or more historic, the Heritage District on Main Street, Centennial Park, the Campion Trail along the Trinity River, and the Lake Carolyn waterfront all photograph beautifully. We can shoot these as a save-the-date session or fold a couple into the day."
      },
      {
        "q": "Where do Irving families usually hold the reception?",
        "a": "All over the city. Hotel ballrooms cluster near the Irving Convention Center in Las Colinas, the entertainment district around the Toyota Music Factory hosts the bigger celebrations, and there are banquet halls along the Irving Boulevard corridor in South Irving, close to the parishes. Tell me your church and your venue and I'll build the timeline around both."
      },
      {
        "q": "Do you offer photo and video for quinceañeras in Irving?",
        "a": "Yes. The Signature and Legacy collections include both photography and a film, shot the same day by one team, and you'll get a same-week sneak peek on those film collections while the celebration is still fresh."
      },
      {
        "q": "What areas near Irving do you cover?",
        "a": "Irving sits in the middle of everything, so I regularly photograph quinces in Coppell, Grand Prairie, Farmers Branch, Euless, Grapevine, and across Dallas — all with no travel fee anywhere in the metroplex."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Irving?",
        "a": "Mis colecciones van de $1,800 (Moments) a $5,500 (Legacy), y la más popular es la Signature de $3,900, que incluye foto y video. La sesión save-the-date cuesta $500. Todas las colecciones incluyen los derechos de impresión y las fotos en alta resolución, y no hay cargo por traslado en Irving ni en el resto de DFW."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Irving?",
        "a": "El Mandalay Canal Walk y los Mustangs de Las Colinas en Williams Square son los dos fondos más icónicos — canales venecianos y la escultura ecuestre más grande del mundo, a diez minutos uno del otro. Si quieres algo más verde o histórico, el Heritage District sobre Main Street, el Centennial Park, el Campion Trail junto al río Trinity y la orilla del Lake Carolyn quedan preciosos. Lo podemos hacer como sesión save-the-date o acomodar un par el mismo día."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Irving?",
        "a": "Por toda la ciudad. Los salones de hotel se concentran cerca del Irving Convention Center en Las Colinas, la zona de entretenimiento del Toyota Music Factory recibe las celebraciones más grandes, y hay salones de fiesta sobre el corredor de Irving Boulevard en el sur de Irving, cerca de las parroquias. Dime tu iglesia y tu salón y armo el itinerario alrededor de los dos."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Irving?",
        "a": "Sí. Las colecciones Signature y Legacy incluyen fotografía y video, grabados el mismo día por un solo equipo, y en esas colecciones con video recibes un adelanto la misma semana, cuando la celebración todavía está fresca."
      },
      {
        "q": "¿Qué zonas cerca de Irving cubres?",
        "a": "Irving está en el centro de todo, así que seguido fotografío quinces en Coppell, Grand Prairie, Farmers Branch, Euless, Grapevine y por todo Dallas — todo sin cargo por traslado en el metroplex."
      }
    ]
  },
  "garland": {
    "intro": [
      "Garland is one of the largest cities in Dallas County, and it wears its Mexican heritage plainly — the pan­erias and taquerías of South Garland, the families that fill the parishes on a Saturday morning, the quinceañeras that still run the full arc from misa to el último baile. More than four in ten residents here are Hispanic, most of Mexican descent, and that shows up in how seriously a fifteenth birthday is taken. Nobody does the short version.",
      "What makes the day easy to photograph is that Garland hands you two completely different backdrops inside one city. Head east and you're on the Lake Ray Hubbard shoreline; turn toward the center of town and you're standing in a genuinely restored downtown square — brick storefronts on the National Register, the Plaza Theatre's neon marquee glowing on the corner, a new civic lawn where the DART Blue Line pulls in. We can build your portraits around the water, the square, or both.",
      "I only ever hold one quinceañera per date. So whether your reception is in a banquet hall off Broadway in South Garland, near Firewheel on the north side, or out by the lake, I'm with your family from the first frame in the church to the surprise dance — not watching a clock because another event is booked after yours. Send me your parish and your salón when you reach out and I'll shape the whole timeline around both."
    ],
    "introEs": [
      "Garland es una de las ciudades más grandes del condado de Dallas, y lleva sus raíces mexicanas a la vista: las pan­erias y taquerías del sur de Garland, las familias que llenan las parroquias un sábado en la mañana, las quinceañeras que todavía se hacen completas, de la misa hasta el último baile. Más de cuatro de cada diez personas aquí son hispanas, la mayoría de origen mexicano, y eso se nota en lo en serio que se toma un quince. Aquí nadie hace la versión corta.",
      "Lo que hace fácil fotografiar el día es que Garland te da dos fondos completamente distintos dentro de la misma ciudad. Hacia el este llegas a la orilla de Lake Ray Hubbard; hacia el centro te paras en un downtown de verdad restaurado: fachadas de ladrillo en el Registro Nacional, el marqués de neón del Plaza Theatre brillando en la esquina y un pasto nuevo donde llega el tren Blue Line del DART. Podemos armar tus fotos alrededor del lago, del centro, o de los dos.",
      "Solo aparto una quinceañera por fecha. Así que ya sea que tu recepción esté en un salón por Broadway en el sur de Garland, cerca de Firewheel al norte, o por el lado del lago, estoy con tu familia desde la primera foto en la iglesia hasta el baile sorpresa, sin andar viendo el reloj porque haya otro evento después del tuyo. Cuando me escribas, mándame tu parroquia y tu salón y armo todo el itinerario alrededor de los dos."
    ],
    "photoSpots": [
      {
        "name": "Downtown Garland Square",
        "why": "Garland's restored historic square — brick storefronts on the National Register, a new civic lawn, and a lit prism gateway after dark. A real downtown backdrop without driving into Dallas.",
        "whyEs": "El centro histórico restaurado de Garland: fachadas de ladrillo en el Registro Nacional, un pasto nuevo y la torre de luces que se ilumina de noche. Un fondo urbano de verdad sin tener que ir hasta Dallas."
      },
      {
        "name": "Plaza Theatre marquee (Downtown Garland)",
        "why": "The Plaza Theatre's 1949 neon marquee anchors the corner of the square. Lit up at night it gives portraits a vintage, one-of-a-kind backdrop.",
        "whyEs": "El marqués de neón del Plaza Theatre, de 1949, en la esquina del centro. De noche se prende y les da a las fotos un fondo vintage con mucha personalidad."
      },
      {
        "name": "Spring Creek Forest Preserve",
        "why": "Old-growth woods and native prairie in north Garland, with real wildflowers in spring and early summer. Genuine green, not a studio backdrop.",
        "whyEs": "Bosque antiguo y pradera nativa al norte de Garland, con flores silvestres de verdad en primavera y a principios de verano. Verde auténtico, nada de fondo de estudio."
      },
      {
        "name": "Audubon Park & Duck Creek Greenbelt",
        "why": "Over 100 acres of natural space with a trail along Duck Creek — soft, tree-filtered light that's kind to a full court.",
        "whyEs": "Más de 100 acres de naturaleza con el sendero junto a Duck Creek. Luz suave entre los árboles que le queda muy bien a toda la corte."
      },
      {
        "name": "John Paul Jones Park on Lake Ray Hubbard",
        "why": "Garland's own Lake Ray Hubbard shoreline for open-water sunset portraits. Free, public, and quiet in the evening.",
        "whyEs": "La orilla de Lake Ray Hubbard, en Garland, para fotos de atardecer con el agua de fondo. Gratis, público y tranquilo en la tarde."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Garland?",
        "a": "Collections run from $1,800 (Moments) to $5,500 (Legacy). Signature at $3,900 is the most-booked because it covers both photography and film, with a same-week sneak peek. A separate save-the-date session is $500. There's no travel fee anywhere in DFW, so your Garland day is priced exactly like one in Dallas — see /investment for what's in each collection."
      },
      {
        "q": "Where are the best places to take quince pictures in Garland?",
        "a": "My go-to spots are the restored Downtown Garland Square and the Plaza Theatre's neon marquee, Spring Creek Forest Preserve and Audubon Park along Duck Creek for green, natural light, and the Lake Ray Hubbard shoreline at John Paul Jones Park for open-water sunset portraits. All are public — we can use them for a save-the-date session or work them into the day's timeline."
      },
      {
        "q": "Where do Garland families usually hold the reception?",
        "a": "All over the city — banquet halls along the Broadway Boulevard corridor in South Garland, venues on the north side near Firewheel and the George Bush Turnpike, and halls out toward Lake Ray Hubbard. Tell me your church and your hall and I'll build the timeline so nothing gets rushed between them."
      },
      {
        "q": "Do you offer photo and video in Garland?",
        "a": "Yes. The Signature ($3,900) and Legacy ($5,500) collections pair a photographer and a filmmaker, so you get both the stills and a film of the day, with a same-week sneak peek on the film collections. Every collection includes full print rights and the hi-res images."
      },
      {
        "q": "What areas around Garland do you cover?",
        "a": "All of it, with no travel fee — Garland plus Rowlett, Sachse, Mesquite, Richardson, Sunnyvale, Wylie, Murphy, and Rockwall across the lake, along with the rest of Dallas–Fort Worth. If your quince is anywhere in the metroplex, I can be there — check your date at /check-your-date."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Garland?",
        "a": "Las colecciones van de $1,800 (Moments) a $5,500 (Legacy). La de Signature, en $3,900, es la más reservada porque incluye fotografía y video, con un adelanto la misma semana. La sesión save-the-date aparte cuesta $500. No hay cargo por traslado en ningún lugar de DFW, así que tu día en Garland cuesta igual que uno en Dallas — mira /investment para ver qué trae cada colección."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Garland?",
        "a": "Mis lugares favoritos son el centro histórico restaurado (Downtown Garland Square) y el marqués de neón del Plaza Theatre, el Spring Creek Forest Preserve y Audubon Park junto a Duck Creek para luz verde y natural, y la orilla de Lake Ray Hubbard en John Paul Jones Park para fotos de atardecer sobre el agua. Todos son públicos — los podemos usar para una sesión save-the-date o acomodarlos en el día."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Garland?",
        "a": "Por toda la ciudad — salones por el corredor de Broadway Boulevard en el sur de Garland, lugares al norte cerca de Firewheel y el George Bush Turnpike, y salones por el lado de Lake Ray Hubbard. Dime tu iglesia y tu salón y armo el itinerario para que nada se haga a las prisas entre los dos."
      },
      {
        "q": "¿Ofreces foto y video en Garland?",
        "a": "Sí. Las colecciones Signature ($3,900) y Legacy ($5,500) juntan a un fotógrafo y a un camarógrafo, así que te llevas las fotos y el video del día, con un adelanto la misma semana en las colecciones con película. Todas las colecciones incluyen los derechos de impresión y las fotos en alta resolución."
      },
      {
        "q": "¿Qué zonas alrededor de Garland cubres?",
        "a": "Todas, sin cargo por traslado — Garland más Rowlett, Sachse, Mesquite, Richardson, Sunnyvale, Wylie, Murphy y Rockwall al cruzar el lago, junto con el resto de Dallas–Fort Worth. Si tu quince es en cualquier parte del metroplex, ahí estoy — revisa tu fecha en /check-your-date."
      }
    ]
  },
  "dallas": {
    "intro": [
      "Walk Jefferson Boulevard in Oak Cliff and you can read the whole tradition straight off the shop windows: bridal stores with quinceañera ball gowns on display, paleterías and taquerías a few doors down, the same blocks Mexican families have kept alive since the 1960s. That stretch is the commercial heart of Mexican-American Dallas, and it tells you everything about how seriously this city takes a girl's fifteenth birthday.",
      "Dallas is big, and the celebrations are spread across it. A morning misa at a parish in Oak Cliff or Pleasant Grove, portraits in Bishop Arts or out by White Rock Lake, then a reception that might land anywhere from a hall off Jefferson to a salón on the east side near Mesquite. Most families here keep the order intact, church first, then the formal portraits, then the vals and the party, and I photograph the day in that sequence, the way it's meant to flow.",
      "I shoot one quinceañera a day, in English or Spanish, with no travel fee anywhere in Dallas or the wider metroplex. Every collection comes with full print rights and the high-resolution files, and the film collections include a same-week sneak peek so you're not waiting weeks to see how the day looked. When you reach out, tell me your church and your venue and I'll build the timeline around both."
    ],
    "introEs": [
      "Camina por Jefferson Boulevard en Oak Cliff y vas a leer toda la tradición en los aparadores: tiendas de novias con vestidos de quinceañera, paleterías y taquerías a unos pasos, las mismas cuadras que las familias mexicanas han mantenido vivas desde los años sesenta. Ese tramo es el corazón comercial del Dallas mexicano, y te dice todo sobre lo en serio que esta ciudad se toma los quince años de una niña.",
      "Dallas es grande y las celebraciones están repartidas por toda la ciudad. Una misa de mañana en una parroquia de Oak Cliff o Pleasant Grove, las fotos en Bishop Arts o por White Rock Lake, y luego una recepción que lo mismo cae en un salón por Jefferson que en uno del lado este, cerca de Mesquite. Aquí casi todas las familias respetan el orden: primero la iglesia, luego las fotos formales, después el vals y la fiesta. Así fotografío el día, como debe fluir.",
      "Hago una sola quinceañera al día, en inglés o español, sin cargo por traslado en Dallas ni en todo el metroplex. Cada colección incluye los derechos de impresión y los archivos en alta resolución, y las colecciones con video traen un adelanto la misma semana, para que no esperes semanas para ver cómo quedó el día. Cuando me escribas, dime tu iglesia y tu salón y armo el itinerario alrededor de los dos."
    ],
    "photoSpots": [
      {
        "name": "Bishop Arts District (Oak Cliff)",
        "why": "Walkable blocks of hand-painted murals, vintage storefronts, and bright alleyways in the heart of Oak Cliff. Colorful, free to shoot, and minutes from most of the city's parishes.",
        "whyEs": "Cuadras caminables con murales pintados a mano, fachadas antiguas y callejones de colores en pleno Oak Cliff. Vistoso, sin costo para fotografiar y a minutos de la mayoría de las parroquias."
      },
      {
        "name": "Kiest Park Memorial Garden (Oak Cliff)",
        "why": "A 1930s WPA stone water rill, pergola, and formal flower beds tucked inside a large Oak Cliff park. Quiet, green, and classic for gown portraits without leaving the neighborhood.",
        "whyEs": "Un canal de piedra de los años treinta, una pérgola y jardines formales dentro de un parque grande de Oak Cliff. Tranquilo, verde y clásico para las fotos del vestido sin salir del barrio."
      },
      {
        "name": "Dallas Arboretum and Botanical Garden (White Rock Lake)",
        "why": "Manicured formal gardens, fountains, and seasonal blooms on the shore of White Rock Lake, the city's premier garden backdrop. It's ticketed and needs a photo pass, so we plan the time slot in advance.",
        "whyEs": "Jardines formales, fuentes y flores de temporada a la orilla de White Rock Lake, el mejor fondo de jardín de la ciudad. Cobra entrada y pide permiso de fotografía, así que apartamos el horario con tiempo."
      },
      {
        "name": "Latino Cultural Center (near Downtown)",
        "why": "Ricardo Legorreta's pumpkin-orange walls and purple 'lighthouse' tower with an open plaza, bold Mexican modernist color that ties the portraits straight back to the community.",
        "whyEs": "Los muros color calabaza y la torre morada estilo faro de Ricardo Legorreta, con una plaza abierta. Color modernista mexicano que conecta las fotos directamente con la comunidad."
      },
      {
        "name": "Ronald Kirk Bridge / Trinity Overlook (West Dallas)",
        "why": "A pedestrian-only bridge over the Trinity with the downtown skyline, Reunion Tower, and Calatrava's white Margaret Hunt Hill arch behind you. Best at golden hour, and free to walk on.",
        "whyEs": "Un puente peatonal sobre el río Trinity con el horizonte del centro, la Reunion Tower y el arco blanco del puente Margaret Hunt Hill de fondo. Ideal a la hora dorada y gratis para caminar."
      },
      {
        "name": "Fair Park (East Dallas)",
        "why": "A National Historic Landmark with the country's largest collection of Art Deco architecture. The Esplanade's fountains and lagoon and the grand 1936 facades make a dramatic, distinctly Dallas backdrop.",
        "whyEs": "Un sitio histórico nacional con la mayor colección de arquitectura Art Déco del país. Las fuentes y la laguna de la Esplanade y las fachadas de 1936 dan un fondo dramático y muy de Dallas."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Dallas?",
        "a": "My collections run $1,800 (Moments), $2,500 (Essential), $3,900 (Signature, the most popular, photo and film together), and $5,500 (Legacy), plus a save-the-date session at $500. There's no travel fee anywhere in Dallas or DFW, and every collection includes full print rights and the high-resolution files."
      },
      {
        "q": "Where are the best places to take quince pictures in Dallas?",
        "a": "For portraits I keep coming back to the murals of Bishop Arts, the WPA gardens at Kiest Park in Oak Cliff, the formal grounds of the Dallas Arboretum on White Rock Lake, the colorful Latino Cultural Center near downtown, the skyline view from the Ronald Kirk Bridge in West Dallas, and the Art Deco Esplanade at Fair Park. We pick spots close to your church so the timeline stays easy."
      },
      {
        "q": "What part of Dallas do receptions usually happen in?",
        "a": "All over the city, banquet halls along the Jefferson Boulevard corridor in Oak Cliff, salones on the southeast side around Pleasant Grove and Buckner, newer spaces near West Dallas and the Design District, and halls out toward Mesquite and the east side. Tell me your venue when you book and I'll plan the night around it."
      },
      {
        "q": "Do you offer both photo and video for quinceañeras in Dallas?",
        "a": "Yes. The Signature and Legacy collections pair photography with a cinematic film, and the film collections include a same-week sneak peek so you see a first piece within days. Everything is offered fully in English or Spanish."
      },
      {
        "q": "Do you cover the suburbs around Dallas too?",
        "a": "Yes, I photograph across all of Dallas County and the metroplex with no travel fee, including Irving, Grand Prairie, Garland, Mesquite, Farmers Branch, DeSoto, Duncanville, Cedar Hill, and Carrollton. One celebration a day, wherever in DFW your day takes us."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Dallas?",
        "a": "Mis colecciones son de $1,800 (Moments), $2,500 (Essential), $3,900 (Signature, la más popular, foto y video juntos) y $5,500 (Legacy), más la sesión save-the-date en $500. No cobro traslado en Dallas ni en todo DFW, y cada colección incluye los derechos de impresión y los archivos en alta resolución."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Dallas?",
        "a": "Para las fotos siempre regreso a los murales de Bishop Arts, los jardines de Kiest Park en Oak Cliff, el Dallas Arboretum a la orilla de White Rock Lake, el colorido Latino Cultural Center cerca del centro, la vista del horizonte desde el Ronald Kirk Bridge en West Dallas y la Esplanade Art Déco de Fair Park. Elegimos lugares cerca de tu iglesia para que el itinerario quede fácil."
      },
      {
        "q": "¿En qué parte de Dallas suelen ser las recepciones?",
        "a": "Por toda la ciudad: salones por el corredor de Jefferson Boulevard en Oak Cliff, salones del lado sureste por Pleasant Grove y Buckner, lugares más nuevos cerca de West Dallas y el Design District, y salones rumbo a Mesquite y el lado este. Dime tu salón al reservar y armo la noche alrededor de él."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Dallas?",
        "a": "Sí. Las colecciones Signature y Legacy combinan la fotografía con un video cinematográfico, y las colecciones con video incluyen un adelanto la misma semana, así ves la primera pieza en pocos días. Todo se ofrece por completo en inglés o español."
      },
      {
        "q": "¿También cubres los suburbios alrededor de Dallas?",
        "a": "Sí, fotografío en todo el condado de Dallas y el metroplex sin cargo por traslado, incluyendo Irving, Grand Prairie, Garland, Mesquite, Farmers Branch, DeSoto, Duncanville, Cedar Hill y Carrollton. Una sola celebración al día, donde sea que nos lleve tu día en DFW."
      }
    ]
  },
  "fort-worth": {
    "intro": [
      "Fort Worth's Mexican heritage didn't start downtown — it started a mile north of the Trinity River, where families came to work the Swift and Armour packing plants in the early 1900s and built the North Side into the city's oldest barrio. More than a century later, North Main Street, Marine Park, and the parishes around them are still where a lot of Fort Worth quinceañeras begin. Cross town to the South Freeway and you hit the other anchor: La Gran Plaza, the Hispanic mercado where families pick out the dress, the cake, and the recuerdos. I know how a quinceañera moves between these two sides of the city, and I build the day around the route your family actually takes.",
      "Fort Worth gives you a backdrop for whatever look you are after. Want something modern and dramatic? The Fort Worth Water Gardens downtown are free and open daily, all terraced concrete and falling water. Want the classic garden shots in the gown? The Japanese Garden inside the Botanic Garden has the koi ponds, red bridges, and maples for it. Want Fort Worth unmistakable in the frame? The Stockyards' brick streets and Mule Alley do that in a single block. Most days we work portraits in between the misa and the reception, but if your schedule is tight we can shoot a separate save-the-date session at the spot you love and keep the celebration day relaxed.",
      "I only photograph one quinceañera a day, and only quinceañeras — this is not a wedding studio fitting yours in on the side. That means the morning at the church, the portraits, the vals, the surprise dance, and the last hour on the floor all get the same attention. Everything runs in English and Spanish, so your tías and your abuelos understand every direction I give. There is no travel fee anywhere in Tarrant County or the rest of DFW, you keep full print rights and the hi-res files, and on the film collections you will see a sneak peek the same week."
    ],
    "introEs": [
      "La herencia mexicana de Fort Worth no empezó en el centro, sino una milla al norte del río Trinity, donde las familias llegaron a trabajar a los empacadores de carne Swift y Armour a principios de los 1900 y levantaron el North Side, el barrio más antiguo de la ciudad. Más de cien años después, North Main Street, Marine Park y las parroquias de por ahí siguen siendo donde arrancan muchas quinceañeras de Fort Worth. Del otro lado, por la South Freeway, está el otro punto de reunión: La Gran Plaza, el mercado donde las familias escogen el vestido, el pastel y los recuerdos. Conozco cómo se mueve una quinceañera entre estos dos lados de la ciudad y armo el día según la ruta que de verdad sigue tu familia.",
      "Fort Worth te da el fondo que quieras. ¿Algo moderno y de impacto? Los Fort Worth Water Gardens, en el centro, son gratis y abren todos los días, puro concreto en terrazas y agua cayendo. ¿Las fotos clásicas de jardín con el vestido? El Japanese Garden, dentro del Botanic Garden, tiene los estanques de koi, los puentes rojos y los maples. ¿Que se note que es Fort Worth? Las calles de ladrillo de los Stockyards y Mule Alley lo logran en una sola cuadra. Casi siempre hacemos las fotos entre la misa y la recepción, pero si el tiempo está apretado podemos hacer una sesión save-the-date aparte en el lugar que más te guste y dejar tranquilo el día de la fiesta.",
      "Solo fotografío una quinceañera al día, y solo quinceañeras: no soy un estudio de bodas que acomoda la tuya de pasada. Eso quiere decir que la mañana en la iglesia, las fotos, el vals, el baile sorpresa y la última hora en la pista reciben la misma atención. Todo es bilingüe, para que tus tías y tus abuelos entiendan cada indicación que doy. No hay cargo por traslado en todo el condado de Tarrant ni en el resto de DFW, te quedas con los derechos de impresión y los archivos en alta resolución, y en las colecciones con video ves un adelanto la misma semana."
    ],
    "photoSpots": [
      {
        "name": "Fort Worth Water Gardens (downtown)",
        "why": "Free and open daily on the south edge of downtown — Philip Johnson's terraced concrete pools and falling water give you a bold, modern set just minutes from most churches.",
        "whyEs": "Gratis y abierto todos los días en el borde sur del centro: las terrazas de concreto y el agua cayendo de Philip Johnson te dan un fondo moderno y de impacto, a minutos de casi cualquier iglesia."
      },
      {
        "name": "Japanese Garden, Fort Worth Botanic Garden",
        "why": "A traditional strolling garden with koi ponds, red bridges, and Japanese maples — the classic garden look for the gown. It welcomes quinceañera sessions for a small photo fee plus admission.",
        "whyEs": "Un jardín de paseo con estanques de koi, puentes rojos y maples japoneses: el fondo clásico de jardín para el vestido. Reciben sesiones de quinceañera con una cuota pequeña de foto más la entrada."
      },
      {
        "name": "Fort Worth Stockyards & Mule Alley",
        "why": "Brick streets and Western facades that read as Fort Worth in a single frame. The historic district is public and walkable — best early, before the crowds build.",
        "whyEs": "Calles de ladrillo y fachadas del Viejo Oeste que se ven Fort Worth en una sola foto. El distrito histórico es público y se camina; mejor temprano, antes de que se llene de gente."
      },
      {
        "name": "Trinity Park & Trinity Trails",
        "why": "Tree-lined paths along the Trinity River next to the Zoo, off University Drive — easy, green, and beautiful at golden hour for relaxed portraits.",
        "whyEs": "Senderos arbolados junto al río Trinity, al lado del zoológico, por University Drive: verde, cómodo y precioso a la hora dorada para fotos relajadas."
      },
      {
        "name": "Marine Park, North Side",
        "why": "The green heart of the historic Northside barrio off North Main, walking distance from the parishes — a meaningful spot if your family's roots are in the neighborhood.",
        "whyEs": "El corazón verde del histórico barrio del Northside, por North Main, a unos pasos de las parroquias: un lugar con sentido si las raíces de tu familia están en el vecindario."
      },
      {
        "name": "Fort Worth Cultural District",
        "why": "Open lawns and clean modernist architecture around the museums and the Will Rogers Memorial — an elegant, uncluttered backdrop a few minutes west of downtown.",
        "whyEs": "Jardines abiertos y arquitectura moderna y limpia alrededor de los museos y el Will Rogers Memorial: un fondo elegante y despejado, a unos minutos al oeste del centro."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Fort Worth?",
        "a": "My quinceañera collections run $1,800 (Moments), $2,500 (Essential), $3,900 (Signature — the most popular, photo and film together), and $5,500 (Legacy); a standalone save-the-date session is $500. Every collection includes full print rights and the hi-res files, and there is no travel fee anywhere in Tarrant County or DFW, so the Fort Worth price is the price. You can see exactly what is in each on the /investment page, then /check-your-date to confirm I am open."
      },
      {
        "q": "Where are the best places to take quince pictures in Fort Worth?",
        "a": "A few favorites: the Fort Worth Water Gardens downtown (free, dramatic concrete and water), the Japanese Garden inside the Botanic Garden (koi ponds and red bridges, small photo fee), the brick streets of the Stockyards and Mule Alley, and the riverside greenery of Trinity Park. Tell me the look you want and I will match the spot — and we can do it as a save-the-date session or fold it into the day."
      },
      {
        "q": "What part of Fort Worth do families hold the reception?",
        "a": "All over, depending on the parish. A lot of North Side families keep it close to North Main; others book halls along the South Freeway near La Gran Plaza, the east-side corridors around East Lancaster, or the event barns out by the Stockyards. Send me your church and your venue when you reach out and I will build the timeline so the drive between them works."
      },
      {
        "q": "Do you offer photo and video for Fort Worth quinceañeras?",
        "a": "Yes. The Signature and Legacy collections pair a photographer and a cinematographer so you get both, and on those film collections you get a same-week sneak peek before the full gallery and film are ready. If you want photo only, Moments and Essential cover that."
      },
      {
        "q": "What areas around Fort Worth do you cover?",
        "a": "All of Tarrant County and the wider metroplex — Haltom City, North Richland Hills, Saginaw, White Settlement, Benbrook, Crowley, Burleson, Arlington and beyond — with no travel fee. If your church is in Fort Worth and your reception is a few towns over, that is a normal Fort Worth quinceañera day for me. Reserve your date at /reserve."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Fort Worth?",
        "a": "Mis colecciones de quinceañera son de $1,800 (Moments), $2,500 (Essential), $3,900 (Signature — la más popular, fotos y video juntos) y $5,500 (Legacy); una sesión save-the-date por separado cuesta $500. Todas incluyen los derechos de impresión y los archivos en alta resolución, y no hay cargo por traslado en el condado de Tarrant ni en DFW, así que el precio en Fort Worth es el precio. Puedes ver qué incluye cada una en /investment y luego apartar tu fecha en /check-your-date."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quinceañera en Fort Worth?",
        "a": "Algunos favoritos: los Fort Worth Water Gardens en el centro (gratis, concreto y agua de mucho impacto), el Japanese Garden dentro del Botanic Garden (estanques de koi y puentes rojos, con una cuota pequeña de foto), las calles de ladrillo de los Stockyards y Mule Alley, y el verde junto al río en Trinity Park. Dime el estilo que buscas y te acomodo el lugar; lo podemos hacer como sesión save-the-date o dentro del mismo día."
      },
      {
        "q": "¿En qué parte de Fort Worth hacen la recepción las familias?",
        "a": "En todos lados, según la parroquia. Muchas familias del North Side la dejan cerca de North Main; otras reservan salones por la South Freeway cerca de La Gran Plaza, por los corredores del este como East Lancaster, o en los salones tipo granero por los Stockyards. Mándame tu iglesia y tu salón cuando me escribas y armo el itinerario para que el traslado entre los dos funcione."
      },
      {
        "q": "¿Ofreces foto y video para quinceañeras en Fort Worth?",
        "a": "Sí. Las colecciones Signature y Legacy incluyen fotógrafo y camarógrafo para que tengas los dos, y en esas colecciones con video recibes un adelanto la misma semana, antes de que estén listas la galería y la película completas. Si quieres solo foto, Moments y Essential lo cubren."
      },
      {
        "q": "¿Qué zonas alrededor de Fort Worth cubres?",
        "a": "Todo el condado de Tarrant y el resto del metroplex — Haltom City, North Richland Hills, Saginaw, White Settlement, Benbrook, Crowley, Burleson, Arlington y más — sin cargo por traslado. Si tu iglesia está en Fort Worth y tu recepción queda a unos pueblos de distancia, para mí es un día normal de quinceañera en Fort Worth. Aparta tu fecha en /reserve."
      }
    ]
  },
  "arlington": {
    "intro": [
      "Arlington doesn't have one old downtown the way Fort Worth or Dallas do. It spreads wide between the two of them, and quinceañera families pull from both sides. The Mexican-American community here is anchored in Old Town and the central corridors off Division Street and Cooper, where Spanish is the language of the panadería and the neighborhood parish. A quince in Arlington tends to gather guests from Grand Prairie, Mansfield, and the Mid-Cities, all a short drive away.",
      "What makes Arlington portraits different is the range packed into one city. The Entertainment District gives you the bold, unmistakable backdrops: Globe Life Field, AT&T Stadium, and the granite monument sculptures at Richard Greene Linear Park sitting right between them. Ten minutes north, River Legacy Parks opens into 1,300 acres of bottomland forest along the Trinity River, and Veterans Park puts gazebos, garden beds, and spring bluebonnets in the frame. We can shoot a stadium-sized statement and a quiet green portrait the same afternoon.",
      "I photograph one quinceañera a day in Arlington, start to finish: the Sunday misa at a central or south-side parish, portraits wherever you want them, el vals, and the reception, whether your hall is out along Pioneer Parkway or down in South Arlington near Cooper and I-20. Everything is bilingual, English or Spanish, so your grandparents follow every direction as easily as you do, and there's no travel fee anywhere in the metroplex."
    ],
    "introEs": [
      "Arlington no tiene un solo centro histórico como Fort Worth o Dallas; se extiende ancho entre las dos ciudades, y las familias de quinceañera llegan de los dos lados. La comunidad mexicana aquí se concentra en Old Town y en los corredores centrales por Division Street y Cooper, donde el español es el idioma de la panadería y de la parroquia del barrio. Una quince en Arlington suele juntar invitados de Grand Prairie, Mansfield y los Mid-Cities, todos a unos minutos.",
      "Lo que hace distintas las fotos en Arlington es la variedad que cabe en una sola ciudad. El Entertainment District te da los fondos llamativos e inconfundibles: el Globe Life Field, el AT&T Stadium y las esculturas de granito de Richard Greene Linear Park justo en medio de los dos. Diez minutos al norte, River Legacy Parks se abre en 1,300 acres de bosque junto al río Trinity, y Veterans Park pone glorietas, jardines y campos de bluebonnets en primavera. Podemos hacer una foto del tamaño de un estadio y un retrato verde y tranquilo la misma tarde.",
      "Fotografío una sola quinceañera al día en Arlington, de principio a fin: la misa del domingo en una parroquia del centro o del sur, las fotos donde tú quieras, el vals y la recepción, ya sea que tu salón esté por Pioneer Parkway o en el sur de Arlington cerca de Cooper y la I-20. Todo es bilingüe, en inglés o español, para que tus abuelos sigan cada indicación igual de fácil que tú, y sin cargo por traslado en todo el metroplex."
    ],
    "photoSpots": [
      {
        "name": "Richard Greene Linear Park (Entertainment District)",
        "why": "The granite monument sculptures by Norm Hines sit in the heart of the Entertainment District, framed by AT&T Stadium and the ballpark. It's a dramatic, almost ancient-ruins backdrop that's unmistakably Arlington, with an open lawn and a lake for softer frames.",
        "whyEs": "Las esculturas de granito de Norm Hines están en pleno Entertainment District, enmarcadas por el AT&T Stadium y el estadio de béisbol. Es un fondo dramático, casi de ruinas antiguas, inconfundiblemente de Arlington, con pasto abierto y un lago para tomas más suaves."
      },
      {
        "name": "River Legacy Parks",
        "why": "1,300 acres of forest, trails, and Trinity River overlooks in northwest Arlington: green tunnels and golden light. Professional sessions here need a quick photo permit from Arlington Parks (817-459-5473), which I help you arrange.",
        "whyEs": "1,300 acres de bosque, senderos y miradores al río Trinity en el noroeste de Arlington: túneles verdes y luz dorada. Las sesiones profesionales aquí necesitan un permiso rápido de los parques de Arlington (817-459-5473), que yo te ayudo a gestionar."
      },
      {
        "name": "Veterans Park",
        "why": "Over 100 acres in central Arlington with gazebos, manicured garden beds, a pond and fountain, and patches of bluebonnets in spring. It's the classic, romantic portrait setting, close to most central-Arlington homes.",
        "whyEs": "Más de 100 acres en el centro de Arlington con glorietas, jardines cuidados, un estanque con fuente y campos de bluebonnets en primavera. Es el escenario clásico y romántico, cerca de la mayoría de las casas del centro de Arlington."
      },
      {
        "name": "Founders Plaza & Levitt Pavilion (Downtown Arlington)",
        "why": "Across from City Hall in downtown Arlington, the open plaza and performance stage give a clean, modern urban look: brick, columns, and city lines. A good contrast to the parks.",
        "whyEs": "Frente al City Hall en el centro de Arlington, la plaza abierta y el escenario dan un look urbano y moderno: ladrillo, columnas y líneas de la ciudad. Un buen contraste con los parques."
      },
      {
        "name": "Lake Arlington / Bowman Springs Park",
        "why": "On the southwest shoreline, big shade trees and open water make this the spot for golden-hour portraits with the lake behind you: calm, wide, and uncrowded in the late afternoon.",
        "whyEs": "En la orilla suroeste, los árboles grandes con sombra y el agua abierta lo hacen el lugar para retratos a la hora dorada con el lago detrás: tranquilo, amplio y sin gente a media tarde."
      },
      {
        "name": "Knapp Heritage Park (Old Town)",
        "why": "Three of Arlington's oldest structures, 1850s log cabins and a 1909 schoolhouse, preserved in Old Town and open to the public on weekends (free). A rustic, heritage backdrop a few blocks from the historic Mexican-American part of the city.",
        "whyEs": "Tres de las construcciones más antiguas de Arlington, cabañas de troncos de los 1850 y una escuela de 1909, preservadas en Old Town y abiertas al público los fines de semana (gratis). Un fondo rústico y con historia, a unas cuadras de la parte mexicana histórica de la ciudad."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Arlington?",
        "a": "My collections run from $1,800 (Moments) to $5,500 (Legacy), with Signature at $3,900 (photo and film together) the most popular. Every collection includes full print rights and hi-res images, and there's no travel fee anywhere in Arlington or the rest of DFW. A save-the-date session is $500. You can see exactly what's in each one on the investment page."
      },
      {
        "q": "Where are the best places to take quince pictures in Arlington?",
        "a": "For a bold look, the Entertainment District: Richard Greene Linear Park's granite sculptures with the stadiums behind you. For green and romantic, River Legacy Parks along the Trinity River or Veterans Park's gardens and gazebos. Lake Arlington works for golden-hour shoreline portraits, and downtown's Founders Plaza gives a clean urban frame. River Legacy needs a quick city photo permit, which I'll help arrange."
      },
      {
        "q": "What areas of Arlington do quinceañera receptions usually happen?",
        "a": "Banquet halls cluster along Pioneer Parkway toward Pantego, the Division Street corridor through central Arlington, and South Arlington near Cooper Street and I-20. I work in all of them and stay through the whole reception. Tell me where your hall is and I'll plan the day's timing around it, with no travel fee within DFW."
      },
      {
        "q": "Do you offer photo and video for a quinceañera in Arlington?",
        "a": "Yes. Signature ($3,900) is the most-booked because it pairs photography with a highlight film, and Legacy ($5,500) adds a long-form cinematic film and drone coverage. Every film collection includes a same-week sneak peek, so you'll have something to share before the full gallery is ready."
      },
      {
        "q": "What areas around Arlington do you serve?",
        "a": "Arlington sits in the center of everything, so besides the whole city I regularly photograph Grand Prairie, Mansfield, Pantego, Dalworthington Gardens, Kennedale, Fort Worth, and the Mid-Cities, all with no travel fee. I only take one celebration a day, though, so the surest way to hold your date is to check it early."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Arlington?",
        "a": "Mis colecciones van de $1,800 (Moments) a $5,500 (Legacy), y Signature, en $3,900 (foto y video juntos), es la más popular. Todas incluyen los derechos completos de impresión y las imágenes en alta resolución, y no hay cargo por traslado en Arlington ni en el resto de DFW. La sesión save-the-date cuesta $500. Puedes ver todo lo que incluye cada una en la página de inversión."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Arlington?",
        "a": "Para un look llamativo, el Entertainment District: las esculturas de granito de Richard Greene Linear Park con los estadios atrás. Para algo verde y romántico, River Legacy Parks junto al río Trinity o los jardines y glorietas de Veterans Park. Lake Arlington es ideal para retratos a la orilla con la luz dorada, y el Founders Plaza del centro da un marco urbano limpio. River Legacy pide un permiso rápido de foto de la ciudad, que yo te ayudo a tramitar."
      },
      {
        "q": "¿En qué zonas de Arlington se hacen las recepciones de quinceañera?",
        "a": "Los salones se concentran por Pioneer Parkway rumbo a Pantego, el corredor de Division Street en el centro de Arlington, y el sur de Arlington cerca de Cooper Street y la I-20. Trabajo en todos y me quedo toda la recepción. Dime dónde es tu salón y armo los tiempos del día alrededor de eso, sin cargo por traslado dentro de DFW."
      },
      {
        "q": "¿Ofreces foto y video para una quinceañera en Arlington?",
        "a": "Sí. Signature ($3,900) es la más reservada porque junta la fotografía con un video de momentos destacados, y Legacy ($5,500) agrega un video cinematográfico de larga duración y tomas con dron. Cada colección con video incluye un adelanto la misma semana, así tienes algo que compartir antes de que esté lista la galería completa."
      },
      {
        "q": "¿Qué zonas alrededor de Arlington cubres?",
        "a": "Arlington está en el centro de todo, así que además de toda la ciudad fotografío seguido en Grand Prairie, Mansfield, Pantego, Dalworthington Gardens, Kennedale, Fort Worth y los Mid-Cities, todo sin cargo por traslado. Eso sí, solo tomo una celebración al día, así que lo más seguro para apartar tu fecha es revisarla con tiempo."
      }
    ]
  },
  "mansfield": {
    "intro": [
      "Mansfield sits at the southeast corner of the metroplex, on the line where Tarrant County slips into Johnson County and the subdivisions give way to creeks, country-club fairways, and one of the largest park systems in this part of DFW. The Mexican-American families here have put down real roots: you'll hear Spanish at the Saturday vigil and Sunday Mass in the bilingual parishes east of downtown, and the panaderías and taquerías along the Broad Street and US-287 corridors stay busy all weekend when there's a quince. When a family in Mansfield plans the day, they tend to give themselves room to do every part of it.",
      "That's a gift for portraits, because the backdrops are here to match. Historic Downtown Mansfield gives you brick storefronts, the 1917 Farr Best Theater marquee, and a run of hand-painted murals along Main Street; ten minutes south, Elmer W. Oliver Nature Park opens up to ponds, a wooden boardwalk, and the windmill the whole city photographs — and by March the meadows fill in with bluebonnets. Add the rose garden at Katherine Rose Memorial Park and the shaded creek bridges of the Walnut Creek Linear Trail and you can build a portrait route that never repeats the same look twice.",
      "I photograph one quinceañera a day, so the day belongs to your family alone — la misa, the formal portraits, el vals, the baile sorpresa, and the reception, start to finish, with nothing on my calendar after you. Everything runs bilingual, every collection includes full print rights and high-resolution files, and the film collections come with a same-week sneak peek. Mansfield is a natural fit for the Signature and Legacy collections, where photo and cinematic film carry the whole night — but it's the day, not the package, that drives how I shoot it."
    ],
    "introEs": [
      "Mansfield está en el extremo sureste del metroplex, en la línea donde el condado de Tarrant se mete en el de Johnson y los fraccionamientos dan paso a arroyos, los fairways del club de golf y uno de los sistemas de parques más grandes de esta zona de DFW. Las familias mexicanas de aquí ya echaron raíces de verdad: se escucha español en la misa de vigilia del sábado y en las misas del domingo en las parroquias bilingües al este del centro, y las panaderías y taquerías por Broad Street y la US-287 no paran el fin de semana cuando hay quince. Cuando una familia de Mansfield planea el día, se da el tiempo para hacer cada parte como se debe.",
      "Eso es una ventaja para las fotos, porque los fondos están aquí para acompañarlo. El Historic Downtown te da fachadas de ladrillo, la marquesina del Farr Best Theater de 1917 y una serie de murales pintados a mano sobre Main Street; diez minutos al sur, el Elmer W. Oliver Nature Park se abre con lagunas, un puente de madera y el molino de viento que toda la ciudad fotografía — y para marzo los campos se llenan de bluebonnets. Súmale el jardín de rosas del Katherine Rose Memorial Park y los puentes sombreados del Walnut Creek Linear Trail y armas una ruta de fotos que nunca repite el mismo look.",
      "Fotografío una sola quinceañera al día, así que el día es solo de tu familia: la misa, las fotos formales, el vals, el baile sorpresa y la recepción, de principio a fin, sin nada más en mi agenda después de ustedes. Todo es bilingüe, cada colección incluye los derechos completos de impresión y los archivos en alta resolución, y las colecciones con video traen un adelanto la misma semana. Mansfield encaja natural con las colecciones Signature y Legacy, donde la foto y el video cinematográfico cargan toda la noche — pero es el día, no el paquete, lo que define cómo lo fotografío."
    ],
    "photoSpots": [
      {
        "name": "Elmer W. Oliver Nature Park",
        "why": "Eighty-plus acres of ponds, wooded canopy, a wooden boardwalk, and the iconic windmill — and in March the meadows fill with bluebonnets. The most photographed open space in Mansfield, and the easiest place to get a range of nature backdrops in a single stop.",
        "whyEs": "Más de ochenta acres de lagunas, arboledas, un puente de madera y el famoso molino de viento — y en marzo los campos se llenan de bluebonnets. El espacio más fotografiado de Mansfield y el lugar más fácil para tener varios fondos naturales en una sola parada."
      },
      {
        "name": "Katherine Rose Memorial Park (Katherine's Garden)",
        "why": "A 33-acre park with a dedicated rose garden right at the front and big mature trees — soft, formal, and classic, made for the gown and court portraits.",
        "whyEs": "Un parque de 33 acres con un jardín de rosas justo al frente y árboles grandes y maduros — suave, formal y clásico, hecho para las fotos del vestido y de la corte."
      },
      {
        "name": "Historic Downtown Mansfield (Main Street murals & Farr Best Theater)",
        "why": "Brick storefronts, the 1917 Farr Best Theater marquee, and a stretch of hand-painted Main Street murals give you an urban, editorial look without leaving town.",
        "whyEs": "Fachadas de ladrillo, la marquesina del Farr Best Theater de 1917 y un tramo de murales pintados a mano sobre Main Street te dan un look urbano y editorial sin salir de la ciudad."
      },
      {
        "name": "Walnut Creek Linear Trail",
        "why": "A shaded two-mile trail linking Town, Rose, and James McKnight parks, with creek bridges and natural tree canopies — green, private-feeling frames a short walk from downtown.",
        "whyEs": "Un sendero sombreado de dos millas que une los parques Town, Rose y James McKnight, con puentes sobre el arroyo y túneles de árboles — fondos verdes y tranquilos a pocos pasos del centro."
      },
      {
        "name": "Lucretia Mills Gazebo",
        "why": "A small historic gazebo near Broad Street and Walnut Creek, dressed up seasonally — a tidy, romantic single-spot backdrop for a few standout portraits.",
        "whyEs": "Un pequeño gazebo histórico cerca de Broad Street y Walnut Creek, decorado según la temporada — un fondo romántico y ordenado para unas cuantas fotos destacadas."
      },
      {
        "name": "Britton Park at Joe Pool Lake",
        "why": "On the Mansfield side of Joe Pool Lake, with open water and big sky — the spot for a sunset and golden-hour portraits (seasonal access, small entry fee).",
        "whyEs": "Del lado de Mansfield del lago Joe Pool, con agua abierta y cielo amplio — el lugar para el atardecer y las fotos de hora dorada (acceso por temporada, con cuota pequeña de entrada)."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Mansfield?",
        "a": "Collections run $1,800 (Moments), $2,500 (Essential), $3,900 (Signature, the most popular, photo and film), and $5,500 (Legacy). A save-the-date session is $500. Every collection includes full print rights and high-resolution files, and there's no travel fee anywhere in DFW, so Mansfield's southeast-corner location never adds to the price."
      },
      {
        "q": "Where are the best places to take quince pictures in Mansfield?",
        "a": "My go-to spots are Elmer W. Oliver Nature Park (the windmill, ponds, and spring bluebonnets), the rose garden at Katherine Rose Memorial Park, the Main Street murals and Farr Best Theater marquee in Historic Downtown, and the shaded bridges of the Walnut Creek Linear Trail. We can shoot these as a save-the-date session or fit a couple into the day's timeline."
      },
      {
        "q": "Where do Mansfield families usually hold the reception?",
        "a": "Most receptions land at event halls and banquet spaces along the US-287 and Highway 360 corridors, around the Broad Street and Matlock areas, and at downtown gathering spaces near Main Street. Tell me your church and your venue when you reach out and I'll build the timeline around both."
      },
      {
        "q": "Do you offer both photo and video for a Mansfield quinceañera?",
        "a": "Yes. The Signature ($3,900) and Legacy ($5,500) collections pair photography with cinematic film — Legacy adds a long-form film and drone coverage — and the film collections include a same-week sneak peek. If you don't need video, the photo-only Moments and Essential collections are there too."
      },
      {
        "q": "Which areas near Mansfield do you cover?",
        "a": "All of them — Mansfield sits between Arlington, Grand Prairie, Kennedale, Burleson, Midlothian, and Cedar Hill, and I photograph quinceañeras across the entire Dallas–Fort Worth metroplex with no travel fee. Wherever your misa and reception are, I'm there for the full day."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Mansfield?",
        "a": "Las colecciones van de $1,800 (Moments), $2,500 (Essential), $3,900 (Signature, la más pedida, foto y video) a $5,500 (Legacy). La sesión save-the-date cuesta $500. Cada colección incluye los derechos completos de impresión y los archivos en alta resolución, y no hay cargo por traslado en ningún punto de DFW, así que estar en el extremo sureste del metroplex nunca sube el precio."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Mansfield?",
        "a": "Mis lugares de cabecera son el Elmer W. Oliver Nature Park (el molino, las lagunas y los bluebonnets de primavera), el jardín de rosas del Katherine Rose Memorial Park, los murales de Main Street y la marquesina del Farr Best Theater en el Historic Downtown, y los puentes sombreados del Walnut Creek Linear Trail. Los podemos hacer como sesión save-the-date o acomodar un par dentro del itinerario del día."
      },
      {
        "q": "¿Dónde hacen la recepción las familias de Mansfield?",
        "a": "La mayoría de las recepciones cae en salones y espacios para eventos por los corredores de la US-287 y la Highway 360, por las zonas de Broad Street y Matlock, y en los espacios del centro cerca de Main Street. Dime tu iglesia y tu salón cuando me escribas y armo el itinerario alrededor de los dos."
      },
      {
        "q": "¿Ofreces foto y video para una quinceañera en Mansfield?",
        "a": "Sí. Las colecciones Signature ($3,900) y Legacy ($5,500) combinan fotografía con video cinematográfico — Legacy suma un video de larga duración y tomas con dron — y las colecciones con video incluyen un adelanto la misma semana. Si no necesitas video, también están Moments y Essential, solo de foto."
      },
      {
        "q": "¿Qué zonas cerca de Mansfield cubres?",
        "a": "Todas — Mansfield está entre Arlington, Grand Prairie, Kennedale, Burleson, Midlothian y Cedar Hill, y fotografío quinceañeras en todo el metroplex de Dallas–Fort Worth sin cargo por traslado. Donde sea que estén tu misa y tu recepción, ahí estoy todo el día."
      }
    ]
  },
  "farmers-branch": {
    "intro": [
      "Farmers Branch is compact, but its roots run deep. The City Center neighborhood — the blocks around Webb Chapel and Valley View — holds one of the highest concentrations of Mexican-American families of any neighborhood in the country, where most households speak Spanish at home and a quinceañera is something the whole street helps pull off. This is a town that knows exactly what the day means.",
      "Locals call it “the City in the Park,” and the centerpiece is the 27-acre Farmers Branch Historical Park sitting right in the middle of town. An 1890s white church, an 1885 Queen Anne cottage, brick walkways, a gazebo, and the Ruthan Rogers rose garden out front make it one of the best portrait settings in North Dallas — it looks like a different century, which is exactly the backdrop you want behind a full ballgown. (The city started life as “Mustang Branch” before the farmland gave it its name; the old depot, caboose, and log cabins on the grounds still tell that story.)",
      "I only book one celebration a day, so your Saturday is the only thing on my calendar — la misa, the portraits, your entrada, the father-daughter vals, the baile sorpresa, and the reception after, all of it documented by one photographer who is actually present for the whole thing. You keep full print rights and the high-resolution files, there is no travel fee anywhere in DFW, and on the film collections a same-week sneak peek lets you see the first images while the day is still fresh."
    ],
    "introEs": [
      "Farmers Branch es chiquito, pero de raíces hondas. El barrio de City Center —las cuadras por Webb Chapel y Valley View— tiene una de las concentraciones de familias mexicanas más altas de cualquier vecindario del país: en la mayoría de las casas se habla español y una quinceañera es algo que saca adelante toda la cuadra. Aquí se sabe muy bien lo que significa el día.",
      "Le dicen “la ciudad en el parque”, y el corazón es el Farmers Branch Historical Park, de 27 acres, justo en el centro del pueblo. Una iglesia blanca de los 1890, una casita Queen Anne de 1885, caminos de ladrillo, un kiosco y el jardín de rosas Ruthan Rogers al frente lo hacen uno de los mejores lugares para fotos de todo el norte de Dallas: parece de otra época, justo el fondo que quieres detrás de un vestido de gala. (El pueblo empezó llamándose “Mustang Branch” antes de que la tierra de cultivo le diera su nombre; la vieja estación de tren, el vagón y las cabañas de troncos del parque todavía lo cuentan.)",
      "Solo reservo una celebración al día, así que tu sábado es lo único en mi calendario: la misa, las fotos, tu entrada, el vals con tu papá, el baile sorpresa y la recepción, todo documentado por un fotógrafo que de verdad está presente toda la jornada. Te quedas con los derechos de impresión y los archivos en alta resolución, sin cargo por traslado en ningún punto de DFW, y en las colecciones con video, un adelanto la misma semana para que veas las primeras imágenes mientras el día sigue fresquecito."
    ],
    "photoSpots": [
      {
        "name": "Farmers Branch Historical Park (2540 Farmers Branch Ln)",
        "why": "Twenty-seven acres of restored 19th-century buildings in the middle of town — an 1890s white church, an 1885 Queen Anne cottage, a gazebo, brick walkways, and a depot with a caboose. It is the single most-used quince portrait spot in the city, and it is fully public.",
        "whyEs": "Veintisiete acres de edificios restaurados del siglo XIX en pleno centro: una iglesia blanca de los 1890, una casita Queen Anne de 1885, un kiosco, caminos de ladrillo y una estación con su vagón. Es el lugar de fotos de quince más usado de la ciudad, y es totalmente público."
      },
      {
        "name": "The Rose Gardens of Farmers Branch (off Valley View Lane)",
        "why": "A cluster of award-winning EarthKind rose gardens — including the Ruthan Rogers garden — with formal beds and arbors. In spring and fall the blooms frame a gown beautifully, and it is a short walk from the Historical Park.",
        "whyEs": "Un conjunto de jardines de rosas EarthKind premiados —incluido el Ruthan Rogers— con jardineras formales y arcos. En primavera y otoño las flores enmarcan precioso un vestido, y queda a unos pasos del Historical Park."
      },
      {
        "name": "Gussie Field Watterworth Park (2610 Valley View Ln)",
        "why": "A 104-acre park with a creek, a small lake, big shade trees, and wide open lawns — room for the full court to spread out for relaxed, natural-light group shots. The rose gardens sit right along its trail.",
        "whyEs": "Un parque de 104 acres con arroyo, un lago pequeño, árboles grandes y prados amplios: espacio para que toda la corte se acomode en fotos de grupo con luz natural. Los jardines de rosas están justo sobre su sendero."
      },
      {
        "name": "Brookhaven Trail (near Brookhaven College)",
        "why": "A shaded, tree-lined paved trail that runs by Brookhaven College and links into the Addison Trail. It gives you a quiet green-tunnel look for softer, candid portraits away from any crowd.",
        "whyEs": "Un sendero pavimentado con sombra y bordeado de árboles que pasa por Brookhaven College y conecta con el Addison Trail. Te da un túnel verde tranquilo para retratos más suaves y espontáneos, lejos del gentío."
      },
      {
        "name": "Mercer Crossing lake trail (west Farmers Branch)",
        "why": "The newer west side of the city, with a lake and a hike-and-bike trail along the water and modern architecture. It is the clean, contemporary contrast to the historic park if you want a second, more current look.",
        "whyEs": "El lado oeste más nuevo de la ciudad, con un lago y un sendero para caminar y andar en bici junto al agua, además de arquitectura moderna. Es el contraste limpio y actual al parque histórico si quieres un segundo look más contemporáneo."
      }
    ],
    "faqs": [
      {
        "q": "How much does a quinceañera photographer cost in Farmers Branch?",
        "a": "My collections run $1,800 (Moments) and $2,500 (Essential) for photography, $3,900 for Signature — the most popular, photo and film together — and $5,500 for Legacy. A separate save-the-date session is $500. Pricing is the same across DFW with no travel fee to Farmers Branch, and every collection includes full print rights and the high-resolution files."
      },
      {
        "q": "Where are the best places to take quince pictures in Farmers Branch?",
        "a": "The Farmers Branch Historical Park is the top pick — 27 acres with an 1890s white church, a Queen Anne cottage, a gazebo, and brick walkways. The Rose Gardens of Farmers Branch off Valley View Lane and the lawns and creek at Gussie Field Watterworth Park are close by, and the Brookhaven Trail and the Mercer Crossing lake give you shaded and modern looks. All of them are public; we just plan around the light and your timeline."
      },
      {
        "q": "Where do families hold quinceañera receptions in Farmers Branch?",
        "a": "Some celebrate right on the city's own Historical Park grounds, while many book banquet halls along the LBJ Freeway (I-635) corridor and the Valley View Lane area, or a salón just over the line in Carrollton or Northwest Dallas. Wherever the reception lands, I cover the church, portraits, and the party as one continuous day."
      },
      {
        "q": "Do you offer both photo and video in Farmers Branch?",
        "a": "Yes. The Signature collection ($3,900, my most popular) and Legacy ($5,500) both pair photography with film, so you get stills and a cinematic edit of the misa, the vals, and the reception. The film collections also include a same-week sneak peek."
      },
      {
        "q": "What areas near Farmers Branch do you serve?",
        "a": "Farmers Branch sits right against Carrollton, Addison, Irving, and Northwest Dallas, and I photograph quinceañeras across all of them — plus Coppell, Lewisville, and the rest of the metroplex — with no travel fee anywhere in DFW."
      }
    ],
    "faqsEs": [
      {
        "q": "¿Cuánto cuesta un fotógrafo de quinceañera en Farmers Branch?",
        "a": "Mis colecciones van desde $1,800 (Moments) y $2,500 (Essential) para fotografía, $3,900 la Signature —la más popular, foto y video juntos— y $5,500 la Legacy. La sesión de save-the-date aparte cuesta $500. El precio es el mismo en todo DFW, sin cargo por traslado a Farmers Branch, y todas las colecciones incluyen los derechos de impresión y los archivos en alta resolución."
      },
      {
        "q": "¿Cuáles son los mejores lugares para tomar fotos de quince en Farmers Branch?",
        "a": "El Farmers Branch Historical Park es el favorito: 27 acres con una iglesia blanca de los 1890, una casita Queen Anne, un kiosco y caminos de ladrillo. Cerquita están las Rose Gardens de Farmers Branch por Valley View Lane y los prados y el arroyo del Gussie Field Watterworth Park, y para algo con sombra o más moderno tienes el Brookhaven Trail y el lago de Mercer Crossing. Todos son públicos; solo planeamos según la luz y tu itinerario."
      },
      {
        "q": "¿Dónde hacen las familias las recepciones de quinceañera en Farmers Branch?",
        "a": "Algunas celebran en los mismos terrenos del Historical Park de la ciudad, y muchas reservan salones por el corredor del LBJ Freeway (I-635) y la zona de Valley View Lane, o un salón cruzando a Carrollton o el noroeste de Dallas. Donde sea que caiga la recepción, cubro la iglesia, las fotos y la fiesta como un solo día continuo."
      },
      {
        "q": "¿Ofreces foto y video en Farmers Branch?",
        "a": "Sí. La colección Signature ($3,900, la más popular) y la Legacy ($5,500) combinan fotografía con video, así te llevas las fotos y una edición cinematográfica de la misa, el vals y la recepción. Las colecciones con video también incluyen un adelanto la misma semana."
      },
      {
        "q": "¿Qué áreas cerca de Farmers Branch cubres?",
        "a": "Farmers Branch pega con Carrollton, Addison, Irving y el noroeste de Dallas, y fotografío quinceañeras en todas —además de Coppell, Lewisville y el resto del metroplex— sin cargo por traslado en ningún punto de DFW."
      }
    ]
  }
};

export function getCityContent(slug: string): CityContent | undefined {
  return cityContent[slug];
}
