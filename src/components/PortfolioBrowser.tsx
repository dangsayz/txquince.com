"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { groupForCategory } from "@/content/portfolio-taxonomy";
import type { VideoRow } from "@/lib/content-db";

export type TabGroup = {
  id: string;
  label: string;
  eyebrow: string;
  title: string;
  hook: string;
  intro: string;
  items: GalleryItem[];
};

const FILMS_GROUP: Omit<TabGroup, "items"> = {
  id: "films",
  label: "Films",
  eyebrow: "Motion",
  title: "Films",
  hook: "Her voice, the music, the room.",
  intro: "The day in motion — a film the family watches for years.",
};

const TYPE_HINT: Record<string, string> = {
  all: "Every moment",
  before: "Before the day",
  misa: "The ceremony",
  portraits: "Her portraits",
  celebration: "The reception",
  details: "The little things",
  vendors: "The people behind it",
  films: "The day in motion",
};

/** The editorial header that introduces whichever type is showing on the right. */
function GroupHeader({ group, count }: { group: Omit<TabGroup, "items">; count: number }) {
  return (
    <header className="mb-9 md:mb-12">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">{group.eyebrow}</p>
        <p className="text-xs tabular-nums text-ink-faint">
          {count} {group.id === "films" ? (count === 1 ? "film" : "films") : (count === 1 ? "photograph" : "photographs")}
        </p>
      </div>
      <h2 className="mt-4 font-serif text-[clamp(3rem,6vw,5.75rem)] leading-[0.95] tracking-[-0.035em] text-ink">
        {group.title}
      </h2>
      <p className="mt-4 font-serif text-2xl italic leading-tight text-wine-deep md:text-3xl">{group.hook}</p>
      <p className="mt-4 max-w-xl font-body text-base leading-[1.7] text-ink-soft">{group.intro}</p>
    </header>
  );
}

/**
 * Two-column portfolio browser. The left rail is the type selector on desktop
 * and a horizontal scroller on smaller screens. The right pane shows the header + masonry
 * grid for the chosen type ("All" stacks every type; "Films" swaps in the video
 * gallery). Old deep links (/portfolio#church, #el-vals) resolve to the right
 * type, and the URL hash tracks the selection so a filtered view is shareable.
 */
export function PortfolioBrowser({
  groups,
  videos,
}: {
  groups: TabGroup[];
  videos: VideoRow[];
}) {
  const hasFilms = videos.length > 0;

  const choices = useMemo(() => {
    const photoTotal = groups.reduce((n, g) => n + g.items.length, 0);
    const list: { id: string; label: string; count: number }[] = [
      { id: "all", label: "All", count: photoTotal + (hasFilms ? videos.length : 0) },
    ];
    for (const g of groups) list.push({ id: g.id, label: g.label, count: g.items.length });
    if (hasFilms) list.push({ id: "films", label: "Films", count: videos.length });
    return list;
  }, [groups, videos, hasFilms]);

  const [active, setActive] = useState("all");

  // Resolve any incoming hash to a real selection: a direct id (#portraits,
  // #films, #all) OR a legacy category id (#church → "misa", #el-vals →
  // "celebration", #save-the-date → "before"). SSR always renders the "all"
  // view, so the full body of work is in the initial HTML for crawlers; this
  // only adjusts the view client-side from the URL.
  useEffect(() => {
    const valid = new Set(choices.map((c) => c.id));
    const resolve = (raw: string): string | null => {
      const hash = raw.replace("#", "");
      if (!hash) return null;
      return valid.has(hash)
        ? hash
        : valid.has(groupForCategory(hash))
          ? groupForCategory(hash)
          : null;
    };
    // Back/forward + manual hash edits (replaceState below does NOT fire this).
    const onHash = () => {
      const r = resolve(window.location.hash);
      if (r) setActive(r);
    };
    window.addEventListener("hashchange", onHash);
    // One-time sync from the URL (an external system) on mount: guarded and
    // single-shot, so it can't cascade.
    const initial = resolve(window.location.hash);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (initial) setActive(initial);
    return () => window.removeEventListener("hashchange", onHash);
  }, [choices]);

  function select(id: string) {
    setActive(id);
    if (typeof history !== "undefined") {
      const url = new URL(window.location.href);
      url.hash = id === "all" ? "" : id;
      history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }

  const shownGroups = active === "all" ? groups : groups.filter((g) => g.id === active);
  const showFilms = hasFilms && (active === "all" || active === "films");

  return (
    <section className="mx-auto max-w-[90rem] px-5 pb-24 md:px-10 md:pb-32 lg:px-16">
      <div className="lg:grid lg:grid-cols-12 lg:gap-14">
        <aside className="sticky top-[72px] z-20 self-start lg:top-36 lg:col-span-3">
          <div className="-mx-5 border-b border-line bg-cream/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-cream/85 md:-mx-10 md:px-10 lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pr-4 lg:backdrop-blur-none lg:supports-[backdrop-filter]:bg-transparent">
            <p className="mb-6 hidden text-xs font-medium uppercase tracking-[0.2em] text-ink-soft lg:block">
              Explore the collection
            </p>
            <nav aria-label="Filter portfolio by type" className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:py-0 [&::-webkit-scrollbar]:hidden">
              {choices.map((c) => {
                const isActive = c.id === active;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => select(c.id)}
                    className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 font-body text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine lg:w-full lg:justify-between lg:gap-3 lg:border-b lg:border-line lg:px-0 lg:py-3 ${
                      isActive
                        ? "border-wine font-medium text-ink lg:border-wine"
                        : "border-transparent text-ink-soft hover:text-ink lg:border-line"
                    }`}
                  >
                    <span className="flex min-w-0 flex-col items-start leading-tight">
                      <span>{c.label}</span>
                      <span className="mt-1 hidden text-sm font-normal text-ink-faint lg:block">
                        {TYPE_HINT[c.id] ?? "The collection"}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-sm tabular-nums text-ink-faint lg:inline">
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 pt-10 lg:col-span-9 lg:pt-0">
          {shownGroups.map((g, idx) => (
            <section
              key={g.id}
              id={g.id}
              className={`scroll-mt-36 ${idx > 0 ? "mt-20 border-t border-line pt-16 md:mt-28 md:pt-20" : ""}`}
            >
              <Reveal>
                <GroupHeader group={g} count={g.items.length} />
              </Reveal>
              {g.items.length ? (
                <PortfolioGallery
                  images={g.items}
                  columns="columns-1 md:columns-2 md:gap-6 xl:gap-8"
                  imageSizes="(max-width: 767px) 90vw, (max-width: 1023px) 44vw, (max-width: 1440px) 31vw, 39rem"
                />
              ) : (
                <p className="accent text-xl text-ink-faint">Coming soon.</p>
              )}
            </section>
          ))}

          {showFilms ? (
            <section
              id="films"
              className={`scroll-mt-36 ${
                shownGroups.length ? "mt-20 border-t border-line pt-16 md:mt-28 md:pt-20" : ""
              }`}
            >
              <Reveal>
                <GroupHeader group={FILMS_GROUP} count={videos.length} />
              </Reveal>
              <VideoGallery videos={videos} />
            </section>
          ) : null}

          {shownGroups.length === 0 && !showFilms ? (
            <p className="accent text-xl text-ink-faint">Coming soon.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
