/**
 * Social card from an image slot (og.default): when the admin chose a link-
 * preview photo, the card is that photo, cropped to 1200×630 around its focal
 * point. Returns null (→ the designed text card) when there is no override or
 * anything fails. The slot is stored as JPEG because the OG renderer (satori)
 * cannot decode WebP.
 */
import "server-only";
import { ImageResponse } from "next/og";
import { getSlotBucket, getSlotVersion } from "@/lib/image-slot-store";
import { renditionKey } from "@/lib/image-slot-shared";

const W = 1200;
const H = 630;

/** Cover-crop geometry that keeps the focal point in frame (pure). */
export function coverCrop(w: number, h: number, focal: { x: number; y: number }, box = { w: W, h: H }) {
  const scale = Math.max(box.w / w, box.h / h);
  const dw = Math.round(w * scale);
  const dh = Math.round(h * scale);
  const clamp = (v: number, min: number) => Math.min(0, Math.max(min, v));
  return {
    width: dw,
    height: dh,
    left: clamp(Math.round(box.w / 2 - focal.x * dw), box.w - dw),
    top: clamp(Math.round(box.h / 2 - focal.y * dh), box.h - dh),
  };
}

export async function renderSlotOg(slotId: string): Promise<ImageResponse | null> {
  try {
    const v = await getSlotVersion(slotId);
    if (!v || v.ext !== "jpg") return null;
    const bucket = await getSlotBucket();
    if (!bucket) return null;
    // The smallest stored copy that still covers 1200px (or the largest).
    const width = v.widths.find((x) => x >= W) ?? v.widths[v.widths.length - 1];
    const obj = await bucket.get(renditionKey(v.key, width, "jpg"));
    if (!obj) return null;
    const bytes = Buffer.from(await new Response(obj.body).arrayBuffer());
    const src = `data:image/jpeg;base64,${bytes.toString("base64")}`;
    const crop = coverCrop(width, Math.round((v.h * width) / v.w), v.focal);
    return new ImageResponse(
      (
        <div style={{ display: "flex", position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#ffffff" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori renders plain <img> */}
          <img src={src} alt="" width={crop.width} height={crop.height} style={{ position: "absolute", left: crop.left, top: crop.top }} />
        </div>
      ),
      { width: W, height: H },
    );
  } catch {
    return null;
  }
}
