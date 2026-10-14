/**
 * <SlotImage> — server component for one replaceable image slot.
 *
 * Renders the admin's override when there is one, else the page's own photo
 * (`fallback`), else the registry default, with srcset, reserved size,
 * focal-point object-position, the alt in the page's language, and eager
 * loading for LCP slots. Visitors get only the <img>: the admin's Replace
 * button is a tiny island that renders nothing until /api/admin/session says
 * "admin", and the editor is loaded on demand.
 *
 * Reads are batched + cached per request (one site_settings query per page),
 * and a database failure just shows the normal photo.
 *
 * Place it inside the frame that already positions the image (the frame must
 * be `position: relative` for `fill` and for the Replace button).
 */
import type { CSSProperties } from "react";
import { resolveSlot } from "@/lib/image-slot-store";
import type { SlotFallback } from "@/lib/image-slot-resolve";
import { SlotPicture } from "@/components/slots/SlotPicture";
import { SlotAdminControl } from "@/components/slots/SlotAdminControl";

export async function SlotImage({
  slot,
  lang,
  fallback,
  fill = false,
  priority,
  sizes,
  alt,
  className,
  style,
}: {
  slot: string;
  lang: "en" | "es";
  /** The page's own photo for this spot (used when not replaced). */
  fallback?: SlotFallback | null;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const image = await resolveSlot(slot, fallback);
  return (
    <>
      <SlotPicture image={image} lang={lang} fill={fill} priority={priority} sizes={sizes} alt={alt} className={className} style={style} />
      <SlotAdminControl slot={slot} />
    </>
  );
}
