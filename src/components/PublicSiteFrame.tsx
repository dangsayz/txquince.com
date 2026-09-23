"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export function PublicSiteFrame({ children }: { children: ReactNode }) {
  const isAdmin = usePathname().startsWith("/admin");

  return (
    <>
      {!isAdmin && <Nav />}
      <main className="flex-1">{children}</main>
      {!isAdmin && <Footer />}
    </>
  );
}
