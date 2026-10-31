"use client";

import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Intake, bookHref } from "@/components/txq/Intake";
import { PhotoDump } from "@/components/txq/PhotoDump";
import { useShell } from "@/components/txq/SiteShell";
import { useSite } from "@/components/txq/state";
import { TIERS, money, type CinemaFilm } from "@/components/txq/data";
import type { Journal } from "@/components/txq/Editorial";
import { usePriceBook } from "@/components/PriceBookProvider";
import { trackEvent } from "@/components/Tracker";
import { SlotPicture } from "@/components/slots/SlotPicture";
import { SlotAdminControl } from "@/components/slots/SlotAdminControl";
import { useSlot } from "@/components/slots/SlotProvider";
import { FAQ_TAGS, PACKAGE_DETAIL } from "@/components/home/home-copy";
import { BASE_CREW, priceFloor } from "@/lib/commission";
import { CONTACT_EVENT, smsHref } from "@/lib/contact";
import { HERO_SLOTS, type FeedPage, type HomeOverrides } from "@/lib/photo-dump-shared";
import type { HomeGallery } from "@/lib/home-galleries";
import type { HomeCity } from "@/content/home-places";
import { site } from "@/content/site";
import { ED } from "./copy";
import { BAND_VIDEO, DETAILS, FEATURE_STILL, HERO, type Detail } from "./media";
import { LazyVideo } from "./LazyVideo";
import { SmoothScroll } from "./SmoothScroll";
import "./editorial.css";

/**
 * The editorial homepage (EN at /, ES at /es): a full-screen film hero that
 * settles into a framed plate as you scroll, a statement, the day told in
 * portrait clips, the featured package on a black-and-white plate, the film
 * band, real galleries, packages with the booking panel, the journal and the
 * questions families ask. Header, footer and dock come from <SiteShell>.
 *
 * Section ids stay the ones the header, dock and other pages link to:
 * #top, #editorial, #cinema, #archive, #commissions (with #intake inside),
 * #questions and #where-we-work.
 */
export function EditorialHome({
  journal,
  films,
  photos = null,
  overrides = {},
  galleries = [],
  cities = [],
}: {
  journal: Journal;
  films: CinemaFilm[];
  /** First page of the Photo dump ("Latest photos"); null = storage unreachable. */
  photos?: FeedPage | null;
  /** Admin swaps for the hero image slot, chosen from the Photo dump. */
  overrides?: HomeOverrides;
  /** Real portfolio galleries (server-grouped). */
  galleries?: HomeGallery[];
  /** City pages for the "Where we work" links. */
  cities?: HomeCity[];
}) {
  const { setDockHidden } = useShell();
  const intakeRef = useRef<HTMLDivElement>(null);

  // The mobile dock steps aside while the booking panel is on screen (the
  // panel has its own total · Next bar).
  useEffect(() => {
    const el = intakeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDockHidden(e.isIntersecting), {
      rootMargin: "0px 0px -30% 0px",
    });
    io.observe(el);
    return () => {
      io.disconnect();
      setDockHidden(false);
    };
  }, [setDockHidden]);

  return (
    <div className="ed">
      <SmoothScroll />
      <Hero overrides={overrides} />
      <Statement />
      <Details />
      <Feature />
      <Band films={films} />
      <Collage galleries={galleries} />
      <PhotoDump initial={photos} />
      <Packages>
        <Intake ref={intakeRef} />
      </Packages>
      <JournalRow journal={journal} />
      <Questions cities={cities} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function heroFallback(swap: HomeOverrides[string] | undefined) {
  const s = HERO.still;
  if (!swap) return { src: s.src, alt: s.alt, focus: s.focus ?? "50% 50%", width: s.width, height: s.height };
  return {
    src: swap.src,
    alt: { en: swap.alt.en || s.alt.en, es: swap.alt.es || s.alt.es },
    focus: "50% 40%",
    width: swap.w,
    height: swap.h,
  };
}

function Hero({ overrides }: { overrides: HomeOverrides }) {
  const { t, lang, homeHref } = useSite();
  const { book } = usePriceBook();
  const e = ED[lang];
  const image = useSlot(HERO_SLOTS[0], heroFallback(overrides[HERO_SLOTS[0]]));
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Full-bleed → an inset plate with white margins, as the hero scrolls away.
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.86]);
  const radius = useTransform(scrollYProgress, [0, 0.6], [0, 6]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.28], [0, -48]);

  return (
    <section ref={ref} className="ed-hero" id="top" aria-labelledby="ed-hero-title">
      <div className="ed-hero__sticky">
        <motion.div className="ed-hero__frame" style={reduce ? undefined : { scale, borderRadius: radius }} data-allow-upscale>
          <SlotPicture image={image} lang={lang} fill priority sizes="100vw" />
          <LazyVideo clip={HERO.video} eager className="ed-video" />
          <span className="ed-hero__shade" aria-hidden />
          <SlotAdminControl slot={HERO_SLOTS[0]} />
        </motion.div>
        <motion.div className="ed-hero__copy" style={reduce ? undefined : { opacity: copyOpacity, y: copyY }}>
          <h1 id="ed-hero-title" className="ed-hero__h1">
            <span className="ed-eyebrow ed-eyebrow--light">{t.hero.h1}</span>{" "}
            <span className="ed-hero__title">
              <span>{e.heroLines[0]}</span>{" "}
              <span>
                {e.heroLines[1].replace(/XV$/, "")}
                <em>XV</em>
              </span>
            </span>
          </h1>
          <a href={homeHref("#intake")} className="ed-btn ed-btn--light">
            {e.reserve}
          </a>
          <p className="ed-hero__note">{e.heroNote(money(priceFloor(book)))}</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Statement                                                           */
/* ------------------------------------------------------------------ */

function Statement() {
  const { t, lang } = useSite();
  const s = ED[lang].statement;
  return (
    <section id="editorial" className="ed-statement" aria-labelledby="ed-statement-title">
      <p className="ed-eyebrow">{s.label}</p>
      <h2 id="ed-statement-title" className="ed-display ed-display--xl">
        {s.title}
      </h2>
      <p className="ed-statement__body">{t.editorial.manifesto}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Details: the day in portrait clips, captions revealed by scroll     */
/* ------------------------------------------------------------------ */

function Details() {
  const { lang } = useSite();
  return (
    <section className="ed-details" aria-label={ED[lang].details.label}>
      <p className="ed-eyebrow ed-details__label">{ED[lang].details.label}</p>
      {DETAILS.map((d, i) => (
        <DetailItem key={d.id} d={d} i={i} />
      ))}
    </section>
  );
}

function DetailItem({ d, i }: { d: Detail; i: number }) {
  const { lang } = useSite();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 90%", "end 35%"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const lines = d.lines[lang];
  return (
    <figure ref={ref} className="ed-detail" data-side={i % 2 ? "right" : "left"}>
      <motion.div className="ed-detail__media" style={reduce ? undefined : { y }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={d.still.src}
          width={d.still.width}
          height={d.still.height}
          alt={d.still.alt[lang]}
          loading="lazy"
          decoding="async"
          className="ed-still ed-still--drift"
        />
        <LazyVideo clip={d.video} className="ed-video" />
      </motion.div>
      <figcaption className="ed-detail__cap">
        <span className="ed-detail__n" aria-hidden>
          {String(i + 1).padStart(2, "0")}
        </span>
        {lines.map((line, k) => (
          <RevealLine key={line} progress={scrollYProgress} index={k} first={k === 0} reduce={!!reduce}>
            {line}
          </RevealLine>
        ))}
      </figcaption>
    </figure>
  );
}

/** One caption line: fades from faint to full as its turn in the scroll comes. */
function RevealLine({
  progress,
  index,
  first,
  reduce,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  first: boolean;
  reduce: boolean;
  children: ReactNode;
}) {
  const start = 0.08 + index * 0.12;
  const opacity = useTransform(progress, [start, start + 0.2], [0.14, 1]);
  return (
    <motion.span className={first ? "ed-line ed-line--first" : "ed-line"} style={reduce ? undefined : { opacity }}>
      {children}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ */
/* Feature: the most-chosen package on a black-and-white plate         */
/* ------------------------------------------------------------------ */

function Feature() {
  const { lang, pickPackage } = useSite();
  const { book } = usePriceBook();
  const e = ED[lang];
  const tier = TIERS.find((x) => x.recommended) ?? TIERS[2];
  const p = book.packages[tier.id];
  return (
    <section className="ed-feature" aria-labelledby="ed-feature-title">
      <div className="ed-feature__plate" data-allow-upscale>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FEATURE_STILL.src}
          width={FEATURE_STILL.width}
          height={FEATURE_STILL.height}
          alt={FEATURE_STILL.alt[lang]}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="ed-feature__track">
        <div className="ed-card">
          <p className="ed-eyebrow ed-eyebrow--rose">{e.feature.label}</p>
          <h2 id="ed-feature-title" className="ed-display ed-display--md">
            {tier.name[lang]}
          </h2>
          <p className="ed-card__price">{money(p.price)}</p>
          <ul className="ed-card__list">
            {tier.bullets.map((b) => (
              <li key={b.en}>{b[lang]}</li>
            ))}
          </ul>
          <p className="ed-card__fine">{e.feature.deposit(book.depositPercent, book.balanceDueDays)}</p>
          <a
            href={bookHref(tier.id)}
            className="ed-btn ed-btn--block"
            onClick={(ev) => {
              ev.preventDefault();
              pickPackage(tier.id);
            }}
          >
            {e.reserve}
          </a>
          <a href="#commissions" className="ed-textlink">
            {e.feature.compare} <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Band: black statement + the films                                   */
/* ------------------------------------------------------------------ */

/**
 * YouTube serves a 120×90 grey placeholder (not an error) when a video has no
 * max-res still, so swap to the lower-res poster on a tiny load as well as on
 * an outright error.
 */
function onPoster(fallback: string | null) {
  const swap = (img: HTMLImageElement) => {
    if (fallback && img.dataset.fellBack !== "1") {
      img.dataset.fellBack = "1";
      img.src = fallback;
    }
  };
  return {
    onLoad: (ev: SyntheticEvent<HTMLImageElement>) => {
      if (ev.currentTarget.naturalWidth <= 120) swap(ev.currentTarget);
    },
    onError: (ev: SyntheticEvent<HTMLImageElement>) => swap(ev.currentTarget),
  };
}

function Band({ films }: { films: CinemaFilm[] }) {
  const { t, lang } = useSite();
  const b = ED[lang].band;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const allHref = lang === "es" ? "/es/videografo-de-quinceaneras" : "/quinceanera-videographer";
  const film = films[active];
  const titleOf = (f: CinemaFilm) => f.title || t.cinema.untitled;

  return (
    <section id="cinema" className="ed-band" aria-labelledby="ed-band-title">
      <div className="ed-band__head">
        <h2 id="ed-band-title" className="ed-display ed-display--band">
          {b.title}
        </h2>
        <p className="ed-band__sub">{b.sub}</p>
      </div>

      <div className="ed-film" data-allow-upscale>
        {film && playing ? (
          film.provider === "file" ? (
            <video key={film.id} src={film.embed} poster={film.poster ?? undefined} controls autoPlay playsInline />
          ) : (
            <iframe
              key={film.id}
              src={film.embed}
              title={titleOf(film)}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          )
        ) : (
          <>
            {film?.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={film.id} src={film.poster} alt="" loading="lazy" decoding="async" className="ed-still" {...onPoster(film.fallbackPoster)} />
            ) : null}
            <LazyVideo clip={BAND_VIDEO} className="ed-video" />
            {film && (
              <button type="button" className="ed-film__play" onClick={() => setPlaying(true)} aria-label={`${b.play}: ${titleOf(film)}`}>
                <span className="ed-film__icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 16 16">
                    <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
                  </svg>
                </span>
                <span className="ed-film__title">{titleOf(film)}</span>
              </button>
            )}
          </>
        )}
      </div>

      <div className="ed-band__foot">
        {films.length > 1 && (
          <ul className="ed-band__list">
            {films.slice(0, 5).map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => {
                    setActive(i);
                    setPlaying(true);
                  }}
                >
                  <span className="ed-band__n">{String(i + 1).padStart(2, "0")}</span>
                  {titleOf(f)}
                </button>
              </li>
            ))}
          </ul>
        )}
        <Link href={allHref} className="ed-btn ed-btn--light">
          {b.all}
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Collage: real galleries, the center one sharp                       */
/* ------------------------------------------------------------------ */

/** "fort worth" → "Fort Worth". */
const titleCase = (s: string) => s.replace(/\b\p{Ll}/gu, (c) => c.toUpperCase());

function Collage({ galleries }: { galleries: HomeGallery[] }) {
  const { lang } = useSite();
  const c = ED[lang].collage;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yL = useTransform(scrollYProgress, [0, 1], [90, -60]);
  const yC = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const yR = useTransform(scrollYProgress, [0, 1], [140, -90]);

  if (!galleries.length) return <div id="archive" />;
  // Some portfolio locations are stored as a bare lowercase word ("irving");
  // lead with properly named venues, biggest gallery first.
  const named = (g: HomeGallery) => /[A-Z]/.test(g.title);
  const ordered = [...galleries]
    .sort((a, b) => Number(named(b)) - Number(named(a)) || b.count - a.count)
    .map((g) => (named(g) ? g : { ...g, title: titleCase(g.title) }));
  const [center, left, right] = ordered;
  const plates = [
    { g: left, cls: "ed-plate ed-plate--side ed-plate--left", y: yL },
    { g: center, cls: "ed-plate ed-plate--center", y: yC },
    { g: right, cls: "ed-plate ed-plate--side ed-plate--right", y: yR },
  ].filter((x) => x.g);

  return (
    <section ref={ref} id="archive" className="ed-collage" aria-labelledby="ed-collage-title">
      <div className="ed-collage__head">
        <p className="ed-eyebrow">{c.label}</p>
        <h2 id="ed-collage-title" className="ed-display ed-display--lg">
          {c.title}
        </h2>
      </div>
      <div className="ed-collage__stage">
        {plates.map(({ g, cls, y }) => (
          <motion.div key={g.key} className={cls} style={reduce ? undefined : { y }}>
            <Link href={g.href} className="ed-plate__link">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.cover.src}
                alt={g.cover.alt}
                width={g.cover.width ?? undefined}
                height={g.cover.height ?? undefined}
                style={{ objectPosition: g.cover.focus }}
                loading="lazy"
                decoding="async"
              />
              <span className="ed-plate__cap">
                {g.title}
                {g.city ? ` · ${g.city}` : ""}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      <ul className="ed-collage__list">
        {ordered.map((g) => (
          <li key={g.key}>
            <Link href={g.href} className="ed-collage__row">
              <span className="ed-collage__name">{g.title}</span>
              <span className="ed-collage__meta">{[g.city, c.photos(g.count)].filter(Boolean).join(" · ")}</span>
              <span aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="ed-center">
        <Link href="/portfolio" className="ed-btn">
          {c.all}
        </Link>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Packages (live price book) + the booking panel                      */
/* ------------------------------------------------------------------ */

function Packages({ children }: { children: ReactNode }) {
  const { lang, pickPackage } = useSite();
  const { book } = usePriceBook();
  const p = ED[lang].packages;
  return (
    <section id="commissions" className="ed-packages" aria-labelledby="ed-pk-title">
      <div className="ed-wrap">
        <p className="ed-eyebrow">{p.label}</p>
        <h2 id="ed-pk-title" className="ed-display ed-display--lg">
          {p.title}
        </h2>
        <p className="ed-dek">{p.dek}</p>
        <ul className="ed-pkgs">
          {TIERS.map((x) => {
            const pp = book.packages[x.id];
            const name = x.name[lang];
            const pick = !!x.recommended;
            return (
              <li key={x.id} className="ed-pkg" data-pick={pick || undefined}>
                <div className="ed-pkg__main">
                  {pick && <span className="ed-pkg__pick">{p.pick}</span>}
                  <h3 className="ed-pkg__name">{name}</h3>
                  <p className="ed-pkg__desc">{PACKAGE_DETAIL[x.id][lang]}</p>
                </div>
                <p className="ed-pkg__meta">
                  {x.id === "archive" ? p.hoursTwoDays(pp.hours) : p.hours(pp.hours)} · {p.team(BASE_CREW[x.id])}
                </p>
                <span className="ed-pkg__price">{money(pp.price)}</span>
                <a
                  href={bookHref(x.id)}
                  className="ed-btn ed-pkg__btn"
                  data-variant={pick ? undefined : "line"}
                  aria-label={p.bookAria(name)}
                  onClick={(ev) => {
                    ev.preventDefault();
                    pickPackage(x.id);
                  }}
                >
                  {p.book}
                </a>
              </li>
            );
          })}
        </ul>
        <div className="ed-panel">
          <h3 className="ed-display ed-display--sm">{p.panelTitle}</h3>
          <p className="ed-dek">{p.panelDek}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

function JournalRow({ journal }: { journal: Journal }) {
  const { t, lang } = useSite();
  const j = ED[lang].journal;
  const posts = journal[lang].slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="ed-journal" aria-labelledby="ed-journal-title">
      <div className="ed-wrap">
        <div className="ed-journal__head">
          <h2 id="ed-journal-title" className="ed-eyebrow">
            {j.label}
          </h2>
          <Link href={lang === "es" ? "/es/blog" : "/blog"} className="ed-textlink">
            {j.all} <span aria-hidden>→</span>
          </Link>
        </div>
        <ul className="ed-cards">
          {posts.map((post) => (
            <li key={post.href}>
              <Link href={post.href} className="ed-cardlink">
                <span className="ed-cardlink__cat">{post.category}</span>
                <span className="ed-cardlink__title">{post.title}</span>
                <span className="ed-cardlink__meta">
                  {t.editorial.read(post.readMinutes)} <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Questions + where we work                                           */
/* ------------------------------------------------------------------ */

function Questions({ cities }: { cities: HomeCity[] }) {
  const { t, lang } = useSite();
  const q = ED[lang].faq;
  const tags = FAQ_TAGS[lang];
  return (
    <section id="questions" className="ed-faq" aria-labelledby="ed-faq-title">
      <div className="ed-wrap ed-faq__grid">
        <div className="ed-faq__side">
          <p className="ed-eyebrow">{q.label}</p>
          <h2 id="ed-faq-title" className="ed-display ed-display--lg">
            {t.faq.title}
          </h2>
          <div className="ed-ask">
            <p className="ed-ask__t">{q.askTitle}</p>
            <p>{q.askBody}</p>
            <a href={smsHref()} className="ed-btn" onClick={() => trackEvent(CONTACT_EVENT.text, "faq")}>
              {ED[lang].text} {site.contact.phone}
            </a>
          </div>
        </div>
        <div className="ed-faq__main">
          <div className="ed-faq__list">
            {t.faq.items.map((item, i) => (
              <details key={item.q} open={i === 0}>
                <summary>
                  <span className="ed-q">
                    {tags[i] && <span className="ed-q__tag">{tags[i]}</span>}
                    <h3 className="ed-q__text">{item.q}</h3>
                  </span>
                  <span className="ed-toggle" aria-hidden />
                </summary>
                <p className="ed-q__a">{item.a}</p>
              </details>
            ))}
          </div>

          <nav id="where-we-work" className="ed-where" aria-labelledby="ed-where-title">
            <h2 id="ed-where-title" className="ed-eyebrow">
              {q.where}
            </h2>
            <ul className="ed-cities">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`${t.places.cityBase}/${c.slug}`} className="ed-city">
                    {c.city}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="ed-services">
              {t.places.services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="ed-textlink">
                    {s.label} <span aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}
