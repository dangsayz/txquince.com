"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { PortfolioGallery, type GalleryItem } from "@/components/PortfolioGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { groupForCategory } from "@/content/portfolio-taxonomy";
import type { VideoRow } from "@/lib/content-db";
import "@/components/txq/pages/pages.css";

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

/** The editorial header that introduces whichever type is showing. */
function GroupHeader({ group, count }: { group: Omit<TabGroup, "items">; count: number }) {
  return (
    <header className="tq-head">
      <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
        [{group.eyebrow} — {count} {group.id === "films" ? (count === 1 ? "film" : "films") : (count === 1 ? "photograph" : "photographs")}]
      </p>
      <h2 className="tq-display tq-head__title">
        {group.title} <em>{group.hook}</em>
      </h2>
      <p className="tq-head__dek">{group.intro}</p>
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
    <section className="tq-wrap">
      <div className="tq-toolbar">
        <div className="tq-filters" role="group" aria-label="Filter portfolio by type">
          {choices.map((c) => (
            <button
              key={c.id}
              type="button"
              className="tq-pill"
              aria-pressed={c.id === active}
              title={TYPE_HINT[c.id] ?? "The collection"}
              onClick={() => select(c.id)}
            >
              {c.label} <span className="tq-mono" style={{ marginLeft: 8 }}>{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {shownGroups.map((g) => (
        <section key={g.id} id={g.id} className="tq-section">
          <Reveal>
            <GroupHeader group={g} count={g.items.length} />
          </Reveal>
          <div className="tq-inner" style={{ paddingBottom: 72 }}>
            {g.items.length ? (
              <PortfolioGallery
                images={g.items}
                columns="columns-1 md:columns-2 md:gap-6 xl:gap-8"
                imageSizes="(max-width: 767px) 90vw, (max-width: 1023px) 44vw, (max-width: 1440px) 31vw, 39rem"
              />
            ) : (
              <p className="tq-muted">Coming soon.</p>
            )}
          </div>
        </section>
      ))}

      {showFilms ? (
        <section id="films" className="tq-section">
          <Reveal>
            <GroupHeader group={FILMS_GROUP} count={videos.length} />
          </Reveal>
          <div className="tq-inner" style={{ paddingBottom: 72 }}>
            <VideoGallery videos={videos} />
          </div>
        </section>
      ) : null}

      {shownGroups.length === 0 && !showFilms ? (
        <p className="tq-muted tq-inner" style={{ paddingBlock: 48 }}>Coming soon.</p>
      ) : null}
    </section>
  );
}
