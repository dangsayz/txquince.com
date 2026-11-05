/**
 * budget-details.ts — exactly what a family gets with each option, as plain
 * lines with an icon, so the page answers the questions before they're asked.
 *
 * Every line comes from the live package wording (/admin/packages) and the
 * live prices, so it always matches the cards, the table and the agreement.
 */
import { addOnAllowed, fmtHours, usd, type AddOnId, type PriceBook } from "@/lib/commission";
import { addOnNote, photosLine, pkgField, pkgNotIncluded } from "@/lib/package-text";
import type { EventTier } from "@/lib/budget-options";

export type DetailIcon = "team" | "clock" | "moments" | "camera" | "film" | "session" | "album" | "files" | "phone" | "pin" | "chat" | "no";
export type DetailLine = { icon: DetailIcon; label: string; text: string };
export type Details = { included: DetailLine[]; notIncluded: string[] };

type L = "en" | "es";

const t = (lang: L, en: string, es: string) => (lang === "es" ? es : en);

export function detailsFor(tier: EventTier, hours: number, addOns: readonly AddOnId[], lang: L, book: PriceBook): Details {
  const pick = (v: { en: string; es: string } | null) => (v ? v[lang] : "");
  const lower = (x: string) => (x ? x[0].toLowerCase() + x.slice(1) : x);
  const h = fmtHours(hours);
  const included: DetailLine[] = [];
  const add = (icon: DetailIcon, label: string, text: string) => text && included.push({ icon, label, text });

  add("team", t(lang, "Who comes", "Quién va"), pick(pkgField(book, tier, "team")));
  add("clock", t(lang, "How long", "Cuánto tiempo"), h === "1" ? t(lang, "1 hour", "1 hora") : t(lang, `${h} hours`, `${h} horas`));
  add("moments", t(lang, "What we cover", "Qué cubrimos"), pick(pkgField(book, tier, "coverage")));
  const session = pick(pkgField(book, tier, "session"));
  if (session) add("session", t(lang, "Before the day", "Antes del día"), `${t(lang, "A dress or save-the-date session", "Una sesión con el vestido o de save the date")}, ${lower(session)}`);
  add("camera", t(lang, "Photos", "Fotos"), photosLine(book, tier)[lang]);
  // A chosen extra that is the package's film (Just the Moments) reads as its video line.
  const video = pick(pkgField(book, tier, "video")) || (addOns.includes("momentsfilm") ? addOnNote(book, "momentsfilm")[lang] : "");
  add("film", t(lang, "Full-length film", "Video completo"), video);
  const highlight = pick(pkgField(book, tier, "highlight"));
  if (highlight) add("film", t(lang, "Highlight film", "Video resumen"), highlight);
  else if (addOns.includes("highlight")) add("film", t(lang, "Highlight film", "Video resumen"), addOnNote(book, "highlight")[lang]);
  const social = pick(pkgField(book, tier, "social"));
  if (social) add("phone", t(lang, "Short videos for social media", "Videos cortos para redes"), social);
  add("album", t(lang, "Printed album", "Álbum impreso"), pick(pkgField(book, tier, "album")));
  add("files", t(lang, "Your original files", "Tus archivos originales"), pick(pkgField(book, tier, "files")));

  // Extras the package can add but this choice doesn't have, at their live price.
  const offers: string[] = [];
  if (!video && addOnAllowed(tier, "momentsfilm")) {
    offers.push(t(lang, `Video (add a film of the presentation for ${usd(book.addOns.momentsfilm)})`, `Video (agrega un video de la presentación por ${usd(book.addOns.momentsfilm)})`));
  }
  if (!highlight && !addOns.includes("highlight") && addOnAllowed(tier, "highlight")) {
    offers.push(t(lang, `A highlight film (add one for ${usd(book.addOns.highlight)})`, `Video resumen (agrégalo por ${usd(book.addOns.highlight)})`));
  }
  return { included, notIncluded: [...offers, ...pkgNotIncluded(book, tier).map((x) => x[lang])] };
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
      text: t(lang, "Your day is covered by our small in-house crew of photographers and videographers, sometimes with Dang or Yvonne, the owners, behind the camera. Every gallery and film is edited by us, the owners.", "Tu día lo cubre nuestro pequeño equipo de fotógrafos y videógrafos de casa, a veces con Dang o Yvonne, los dueños, detrás de la cámara. Nosotros, los dueños, editamos cada galería y cada video."),
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
