"use client";

import { useState } from "react";
import Image from "next/image";
import { Figure } from "@/components/Figure";
import { Reveal } from "@/components/Reveal";
import { ShareModal } from "@/components/ShareModal";
import { EditOverlay } from "@/components/EditMode";

export type GalleryItem = {
  url: string | null;
  alt: string;
  ratio?: "portrait" | "landscape" | "square";
  feature?: boolean;
  width?: number | null;
  height?: number | null;
  /** Permanent slug + section → the branded share page (/photos/...). */
  slug?: string | null;
  section?: string;
  /** DB identity + anchor — powers the admin on-page edit overlay. */
  id?: string | null;
  fx?: number | null;
  fy?: number | null;
};

const SITE_TITLE = "TX Quince — Quinceañera Photography & Film";

/**
 * Editorial masonry gallery (4 columns). Images keep their natural aspect ratio
 * so portrait and landscape shots fall together seamlessly. No lightbox: a tap
 * gives a light haptic buzz and opens a clean, branded share window.
 */
export function PortfolioGallery({ images }: { images: GalleryItem[] }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [shareTitle, setShareTitle] = useState(SITE_TITLE);

  // Share the branded PAGE for this image — never a file URL.
  function openShare(img: GalleryItem) {
    if (typeof navigator !== "undefined") navigator.vibrate?.(8);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path =
      img.slug && img.section ? `/photos/${img.section}/${img.slug}` : "/portfolio";
    setShareUrl(`${origin}${path}`);
    setShareTitle(img.alt ? `${img.alt} · TX Quince` : SITE_TITLE);
    setShareOpen(true);
  }

  const sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw";

  return (
    <>
      <div className="columns-2 gap-5 sm:gap-8 lg:columns-3 lg:gap-12">
        {images.map((img, i) => (
          <Reveal
            key={i}
            delay={(i % 4) * 80}
            className="mb-5 break-inside-avoid sm:mb-8 lg:mb-12"
          >
            {img.url ? (
              <button
                type="button"
                onClick={() => openShare(img)}
                onContextMenu={(e) => e.preventDefault()}
                className="group relative block w-full select-none overflow-hidden bg-greige"
                aria-label={`Share: ${img.alt}`}
              >
                <div className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                  {img.width && img.height ? (
                    // Known dimensions → next/image reserves the exact aspect
                    // ratio (zero layout shift) and serves optimized sources.
                    <Image
                      src={img.url}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      sizes={sizes}
                      draggable={false}
                      className="block h-auto w-full"
                    />
                  ) : (
                    // Legacy upload without stored dimensions.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img.url} alt={img.alt} loading="lazy" draggable={false} className="block h-auto w-full" />
                  )}
                </div>
                {/* tap-to-share affordance */}
                <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <span className="m-2.5 inline-flex items-center gap-1.5 rounded-full bg-cream/90 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" />
                    </svg>
                    Tap to share
                  </span>
                </div>
                <EditOverlay
                  image={{ id: img.id, slug: img.slug, alt: img.alt, fx: img.fx, fy: img.fy }}
                />
              </button>
            ) : (
              <div className="overflow-hidden">
                <Figure src={img.url} alt={img.alt} ratio={img.ratio ?? "portrait"} sizes={sizes} />
              </div>
            )}
          </Reveal>
        ))}
      </div>

      <ShareModal
        open={shareOpen}
        url={shareUrl}
        title={shareTitle}
        onClose={() => setShareOpen(false)}
      />
    </>
  );
}
