import type { Metadata } from "next";
import Link from "next/link";
import { SlotImage } from "@/components/SlotImage";
import { ContactButtons } from "@/components/ContactButtons";
import { site } from "@/content/site";
import { withBioUtm } from "@/lib/bio-utm";
import "@/components/txq/pages/pages.css";
import "./links.css";

/**
 * /links — the Instagram bio page (txquince.com/links).
 *
 * Built for a thumb on a phone, straight out of the Instagram app: the phone
 * first (Text / WhatsApp / Call), then big buttons in the order a planning mom
 * asks — prices, her date, galleries, latest photos, films, Spanish. Every
 * label carries its Spanish line underneath.
 *
 * Attribution (src/lib/bio-utm.ts): visitors here count as
 * utm_source=instagram&utm_medium=bio even when Instagram strips the referrer,
 * and every internal link out of this page carries the same UTM.
 */

export const metadata: Metadata = {
  title: "Links",
  description:
    "Text us, see prices, check your date and browse galleries: quinceañera photos & video across Dallas–Fort Worth. Español disponible.",
  alternates: { canonical: "/links" },
  robots: { index: false },
};

type BioLink = { href: string; label: string; es: string; external?: boolean };

const LINKS: readonly BioLink[] = [
  { href: withBioUtm("/#commissions"), label: "See prices", es: "Ver precios" },
  { href: withBioUtm("/check-your-date"), label: "Check my date", es: "Consultar mi fecha" },
  { href: withBioUtm("/portfolio"), label: "Full galleries", es: "Galerías completas" },
  { href: withBioUtm("/photos/latest"), label: "Latest photos", es: "Fotos recientes" },
  { href: site.social.youtube, label: "YouTube films", es: "Videos en YouTube", external: true },
  { href: withBioUtm("/es"), label: "Spanish site", es: "Sitio en español" },
];

export default function LinksPage() {
  return (
    <div className="tq-wrap">
      <div className="tq-bio">
        <header className="tq-bio__head">
          <p className="tq-mono tq-bio__index">[Quinceañera photos &amp; video · Dallas–Fort Worth]</p>
          <h1 className="tq-display tq-bio__title">{site.brand}</h1>
          <p className="tq-bio__dek">
            Text us her date. We answer in English or Spanish.
            <span lang="es"> Escríbenos su fecha, en español o inglés.</span>
          </p>
        </header>

        <ContactButtons lang="en" placement="links" size="xl" />

        <nav aria-label="Quick links">
          <ul className="tq-bio__links">
            {LINKS.map((l) => {
              const body = (
                <>
                  <span className="tq-bio__label">{l.label}</span>
                  <span className="tq-bio__es" lang="es">
                    {l.es}
                  </span>
                  <span className="tq-bio__arrow" aria-hidden>
                    ↗
                  </span>
                </>
              );
              return (
                <li key={l.label}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="tq-bio__link">
                      {body}
                    </a>
                  ) : l.href.includes("#") ? (
                    // A homepage section: a full load so the browser lands on the section.
                    <a href={l.href} className="tq-bio__link">
                      {body}
                    </a>
                  ) : (
                    <Link href={l.href} className="tq-bio__link">
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <figure className="tq-pg-plate tq-pg-plate--short tq-bio__plate">
          <SlotImage slot="links.hero" lang="en" fill priority={false} sizes="(max-width: 640px) 100vw, 560px" />
        </figure>

        <p className="tq-bio__foot">
          Or email{" "}
          <a href={`mailto:${site.contact.email}`} className="tq-bio__mail">
            {site.contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}
