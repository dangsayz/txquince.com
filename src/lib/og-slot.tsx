/**
 * Social card from an image slot (og.default): when the admin chose a link-
 * preview photo, the card is that photo shown WHOLE (contained, centered on the
 * site's canvas color): never cropped, no text, no overlay, no color change. Returns null (→ the designed text card) when there is no override or
 * anything fails. The slot is stored as JPEG because the OG renderer (satori)
 * cannot decode WebP.
 */
import "server-only";
import { ImageResponse } from "next/og";
import { getSlotBucket, getSlotVersion } from "@/lib/image-slot-store";
import { renditionKey } from "@/lib/image-slot-shared";

const W = 1200;
const H = 630;

/** The site's canvas color behind a contained photo. */
export const OG_CANVAS = "#faf8f5";

/** Contain geometry: the whole photo, as large as fits, centered (pure). */
export function containFit(w: number, h: number, box = { w: W, h: H }) {
  const scale = Math.min(box.w / w, box.h / h);
  const dw = Math.round(w * scale);
  const dh = Math.round(h * scale);
  return { width: dw, height: dh, left: Math.round((box.w - dw) / 2), top: Math.round((box.h - dh) / 2) };
}

export async function renderSlotOg(slotId: string): Promise<ImageResponse | null> {
  try {
    const v = await getSlotVersion(slotId);
    if (!v || v.ext !== "jpg") return null;
    const bucket = await getSlotBucket();
    if (!bucket) return null;
    // The smallest stored copy at least 1200px wide (or the largest).
    const width = v.widths.find((x) => x >= W) ?? v.widths[v.widths.length - 1];
    const obj = await bucket.get(renditionKey(v.key, width, "jpg"));
    if (!obj) return null;
    const bytes = Buffer.from(await new Response(obj.body).arrayBuffer());
    const src = `data:image/jpeg;base64,${bytes.toString("base64")}`;
    const fit = containFit(width, Math.round((v.h * width) / v.w));
    return new ImageResponse(
      (
        <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", overflow: "hidden", background: OG_CANVAS }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
          <img src={src} alt="" width={fit.width} height={fit.height} style={{ position: "absolute", left: fit.left, top: fit.top }} />
        </div>
      ),
      { width: W, height: H },
    );
  } catch {
    return null;
  }
}
