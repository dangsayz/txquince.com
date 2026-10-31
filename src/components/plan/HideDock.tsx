"use client";

import { useEffect } from "react";
import { useShell } from "@/components/txq/SiteShell";

/**
 * Plan pages have their own money action ("Hold my date"); the site-wide
 * mobile dock ("Reserve your date" → homepage) would compete with it and
 * cover the bottom of the page, so it steps aside here.
 */
export function HideDock() {
  const { setDockHidden } = useShell();
  useEffect(() => {
    setDockHidden(true);
    return () => setDockHidden(false);
  }, [setDockHidden]);
  return null;
}
