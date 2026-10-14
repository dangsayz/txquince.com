/**
 * SlotPicture — the <img> for an image slot. Presentational and directive-free,
 * so it renders the same from server components (<SlotImage>) and from the
 * homepage's client sections. It carries no admin code.
 *
 *  · fill: covers its positioned frame (the frame's CSS aspect-ratio reserves
 *    the space); otherwise width/height attributes reserve it. Either way
 *    nothing shifts when the photo arrives.
 *  · srcset lists only widths that really exist (never wider than the
 *    original), so the browser never fetches an upscaled copy.
 *  · LCP slots load eagerly with high fetch priority and a <link rel=preload>.
 */
import type { CSSProperties } from "react";
import { preload } from "react-dom";
import type { ResolvedSlotImage } from "@/lib/image-slot-resolve";

export function SlotPicture({
  image,
  lang,
  fill = false,
  priority,
  sizes,
  alt,
  className,
  style,
}: {
  image: ResolvedSlotImage;
  lang: "en" | "es";
  fill?: boolean;
  /** Defaults to the slot's LCP flag. */
  priority?: boolean;
  /** Overrides the registry's sizes hint. */
  sizes?: string;
  /** Overrides the alt text (e.g. "" for a decorative repeat). */
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const eager = priority ?? image.lcp;
  const sizesHint = image.srcSet ? (sizes ?? image.sizes) : undefined;
  if (eager) {
    preload(image.src, {
      as: "image",
      fetchPriority: "high",
      ...(image.srcSet ? { imageSrcSet: image.srcSet, imageSizes: sizesHint } : {}),
    });
  }
  const frame: CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
    : { width: "100%", height: "auto" };
  return (
    // eslint-disable-next-line @next/next/no-img-element -- slot renditions carry their own srcset (next/image's loader is reserved for /api/img)
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizesHint}
      alt={alt ?? image.alt[lang] ?? image.alt.en}
      width={fill ? undefined : image.width}
      height={fill ? undefined : image.height}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      className={className}
      style={{ ...frame, objectPosition: image.objectPosition, ...style }}
    />
  );
}
