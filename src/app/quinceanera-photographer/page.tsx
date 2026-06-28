import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { getFeaturedImages } from "@/lib/content-db";
import { Reveal } from "@/components/Reveal";
import { FinalCTA } from "@/components/FinalCTA";

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

export default async function LocationsHub() {
  const imgs = await getFeaturedImages(24);
  // A landscape frame crops cleanest for the wide hero; portraits fill the city tiles.
  const hero = imgs.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ?? imgs[0] ?? null;
  const tilePool = imgs.filter((i) => i.url !== hero?.url);
  const imgFor = (i: number) => (tilePool.length ? tilePool[i % tilePool.length] : (imgs[0] ?? null));

  return (
    <>
      {/* ===== Cinematic hero — image with type low-left ===== */}
      <section className="relative overflow-hidden bg-ink">
        <div className="relative h-[70svh] min-h-[460px] w-full md:h-[80svh]">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt={hero.alt || "Quinceañera in Dallas–Fort Worth"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: focal(hero.focus_x, hero.focus_y) }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-ink/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-[90rem] px-5 pb-12 md:px-10 lg:px-16 md:pb-16">
              <Reveal>
                <p className="text-[0.62rem] uppercase tracking-[0.32em] text-cream/85">Areas Served</p>
                <h1
                  className="mt-4 max-w-3xl font-display text-cream text-balance"
                  style={{ fontSize: "clamp(2.2rem,5.4vw,4.6rem)", lineHeight: 1.02, letterSpacing: "-0.025em" }}
                >
                  Quinceañera photography across Dallas–Fort Worth.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-cream/80 md:text-base">
                  One photographer, one celebration a day, the whole metroplex — la misa,
                  portraits, el vals, and the reception, documented start to finish. Fully
                  bilingual, with fixed-price collections from $1,800.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
                  <Link
                    href={site.cta.href}
                    className="inline-flex rounded-full bg-cream px-7 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-white"
                  >
                    {site.cta.label}
                  </Link>
                  <Link
                    href="/investment"
                    className="text-[0.7rem] uppercase tracking-[0.18em] text-cream/85 underline decoration-cream/30 underline-offset-[6px] transition-colors hover:text-cream"
                  >
                    See pricing
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ===== City grid — photo-led tiles, not bordered boxes ===== */}
      <section className="mx-auto max-w-[90rem] px-5 py-section md:px-10 lg:px-16 md:py-section-lg">
        <Reveal className="mb-10 max-w-xl md:mb-12">
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Across the metroplex</p>
          <h2
            className="mt-4 font-display text-ink"
            style={{ fontSize: "clamp(2rem,4vw,3.2rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
          >
            Find your city.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            Real coverage across DFW — from the church to the reception. Pick your city to see
            the work, the local venues, and how the day unfolds there.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {locations.map((l, i) => {
            const img = imgFor(i);
            return (
              <Reveal key={l.slug} delay={(i % 3) * 70}>
                <Link
                  href={`/quinceanera-photographer/${l.slug}`}
                  className="group relative block overflow-hidden bg-ink"
                >
                  <div className="relative aspect-[4/5]">
                    {img?.url ? (
                      <Image
                        src={img.url}
                        alt={`Quinceañera photography in ${l.city}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 30vw"
                        className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                        style={{ objectPosition: focal(img.focus_x, img.focus_y) }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/25 to-transparent" />
                    {l.tier === "premium" ? (
                      <span className="absolute left-4 top-4 bg-cream/15 px-2.5 py-1 text-[0.52rem] uppercase tracking-[0.2em] text-cream backdrop-blur-sm">
                        Premium
                      </span>
                    ) : null}
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                      <h3 className="font-display text-2xl leading-none text-cream md:text-3xl">{l.city}</h3>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-[0.56rem] uppercase tracking-[0.2em] text-cream/85">
                        Quinceañera photographer
                        <span aria-hidden className="text-wine-tint transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
