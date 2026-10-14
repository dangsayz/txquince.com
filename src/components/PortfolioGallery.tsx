"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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
import "@/components/txq/pages/pages.css";

/** Editorial tiles share the homepage grid's single portrait ratio (.tq-egrid in txq.css). */
const EDITORIAL_RATIO = "4 / 5";
const pad2 = (n: number) => String(n).padStart(2, "0");

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
  const useNaturalRatio = Boolean(columns);
  const fieldId = useId();

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

  const sectionTitle = (item: GalleryItem) => sections.find((section) => section.id === item.section)?.title;
  const step = (delta: number) => {
    setZoomed(false);
    setActiveIndex((index) => index === null ? null : (index + delta + filtered.length) % filtered.length);
  };
  const close = () => { setActiveIndex(null); setZoomed(false); };

  const tile = (item: (typeof filtered)[number], index: number, ratio?: string) => {
    const hasDetail = item.detailAvailable !== false && item.slug && item.section;
    const label = editorial
      ? `${sectionTitle(item) || "Photograph"}${item.city ? ` / ${item.city}` : ""}`
      : labelFor(item);
    return (
      <>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => { setZoomed(false); setActiveIndex(index); }}
            className={`tq-pg-tile__media ${useNaturalRatio ? "tq-pg-tile__media--natural" : ""}`}
            style={ratio ? { aspectRatio: ratio } : undefined}
            aria-label={`View ${labelFor(item)}`}
          >
            {item.width && item.height ? (
              useNaturalRatio ? (
                <Image src={item.url} alt={copyFor(item).alt} width={item.width} height={item.height} sizes={imageSizes} unoptimized={item.url.startsWith("/portfolio/")} />
              ) : (
                <Image src={item.url} alt={copyFor(item).alt} fill sizes={imageSizes} unoptimized={item.url.startsWith("/portfolio/")} style={{ objectPosition: `${Math.round((item.fx ?? 0.5) * 100)}% ${Math.round((item.fy ?? 0.4) * 100)}%` }} />
              )
            ) : (
              <ProtectedImg src={item.url} alt={copyFor(item).alt} loading="lazy" className={useNaturalRatio ? "" : "tq-pg-tile__abs"} />
            )}
          </button>
          <EditOverlay image={{ id: item.id, slug: item.slug, alt: item.alt, fx: item.fx, fy: item.fy }} />
        </div>
        <div className="tq-pg-tile__cap">
          <span className="tq-mono tq-muted">[{pad2(index + 1)}]</span>
          {hasDetail ? (
            <Link href={pathFor(item)} aria-label={`Open the page for ${labelFor(item)}`} className="tq-pg-tile__label tq-mono">
              <span>{label}</span>
              <span aria-hidden>↗</span>
            </Link>
          ) : (
            <span className="tq-pg-tile__label tq-mono"><span>{label}</span></span>
          )}
          {item.slug && item.section ? <FavoriteButton section={item.section} slug={item.slug} compact /> : <span />}
        </div>
        {item.vendors?.length ? (
          <p className="tq-pg-tile__credits">
            {item.vendors.map((vendor, vendorIndex) => (
              <span key={`${vendor.slug}-${vendorIndex}`}>
                {vendorIndex > 0 ? <span aria-hidden="true"> · </span> : null}
                {vendor.role || vendorCreditLabel(vendor.category)}:{" "}
                <Link href={`/vendors/${vendor.slug}`}>{vendor.business || vendor.name}</Link>
              </span>
            ))}
          </p>
        ) : null}
      </>
    );
  };

  return (
    <div className="tq-pg-gal">
      {sections.map((section) => <span key={section.id} id={section.id} style={{ display: "block", height: 0 }} aria-hidden="true" />)}
      {!savedOnly || images.length ? (
        <div className="tq-pg-gal__bar">
          {sections.length > 1 ? (
            <div className="tq-filters" role="group" aria-label="Filter by moment">
              {[{ id: "all", title: editorial ? "All photographs" : "All moments" }, ...sections].map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className="tq-pill"
                  aria-pressed={category === section.id}
                  onClick={() => { setCategory(section.id); setActiveIndex(null); }}
                >
                  {section.title}
                </button>
              ))}
            </div>
          ) : null}
          <details open={Boolean(initialQuery) || !editorial} className="tq-pg-gal__tools" style={{ display: "block" }}>
            <summary className="tq-mono">
              Search &amp; sort <span className="tq-faq__icon" aria-hidden />
            </summary>
            <div className="tq-pg-gal__search">
              <div className="tq-field">
                <label htmlFor={`${fieldId}-q`} className="tq-mono tq-muted">Search photographs</label>
                <input id={`${fieldId}-q`} type="search" value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(null); }} placeholder="Search moments or places" className="tq-input" />
              </div>
              <div className="tq-field">
                <label htmlFor={`${fieldId}-s`} className="tq-mono tq-muted">Sort by</label>
                <select id={`${fieldId}-s`} value={sort} onChange={(event) => setSort(event.target.value === "title" ? "title" : "curated")} className="tq-input tq-pg-select">
                  <option value="curated">Curated order</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>
            </div>
          </details>
        </div>
      ) : null}

      <div className="tq-pg-gal__count tq-mono" aria-live="polite">
        <span>[{filtered.length} {filtered.length === 1 ? "photograph" : "photographs"}]</span>
        {savedOnly ? <span>Saved in this browser</span> : <Link href="/saved">Saved photographs <span aria-hidden>↗</span></Link>}
      </div>

      {filtered.length ? (
        columns ? (
          <div className={columns}>
            {filtered.map((item, index) => (
              <article key={item.id || `${item.section}-${item.slug}-${index}`} style={{ breakInside: "avoid", marginBottom: 32, minWidth: 0 }}>
                {tile(item, index)}
              </article>
            ))}
          </div>
        ) : editorial ? (
          <ul className="tq-egrid">
            {filtered.map((item, index) => (
              <li key={item.id || `${item.section}-${item.slug}-${index}`} className="tq-card">
                {tile(item, index, EDITORIAL_RATIO)}
              </li>
            ))}
          </ul>
        ) : (
          <ul className="tq-pg-thumbs">
            {filtered.map((item, index) => (
              <li key={item.id || `${item.section}-${item.slug}-${index}`} style={{ minWidth: 0 }}>
                {tile(item, index, "4 / 5")}
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="tq-pg-empty">
          <span className="tq-mono tq-muted">[{savedOnly ? "Saved" : "Archive"}]</span>
          <h2 className="tq-display">{images.length === 0 ? "Portfolio photos are unavailable." : savedOnly && !query && category === "all" ? "Your inspiration starts here." : "No photographs found."}</h2>
          <p>
            {images.length === 0 ? "Please check back soon, or ask us about photography and film for your date." : savedOnly && !query && category === "all" ? "Save photographs you love while browsing. They’ll appear here on this device." : "Try a different search or moment to see more of the collection."}
          </p>
          {images.length === 0 ? (
            <Link href="/#intake" className="tq-btn tq-btn--lg">Ask about your date <span className="tq-arrow" aria-hidden>→</span></Link>
          ) : query || category !== "all" ? (
            <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="tq-btn tq-btn--ghost">Clear filters</button>
          ) : savedOnly ? (
            <Link href="/portfolio" className="tq-btn tq-btn--lg">Explore the portfolio <span className="tq-arrow" aria-hidden>→</span></Link>
          ) : null}
        </div>
      )}

      <dialog
        ref={dialogRef}
        onClose={close}
        onCancel={close}
        aria-label="Photograph viewer"
        className="tq-pg-viewer"
      >
        {active ? (
          <div className="tq-pg-viewer__inner">
            <div className="tq-pg-viewer__bar">
              <span className="tq-mono">
                [{pad2((activeIndex ?? 0) + 1)} / {pad2(filtered.length)}] {editorial ? sectionTitle(active) || "Photograph" : labelFor(active)}
              </span>
              <button type="button" onClick={close} className="tq-icon-btn tq-mono" aria-label="Close photograph viewer">
                Close ×
              </button>
            </div>
            <div
              className="tq-pg-viewer__stage"
              data-zoomed={zoomed || undefined}
              onTouchStart={(event) => { touchStart.current = event.touches.length === 1 ? event.touches[0].clientX : null; }}
              onTouchEnd={(event) => {
                if (zoomed || touchStart.current === null || event.changedTouches.length !== 1 || filtered.length < 2) return;
                const distance = event.changedTouches[0].clientX - touchStart.current;
                touchStart.current = null;
                if (Math.abs(distance) < 50) return;
                step(distance < 0 ? 1 : -1);
              }}
            >
              <ProtectedImg src={brandedImageLoader({ src: active.url, width: 2400 })} alt={copyFor(active).alt} width={active.width} height={active.height} className="tq-pg-viewer__img" />
            </div>
            <div className="tq-pg-viewer__foot">
              {filtered.length > 1 ? (
                <>
                  <button type="button" onClick={() => step(-1)} className="tq-icon-btn" aria-label="Previous photograph">←</button>
                  <button type="button" onClick={() => step(1)} className="tq-icon-btn" aria-label="Next photograph">→</button>
                </>
              ) : null}
              <span className="tq-pg-viewer__count" />
              <button type="button" aria-pressed={zoomed} onClick={() => setZoomed((value) => !value)} className="tq-btn tq-btn--ghost">{zoomed ? "Fit image" : "Zoom in"}</button>
              {active.slug && active.section ? <FavoriteButton section={active.section} slug={active.slug} onToggle={savedOnly ? () => setActiveIndex(null) : undefined} /> : null}
              {active.detailAvailable !== false ? <button type="button" onClick={() => shareItem(active)} className="tq-btn tq-btn--ghost">Share</button> : null}
              {active.detailAvailable !== false && active.slug && active.section ? <Link href={pathFor(active)} className="tq-btn">View photo <span className="tq-arrow" aria-hidden>→</span></Link> : null}
            </div>
          </div>
        ) : null}
      </dialog>
      <ShareModal open={share !== null} url={share?.url || ""} title={share?.title || ""} onClose={() => setShare(null)} />
    </div>
  );
}
