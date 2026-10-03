import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Links",
  description:
    "Reserve your date, see the portfolio, and explore collections for cinematic quinceañera photography & film across Dallas–Fort Worth.",
  alternates: { canonical: "/links" },
  robots: { index: false },
};

const links = [
  { href: "/reserve", label: "Reserve your date" },
  { href: "/portfolio", label: "See the portfolio" },
  { href: "/investment", label: "Collections & pricing" },
  { href: "/check-your-date", label: "Check if your date is open" },
] as const;

export default function LinksPage() {
  return (
    <section className="bg-white px-5 pb-24 pt-10 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-ink sm:aspect-[16/9]">
          <Image src="/portfolio/red-garden.webp" alt="Quinceañera in a red gown among garden greenery" fill priority unoptimized sizes="(max-width: 640px) 100vw, 576px" className="object-cover object-[center_35%]" />
        </div>
        <p className="mt-10 text-xs uppercase tracking-[0.22em] text-ink-soft">Photography & film / Dallas–Fort Worth</p>
        <h1 className="mt-4 font-body text-[clamp(2.5rem,5vw,3.5rem)] font-light leading-[1.1] tracking-[-0.04em] text-ink">{site.brand}</h1>
        <p className="mt-4 font-serif text-lg leading-7 text-ink-soft">{site.tagline}</p>
        <nav aria-label="Quick links" className="mt-9 border-t border-line">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="flex min-h-16 items-center justify-between border-b border-line py-3 text-left text-base text-ink transition-colors hover:text-ink-soft">
              {link.label}<span aria-hidden="true">↗</span>
            </Link>
          ))}
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="flex min-h-16 items-center justify-between border-b border-line py-3 text-base text-ink transition-colors hover:text-ink-soft">Follow on Instagram<span aria-hidden="true">↗</span></a>
          <a href={`mailto:${site.contact.email}`} className="flex min-h-16 items-center justify-between border-b border-line py-3 text-base text-ink transition-colors hover:text-ink-soft">Email us<span aria-hidden="true">↗</span></a>
        </nav>
        <p className="mt-9 text-xs uppercase tracking-[0.16em] text-ink-soft">Dallas–Fort Worth, Texas</p>
      </div>
    </section>
  );
}
