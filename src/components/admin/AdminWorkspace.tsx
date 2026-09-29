"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

const sections = [
  {
    label: "Client work",
    links: [
      { href: "/admin", label: "Today" },
      { href: "/admin/inquiries", label: "Inquiries" },
      { href: "/admin/bookings", label: "Bookings" },
    ],
  },
  {
    label: "Business",
    links: [{ href: "/admin/insights", label: "Insights" }],
  },
  {
    label: "Website",
    links: [
      { href: "/admin/portfolio", label: "Portfolio" },
      { href: "/admin/videos", label: "Films" },
      { href: "/admin/venues", label: "Venues" },
      { href: "/admin/hero", label: "Page imagery" },
    ],
  },
] as const;

function WorkspaceLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return sections.map((section) => (
    <div key={section.label} className="mb-6">
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">
        {section.label}
      </p>
      <div className="space-y-0.5">
        {section.links.map((link) => {
          const active = pathname === link.href || (link.href === "/admin/inquiries" && pathname.startsWith("/admin/inquiries/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-11 items-center justify-between rounded-md px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${active ? "bg-accent-soft font-medium text-ink" : "text-ink-soft hover:bg-ivory hover:text-ink"}`}
            >
              {link.label}
              {active && <span aria-hidden="true" className="text-ink-faint">↗</span>}
            </Link>
          );
        })}
      </div>
    </div>
  ));
}

export function AdminWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  const current = sections.flatMap<{ href: string; label: string }>((section) => section.links).find((link) =>
    link.href === pathname || (link.href === "/admin/inquiries" && pathname.startsWith("/admin/inquiries/")),
  );

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
    <div className="flex min-h-dvh bg-cream text-ink">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col overflow-y-auto border-r border-line bg-white px-3 py-5 lg:flex xl:w-60">
        <Link href="/admin" className="mb-9 flex min-h-11 items-center gap-2.5 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label="TX Quince Studio, Today">
          <span className="font-display text-lg font-semibold tracking-[-0.04em]">TX Quince</span>
          <span className="rounded border border-line px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-ink-soft">Studio</span>
        </Link>
        <nav aria-label="Studio navigation"><WorkspaceLinks pathname={pathname} /></nav>
        <div className="mt-auto border-t border-line px-3 pt-5">
          <p className="text-base font-medium">Your workspace</p>
          <p className="mt-1 text-base text-ink-soft">Clients, bookings, and imagery.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="relative z-30 flex min-h-[68px] items-center justify-between gap-2 border-b border-line bg-white px-4 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={menuOpen ? "Close studio navigation" : "Open studio navigation"}
              aria-expanded={menuOpen}
              aria-controls={menuOpen ? "studio-mobile-navigation" : undefined}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-line text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
            >
              {menuOpen ? "×" : "☰"}
            </button>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-faint">Studio</p>
              <p className="truncate text-base font-medium">{current?.label ?? "Client record"}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link href="/" target="_blank" className="inline-flex min-h-11 items-center whitespace-nowrap px-1 text-base text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              <span className="hidden sm:inline">View website</span><span className="sm:hidden">Site</span> ↗
            </Link>
            <button type="button" disabled={signingOut} onClick={signOut} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md border border-line px-3 text-base font-medium hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50">
              {signingOut ? "Leaving…" : "Sign out"}
            </button>
          </div>
          {menuOpen && (
            <nav id="studio-mobile-navigation" aria-label="Studio navigation" className="absolute left-0 right-0 top-full max-h-[calc(100dvh-68px)] overflow-y-auto border-b border-line bg-white px-4 py-5 shadow-md lg:hidden">
              <WorkspaceLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </nav>
          )}
        </header>
        {signOutError && <p role="alert" className="bg-red-50 px-4 py-3 text-base text-red-800 sm:px-8">Could not sign out. Please try again.</p>}
        {children}
      </div>
    </div>
  );
}
