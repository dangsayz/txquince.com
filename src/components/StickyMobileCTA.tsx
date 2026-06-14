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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 p-3 backdrop-blur-md md:hidden">
      {/* Uses the site-wide primary pill so the main CTA looks identical everywhere. */}
      <Link href={site.cta.href} className="btn-espresso w-full">
        {site.cta.label}
      </Link>
    </div>
  );
}
