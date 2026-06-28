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

/** One editorial band — eyebrow, big title, hook + intro, then the grid. */
function GroupSection({
  group,
  num,
  children,
}: {
  group: Omit<TabGroup, "items">;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={group.id}
      className="scroll-mt-28 mt-16 border-t border-ink/10 bg-white md:mt-20"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-14 md:px-10 lg:px-16 md:py-20">
        <Reveal className="mb-10 grid items-end md:mb-14 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="text-[0.64rem] uppercase tracking-[0.32em] text-ink-faint">
              {group.eyebrow}
            </p>
            <h2
              className="mt-4 font-display text-ink"
              style={{ fontSize: "clamp(2.1rem,4.4vw,3.8rem)", lineHeight: 1, letterSpacing: "-0.02em" }}
            >
              {group.title}
            </h2>
            <p className="accent mt-4 text-lg text-wine-deep">{group.hook}</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
              {group.intro}
            </p>
          </div>
          <p
            aria-hidden
            className="hidden text-right font-display text-ink/10 md:col-span-4 md:block"
            style={{ fontSize: "5rem", lineHeight: 1 }}
          >
            {num}
          </p>
        </Reveal>
        {children}
      </div>
    </section>
  );
}

/**
 * Tabbed portfolio. One tab per public group ("Before the Day", "La Misa", …)
 * plus "All" (everything stacked) and "Films" when films exist. The tab bar
 * scrolls horizontally on small screens; every tab is a ≥44px target. Old
 * deep links (/portfolio#church, /portfolio#el-vals) resolve to the right tab.
 */
export function PortfolioTabs({
  groups,
  videos,
}: {
  groups: TabGroup[];
  videos: VideoRow[];
}) {
  const hasFilms = videos.length > 0;

  const tabs = useMemo(() => {
    const t: { id: string; label: string }[] = [{ id: "all", label: "All" }];
    for (const g of groups) t.push({ id: g.id, label: g.label });
    if (hasFilms) t.push({ id: "films", label: "Films" });
    return t;
  }, [groups, hasFilms]);

  const [active, setActive] = useState("all");

  // Old deep links (/portfolio#church, #el-vals) point at a category. In the
  // default "All" view every section is rendered under its group id, so we just
  // scroll the matching section into view — no tab-state change (which would
  // cause a cascading render), and the browser handles exact-id hashes natively.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el =
      document.getElementById(hash) ||
      document.getElementById(groupForCategory(hash));
    if (el) el.scrollIntoView({ block: "start" });
  }, []);

  const shown = active === "all" ? groups : groups.filter((g) => g.id === active);
  const showFilms = hasFilms && (active === "all" || active === "films");

  return (
    <div>
      {/* Tab bar — horizontally scrollable, each tab a ≥44px target. */}
      <div className="sticky top-0 z-30 border-y border-ink/10 bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
        <div className="mx-auto max-w-[90rem] px-2 md:px-8 lg:px-14">
          <div
            role="tablist"
            aria-label="Portfolio categories"
            className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(t.id)}
                  className={`min-h-[44px] whitespace-nowrap border-b-2 px-3.5 py-3 text-sm transition-colors md:px-4 ${
                    isActive
                      ? "border-wine font-medium text-ink"
                      : "border-transparent text-ink-soft hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {shown.map((g, idx) => (
        <GroupSection key={g.id} group={g} num={String(idx + 1).padStart(2, "0")}>
          {g.items.length ? (
            <PortfolioGallery images={g.items} />
          ) : (
            <p className="accent text-xl text-ink-faint">Coming soon.</p>
          )}
        </GroupSection>
      ))}

      {showFilms ? (
        <GroupSection
          group={{
            id: "films",
            label: "Films",
            eyebrow: "Motion",
            title: "Films",
            hook: "Her voice, the music, the room.",
            intro: "The day in motion — a film the family watches for years.",
          }}
          num={String(shown.length + 1).padStart(2, "0")}
        >
          {videos.length ? (
            <VideoGallery videos={videos} />
          ) : (
            <p className="accent text-xl text-ink-faint">Films coming soon.</p>
          )}
        </GroupSection>
      ) : null}
    </div>
  );
}
