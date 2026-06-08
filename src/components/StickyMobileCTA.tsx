"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

/**
 * Thumb-reachable sticky CTA on every page (CONVERSION MECHANICS LAW), mobile
 * only. Hidden on the form page itself (you're already there) and on /thank-you.
 */
export function StickyMobileCTA() {
  const pathname = usePathname();
  const hidden = pathname === site.cta.href || pathname === "/thank-you";
  if (hidden) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 p-3 backdrop-blur-md md:hidden">
      <Link
        href={site.cta.href}
        className="flex w-full items-center justify-center bg-wine px-6 py-3.5 text-sm tracking-wide text-cream transition-colors hover:bg-wine-deep"
      >
        {site.cta.label}
      </Link>
    </div>
  );
}
