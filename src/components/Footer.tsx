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

const socialPill =
  "flex h-11 w-11 items-center justify-center rounded-full bg-cream/[0.06] text-cream/70 ring-1 ring-cream/15 transition-colors hover:bg-cream/10 hover:text-cream";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink text-cream">
      {/* Champagne seam — a hairline + faint glow marks the page's close. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wine to-transparent opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 h-56 w-[130%] -translate-x-1/2 opacity-[0.07]"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, var(--color-wine), transparent)" }}
      />

      <div className="relative mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
        {/* Masthead — brand left, the closing CTA + socials right. */}
        <div className="flex flex-col gap-10 pt-16 md:flex-row md:items-end md:justify-between md:pt-24">
          <div>
            <Wordmark size="masthead" tone="dark" />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream/55">{site.tagline}</p>
          </div>

          <div className="flex flex-col gap-6 md:items-end">
            <Link
              href={site.cta.href}
              className="group inline-flex items-baseline gap-2 font-display text-cream transition-colors hover:text-wine"
              style={{ fontSize: "clamp(1.7rem,3.2vw,2.6rem)", letterSpacing: "-0.02em", lineHeight: 1 }}
            >
              Reserve her date
              <span aria-hidden className="text-wine transition-transform duration-300 group-hover:translate-x-1">→</span>
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

        {/* Link columns — gold eyebrow heads, quiet cream links. */}
        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-cream/10 pt-12 sm:grid-cols-4 md:mt-20">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-wine">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.filter((l) => l.href).map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cream/65 transition-colors hover:text-cream"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-cream/65 transition-colors hover:text-cream"
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
        <div className="mt-14 border-t border-cream/10 pt-7">
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-cream/40">
            Quinceañera photographer serving
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/65">
            {locations.map((l) => (
              <Link
                key={l.slug}
                href={`/quinceanera-photographer/${l.slug}`}
                className="transition-colors hover:text-cream"
              >
                {l.city}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-3 border-t border-cream/10 py-8 text-xs text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.brand} · {site.serviceArea}
          </p>
          <Link href="/admin/login" className="transition-colors hover:text-cream/70">
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
