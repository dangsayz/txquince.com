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
export function TxqSite({ journal, films }: { journal: Journal; films: CinemaFilm[] }) {
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

  // Dim the whole page to the film room from the Motion section through the
  // end of Commissions (the booking builder): it darkens as the films rise
  // into view and holds until the bottom of Commissions has mostly scrolled
  // past. The two sections are adjacent, so "either one is in the middle half
  // of the viewport" is one unbroken stretch.
  useEffect(() => {
    const els = [cinemaRef.current, document.getElementById("commissions")].filter(
      (el): el is HTMLElement => !!el,
    );
    if (!els.length) return;
    const inView = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inView.add(e.target);
          else inView.delete(e.target);
        }
        setCinema(inView.size > 0);
      },
      { rootMargin: "-25% 0px -25% 0px" },
    );
    els.forEach((el) => io.observe(el));
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
      <Hero ref={heroRef} live={heroLive} />
      <Archive />
      <CinemaRoom ref={cinemaRef} films={films} />
      <Commissions />
      <Editorial journal={journal} />
      <Faq />
      <Intake ref={intakeRef} />
    </>
  );
}
