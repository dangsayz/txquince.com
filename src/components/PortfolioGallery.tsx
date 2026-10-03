"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EditOverlay } from "@/components/EditMode";
import { ProtectedImg } from "@/components/ProtectedImg";
import { ShareModal } from "@/components/ShareModal";
import { FavoriteButton, useSavedPhotos } from "@/components/gallery/Favorites";
import { selectGalleryItems, type GalleryItem, type GallerySection } from "@/components/gallery/gallery-model";
import { altPhraseFor, vendorCreditLabel } from "@/content/portfolio-taxonomy";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import brandedImageLoader from "@/lib/image-loader";

export type { GalleryItem } from "@/components/gallery/gallery-model";

export function PortfolioGallery({
  images,
  sections = [],
  initialQuery = "",
  savedOnly = false,
  editorial = false,
  columns,
  imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
}: {
  images: GalleryItem[];
  sections?: GallerySection[];
  initialQuery?: string;
  savedOnly?: boolean;
  editorial?: boolean;
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
  const showRail = !editorial && sections.length > 1 && (!savedOnly || images.length > 0);
  const useNaturalRatio = Boolean(columns);

  const filtered = useMemo(() => selectGalleryItems(images, sections, { query, category, sort, savedOnly, saved }), [images, saved, savedOnly, category, query, sections, sort]);

  useEffect(() => {
    function selectLinkedCategory() {
      const linkedCategory = window.location.hash.slice(1);
      if (sections.some((section) => section.id === linkedCategory)) setCategory(linkedCategory);
    }
    selectLinkedCategory();
    window.addEventListener("hashchange", selectLinkedCategory);
    return () => window.removeEventListener("hashchange", selectLinkedCategory);
  }, [sections]);

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
  const copyFor = (item: GalleryItem) => publicPhotoCopy(item, altPhraseFor(item.section || ""));
  const labelFor = (item: GalleryItem) => copyFor(item).title;
  const pathFor = (item: GalleryItem) => item.detailAvailable !== false && item.slug && item.section ? `/photos/${item.section}/${item.slug}` : "/portfolio";
  const shareItem = (item: GalleryItem) => {
    setActiveIndex(null);
    setShare({ url: `${window.location.origin}${pathFor(item)}`, title: `${labelFor(item)} · TX Quince` });
  };

  return (
    <>
      {sections.map((section) => <span key={section.id} id={section.id} className="block h-0 scroll-mt-28" aria-hidden="true" />)}
      <div className={showRail ? "grid items-start gap-8 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-10" : ""}>
        {showRail ? (
          <aside className="hidden lg:sticky lg:top-28 lg:block" aria-label="Portfolio categories">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-ink-soft">Browse moments</p>
            <nav className="flex flex-col gap-1" aria-label="Filter by moment">
              {[{ id: "all", title: "All moments" }, ...sections].map((section) => (
                <button
                  key={section.id}
                  type="button"
                  aria-pressed={category === section.id}
                  onClick={() => { setCategory(section.id); setActiveIndex(null); }}
                  className={`min-h-11 rounded-lg px-3 text-left text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${category === section.id ? "bg-accent-soft font-medium text-ink" : "text-ink-soft hover:bg-greige hover:text-ink"}`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>
        ) : null}
        <div className="min-w-0">
          {!savedOnly || images.length ? (
            <div className={editorial ? "border-b border-line" : "border-b border-line pb-6"}>
              {editorial && sections.length > 1 ? (
                <nav className="flex max-w-full items-center gap-x-8 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Filter by moment">
                  {[{ id: "all", title: "All photographs" }, ...sections].map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      aria-pressed={category === section.id}
                      onClick={() => { setCategory(section.id); setActiveIndex(null); }}
                      className={`min-h-12 shrink-0 whitespace-nowrap border-b-2 pt-1 font-body text-sm font-medium uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${category === section.id ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              ) : null}
              {editorial ? (
                <details open={Boolean(initialQuery)} className="group py-2 text-ink">
                  <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-3 text-sm font-medium underline decoration-line underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
                    Search & sort <span aria-hidden="true" className="text-lg font-light group-open:rotate-45">+</span>
                  </summary>
                  <div className="grid gap-4 pb-5 pt-2 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,14rem)] sm:items-end">
                    <label className="block min-w-0 text-sm text-ink">
                      Search photographs
                      <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(null); }} placeholder="Search moments or places" className="mt-2 min-h-12 w-full border border-line bg-white px-4 text-base text-ink placeholder:text-ink-faint focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink" />
                    </label>
                    <label className="block text-sm text-ink">
                      Sort by
                      <select value={sort} onChange={(event) => setSort(event.target.value === "title" ? "title" : "curated")} className="mt-2 min-h-12 w-full border border-line bg-white px-4 text-base text-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink">
                        <option value="curated">Curated order</option>
                        <option value="title">Title A–Z</option>
                      </select>
                    </label>
                  </div>
                </details>
              ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-8">
                <label className="block min-w-0 flex-1 text-sm font-medium text-ink">
                  Search photographs
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => { setQuery(event.target.value); setActiveIndex(null); }}
                    placeholder="Search moments or places"
                    className="mt-2 min-h-12 w-full rounded-lg border border-line bg-white px-4 text-base font-normal text-ink placeholder:text-ink-faint focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent"
                  />
                </label>
                <label className="block text-sm font-medium text-ink">
                  Sort by
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value === "title" ? "title" : "curated")}
                    className="mt-2 min-h-12 w-full rounded-lg border border-line bg-white px-4 text-base font-normal text-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent sm:min-w-44"
                  >
                    <option value="curated">Curated order</option>
                    <option value="title">Title A–Z</option>
                  </select>
                </label>
              </div>
              )}
              {!editorial && sections.length > 1 ? (
                <nav className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-1 lg:hidden" aria-label="Filter by moment">
                  {[{ id: "all", title: "All moments" }, ...sections].map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      aria-pressed={category === section.id}
                      onClick={() => { setCategory(section.id); setActiveIndex(null); }}
                      className={`min-h-11 shrink-0 whitespace-nowrap rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${category === section.id ? "border-accent bg-accent text-white" : "border-line bg-white text-ink hover:border-accent"}`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              ) : null}
            </div>
          ) : null}

          <div className={`flex flex-wrap items-center justify-between gap-2 text-sm text-ink-soft ${editorial ? "py-7" : "py-5"}`} aria-live="polite">
            <span>{filtered.length} {filtered.length === 1 ? "photograph" : "photographs"}</span>
            {savedOnly ? <span>Saved in this browser</span> : <Link href="/saved" className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4 hover:text-ink-soft">Saved photographs ↗</Link>}
          </div>

      {filtered.length ? (
        <div className={columns ?? (editorial ? "grid grid-cols-1 items-start gap-x-3 gap-y-12 sm:grid-cols-2 md:gap-x-4 md:gap-y-16" : "grid grid-cols-1 items-start gap-x-5 gap-y-9 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-6")}>
          {filtered.map((item, index) => (
            <article key={item.id || `${item.section}-${item.slug}-${index}`} className="min-w-0">
              <div className={`group relative overflow-hidden bg-greige ${editorial ? "" : "rounded-lg border border-line"}`}>
                <button
                  type="button"
                  onClick={() => { setZoomed(false); setActiveIndex(index); }}
                  className={`block w-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent ${useNaturalRatio ? "" : "aspect-[4/5]"}`}
                  aria-label={`View ${labelFor(item)}`}
                >
                  {item.width && item.height ? (
                    <Image src={item.url} alt={copyFor(item).alt} width={item.width} height={item.height} sizes={imageSizes} unoptimized={item.url.startsWith("/portfolio/")} className={`block w-full transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.025] ${useNaturalRatio ? "h-auto" : "h-full object-cover"}`} style={useNaturalRatio ? undefined : { objectPosition: `${Math.round((item.fx ?? 0.5) * 100)}% ${Math.round((item.fy ?? 0.4) * 100)}%` }} />
                  ) : (
                    <ProtectedImg src={item.url} alt={copyFor(item).alt} loading="lazy" className={`block w-full transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.025] ${useNaturalRatio ? "h-auto" : "aspect-[4/5] object-cover"}`} />
                  )}
                </button>
                <EditOverlay image={{ id: item.id, slug: item.slug, alt: item.alt, fx: item.fx, fy: item.fy }} />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {editorial ? (
                    item.detailAvailable !== false && item.slug && item.section ? <Link href={pathFor(item)} aria-label={`View ${labelFor(item)}`} className="inline-flex min-h-11 items-center text-[0.6875rem] font-medium uppercase leading-snug tracking-[0.14em] text-ink hover:underline hover:underline-offset-4">{sections.find((section) => section.id === item.section)?.title || "Photograph"}{item.city ? ` / ${item.city}` : ""} <span className="ml-2 text-base" aria-hidden="true">↗</span></Link> : <p className="flex min-h-11 items-center text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink">{sections.find((section) => section.id === item.section)?.title || "Photograph"}{item.city ? ` / ${item.city}` : ""}</p>
                  ) : (
                    <>
                      {item.detailAvailable !== false && item.slug && item.section ? (
                        <Link href={pathFor(item)} className="inline-flex min-h-11 items-center text-base font-medium leading-snug text-ink hover:underline hover:underline-offset-4">{labelFor(item)}</Link>
                      ) : <p className="text-base font-medium leading-snug text-ink">{labelFor(item)}</p>}
                      <p className="text-sm text-ink-soft">{sections.find((section) => section.id === item.section)?.title || item.city || "TX Quince"}</p>
                    </>
                  )}
                </div>
                {item.slug && item.section ? <FavoriteButton section={item.section} slug={item.slug} className="!min-h-11 !w-11 shrink-0 !px-0 [&]:text-[0]" /> : null}
              </div>
              {item.vendors?.length ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {item.vendors.map((vendor, vendorIndex) => (
                    <span key={`${vendor.slug}-${vendorIndex}`}>
                      {vendorIndex > 0 ? <span aria-hidden="true"> · </span> : null}
                      {vendor.role || vendorCreditLabel(vendor.category)}:{" "}
                      <Link href={`/vendors/${vendor.slug}`} className="inline-flex min-h-11 items-center text-ink underline decoration-ink/30 underline-offset-2 hover:text-accent">
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
        <div className={`${editorial ? "border-y border-line" : "rounded-lg border border-line"} bg-white px-6 py-16 text-center`}>
          <h2 className="font-display text-2xl text-ink">{images.length === 0 ? "Portfolio photos are unavailable." : savedOnly && !query && category === "all" ? "Your inspiration starts here." : "No photographs found."}</h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-ink-soft">
            {images.length === 0 ? "Please check back soon, or ask us about photography and film for your date." : savedOnly && !query && category === "all" ? "Save photographs you love while browsing. They’ll appear here on this device." : "Try a different search or moment to see more of the collection."}
          </p>
          {images.length === 0 ? <Link href="/check-your-date" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-accent px-5 text-base font-medium text-white hover:bg-accent-strong">Ask about your date</Link> : query || category !== "all" ? <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="mt-6 min-h-11 rounded-lg border border-ink px-5 text-base font-medium text-ink">Clear filters</button> : savedOnly ? <Link href="/portfolio" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-accent px-5 text-base font-medium text-white hover:bg-accent-strong">Explore the portfolio</Link> : null}
        </div>
      )}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onClose={() => { setActiveIndex(null); setZoomed(false); }}
        onCancel={() => { setActiveIndex(null); setZoomed(false); }}
        aria-label="Photograph viewer"
        className="fixed inset-0 m-auto max-h-[96dvh] w-[min(96vw,1100px)] max-w-none border border-line bg-white p-0 text-ink shadow-2xl backdrop:bg-ink/85"
      >
        {active ? (
          <div className="relative">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
              <p className="min-w-0 truncate text-sm font-medium">{editorial ? sections.find((section) => section.id === active.section)?.title || "Photograph" : labelFor(active)}</p>
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
              <ProtectedImg src={brandedImageLoader({ src: active.url, width: 2400 })} alt={copyFor(active).alt} width={active.width} height={active.height} className={zoomed ? "mx-auto block h-auto w-[160vw] max-w-[1440px] object-contain" : "mx-auto block max-h-[68dvh] w-auto max-w-full object-contain"} />
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-line p-3 sm:p-5">
              {filtered.length > 1 ? <>
                <button type="button" onClick={() => { setZoomed(false); setActiveIndex((index) => index === null ? null : (index - 1 + filtered.length) % filtered.length); }} className="min-h-11 rounded-full border border-line px-4 text-sm hover:border-ink" aria-label="Previous photograph">←</button>
                <button type="button" onClick={() => { setZoomed(false); setActiveIndex((index) => index === null ? null : (index + 1) % filtered.length); }} className="min-h-11 rounded-full border border-line px-4 text-sm hover:border-ink" aria-label="Next photograph">→</button>
                <span className="mr-auto text-xs text-ink-soft">{(activeIndex ?? 0) + 1} / {filtered.length}</span>
              </> : <span className="mr-auto" />}
              <button type="button" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)} className="min-h-11 rounded-full border border-line px-4 text-sm font-medium hover:border-ink">{zoomed ? "Fit image" : "Zoom in"}</button>
              {active.slug && active.section ? <FavoriteButton section={active.section} slug={active.slug} onToggle={savedOnly ? () => setActiveIndex(null) : undefined} /> : null}
              {active.detailAvailable !== false ? <button type="button" onClick={() => shareItem(active)} className="min-h-11 rounded-full border border-line px-4 text-sm font-medium hover:border-ink">Share</button> : null}
              {active.detailAvailable !== false && active.slug && active.section ? <Link href={pathFor(active)} className="inline-flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-medium text-white hover:bg-accent-strong">View photo</Link> : null}
            </div>
          </div>
        ) : null}
      </dialog>
      <ShareModal open={share !== null} url={share?.url || ""} title={share?.title || ""} onClose={() => setShare(null)} />
    </>
  );
}
