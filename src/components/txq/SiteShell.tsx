"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";
import { MobileDock } from "./Header";
import { SiteFooter, SiteHeader } from "@/components/home/Chrome";
import { NoUpscale } from "./NoUpscale";
import { AvailabilityProvider, SiteProvider, useSite } from "./state";
import { PriceBookProvider } from "@/components/PriceBookProvider";
import type { PriceBook } from "@/lib/commission";
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

/** Spanish pages that live outside /es (their URL is the Spanish search phrase). */
const SPANISH_ROOT_PATHS = new Set(["/precios-quince-dfw"]);

export function SiteShell({ children, book }: { children: ReactNode; book: PriceBook }) {
  const pathname = usePathname() || "/";
  const isHome = pathname === "/" || pathname === "/es";
  const urlLang = pathname === "/es" || pathname.startsWith("/es/") || SPANISH_ROOT_PATHS.has(pathname) ? "es" : "en";

  return (
    <PriceBookProvider book={book}>
      <SiteProvider urlLang={urlLang} isHome={isHome}>
        <AvailabilityProvider>
          <MotionConfig reducedMotion="user">
            {/* A client's private review link is not a sales page: no booking dock, not even for a frame. */}
            <Frame key={pathname} dockStartsHidden={isHome || pathname.startsWith("/review/")}>
              {children}
            </Frame>
          </MotionConfig>
        </AvailabilityProvider>
      </SiteProvider>
    </PriceBookProvider>
  );
}

/*
 * Scroll on page change. Frame remounts for every new path, so a forward
 * navigation (clicking a post, a menu link) starts at the top of the new page,
 * even after a long scroll on the last one. Back/forward (popstate) and links
 * to a #section keep the browser's own position. The first load is left alone
 * so a reload stays where it was.
 */
let firstFrame = true;
let poppedAt = 0;
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => (poppedAt = Date.now()));
}
function useScrollTopOnNewPage() {
  useLayoutEffect(() => {
    if (firstFrame) {
      firstFrame = false;
      return;
    }
    if (Date.now() - poppedAt < 1500 || window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);
}

function Frame({ children, dockStartsHidden }: { children: ReactNode; dockStartsHidden: boolean }) {
  useScrollTopOnNewPage();
  const { lang, t } = useSite();
  const [cinema, setCinema] = useState(false);
  // The homepage hero carries its own Reserve button, so there the dock starts
  // hidden (also in the server HTML, so it never flashes in on load) and
  // slides in once the hero is scrolled past (see EditorialHome).
  const [dockHidden, setDockHidden] = useState(dockStartsHidden);
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
        <SiteHeader />
        <main id="content" className="tq-main">
          {children}
        </main>
        <SiteFooter />
        <MobileDock hidden={dockHidden} />
        {/* Global rule: no photo is ever displayed larger than its real pixels. */}
        <NoUpscale />
      </div>
    </ShellCtx.Provider>
  );
}
