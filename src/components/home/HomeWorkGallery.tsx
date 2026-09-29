"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { EditOverlay } from "@/components/EditMode";
import { categoryLabel } from "@/content/portfolio-taxonomy";

export type HomeImage = {
  id: string | null;
  url: string;
  alt: string;
  section: string;
  slug: string | null;
  focusX: number | null;
  focusY: number | null;
};

function sectionLabel(section: string): string {
  return categoryLabel(section);
}

function photoPath(image: HomeImage): string {
  return image.id && image.slug
    ? `/photos/${encodeURIComponent(image.section)}/${encodeURIComponent(image.slug)}`
    : "/portfolio";
}

function focal(image: HomeImage): string {
  return `${Math.round((image.focusX ?? 0.5) * 100)}% ${Math.round((image.focusY ?? 0.35) * 100)}%`;
}

function PhotoCard({ image, number }: { image: HomeImage; number: number }) {
  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-greige">
        <Link href={photoPath(image)} className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label={`View ${image.alt}`}>
          <div className="relative aspect-[4/5]">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"
              style={{ objectPosition: focal(image) }}
              unoptimized={image.id === null}
            />
          </div>
        </Link>
        {image.id && <EditOverlay image={{ id: image.id, slug: image.slug, alt: image.alt, fx: image.focusX, fy: image.focusY }} />}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-b border-line pb-3 text-xs font-medium tracking-[0.12em] text-ink-soft uppercase">
        <span>{sectionLabel(image.section)}</span>
        <span aria-hidden="true">{String(number).padStart(2, "0")}</span>
      </div>
    </article>
  );
}

export function HomeWorkGallery({ images }: { images: HomeImage[] }) {
  const [section, setSection] = useState("all");
  const rail = useRef<HTMLDivElement>(null);
  const categories = useMemo(() => [...new Set(images.map((image) => image.section))], [images]);
  const railImages = images.length > 6 ? images.slice(0, 4) : [];
  const filtered = section === "all" ? images.slice(railImages.length) : images.filter((image) => image.section === section);

  function scrollRail(direction: -1 | 1) {
    const element = rail.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center sm:px-12">
        <p className="font-display text-2xl text-ink">Portfolio photos are unavailable.</p>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-ink-soft">No portfolio images are available to show right now. Ask us about photo and film coverage for your date.</p>
        <Link href="/check-your-date" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Ask about your date <span aria-hidden="true" className="ml-2">↗</span></Link>
      </div>
    );
  }

  return (
    <>
      {railImages.length > 0 && section === "all" && (
        <div className="mb-14 border-b border-line pb-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">A closer look</p>
              <h3 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-tight text-ink">Moments from the day</h3>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Scroll photographs backward" onClick={() => scrollRail(-1)} className="flex size-11 items-center justify-center rounded-full border border-accent bg-white text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">←</button>
              <button type="button" aria-label="Scroll photographs forward" onClick={() => scrollRail(1)} className="flex size-11 items-center justify-center rounded-full border border-accent bg-white text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">→</button>
            </div>
          </div>
          <div ref={rail} role="region" aria-label="Photograph story rail" tabIndex={0} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [scrollbar-width:thin]">
            {railImages.map((image, index) => (
              <div key={image.id ?? image.url} className="w-[72vw] max-w-[23rem] shrink-0 snap-start sm:w-[38vw] lg:w-[24vw]">
                <PhotoCard image={image} number={index + 1} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col justify-between gap-5 border-b border-line pb-5 sm:flex-row sm:items-end">
        <div>
          <h3 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-tight text-ink">Browse by moment</h3>
          <p aria-live="polite" className="mt-2 text-base text-ink-soft">{filtered.length} {filtered.length === 1 ? "photograph" : "photographs"} {section === "all" && railImages.length ? "more to explore" : "to explore"}</p>
        </div>
        <div role="group" aria-label="Filter photographs by moment" className="flex max-w-full gap-2 overflow-x-auto pb-1">
          {["all", ...categories].map((item) => (
            <button key={item} type="button" onClick={() => setSection(item)} aria-pressed={section === item} className={`min-h-11 shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${section === item ? "border-accent bg-accent text-white" : "border-accent bg-white text-ink hover:bg-accent-soft"}`}>
              {item === "all" ? "All moments" : sectionLabel(item)}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-7 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((image, index) => <PhotoCard key={image.id ?? image.url} image={image} number={section === "all" ? railImages.length + index + 1 : index + 1} />)}
      </div>
    </>
  );
}
