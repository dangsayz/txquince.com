"use client";

import { useEffect, useState } from "react";

/**
 * After a deploy, a tab opened earlier still asks for the old build's script
 * files, which no longer exist (404). Next.js throws a chunk-load error and
 * the error page shows. A full reload fetches the new build and the page just
 * works, so the error pages do that once, quietly, before showing anything.
 */
const RELOAD_KEY = "txq_chunk_reload";

export function isStaleBuild(error: Error | undefined): boolean {
  const text = `${error?.name ?? ""} ${error?.message ?? ""}`;
  return /ChunkLoadError|Loading (CSS )?chunk|Failed to load chunk|dynamically imported module|Importing a module script failed|error loading dynamically/i.test(text);
}

/** Returns [reloading, retry]. While `reloading` is true, render a blank spacer. */
export function useStaleBuildReload(error: Error | undefined, reset: () => void): [boolean, () => void] {
  const stale = isStaleBuild(error);
  const [reloading, setReloading] = useState(stale);

  useEffect(() => {
    if (!stale) return;
    try {
      // At most one automatic reload a minute, so a real outage can't loop.
      const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
      if (Date.now() - last < 60_000) {
        setReloading(false);
        return;
      }
      window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    } catch {
      /* storage blocked: still reload once */
    }
    window.location.reload();
  }, [stale]);

  // "Try again" on a stale build needs the new files, so it reloads the page.
  const retry = () => (stale ? window.location.reload() : reset());
  return [reloading, retry];
}
