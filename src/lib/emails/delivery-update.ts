/** → family, when the owner clicks "Email the family" on the delivery fields. */
import { familyEmail, firstName, type Built } from "./layout";
import type { FamilyCtx } from "./context";

export function deliveryUpdateEmail(c: FamilyCtx & { hasGallery: boolean; hasVideo: boolean; albumLabel: string }): Built {
  const es = c.lang === "es";
  const ready = [
    c.hasGallery ? (es ? "tu galería de fotos" : "your photo gallery") : "",
    c.hasVideo ? (es ? "tu video" : "your video") : "",
  ].filter(Boolean);
  return familyEmail({
    lang: c.lang,
    link: c.link,
    subject: es ? "Novedades de tus fotos y video" : "An update on your photos and video",
    title: es ? "Novedades de tu entrega" : "Your delivery update",
    paragraphs: [
      es ? `Hola ${firstName(c.name)},` : `Hi ${firstName(c.name)},`,
      ready.length
        ? es
          ? `Ya está lista ${ready.join(" y ")}. Ábrela desde tu página.`
          : `${ready.join(" and ")} ${ready.length > 1 ? "are" : "is"} ready. Open ${ready.length > 1 ? "them" : "it"} from your page.`.replace(/^./, (m) => m.toUpperCase())
        : es
          ? "Te compartimos cómo va tu entrega."
          : "Here's where your delivery stands.",
      es ? `Álbum: ${c.albumLabel}.` : `Album: ${c.albumLabel}.`,
    ],
    cta: { url: c.link, label: es ? "Ver mi entrega" : "See my delivery" },
  });
}
