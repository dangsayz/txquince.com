"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
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
    <header className="sticky top-0 z-30 border-b border-line bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-lg text-ink">
            TX Quince <span className="text-ink-faint">· Admin</span>
          </Link>
          <nav className="hidden gap-5 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[0.72rem] uppercase tracking-[0.16em] transition-colors hover:text-wine ${
                  pathname === l.href ? "text-ink" : "text-ink-soft"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="text-[0.72rem] uppercase tracking-[0.16em] text-ink-soft hover:text-wine"
          >
            View site ↗
          </Link>
          <button
            onClick={signOut}
            className="rounded-full border border-line px-4 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft hover:border-wine hover:text-wine"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
