/**
 * budget-details.ts — exactly what a family gets with each option, as plain
 * lines with an icon, so the page answers the questions before they're asked.
 *
 * Only facts the site already states (packages, comparison table, agreement).
 * Hours, prices and counts that the owner can change come from the price book.
 */
import { usd, type AddOnId, type PriceBook } from "@/lib/commission";
import type { EventTier } from "@/lib/budget-options";

export type DetailIcon = "team" | "clock" | "moments" | "camera" | "film" | "session" | "album" | "files" | "phone" | "pin" | "chat" | "no";
export type DetailLine = { icon: DetailIcon; label: string; text: string };
export type Details = { included: DetailLine[]; notIncluded: string[] };

type L = "en" | "es";

const t = (lang: L, en: string, es: string) => (lang === "es" ? es : en);

export function detailsFor(tier: EventTier, hours: number, addOns: readonly AddOnId[], lang: L, book: PriceBook): Details {
  const hrs = t(lang, `${hours} hours`, `${hours} horas`);
  const L_TEAM = t(lang, "Who comes", "Quién va");
  const L_TIME = t(lang, "How long", "Cuánto tiempo");
  const L_COVER = t(lang, "What we cover", "Qué cubrimos");
  const L_PHOTOS = t(lang, "Photos", "Fotos");
  const L_VIDEO = t(lang, "Video", "Video");
  const L_SESSION = t(lang, "Before the day", "Antes del día");
  const L_ALBUM = t(lang, "Album", "Álbum");
  const L_FILES = t(lang, "Files", "Archivos");
  const L_SOCIAL = t(lang, "For social media", "Para redes sociales");
  const session = {
    icon: "session" as const,
    label: L_SESSION,
    text: t(lang, "A dress or save-the-date session, 30–40 edited photos, booked after your deposit", "Una sesión con el vestido o de save the date, 30–40 fotos editadas, después de tu depósito"),
  };
  const fullFilm = t(lang, "The full-length film of her day: the misa, every presentation and toast in full, 15–20 minutes of dancing", "El video completo de su día: la misa, cada presentación y brindis completos, 15–20 minutos de baile");

  switch (tier) {
    case "moments": {
      const film = addOns.includes("momentsfilm");
      return {
        included: [
          { icon: "team", label: L_TEAM, text: t(lang, "1 photographer", "1 fotógrafo") },
          { icon: "clock", label: L_TIME, text: hrs },
          {
            icon: "moments",
            label: L_COVER,
            text:
              hours > book.packages.moments.hours
                ? t(lang, "The grand entrance, vals, surprise dance, toast and family portraits, plus time on the dance floor", "La entrada, el vals, el baile sorpresa, el brindis y las fotos con la familia, más tiempo en la pista de baile")
                : t(lang, "The grand entrance, vals, surprise dance, toast and family portraits", "La entrada, el vals, el baile sorpresa, el brindis y las fotos con la familia"),
          },
          {
            icon: "camera",
            label: L_PHOTOS,
            text: hours > book.packages.moments.hours ? t(lang, "50+ edited photos, more for each added hour", "Más de 50 fotos editadas, más por cada hora extra") : t(lang, "50+ edited photos", "Más de 50 fotos editadas"),
          },
          ...(film
            ? [{ icon: "film" as const, label: L_VIDEO, text: t(lang, "A film of the whole presentation, recorded with a 2–3 camera setup", "Un video de toda la presentación, grabado con 2–3 cámaras") }]
            : []),
        ],
        notIncluded: [
          ...(film ? [] : [t(lang, `Video (add a film of the presentation for ${usd(book.addOns.momentsfilm)})`, `Video (agrega un video de la presentación por ${usd(book.addOns.momentsfilm)})`)]),
          t(lang, "Getting ready, the misa or the whole night", "El arreglo, la misa o toda la noche"),
          t(lang, "A dress or save-the-date session", "Sesión con el vestido o de save the date"),
          t(lang, "Printed album", "Álbum impreso"),
        ],
      };
    }
    case "solo":
      return {
        included: [
          { icon: "team", label: L_TEAM, text: t(lang, "1 hybrid shooter, taking photos and video at the same time with a 2–3 camera setup", "1 fotógrafo y videógrafo en uno, que toma fotos y graba al mismo tiempo con 2–3 cámaras") },
          { icon: "clock", label: L_TIME, text: hrs },
          { icon: "camera", label: L_PHOTOS, text: t(lang, "150+ edited photos", "Más de 150 fotos editadas") },
          { icon: "film", label: L_VIDEO, text: t(lang, "The full-length film of her day, cut from the 2–3 camera angles", "El video completo de su día, editado con los 2–3 ángulos de cámara") },
        ],
        notIncluded: [
          t(lang, `A highlight film (add one for ${usd(book.addOns.highlight)})`, `Video resumen (agrégalo por ${usd(book.addOns.highlight)})`),
          t(lang, "A dress or save-the-date session", "Sesión con el vestido o de save the date"),
          t(lang, "A second photographer", "Un segundo fotógrafo"),
          t(lang, "Printed album", "Álbum impreso"),
        ],
      };
    case "cinema":
      return {
        included: [
          { icon: "team", label: L_TEAM, text: t(lang, "1 photographer + 1 videographer", "1 fotógrafo + 1 videógrafo") },
          { icon: "clock", label: L_TIME, text: hrs },
          session,
          { icon: "camera", label: L_PHOTOS, text: t(lang, "400+ edited photos", "Más de 400 fotos editadas") },
          { icon: "film", label: L_VIDEO, text: `${fullFilm}${t(lang, ", plus a 1-minute highlight", ", más un resumen de 1 minuto")}` },
          { icon: "phone", label: L_SOCIAL, text: t(lang, "2 short videos", "2 videos cortos") },
        ],
        notIncluded: [t(lang, "Printed album", "Álbum impreso"), t(lang, "A second photographer", "Un segundo fotógrafo")],
      };
    case "trio":
      return {
        included: [
          { icon: "team", label: L_TEAM, text: t(lang, "2 photographers + 1 videographer", "2 fotógrafos + 1 videógrafo") },
          { icon: "clock", label: L_TIME, text: hrs },
          session,
          { icon: "camera", label: L_PHOTOS, text: t(lang, "700+ edited photos", "Más de 700 fotos editadas") },
          { icon: "film", label: L_VIDEO, text: `${fullFilm}${t(lang, ", plus a 3–5 minute highlight film", ", más un resumen de 3–5 minutos")}` },
          { icon: "phone", label: L_SOCIAL, text: t(lang, "4 short videos", "4 videos cortos") },
          { icon: "album", label: L_ALBUM, text: t(lang, "Printed album, 10×10 in, 40 pages", "Álbum impreso de 25×25 cm, 40 páginas") },
          { icon: "files", label: L_FILES, text: t(lang, "All your original photo files", "Todos tus archivos originales de fotos") },
        ],
        notIncluded: [],
      };
  }
}

/** The questions families always ask, answered from the price book and the agreement. */
export function goodToKnow(lang: L, book: PriceBook): DetailLine[] {
  return [
    {
      icon: "session",
      label: t(lang, "Holding your date", "Apartar tu fecha"),
      text: t(
        lang,
        `A ${book.depositPercent}% deposit holds your date once we confirm it. The rest is due ${book.balanceDueDays} days before the event. Nothing is charged today.`,
        `Un depósito del ${book.depositPercent}% aparta tu fecha cuando la confirmamos. El resto se paga ${book.balanceDueDays} días antes del evento. Hoy no se cobra nada.`,
      ),
    },
    {
      icon: "pin",
      label: t(lang, "Travel", "Traslado"),
      text: t(lang, "No travel fee anywhere in Dallas–Fort Worth. Outside DFW, travel is quoted separately.", "Sin cargo por traslado en todo Dallas–Fort Worth. Fuera de DFW, el traslado se cotiza aparte."),
    },
    {
      icon: "team",
      label: t(lang, "Your team", "Tu equipo"),
      text: t(lang, "Dang and Yvonne, the owners, are at every TX Quince event, with our small trusted crew. Every gallery and film is edited by us, the owners.", "Dang y Yvonne, los dueños, están en cada evento de TX Quince, con nuestro pequeño equipo de confianza. Nosotros, los dueños, editamos cada galería y cada video."),
    },
    {
      icon: "chat",
      label: t(lang, "Language", "Idioma"),
      text: t(lang, "Everything in English or Spanish, from the first message to the last photo.", "Todo en español o inglés, desde el primer mensaje hasta la última foto."),
    },
    {
      icon: "files",
      label: t(lang, "In writing", "Por escrito"),
      text: t(lang, "You get a written agreement with everything above before you pay anything.", "Recibes un contrato por escrito con todo lo de arriba antes de pagar nada."),
    },
  ];
}
