import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { home } from "@/content/home";
import { homeTeaser } from "@/content/gallery";
import { packages, depositFloorLabel } from "@/content/packages";
import { locations } from "@/content/locations";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getVideos, getHeroMedia } from "@/lib/content-db";
import { DateChecker } from "@/components/DateChecker";
import { BOOKING_STEPS } from "@/components/HowBookingWorks";
import { VideoGallery } from "@/components/VideoGallery";
import { Reveal } from "@/components/Reveal";
import { EditOverlay } from "@/components/EditMode";
import { FaqJsonLd } from "@/components/FaqJsonLd";

export const revalidate = 60;

/**
 * HOME — editorial system, not template blocks.
 *
 * Rules of the composition:
 *  · left-aligned; the page has ONE deliberate centered moment (the date check)
 *  · image scale is the drama — oversized, narrow, detail, full-bleed cinematic
 *  · hairlines are the only ornament; no cards, no badges, no decoration
 *  · type contrast: display moments up to ~8rem against a quiet 1rem body
 *  · in-page CTAs stay quiet (underlined); the nav + sticky bar carry the loud one
 */

type Frame = {
  url: string | null;
  alt: string;
  fx?: number | null;
  fy?: number | null;
  /** DB identity — lets the admin overlay anchor/replace this image in place. */
  id?: string | null;
  slug?: string | null;
};

/** Admin-only edit chip for a frame (renders nothing for visitors). */
function editable(f: Frame | null | undefined) {
  if (!f) return null;
  return <EditOverlay image={{ id: f.id, slug: f.slug, alt: f.alt, fx: f.fx, fy: f.fy }} />;
}

/** objectPosition from a frame's focal anchor (admin-set), else a slot default. */
function focal(f: Frame | null | undefined, defX = 50, defY = 35): string {
  const x = f?.fx != null ? Math.round(f.fx * 100) : defX;
  const y = f?.fy != null ? Math.round(f.fy * 100) : defY;
  return `${x}% ${y}%`;
}

function quietLink(extra = "") {
  return `group inline-flex items-baseline gap-2 text-[0.72rem] uppercase tracking-[0.2em] underline-offset-[6px] transition-colors ${extra}`;
}

export default async function HomePage() {
  const testimonials = releasedTestimonials();
  const [featured, videos, heroMedia] = await Promise.all([
    getFeaturedImages(24),
    getVideos(),
    getHeroMedia(),
  ]);

  const frames: Frame[] = featured.length
    ? featured.map((i) => ({
        url: i.url,
        alt: i.alt,
        fx: i.focus_x,
        fy: i.focus_y,
        id: i.id,
        slug: i.slug,
      }))
    : homeTeaser.slice(0, 6).map((i) => ({ url: null, alt: i.alt }));

  // Hero frame: admin-set hero (photo / film poster), else top featured.
  const cover: Frame | null =
    heroMedia?.kind === "image" && heroMedia.imageUrl
      ? { url: heroMedia.imageUrl, alt: heroMedia.imageAlt }
      : heroMedia?.kind === "video" && heroMedia.posterUrl
        ? { url: heroMedia.posterUrl, alt: "Quinceañera film still" }
        : frames[0] ?? null;
  // If the hero is the top featured photo, its admin-set anchor applies too.
  const coverFocal = focal(cover?.fx != null ? cover : null, 50, 30);

  // The closing campaign frame avoids repeating the hero when possible.
  const seq = frames.filter((f) => f.url !== cover?.url);
  const closing = seq[4] ?? frames[4] ?? frames[0]; // campaign close

  // Selected-work teaser — a clean, uniform grid (no asymmetric offsets).
  // Portrait-only so every tile crops identically; most featured photos are
  // 2:3, so this removes the orientation jitter that read as "random." Faces
  // survive the 4:5 crop via a top-biased default when no focal anchor is set.
  const portraitFeatured = featured.filter((i) => (i.height ?? 0) > (i.width ?? 0));
  const gallerySource = portraitFeatured.length >= 6 ? portraitFeatured : featured;
  const gallery: Frame[] = gallerySource.length
    ? gallerySource.slice(0, 6).map((i) => ({
        url: i.url,
        alt: i.alt,
        fx: i.focus_x,
        fy: i.focus_y,
        id: i.id,
        slug: i.slug,
      }))
    : frames.slice(0, 6);

  return (
    <>
      {/* ================= HERO — type bottom-left, image bleeding off the right edge ================= */}
      <section className="relative">
        <div className="grid md:grid-cols-12">
          {/* Image: flush to the top + right edge of the viewport. On desktop it
              stretches to the full grid-row height (matching the type column) with
              an 88svh floor, so its bottom always meets the end of the div. */}
          <div className="relative order-1 h-[62svh] md:order-2 md:col-span-7 md:h-auto md:min-h-[88svh]">
            {cover?.url ? (
              <Image
                src={cover.url}
                alt={cover.alt || "Quinceañera portrait"}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 58vw"
                className="object-cover"
                style={{ objectPosition: coverFocal }}
              />
            ) : (
              <div className="absolute inset-0 bg-greige" />
            )}
            {editable(cover)}
          </div>

          {/* Type: pinned to the bottom of the cream field — museum air above. */}
          <div className="order-2 flex flex-col justify-end px-5 pb-12 pt-14 md:order-1 md:col-span-5 md:pb-20 md:pl-10 md:pr-12 md:pt-24 lg:pl-16">
            <h1 className="hero-enter hero-delay-2 mt-8">
              {/* Target keyword leads the H1 (broad metro term — city pages own
                  the city-specific phrases), then the emotional hook. */}
              <span className="mb-6 block text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
                Dallas–Fort Worth Quinceañera Photographer &amp; Film
              </span>
              <span
                className="block font-display text-ink"
                style={{
                  fontSize: "clamp(3.2rem,8.6vw,7.6rem)",
                  lineHeight: 0.96,
                  letterSpacing: "-0.03em",
                }}
              >
                Once in
              </span>
              <span
                className="block font-display italic text-ink"
                style={{
                  fontSize: "clamp(3.2rem,8.6vw,7.6rem)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                her lifetime.
              </span>
            </h1>

            <p className="hero-enter hero-delay-3 mt-7 max-w-sm text-[0.95rem] leading-relaxed text-ink-soft">
              {site.tagline}. One celebration per day — never two.
            </p>

            {/* Supporting keyword cluster — long-tail moments + suburb geo,
                woven as a natural sentence (reinforces the H1, no stuffing). */}
            <p className="hero-enter hero-delay-4 mt-4 max-w-md text-[0.8rem] leading-relaxed text-ink-faint">
              Full-day quince photography and video — the save-the-date session,
              la misa, portraits, el vals, and the reception — quinceañera coverage
              serving Dallas, Fort Worth, Arlington, Irving, Garland, Grand Prairie,
              and Mansfield.
            </p>

            <div className="hero-enter hero-delay-5 mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-3">
              <Link
                href={site.cta.href}
                className={quietLink("text-ink underline decoration-ink/30 hover:decoration-wine hover:text-wine")}
              >
                Reserve your date
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
              <Link
                href="/portfolio"
                className={quietLink("text-ink-soft underline decoration-ink/20 hover:text-ink")}
              >
                The work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CREDIBILITY — editorial stat line, not stars ================= */}
      <section className="border-y border-ink/10">
        <div className="mx-auto grid max-w-[90rem] grid-cols-2 gap-y-8 px-5 py-12 md:grid-cols-4 md:px-10 lg:px-16 md:py-14">
          {[
            { n: "100+", l: "DFW families" },
            { n: "01", l: "celebration per day" },
            { n: "ES / EN", l: "se habla español" },
            { n: "’26", l: `booked through ${site.scarcity.bookedThrough.split(" ")[0]}` },
          ].map((s) => (
            <Reveal key={s.l}>
              <p
                className="font-display text-ink"
                style={{ fontSize: "clamp(1.9rem,3.4vw,3rem)", lineHeight: 1 }}
              >
                {s.n}
              </p>
              <p className="mt-2 text-[0.64rem] uppercase tracking-[0.22em] text-ink-faint">
                {s.l}
              </p>
            </Reveal>
          ))}
        </div>
        <div className="mx-auto max-w-[90rem] border-t border-ink/10 px-5 py-5 text-center md:px-10 lg:px-16">
          <p className="text-[0.64rem] uppercase tracking-[0.22em] text-ink-faint">
            {site.proof.insuredLine} — your church &amp; venue covered
          </p>
        </div>
      </section>

      {/* ================= THE WORK — a curated sequence, not a grid ================= */}
      <section className="pt-24 md:pt-36">
        {/* Spread title — oversized, left, with the section index far right. */}
        <div className="mx-auto flex max-w-[90rem] items-end justify-between px-5 md:px-10 lg:px-16">
          <Reveal>
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">{home.work.eyebrow}</p>
            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(2.6rem,6vw,5.4rem)", lineHeight: 0.98, letterSpacing: "-0.025em" }}
            >
              Selected work
            </h2>
          </Reveal>
          <p aria-hidden className="hidden font-display text-ink/15 md:block" style={{ fontSize: "5rem", lineHeight: 1 }}>
            01
          </p>
        </div>

        {/* A clean, even teaser grid — uniform 4:5 portrait tiles, faces kept
            by a top-biased crop. Orderly on purpose; the full set is /portfolio. */}
        <div className="mx-auto mt-14 grid max-w-[90rem] grid-cols-2 gap-3 px-5 sm:gap-4 md:mt-20 md:grid-cols-3 md:gap-5 md:px-10 lg:px-16">
          {gallery.map((f, i) => (
            <Reveal key={f.id ?? i} delay={(i % 3) * 80}>
              <Link href="/portfolio" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {f.url ? (
                    <Image
                      src={f.url}
                      alt={f.alt}
                      fill
                      sizes="(max-width: 768px) 50vw, 30vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                      style={{ objectPosition: focal(f, 50, 28) }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-greige" />
                  )}
                  {editable(f)}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-[90rem] justify-end px-5 md:mt-14 md:px-10 lg:px-16">
          <Link href="/portfolio" className={quietLink("text-ink underline decoration-ink/30 hover:text-wine hover:decoration-wine")}>
            {home.work.cta}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>

      {/* ================= FILM — the work in motion, straight after the stills ================= */}
      {videos.length > 0 ? (
        <section className="pt-24 md:pt-36">
          <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
            <Reveal className="mb-10 max-w-xl md:mb-14">
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">{home.film.eyebrow}</p>
              <h2
                className="mt-4 font-display text-ink"
                style={{ fontSize: "clamp(2.2rem,4vw,3.4rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
              >
                {home.film.heading}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft">{home.film.body}</p>
            </Reveal>
            <VideoGallery videos={videos} />
          </div>
        </section>
      ) : null}

      {/* ================= AVAILABILITY — the one centered moment ================= */}
      <section className="mt-24 border-y border-ink/10 md:mt-36">
        <div className="px-5 py-20 md:py-28">
          <Reveal>
            <DateChecker heading={home.checkDate.heading} body={home.checkDate.body} />
          </Reveal>
        </div>
      </section>

      {/* ================= INVESTMENT — a lookbook list, not pricing cards =================
          Lifted onto a faint champagne band bounded by hairlines so the pricing
          reads as its own distinct block, not another stretch of cream. */}
      <section className="border-y border-line bg-wine-tint/50 py-24 md:py-36">
        <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
          <div className="grid md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">{home.packages.eyebrow}</p>
              <h2
                className="mt-4 max-w-[12ch] font-display text-ink"
                style={{ fontSize: "clamp(2.4rem,4.6vw,4rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
              >
                Four collections.
              </h2>
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-soft">
                Fixed pricing, stated plainly. From {depositFloorLabel}, a deposit
                reserves the date; the balance splits into interest-free installments.
              </p>
            </Reveal>

            <div className="mt-12 md:col-span-7 md:col-start-6 md:mt-0">
              {packages.map((p, i) => (
                <Reveal key={p.id} delay={i * 60}>
                  <Link
                    href={`/reserve?collection=${p.id}`}
                    className={`group block py-9 md:py-10 ${i > 0 ? "border-t border-ink/10" : ""}`}
                  >
                    <div className="flex items-baseline justify-between gap-6">
                      <h3
                        className="font-display text-ink transition-colors group-hover:text-wine"
                        style={{ fontSize: p.highlight ? "clamp(2rem,3.6vw,3rem)" : "clamp(1.7rem,3vw,2.4rem)", lineHeight: 1 }}
                      >
                        {p.name}
                        {p.highlight ? (
                          <span className="ml-4 align-middle text-[0.58rem] uppercase tracking-[0.26em] text-wine-deep">
                            Most reserved
                          </span>
                        ) : null}
                      </h3>
                      <p className="whitespace-nowrap font-display text-ink" style={{ fontSize: "clamp(1.4rem,2.4vw,2rem)", lineHeight: 1 }}>
                        {p.priceLabel}
                      </p>
                    </div>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">{p.teaser}</p>
                    <p className="mt-4 text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Reserve {p.name} →
                    </p>
                  </Link>
                </Reveal>
              ))}
              <Reveal>
                <p className="border-t border-ink/10 pt-6 text-xs text-ink-faint">
                  Interest-free installments &amp; Affirm at checkout ·{" "}
                  <Link href="/investment" className="text-wine-deep underline underline-offset-4 hover:text-wine">
                    everything included
                  </Link>{" "}
                  ·{" "}
                  <Link href="/quinceanera-save-the-date" className="text-wine-deep underline underline-offset-4 hover:text-wine">
                    Save-the-Date session included free
                  </Link>
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROCESS — a calm numbered column, offset right ================= */}
      <section className="pt-24 md:pt-36">
        <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
          <div className="grid md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">The process</p>
              <h2
                className="mt-4 font-display text-ink"
                style={{ fontSize: "clamp(2.2rem,4vw,3.4rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
              >
                No guesswork.
              </h2>
            </Reveal>
            <div className="mt-12 md:col-span-6 md:col-start-6 md:mt-2">
              {BOOKING_STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 60} className={`grid grid-cols-12 gap-4 py-8 ${i > 0 ? "border-t border-ink/10" : ""}`}>
                  <p className="col-span-2 font-display text-2xl text-ink/25">0{i + 1}</p>
                  <div className="col-span-10">
                    <h3 className="font-display text-xl text-ink">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= GOOD TO KNOW — narrow editorial Q&A ================= */}
      <section className="pt-24 md:pt-36">
        {/* FAQPage structured data — mirrors the visible Q&A below for rich results. */}
        <FaqJsonLd />
        <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
          <div className="grid md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">{home.faq.eyebrow}</p>
            </Reveal>
            <dl className="md:col-span-6 md:col-start-6">
              {home.faq.items.map((f, i) => (
                <Reveal key={f.q} className={`py-7 ${i > 0 ? "border-t border-ink/10" : ""}`}>
                  <dt className="font-display text-xl text-ink">{f.q}</dt>
                  <dd className="mt-2.5 max-w-prose text-sm leading-relaxed text-ink-soft">{f.a}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ================= EXPLORE — what DFW families search; routes homepage authority into the cluster.
          Real, descriptive links (no keyword dump). Anchors carry the quince/quinceañera
          spelling split + the "photography and video / packages / locations" long-tails. ================= */}
      <section className="pt-24 md:pt-36">
        <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
          <Reveal className="mb-8 max-w-xl md:mb-10">
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Popular with DFW families</p>
            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(2rem,4vw,3.2rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
            >
              Start where you&rsquo;re searching.
            </h2>
          </Reveal>
          <div className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Quince photography packages & prices", blurb: "Four fixed collections from $1,800 — every price listed, no “inquire for pricing” games.", href: "/investment", tag: "Investment" },
              { label: "Quince photo & video — which to book", blurb: "What each one captures, and when a combined photo + film team is worth it.", href: "/blog/quinceanera-photo-vs-video", tag: "Guide" },
              { label: "Best quince photoshoot locations in DFW", blurb: "Real spots families return to — the Stockyards, gardens, downtown, and more.", href: "/blog/best-quinceanera-photo-locations-dfw", tag: "Locations" },
              { label: "Quinceañera save-the-date session", blurb: "The relaxed pre-quince shoot for invitations, décor, and the guest book.", href: "/quinceanera-save-the-date", tag: "Sessions" },
              { label: "What a quince photographer costs in DFW", blurb: "Real numbers, what moves the price, and how to budget honestly.", href: "/blog/quinceanera-photographer-cost-dallas-fort-worth", tag: "Cost" },
              { label: "The full quinceañera planning guide", blurb: "Timelines, traditions, and every guide for DFW families in one place.", href: "/blog", tag: "Journal" },
            ].map((e, i) => (
              <Reveal key={e.href} delay={(i % 3) * 60}>
                <Link href={e.href} className="group flex h-full flex-col border-t border-ink/10 py-7 md:py-8">
                  <h3 className="font-display text-lg text-ink transition-colors group-hover:text-wine md:text-xl">
                    {e.label}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{e.blurb}</p>
                  <span className="mt-4 text-[0.6rem] uppercase tracking-[0.22em] text-ink-faint">
                    {e.tag}
                    <span aria-hidden className="ml-2 text-wine transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ACROSS DFW — service-area band; carries link weight to the city pages ================= */}
      <section className="pt-24 md:pt-36">
        <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
          <div className="grid md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">Across Dallas–Fort Worth</p>
              <h2
                className="mt-4 font-display text-ink"
                style={{ fontSize: "clamp(2.2rem,4vw,3.4rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
              >
                Your city.
              </h2>
            </Reveal>
            <div className="mt-12 md:col-span-7 md:col-start-6 md:mt-2">
              {/* The two head-term cities get full editorial links. */}
              {locations
                .filter((l) => l.slug === "dallas" || l.slug === "fort-worth")
                .map((l, i) => (
                  <Reveal key={l.slug} delay={i * 60}>
                    <Link
                      href={`/quinceanera-photographer/${l.slug}`}
                      className={`group block py-8 ${i > 0 ? "border-t border-ink/10" : ""}`}
                    >
                      <h3
                        className="font-display text-ink transition-colors group-hover:text-wine"
                        style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", lineHeight: 1 }}
                      >
                        Quinceañera photographer in {l.city}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{l.lead}</p>
                    </Link>
                  </Reveal>
                ))}
              {/* The rest of the metroplex as quiet inline links, plus the hub. */}
              <Reveal>
                <div className="flex flex-wrap gap-x-6 gap-y-2.5 border-t border-ink/10 pt-7">
                  {locations
                    .filter((l) => l.slug !== "dallas" && l.slug !== "fort-worth")
                    .map((l) => (
                      <Link
                        key={l.slug}
                        href={`/quinceanera-photographer/${l.slug}`}
                        className="text-sm text-ink-soft underline decoration-ink/20 underline-offset-4 transition-colors hover:text-wine hover:decoration-wine"
                      >
                        {l.city}
                      </Link>
                    ))}
                  <Link
                    href="/quinceanera-photographer"
                    className={quietLink("text-wine-deep underline decoration-wine/40 hover:text-wine hover:decoration-wine")}
                  >
                    All areas
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS — pull-quotes, when released ones exist ================= */}
      {testimonials.length > 0 ? (
        <section className="pt-24 md:pt-36">
          <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
            <div className="grid gap-y-14 md:grid-cols-12">
              <Reveal className="md:col-span-3">
                <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">{home.testimonials.eyebrow}</p>
              </Reveal>
              <div className="space-y-14 md:col-span-7 md:col-start-5">
                {testimonials.slice(0, 2).map((t, i) => (
                  <Reveal key={i} delay={i * 80}>
                    <blockquote
                      className="font-display italic leading-snug text-ink"
                      style={{ fontSize: "clamp(1.5rem,2.8vw,2.2rem)" }}
                    >
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <p className="mt-4 text-[0.64rem] uppercase tracking-[0.22em] text-ink-faint">
                      {t.momName} · {t.daughterName}&apos;s quinceañera{t.location ? ` · ${t.location}` : ""}
                    </p>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= CLOSE — campaign spread: full-bleed image, type low-left ================= */}
      <section className="relative mt-24 md:mt-36">
        <div className="relative h-[78svh] w-full overflow-hidden">
          {closing?.url ? (
            <Image
              src={closing.url}
              alt={closing.alt || "Quinceañera"}
              fill
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: focal(closing, 50, 25) }}
            />
          ) : (
            <div className="absolute inset-0 bg-ink" />
          )}
          {editable(closing)}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-[90rem] px-5 pb-14 md:px-10 lg:px-16 md:pb-20">
              <p
                className="max-w-3xl font-display italic text-cream"
                style={{ fontSize: "clamp(2rem,5vw,4.2rem)", lineHeight: 1.05 }}
              >
                Only a few {site.scarcity.reservingYear} dates remain.
              </p>
              <div className="mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-3">
                <Link
                  href={site.cta.href}
                  className={quietLink("text-cream underline decoration-cream/40 hover:decoration-cream")}
                >
                  Reserve your date
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
                <Link
                  href={site.secondaryCta.href}
                  className={quietLink("text-cream/70 underline decoration-cream/25 hover:text-cream")}
                >
                  Questions first
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
