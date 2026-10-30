"use client";

import { useEffect, useRef, useState, type CSSProperties, type SyntheticEvent } from "react";
import Link from "next/link";
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
import { BASE_CREW, priceFloor } from "@/lib/commission";
import { CONTACT_EVENT, smsHref } from "@/lib/contact";
import { HERO_SLOTS, type FeedPage, type HomeOverrides } from "@/lib/photo-dump-shared";
import type { HomeGallery } from "@/lib/home-galleries";
import type { HomeCity } from "@/content/home-places";
import { site } from "@/content/site";
import { FAQ_TAGS, HERO_PRINTS, HOME, PACKAGE_DETAIL, type HomePrint } from "./home-copy";
import "./home.css";

/**
 * The homepage (EN at /, ES at /es): hero collage, real galleries, films,
 * how it works, packages with the booking panel, about, questions and the
 * cities we serve. The header, footer and dock come from <SiteShell>.
 *
 * Section ids stay the ones the header, dock and other pages link to:
 * #archive, #cinema, #commissions (with #intake inside), #editorial,
 * #questions and #where-we-work.
 */
export function HomeSite({
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
  /** Admin swaps for the two hero slots, chosen from the Photo dump. */
  overrides?: HomeOverrides;
  /** Real portfolio galleries (server-grouped). */
  galleries?: HomeGallery[];
  /** City pages for the "Where we work" chips. */
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
    <div className="th">
      <Hero overrides={overrides} />
      <Stories galleries={galleries} />
      <PhotoDump initial={photos} />
      <Films films={films} />
      <HowItWorks />
      <Packages>
        <Intake ref={intakeRef} />
      </Packages>
      <About journal={journal} />
      <Questions cities={cities} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

/** Where each print sits on desktop: px from the top, which side, px in from that edge, width, tilt, depth. */
const LAYOUT = [
  { top: 40, side: "left", off: 32, w: 180, rot: -6, d: 0.55, inner: false },
  { top: 84, side: "left", off: 240, w: 128, rot: 5, d: 0.75, inner: true },
  { top: 350, side: "left", off: 56, w: 160, rot: 4, d: 0.35, inner: false },
  { top: 570, side: "left", off: 250, w: 124, rot: -3, d: 0.2, inner: true },
  { top: 84, side: "right", off: 240, w: 128, rot: -4, d: 0.7, inner: true },
  { top: 40, side: "right", off: 32, w: 180, rot: 6, d: 0.5, inner: false },
  { top: 350, side: "right", off: 56, w: 160, rot: -5, d: 0.3, inner: false },
  { top: 570, side: "right", off: 250, w: 124, rot: 3, d: 0.22, inner: true },
] as const;

/** On phones only these three prints show, in a row above the headline. */
const PHONE_PRINTS = new Set([0, 4, 5]);

/** The two big outer prints are admin image slots (Photo dump swaps still apply). */
const SLOT_FOR: Record<number, 0 | 1> = { 0: 0, 5: 1 };

function slotFallback(p: HomePrint, swap: HomeOverrides[string] | undefined) {
  if (!swap) return { src: p.src, alt: p.alt, focus: "50% 40%", width: p.width, height: p.height };
  return {
    src: swap.src,
    alt: { en: swap.alt.en || p.alt.en, es: swap.alt.es || p.alt.es },
    focus: "50% 40%",
    width: swap.w,
    height: swap.h,
  };
}

function Hero({ overrides }: { overrides: HomeOverrides }) {
  const { t, lang } = useSite();
  const { book } = usePriceBook();
  const h = HOME[lang];
  const ref = useRef<HTMLElement>(null);
  const slotA = useSlot(HERO_SLOTS[0], slotFallback(HERO_PRINTS[0], overrides[HERO_SLOTS[0]]));
  const slotB = useSlot(HERO_SLOTS[1], slotFallback(HERO_PRINTS[5], overrides[HERO_SLOTS[1]]));
  const slots = [slotA, slotB];

  // Scroll depth: one CSS variable (--y) drives every print's transform, so
  // scrolling never re-renders React and only transforms/opacity change.
  // Visitors who ask for reduced motion keep the still collage.
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--y", String(Math.min(Math.max(window.scrollY, 0), 1400)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} className="th-hero" id="top" aria-labelledby="th-hero-title">
      <div className="th-prints">
        {HERO_PRINTS.map((p, i) => {
          const l = LAYOUT[i];
          const slot = SLOT_FOR[i];
          const style = {
            top: `${l.top}px`,
            [l.side]: `${l.off}px`,
            width: `${l.w}px`,
            zIndex: Math.round(l.d * 10),
            "--rot": l.rot,
            "--d": l.d,
            "--dir": l.side === "left" ? -1 : 1,
          } as CSSProperties;
          const cls = ["th-print", l.inner && "th-print--inner", PHONE_PRINTS.has(i) && "th-print--phone"]
            .filter(Boolean)
            .join(" ");
          return (
            <figure key={p.src} className={cls} style={style}>
              <span className="th-print__img">
                {slot === undefined ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.src}
                    width={p.width}
                    height={p.height}
                    alt={p.alt[lang]}
                    loading={i < 2 || i === 5 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <>
                    <SlotPicture image={slots[slot]} lang={lang} fill priority={slot === 0} sizes="180px" />
                    <SlotAdminControl slot={HERO_SLOTS[slot]} />
                  </>
                )}
              </span>
              <figcaption>{p.cap[lang]}</figcaption>
            </figure>
          );
        })}
      </div>

      <div className="th-hero__copy">
        <h1 id="th-hero-title" className="th-hero__h1">
          <span className="th-kicker">{t.hero.h1}</span>
          <span className="th-display">
            {lang === "es" ? "Cada momento de sus " : "Every moment of her "}
            <em>XV.</em>
          </span>
        </h1>
        <p className="th-hero__sub th-hide-sm">{h.sub}</p>
        <div className="th-hero__ctas">
          <a href="#commissions" className="th-btn th-btn--dark">
            {h.seePackages}
          </a>
          <a href={smsHref()} className="th-btn th-btn--line" onClick={() => trackEvent(CONTACT_EVENT.text, "hero")}>
            <TextIcon />
            {lang === "es" ? "Texto" : "Text"} {site.contact.phone}
          </a>
        </div>
        <p className="th-hero__trust th-hide-sm">
          {h.trust.map((x, i) => (
            <span key={x}>
              {i > 0 && <span aria-hidden> · </span>}
              {x}
            </span>
          ))}
        </p>
        <p className="th-hero__trust th-show-sm">{h.trustShort(money(priceFloor(book)))}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stories (real portfolio galleries)                                  */
/* ------------------------------------------------------------------ */

function Stories({ galleries }: { galleries: HomeGallery[] }) {
  const { lang } = useSite();
  const s = HOME[lang].stories;
  const allHref = "/portfolio";
  if (!galleries.length) return <div id="archive" />;
  const [lead, ...rest] = galleries;
  const label = (g: HomeGallery) => [g.city, s.photos(g.count)].filter(Boolean).join(" · ");
  return (
    <section id="archive" className="th-sec th-stories" aria-labelledby="th-stories-title">
      <div className="th-wrap">
        <div className="th-head th-head--row">
          <div className="th-head__text">
            <p className="th-label">{s.label}</p>
            <h2 id="th-stories-title" className="th-h2">
              {s.title}
            </h2>
            <p className="th-dek">{s.dek}</p>
          </div>
          <Link href={allHref} className="th-btn th-btn--pill">
            {s.all}
          </Link>
        </div>
        <div className="th-stories__grid">
          <Link href={lead.href} className="th-lead">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.cover.src}
              alt={lead.cover.alt}
              width={lead.cover.width ?? undefined}
              height={lead.cover.height ?? undefined}
              style={{ objectPosition: lead.cover.focus }}
              loading="lazy"
              decoding="async"
            />
            <span className="th-lead__cap">
              <span className="th-label th-label--light">{label(lead)}</span>
              <span className="th-h3">{lead.title}</span>
              <span className="th-lead__more">
                {s.view} <span aria-hidden>→</span>
              </span>
            </span>
          </Link>
          <ul className="th-rows">
            {rest.slice(0, 4).map((g) => (
              <li key={g.key}>
                <Link href={g.href} className="th-row">
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
                  <span className="th-row__txt">
                    <span className="th-label">{label(g)}</span>
                    <span className="th-h3">{g.title}</span>
                    <span className="th-row__more">
                      {s.view} <span aria-hidden>→</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Films                                                               */
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
    onLoad: (e: SyntheticEvent<HTMLImageElement>) => {
      if (e.currentTarget.naturalWidth <= 120) swap(e.currentTarget);
    },
    onError: (e: SyntheticEvent<HTMLImageElement>) => swap(e.currentTarget),
  };
}

function Films({ films }: { films: CinemaFilm[] }) {
  const { t, lang } = useSite();
  const f = HOME[lang].films;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const allHref = lang === "es" ? "/es/videografo-de-quinceaneras" : "/quinceanera-videographer";
  const titleOf = (x: CinemaFilm) => x.title || t.cinema.untitled;

  if (!films.length) {
    return (
      <section id="cinema" className="th-sec th-films" aria-labelledby="th-films-title">
        <div className="th-wrap">
          <p className="th-label th-label--light">{f.label}</p>
          <h2 id="th-films-title" className="th-h2">
            {f.title}
          </h2>
          <p className="th-dek">
            {t.cinema.empty}{" "}
            <Link href={allHref} className="th-link th-link--light">
              {f.all} →
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const n = films.length;
  const lead = films[active % n];
  const side = n > 1 ? [films[(active + 1) % n], films[(active + 2) % n]].filter((x, i, a) => x.id !== lead.id && a.indexOf(x) === i) : [];
  const go = (i: number) => {
    setActive(((i % n) + n) % n);
    setPlaying(false);
  };
  const playFilm = (x: CinemaFilm) => {
    setActive(films.indexOf(x));
    setPlaying(true);
    document.getElementById("th-film-lead")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="cinema" className="th-sec th-films" aria-labelledby="th-films-title">
      <div className="th-wrap">
        <div className="th-head th-head--row">
          <div className="th-head__text">
            <p className="th-label th-label--light">{f.label}</p>
            <h2 id="th-films-title" className="th-h2">
              {f.title}
            </h2>
            <p className="th-dek">{t.cinema.dek}</p>
          </div>
          <div className="th-films__nav">
            <Link href={allHref} className="th-btn th-btn--ghost">
              {f.all}
            </Link>
            {n > 1 && (
              <>
                <button type="button" className="th-round" aria-label={f.prev} onClick={() => go(active - 1)}>
                  <Chevron dir="left" />
                </button>
                <button type="button" className="th-round" aria-label={f.next} onClick={() => go(active + 1)}>
                  <Chevron dir="right" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="th-reel" data-single={side.length === 0}>
          <div className="th-film th-film--lead">
            <div id="th-film-lead" className="th-film__frame">
              {playing ? (
                lead.provider === "file" ? (
                  <video
                    key={lead.id}
                    src={lead.embed}
                    poster={lead.poster ?? undefined}
                    controls
                    autoPlay
                    playsInline
                  />
                ) : (
                  <iframe
                    key={lead.id}
                    src={lead.embed}
                    title={titleOf(lead)}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                )
              ) : (
                <button
                  type="button"
                  className="th-film__btn"
                  aria-label={`${t.cinema.play}: ${titleOf(lead)}`}
                  onClick={() => setPlaying(true)}
                >
                  {lead.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={lead.id} src={lead.poster} alt="" decoding="async" {...onPoster(lead.fallbackPoster)} />
                  ) : null}
                  <span className="th-film__play th-film__play--lg" aria-hidden>
                    <PlayIcon />
                  </span>
                </button>
              )}
            </div>
            <p className="th-film__kind">{f.kind(active % n)}</p>
            <p className="th-h3 th-film__title">{titleOf(lead)}</p>
          </div>

          {side.map((x) => (
            <div key={x.id} className="th-film">
              <button type="button" className="th-film__frame th-film__btn" aria-label={`${t.cinema.play}: ${titleOf(x)}`} onClick={() => playFilm(x)}>
                {x.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={x.poster} alt="" loading="lazy" decoding="async" {...onPoster(x.fallbackPoster)} />
                ) : null}
                <span className="th-film__play" aria-hidden>
                  <PlayIcon />
                </span>
              </button>
              <p className="th-film__kind">{f.kind(films.indexOf(x))}</p>
              <p className="th-h3 th-film__title">{titleOf(x)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

function HowItWorks() {
  const { lang } = useSite();
  const h = HOME[lang].how;
  return (
    <section className="th-sec th-how" aria-labelledby="th-how-title">
      <div className="th-wrap">
        <div className="th-head">
          <p className="th-label">{h.label}</p>
          <h2 id="th-how-title" className="th-h2">
            {h.title}
          </h2>
        </div>
        <ol className="th-steps">
          {h.steps.map((s, i) => (
            <li key={s.t} className="th-step">
              <span className="th-step__n" aria-hidden>
                {i + 1}
              </span>
              <h3 className="th-h3">{s.t}</h3>
              <p>{s.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Packages (live price book) + the booking panel                      */
/* ------------------------------------------------------------------ */

function Packages({ children }: { children: React.ReactNode }) {
  const { lang, pickPackage } = useSite();
  const { book } = usePriceBook();
  const p = HOME[lang].packages;
  return (
    <section id="commissions" className="th-sec th-packages" aria-labelledby="th-pk-title">
      <div className="th-wrap th-wrap--md">
        <span className="th-rule th-rule--gold" aria-hidden />
        <p className="th-label th-label--gold">{p.label}</p>
        <h2 id="th-pk-title" className="th-h2">
          {p.title}
        </h2>
        <p className="th-dek">{p.dek}</p>

        <ul className="th-pkgs">
          {TIERS.map((x) => {
            const pp = book.packages[x.id];
            const team = BASE_CREW[x.id];
            const name = x.name[lang];
            const pick = !!x.recommended;
            return (
              <li key={x.id} className="th-pkg" data-pick={pick || undefined}>
                <div className="th-pkg__main">
                  {pick && (
                    <span className="th-pick">
                      <span className="th-pick__dot" aria-hidden />
                      {p.pick}
                    </span>
                  )}
                  <h3 className="th-h3">{name}</h3>
                  <p className="th-pkg__desc">{PACKAGE_DETAIL[x.id][lang]}</p>
                </div>
                <div className="th-pkg__chips">
                  <span className="th-chip-s" data-tone={pick ? "gold" : undefined}>
                    {x.id === "archive" ? p.hoursTwoDays(pp.hours) : p.hours(pp.hours)}
                  </span>
                  <span className="th-chip-s" data-tone={pick ? "gold" : undefined}>
                    {p.team(team)}
                  </span>
                </div>
                <span className="th-pkg__price">{money(pp.price)}</span>
                <a
                  href={bookHref(x.id)}
                  className="th-pkg__btn"
                  data-dark={pick || undefined}
                  aria-label={p.bookAria(name)}
                  onClick={(e) => {
                    e.preventDefault();
                    pickPackage(x.id);
                  }}
                >
                  {p.book}
                </a>
              </li>
            );
          })}
        </ul>
        <p className="th-pkgs__after">{p.after}</p>

        <div className="th-panel">
          <h3 className="th-h3">{p.panelTitle}</h3>
          <p className="th-dek">{p.panelDek}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* About                                                               */
/* ------------------------------------------------------------------ */

function About({ journal }: { journal: Journal }) {
  const { t, lang } = useSite();
  const a = HOME[lang].about;
  const posts = journal[lang].slice(0, 3);
  return (
    <section id="editorial" className="th-sec th-about" aria-labelledby="th-about-title">
      <div className="th-wrap th-about__grid">
        <div className="th-about__text">
          <p className="th-label th-label--rose">{a.label}</p>
          <h2 id="th-about-title" className="th-h2">
            {t.editorial.title}
          </h2>
          <p className="th-lead-p">{t.editorial.manifesto}</p>
          <div className="th-chips">
            {a.chips.map((c, i) => (
              <span key={c} className="th-chip-s" data-tone={i % 2 ? "rose" : "gold"}>
                {c}
              </span>
            ))}
          </div>
          <ul className="th-principles">
            {t.editorial.principles.map((pr) => (
              <li key={pr.title}>
                <h3 className="th-h4">{pr.title}</h3>
                <p>{pr.body}</p>
              </li>
            ))}
          </ul>
          <Link href="/about" className="th-btn th-btn--dark">
            {a.more}
          </Link>
          {posts.length > 0 && (
            <div className="th-journal">
              <p className="th-label">{a.blog}</p>
              <ul>
                {posts.map((post) => (
                  <li key={post.href}>
                    <Link href={post.href} className="th-journal__link">
                      <span>{post.title}</span>
                      <span className="th-journal__meta">{t.editorial.read(post.readMinutes)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="th-collage" aria-hidden={false}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="th-collage__a"
            src="/home/pink-door.webp"
            width={720}
            height={960}
            loading="lazy"
            decoding="async"
            alt={
              lang === "es"
                ? "Quinceañera con vestido rosa palo y globos rosas en una puerta de piedra tallada"
                : "Quinceañera in a blush gown with pink balloons in a carved stone doorway"
            }
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="th-collage__b"
            src="/home/red-garden.webp"
            width={720}
            height={1080}
            loading="lazy"
            decoding="async"
            alt={
              lang === "es"
                ? "Quinceañera con vestido rojo, sarape y ramo de flores en un jardín"
                : "Quinceañera in a red gown with a Mexican sarape and a bouquet in a garden"
            }
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="th-collage__c"
            src="/home/balloons-lg.webp"
            width={640}
            height={960}
            loading="lazy"
            decoding="async"
            alt={
              lang === "es"
                ? "Quinceañera con globos de corazón rosas frente a un edificio histórico"
                : "Quinceañera holding pink heart balloons in front of a historic building"
            }
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Questions + where we work                                           */
/* ------------------------------------------------------------------ */

function Questions({ cities }: { cities: HomeCity[] }) {
  const { t, lang } = useSite();
  const q = HOME[lang].faq;
  const tags = FAQ_TAGS[lang];
  return (
    <section id="questions" className="th-sec th-faq" aria-labelledby="th-faq-title">
      <div className="th-wrap th-faq__grid">
        <div className="th-faq__side">
          <span className="th-rule th-rule--rose" aria-hidden />
          <p className="th-label th-label--rose">{q.label}</p>
          <h2 id="th-faq-title" className="th-h2">
            {t.faq.title}
          </h2>
          <p className="th-dek">{q.dek}</p>
          <div className="th-ask">
            <p className="th-ask__t">{q.askTitle}</p>
            <p>{q.askBody}</p>
            <a href={smsHref()} className="th-btn th-btn--dark" onClick={() => trackEvent(CONTACT_EVENT.text, "faq")}>
              <TextIcon />
              {lang === "es" ? "Texto" : "Text"} {site.contact.phone}
            </a>
          </div>
        </div>
        <div className="th-faq__main">
          <div className="th-faq__list">
            {t.faq.items.map((item, i) => (
              <details key={item.q} open={i === 0}>
                <summary>
                  <span className="th-q">
                    {tags[i] && <span className="th-q__tag">{tags[i]}</span>}
                    <h3 className="th-q__text">{item.q}</h3>
                  </span>
                  <span className="th-toggle" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M8 3v10M3 8h10" />
                    </svg>
                  </span>
                </summary>
                <p className="th-q__a">{item.a}</p>
              </details>
            ))}
          </div>

          <nav id="where-we-work" className="th-where" aria-labelledby="th-where-title">
            <h2 id="th-where-title" className="th-label">
              {q.where}
            </h2>
            <ul className="th-citychips">
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`${t.places.cityBase}/${c.slug}`} className="th-city">
                    {c.city}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="th-services">
              {t.places.services.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="th-link">
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

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v11H8l-4 4z" />
    </svg>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d={dir === "left" ? "M10 3 5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}
