import Link from "next/link";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { Wordmark } from "@/components/Wordmark";

const COLUMNS = [
  {
    title: "Navigate",
    links: [
      { label: "Home", href: "/" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Venues", href: "/venues" },
      { label: "Vendors", href: "/vendors" },
      { label: "Guide", href: "/quinceanera-guide" },
      { label: "Investment", href: "/investment" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Book",
    links: [
      { label: "Reserve your date", href: "/reserve" },
      { label: "Check your date", href: "/check-your-date" },
      { label: "Save-the-Date", href: "/quinceanera-save-the-date" },
      { label: "Areas served", href: "/quinceanera-photographer" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: site.social.instagram, external: true },
      { label: "YouTube", href: site.social.youtube, external: true },
      { label: "Facebook", href: site.social.facebook, external: true },
      { label: site.contact.email, href: `mailto:${site.contact.email}` },
    ],
  },
  {
    title: "Legal",
    links: [{ label: "Privacy", href: "/privacy" }],
  },
];

const COLUMNS_ES = [
  {
    title: "Explorar",
    links: [
      { label: "Inicio", href: "/es" },
      { label: "Portafolio (EN)", href: "/portfolio" },
      { label: "Salones", href: "/es/salones" },
      { label: "Proveedores (EN)", href: "/vendors" },
      { label: "Guía", href: "/es/blog" },
      { label: "Paquetes", href: "/es/paquetes" },
      { label: "Nosotros (EN)", href: "/about" },
    ],
  },
  {
    title: "Reservar",
    links: [
      { label: "Consultar una fecha", href: "/es/consulta" },
      { label: "Save-the-Date", href: "/es/save-the-date-quinceanera" },
      { label: "Áreas de servicio", href: "/es/fotografo-de-quinceaneras" },
    ],
  },
  {
    title: "Conectar",
    links: [
      { label: "Instagram", href: site.social.instagram, external: true },
      { label: "YouTube", href: site.social.youtube, external: true },
      { label: "Facebook", href: site.social.facebook, external: true },
      { label: site.contact.email, href: `mailto:${site.contact.email}` },
    ],
  },
  {
    title: "Legal",
    links: [{ label: "Privacidad (EN)", href: "/privacy" }],
  },
];

const socialPill =
  "flex h-11 w-11 items-center justify-center rounded-md border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink";

export function Footer({ locale = "en" }: { locale?: "en" | "es" }) {
  const year = new Date().getFullYear();
  const isSpanish = locale === "es";

  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
        <div className="flex flex-col gap-8 pt-14 md:flex-row md:items-center md:justify-between md:pt-16">
          <div>
            <Wordmark size="masthead" />
            <p className="mt-4 max-w-sm text-base leading-7 text-ink-soft">
              {isSpanish ? "Fotografía y video de quinceañeras en Dallas–Fort Worth." : site.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-5 md:items-end">
            <Link
              href={isSpanish ? "/es/consulta" : "/check-your-date"}
              className="inline-flex min-h-12 items-center justify-center gap-2 self-start whitespace-nowrap rounded-md bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-accent-strong md:self-auto"
            >
              {isSpanish ? "Consulta su fecha" : "Check her date"}
              <span aria-hidden>→</span>
            </Link>
            <div className="flex items-center gap-3">
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={socialPill}
              >
                <IgIcon />
              </a>
              {site.social.youtube ? (
                <a
                  href={site.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className={socialPill}
                >
                  <YtIcon />
                </a>
              ) : null}
              {site.social.facebook ? (
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={socialPill}
                >
                  <FbIcon />
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-line pt-9 sm:grid-cols-4 md:mt-14">
          {(isSpanish ? COLUMNS_ES : COLUMNS).map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>
              <ul className="mt-2">
                {col.links.filter((l) => l.href).map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center text-base text-ink-soft transition-colors hover:text-ink"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="inline-flex min-h-11 items-center text-base text-ink-soft transition-colors hover:text-ink"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-7">
          <p className="text-sm font-semibold text-ink">
            {isSpanish ? "Fotografía de quinceañeras en" : "Quinceañera photographer serving"}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 text-base text-ink-soft">
            {locations.map((l) => (
              <Link
                key={l.slug}
                href={`${isSpanish ? "/es/fotografo-de-quinceaneras" : "/quinceanera-photographer"}/${l.slug}`}
                className="inline-flex min-h-11 items-center transition-colors hover:text-ink"
              >
                {l.city}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-line py-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.brand} · {site.serviceArea}
          </p>
          <Link href="/admin/login" className="inline-flex min-h-11 items-center transition-colors hover:text-ink">
            Studio
          </Link>
        </div>
      </div>
    </footer>
  );
}

function IgIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function FbIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 8.5V7c0-.7.3-1 1-1h1.5V3.2H14c-2 0-3.3 1.3-3.3 3.4V8.5H8.5v2.9h2.2V21h3.3v-9.6h2.3l.4-2.9H14Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function YtIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.2 9.2v5.6l4.8-2.8-4.8-2.8Z" fill="currentColor" />
    </svg>
  );
}
