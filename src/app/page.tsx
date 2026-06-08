import Link from "next/link";
import { site } from "@/content/site";
import { home } from "@/content/home";
import { hero as heroMedia, homeFilm, mediaUrl } from "@/content/media";
import { homeTeaser } from "@/content/gallery";
import { packages } from "@/content/packages";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getVideos } from "@/lib/content-db";
import { HeroMedia } from "@/components/HeroMedia";
import { Figure } from "@/components/Figure";
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
  const [featured, videos] = await Promise.all([getFeaturedImages(9), getVideos()]);
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

  // Light editorial hero by default; switches to white-on-photo once a hero
  // poster is uploaded. Headline splits at the comma: serif line + script accent.
  const hasPoster = Boolean(mediaUrl(heroMedia.posterKey));
  const ci = home.hero.headline.indexOf(", ");
  const hl1 = ci > 0 ? home.hero.headline.slice(0, ci + 1) : home.hero.headline;
  const hl2 = ci > 0 ? home.hero.headline.slice(ci + 2) : "";

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative flex min-h-[92svh] items-center justify-center overflow-hidden">
        <HeroMedia
          posterKey={heroMedia.posterKey}
          posterAlt={heroMedia.posterAlt}
          videoMp4Key={heroMedia.videoMp4Key}
          videoWebmKey={heroMedia.videoWebmKey}
        />
        <div
          className={`mx-auto w-full max-w-4xl px-5 py-28 text-center ${hasPoster ? "text-cream" : "text-ink"}`}
        >
          <p className={`eyebrow ${hasPoster ? "text-cream/75" : "text-ink-faint"}`}>
            {site.serviceArea}
          </p>
          <h1 className="mt-7 text-balance">
            <span
              className="block font-display"
              style={{ fontSize: "clamp(2.6rem,7vw,5.6rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
            >
              {hl1}
            </span>
            {hl2 ? (
              <span
                className={`script mt-1 block ${hasPoster ? "text-cream" : "text-wine"}`}
                style={{ fontSize: "clamp(2.4rem,7.5vw,4.9rem)" }}
              >
                {hl2}
              </span>
            ) : null}
          </h1>
          <p
            className={`mx-auto mt-8 max-w-md text-sm leading-relaxed md:text-base ${hasPoster ? "text-cream/85" : "text-ink-soft"}`}
          >
            {home.hero.subline}
          </p>
          <p
            className={`mt-3 text-xs tracking-wide ${hasPoster ? "text-cream/65" : "text-ink-faint"}`}
          >
            {site.scarcity.heroMicroline}
          </p>
          <div className="mt-10 flex justify-center">
            <CTAButton href={site.cta.href} variant={hasPoster ? "onDark" : "primary"}>
              {site.cta.label}
            </CTAButton>
          </div>
          <div
            className={`mx-auto mt-14 h-16 rule-v ${hasPoster ? "text-cream" : "text-wine"}`}
          />
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

      {/* ---------- PACKAGES TEASER ---------- */}
      <section className="bg-greige">
        <div className="mx-auto max-w-3xl px-5 py-section text-center md:px-8 md:py-section-lg">
          <p className="eyebrow mb-5">{home.packages.eyebrow}</p>
          <h2 className="display-2 text-ink text-balance">{home.packages.heading}</h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
            {home.packages.body}
          </p>

          <div className="mt-12 divide-y divide-line border-y border-line text-left">
            {packages.map((p, i) => (
              <Reveal
                key={p.id}
                delay={i * 70}
                className="flex items-baseline justify-between gap-6 py-7"
              >
                <div>
                  <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-soft">
                    {p.teaser}
                  </p>
                </div>
                <span className="font-display text-2xl whitespace-nowrap text-ink">
                  {p.priceLabel}
                </span>
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
