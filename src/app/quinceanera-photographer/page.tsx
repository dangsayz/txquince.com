import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { locations } from "@/content/locations";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { site } from "@/content/site";
import { getFeaturedImages, getImagesByCity, getPageHero } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Quinceañera Photographer — Dallas–Fort Worth",
  description:
    "Cinematic quinceañera photography & film across Dallas–Fort Worth — Grand Prairie, Irving, Garland, Dallas, Fort Worth, Arlington, Mansfield, and Farmers Branch. Fixed-price collections from $1,800.",
  alternates: { canonical: "/quinceanera-photographer" },
  openGraph: {
    title: `Quinceañera Photographer — Dallas–Fort Worth · ${site.brand}`,
    description:
      "Quinceañera photography & film across the DFW metroplex. Fixed-price collections from $1,800.",
    url: `${site.url}/quinceanera-photographer`,
  },
};

function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

const sectionSpace = "mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12";

export default async function LocationsHub() {
  const [imgs, assignedHero, cityPhotoSets] = await Promise.all([
    getFeaturedImages(24),
    getPageHero("areas"),
    Promise.all(locations.map((location) => getImagesByCity(location.slug, 2))),
  ]);
  const hero =
    assignedHero ??
    imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ??
    imgs[0] ??
    null;
  const cityImages = imgs.filter((i) => i.url !== hero?.url);
  const imageFor = (index: number) =>
    cityPhotoSets[index].find((image) => image.url !== hero?.url) ??
    (cityImages.length ? cityImages[index % cityImages.length] : (imgs[0] ?? null));

  return (
    <>
      <section className={`${sectionSpace} pb-12 pt-5 sm:pb-16 sm:pt-10 lg:pt-14`}>
        <div className="grid overflow-hidden rounded-[1.5rem] border border-line bg-white lg:min-h-[35rem] lg:grid-cols-[0.92fr_1.08fr] lg:rounded-[2rem]">
          <div className="flex flex-col justify-center px-5 py-9 sm:px-10 sm:py-14 lg:px-14">
            <p className="text-sm font-medium text-accent-strong">Areas served · Dallas–Fort Worth</p>
            <h1 className="mt-4 max-w-[16ch] font-display text-[clamp(2rem,3.6vw,3.5rem)] font-medium leading-[1.12] text-ink sm:mt-6">
              Quinceañera photo &amp; film across DFW.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">
              From la misa to the last dance, TX Quince photographs and films quinceañeras
              across the metroplex. Find your city below and see how we cover your day.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="#cities" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Find your city <span aria-hidden="true" className="ml-3">↓</span>
              </Link>
              <Link href="/investment" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                View collections <span aria-hidden="true" className="ml-3">↗</span>
              </Link>
            </div>
          </div>
          <div className="relative min-h-[19rem] bg-greige sm:min-h-[28rem] lg:min-h-full">
            <Image src={hero?.url ?? "/portfolio/kimberly-reception.webp"} alt={hero ? publicPhotoCopy(hero, altPhraseFor(hero.section)).alt : "Quinceañera celebration in Dallas–Fort Worth"} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : { objectPosition: "center 60%" }} />
          </div>
        </div>
      </section>

      <section id="cities" className={`${sectionSpace} scroll-mt-24 py-14 sm:py-20`} aria-labelledby="cities-title">
        <div className="grid gap-5 border-b border-line pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:items-end md:gap-12">
          <div>
            <p className="text-sm font-medium text-accent-strong">Find your city</p>
            <h2 id="cities-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.875rem)] font-medium leading-tight text-ink">
              Explore your part of DFW.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-ink-soft">
            Each city page shares local portrait settings and how coverage works from church to reception.
          </p>
        </div>
        <div className="grid md:grid-cols-2 md:gap-x-10 lg:gap-x-16">
          {locations.map((location, index) => {
            const image = imageFor(index);
            return (
              <article key={location.slug} className="min-w-0 border-b border-line">
                <Link href={`/quinceanera-photographer/${location.slug}`} className="group flex min-h-32 items-center gap-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:gap-6" aria-label={`Explore quinceañera photography in ${location.city}`}>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink-faint">{location.county}</p>
                    <h3 className="mt-1 font-display text-[clamp(1.375rem,2vw,1.75rem)] font-medium leading-tight text-ink transition-colors group-hover:text-accent-strong">{location.city}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-soft">{location.areas.slice(0, 2).join(" · ")}</p>
                  </div>
                  {image?.url ? (
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-greige sm:size-24">
                      <Image src={image.url} alt={publicPhotoCopy(image, altPhraseFor(image.section)).alt} fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} />
                    </div>
                  ) : (
                    <span aria-hidden="true" className="flex size-20 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-xl text-accent-strong sm:size-24">↗</span>
                  )}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-accent-soft py-14 sm:py-20" aria-labelledby="coverage-title">
        <div className={`${sectionSpace} grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16`}>
          <div>
            <p className="text-sm font-medium text-accent-strong">Across Dallas–Fort Worth</p>
            <h2 id="coverage-title" className="mt-3 max-w-md font-display text-[clamp(1.875rem,3vw,2.875rem)] font-medium leading-tight text-ink">From the church to the reception.</h2>
          </div>
          <div className="md:pt-8">
            <p className="max-w-xl text-base leading-7 text-ink-soft">
              We plan around your church, portrait location, and venue, so the story feels like your family and your city. Bilingual planning is available, and there is no travel fee within the DFW service area.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={site.cta.href} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Request your date <span aria-hidden="true" className="ml-3">↗</span>
              </Link>
              <Link href="/check-your-date" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-accent/40 px-6 text-sm font-semibold text-ink transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Ask a question <span aria-hidden="true" className="ml-3">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
