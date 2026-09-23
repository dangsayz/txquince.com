"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

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
    <div key={section.label} className="mb-8">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {section.label}
      </p>
      <div className="space-y-1">
        {section.links.map((link) => {
          const active = pathname === link.href || (link.href === "/admin/inquiries" && pathname.startsWith("/admin/inquiries/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center justify-between rounded-xl px-3 text-base transition-colors ${active ? "bg-ink text-white" : "text-ink-soft hover:bg-greige hover:text-ink"}`}
            >
              {link.label}
              {active && <span aria-hidden="true" className="text-cream/70">↗</span>}
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
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-white px-4 py-7 lg:flex xl:w-64">
        <Link href="/admin" className="mb-12 block px-3" aria-label="TX Quince Studio, Today">
          <span className="block font-serif text-4xl leading-none">TX</span>
          <span className="mt-1 block text-xs font-semibold uppercase tracking-[0.22em]">Quince Studio</span>
        </Link>
        <nav aria-label="Studio navigation"><WorkspaceLinks pathname={pathname} /></nav>
        <div className="mt-auto border-t border-line px-3 pt-6">
          <p className="text-sm font-medium">One celebration at a time.</p>
          <p className="mt-1 text-sm text-ink-soft">Keep every family close.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="relative z-30 flex min-h-18 items-center justify-between gap-3 border-b border-line bg-white px-4 sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open studio navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl border border-line text-xl lg:hidden"
            >
              {menuOpen ? "×" : "☰"}
            </button>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">TX Quince Studio</p>
              <p className="truncate text-base font-semibold">{current?.label ?? "Client record"}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link href="/" target="_blank" className="inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium text-ink-soft hover:text-ink">
              <span className="hidden sm:inline">View website</span><span className="sm:hidden">Site</span> ↗
            </Link>
            <button type="button" disabled={signingOut} onClick={signOut} className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line px-4 text-sm font-medium hover:border-ink disabled:opacity-50">
              {signingOut ? "Leaving…" : "Sign out"}
            </button>
          </div>
          {menuOpen && (
            <nav aria-label="Studio navigation" className="absolute left-0 right-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-b border-line bg-white px-4 py-5 shadow-lg lg:hidden">
              <WorkspaceLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            </nav>
          )}
        </header>
        {signOutError && <p role="alert" className="bg-red-50 px-4 py-3 text-sm text-red-800 sm:px-8">Could not sign out. Please try again.</p>}
        {children}
      </div>
    </div>
  );
}
