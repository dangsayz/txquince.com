"use client";

import { Instrument_Serif, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";
import { Archive } from "./Archive";
import { CinemaRoom } from "./CinemaRoom";
import { Commissions } from "./Commissions";
import { Editorial, Faq, Footer } from "./Editorial";
import { Header, MobileDock } from "./Header";
import { Hero } from "./Hero";
import { Intake } from "./Intake";
import { AvailabilityProvider, SiteProvider, useSite } from "./state";
import "./txq.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-txq-display",
  display: "swap",
});
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-txq-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-txq-mono",
  display: "swap",
});

export function TxqSite() {
  return (
    <SiteProvider>
      <AvailabilityProvider>
        <MotionConfig reducedMotion="user">
          <Shell />
        </MotionConfig>
      </AvailabilityProvider>
    </SiteProvider>
  );
}

function Shell() {
  const { lang, t } = useSite();
  const cinemaRef = useRef<HTMLElement>(null);
  const intakeRef = useRef<HTMLElement>(null);
  const [cinema, setCinema] = useState(false);
  const [intakeVisible, setIntakeVisible] = useState(false);

  // Dim the whole page to the film room while the Motion section holds the
  // middle of the viewport.
  useEffect(() => {
    const el = cinemaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setCinema(e.isIntersecting), {
      rootMargin: "-45% 0px -45% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The mobile dock steps aside once the intake itself is on screen.
  useEffect(() => {
    const el = intakeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setIntakeVisible(e.isIntersecting), {
      rootMargin: "0px 0px -30% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`txq ${display.variable} ${sans.variable} ${mono.variable}`}
      data-theme={cinema ? "cinema" : "light"}
      lang={lang}
    >
      <a href="#content" className="tq-skip">
        {t.meta.skip}
      </a>
      <Header />
      <main id="content">
        <Hero />
        <Archive />
        <CinemaRoom ref={cinemaRef} />
        <Commissions />
        <Editorial />
        <Faq />
        <Intake ref={intakeRef} />
      </main>
      <Footer />
      <MobileDock hidden={intakeVisible} />
    </div>
  );
}
