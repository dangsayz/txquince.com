/**
 * POST /api/reviews/<slug>/photo — one photo for a mom's review.
 *
 * Only an unused invite link can upload. The browser has already turned the
 * photo upright, shrunk it to 2560px and re-saved it (which drops GPS/EXIF),
 * so any size the mom picks works. The bytes must sniff as an image; they go
 * to the PRIVATE bucket under reviews/<slug>/ and are only ever served after
 * the owner approves the review.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getPortfolioBucket } from "@/lib/r2-portfolio";
import { sniffImage, MAX_UPLOAD_BYTES } from "@/lib/image-sniff";
import { getReviewBySlug } from "@/lib/reviews-db";
import { isReviewSlug, reviewPhotoPrefix } from "@/lib/review";
import { clientIp } from "@/lib/client-ip";
import { rateLimiter } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const rateLimited = rateLimiter("review-photo");

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isReviewSlug(slug)) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (await rateLimited(clientIp(req))) return NextResponse.json({ error: "rate" }, { status: 429 });

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "too-large" }, { status: 413 });

  const review = await getReviewBySlug(slug).catch(() => null);
  if (!review) return NextResponse.json({ error: "not-found" }, { status: 404 });
  if (review.status !== "invited") return NextResponse.json({ error: "used" }, { status: 409 });

  const bucket = await getPortfolioBucket();
  if (!bucket) return NextResponse.json({ error: "storage" }, { status: 503 });

  const bytes = await req.arrayBuffer();
  if (!bytes.byteLength) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return NextResponse.json({ error: "too-large" }, { status: 413 });
  const kind = sniffImage(new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 64)));
  if (!kind) return NextResponse.json({ error: "type" }, { status: 415 });

  const path = `${reviewPhotoPrefix(slug)}${crypto.randomUUID()}.${kind.ext}`;
  await bucket.put(path, bytes, { httpMetadata: { contentType: kind.type } });
  return NextResponse.json({ path });
}
