/**
 * POST /api/reviews/<slug>/photo — one photo for a mom's review.
 *
 * Any valid link can upload (first send or an update); nothing uploaded is
 * public until the owner approves the review that uses it. The browser has already turned the
 * photo upright, shrunk it to 2560px and re-saved it (which drops GPS/EXIF),
 * so any size the mom picks works. The bytes must sniff as an image; they go
 * to the PRIVATE bucket under reviews/<slug>/ and are only ever served after
 * the owner approves the review.
 */
import { NextResponse, type NextRequest } from "next/server";
import { getPortfolioBucket } from "@/lib/r2-portfolio";
import { sniffImage, MAX_UPLOAD_BYTES } from "@/lib/image-sniff";
import { getReviewBySlug } from "@/lib/reviews-db";
import { isOwnPhotoKey, isReviewSlug, latestVersion, reviewPhotoPrefix } from "@/lib/review";
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

/**
 * GET /api/reviews/<slug>/photo?key=… — the mom sees her own photos again when
 * she reopens her link to update her review. Only keys her review holds; never
 * cached. The link itself is the key (same trust as editing).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const key = new URL(req.url).searchParams.get("key");
  if (!isReviewSlug(slug) || !isOwnPhotoKey(slug, key)) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const review = await getReviewBySlug(slug).catch(() => null);
  if (!review || !latestVersion(review).photo_paths.includes(key)) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const bucket = await getPortfolioBucket();
  const obj = bucket ? await bucket.get(key) : null;
  if (!obj) return NextResponse.json({ error: "not-found" }, { status: 404 });
  return new NextResponse(obj.body, {
    headers: { "content-type": obj.httpMetadata?.contentType ?? "image/jpeg", "cache-control": "private, no-store", "x-content-type-options": "nosniff" },
  });
}
