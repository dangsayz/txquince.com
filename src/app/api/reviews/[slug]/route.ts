/**
 * POST /api/reviews/<slug> — a mom sends her review, or updates it.
 *
 * Gates: valid slug → per-IP rate limit → zod → every photo key must be one
 * this link uploaded. First send: the unused link becomes 'pending' (checked
 * inside the UPDATE, so two taps can't both win). Later sends are updates:
 * before approval they replace the review; after approval they wait for the
 * owner and the live version stays. Either way the owner gets an email and
 * nothing new is public until he approves it at /admin/reviews.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getReviewBySlug, submitReview, updateFromMom } from "@/lib/reviews-db";
import { isOwnPhotoKey, isReviewSlug, SubmitSchema } from "@/lib/review";
import { sendReviewReceivedEmail } from "@/lib/review-email";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const rateLimited = rateLimiter("review");

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isReviewSlug(slug)) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  if (await rateLimited(clientIp(req))) return NextResponse.json({ ok: false, error: "rate" }, { status: 429 });

  const parsed = SubmitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? "form")))];
    return NextResponse.json({ ok: false, error: "invalid", fields }, { status: 400 });
  }
  const input = parsed.data;
  if (!input.photos.every((p) => isOwnPhotoKey(slug, p))) {
    return NextResponse.json({ ok: false, error: "invalid", fields: ["photos"] }, { status: 400 });
  }

  let review;
  try {
    review = await getReviewBySlug(slug);
  } catch {
    return NextResponse.json({ ok: false, error: "server" }, { status: 503 });
  }
  if (!review) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
  const photos = [...new Set(input.photos)];
  let kind: "new" | "replaced" | "queued";
  try {
    if (review.status === "invited") {
      // Lost the race to a second tap: fall through to an update of the same review.
      kind = (await submitReview(slug, { ...input, photos })) ? "new" : ((await updateFromMom(slug, { ...input, photos })) ?? "replaced");
    } else {
      const res = await updateFromMom(slug, { ...input, photos });
      if (!res) return NextResponse.json({ ok: false, error: "not-found" }, { status: 404 });
      kind = res;
    }
  } catch (err) {
    console.error("[reviews] submit failed:", err);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  // Best-effort heads-up to the owner; the review is saved either way.
  await sendReviewReceivedEmail({ invite_name: review.invite_name, rating: input.rating, body: input.body, photos, updated: kind !== "new" }).catch((err) =>
    console.error("[reviews] owner email failed:", err),
  );
  return NextResponse.json({ ok: true });
}
