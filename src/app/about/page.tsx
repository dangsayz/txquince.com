import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { about } from "@/content/about";
import { site } from "@/content/site";
import { getImageBySlug, getImagesBySection, getFeaturedImages, getPageHero } from "@/lib/content-db";
import { Figure } from "@/components/Figure";
import { Reveal } from "@/components/Reveal";
import { EditOverlay } from "@/components/EditMode";
import { FinalCTA } from "@/components/FinalCTA";

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
      {/* ===== Cinematic hero — real DFW work, statement low-left in cream ===== */}
      <section className="relative overflow-hidden bg-ink">
        <div className="relative h-[66svh] min-h-[440px] w-full md:h-[76svh]">
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
                <p className="text-[0.62rem] uppercase tracking-[0.32em] text-cream/85">
                  {about.eyebrow}
                </p>
                <h1
                  className="mt-4 max-w-3xl font-display text-cream text-balance"
                  style={{ fontSize: "clamp(2.4rem,5.4vw,4.4rem)", lineHeight: 1.02, letterSpacing: "-0.024em" }}
                >
                  {about.heading}
                </h1>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Story — magazine split: the operator portrait beside the story column. */}
      <section className="mx-auto grid max-w-[90rem] items-start gap-10 px-5 py-24 md:grid-cols-12 md:gap-8 md:px-10 lg:px-16 md:py-36">
        <Reveal className="md:col-span-5">
          {aboutImg ? (
            <div className="relative overflow-hidden bg-greige" style={{ aspectRatio: "3 / 4" }}>
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
          ) : (
            <div className="relative">
              <Figure
                imageKey={about.portraitKey}
                alt={about.portraitAlt}
                ratio="portrait"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <EditOverlay image={{}} />
            </div>
          )}
        </Reveal>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
            The story
          </p>
          <div className="mt-8 flex max-w-prose flex-col gap-6 text-[1.02rem] leading-relaxed text-ink-soft">
            {about.story.map((p, i) => (
              <Reveal key={i} delay={i * 60} as="p">
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Culture + approach — DARK contrast band, hairline-separated columns. */}
      <section className="bg-ink text-cream">
        <div className="mx-auto grid max-w-[90rem] gap-14 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 lg:px-16 md:py-28">
          <Reveal>
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-wine">La cultura</p>
            <h2 className="mt-4 font-display text-3xl text-cream md:text-4xl">
              {about.culture.heading}
            </h2>
            <p className="mt-5 max-w-prose text-[0.98rem] leading-relaxed text-cream/75">
              {about.culture.body}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-wine">The approach</p>
            <h2 className="mt-4 font-display text-3xl text-cream md:text-4xl">
              {about.approach.heading}
            </h2>
            <p className="mt-5 max-w-prose text-[0.98rem] leading-relaxed text-cream/75">
              {about.approach.body}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Closing — one italic line, left, large. */}
      <section className="mx-auto max-w-[90rem] px-5 py-24 md:px-10 lg:px-16 md:py-36">
        <Reveal>
          <p
            className="max-w-3xl font-display italic leading-snug text-ink"
            style={{ fontSize: "clamp(1.7rem,3.4vw,2.8rem)" }}
          >
            {about.closing}
          </p>
        </Reveal>
        <p className="mt-8 max-w-prose text-sm leading-relaxed text-ink-soft">
          I photograph quinceañeras across Dallas–Fort Worth — see{" "}
          <Link href="/quinceanera-photographer/dallas" className="text-wine underline underline-offset-2 hover:text-wine-deep">
            Dallas
          </Link>
          ,{" "}
          <Link href="/quinceanera-photographer/fort-worth" className="text-wine underline underline-offset-2 hover:text-wine-deep">
            Fort Worth
          </Link>
          , or{" "}
          <Link href="/quinceanera-photographer" className="text-wine underline underline-offset-2 hover:text-wine-deep">
            every area I serve
          </Link>
          .
        </p>
      </section>

      <FinalCTA />
    </>
  );
}
