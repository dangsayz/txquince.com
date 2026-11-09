import type { Metadata } from "next";
import Link from "next/link";
import { getPublicReviews } from "@/lib/reviews-db";
import { reviewPhotoUrl } from "@/lib/review-public";
import { Stars } from "@/components/Stars";
import { AdminQuick } from "@/components/AdminQuick";
import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";
import "@/components/review/review.css";

// Approving or hiding a review revalidates this page at once (/api/admin/reviews).
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  // An empty page is thin content: keep it out of search until a review is approved.
  const empty = (await getPublicReviews()).length === 0;
  return {
  ...(empty ? { robots: { index: false, follow: true } } : {}),
  title: "Reviews from Families",
  description: "Reviews from DFW moms whose daughters’ quinceañeras TX Quince photographed and filmed, each one from a family I worked with.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Reviews from Families · TX Quince",
    description: "What DFW moms say about their quinceañera photos and film.",
    url: `${site.url}/reviews`,
  },
  };
}

export default async function ReviewsPage() {
  const reviews = await getPublicReviews();
  return (
    <div className="tq-wrap rv-page">
      <header className="tq-pg-mast" aria-labelledby="reviews-title">
        <p className="tq-pg-mast__index tq-mono">[Reviews / From the families]</p>
        <div className="tq-pg-mast__body">
          <h1 id="reviews-title" className="tq-display tq-pg-mast__title">
            Words from the moms <em>I’ve worked with.</em>
          </h1>
          <p className="tq-pg-mast__dek">
            Every review here comes from a family whose quinceañera I photographed or filmed. Each mom gets her own private link after her event, so only real clients can write one.
          </p>
        </div>
      </header>

      {reviews.length ? (
        <ul className="rv-list">
          {reviews.map((r) => {
            const photos = Array.from({ length: Math.min(r.photoCount, 4) }, (_, n) => n);
            return (
              <li key={r.id} className="rv-item">
                <div className="rv-item__meta">
                  <Stars count={r.rating} />
                  <p className="rv-item__name">{r.name}</p>
                  <p className="tq-mono tq-muted" style={{ margin: 0 }}>
                    {[r.daughterName ? `${r.daughterName}’s quinceañera` : null, r.city, r.when].filter(Boolean).join(" · ")}
                  </p>
                  <p className="tq-mono tq-muted" style={{ margin: 0 }}>Verified client</p>
                  <AdminQuick kind="review" id={r.id} name={r.name} />
                </div>
                <blockquote className="rv-item__quote">{r.body}</blockquote>
                {photos.length ? (
                  <ul className="rv-item__photos">
                    {photos.map((n) => (
                      <li key={n}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- served + resized by /api/reviews/photo */}
                        <img
                          src={reviewPhotoUrl(r.id, n, 640)}
                          srcSet={`${reviewPhotoUrl(r.id, n, 384)} 384w, ${reviewPhotoUrl(r.id, n, 828)} 828w`}
                          sizes="(max-width: 959px) 50vw, 15vw"
                          width={640}
                          height={800}
                          alt={r.daughterName ? `From ${r.daughterName}’s quinceañera, shared by her mom` : "Shared by the family"}
                          loading="lazy"
                          decoding="async"
                        />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rv-note">The first reviews are on their way. In the meantime, see the work for yourself.</p>
      )}

      <p className="rv-note">
        These are reviews I chose to show here, with each family’s permission. They are not every review I have received.
      </p>
      <p>
        <Link href="/portfolio" className="tq-btn tq-btn--lg tq-btn--ghost">
          View the work <span className="tq-arrow" aria-hidden>↗</span>
        </Link>
      </p>
    </div>
  );
}
