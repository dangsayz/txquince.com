/**
 * GET /api/reviews/photo/<review id>/<n>?w=1080 — photo n of a review.
 * ?set=edit — photo n of the mom's pending update (admin only).
 *
 * Public only once the owner has approved the review, the mom agreed to show
 * her photos, and the owner left "show photos" on. Before that only a signed-in
 * admin can see it (for moderation, never cached). Resized to WebP by the
 * Cloudflare Images binding; plain `next dev` passes the original through.
 */
import { NextResponse } from "next/server";
import { getReviewById } from "@/lib/reviews-db";
import { getPortfolioBucket } from "@/lib/r2-portfolio";
import { imageTransformForWidth } from "@/lib/image-derivative";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

const WIDTHS = [256, 384, 640, 828, 1080, 1440, 1920];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

interface CfImageTransformer {
  transform(options: Record<string, unknown>): CfImageTransformer;
  output(options: Record<string, unknown>): Promise<{ response(): Response }>;
}
interface CfImages {
  input(data: ReadableStream | ArrayBuffer): CfImageTransformer;
}

async function imagesBinding(): Promise<CfImages | undefined> {
  try {
    const mod = await import("@opennextjs/cloudflare");
    return (mod.getCloudflareContext().env as { IMAGES?: CfImages }).IMAGES;
  } catch {
    return undefined;
  }
}

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET(request: Request, { params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await params;
  const index = Number(n);
  if (!UUID.test(id) || !Number.isInteger(index) || index < 0) return notFound();

  const review = await getReviewById(id).catch(() => null);
  if (!review) return notFound();
  const fromEdit = new URL(request.url).searchParams.get("set") === "edit";
  const key = fromEdit ? review.edit?.photo_paths[index] : review.photo_paths[index];
  if (!key) return notFound();

  const isPublic = !fromEdit && review.status === "approved" && review.consent_publish && review.consent_photos && review.show_photos;
  if (!isPublic && !(await requireAdmin())) return notFound();
  // Hidden later = gone within the hour; admin previews are never cached.
  const cache = isPublic ? "public, max-age=3600" : "private, no-store";

  const bucket = await getPortfolioBucket();
  if (!bucket) return NextResponse.json({ error: "Storage not available" }, { status: 503 });
  const obj = await bucket.get(key);
  if (!obj) return notFound();

  const wanted = Number(new URL(request.url).searchParams.get("w")) || 1080;
  const width = WIDTHS.find((s) => s >= wanted) ?? WIDTHS[WIDTHS.length - 1];

  const images = await imagesBinding();
  if (images) {
    try {
      const out = await images.input(obj.body).transform(imageTransformForWidth(width)).output({ format: "image/webp", quality: 84 });
      const res = out.response();
      return new NextResponse(res.body, {
        headers: { "content-type": "image/webp", "cache-control": cache, "x-content-type-options": "nosniff" },
      });
    } catch (err) {
      console.error("[reviews/photo] transform failed:", err);
      const again = await bucket.get(key);
      if (!again) return notFound();
      return new NextResponse(again.body, {
        headers: { "content-type": again.httpMetadata?.contentType ?? "image/jpeg", "cache-control": cache, "x-content-type-options": "nosniff" },
      });
    }
  }
  return new NextResponse(obj.body, {
    headers: { "content-type": obj.httpMetadata?.contentType ?? "image/jpeg", "cache-control": cache, "x-content-type-options": "nosniff" },
  });
}
