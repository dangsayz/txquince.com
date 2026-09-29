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
      <section className={`${sectionSpace} pb-12 pt-12 sm:pb-16 sm:pt-16 lg:pt-20`}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-ink-soft">Areas served · Dallas–Fort Worth</p>
          <h1 className="mx-auto mt-4 max-w-[20ch] font-display text-[clamp(2rem,3.5vw,3rem)] leading-[1.14] text-ink">
            Quinceañera photo &amp; film across DFW.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-ink-soft">
            From la misa to the last dance, TX Quince photographs and films quinceañeras
            across the metroplex. Find your city below and see how we cover your day.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="#cities" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong">
              Find your city <span aria-hidden="true" className="ml-3">↓</span>
            </Link>
            <Link href="/investment" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md border border-line px-6 text-base font-medium text-ink transition-colors hover:border-ink">
              View collections <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
          </div>
        </div>
        <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-lg bg-greige sm:mt-12 sm:aspect-[16/8] lg:aspect-[16/7]">
          <Image src={hero?.url ?? "/portfolio/kimberly-reception.webp"} alt={hero ? publicPhotoCopy(hero, altPhraseFor(hero.section)).alt : "Quinceañera celebration in Dallas–Fort Worth"} fill priority sizes="(max-width: 1024px) 100vw, 1408px" className="object-cover" style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : { objectPosition: "center 60%" }} />
        </div>
      </section>

      <section id="cities" className={`${sectionSpace} scroll-mt-24 py-14 sm:py-20`} aria-labelledby="cities-title">
        <div className="grid gap-5 border-b border-line pb-8 md:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] md:items-end md:gap-12">
          <div>
            <p className="text-sm font-medium text-ink-soft">Find your city</p>
            <h2 id="cities-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.5rem)] leading-tight text-ink">
              Explore your part of DFW.
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-ink-soft">
            Each city page shares local portrait settings and how coverage works from church to reception.
          </p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location, index) => {
            const image = imageFor(index);
            return (
              <article key={location.slug} className="min-w-0 overflow-hidden rounded-lg border border-line bg-white">
                <Link href={`/quinceanera-photographer/${location.slug}`} className="group block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label={`Explore quinceañera photography in ${location.city}`}>
                  {image?.url ? (
                    <div className="relative aspect-[4/3] overflow-hidden bg-greige">
                      <Image src={image.url} alt={publicPhotoCopy(image, altPhraseFor(image.section)).alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} />
                    </div>
                  ) : (
                    <span aria-hidden="true" className="flex aspect-[4/3] items-center justify-center bg-greige text-3xl text-ink-soft">↗</span>
                  )}
                  <div className="p-5">
                    <p className="text-sm font-medium text-ink-soft">{location.county}</p>
                    <h3 className="mt-1 font-display text-[clamp(1.375rem,2vw,1.75rem)] leading-tight text-ink">{location.city}</h3>
                    <p className="mt-2 line-clamp-2 text-base leading-6 text-ink-soft">{location.areas.slice(0, 2).join(" · ")}</p>
                    <span aria-hidden="true" className="mt-4 inline-flex text-sm font-medium text-ink">Explore area →</span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-ivory py-14 sm:py-20" aria-labelledby="coverage-title">
        <div className={`${sectionSpace} grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16`}>
          <div>
            <p className="text-sm font-medium text-ink-soft">Across Dallas–Fort Worth</p>
            <h2 id="coverage-title" className="mt-3 max-w-md font-display text-[clamp(1.875rem,3vw,2.5rem)] leading-tight text-ink">From the church to the reception.</h2>
          </div>
          <div className="md:pt-8">
            <p className="max-w-xl text-base leading-7 text-ink-soft">
              We plan around your church, portrait location, and venue, so the story feels like your family and your city. Bilingual planning is available, and there is no travel fee within the DFW service area.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={site.cta.href} className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong">
                Request your date <span aria-hidden="true" className="ml-3">↗</span>
              </Link>
              <Link href="/check-your-date" className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-md border border-line px-6 text-base font-medium text-ink transition-colors hover:border-ink">
                Ask a question <span aria-hidden="true" className="ml-3">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
