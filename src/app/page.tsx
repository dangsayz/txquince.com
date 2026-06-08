import { site } from "@/content/site";
import { home } from "@/content/home";
import { hero as heroMedia, homeFilm } from "@/content/media";
import { homeTeaser } from "@/content/gallery";
import { packages } from "@/content/packages";
import { releasedTestimonials } from "@/content/testimonials";
import { HeroMedia } from "@/components/HeroMedia";
import { Figure } from "@/components/Figure";
import { FilmPlayer } from "@/components/FilmPlayer";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { CTAButton } from "@/components/CTAButton";
import { Stars } from "@/components/Stars";
import { FinalCTA } from "@/components/FinalCTA";

export default function HomePage() {
  const testimonials = releasedTestimonials();

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative flex min-h-[88svh] items-end overflow-hidden">
        <HeroMedia
          posterKey={heroMedia.posterKey}
          posterAlt={heroMedia.posterAlt}
          videoMp4Key={heroMedia.videoMp4Key}
          videoWebmKey={heroMedia.videoWebmKey}
        />
        <div className="mx-auto w-full max-w-7xl px-5 pb-16 md:px-8 md:pb-24">
          <div className="max-w-3xl">
            <p className="eyebrow text-cream/80">{site.serviceArea}</p>
            <h1 className="mt-5 font-display text-4xl leading-[1.04] text-cream text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              {home.hero.headline}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/85 md:text-lg">
              {home.hero.subline}
            </p>
            <p className="mt-4 text-sm text-cream/70">{site.scarcity.heroMicroline}</p>
            <div className="mt-9">
              <CTAButton href={site.cta.href} variant="onDark">
                {site.cta.label}
              </CTAButton>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SOCIAL PROOF STRIP ---------- */}
      <section className="border-b border-line bg-ivory">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-7 text-center md:flex-row md:justify-center md:gap-10 md:px-8">
          <span className="text-sm font-medium tracking-wide text-ink">
            {site.proof.familiesLine}
          </span>
          <span className="hidden h-4 w-px bg-line md:block" aria-hidden />
          <span className="flex items-center gap-2">
            <Stars />
            <span className="text-sm text-ink-soft">{site.proof.rating} average</span>
          </span>
          <span className="hidden h-4 w-px bg-line md:block" aria-hidden />
          <span className="text-sm text-ink-soft">{site.serviceArea}</span>
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

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {homeTeaser.slice(0, 9).map((img, i) => (
            <Reveal
              key={i}
              delay={(i % 3) * 70}
              className={img.feature ? "col-span-2 lg:row-span-2" : ""}
            >
              <Figure
                imageKey={img.key}
                alt={img.alt}
                ratio={img.feature ? "landscape" : (img.ratio ?? "portrait")}
                sizes="(max-width: 640px) 50vw, 33vw"
              />
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
          <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {home.experience.points.map((p, i) => (
              <Reveal key={p.title} delay={i * 90} className="bg-cream p-8 md:p-10">
                <span className="font-display text-2xl text-wine">0{i + 1}</span>
                <h3 className="mt-5 font-display text-2xl text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FILM ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="eyebrow mb-5">{home.film.eyebrow}</p>
          <h2 className="font-display text-3xl leading-tight text-ink text-balance sm:text-4xl md:text-5xl">
            {home.film.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            {home.film.body}
          </p>
        </div>
        <Reveal>
          <FilmPlayer
            posterKey={homeFilm.posterKey}
            mp4Key={homeFilm.mp4Key}
            webmKey={homeFilm.webmKey}
            alt={homeFilm.alt}
          />
        </Reveal>
      </section>

      {/* ---------- PACKAGES TEASER ---------- */}
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-7xl px-5 py-section md:px-8 md:py-section-lg">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow mb-5 text-cream/60">{home.packages.eyebrow}</p>
            <h2 className="font-display text-3xl leading-tight text-cream text-balance sm:text-4xl md:text-5xl">
              {home.packages.heading}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-cream/70">
              {home.packages.body}
            </p>
          </div>
          <div className="grid gap-px overflow-hidden border border-cream/15 bg-cream/15 md:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} className="bg-ink p-8 md:p-10">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl text-cream">{p.name}</h3>
                  <span className="font-display text-2xl text-cream/90">
                    {p.priceLabel}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-cream/65">
                  {p.teaser}
                </p>
              </Reveal>
            ))}
          </div>
          <div className="mt-12">
            <CTAButton href="/investment" variant="onDark">
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
