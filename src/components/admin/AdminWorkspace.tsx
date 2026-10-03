"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

const mainLinks = [
  { href: "/admin", label: "Today" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/portfolio", label: "Website" },
] as const;

const websiteLinks = [
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/videos", label: "Films" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/hero", label: "Page imagery" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || (href === "/admin/inquiries" && pathname.startsWith("/admin/inquiries/"));
}

function MainNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const websiteActive = websiteLinks.some((link) => isActive(pathname, link.href));

  return mainLinks.map((link) => {
    const active = link.label === "Website" ? websiteActive : isActive(pathname, link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        aria-current={active && link.label !== "Website" ? "page" : undefined}
        className={`inline-flex min-h-12 items-center border-b-2 px-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${active ? "border-[#222] font-semibold text-[#222]" : "border-transparent text-[#62625f] hover:text-[#222]"}`}
      >
        {link.label}
      </Link>
    );
  });
}

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const websiteActive = websiteLinks.some((link) => isActive(pathname, link.href));

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  if (pathname === "/admin/login" || pathname === "/admin/reset-password") return <>{children}</>;

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      const response = await fetch("/api/admin/signout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#fafaf9] text-[#242424]">
      <header className="relative z-30 border-b border-[#e7e7e5] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-[96rem] items-center gap-7 px-5 sm:px-8 lg:px-12">
          <Link href="/admin" className="group inline-flex min-h-11 shrink-0 items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" aria-label="TX Quince Studio, Today">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center bg-[#242424] text-[11px] font-semibold tracking-[-0.08em] text-white">TQ</span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-[-0.03em] group-hover:text-[#62625f]">TX Quince</span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-[#62625f]">Studio</span>
            </span>
          </Link>

          <nav aria-label="Studio navigation" className="hidden min-h-[76px] items-stretch gap-5 lg:flex xl:gap-8">
            <MainNavigation pathname={pathname} />
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-5 lg:flex">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-[#62625f] hover:text-[#222] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
              View website <span aria-hidden="true" className="ml-1.5">↗</span>
            </Link>
            <span aria-hidden="true" className="h-5 w-px bg-[#e5e5e3]" />
            <button type="button" disabled={signingOut} onClick={signOut} className="inline-flex min-h-11 items-center text-sm font-medium hover:text-[#62625f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50">
              {signingOut ? "Leaving…" : "Sign out"}
            </button>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Close studio navigation" : "Open studio navigation"}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "studio-mobile-navigation" : undefined}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center border border-[#dededb] text-xl leading-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black lg:hidden"
          >
            <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
          </button>
        </div>

        {websiteActive && (
          <nav aria-label="Website management" className="hidden border-t border-[#f0f0ee] lg:block">
            <div className="mx-auto flex max-w-[96rem] items-center gap-7 px-5 sm:px-8 lg:px-12">
              <span className="mr-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Website</span>
              {websiteLinks.map((link) => (
                <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${isActive(pathname, link.href) ? "border-[#222] font-medium text-[#222]" : "border-transparent text-[#6e6e6a] hover:text-[#222]"}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {menuOpen && (
          <nav id="studio-mobile-navigation" aria-label="Studio navigation" className="absolute left-0 right-0 top-full max-h-[calc(100dvh-76px)] overflow-y-auto border-b border-[#e7e7e5] bg-white px-5 pb-7 shadow-lg lg:hidden sm:px-8">
            <div className="flex flex-col border-t border-[#efefed] py-3">
              <MainNavigation pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </div>
            <p className="border-t border-[#efefed] pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#62625f]">Manage website</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4">
              {websiteLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`inline-flex min-h-12 items-center border-b border-[#efefed] text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${isActive(pathname, link.href) ? "font-semibold text-[#222]" : "text-[#62625f]"}`}>{link.label}</Link>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#efefed] pt-4 text-sm">
              <Link href="/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="inline-flex min-h-11 items-center text-[#62625f]">View website ↗</Link>
              <button type="button" disabled={signingOut} onClick={signOut} className="inline-flex min-h-11 items-center font-medium disabled:opacity-50">{signingOut ? "Leaving…" : "Sign out"}</button>
            </div>
          </nav>
        )}
      </header>
      {signOutError && <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 sm:px-8">Could not sign out. Please try again.</p>}
      {children}
    </div>
  );
}
