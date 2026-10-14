"use client";

import { useEffect, useRef, useState } from "react";
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
export function TxqSite({
  journal,
  films,
  fontClass,
}: {
  journal: Journal;
  films: CinemaFilm[];
  /** The hero's condensed face (fonts.ts), loaded by the page so only homepages preload it. */
  fontClass: string;
}) {
  const { setCinema, setDockHidden, setHeroBar } = useShell();
  const heroRef = useRef<HTMLElement>(null);
  const cinemaRef = useRef<HTMLElement>(null);
  const intakeRef = useRef<HTMLElement>(null);
  const [heroLive, setHeroLive] = useState(true);
  const [intakeOn, setIntakeOn] = useState(false);

  // The hero is "live" while it still holds the top of the screen: its floating
  // bar stands in for the header and its slideshow runs.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setHeroLive(e.isIntersecting), {
      rootMargin: "0px 0px -85% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setHeroBar(heroLive);
  }, [heroLive, setHeroBar]);
  useEffect(() => () => setHeroBar(false), [setHeroBar]);

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

  // The mobile dock steps aside over the hero (its bar carries the action, and
  // the pagination owns the bottom edge) and once the intake is on screen.
  useEffect(() => {
    const el = intakeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setIntakeOn(e.isIntersecting), {
      rootMargin: "0px 0px -30% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setDockHidden(heroLive || intakeOn);
  }, [heroLive, intakeOn, setDockHidden]);
  useEffect(() => () => setDockHidden(false), [setDockHidden]);

  return (
    <>
      <Hero ref={heroRef} live={heroLive} fontClass={fontClass} />
      <Archive />
      <CinemaRoom ref={cinemaRef} films={films} />
      <Commissions />
      <Editorial journal={journal} />
      <Faq />
      <Intake ref={intakeRef} />
    </>
  );
}
