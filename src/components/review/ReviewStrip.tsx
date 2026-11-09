"use client";

import Link from "next/link";
import { reviewPhotoUrl, type PublicReview } from "@/lib/review-public";
import { Stars } from "@/components/Stars";
import "./review-strip.css";

const COPY = {
  en: {
    title: "From the moms I’ve worked with",
    all: "Read every review",
    quince: (n: string) => `${n}’s quinceañera`,
    verified: "Verified client",
  },
  es: {
    title: "De las mamás con las que he trabajado",
    all: "Leer todas las reseñas",
    quince: (n: string) => `Quinceañera de ${n}`,
    verified: "Clienta verificada",
  },
} as const;

/**
 * Homepage strip: up to three approved reviews (featured first). Renders
 * nothing until the owner approves the first one, so the page never shows an
 * empty box or a made-up quote.
 */
export function ReviewStrip({ reviews, lang }: { reviews: PublicReview[]; lang: "en" | "es" }) {
  const shown = reviews.slice(0, 3);
  if (!shown.length) return null;
  const c = COPY[lang];
  return (
    <section className="rs" aria-labelledby="rs-title">
      <div className="ed-wrap">
        <div className="rs__head">
          <h2 id="rs-title" className="rs__title">
            {c.title}
          </h2>
          <Link href="/reviews" className="ed-textlink">
            {c.all} <span aria-hidden>→</span>
          </Link>
        </div>
        <ul className="rs__list">
          {shown.map((r) => (
            <li key={r.id} className="rs__item">
              <Stars count={r.rating} />
              <blockquote className="rs__quote">&ldquo;{r.body}&rdquo;</blockquote>
              <p className="rs__by">
                <strong>{r.name}</strong>
                {r.daughterName ? ` · ${c.quince(r.daughterName)}` : ""}
                {r.when ? ` · ${r.when}` : ""}
              </p>
              <p className="rs__verified">{c.verified}</p>
              {r.photoCount ? (
                <span className="rs__media">
                  {/* eslint-disable-next-line @next/next/no-img-element -- served + resized by /api/reviews/photo */}
                  <img
                    src={reviewPhotoUrl(r.id, 0, 828)}
                    srcSet={`${reviewPhotoUrl(r.id, 0, 640)} 640w, ${reviewPhotoUrl(r.id, 0, 1080)} 1080w`}
                    sizes="(max-width: 959px) 100vw, 33vw"
                    width={800}
                    height={1000}
                    alt={r.daughterName ? c.quince(r.daughterName) : ""}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
