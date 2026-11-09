import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getReviewBySlug } from "@/lib/reviews-db";
import { isReviewSlug, shortName } from "@/lib/review";
import { detectPlanLang } from "@/lib/plan-lang";
import { ReviewForm } from "@/components/review/ReviewForm";
import { REVIEW_COPY } from "@/components/review/review-copy";
import { site } from "@/content/site";
import "@/components/txq/pages/pages.css";
import "@/components/plan/plan.css";
import "@/components/review/review.css";

export const dynamic = "force-dynamic";

/** A private, one-time link: never indexed, never followed, never cached. */
export const metadata: Metadata = {
  title: { absolute: `Leave a review · ${site.brand}` },
  // What the text-message preview shows (image: opengraph-image.jpg here).
  // No names: the same card goes to every family.
  description: "How was her quinceañera? Tell other moms in two minutes. · ¿Cómo fue su quinceañera? Cuéntele a otras mamás.",
  openGraph: {
    title: "How was her quinceañera? Leave a review",
    description: "Two minutes, private link. · Dos minutos, enlace privado.",
    siteName: site.brand,
    type: "website",
  },
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isReviewSlug(slug)) notFound();
  const review = await getReviewBySlug(slug).catch(() => null);
  if (!review) notFound();

  const lang = detectPlanLang(null, (await headers()).get("accept-language"));
  if (review.status !== "invited") {
    const t = REVIEW_COPY[review.language];
    return (
      <div className="tq-wrap qp-intake rv" lang={review.language}>
        <header className="qp-intake__head">
          <p className="tq-mono qp-eyebrow">[{t.eyebrow}]</p>
          <h1 className="tq-display qp-intake__title">{t.doneTitle}</h1>
          <p className="qp-intake__intro">{t.doneBody}</p>
        </header>
      </div>
    );
  }

  return (
    <ReviewForm
      slug={slug}
      lang={lang}
      firstName={review.invite_name.trim().split(/\s+/)[0] ?? ""}
      defaultSignature={shortName(review.invite_name)}
      defaultDaughter={review.daughter_name ?? ""}
    />
  );
}
