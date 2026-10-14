"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** New requests + unread family messages, next to "Bookings" in the studio nav. */
export function InboxBadge() {
  const pathname = usePathname();
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/admin/bookings/inbox", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { total: 0 }))
        .then((d: { total?: number }) => alive && setN(d.total ?? 0))
        .catch(() => undefined);
    void load();
    const t = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(t);
    };
  }, [pathname]);
  if (!n) return null;
  return (
    <span className="ml-2 inline-flex min-w-6 items-center justify-center bg-[#111110] px-1.5 text-xs font-semibold leading-6 text-white" aria-label={`${n} need attention`}>
      {n > 99 ? "99+" : n}
    </span>
  );
}
