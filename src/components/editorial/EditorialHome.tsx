"use client";

import { useEffect, useRef, useState, type ReactNode, type SyntheticEvent } from "react";
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
import { FAQ_TAGS, PACKAGE_DETAIL } from "@/components/home/home-copy";
import { BASE_CREW, priceFloor } from "@/lib/commission";
import { CONTACT_EVENT, smsHref } from "@/lib/contact";
import { HERO_SLOTS, type FeedPage, type HomeOverrides } from "@/lib/photo-dump-shared";
import type { HomeGallery } from "@/lib/home-galleries";
import type { HomeCity } from "@/content/home-places";
import { site } from "@/content/site";
import { ED } from "./copy";
import { BAND_VIDEO, DETAILS, FEATURE_STILL, HERO, JOURNAL_PHOTO, JOURNAL_PHOTO_FALLBACK, type Detail } from "./media";
import { LazyVideo } from "./LazyVideo";
import { useScenes } from "./scenes";
import "./editorial.css";

/**
 * The editorial homepage (EN at /, ES at /es). Black and white, a Futura-style
 * display face, and scroll scenes driven by GSAP ScrollTrigger (see scenes.ts):
 * the film hero shrinks into a framed plate, photos drift at their own depth,
 * captions brighten line by line, the black band opens like a curtain.
 *
 * The page renders complete without JavaScript and before the animation code
 * loads (it is fetched after the page has loaded), so nothing is hidden at
 * first paint and nothing shifts. Section ids stay the ones the header, dock
 * and other pages link to: #top, #editorial, #cinema, #archive,
 * #commissions (with #intake inside), #questions and #where-we-work.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const intakeRef = useRef<HTMLDivElement>(null);
  useScenes(rootRef);

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
    <div ref={rootRef} className="ed">
      <Hero overrides={overrides} />
      <Statement />
      <Details />
      <Band films={films} />
      <Collage galleries={galleries} />
      <Feature />
      <Packages>
        <Intake ref={intakeRef} />
      </Packages>
      <PhotoDump initial={photos} />
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
  return (
    <section className="ed-hero" id="top" data-ed="hero" aria-labelledby="ed-hero-title">
      <div className="ed-hero__frame" data-ed="hero-frame" data-header-tone="dark" data-allow-upscale>
        <div className="ed-hero__media" data-ed="hero-media">
          <SlotPicture image={image} lang={lang} fill priority sizes="100vw" />
          <LazyVideo clip={HERO.video} eager className="ed-video" />
        </div>
        <span className="ed-hero__shade" aria-hidden />
        <SlotAdminControl slot={HERO_SLOTS[0]} />
        <div className="ed-hero__copy" data-ed="hero-copy">
          <h1 id="ed-hero-title" className="ed-hero__h1">
            <span className="ed-label ed-label--light">{t.hero.h1}</span>{" "}
            <span className="ed-hero__title">
              {e.heroLines.map((line, i) => (
                <span key={line} className="ed-hero__line">
                  <span style={{ animationDelay: `${0.12 + i * 0.09}s` }}>{line}</span>{" "}
                </span>
              ))}
            </span>
          </h1>
          <div className="ed-hero__foot">
            <a href={homeHref("#intake")} className="ed-btn ed-btn--light">
              {e.reserve}
            </a>
            <p className="ed-hero__note">{e.heroNote(money(priceFloor(book)))}</p>
          </div>
        </div>
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
      <div className="ed-statement__in" data-ed="drift">
        <p className="ed-label">{s.label}</p>
        <h2 id="ed-statement-title" className="ed-display ed-display--lg">
          {s.title}
        </h2>
        <p className="ed-statement__body">{t.editorial.manifesto}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Details: the day in portrait clips                                  */
/* ------------------------------------------------------------------ */

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

function Details() {
  const { lang } = useSite();
  return (
    <section className="ed-details" aria-label={ED[lang].details.label}>
      <div className="ed-wrap">
        <p className="ed-label ed-details__label">{ED[lang].details.label}</p>
        <ul className="ed-tiles">
          {DETAILS.map((d, i) => (
            <DetailTile key={d.id} d={d} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function DetailTile({ d, i }: { d: Detail; i: number }) {
  const { lang } = useSite();
  const [title, ...rest] = d.lines[lang];
  return (
    <li className="ed-tile" data-col={i % 3}>
      <div className="ed-tile__media">
        <div className="ed-tile__inner" data-ed="parallax">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={d.still.src}
            width={d.still.width}
            height={d.still.height}
            alt={d.still.alt[lang]}
            loading="lazy"
            decoding="async"
          />
          <LazyVideo clip={d.video} className="ed-video" />
        </div>
      </div>
      <div className="ed-tile__cap" data-ed="lines">
        <span className="ed-roman" aria-hidden>
          {ROMAN[i]}
        </span>
        <h3 className="ed-tile__title" data-line>
          {title}
        </h3>
        {rest.map((line) => (
          <span key={line} className="ed-tile__line" data-line>
            {line}
          </span>
        ))}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Band: black curtain + the films                                     */
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

const pad2 = (n: number) => String(n).padStart(2, "0");

function Band({ films }: { films: CinemaFilm[] }) {
  const { t, lang } = useSite();
  const b = ED[lang].band;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const allHref = lang === "es" ? "/es/videografo-de-quinceaneras" : "/quinceanera-videographer";
  const n = films.length;
  const film = n ? films[active % n] : null;
  const titleOf = (f: CinemaFilm) => f.title || t.cinema.untitled;
  const go = (i: number) => {
    setActive(((i % n) + n) % n);
    setPlaying(false);
  };

  return (
    <section id="cinema" className="ed-band" data-ed="band" data-header-tone="dark" aria-labelledby="ed-band-title">
      <div className="ed-wrap ed-band__head">
        <h2 id="ed-band-title" className="ed-display ed-display--xl">
          {b.lines.map((l) => (
            <span key={l} className="ed-block">
              {l}
            </span>
          ))}
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
              <img key={film.id} src={film.poster} alt="" loading="lazy" decoding="async" className="ed-fill" {...onPoster(film.fallbackPoster)} />
            ) : null}
            <LazyVideo clip={BAND_VIDEO} className="ed-video" />
            {film && (
              <button type="button" className="ed-film__play" onClick={() => setPlaying(true)} aria-label={`${b.play}: ${titleOf(film)}`}>
                <span className="ed-film__icon" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 16 16">
                    <path d="M4.5 2.5v11l9-5.5z" fill="currentColor" />
                  </svg>
                </span>
                <span className="ed-film__label">{b.play}</span>
              </button>
            )}
          </>
        )}
      </div>

      {film && (
        <div className="ed-wrap ed-band__foot">
          <p className="ed-band__title">
            <span className="ed-band__count">
              {pad2((active % n) + 1)} <span aria-hidden>/</span> {pad2(n)}
            </span>
            {titleOf(film)}
          </p>
          <div className="ed-band__nav">
            {n > 1 && (
              <>
                <button type="button" className="ed-textlink ed-textlink--light" onClick={() => go(active - 1)} aria-label={b.prev}>
                  ←
                </button>
                <button type="button" className="ed-textlink ed-textlink--light" onClick={() => go(active + 1)} aria-label={b.next}>
                  →
                </button>
              </>
            )}
            <Link href={allHref} className="ed-textlink ed-textlink--light">
              {b.all}
            </Link>
            <a href={site.social.youtube} target="_blank" rel="noopener noreferrer" className="ed-textlink ed-textlink--light">
              {b.youtube}
            </a>
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Collage: real galleries around a centered title, each at its depth  */
/* ------------------------------------------------------------------ */

/** "fort worth" → "Fort Worth". */
const titleCase = (s: string) => s.replace(/\b\p{Ll}/gu, (c) => c.toUpperCase());

/** Where each plate sits (desktop), how sharp it is, and how deep it drifts (0–1). */
const PLATES = [
  { cls: "ed-plate--a", sharp: false, depth: 0.6 },
  { cls: "ed-plate--b", sharp: true, depth: 1 },
  { cls: "ed-plate--c", sharp: false, depth: 0.25 },
  { cls: "ed-plate--d", sharp: false, depth: 0.8 },
  { cls: "ed-plate--e", sharp: false, depth: 0.4 },
];

function Collage({ galleries }: { galleries: HomeGallery[] }) {
  const { lang } = useSite();
  const c = ED[lang].collage;
  if (!galleries.length) return <div id="archive" />;
  // Some portfolio locations are stored as a bare lowercase word ("irving");
  // lead with properly named venues, biggest gallery first.
  const named = (g: HomeGallery) => /[A-Z]/.test(g.title);
  const ordered = [...galleries]
    .sort((a, b) => Number(named(b)) - Number(named(a)) || b.count - a.count)
    .map((g) => (named(g) ? g : { ...g, title: titleCase(g.title) }));
  // The sharp plate shows the biggest gallery.
  const placed = [ordered[1], ordered[0], ordered[2], ordered[3], ordered[4]];

  return (
    <section id="archive" className="ed-collage" aria-labelledby="ed-collage-title">
      <div className="ed-collage__stage" data-ed="collage">
        {placed.map((g, i) =>
          g ? (
            <Link
              key={g.key}
              href={g.href}
              className={`ed-plate ${PLATES[i].cls}`}
              data-sharp={PLATES[i].sharp || undefined}
              data-ed="depth"
              data-depth={PLATES[i].depth}
              aria-label={`${g.title}${g.city ? `, ${g.city}` : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={g.cover.src}
                alt=""
                width={g.cover.width ?? undefined}
                height={g.cover.height ?? undefined}
                style={{ objectPosition: g.cover.focus }}
                loading="lazy"
                decoding="async"
              />
            </Link>
          ) : null,
        )}
        <div className="ed-collage__copy">
          <p className="ed-label">{c.label}</p>
          <h2 id="ed-collage-title" className="ed-display ed-display--lg">
            {c.title}
          </h2>
          <p className="ed-collage__body">{c.body}</p>
          <Link href="/portfolio" className="ed-textlink">
            {c.all}
          </Link>
        </div>
      </div>
      <div className="ed-wrap">
        <ul className="ed-rows">
          {ordered.map((g) => (
            <li key={g.key}>
              <Link href={g.href} className="ed-row">
                <span className="ed-row__name">{g.title}</span>
                <span className="ed-row__meta">{[g.city, c.photos(g.count)].filter(Boolean).join(" · ")}</span>
                <span className="ed-row__arrow" aria-hidden>
                  →
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
/* Feature: the most-chosen package on a black-and-white plate         */
/* ------------------------------------------------------------------ */

function Feature() {
  const { lang, pickPackage } = useSite();
  const { book } = usePriceBook();
  const e = ED[lang];
  const tier = TIERS.find((x) => x.recommended) ?? TIERS[2];
  const p = book.packages[tier.id];
  return (
    <section className="ed-feature" data-ed="feature" data-header-tone="dark" aria-labelledby="ed-feature-title">
      <div className="ed-feature__plate" data-allow-upscale>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-ed="feature-bg"
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
          <p className="ed-label">{e.feature.label}</p>
          <h2 id="ed-feature-title" className="ed-display ed-display--md">
            {tier.name[lang]}
          </h2>
          <p className="ed-card__price">{money(p.price)}</p>
          {tier.id === "trio" && book.trioSpotsLeft > 0 && (
            <p className="ed-offer">{e.packages.offer(book.trioSpotsLeft, book.trioSpotsTotal, money(p.price))}</p>
          )}
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
            {e.feature.compare}
          </a>
        </div>
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
        <div className="ed-head" data-ed="rise">
          <p className="ed-label">{p.label}</p>
          <h2 id="ed-pk-title" className="ed-display ed-display--lg">
            {p.title}
          </h2>
          <p className="ed-dek">{p.dek}</p>
        </div>
        <ul className="ed-pkgs">
          {TIERS.map((x, i) => {
            const pp = book.packages[x.id];
            const name = x.name[lang];
            const pick = !!x.recommended;
            return (
              <li key={x.id} className="ed-pkg">
                <span className="ed-roman ed-pkg__n" aria-hidden>
                  {ROMAN[i]}
                </span>
                <div className="ed-pkg__main">
                  <h3 className="ed-pkg__name">
                    {name}
                    {pick && <span className="ed-pkg__pick">{p.pick}</span>}
                  </h3>
                  <p className="ed-pkg__desc">{PACKAGE_DETAIL[x.id][lang]}</p>
                  <p className="ed-pkg__meta">
                    {p.hours(pp.hours)} · {x.id === "solo" ? p.soloTeam : p.team(BASE_CREW[x.id])}
                  </p>
                  {x.id === "trio" && book.trioSpotsLeft > 0 && (
                    <p className="ed-offer">{p.offer(book.trioSpotsLeft, book.trioSpotsTotal, money(pp.price))}</p>
                  )}
                </div>
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
        <p className="ed-crew">{p.crew}</p>
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

const CATEGORY_ES: Record<string, string> = {
  "Cost & Budget": "Costos",
  Planning: "Planeación",
  Traditions: "Tradiciones",
  "Photography & Film": "Foto y video",
  Locations: "Lugares",
};

/** "2026-10-14" → "14.10.26". */
function shortDate(iso?: string) {
  const m = iso && /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1].slice(2)}` : "";
}

function JournalRow({ journal }: { journal: Journal }) {
  const { lang } = useSite();
  const j = ED[lang].journal;
  const posts = journal[lang].slice(0, 3);
  if (!posts.length) return null;
  return (
    <section className="ed-journal" aria-labelledby="ed-journal-title">
      <div className="ed-wrap">
        <div className="ed-journal__head">
          <div>
            <p className="ed-label">{j.label}</p>
            <h2 id="ed-journal-title" className="ed-journal__title">
              {j.title}
            </h2>
          </div>
          <Link href={lang === "es" ? "/es/blog" : "/blog"} className="ed-textlink">
            {j.all}
          </Link>
        </div>
        <ul className="ed-news">
          {posts.map((post) => {
            const photo = JOURNAL_PHOTO[post.category] ?? JOURNAL_PHOTO_FALLBACK;
            const cat = lang === "es" ? (CATEGORY_ES[post.category] ?? post.category) : post.category;
            return (
              <li key={post.href}>
                <Link href={post.href} className="ed-newscard">
                  <span className="ed-newscard__media">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.src} width={photo.width} height={photo.height} alt="" loading="lazy" decoding="async" />
                  </span>
                  <span className="ed-newscard__meta">
                    {shortDate(post.date)}
                    <span className="ed-newscard__cat">{cat}</span>
                  </span>
                  <span className="ed-newscard__title">{post.title}</span>
                  {post.excerpt && <span className="ed-newscard__excerpt">{post.excerpt}</span>}
                </Link>
              </li>
            );
          })}
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
          <p className="ed-label">{q.label}</p>
          <h2 id="ed-faq-title" className="ed-display ed-display--md">
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
            <h2 id="ed-where-title" className="ed-label">
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
                    {s.label}
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
