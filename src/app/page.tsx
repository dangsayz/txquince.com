import Link from "next/link";
import { site } from "@/content/site";
import { home } from "@/content/home";
import { homeFilm } from "@/content/media";
import { homeTeaser } from "@/content/gallery";
import { packages } from "@/content/packages";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getVideos, getHeroMedia } from "@/lib/content-db";
import { Figure } from "@/components/Figure";
import { HeroShowcase } from "@/components/HeroShowcase";
import { FilmPlayer } from "@/components/FilmPlayer";
import { VideoGallery } from "@/components/VideoGallery";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CTAButton } from "@/components/CTAButton";
import { Stars } from "@/components/Stars";
import { FinalCTA } from "@/components/FinalCTA";

export const revalidate = 60;

export default async function HomePage() {
  const testimonials = releasedTestimonials();
  const [featured, videos, heroMedia] = await Promise.all([
    getFeaturedImages(9),
    getVideos(),
    getHeroMedia(),
  ]);
  const teaser = featured.length
    ? featured.map((i) => ({
        url: i.url,
        alt: i.alt,
        feature: i.is_feature,
        ratio: "portrait" as const,
      }))
    : homeTeaser.slice(0, 9).map((i) => ({
        url: null as string | null,
        alt: i.alt,
        feature: Boolean(i.feature),
        ratio: i.ratio ?? ("portrait" as const),
      }));

  // Headline splits at the comma: espresso serif line + terracotta serif accent.
  const ci = home.hero.headline.indexOf(", ");
  const hl1 = ci > 0 ? home.hero.headline.slice(0, ci + 1) : home.hero.headline;
  const hl2 = ci > 0 ? home.hero.headline.slice(ci + 2) : "";

  return (
    <>
      {/* ---------- HERO (Claura split: left text · right floating quince image) ---------- */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-10 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-8 md:pb-24 md:pt-16">
          {/* Left — text (staggered entrance) */}
          <div className="relative z-10">
            {/* Editorial masthead — couture script flourish + locale, not a badge */}
            <div className="hero-enter hero-delay-1 flex items-center gap-3">
              <span className="script text-wine" style={{ fontSize: "1.75rem", lineHeight: 1 }}>
                Para siempre
              </span>
              <span aria-hidden className="h-px w-7 bg-ink/25" />
              <span className="text-[0.66rem] uppercase tracking-[0.28em] text-ink-faint">
                {site.serviceArea}
              </span>
            </div>

            <h1 className="hero-enter hero-delay-2 mt-7 text-balance">
              <span
                className="block font-display text-ink"
                style={{ fontSize: "clamp(2.5rem,5.4vw,4.5rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
              >
                {hl1}
              </span>
              {hl2 ? (
                <span
                  className="mt-1 block font-display italic text-wine"
                  style={{ fontSize: "clamp(2.2rem,4.8vw,3.9rem)", lineHeight: 1.05 }}
                >
                  {hl2}
                </span>
              ) : null}
            </h1>

            <p className="hero-enter hero-delay-3 mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              {home.hero.subline}
            </p>

            <div className="hero-enter hero-delay-4 mt-8 flex flex-wrap items-center gap-3">
              <Link href={site.cta.href} className="btn-espresso">
                {site.cta.label}
              </Link>
              <Link href="/portfolio" className="btn-soft group">
                See the galleries
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink transition-transform duration-300 group-hover:translate-x-0.5">
                  <svg width="7" height="8" viewBox="0 0 7 8" fill="none" aria-hidden="true">
                    <path d="M0 0L7 4L0 8V0Z" className="fill-cream" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* One refined proof line (replaces the stacked badge + microline) */}
            <div className="hero-enter hero-delay-5 mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <span className="flex items-center gap-2">
                <Stars />
                <span className="text-ink-soft">{site.proof.familiesLine}</span>
              </span>
              <span aria-hidden className="hidden h-3.5 w-px bg-line sm:block" />
              <span className="text-ink-soft">
                Booked through{" "}
                <span className="font-medium text-ink">{site.scarcity.bookedThrough}</span>
              </span>
            </div>
          </div>

          {/* Right — hero showcase: an admin-set video or photo (set in
              /admin/hero), else the top Featured portfolio photo, else a soft
              gradient. Bleeds off the edge; the section clips it. */}
          <HeroShowcase
            media={heroMedia}
            fallback={
              featured[0]?.url
                ? { url: featured[0].url, alt: featured[0].alt || "Quinceañera portrait" }
                : null
            }
          />
        </div>
      </section>

      {/* ---------- THE WORK (teaser grid) ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <SectionHeading eyebrow={home.work.eyebrow} className="max-w-2xl">
            {home.work.heading}
          </SectionHeading>
          <CTAButton href="/portfolio" variant="text">
            {home.work.cta}
          </CTAButton>
        </div>

        {/* Focal anchor: one cinematic image draws the eye first… */}
        <Reveal>
          <Link href="/portfolio" className="group block overflow-hidden">
            <div className="transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
              <Figure
                src={teaser[0]?.url ?? null}
                alt={teaser[0]?.alt ?? "Quinceañera portrait"}
                ratio="landscape"
                priority={false}
                sizes="100vw"
                className="max-h-[64vh]"
              />
            </div>
          </Link>
        </Reveal>

        {/* …then a calm, gapless grid lets the rest of the work breathe. */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:gap-5 md:mt-5 md:grid-cols-3">
          {teaser.slice(1, 7).map((img, i) => (
            <Reveal key={i} delay={(i % 3) * 70}>
              <Link href="/portfolio" className="group block overflow-hidden">
                <div className="transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                  <Figure
                    src={img.url}
                    alt={img.alt}
                    ratio="portrait"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- THE EXPERIENCE ---------- */}
      <section className="bg-greige">
        <div className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
          <SectionHeading eyebrow={home.experience.eyebrow} className="max-w-2xl">
            {home.experience.heading}
          </SectionHeading>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {home.experience.points.map((p, i) => (
              <Reveal
                key={p.title}
                delay={i * 90}
                className="rounded-[1.5rem] border border-line bg-cream p-8 md:p-9"
              >
                <span className="font-display text-3xl text-wine">0{i + 1}</span>
                <h3 className="mt-4 font-display text-2xl text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FILM ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <div className="mb-5">
            <span className="tag">{home.film.eyebrow}</span>
          </div>
          <h2 className="display-2 text-ink text-balance">{home.film.heading}</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            {home.film.body}
          </p>
        </div>
        {videos.length ? (
          <VideoGallery videos={videos.slice(0, 3)} />
        ) : (
          <Reveal>
            <FilmPlayer
              posterKey={homeFilm.posterKey}
              mp4Key={homeFilm.mp4Key}
              webmKey={homeFilm.webmKey}
              alt={homeFilm.alt}
            />
          </Reveal>
        )}
      </section>

      {/* ---------- PACKAGES TEASER (clean price list) ---------- */}
      <section className="bg-greige">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-8 md:py-section-lg">
          <span className="tag">{home.packages.eyebrow}</span>
          <h2 className="mt-5 display-2 text-ink text-balance">{home.packages.heading}</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            {home.packages.body}
          </p>

          <div className="mt-12 divide-y divide-line border-y border-line text-left">
            {packages.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <Link
                  href={`/reserve?collection=${p.id}`}
                  className="group flex items-baseline justify-between gap-6 py-7 transition-colors"
                >
                  <div>
                    <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-wine">
                      {p.name}
                    </h3>
                    <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
                      {p.teaser}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-[0.14em] text-wine opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Reserve this collection
                      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                    </span>
                  </div>
                  <span className="font-display text-2xl whitespace-nowrap text-ink">
                    {p.priceLabel}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <CTAButton href="/investment" variant="ink">
              {home.packages.cta}
            </CTAButton>
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS (released only) ---------- */}
      {testimonials.length > 0 ? (
        <section className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
          <SectionHeading
            eyebrow={home.testimonials.eyebrow}
            align="center"
            className="mx-auto max-w-2xl"
          >
            {home.testimonials.heading}
          </SectionHeading>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t, i) => (
              <Reveal key={i} delay={i * 90} className="flex flex-col">
                {t.photoKey ? (
                  <Figure
                    imageKey={t.photoKey}
                    alt={t.photoAlt ?? `${t.daughterName}'s quinceañera`}
                    ratio="landscape"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="mb-6"
                  />
                ) : null}
                <Stars className="mb-4" />
                <blockquote className="font-display text-xl leading-snug text-ink">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <p className="mt-5 text-sm text-ink-soft">
                  {t.momName} · {t.daughterName}&apos;s quinceañera
                  {t.location ? ` · ${t.location}` : ""}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------- FINAL CTA BAND ---------- */}
      <FinalCTA />
    </>
  );
}
