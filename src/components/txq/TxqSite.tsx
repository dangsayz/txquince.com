"use client";

import { useEffect, useRef } from "react";
import { Archive } from "./Archive";
import { CinemaRoom } from "./CinemaRoom";
import { Commissions } from "./Commissions";
import { Editorial, Faq, type Journal } from "./Editorial";
import { Hero } from "./Hero";
import { Intake } from "./Intake";
import { PhotoDump } from "./PhotoDump";
import { WhereWeWork } from "./WhereWeWork";
import { useShell } from "./SiteShell";
import type { CinemaFilm } from "./data";
import type { FeedPage, HomeOverrides } from "@/lib/photo-dump-shared";
import type { HomeGallery } from "@/lib/home-galleries";
import type { HomeCity } from "@/content/home-places";
import "./home-trust.css";

/**
 * The homepage sections (EN at /, ES at /es). The global header, footer, dock,
 * fonts and language state come from <SiteShell>, which wraps every page.
 */
export function TxqSite({
  journal,
  films,
  photos = null,
  overrides = {},
  galleries = [],
  cities = [],
}: {
  journal: Journal;
  films: CinemaFilm[];
  /** First page of the Photo dump ("Latest photos"); null = storage unreachable. */
  photos?: FeedPage | null;
  /** Admin swaps for the hero images, chosen from the Photo dump. */
  overrides?: HomeOverrides;
  /** Real portfolio galleries for the homepage gallery section (server-grouped). */
  galleries?: HomeGallery[];
  /** City pages for the "Where we work" row. */
  cities?: HomeCity[];
}) {
  const { setCinema, setDockHidden } = useShell();
  const cinemaRef = useRef<HTMLElement>(null);
  const intakeRef = useRef<HTMLDivElement>(null);

  // Dim the whole page to the film room while the Motion section holds the
  // middle of the viewport.
  useEffect(() => {
    const el = cinemaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCinema(e.isIntersecting), {
      rootMargin: "-45% 0px -45% 0px",
    });
    io.observe(el);
    return () => {
      io.disconnect();
      setCinema(false);
    };
  }, [setCinema]);

  // The mobile dock steps aside while the booking panel is on screen (the
  // panel has its own total · Next bar).
  useEffect(() => {
    const el = intakeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDockHidden(e.isIntersecting), {
      rootMargin: "0px 0px -30% 0px",
    });
    io.observe(el);
    return () => {
      io.disconnect();
      setDockHidden(false);
    };
  }, [setDockHidden]);

  return (
    <>
      <Hero overrides={overrides} />
      <Archive galleries={galleries} photos={photos?.photos ?? null} />
      <PhotoDump initial={photos} />
      <CinemaRoom ref={cinemaRef} films={films} />
      {/* Packages & Prices and the booking steps are one panel. */}
      <Commissions>
        <Intake ref={intakeRef} />
      </Commissions>
      <Editorial journal={journal} />
      <Faq />
      <WhereWeWork cities={cities} />
    </>
  );
}
