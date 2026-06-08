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
  if (HIDE_ON.has(pathname)) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 p-3 backdrop-blur-md md:hidden">
      <Link
        href={site.cta.href}
        className="flex w-full items-center justify-center rounded-full bg-wine px-6 py-3.5 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition-colors hover:bg-wine-deep"
      >
        {site.cta.label}
      </Link>
    </div>
  );
}
