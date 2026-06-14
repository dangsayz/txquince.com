import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { home } from "@/content/home";
import { homeTeaser } from "@/content/gallery";
import { packages } from "@/content/packages";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getVideos, getHeroMedia } from "@/lib/content-db";
import { DateChecker } from "@/components/DateChecker";
import { BOOKING_STEPS } from "@/components/HowBookingWorks";
import { VideoGallery } from "@/components/VideoGallery";
import { Reveal } from "@/components/Reveal";
import { EditOverlay } from "@/components/EditMode";

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

const FRAME_TONES = {
  ink: { grad: "from-[#3a2718] via-[#2c1d12] to-[#160e07]", text: "text-cream", soft: "text-cream/55", line: "border-cream/15" },
  wine: { grad: "from-[#b6491f] via-[#86331a] to-[#2c1d12]", text: "text-cream", soft: "text-cream/60", line: "border-cream/20" },
  sand: { grad: "from-[#f1e4d1] via-[#e2cdae] to-[#cbb491]", text: "text-ink", soft: "text-ink/45", line: "border-ink/10" },
} as const;

/**
 * ArtFrame — renders the real photo when one exists; otherwise an editorial
 * "plate": a toned gradient, a hairline frame, a serif caption and a corner
 * index. Until the gallery is populated, the page reads as composed art
 * direction instead of flat grey blocks.
 */
function ArtFrame({
  frame,
  label,
  index,
  tone = "ink",
  sizes,
  defX = 50,
  defY = 30,
  imgClass = "object-cover",
  priority,
}: {
  frame: Frame | null | undefined;
  label: string;
  index?: string;
  tone?: keyof typeof FRAME_TONES;
  sizes: string;
  defX?: number;
  defY?: number;
  imgClass?: string;
  priority?: boolean;
}) {
  if (frame?.url) {
    return (
      <Image
        src={frame.url}
        alt={frame.alt || label}
        fill
        priority={priority}
        sizes={sizes}
        className={imgClass}
        style={{ objectPosition: focal(frame, defX, defY) }}
      />
    );
  }
  const t = FRAME_TONES[tone];
  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${t.grad}`}>
      <div className={`absolute inset-3 border ${t.line} md:inset-4`} aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(115% 80% at 50% 0%, transparent 40%, rgba(0,0,0,0.4) 100%)" }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {index ? (
          <span className={`mb-4 text-[0.58rem] uppercase tracking-[0.34em] ${t.soft}`}>{index}</span>
        ) : null}
        <span
          className={`font-display italic ${t.text}`}
          style={{ fontSize: "clamp(1.5rem,3.2vw,2.8rem)", lineHeight: 1.08 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/** A slow editorial marquee ribbon (uses the .marquee-track keyframe). */
function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden">
      <div className="marquee-track flex shrink-0 items-center whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`font-display italic ${dark ? "text-cream" : "text-ink"}`}
              style={{ fontSize: "clamp(1.6rem,3.6vw,3.2rem)", lineHeight: 1 }}
            >
              {w}
            </span>
            <span aria-hidden className={`mx-7 text-base ${dark ? "text-wine" : "text-wine"} md:mx-10`}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const testimonials = releasedTestimonials();
  const [featured, videos, heroMedia] = await Promise.all([
    getFeaturedImages(9),
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
  // The sequence avoids repeating the hero frame when possible.
  const seq = frames.filter((f) => f.url !== cover?.url);
  const seqA = seq[0] ?? frames[0]; // oversized
  const seqB = seq[1] ?? frames[1]; // narrow vertical
  const seqC = seq[2] ?? frames[2]; // detail crop
  const seqD = seq[3] ?? frames[3]; // full-bleed cinematic
  const closing = seq[4] ?? frames[4] ?? seqA; // campaign close

  return (
    <>
      {/* ================= HERO — type bottom-left, image bleeding off the right edge ================= */}
      <section className="relative">
        <div className="grid md:grid-cols-12">
          {/* Image: flush to the top + right edge of the viewport. */}
          <div className="relative order-1 h-[62svh] md:order-2 md:col-span-7 md:h-[88svh]">
            <ArtFrame
              frame={cover}
              label="TX Quince"
              index="Quinceañera Photography & Film"
              tone="wine"
              priority
              sizes="(max-width: 768px) 100vw, 58vw"
              defY={30}
            />
            {editable(cover)}
          </div>

          {/* Type: pinned to the bottom of the cream field — museum air above. */}
          <div className="order-2 flex flex-col justify-end px-5 pb-12 pt-14 md:order-1 md:col-span-5 md:pb-20 md:pl-10 md:pr-12 md:pt-24 lg:pl-16">
            <p className="hero-enter hero-delay-1 text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
              Quinceañera photography &amp; film
              <span className="mt-1 block">Dallas–Fort Worth</span>
            </p>

            <h1 className="hero-enter hero-delay-2 mt-8">
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

            <div className="hero-enter hero-delay-4 mt-9 flex flex-wrap items-baseline gap-x-8 gap-y-3">
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

      {/* ================= MARQUEE — kinetic editorial ribbon ================= */}
      <section className="border-y border-ink/10 bg-ivory py-5 md:py-6">
        <Marquee
          items={["La misa", "El vals", "El brindis", "La corte", "El último baile", "El recuerdo"]}
        />
      </section>

      {/* ================= MANIFESTO — full-bleed dark statement, the contrast moment ================= */}
      <section className="relative overflow-hidden bg-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-[34rem] w-[34rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(192,81,47,0.5), transparent 65%)" }}
        />
        <div className="relative mx-auto max-w-[90rem] px-5 py-28 md:px-10 lg:px-16 md:py-40">
          <Reveal>
            <p className="text-[0.64rem] uppercase tracking-[0.34em] text-cream/45">The promise</p>
            <h2
              className="mt-8 max-w-5xl font-display text-cream"
              style={{ fontSize: "clamp(2.4rem,6.2vw,5.6rem)", lineHeight: 1.02, letterSpacing: "-0.022em" }}
            >
              One celebration a day.{" "}
              <span className="italic text-cream/55">Never two.</span> So the day she
              waited fifteen years for is the only one on my calendar.
            </h2>
            <div className="mt-12 h-px w-24 bg-wine" />
            <p className="mt-8 max-w-md text-[0.95rem] leading-relaxed text-cream/65">
              No second event to rush to, no second shooter splitting focus — la misa,
              el vals, and the last song, all of it, kept exactly as it felt.
            </p>
          </Reveal>
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

        {/* (a) Oversized — takes most of the width, deliberately off-center. */}
        <div className="mx-auto mt-14 max-w-[90rem] px-5 md:mt-20 md:px-10 lg:px-16">
          <Reveal className="md:mr-[18%]">
            <Link href="/portfolio" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/11]">
                <ArtFrame frame={seqA} label="La misa" index="I" tone="sand" defY={28} sizes="(max-width: 768px) 100vw, 74vw" imgClass="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]" />
                {editable(seqA)}
              </div>
              <p className="mt-3 text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">{seqA?.alt}</p>
            </Link>
          </Reveal>
        </div>

        {/* (b) + (c) Narrow vertical right · detail crop left, staggered. */}
        <div className="mx-auto mt-16 grid max-w-[90rem] grid-cols-12 gap-y-16 px-5 md:mt-24 md:px-10 lg:px-16">
          <Reveal className="col-span-7 col-start-6 md:col-span-3 md:col-start-9">
            <Link href="/portfolio" className="group block">
              <div className="relative aspect-[3/4.6] overflow-hidden">
                <ArtFrame frame={seqB} label="El vals" index="II" tone="ink" defY={35} sizes="(max-width: 768px) 58vw, 24vw" imgClass="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" />
                {editable(seqB)}
              </div>
              <p className="mt-3 text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">{seqB?.alt}</p>
            </Link>
          </Reveal>

          <Reveal delay={80} className="col-span-6 md:col-span-3 md:col-start-2 md:-mt-32">
            <Link href="/portfolio" className="group block">
              <div className="relative aspect-square overflow-hidden">
                <ArtFrame frame={seqC} label="El brindis" index="III" tone="wine" defY={22} sizes="(max-width: 768px) 50vw, 24vw" imgClass="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" />
                {editable(seqC)}
              </div>
              <p className="mt-3 text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">{seqC?.alt}</p>
            </Link>
          </Reveal>
        </div>

        {/* (d) Cinematic wide — contained with offset air, not a viewport-swallowing bleed. */}
        <div className="mx-auto mt-20 max-w-[90rem] px-5 md:mt-28 md:px-10 lg:px-16">
          <Reveal className="md:ml-[14%]">
            <Link href="/portfolio" className="group block">
              <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[16/8]">
                <ArtFrame frame={seqD} label="El último baile" index="IV" tone="ink" defY={30} sizes="(max-width: 768px) 100vw, 74vw" imgClass="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.015]" />
                {editable(seqD)}
              </div>
            </Link>
            <div className="flex items-baseline justify-between pt-3">
              <p className="text-[0.6rem] uppercase tracking-[0.24em] text-ink-faint">{seqD?.alt}</p>
              <Link href="/portfolio" className={quietLink("text-ink underline decoration-ink/30 hover:text-wine hover:decoration-wine")}>
                {home.work.cta}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= AVAILABILITY — the one centered moment ================= */}
      <section className="mt-24 border-y border-ink/10 md:mt-36">
        <div className="px-5 py-20 md:py-28">
          <Reveal>
            <DateChecker heading={home.checkDate.heading} body={home.checkDate.body} />
          </Reveal>
        </div>
      </section>

      {/* ================= INVESTMENT — a lookbook list, not pricing cards ================= */}
      <section className="pt-24 md:pt-36">
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
                Fixed pricing, stated plainly — 5 to 8 hours of coverage by
                collection. {site.booking.depositLabel} reserves the date; the balance
                splits into interest-free installments.
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
                    <p className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-ink-faint">
                      {p.hours} hours of coverage
                    </p>
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

      {/* ================= FILM — only when a real film exists ================= */}
      {videos.length > 0 ? (
        <section className="pt-24 md:pt-36">
          <div className="mx-auto max-w-[90rem] px-5 md:px-10 lg:px-16">
            <Reveal className="mb-10 max-w-xl">
              <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">{home.film.eyebrow}</p>
              <h2
                className="mt-4 font-display text-ink"
                style={{ fontSize: "clamp(2.2rem,4vw,3.4rem)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
              >
                {home.film.heading}
              </h2>
            </Reveal>
            <VideoGallery videos={videos.slice(0, 1)} />
          </div>
        </section>
      ) : null}

      {/* ================= GOOD TO KNOW — narrow editorial Q&A ================= */}
      <section className="pt-24 md:pt-36">
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
          <ArtFrame frame={closing} label="" tone="wine" defY={25} sizes="100vw" imgClass="object-cover" />
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
