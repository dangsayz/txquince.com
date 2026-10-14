import type { Metadata } from "next";
import { SlotImage } from "@/components/SlotImage";
import Link from "next/link";
import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Reserve your date, see the portfolio, and explore packages for quinceañera photos & video across Dallas–Fort Worth.",
  alternates: { canonical: "/links" },
  robots: { index: false },
};

const links = [
  { href: "/#intake", label: "Reserve your date" },
  { href: "/portfolio", label: "See the portfolio" },
  { href: "/#commissions", label: "Packages & prices" },
  { href: "/check-your-date", label: "Check if your date is open" },
] as const;

export default function LinksPage() {
  return (
    <div className="tq-wrap">
      <header className="tq-pg-mast">
        <p className="tq-pg-mast__index tq-mono">[Photos &amp; video / Dallas–Fort Worth]</p>
        <div className="tq-pg-mast__body">
          <h1 className="tq-display tq-pg-mast__title">{site.brand}</h1>
          <p className="tq-pg-mast__dek">{site.tagline}</p>
        </div>
      </header>
      <figure className="tq-pg-plate tq-pg-plate--short">
        <SlotImage slot="links.hero" lang="en" fill priority sizes="100vw" />
      </figure>
      <div className="tq-pg-row" style={{ borderTop: "1px solid var(--border-hairline)" }}>
        <p className="tq-pg-row__index tq-mono">[Index]</p>
        <nav aria-label="Quick links" className="tq-pg-row__body tq-pg-row__body--narrow">
          <ol className="tq-pg-index">
            {links.map((link, i) => (
              <li key={link.href}>
                <Link href={link.href} className="tq-pg-index__row">
                  <span className="tq-mono tq-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tq-pg-index__label">{link.label}</span>
                  <span className="tq-pg-index__end" aria-hidden>↗</span>
                </Link>
              </li>
            ))}
            <li>
              <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="tq-pg-index__row">
                <span className="tq-mono tq-muted">{String(links.length + 1).padStart(2, "0")}</span>
                <span className="tq-pg-index__label">Follow on Instagram</span>
                <span className="tq-pg-index__end" aria-hidden>↗</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${site.contact.email}`} className="tq-pg-index__row">
                <span className="tq-mono tq-muted">{String(links.length + 2).padStart(2, "0")}</span>
                <span className="tq-pg-index__label">Email us</span>
                <span className="tq-pg-index__end" aria-hidden>↗</span>
              </a>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
