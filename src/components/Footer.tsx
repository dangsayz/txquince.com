import Link from "next/link";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { CTAButton } from "@/components/CTAButton";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-greige">
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-3xl text-ink md:text-4xl">{site.brand}</p>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {site.tagline}
            </p>
            <p className="mt-2 text-sm text-ink-soft">Serving {site.serviceArea}.</p>
          </div>
          <div className="flex flex-col gap-4">
            <CTAButton href={site.cta.href}>{site.cta.label}</CTAButton>
          </div>
        </div>

        {/* Areas served — internal links to the local landing pages. */}
        <div className="mt-14 border-t border-line pt-8">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">
            Quinceañera photographer serving
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {locations.map((l) => (
              <Link
                key={l.slug}
                href={`/quinceanera-photographer/${l.slug}`}
                className="hover:text-ink"
              >
                {l.city}
              </Link>
            ))}
            <Link
              href="/quinceanera-photographer"
              className="text-wine hover:text-wine-deep"
            >
              All areas →
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-line pt-8 text-sm text-ink-soft md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href={`mailto:${site.contact.email}`} className="hover:text-ink">
              {site.contact.email}
            </a>
            {site.contact.phone ? (
              <a href={`tel:${site.contact.phoneE164}`} className="hover:text-ink">
                {site.contact.phone}
              </a>
            ) : null}
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              Instagram
            </a>
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink"
            >
              Facebook
            </a>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>

          <div className="flex items-center gap-5">
            {/* EN/ES toggle placeholder (bilingual architecture ready; ES ships next) */}
            <div
              className="flex items-center gap-2 text-xs text-ink-faint"
              aria-label="Language"
            >
              <span className="font-medium text-ink">EN</span>
              <span aria-hidden>/</span>
              <span title="Español — coming soon">ES</span>
            </div>
            <span className="text-xs text-ink-faint">
              © {year} {site.brand}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
