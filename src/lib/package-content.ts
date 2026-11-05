/**
 * package-content.ts — what each package INCLUDES, in words (EN + ES).
 *
 * Part of the live price book (PriceBook.content), so the owner edits it at
 * /admin/packages and one save changes every place that describes a package:
 * the package cards, the home page rows, the comparison table, the budget
 * page, the agreement and the SEO pages. Nothing here is a price.
 *
 * Short tokens inside a package's own text are filled at render time
 * (src/lib/package-text.ts), so a number typed once shows up everywhere:
 *   {photos}    that package's photo count ("150+", "200–300")
 *   {cameras}   that package's camera count ("2–3", "2")
 *   {hours}     hours included ("2", "1.5")
 *   {maxhours}  most hours it can grow to
 *   {session}   photos in the dress or save-the-date session ("30–40")
 * Price tokens such as {{addon.highlight}} work too (src/lib/price-text.ts).
 *
 * An empty line means "not included": that row is left out everywhere.
 */
import { z } from "zod";
import type { AddOnId, PublicTierId, TierId } from "./commission";

export type L = { en: string; es: string };

export type PackageContent = {
  /** Photo count, the same in both languages: "150+", "200–300". */
  photos: string;
  /** Said after the photo count ("more for each added hour"); empty = nothing. */
  photosNote: L;
  /** Camera count used by {cameras}: "2–3", "2". Empty when it doesn't apply. */
  cameras: string;
  /** Who comes: "1 photographer + 1 videographer". */
  team: L;
  /** The paragraph on the package card. */
  summary: L;
  /** The short line on the home page package list. */
  detail: L;
  /** The points on the package card. */
  bullets: L[];
  /** What we cover on the day (budget page). Empty = not shown. */
  coverage: L;
  /** The full-length film. Empty = no film in this package. */
  video: L;
  /** The highlight film's length. Empty = none. */
  highlight: L;
  /** Short videos for social media. Empty = none. */
  social: L;
  /** The dress or save-the-date session. Empty = none. */
  session: L;
  /** The printed album. Empty = none. */
  album: L;
  /** Original files. Empty = none. */
  files: L;
  /** "Not included" lines on the budget page. */
  notIncluded: L[];
};

const l = (en: string, es: string): L => ({ en, es });
const NONE = l("", "");

/** Where the full-length film runs: her whole day, as it happened. */
const FULL_FILM = l(
  "Her whole day: the misa, every presentation and toast in full, 15–20 min of dancing",
  "Todo su día: la misa, cada presentación y brindis completos, 15–20 min de baile",
);
const SESSION_INCLUDED = l("Included after your deposit · {session} photos", "Incluida después del depósito · {session} fotos");

/** The launch wording. Only what the site already promised (Nov 2026). */
export const DEFAULT_PACKAGE_CONTENT: Record<PublicTierId, PackageContent> = {
  study: {
    photos: "60",
    photosNote: NONE,
    cameras: "",
    team: l("1 photographer", "1 fotógrafo"),
    summary: l(
      "Photos only. A relaxed session before the big day — her dress, her style, beautiful light.",
      "Solo fotos. Una sesión tranquila antes del gran día — su vestido, su estilo, luz hermosa.",
    ),
    detail: l("Photos only · {photos} edited photos", "Solo fotos · {photos} fotos editadas"),
    bullets: [
      l("Photos only — no video", "Solo fotos — sin video"),
      l("A relaxed session in her dress, before the big day", "Una sesión tranquila con su vestido, antes del gran día"),
      l("{photos} edited photos", "{photos} fotos editadas"),
    ],
    coverage: NONE,
    video: NONE,
    highlight: NONE,
    social: NONE,
    session: l("Yes — that's this package", "Sí — es este paquete"),
    album: NONE,
    files: NONE,
    notIncluded: [],
  },
  moments: {
    photos: "50+",
    photosNote: l("more for each added hour", "más por cada hora extra"),
    cameras: "2–3",
    team: l("1 photographer", "1 fotógrafo"),
    summary: l(
      "One photographer for the part of the day you care about most: the presentation and family portraits, with some dancing if you add an hour. For smaller budgets.",
      "Un fotógrafo para la parte del día que más te importa: la presentación y las fotos con la familia, y algo de baile si agregas una hora. Para presupuestos más chicos.",
    ),
    detail: l(
      "The presentation and family portraits · {team} · {photos} photos",
      "La presentación y fotos con la familia · {team} · {photos} fotos",
    ),
    bullets: [
      l("{team}, from {hours} hours", "{team}, desde {hours} horas"),
      l("The grand entrance, vals, surprise dance, toast and family portraits", "La entrada, el vals, el baile sorpresa, el brindis y las fotos con la familia"),
      l("Add a film of the presentation", "Agrega un video de la presentación"),
      l("{photos} edited photos for {hours} hours", "{photos} fotos editadas por {hours} horas"),
    ],
    coverage: l(
      "The grand entrance, vals, surprise dance, toast and family portraits",
      "La entrada, el vals, el baile sorpresa, el brindis y las fotos con la familia",
    ),
    video: NONE,
    highlight: NONE,
    social: NONE,
    session: NONE,
    album: NONE,
    files: NONE,
    notIncluded: [
      l("Getting ready, the misa or the whole night", "El arreglo, la misa o toda la noche"),
      l("A dress or save-the-date session", "Sesión con el vestido o de save the date"),
      l("Printed album", "Álbum impreso"),
    ],
  },
  solo: {
    photos: "150+",
    photosNote: NONE,
    cameras: "2–3",
    team: l("1 hybrid shooter (photo + video), {cameras} camera setup", "1 fotógrafo y videógrafo en uno, {cameras} cámaras"),
    summary: l(
      "One shooter with a {cameras} camera setup, taking photos and filming at the same time, so wherever the action is, a camera is on it. The budget-friendly way to get the photos and the full-length film of her day.",
      "Una sola persona con {cameras} cámaras, que toma fotos y graba al mismo tiempo, así que donde pase algo, hay una cámara apuntando. La forma más económica de tener las fotos y el video completo de su día.",
    ),
    detail: l(
      "Photo + video from a {cameras} camera setup · full-length film · {photos} photos",
      "Foto + video con {cameras} cámaras · video completo · {photos} fotos",
    ),
    bullets: [
      l("{team}", "{team}"),
      l("Photos and video at once, a camera on every angle of the action", "Fotos y video a la vez, una cámara en cada ángulo de la acción"),
      l("The full-length film of her day", "El video completo de su día"),
      l("{photos} edited photos", "{photos} fotos editadas"),
    ],
    coverage: NONE,
    video: l(
      "Her whole day, cut from the {cameras} camera angles: the misa, presentations, toasts and dancing",
      "Todo su día, editado con los {cameras} ángulos de cámara: la misa, presentaciones, brindis y baile",
    ),
    highlight: NONE,
    social: NONE,
    session: NONE,
    album: NONE,
    files: NONE,
    notIncluded: [
      l("A dress or save-the-date session", "Sesión con el vestido o de save the date"),
      l("A second photographer", "Un segundo fotógrafo"),
      l("Printed album", "Álbum impreso"),
    ],
  },
  cinema: {
    photos: "400+",
    photosNote: NONE,
    cameras: "",
    team: l("1 photographer + 1 videographer", "1 fotógrafo + 1 videógrafo"),
    summary: l(
      "One photographer and one videographer for her day, plus a dress or save-the-date session: the photos, and the full-length film of everything that happened.",
      "Un fotógrafo y un videógrafo para su día, más una sesión con el vestido o de save the date: las fotos y el video completo de todo lo que pasó.",
    ),
    detail: l(
      "Dress or save-the-date session ({session} photos) · full-length film + 1-min highlight · {photos} photos",
      "Sesión con el vestido o save the date ({session} fotos) · video completo + resumen de 1 min · {photos} fotos",
    ),
    bullets: [
      l("{team}", "{team}"),
      l("A dress or save-the-date session ({session} photos), booked after your deposit", "Una sesión con el vestido o de save the date ({session} fotos), después de tu depósito"),
      l("The full-length film of her day + a 1-minute highlight", "El video completo de su día + un resumen de 1 minuto"),
      l("{photos} edited photos", "{photos} fotos editadas"),
    ],
    coverage: NONE,
    video: FULL_FILM,
    highlight: l("1 minute", "1 minuto"),
    social: l("2", "2"),
    session: SESSION_INCLUDED,
    album: NONE,
    files: NONE,
    notIncluded: [l("Printed album", "Álbum impreso"), l("A second photographer", "Un segundo fotógrafo")],
  },
  trio: {
    photos: "700+",
    photosNote: NONE,
    cameras: "",
    team: l("2 photographers + 1 videographer", "2 fotógrafos + 1 videógrafo"),
    summary: l(
      "Two photographers and one videographer, so both sides of the room are covered while the film rolls, plus a dress or save-the-date session and a printed album. Our pick for most families.",
      "Dos fotógrafos y un videógrafo, para cubrir los dos lados del salón mientras se graba el video, más una sesión con el vestido o de save the date y un álbum impreso. Nuestra recomendación para la mayoría de las familias.",
    ),
    detail: l(
      "Dress or save-the-date session ({session} photos) · full-length film + 3–5 min highlight · {photos} photos · album",
      "Sesión con el vestido o save the date ({session} fotos) · video completo + resumen de 3–5 min · {photos} fotos · álbum",
    ),
    bullets: [
      l("{team}", "{team}"),
      l("A dress or save-the-date session ({session} photos), booked after your deposit", "Una sesión con el vestido o de save the date ({session} fotos), después de tu depósito"),
      l("The full-length film + a 3–5 minute highlight film", "El video completo + un resumen de 3–5 minutos"),
      l("{photos} photos and a printed album", "{photos} fotos y un álbum impreso"),
    ],
    coverage: NONE,
    video: FULL_FILM,
    highlight: l("3–5 minutes", "3–5 minutos"),
    social: l("4", "4"),
    session: SESSION_INCLUDED,
    album: l("10×10 in, 40 pages", "25×25 cm, 40 páginas"),
    files: l("Photos", "Fotos"),
    notIncluded: [],
  },
};

/**
 * Retired packages: fixed wording, so an older inquiry or agreement still
 * reads exactly as it was made. Not editable.
 */
export const RETIRED_PACKAGE_CONTENT: Record<Exclude<TierId, PublicTierId>, PackageContent> = {
  production: {
    photos: "700+",
    photosNote: NONE,
    cameras: "",
    team: l("4 people — you pick photo or video", "4 personas — tú eliges foto o video"),
    summary: l(
      "A team of four plus a coordinator who runs the day, so you can enjoy it. Includes a portrait session and a printed album.",
      "Un equipo de cuatro más una coordinadora que lleva el día, para que tú lo disfrutes. Incluye sesión de retratos y álbum impreso.",
    ),
    detail: l(
      "Coordinator · portraits · full-length film + 3–5 min highlight · 700+ photos · album",
      "Coordinadora · retratos · video completo + resumen de 3–5 min · 700+ fotos · álbum",
    ),
    bullets: [
      l("A coordinator who runs the day", "Una coordinadora que lleva el día"),
      l("A portrait session at 1 location", "Una sesión de retratos en 1 lugar"),
      l("The full-length film + a 3–5 minute highlight film", "El video completo + un resumen de 3–5 minutos"),
      l("700+ photos and a printed album", "Más de 700 fotos y un álbum impreso"),
    ],
    coverage: NONE,
    video: FULL_FILM,
    highlight: l("3–5 minutes", "3–5 minutos"),
    social: l("4", "4"),
    session: l("1 location", "1 lugar"),
    album: l("10×10 in, 40 pages", "25×25 cm, 40 páginas"),
    files: l("Photos", "Fotos"),
    notIncluded: [],
  },
  archive: {
    photos: "1,000+",
    photosNote: NONE,
    cameras: "",
    team: l("5 people — you pick photo or video", "5 personas — tú eliges foto o video"),
    summary: l(
      "Everything in the Full Celebration, plus a second day for portraits, a team of five, and a larger album.",
      "Todo lo de la Celebración completa, más un segundo día de retratos, un equipo de cinco y un álbum más grande.",
    ),
    detail: l("20 min video · 1,000+ photos · large album", "Video de 20 min · 1,000+ fotos · álbum grande"),
    bullets: [
      l("Everything in the Full Celebration", "Todo lo de la Celebración completa"),
      l("A second day for portraits at 2 locations", "Un segundo día de retratos en 2 lugares"),
      l("A 20-minute video and a 2-minute trailer", "Un video de 20 minutos y un tráiler de 2 minutos"),
      l("1,000+ photos and a large album in a gift box", "Más de 1,000 fotos y un álbum grande en caja de regalo"),
    ],
    coverage: NONE,
    video: l("20 minutes", "20 minutos"),
    highlight: l("2 minutes", "2 minutos"),
    social: l("6, first one in 48 hours", "6, el primero en 48 horas"),
    session: l("2 locations, on its own day", "2 lugares, en su propio día"),
    album: l("12×12 in, 60 pages, gift box", "30×30 cm, 60 páginas, caja de regalo"),
    files: l("Photos + video", "Fotos + video"),
    notIncluded: [],
  },
};

/** What each extra is, in words. Editable with the packages. */
export const DEFAULT_ADD_ON_NOTES: Record<AddOnId, L> = {
  momentsfilm: l(
    "A film of the whole presentation (entrance, vals, surprise dance and toast), recorded with a {{cameras.moments}} camera setup.",
    "Un video de toda la presentación (la entrada, el vals, el baile sorpresa y el brindis), grabado con {{cameras.moments}} cámaras.",
  ),
  destination: l(
    "A photo session in her dress before the big day — a park, a garden, wherever she loves. {{session.photos}} edited photos.",
    "Una sesión de fotos con su vestido antes del gran día — un parque, un jardín, donde ella quiera. {{session.photos}} fotos editadas.",
  ),
  sameday: l(
    "A short highlight video of her day, ready within 24 hours to share with family.",
    "Un video corto con lo mejor de su día, listo en 24 horas para compartir con la familia.",
  ),
  super8: l(
    "Three minutes shot on real old-style film (Super 8), added to her video.",
    "Tres minutos grabados en película antigua de verdad (Super 8), dentro de su video.",
  ),
  parents: l("Two smaller 8×8 copies of her album, one for each home.", "Dos copias más pequeñas de 20×20 cm de su álbum, una para cada hogar."),
  secondday: l(
    "A separate day for portraits in her dress, photos and video, at up to 2 locations.",
    "Un día aparte para retratos con su vestido, fotos y video, en hasta 2 lugares.",
  ),
  coordinator: l(
    "Runs the schedule and lines up the court, so your family can just enjoy the day. Priced per day.",
    "Lleva el horario y organiza a la corte, para que tu familia solo disfrute. Precio por día.",
  ),
  highlight: l(
    "A 3–5 minute highlight film of her day, cut from the same footage as her full-length film.",
    "Un resumen de 3–5 minutos de su día, editado con las mismas tomas de su video completo.",
  ),
};

/** Photos in the dress or save-the-date session, used by {session}. */
export const DEFAULT_SESSION_PHOTOS = "30–40";

/* ---------------- validation ---------------- */

export const CONTENT_LIMITS = { short: 24, line: 300, paragraph: 600, bullets: 6, notIncluded: 8 } as const;

const text = (max: number, what: string) =>
  z.string({ message: `${what} must be text.` }).trim().max(max, `${what} can be at most ${max} characters.`);

const lang = (max: number, what: string, required = false) =>
  z.object({
    en: required ? text(max, `${what} (English)`).min(1, `${what} (English) can't be empty.`) : text(max, `${what} (English)`),
    es: required ? text(max, `${what} (Spanish)`).min(1, `${what} (Spanish) can't be empty.`) : text(max, `${what} (Spanish)`),
  }).strict();

const C = CONTENT_LIMITS;

export const packageContentSchema = (name: string) =>
  z
    .object({
      photos: text(C.short, `${name} photo count`).min(1, `${name} photo count can't be empty.`),
      photosNote: lang(C.line, `${name} photo note`),
      cameras: text(C.short, `${name} cameras`),
      team: lang(C.line, `${name} team`, true),
      summary: lang(C.paragraph, `${name} card paragraph`, true),
      detail: lang(C.line, `${name} home page line`, true),
      bullets: z
        .array(lang(C.line, `${name} card point`, true))
        .min(1, `${name} needs at least one card point.`)
        .max(C.bullets, `${name} can have at most ${C.bullets} card points.`),
      coverage: lang(C.line, `${name} what we cover`),
      video: lang(C.line, `${name} full-length film`),
      highlight: lang(C.line, `${name} highlight film`),
      social: lang(C.line, `${name} short videos`),
      session: lang(C.line, `${name} dress session`),
      album: lang(C.line, `${name} album`),
      files: lang(C.line, `${name} original files`),
      notIncluded: z
        .array(lang(C.line, `${name} not-included line`, true))
        .max(C.notIncluded, `${name} can have at most ${C.notIncluded} not-included lines.`),
    })
    .strict();

export const addOnNoteSchema = (name: string) => lang(C.line, `${name} description`, true);
export const sessionPhotosSchema = text(C.short, "Dress session photo count").min(1, "Dress session photo count can't be empty.");

/** Every package field, in the order the admin page shows them. */
export const CONTENT_FIELDS = [
  "team",
  "photos",
  "photosNote",
  "cameras",
  "coverage",
  "video",
  "highlight",
  "social",
  "session",
  "album",
  "files",
  "summary",
  "detail",
  "bullets",
  "notIncluded",
] as const satisfies readonly (keyof PackageContent)[];
