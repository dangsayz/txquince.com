import Link from "next/link";
import { site } from "@/content/site";
import { locations } from "@/content/locations";

const COLUMNS = [
  {
    title: "Navigate",
    links: [
      { label: "Home", href: "/" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Investment", href: "/investment" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Book",
    links: [
      { label: "Reserve your date", href: "/reserve" },
      { label: "Check your date", href: "/check-your-date" },
      { label: "Areas served", href: "/quinceanera-photographer" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: site.social.instagram, external: true },
      { label: "Facebook", href: site.social.facebook, external: true },
      { label: site.contact.email, href: `mailto:${site.contact.email}` },
    ],
  },
  {
    title: "Legal",
    links: [{ label: "Privacy", href: "/privacy" }],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-cream pt-section">
      <div className="mx-auto max-w-5xl px-5 text-center md:px-10 lg:px-16">
        {/* Wordmark + tagline — masthead lockup, scaled up for the close */}
        <p className="font-display text-4xl font-light tracking-[0.3em] text-ink md:text-5xl">
          TX&nbsp;QUINCE
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{site.tagline}</p>

        {/* Social pills */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <a
            href={site.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-ink-soft shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:text-wine"
          >
            <IgIcon />
          </a>
          {site.social.facebook ? (
            <a
              href={site.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory text-ink-soft shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:text-wine"
            >
              <FbIcon />
            </a>
          ) : null}
        </div>

      </div>

      {/* Link columns */}
      <div className="mx-auto max-w-5xl px-5 md:px-10 lg:px-16">
        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-line pt-10 sm:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-ink">{col.title}</p>
              <ul className="mt-3 space-y-2.5">
                {col.links.filter((l) => l.href).map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-ink-soft transition-colors hover:text-ink"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-ink-soft transition-colors hover:text-ink"
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

        {/* Areas served — internal links to the local landing pages (SEO). */}
        <div className="mt-10 border-t border-line pt-6">
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-faint">
            Quinceañera photographer serving
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {locations.map((l) => (
              <Link
                key={l.slug}
                href={`/quinceanera-photographer/${l.slug}`}
                className="transition-colors hover:text-ink"
              >
                {l.city}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-8 pb-14 text-center text-xs text-ink-faint">
          © {year} {site.brand} · {site.serviceArea} ·{" "}
          <Link href="/admin/login" className="transition-colors hover:text-ink">
            Studio
          </Link>
        </p>
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
