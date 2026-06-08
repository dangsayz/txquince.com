"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Figure } from "@/components/Figure";
import { Reveal } from "@/components/Reveal";
import { mediaUrl } from "@/content/media";
import type { GalleryImage } from "@/content/gallery";

/**
 * Editorial gallery grid with a brand-toned lightbox. Only release-cleared
 * images that resolve to a real R2 URL are clickable/zoomable; placeholders
 * render as labeled figures (LAW 5).
 */
export function PortfolioGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(-1);

  // Build lightbox slides from images that have a real URL, preserving order.
  const slides = images
    .map((img) => ({ url: mediaUrl(img.key), alt: img.alt }))
    .filter((s): s is { url: string; alt: string } => Boolean(s.url))
    .map((s) => ({ src: s.url, alt: s.alt }));

  // Map each grid image to its index within `slides` (or -1 if placeholder).
  const slideIndexFor = (img: GalleryImage): number => {
    const url = mediaUrl(img.key);
    if (!url) return -1;
    return slides.findIndex((s) => s.src === url);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {images.map((img, i) => {
          const si = slideIndexFor(img);
          const clickable = si >= 0;
          return (
            <Reveal
              key={i}
              delay={(i % 3) * 80}
              className={img.feature ? "sm:col-span-2" : ""}
            >
              {clickable ? (
                <button
                  type="button"
                  onClick={() => setIndex(si)}
                  className="group block w-full cursor-zoom-in"
                  aria-label={`View: ${img.alt}`}
                >
                  <div className="overflow-hidden">
                    <div className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
                      <Figure
                        imageKey={img.key}
                        alt={img.alt}
                        ratio={img.ratio ?? (img.feature ? "landscape" : "portrait")}
                        sizes={img.feature ? "100vw" : "(max-width: 640px) 100vw, 50vw"}
                      />
                    </div>
                  </div>
                </button>
              ) : (
                <Figure
                  imageKey={img.key}
                  alt={img.alt}
                  ratio={img.ratio ?? (img.feature ? "landscape" : "portrait")}
                  sizes={img.feature ? "100vw" : "(max-width: 640px) 100vw, 50vw"}
                />
              )}
            </Reveal>
          );
        })}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={Math.max(index, 0)}
        slides={slides}
      />
    </>
  );
}
