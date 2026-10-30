import { SlotImage } from "@/components/SlotImage";
import Link from "next/link";
import { InquiryForm } from "@/components/InquiryForm";
import { ContactButtons, ContactLine } from "@/components/ContactButtons";
import { site } from "@/content/site";
import { getFeaturedImages } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { selectFullBleedPhoto } from "@/lib/quality-photo";
import { commissionLinks } from "@/content/commissions";
import "@/components/txq/pages/pages.css";

const copy = {
  en: {
    eyebrow: "An invitation / Dallas–Fort Worth",
    title: "Tell us about her day.",
    intro: "Start with a date, a place, or simply what she is dreaming of. We will reply personally.",
    anchor: "Begin your inquiry",
    details: "The first conversation",
    formTitle: "It starts here.",
    formIntro: "A few details help us give your family a useful answer. You do not need to have every decision made.",
    formNote: "There is no payment to inquire. A date is only held after we confirm availability and you complete a deposit.",
    price: "Explore the collections",
    process: "What happens next",
    steps: [
      ["01", "Share her date", "Tell us the date, venue or city, and the coverage you are considering."],
      ["02", "We check availability", "We review your details and reply with a clear answer."],
      ["03", "Plan together", "If the date is open, we help you choose a collection and explain how to reserve it."],
    ],
    work: "View the photographs",
    textFirst: "Rather text? Send us her date and we'll text you back.",
  },
  es: {
    eyebrow: "Una invitación / Dallas–Fort Worth",
    title: "Cuéntanos sobre su día.",
    intro: "Comparte la fecha, el lugar o lo que ella imagina. Te responderemos personalmente.",
    anchor: "Empieza tu consulta",
    details: "La primera conversación",
    formTitle: "Todo empieza aquí.",
    formIntro: "Unos detalles nos ayudan a responderle a tu familia. No necesitas tener todo decidido.",
    formNote: "Consultar no requiere pago. La fecha se aparta después de confirmar disponibilidad y completar el depósito.",
    price: "Explora las colecciones",
    process: "Cómo seguimos",
    steps: [
      ["01", "Comparte su fecha", "Cuéntanos la fecha, el salón o la ciudad y la cobertura que buscas."],
      ["02", "Revisamos disponibilidad", "Revisamos los detalles y respondemos con claridad."],
      ["03", "Planeamos juntos", "Si la fecha está libre, te ayudamos a elegir una colección y explicamos cómo reservarla."],
    ],
    work: "Ver las fotografías",
    textFirst: "¿Prefieres un mensaje? Mándanos su fecha y te contestamos por mensaje.",
  },
} as const;

export async function InquiryPage({ locale, initialDate = "" }: { locale: "en" | "es"; initialDate?: string }) {
  const c = copy[locale];
  const isSpanish = locale === "es";
  const formId = isSpanish ? "formulario" : "inquiry-form";
  const photo = selectFullBleedPhoto(await getFeaturedImages(12), 0);
  const fallbackAlt = isSpanish ? "Retrato de quinceañera" : "Quinceañera portrait";

  return (
    <>
      <div className="tq-wrap">
        <header className="tq-pg-mast" aria-labelledby="inquiry-title">
          <p className="tq-pg-mast__index tq-mono">[{c.eyebrow}]</p>
          <div className="tq-pg-mast__body">
            <h1 id="inquiry-title" className="tq-display tq-pg-mast__title">
              {c.title}
            </h1>
            <p className="tq-pg-mast__dek">{c.intro}</p>
            <div className="tq-pg-actions">
              <a href={`#${formId}`} className="tq-btn tq-btn--lg">
                {c.anchor} <span className="tq-arrow" aria-hidden>↓</span>
              </a>
              <Link href={commissionLinks[locale].compare} className="tq-btn tq-btn--lg tq-btn--ghost">
                {c.price}
              </Link>
            </div>
            <ContactLine lang={locale} placement="inquiry-hero" />
          </div>
        </header>
        <figure className="tq-pg-plate tq-pg-plate--short">
          <SlotImage
            slot="inquiry.hero"
            lang={locale}
            fill
            priority
            sizes="100vw"
            fallback={photo ? { src: photo.url, alt: publicPhotoCopy(photo, fallbackAlt).alt, width: photo.width, height: photo.height, focus: "center 39%" } : null}
          />
          <figcaption>
            <span className="tq-tag tq-tag--bl tq-mono">[{isSpanish ? "Consulta" : "Inquiry"} — DFW]</span>
          </figcaption>
        </figure>
      </div>

      <section id={formId} className="tq-section" aria-labelledby="inquiry-form-title">
        <div className="tq-wrap">
          <div className="tq-intake" style={{ borderTop: 0 }}>
            <aside className="tq-intake__aside" style={{ paddingTop: 40 }}>
              <div style={{ display: "grid", gap: 20 }}>
                <p className="tq-mono" style={{ margin: 0 }}>[{c.details}]</p>
                <h2 id="inquiry-form-title" className="tq-display tq-pg-row__title">
                  {c.formTitle}
                </h2>
                <p className="tq-muted" style={{ margin: 0, maxWidth: "40ch", fontSize: "1.0625rem" }}>
                  {c.formIntro}
                </p>
              </div>
              <div style={{ display: "grid", gap: 12, maxWidth: "26rem" }}>
                <p style={{ margin: 0, fontSize: "1rem", fontWeight: 590 }}>{c.textFirst}</p>
                <ContactButtons lang={locale} placement="inquiry-aside" primary={false} />
              </div>
              <p className="tq-mono tq-muted" style={{ margin: 0, paddingTop: 16, borderTop: "1px solid var(--border-hairline)", maxWidth: "48ch" }}>
                {c.formNote}
              </p>
            </aside>
            <div className="tq-intake__flow" style={{ paddingTop: 40 }}>
              <InquiryForm initialDate={initialDate} locale={locale} />
            </div>
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="inquiry-process-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [{isSpanish ? "Después de escribirnos" : "After you write"}]
            </p>
            <h2 id="inquiry-process-title" className="tq-display tq-head__title">
              {c.process}
            </h2>
          </header>
          <ol className="tq-principles">
            {c.steps.map(([number, title, body]) => (
              <li key={number}>
                <span className="tq-mono tq-muted">[{number}]</span>
                <h3 className="tq-display">{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <div className="tq-pg-row">
            <p className="tq-pg-row__index tq-mono">[{isSpanish ? "Contacto" : "Contact"}]</p>
            <div className="tq-pg-row__body">
              <div className="tq-pg-actions">
                <Link href="/portfolio" className="tq-btn tq-btn--ghost">
                  {c.work} <span className="tq-arrow" aria-hidden>↗</span>
                </Link>
                <a href={`mailto:${site.contact.email}`} className="tq-pg-link">
                  <span>{site.contact.email}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
