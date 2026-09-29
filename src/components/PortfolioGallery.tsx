"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EditOverlay } from "@/components/EditMode";
import { ProtectedImg } from "@/components/ProtectedImg";
import { ShareModal } from "@/components/ShareModal";
import { FavoriteButton, useSavedPhotos } from "@/components/gallery/Favorites";
import { selectGalleryItems, type GalleryItem, type GallerySection } from "@/components/gallery/gallery-model";
import { vendorCreditLabel } from "@/content/portfolio-taxonomy";

export type { GalleryItem } from "@/components/gallery/gallery-model";

export function PortfolioGallery({
  images,
  sections = [],
  initialQuery = "",
  savedOnly = false,
  columns,
  imageSizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  images: GalleryItem[];
  sections?: GallerySection[];
  initialQuery?: string;
  savedOnly?: boolean;
  columns?: string;
  imageSizes?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"curated" | "title">("curated");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [share, setShare] = useState<{ url: string; title: string } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const { saved } = useSavedPhotos();

  const filtered = useMemo(() => selectGalleryItems(images, sections, { query, category, sort, savedOnly, saved }), [images, saved, savedOnly, category, query, sections, sort]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeIndex !== null && !dialog.open) dialog.showModal();
    if (activeIndex === null && dialog.open) dialog.close();
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") { setZoomed(false); setActiveIndex((index) => index === null ? null : (index + 1) % filtered.length); }
      if (event.key === "ArrowLeft") { setZoomed(false); setActiveIndex((index) => index === null ? null : (index - 1 + filtered.length) % filtered.length); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, filtered.length]);

  const active = activeIndex === null ? null : filtered[activeIndex] ?? null;
  const labelFor = (item: GalleryItem) => item.title || item.alt;
  const pathFor = (item: GalleryItem) => item.slug && item.section ? `/photos/${item.section}/${item.slug}` : "/portfolio";
  const shareItem = (item: GalleryItem) => {
    setActiveIndex(null);
    setShare({ url: `${window.location.origin}${pathFor(item)}`, title: `${labelFor(item)} · TX Quince` });
  };

  return (
    <>
      {!savedOnly || images.length ? (
        <div className="border-b border-line pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <label className="block w-full max-w-lg text-xs font-semibold text-ink-soft">
              Search the portfolio
              <input
                type="search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActiveIndex(null); }}
                placeholder="Try portraits, church, or Dallas"
                className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-normal normal-case tracking-normal text-ink placeholder:text-ink-faint focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent"
              />
            </label>
            <label className="block text-xs font-semibold text-ink-soft">
              Sort by
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value === "title" ? "title" : "curated")}
                className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm font-normal normal-case tracking-normal text-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent lg:min-w-40"
              >
                <option value="curated">Curated order</option>
                <option value="title">Title A–Z</option>
              </select>
            </label>
          </div>
          {sections.length > 1 ? (
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Filter by moment">
              {[{ id: "all", title: "All moments" }, ...sections].map((section) => (
                <button
                  key={section.id}
                  id={section.id === "all" ? undefined : section.id}
                  type="button"
                  aria-pressed={category === section.id}
                  onClick={() => { setCategory(section.id); setActiveIndex(null); }}
                  className={`min-h-11 rounded-full border px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${category === section.id ? "border-accent bg-accent text-white" : "border-line bg-white text-ink hover:border-accent"}`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 py-5 text-sm text-ink-soft" aria-live="polite">
        <span>{filtered.length} {filtered.length === 1 ? "photograph" : "photographs"}</span>
        {savedOnly ? <span>Saved in this browser</span> : <Link href="/saved" className="font-medium text-accent underline underline-offset-4 hover:text-ink">View saved photos</Link>}
      </div>

      {filtered.length ? (
        <div className={columns ?? "grid grid-cols-2 items-start gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"}>
          {filtered.map((item, index) => (
            <article key={item.id || `${item.section}-${item.slug}-${index}`} className="min-w-0">
              <div className="group relative overflow-hidden rounded-xl bg-greige">
                <button
                  type="button"
                  onClick={() => { setZoomed(false); setActiveIndex(index); }}
                  className="block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
                  aria-label={`View ${labelFor(item)}`}
                >
                  {item.width && item.height ? (
                    <Image src={item.url} alt={item.alt} width={item.width} height={item.height} sizes={imageSizes} unoptimized={item.url.startsWith("/portfolio/")} className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.025]" />
                  ) : (
                    <ProtectedImg src={item.url} alt={item.alt} loading="lazy" className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.025]" />
                  )}
                </button>
                <EditOverlay image={{ id: item.id, slug: item.slug, alt: item.alt, fx: item.fx, fy: item.fy }} />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {item.slug && item.section ? (
                    <Link href={pathFor(item)} className="line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-accent">{labelFor(item)}</Link>
                  ) : <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{labelFor(item)}</p>}
                  <p className="mt-1 text-xs text-ink-soft">{sections.find((section) => section.id === item.section)?.title || item.city || "TX Quince"}</p>
                </div>
                {item.slug && item.section ? <FavoriteButton section={item.section} slug={item.slug} className="!min-h-11 !w-11 shrink-0 !px-0 [&]:text-[0]" /> : null}
              </div>
              {item.vendors?.length ? (
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                  {item.vendors.map((vendor, vendorIndex) => (
                    <span key={`${vendor.slug}-${vendorIndex}`}>
                      {vendorIndex > 0 ? <span aria-hidden="true"> · </span> : null}
                      {vendor.role || vendorCreditLabel(vendor.category)}:{" "}
                      <Link href={`/vendors/${vendor.slug}`} className="text-ink underline decoration-ink/30 underline-offset-2 hover:text-accent">
                        {vendor.business || vendor.name}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <h2 className="font-display text-2xl text-ink">{images.length === 0 ? "Portfolio photos are unavailable." : savedOnly && !query && category === "all" ? "Your inspiration starts here." : "No photographs found."}</h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-soft">
            {images.length === 0 ? "Please check back soon, or ask us about photography and film for your date." : savedOnly && !query && category === "all" ? "Save photographs you love while browsing. They’ll appear here on this device." : "Try a different search or moment to see more of the collection."}
          </p>
          {images.length === 0 ? <Link href="/check-your-date" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-strong">Ask about your date</Link> : savedOnly ? <Link href="/portfolio" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-medium text-white hover:bg-accent-strong">Explore the portfolio</Link> : query || category !== "all" ? <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="mt-6 min-h-11 rounded-full border border-ink px-5 text-sm font-medium text-ink">Clear filters</button> : null}
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => { setActiveIndex(null); setZoomed(false); }}
        onCancel={() => { setActiveIndex(null); setZoomed(false); }}
        aria-label="Photograph viewer"
        className="fixed inset-0 m-auto max-h-[96dvh] w-[min(96vw,1100px)] max-w-none rounded-2xl border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/85"
      >
        {active ? (
          <div className="relative">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
              <p className="min-w-0 truncate text-sm font-semibold">{labelFor(active)}</p>
              <button type="button" onClick={() => { setActiveIndex(null); setZoomed(false); }} className="min-h-11 rounded-full px-4 text-sm hover:bg-greige" aria-label="Close photograph viewer">Close ×</button>
            </div>
            <div
              className="max-h-[68dvh] overflow-auto bg-[#f5f5f5] p-3 sm:p-5"
              onTouchStart={(event) => { touchStart.current = event.touches.length === 1 ? event.touches[0].clientX : null; }}
              onTouchEnd={(event) => {
                if (zoomed || touchStart.current === null || event.changedTouches.length !== 1 || filtered.length < 2) return;
                const distance = event.changedTouches[0].clientX - touchStart.current;
                touchStart.current = null;
                if (Math.abs(distance) < 50) return;
                setZoomed(false);
                setActiveIndex((index) => index === null ? null : (index + (distance < 0 ? 1 : -1) + filtered.length) % filtered.length);
              }}
            >
              <ProtectedImg src={active.url} alt={active.alt} width={active.width} height={active.height} className={zoomed ? "mx-auto block h-auto w-[160vw] max-w-[1440px] object-contain" : "mx-auto block max-h-[68dvh] w-auto max-w-full object-contain"} />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-line p-3 sm:p-5">
              {filtered.length > 1 ? <>
                <button type="button" onClick={() => { setZoomed(false); setActiveIndex((index) => index === null ? null : (index - 1 + filtered.length) % filtered.length); }} className="min-h-11 rounded-full border border-line px-4 text-sm hover:border-ink" aria-label="Previous photograph">←</button>
                <button type="button" onClick={() => { setZoomed(false); setActiveIndex((index) => index === null ? null : (index + 1) % filtered.length); }} className="min-h-11 rounded-full border border-line px-4 text-sm hover:border-ink" aria-label="Next photograph">→</button>
                <span className="mr-auto text-xs text-ink-soft">{(activeIndex ?? 0) + 1} / {filtered.length}</span>
              </> : <span className="mr-auto" />}
              <button type="button" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)} className="min-h-11 rounded-full border border-line px-4 text-sm font-medium hover:border-ink">{zoomed ? "Fit image" : "Zoom in"}</button>
              {active.slug && active.section ? <FavoriteButton section={active.section} slug={active.slug} onToggle={savedOnly ? () => setActiveIndex(null) : undefined} /> : null}
              <button type="button" onClick={() => shareItem(active)} className="min-h-11 rounded-full border border-line px-4 text-sm font-medium hover:border-ink">Share</button>
              {active.slug && active.section ? <Link href={pathFor(active)} className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-medium text-white hover:bg-accent-strong">View photo</Link> : null}
            </div>
          </div>
        ) : null}
      </dialog>
      <ShareModal open={share !== null} url={share?.url || ""} title={share?.title || ""} onClose={() => setShare(null)} />
    </>
  );
}
