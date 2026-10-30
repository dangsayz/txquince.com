"use client";

import Link from "next/link";
import { useSite } from "./state";
import type { HomeGallery } from "@/lib/home-galleries";
import { brandedSrcSet } from "@/lib/image-slot-resolve";
import { pickL, srcFor, srcSetFor, type FeedPhoto } from "@/lib/photo-dump-shared";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { photoAlt } from "./PhotoDump";

/**
 * "Real quinceañeras, full galleries" — the homepage gallery section.
 *
 * Shows only real work, in this order of preference:
 *   1. the real portfolio galleries (one card per shoot, grouped on the server
 *      by src/lib/home-galleries.ts), each linking to its full gallery;
 *   2. when the portfolio can't be read: recent real Photo dump photos;
 *   3. when neither can be read (a local build): the real portfolio photos
 *      bundled in /public/portfolio.
 * No step ever shows a client name or a place that isn't already published.
 */

const GALLERY_SIZES = "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw";
const PHOTO_SIZES = "(min-width: 1024px) 33vw, 50vw";
const MAX_PHOTOS = 6;

type PhotoCard = {
  key: string;
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  focus?: string;
};

/** Desktop columns (up to `max`): a full last row whenever the count allows it. */
function columns(n: number, max: 3 | 4): number {
  if (n <= 2) return Math.max(n, 1);
  if (max === 4 && n % 4 === 0) return 4;
  if (n % 3 === 0) return 3;
  if (n % 2 === 0) return 2;
  return Math.min(n, max);
}

export function Archive({ galleries = [], photos = null }: { galleries?: HomeGallery[]; photos?: FeedPhoto[] | null }) {
  const { t, lang } = useSite();
  const real = galleries.length > 0;

  const cards: PhotoCard[] = real
    ? []
    : photos?.length
      ? photos.slice(0, MAX_PHOTOS).map((p, i) => {
          const alt = photoAlt(lang, p, p.album.title, i + 1);
          return { key: p.id, src: srcFor(p, 828), srcSet: srcSetFor(p), width: p.w, height: p.h, alt, caption: pickL(lang, p.album.title) || alt };
        })
      : portfolioFallback.slice(0, MAX_PHOTOS).map((p) => ({
          key: p.slug,
          src: p.url,
          width: p.width,
          height: p.height,
          alt: p.alt,
          // The bundled titles are English; Spanish shows only the stored city.
          caption: lang === "es" ? p.city ?? t.archive.region : p.city ? `${p.title} · ${p.city}` : p.title,
        }));
  // Photo dump cards open the full recent-photos page; bundled ones, the portfolio.
  const photosHref = photos?.length ? (lang === "es" ? "/es/fotos-recientes" : "/photos/latest") : "/portfolio";
  const count = real ? galleries.length : cards.length;

  return (
    <section id="archive" className="tq-section" aria-labelledby="tq-archive-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.archive.index}]
          </p>
          <h2 id="tq-archive-title" className="tq-display tq-head__title">
            {t.archive.titleA} <em>{real ? t.archive.titleB : t.archive.photosTitleB}</em>
          </h2>
          <p className="tq-head__dek">{real ? t.archive.dek : t.archive.photosDek}</p>
        </header>

        <ul
          className="tq-egrid tq-gal-grid"
          aria-label={real ? t.archive.listLabel : t.archive.photosLabel}
          style={{ listStyle: "none", margin: 0, ["--gal-cols" as string]: columns(count, 4), ["--gal-cols-md" as string]: columns(count, 3) }}
        >
          {real
            ? galleries.map((g, i) => (
                <li key={g.key} className="tq-card">
                  <Link href={g.href} className="tq-gal-card" aria-label={`${t.archive.open}: ${g.title}, ${g.city ?? t.archive.region}`}>
                    <span className="tq-card__media tq-gal-card__media">
                      {/* eslint-disable-next-line @next/next/no-img-element -- branded /api/img srcset capped at the photo's own width (never upscaled) */}
                      <img
                        src={`${g.cover.src}${g.cover.src.includes("?") ? "&" : "?"}w=828`}
                        srcSet={brandedSrcSet(g.cover.src, g.cover.width)}
                        sizes={GALLERY_SIZES}
                        alt={g.cover.alt}
                        loading={i < 2 ? "eager" : "lazy"}
                        decoding="async"
                        style={{ objectPosition: g.cover.focus }}
                      />
                    </span>
                    <span className="tq-gal-card__title">{g.title}</span>
                    <span className="tq-gal-card__meta">
                      <span className="tq-nowrap">{g.city ? `${g.city}, TX` : t.archive.region}</span> ·{" "}
                      <span className="tq-nowrap">{t.archive.count(g.count)}</span>
                    </span>
                  </Link>
                </li>
              ))
            : cards.map((c) => (
                <li key={c.key} className="tq-card">
                  <Link href={photosHref} className="tq-gal-card">
                    <span className="tq-card__media tq-gal-card__media">
                      {/* eslint-disable-next-line @next/next/no-img-element -- real photo with its own capped srcset (never upscaled) */}
                      <img
                        src={c.src}
                        srcSet={c.srcSet}
                        sizes={c.srcSet ? PHOTO_SIZES : undefined}
                        alt={c.alt}
                        loading="lazy"
                        decoding="async"
                        style={c.focus ? { objectPosition: c.focus } : undefined}
                      />
                    </span>
                    <span className="tq-gal-card__meta tq-gal-card__meta--clamp">{c.caption}</span>
                  </Link>
                </li>
              ))}
        </ul>

        <div className="tq-gal-foot">
          <Link href="/portfolio" className="tq-btn tq-btn--lg">
            {t.archive.seeAll} <span className="tq-arrow" aria-hidden>→</span>
          </Link>
          {!real && photos?.length ? (
            <Link href={photosHref} className="tq-btn tq-btn--lg tq-btn--ghost">
              {t.archive.seeLatest}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
