"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
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

/** Thin-line icon wrapper — inherits currentColor so it picks up the active
 *  wine accent, stays warm-gray when idle. ~18px, stroke-only (the play
 *  triangle fills). */
function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden
    >
      {children}
    </svg>
  );
}

/**
 * Per-type presentation: a custom icon + the search phrase a family is most
 * likely to actually type ("save the date", "el vals", "quinceañera videos").
 * The hint doubles as a quiet keyword cue for visitors and crawlers. Keyed by
 * choice id ("all" + every group id), so any category that gains photos later
 * already has its icon and keyword.
 */
const TYPE_META: Record<string, { hint: string; icon: ReactNode }> = {
  all: {
    hint: "All quinceañera photos",
    icon: (
      <Svg>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </Svg>
    ),
  },
  before: {
    hint: "Save-the-date & getting ready",
    icon: (
      <Svg>
        <path d="M3 19h18" />
        <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
        <path d="M12 3v3" />
        <path d="M4.8 9.8 6 11" />
        <path d="M19.2 9.8 18 11" />
      </Svg>
    ),
  },
  misa: {
    hint: "La misa · church ceremony",
    icon: (
      <Svg>
        <path d="M12 2.5v3.5" />
        <path d="M10.3 4.2h3.4" />
        <path d="M5 21v-9.5l7-4 7 4V21" />
        <path d="M4 21h16" />
        <path d="M10 21v-3.5a2 2 0 0 1 4 0V21" />
      </Svg>
    ),
  },
  portraits: {
    hint: "Quinceañera portrait ideas",
    icon: (
      <Svg>
        <circle cx="12" cy="8.5" r="3.8" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </Svg>
    ),
  },
  celebration: {
    hint: "El vals & the reception",
    icon: (
      <Svg>
        <path d="M12 4.2l1.5 4.3 4.3 1.5-4.3 1.5L12 15.8l-1.5-4.3L6.2 10l4.3-1.5z" />
        <path d="M18 14.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z" />
      </Svg>
    ),
  },
  details: {
    hint: "Dress, décor & details",
    icon: (
      <Svg>
        <path d="M6 3.5h12l3 4.5-9 12.5L3 8z" />
        <path d="M3 8h18" />
        <path d="M9.5 3.5 7 8l5 12.5L17 8l-2.5-4.5" />
      </Svg>
    ),
  },
  vendors: {
    hint: "Venues, glam & florals",
    icon: (
      <Svg>
        <circle cx="9" cy="8" r="3.2" />
        <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
        <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6" />
        <path d="M16.5 14.2a5.5 5.5 0 0 1 4 5.3" />
      </Svg>
    ),
  },
  films: {
    hint: "Quinceañera videos",
    icon: (
      <Svg>
        <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
        <path d="M10.5 9.3v5.4l4.6-2.7z" fill="currentColor" stroke="none" />
      </Svg>
    ),
  },
};

/** The editorial header that introduces whichever type is showing on the right. */
function GroupHeader({ group }: { group: Omit<TabGroup, "items"> }) {
  return (
    <header className="mb-8 md:mb-10">
      <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">{group.eyebrow}</p>
      <h2
        className="mt-3 font-display text-ink"
        style={{ fontSize: "clamp(1.9rem,3.8vw,3rem)", lineHeight: 1.02, letterSpacing: "-0.02em" }}
      >
        {group.title}
      </h2>
      <p className="accent mt-3 text-lg text-wine-deep">{group.hook}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{group.intro}</p>
    </header>
  );
}

/**
 * Two-column portfolio browser. The LEFT rail is the type selector — a sticky
 * vertical list on tablet/desktop, a sticky horizontal scroller on mobile. The
 * RIGHT pane does the heavy lifting: it shows the editorial header + masonry
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
      history.replaceState(null, "", id === "all" ? window.location.pathname : `#${id}`);
    }
  }

  const shownGroups = active === "all" ? groups : groups.filter((g) => g.id === active);
  const showFilms = hasFilms && (active === "all" || active === "films");

  return (
    <section className="mx-auto max-w-[90rem] px-5 pb-20 md:px-10 lg:px-16 md:pb-28">
      <div className="md:grid md:grid-cols-12 md:gap-10 lg:gap-14">
        {/* ── LEFT: type selector ─────────────────────────────────────────
            Mobile: full-bleed sticky horizontal scroller under the nav.
            md+: sticky vertical rail with a hairline divider + per-type count. */}
        <aside className="sticky top-[72px] z-20 self-start md:top-28 md:col-span-4 lg:col-span-3">
          <div className="-mx-5 border-y border-line bg-cream/95 px-5 backdrop-blur supports-[backdrop-filter]:bg-cream/80 md:mx-0 md:border-0 md:border-r md:border-line md:bg-transparent md:px-0 md:pr-6 md:backdrop-blur-none lg:pr-8 md:supports-[backdrop-filter]:bg-transparent">
            <p className="mb-5 hidden text-[0.62rem] uppercase tracking-[0.32em] text-ink-faint md:block">
              Browse by type
            </p>
            <nav
              aria-label="Filter portfolio by type"
              className="flex gap-2 overflow-x-auto py-2 [scrollbar-width:none] md:flex-col md:gap-0.5 md:overflow-visible md:py-0 [&::-webkit-scrollbar]:hidden"
            >
              {choices.map((c) => {
                const isActive = c.id === active;
                const meta = TYPE_META[c.id] ?? TYPE_META.all;
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => select(c.id)}
                    className={`flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 text-sm transition-colors md:w-full md:justify-between md:gap-3 md:border-b-0 md:border-l-2 md:py-2.5 md:pl-4 md:pr-3 md:text-base ${
                      isActive
                        ? "border-wine font-medium text-wine"
                        : "border-transparent text-ink-soft hover:text-ink md:hover:border-line"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5 md:gap-3">
                      <span className="shrink-0">{meta.icon}</span>
                      <span className="flex min-w-0 flex-col items-start leading-tight">
                        <span className="md:font-display">{c.label}</span>
                        <span className="mt-0.5 hidden text-[0.66rem] font-normal normal-case tracking-normal text-ink-faint md:block">
                          {meta.hint}
                        </span>
                      </span>
                    </span>
                    <span
                      className={`hidden shrink-0 text-xs tabular-nums md:inline ${
                        isActive ? "text-wine/70" : "text-ink-faint"
                      }`}
                    >
                      {c.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── RIGHT: the gallery does the heavy lifting ───────────────────── */}
        <div className="pt-8 md:col-span-8 md:pt-2 lg:col-span-9">
          {shownGroups.map((g, idx) => (
            <section
              key={g.id}
              id={g.id}
              className={`scroll-mt-28 ${idx > 0 ? "mt-16 border-t border-ink/10 pt-12 md:mt-20 md:pt-16" : ""}`}
            >
              <Reveal>
                <GroupHeader group={g} />
              </Reveal>
              {g.items.length ? (
                <PortfolioGallery images={g.items} />
              ) : (
                <p className="accent text-xl text-ink-faint">Coming soon.</p>
              )}
            </section>
          ))}

          {showFilms ? (
            <section
              id="films"
              className={`scroll-mt-28 ${
                shownGroups.length ? "mt-16 border-t border-ink/10 pt-12 md:mt-20 md:pt-16" : ""
              }`}
            >
              <Reveal>
                <GroupHeader group={FILMS_GROUP} />
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
