"use client";

import { getImageProps } from "next/image";
import { useState, type ReactNode } from "react";

export type HeroSlide = {
  url: string;
  alt: string;
  position: string;
  mobileUrl?: string;
};

export function HeroCarousel({
  slides,
  locale,
  firstSlideOverlay,
}: {
  slides: HeroSlide[];
  locale: "en" | "es";
  firstSlideOverlay?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const slide = slides[active];
  if (!slide) return null;

  const isFirst = active === 0;
  const { props: desktop } = getImageProps({
    src: slide.url,
    alt: slide.alt,
    fill: true,
    sizes: "100vw",
    unoptimized: slide.url.startsWith("/portfolio/"),
  });
  const mobile = slide.mobileUrl
    ? getImageProps({ src: slide.mobileUrl, alt: slide.alt, fill: true, sizes: "100vw", unoptimized: true }).props
    : null;

  const move = (direction: number) => setActive((index) => (index + direction + slides.length) % slides.length);
  const label = locale === "es" ? "Fotografías destacadas" : "Featured photographs";

  return (
    <div className="pix-home-carousel" role="region" aria-roledescription={locale === "es" ? "carrusel" : "carousel"} aria-label={label}>
      <div className="pix-home-carousel-media">
        <picture>
          {mobile && <source media="(max-width: 767px)" srcSet={mobile.srcSet ?? mobile.src} />}
          <img
            {...desktop}
            alt={slide.alt}
            loading={isFirst ? "eager" : "lazy"}
            fetchPriority={isFirst ? "high" : undefined}
            className="pix-home-carousel-image"
            style={{ ...desktop.style, objectPosition: slide.position }}
          />
        </picture>
        {isFirst && firstSlideOverlay}
      </div>
      <div className="pix-home-carousel-controls">
        <button type="button" onClick={() => move(-1)} aria-label={locale === "es" ? "Fotografía anterior" : "Previous photograph"}>
          <span aria-hidden="true">←</span>
        </button>
        <output aria-live="polite" aria-atomic="true" aria-label={locale === "es" ? `Fotografía ${active + 1} de ${slides.length}` : `Photograph ${active + 1} of ${slides.length}`}>
          {String(active + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(slides.length).padStart(2, "0")}
        </output>
        <button type="button" onClick={() => move(1)} aria-label={locale === "es" ? "Fotografía siguiente" : "Next photograph"}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
