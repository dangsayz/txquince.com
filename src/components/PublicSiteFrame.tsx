"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteShell } from "@/components/txq/SiteShell";

/**
 * Every public page renders inside the one global shell (header, footer,
 * mobile dock, type and color system). Admin keeps its own workspace chrome.
 */
export function PublicSiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin")) return <main className="flex-1">{children}</main>;
  return <SiteShell>{children}</SiteShell>;
}
