"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

/**
 * Thumb-reachable sticky CTA on every page (CONVERSION MECHANICS LAW), mobile
 * only. Hidden on the conversion pages themselves (reserve / inquiry) and on
 * their confirmation pages — you're already there or just finished.
 */
const HIDE_ON = new Set([
  site.cta.href, // /reserve
  site.secondaryCta.href, // /check-your-date
  "/reserve/success",
  "/thank-you",
]);

export function StickyMobileCTA() {
  const pathname = usePathname();
  // Never show on conversion pages, or anywhere in the admin dashboard (the
  // bar would overlap admin controls at the bottom of the screen on mobile).
  if (HIDE_ON.has(pathname) || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <Link href={site.secondaryCta.href} className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-white">
        Check her date <span aria-hidden className="ml-2">→</span>
      </Link>
    </div>
  );
}
