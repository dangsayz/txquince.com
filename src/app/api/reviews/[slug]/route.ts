/**
 * POST /api/reviews/<slug> — a mom submits her review (once).
 *
 * Gates: valid slug → per-IP rate limit → zod → the invite must still be
 * unused (checked again inside the UPDATE, so it can't be submitted twice) →
 * every photo key must be one this link uploaded. The review lands as
 * 'pending'; the owner is told by email and nothing is public until he
 * approves it at /admin/reviews.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getReviewBySlug, submitReview } from "@/lib/reviews-db";
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
  if (review.status !== "invited") return NextResponse.json({ ok: false, error: "used" }, { status: 409 });

  try {
    const won = await submitReview(slug, { ...input, photos: [...new Set(input.photos)] });
    if (!won) return NextResponse.json({ ok: false, error: "used" }, { status: 409 });
  } catch (err) {
    console.error("[reviews] submit failed:", err);
    return NextResponse.json({ ok: false, error: "server" }, { status: 500 });
  }

  // Best-effort heads-up to the owner; the review is saved either way.
  await sendReviewReceivedEmail({ invite_name: review.invite_name, rating: input.rating, body: input.body, photos: input.photos }).catch((err) =>
    console.error("[reviews] owner email failed:", err),
  );
  return NextResponse.json({ ok: true });
}
