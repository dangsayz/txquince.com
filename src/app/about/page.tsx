import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { about } from "@/content/about";
import { site } from "@/content/site";
import { getImageBySlug, getImagesBySection, getFeaturedImages, getPageHero } from "@/lib/content-db";
import { Figure } from "@/components/Figure";
import { Reveal } from "@/components/Reveal";
import { EditOverlay } from "@/components/EditMode";

// ISR: regenerate hourly so newly featured/about photos surface without a redeploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description:
    "Reliable, bilingual quinceañera photography & film in Dallas–Fort Worth — built around the families other vendors let down.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · TX Quince",
    description:
      "Reliable, bilingual quinceañera photography & film in Dallas–Fort Worth.",
    url: `${site.url}/about`,
  },
};

/** objectPosition from a photo's focal anchor; defaults top-biased so faces survive a wide crop. */
function focal(fx?: number | null, fy?: number | null): string {
  return `${Math.round((fx ?? 0.5) * 100)}% ${Math.round((fy ?? 0.32) * 100)}%`;
}

export default async function AboutPage() {
  // The operator's portrait is sourced from the DB (so it's hover-editable in
  // place, like every gallery photo). Prefer the dedicated "about" section, then
  // a permanent "about-portrait" slug; null until the operator sets one.
  const aboutImg =
    (await getImagesBySection("about"))[0] ??
    (await getImageBySlug("about-portrait")) ??
    null;

  // Branded serve route (/api/img/{slug}) sized inline — the same plain-<img>
  // pattern the reserve + photo pages use. next/image is intentionally avoided:
  // its custom loader rewrites to /img/{slug}, which 404s.
  const sized = (w: number) =>
    aboutImg ? `${aboutImg.url}${aboutImg.url.includes("?") ? "&" : "?"}w=${w}` : "";
  const portraitFocal = `${(aboutImg?.focus_x ?? 0.5) * 100}% ${(aboutImg?.focus_y ?? 0.4) * 100}%`;

  // Real DFW work for the cinematic opener — a landscape frame crops cleanest in
  // the wide hero. next/image works here via the branded custom loader (it routes
  // /api/img/{slug}?w=… through the protected serve route, never the 404-prone
  // optimizer). The operator portrait below stays a plain <img> so it remains
  // hover-editable in place.
  const featured = await getFeaturedImages(12);
  const hero =
    (await getPageHero("about")) ??
    featured.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ??
    featured[0] ??
    null;

  return (
    <>
      <section className="mx-auto max-w-[88rem] px-5 pb-14 pt-5 sm:px-8 sm:pb-20 sm:pt-10 lg:px-12 lg:pt-14" aria-labelledby="about-title">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-line bg-accent-soft lg:min-h-[36rem] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[2rem]">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-16 lg:px-14">
            <p className="text-xs font-semibold text-accent-strong">{about.eyebrow}</p>
            <h1 id="about-title" className="mt-4 max-w-[13ch] font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.12] text-ink sm:mt-6">{about.heading}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft sm:mt-7 sm:text-lg">Quinceañera photography and film for families across Dallas–Fort Worth.</p>
            <Link href="/check-your-date" className="mt-8 inline-flex min-h-12 w-fit items-center justify-center whitespace-nowrap rounded-full bg-accent px-7 text-base font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Check her date <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
          </div>
          <div className="relative min-h-[22rem] bg-greige sm:min-h-[30rem] lg:min-h-full">
            <Image
              src={hero?.url ?? "/portfolio/hero.webp"}
              alt={hero?.alt || "Quinceañera portrait in Dallas–Fort Worth"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
              style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : { objectPosition: "center 58%" }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[88rem] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-12 md:gap-12 lg:px-12 lg:py-24" aria-labelledby="story-title">
        <Reveal className="md:col-span-5">
          {aboutImg ? (
            <div className="relative overflow-hidden rounded-2xl bg-greige" style={{ aspectRatio: "3 / 4" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sized(900)}
                srcSet={`${sized(640)} 640w, ${sized(900)} 900w, ${sized(1200)} 1200w`}
                sizes="(max-width: 768px) 100vw, 42vw"
                alt={aboutImg.alt || about.portraitAlt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: portraitFocal }}
              />
              <EditOverlay
                image={{ id: aboutImg.id, slug: aboutImg.slug, alt: aboutImg.alt, fx: aboutImg.focus_x, fy: aboutImg.focus_y }}
              />
            </div>
          ) : about.portraitKey ? (
            <div className="relative">
              <Figure
                imageKey={about.portraitKey}
                alt={about.portraitAlt}
                ratio="portrait"
                sizes="(max-width: 768px) 100vw, 42vw"
                className="rounded-2xl"
              />
              <EditOverlay image={{}} />
            </div>
          ) : (
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-greige">
              <Image src="/portfolio/red-garden.webp" alt="Quinceañera portrait in a red gown" fill sizes="(max-width: 768px) 100vw, 42vw" className="object-cover" />
              <EditOverlay image={{}} />
            </div>
          )}
        </Reveal>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-xs font-semibold text-accent-strong">The story</p>
          <h2 id="story-title" className="mt-3 max-w-md font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight text-ink">A thoughtful way to remember her day.</h2>
          <div className="mt-6 flex max-w-prose flex-col gap-5 text-base leading-7 text-ink-soft sm:mt-8">
            {about.story.map((p, i) => (
              <Reveal key={i} delay={i * 60} as="p">
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-accent-soft py-16 sm:py-20 lg:py-24" aria-label="Our approach">
        <div className="mx-auto grid max-w-[88rem] gap-10 px-5 sm:px-8 md:grid-cols-2 md:gap-12 lg:px-12">
          <Reveal className="border-t border-accent/25 pt-7">
            <p className="text-xs font-semibold text-accent-strong">01 · La cultura</p>
            <h2 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.15rem)] leading-tight text-ink">{about.culture.heading}</h2>
            <p className="mt-4 max-w-prose text-base leading-7 text-ink-soft">{about.culture.body}</p>
          </Reveal>
          <Reveal className="border-t border-accent/25 pt-7" delay={90}>
            <p className="text-xs font-semibold text-accent-strong">02 · The approach</p>
            <h2 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2.15rem)] leading-tight text-ink">{about.approach.heading}</h2>
            <p className="mt-4 max-w-prose text-base leading-7 text-ink-soft">{about.approach.body}</p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24" aria-labelledby="about-next-title">
        <div className="grid gap-10 border-t border-line pt-10 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-16">
          <Reveal>
            <p className="text-xs font-semibold text-accent-strong">The next step</p>
            <h2 id="about-next-title" className="mt-4 max-w-2xl font-display text-[clamp(1.75rem,3vw,2.75rem)] leading-tight text-ink">{about.closing}</h2>
            <Link href="/check-your-date" className="mt-8 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full bg-accent px-7 text-base font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              Check her date <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
          </Reveal>
          <div>
            <p className="max-w-sm text-base leading-7 text-ink-soft">Explore quinceañera photography across the places we serve.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/quinceanera-photographer/dallas" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line px-5 text-sm font-medium text-ink hover:border-accent hover:text-accent-strong">Dallas ↗</Link>
              <Link href="/quinceanera-photographer/fort-worth" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line px-5 text-sm font-medium text-ink hover:border-accent hover:text-accent-strong">Fort Worth ↗</Link>
              <Link href="/quinceanera-photographer" className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line px-5 text-sm font-medium text-ink hover:border-accent hover:text-accent-strong">All areas ↗</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
