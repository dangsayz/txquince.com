/** → family, from "Email me my link": one fresh link per booking on that email. */
import { esc, familyEmail, prettyDate, type Built, type Lang } from "./layout";

export function magicLinkEmail(c: { lang: Lang; links: { eventDate: string; ref: string; link: string }[] }): Built {
  const es = c.lang === "es";
  const items = c.links.map((l) => ({
    label: `${prettyDate(l.eventDate, c.lang)} (${l.ref})`,
    link: l.link,
  }));
  return familyEmail({
    lang: c.lang,
    link: items[0]!.link,
    subject: es ? "Tu enlace de reservación de TX Quince" : "Your TX Quince booking link",
    title: es ? "Tu enlace privado" : "Your private link",
    paragraphs: [
      es
        ? "Alguien (esperamos que tú) pidió el enlace de tu reservación. Aquí está:"
        : "Someone (we hope you) asked for your booking link. Here it is:",
      es
        ? "Si no lo pediste, puedes ignorar este correo — tu reservación está segura."
        : "If you didn't ask, you can ignore this email — your booking is safe.",
    ],
    extraHtml: items
      .map(
        (i) =>
          `<p style="margin:0 0 10px"><strong>${esc(i.label)}</strong><br><a href="${esc(i.link)}" style="color:#111110;word-break:break-all">${esc(i.link)}</a></p>`,
      )
      .join(""),
    extraText: items.map((i) => `${i.label}\n${i.link}`).join("\n\n"),
    cta: items.length === 1 ? { url: items[0]!.link, label: es ? "Abrir mi reservación" : "Open my booking" } : undefined,
  });
}
