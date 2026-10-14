"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { Footer } from "./Editorial";
import { Header, MobileDock } from "./Header";
import { NoUpscale } from "./NoUpscale";
import { AvailabilityProvider, SiteProvider, useSite } from "./state";
import "./txq.css";

/**
 * SiteShell — the ONE frame every public page renders inside: the global
 * header, footer and mobile booking dock, the type and color system, and the
 * language/availability state. The homepage adds its sections inside it; every
 * other route's content becomes <main>. There is no other site chrome.
 */

type ShellControls = {
  /** Dim the whole frame to the film room (homepage Cinema Room). */
  setCinema: (on: boolean) => void;
  /** Hide the mobile dock (e.g. while the intake form is on screen). */
  setDockHidden: (hidden: boolean) => void;
};

const ShellCtx = createContext<ShellControls>({ setCinema: () => {}, setDockHidden: () => {} });
export const useShell = () => useContext(ShellCtx);

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/" || pathname === "/es";
  const urlLang = pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";

  return (
    <SiteProvider urlLang={urlLang} isHome={isHome}>
      <AvailabilityProvider>
        <MotionConfig reducedMotion="user">
          <Frame key={pathname}>{children}</Frame>
        </MotionConfig>
      </AvailabilityProvider>
    </SiteProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const { lang, t } = useSite();
  const [cinema, setCinema] = useState(false);
  const [dockHidden, setDockHidden] = useState(false);
  const controls = useMemo(() => ({ setCinema, setDockHidden }), []);

  // Keep the document language in step with the visible language.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <ShellCtx.Provider value={controls}>
      <div className="txq" data-theme={cinema ? "cinema" : "light"} lang={lang}>
        <a href="#content" className="tq-skip">
          {t.meta.skip}
        </a>
        <Header />
        <main id="content" className="tq-main">
          {children}
        </main>
        <Footer />
        <MobileDock hidden={dockHidden} />
        {/* Global rule: no photo is ever displayed larger than its real pixels. */}
        <NoUpscale />
      </div>
    </ShellCtx.Provider>
  );
}
