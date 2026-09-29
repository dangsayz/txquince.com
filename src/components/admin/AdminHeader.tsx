"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/inquiries", label: "Leads" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/videos", label: "Videos" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/admin/login") return null;

  async function signOut() {
    await fetch("/api/admin/signout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-[90rem] items-center justify-between gap-4 px-5 md:px-10 lg:px-16">
        <Link href="/admin" className="inline-flex min-h-11 items-center gap-2 text-ink hover:text-accent">
          <span className="font-display text-2xl">TX Quince</span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Studio</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-medium text-ink-soft hover:bg-ivory hover:text-ink sm:px-3">
            View site ↗
          </Link>
          <button type="button" onClick={signOut} className="min-h-11 rounded-lg border border-line px-3 text-xs font-semibold text-ink hover:border-ink hover:bg-ivory sm:px-4">
            Sign out
          </button>
        </div>
      </div>
      <nav aria-label="Admin" className="mx-auto flex max-w-[90rem] gap-1 overflow-x-auto px-5 md:px-10 lg:px-16">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href ? "page" : undefined}
            className={`-mb-px inline-flex min-h-11 shrink-0 items-center border-b-2 px-3 text-sm font-medium transition-colors ${pathname === link.href ? "border-accent text-accent" : "border-transparent text-ink-soft hover:border-line hover:text-ink"}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
