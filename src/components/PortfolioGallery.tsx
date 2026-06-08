"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Figure } from "@/components/Figure";
import { Reveal } from "@/components/Reveal";

export type GalleryItem = {
  url: string | null;
  alt: string;
  ratio?: "portrait" | "landscape" | "square";
  feature?: boolean;
};

/**
 * Editorial gallery grid with a brand-toned lightbox. Items with a real URL are
 * clickable/zoomable; URL-less items render as labeled placeholder fields.
 */
export function PortfolioGallery({ images }: { images: GalleryItem[] }) {
  const [index, setIndex] = useState(-1);

  const slides = images
    .filter((i) => i.url)
    .map((i) => ({ src: i.url as string, alt: i.alt }));

  const slideIndexFor = (item: GalleryItem) =>
    item.url ? slides.findIndex((s) => s.src === item.url) : -1;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {images.map((img, i) => {
          const si = slideIndexFor(img);
          const ratio = img.ratio ?? (img.feature ? "landscape" : "portrait");
          const sizes = img.feature ? "100vw" : "(max-width: 640px) 100vw, 50vw";
          // Cap big feature tiles so a full-width landscape never eats the screen.
          const figClass = img.feature ? "max-h-[70vh]" : "";
          return (
            <Reveal key={i} delay={(i % 3) * 80} className={img.feature ? "sm:col-span-2" : ""}>
              {si >= 0 ? (
                <button
                  type="button"
                  onClick={() => setIndex(si)}
                  className="group block w-full cursor-zoom-in"
                  aria-label={`View: ${img.alt}`}
                >
                  <div className="overflow-hidden">
                    <div className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
                      <Figure src={img.url} alt={img.alt} ratio={ratio} sizes={sizes} className={figClass} />
                    </div>
                  </div>
                </button>
              ) : (
                <Figure src={img.url} alt={img.alt} ratio={ratio} sizes={sizes} className={figClass} />
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
