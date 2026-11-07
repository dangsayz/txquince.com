"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MenuIcon } from "@/components/admin/StudioIcons";

const mainLinks = [
  { href: "/admin", label: "Today" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/website", label: "Website" },
] as const;

const websiteLinks = [
  { href: "/admin/website", label: "Overview" },
  { href: "/admin/photos", label: "Photo dump" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/videos", label: "Films" },
  { href: "/admin/hero", label: "Page imagery" },
  { href: "/admin/images", label: "Every image" },
  { href: "/admin/prices", label: "Prices" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/price-guide", label: "Price guide" },
  { href: "/admin/venues", label: "Venues" },
] as const;

function isActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href === "/admin/inquiries" && pathname.startsWith("/admin/inquiries/")) ||
    (href === "/admin/plans" && pathname === "/admin/availability")
  );
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
        data-on={active || undefined}
        className="st-nav"
      >
        {link.label}
      </Link>
    );
  });
}

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
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
      // Clear the session on the server (cookies) AND in the browser client,
      // drop the "this browser is an admin" hint, then land on the homepage.
      const response = await fetch("/api/admin/signout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed");
      const supabase = await createBrowserSupabaseClient();
      await supabase.auth.signOut().catch(() => undefined);
      try {
        window.localStorage.removeItem("txq_admin");
      } catch {
        /* ignore */
      }
      // Full navigation so no signed-in state survives in memory.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- a hard reload is the point here
      window.location.assign("/");
    } catch {
      setSignOutError(true);
      setSigningOut(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--tq-canvas)] text-[var(--tq-ink)]">
      <header className="relative z-30 border-b border-[var(--tq-surface-2)] bg-[var(--tq-canvas)]">
        <div className="mx-auto flex min-h-16 max-w-[96rem] items-center gap-5 px-4 sm:px-8 xl:max-w-[72rem]">
          <Link href="/admin" className="mr-6 inline-flex min-h-11 shrink-0 items-center whitespace-nowrap" aria-label="TX Quince Studio, Today">
            <span className="inline-flex items-baseline gap-2.5">
            <span aria-hidden="true" className="font-[family-name:var(--tq-font-label)] text-base font-medium uppercase tracking-[0.22em]">TX Quince</span>
            <span aria-hidden="true" className="text-[13px] text-[var(--tq-ink-mute)]">Studio</span>
            </span>
          </Link>

          <nav aria-label="Studio navigation" className="hidden items-center gap-1 lg:flex">
            <MainNavigation pathname={pathname} />
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-1 lg:flex">
            <Link href="/" target="_blank" rel="noopener noreferrer" className="st-nav">
              View site <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span>
            </Link>
            <button type="button" disabled={signingOut} onClick={signOut} className="st-nav">
              {signingOut ? "Logging out…" : "Log out"}
            </button>
          </div>


          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Close studio navigation" : "Open studio navigation"}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? "studio-mobile-navigation" : undefined}
            onClick={() => setMenuOpen((open) => !open)}
            className="ml-auto inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--tq-stone)] transition-colors duration-[var(--tq-dur-fast)] hover:bg-[var(--tq-surface)] lg:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>

        {websiteActive && (
          <nav aria-label="Website management" className="hidden lg:block">
            <div className="mx-auto flex max-w-[96rem] items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:px-8 xl:max-w-[72rem]">
              {websiteLinks.map((link) => (
                <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className="st-subnav">
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {menuOpen && (
          <nav id="studio-mobile-navigation" aria-label="Studio navigation" className="st-menu absolute left-0 right-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-[var(--tq-surface-2)] bg-[var(--tq-canvas)] px-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] shadow-[var(--tq-shadow-overlay)] sm:px-8 lg:hidden">
            <div className="flex flex-col gap-1 border-t border-[var(--tq-surface-2)] py-3">
              <MainNavigation pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </div>
            <p className="m-0 border-t border-[var(--tq-surface-2)] pt-4 text-[13px] text-[var(--tq-ink-mute)]">Website pages</p>
            <div className="mt-2 grid grid-cols-2 gap-1">
              {websiteLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={isActive(pathname, link.href) ? "page" : undefined} className="st-nav">{link.label}</Link>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--tq-surface-2)] pt-4">
              <Link href="/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)} className="st-nav">View site <span aria-hidden="true">↗</span><span className="sr-only">(opens in a new tab)</span></Link>
              <button type="button" disabled={signingOut} onClick={signOut} className="st-nav">{signingOut ? "Logging out…" : "Log out"}</button>
            </div>
          </nav>
        )}
      </header>
      {signOutError && <p role="alert" className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 sm:px-8">Could not log out. Please try again.</p>}
      {children}
    </div>
  );
}
