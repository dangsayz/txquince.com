import Link from "next/link";
import { site } from "@/content/site";
import { locations } from "@/content/locations";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Saved photos", href: "/saved" },
      { label: "Investment", href: "/investment" },
      { label: "About", href: "/about" },
      { label: "Planning guide", href: "/blog" },
    ],
  },
  {
    title: "Plan",
    links: [
      { label: "Reserve your date", href: site.cta.href },
      { label: "Check your date", href: site.secondaryCta.href },
      { label: "Service areas", href: "/quinceanera-photographer" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Email the studio", href: `mailto:${site.contact.email}` },
      { label: "Instagram", href: site.social.instagram },
      ...(site.social.facebook ? [{ label: "Facebook", href: site.social.facebook }] : []),
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-ivory pb-24 pt-14 md:pb-8 md:pt-20">
      <div className="mx-auto max-w-[96rem] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-12 border-b border-line pb-12 md:grid-cols-[minmax(240px,1.3fr)_repeat(3,minmax(120px,1fr))] md:gap-8">
          <div className="max-w-xs">
            <Link href="/" className="inline-flex min-h-11 items-center font-display text-3xl font-semibold tracking-[0.09em] text-ink"><span className="text-wine">TX</span>&nbsp;QUINCE</Link>
            <p className="mt-4 text-sm leading-6 text-ink-soft">Quinceañera photography and film across Dallas–Fort Worth.</p>
            <Link href={site.cta.href} className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-wine px-4 text-sm font-semibold text-white transition-colors hover:bg-wine-deep">
              {site.cta.label}
              <span aria-hidden="true" className="ml-2">↗</span>
            </Link>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink">{column.title}</h2>
              <ul className="mt-4">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href} className="inline-flex min-h-11 items-center text-sm text-ink-soft transition-colors hover:text-wine">{link.label}</Link>
                    ) : (
                      <a href={link.href} target={link.href.startsWith("https:") ? "_blank" : undefined} rel={link.href.startsWith("https:") ? "noopener noreferrer" : undefined} className="inline-flex min-h-11 items-center text-sm text-ink-soft transition-colors hover:text-wine">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-b border-line py-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink">Serving Dallas–Fort Worth</p>
          <div className="mt-3 flex flex-wrap gap-x-5">
            {locations.map((location) => (
              <Link key={location.slug} href={`/quinceanera-photographer/${location.slug}`} className="inline-flex min-h-11 items-center text-xs text-ink-soft transition-colors hover:text-wine">{location.city}</Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 text-xs text-ink-soft">
          <p>© {new Date().getFullYear()} {site.brand}. {site.serviceArea}.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-wine">Privacy</Link>
            <Link href="/admin/login" className="inline-flex min-h-11 items-center hover:text-wine">Studio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
