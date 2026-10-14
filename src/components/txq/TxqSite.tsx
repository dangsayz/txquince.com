"use client";

import { useEffect, useRef } from "react";
import { Archive } from "./Archive";
import { CinemaRoom } from "./CinemaRoom";
import { Commissions } from "./Commissions";
import { Editorial, Faq, type Journal } from "./Editorial";
import { Hero } from "./Hero";
import { Intake } from "./Intake";
import { useShell } from "./SiteShell";
import type { CinemaFilm } from "./data";

/**
 * The homepage sections (EN at /, ES at /es). The global header, footer, dock,
 * fonts and language state come from <SiteShell>, which wraps every page.
 */
export function TxqSite({ journal, films }: { journal: Journal; films: CinemaFilm[] }) {
  const { setCinema, setDockHidden } = useShell();
  const cinemaRef = useRef<HTMLElement>(null);
  const intakeRef = useRef<HTMLElement>(null);

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

  // The mobile dock steps aside once the intake itself is on screen.
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
      <Hero />
      <Archive />
      <CinemaRoom ref={cinemaRef} films={films} />
      <Commissions />
      <Editorial journal={journal} />
      <Faq />
      <Intake ref={intakeRef} />
    </>
  );
}
