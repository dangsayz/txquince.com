"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

const HIDE_ON = new Set([
  "/",
  "/es",
  site.cta.href,
  site.secondaryCta.href,
  "/reserve/success",
  "/thank-you",
  "/es/consulta",
  "/es/gracias",
  "/styleguide",
]);

export function StickyMobileCTA() {
  const pathname = usePathname();
  const isSpanish = pathname === "/es" || pathname.startsWith("/es/");
  if (HIDE_ON.has(pathname) || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d8d0c1] bg-[#f8f5ed]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md md:hidden">
      <Link
        href={isSpanish ? "/es/consulta" : "/check-your-date"}
        className="flex min-h-12 w-full items-center justify-between whitespace-nowrap bg-[#29251f] px-5 py-3 text-base font-normal text-white transition-colors hover:bg-[#494033]"
      >
        {isSpanish ? "Consulta su fecha" : "Check her date"} <span aria-hidden className="ml-2">↗</span>
      </Link>
    </div>
  );
}
