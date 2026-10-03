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

const fallbackCityPhotos = [
  "/portfolio/hero.webp",
  "/portfolio/reception.webp",
  "/portfolio/red-garden.webp",
  "/portfolio/lilac-arch.webp",
  "/portfolio/save-date.webp",
  "/portfolio/kimberly-reception.webp",
  "/portfolio/dance.webp",
  "/portfolio/shoe-ceremony.webp",
];

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
      <header className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink text-white sm:min-h-[80svh]" aria-labelledby="areas-title">
        <Image
          src={hero?.url ?? "/portfolio/kimberly-reception.webp"}
          alt={hero ? publicPhotoCopy(hero, altPhraseFor(hero.section)).alt : "Quinceañera celebration in Dallas–Fort Worth"}
          fill
          unoptimized={!hero}
          priority
          sizes="100vw"
          className="object-cover"
          style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : { objectPosition: "center 60%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-xs uppercase tracking-[0.24em] text-white/85">TX Quince / Where we work</p>
          <h1 id="areas-title" className="mt-5 max-w-3xl font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">Across Dallas–Fort Worth</h1>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[78rem] gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Photographing her day</p>
          <div><p className="max-w-[29ch] font-display text-[clamp(1.85rem,3vw,3rem)] font-light leading-[1.24] text-ink">From the church to the last dance, wherever the celebration takes you.</p><p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">We photograph and film quinceañeras across Dallas–Fort Worth. Explore the cities where we work and the real celebrations behind the photographs.</p><a href="#cities" className="mt-7 inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">Find your city <span aria-hidden="true">↓</span></a></div>
        </div>
      </section>

      <section id="cities" className="scroll-mt-24 bg-white" aria-labelledby="cities-title">
        <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Explore the area</p>
              <h2 id="cities-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">Eight cities. One attentive team.</h2>
            </div>
            <p className="max-w-lg text-base leading-7 text-ink-soft">Find your city for local portrait ideas and coverage details. Planning is available in English or Spanish, and there is no travel fee within our Dallas–Fort Worth service area.</p>
          </div>

          <ol className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-7">
            {locations.map((location, index) => {
              const image = imageFor(index);
              return (
                <li key={location.slug} className="min-w-0">
                  <Link href={`/quinceanera-photographer/${location.slug}`} className="group block text-ink" aria-label={`Explore quinceañera photography in ${location.city}`}>
                    <span className="relative block aspect-[4/5] overflow-hidden bg-greige">
                      <Image src={image?.url ?? fallbackCityPhotos[index]} alt={image ? publicPhotoCopy(image, altPhraseFor(image.section)).alt : "A quinceañera photographed by TX Quince"} fill unoptimized={!image} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" style={image ? { objectPosition: focal(image.focus_x, image.focus_y) } : { objectPosition: "center 35%" }} />
                    </span>
                    <span className="mt-4 flex items-baseline justify-between gap-3 border-b border-ink/25 pb-4">
                      <span className="font-display text-[clamp(1.5rem,2vw,2rem)] font-light leading-tight">{location.city}</span>
                      <span className="shrink-0 text-xs uppercase tracking-[0.12em] text-ink-soft">0{index + 1} ↗</span>
                    </span>
                    <span className="mt-2 block text-sm leading-5 text-ink-soft">{location.county}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="coverage-title">
        <div className="mx-auto grid max-w-[90rem] gap-10 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:gap-20 lg:px-16 lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Beyond the map</p>
            <h2 id="coverage-title" className="mt-4 max-w-[20ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">From the first portrait to the last dance.</h2>
          </div>
          <div>
            <p className="max-w-lg text-base leading-7 text-ink-soft">We plan around your church, portrait location, and venue so the photographs feel like your family and your city. Choose the coverage that fits the day, then tell us the date you have in mind.</p>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-3 border-b border-ink text-sm font-medium text-ink">See the work <span aria-hidden="true">↗</span></Link>
              <Link href="/investment" className="inline-flex min-h-11 items-center gap-3 border-b border-ink text-sm font-medium text-ink">Explore collections <span aria-hidden="true">↗</span></Link>
              <Link href={site.cta.href} className="inline-flex min-h-11 items-center gap-3 border-b border-ink text-sm font-medium text-ink">Request a date <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
