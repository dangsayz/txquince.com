"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

const HIDE_ON = new Set([
  site.cta.href,
  site.secondaryCta.href,
  "/reserve/success",
  "/thank-you",
  "/styleguide",
]);

export function StickyMobileCTA() {
  const pathname = usePathname();
  if (HIDE_ON.has(pathname) || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md md:hidden">
      <Link
        href={site.cta.href}
        className="flex min-h-12 w-full items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        {site.cta.label}
      </Link>
    </div>
  );
}
