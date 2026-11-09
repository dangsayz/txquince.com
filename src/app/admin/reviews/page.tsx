import { requireAdminPage } from "@/lib/require-admin";
import { listReviews } from "@/lib/reviews-db";
import { inviteMessage, reviewPath, type ReviewRecord } from "@/lib/review";
import { getSiteUrl } from "@/lib/site-url";
import { StudioPage } from "@/components/admin/StudioPage";
import { ReviewsManager, type AdminReview } from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews · TX Quince Studio" };

export default async function AdminReviews() {
  await requireAdminPage("/admin/reviews");
  let rows: ReviewRecord[] = [];
  let loadError: string | null = null;
  try {
    rows = await listReviews();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load reviews.";
  }
  const base = getSiteUrl();
  const reviews: AdminReview[] = rows.map((r) => {
    const url = `${base}${reviewPath(r.slug)}`;
    return { ...r, url, message: inviteMessage(r, url) };
  });

  return (
    <StudioPage
      title="Reviews"
      intro="Make a private link for each mom you worked with, text it to her, then approve what shows on the site."
      actions={<a href="/reviews" target="_blank" rel="noopener noreferrer" className="st-btn-ghost">View reviews page <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span></a>}
    >
      {loadError ? (
        <p role="alert" className="st-card px-5 py-4 text-[15px]">
          Reviews could not load: {loadError}. If this is the first time, apply the D1 migration: <code>npx wrangler d1 migrations apply txquince --remote</code>.
        </p>
      ) : null}
      <ReviewsManager initial={reviews} />
    </StudioPage>
  );
}
