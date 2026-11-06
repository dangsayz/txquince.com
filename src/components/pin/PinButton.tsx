"use client";

import { trackEvent } from "@/components/Tracker";
import { SHARE_ICONS } from "@/components/ShareModal";
import { pinCreateUrl, pinDescription, pinMedia } from "@/lib/pinterest";
import "./pin.css";

/**
 * "Save" to Pinterest: a plain link to Pinterest's create-pin page (no SDK
 * script, no tracking pixel). The pin links back to the photo's own page.
 */
export function PinButton({
  page,
  src,
  alt,
  lang = "en",
  className = "",
}: {
  /** The photo's page on this site, e.g. /photos/portraits/<slug>. */
  page: string;
  /** Image src as rendered (/api/img/<slug>?v=… or a static path). */
  src: string;
  alt: string;
  lang?: "en" | "es";
  className?: string;
}) {
  const label = lang === "es" ? "Guardar" : "Save";
  return (
    <a
      className={`tq-pin ${className}`.trim()}
      href={pinCreateUrl({ page, image: pinMedia(src), description: pinDescription(alt, lang) })}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={lang === "es" ? `Guardar en Pinterest: ${alt}` : `Save to Pinterest: ${alt}`}
      onClick={(e) => {
        e.stopPropagation();
        trackEvent("pin_saved", page);
      }}
    >
      <span className="tq-pin__mark" aria-hidden>
        {SHARE_ICONS.pinterest}
      </span>
      <span className="tq-pin__label">{label}</span>
    </a>
  );
}
