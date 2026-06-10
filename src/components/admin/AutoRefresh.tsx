"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-fetches the dashboard's server data on an interval (skips hidden tabs). */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) router.refresh();
    }, seconds * 1000);
    return () => window.clearInterval(id);
  }, [router, seconds]);
  return null;
}
