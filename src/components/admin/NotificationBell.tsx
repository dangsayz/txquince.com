"use client";

/**
 * NotificationBell — the Studio's live bell (header, every Studio page).
 *
 * Asks /api/admin/notifications every 20 seconds while the tab is visible.
 * A red count shows what is newer than the last time the bell was opened.
 * When something new arrives while the page is open: the count pops, a short
 * toast names it, and the page's own data is re-read (router.refresh), so the
 * dashboard under it is current too. Opening the bell marks everything seen.
 * Refs (Mobbin): see the pull request. Motion: transitions.dev notification
 * badge + menu dropdown, on the brand kit's ease and durations.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BellIcon } from "@/components/admin/StudioIcons";
import { badgeText, KIND_HUE, KIND_LABEL, timeAgo, unreadCount, type Notice } from "@/lib/notifications";

const POLL_MS = 20_000;
const TOAST_MS = 7_000;
type Feed = { items: Notice[]; seenAt: string | null };

export function NotificationBell() {
  const router = useRouter();
  const pathname = usePathname();
  const [feed, setFeed] = useState<Feed | null>(null);
  const [open, setOpen] = useState(false);
  /** seenAt as it was when the panel opened, so new rows stay marked while it is open. */
  const [openSeen, setOpenSeen] = useState<string | null>(null);
  const [toast, setToast] = useState<{ notice: Notice; more: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const known = useRef<Set<string> | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/notifications", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return;
    const data = (await res.json().catch(() => null)) as Feed | null;
    if (!data?.items) return;
    setNow(Date.now());
    const before = known.current;
    known.current = new Set(data.items.map((n) => n.id));
    if (before) {
      const fresh = data.items.filter((n) => !before.has(n.id) && (!data.seenAt || n.at > data.seenAt));
      if (fresh.length) {
        setToast({ notice: fresh[0], more: fresh.length - 1 });
        router.refresh();
      }
    }
    setFeed(data);
  }, [router]);

  // Poll while the tab is visible; catch up at once when it becomes visible again.
  useEffect(() => {
    const first = window.setTimeout(load, 0);
    const id = window.setInterval(() => {
      if (!document.hidden) load();
    }, POLL_MS);
    const onShow = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onShow);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  const unread = feed ? unreadCount(feed.items, feed.seenAt) : 0;

  // The count also shows in the browser tab: "(3) TX Quince Studio".
  // Next rewrites the title on navigation and refresh, so it is kept in step.
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(/^\(\d+\+?\)\s/, "");
      const want = unread ? `(${badgeText(unread)}) ${base}` : base;
      if (document.title !== want) document.title = want;
    };
    apply();
    const watch = new MutationObserver(apply);
    watch.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => watch.disconnect();
  }, [unread, pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  async function toggle() {
    if (open) return setOpen(false);
    setOpenSeen(feed?.seenAt ?? null);
    setOpen(true);
    setToast(null);
    setNow(Date.now());
    if (!unread) return;
    const res = await fetch("/api/admin/notifications", { method: "POST" }).catch(() => null);
    const data = res?.ok ? ((await res.json().catch(() => null)) as { seenAt?: string } | null) : null;
    if (data?.seenAt) setFeed((f) => (f ? { ...f, seenAt: data.seenAt! } : f));
  }

  const items = feed?.items ?? [];
  const isNew = (n: Notice) => !openSeen || n.at > openSeen;

  return (
    <div ref={wrap} className="st-bell-wrap">
      <button
        ref={button}
        type="button"
        className="st-bell"
        aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
        aria-expanded={open}
        aria-controls={open ? "studio-notifications" : undefined}
        onClick={toggle}
      >
        <BellIcon />
        <span className="st-bell__badge" data-open={unread > 0} aria-hidden="true">
          <span className="st-bell__dot">{badgeText(unread || 1)}</span>
        </span>
      </button>

      {open ? (
        <section id="studio-notifications" aria-label="Notifications" className="st-notes">
          <h2 className="st-notes__title">Notifications</h2>
          {items.length ? (
            <ul className="st-notes__list">
              {items.map((n) => {
                const body = (
                  <>
                    <span className="st-notes__meta">
                      {isNew(n) ? <span className="st-notes__new" aria-hidden="true" /> : null}
                      <span className="st-chip" data-hue={KIND_HUE[n.kind]}>{KIND_LABEL[n.kind]}</span>
                      <time dateTime={n.at}>{timeAgo(n.at, now)}</time>
                      {isNew(n) ? <span className="sr-only">New</span> : null}
                    </span>
                    <span className="st-notes__head">{n.title}</span>
                    {n.detail ? <span className="st-notes__detail">{n.detail}</span> : null}
                  </>
                );
                return (
                  <li key={n.id} data-new={isNew(n) || undefined}>
                    {n.href ? (
                      <Link href={n.href} className="st-notes__row" onClick={() => setOpen(false)}>
                        {body}
                      </Link>
                    ) : (
                      <div className="st-notes__row">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="st-notes__empty">{feed ? "Nothing in the last 14 days. New inquiries, bookings, comments and reviews show up here." : "Loading…"}</p>
          )}
        </section>
      ) : null}

      <div role="status" aria-live="polite" className="st-toast-slot">
        {toast && !open ? (
          <div className="st-toast">
            <span className="st-notes__new" aria-hidden="true" />
            <span className="min-w-0">
              <span className="st-notes__head">{toast.notice.title}</span>
              {toast.more ? <span className="st-notes__detail">and {toast.more} more</span> : toast.notice.detail ? <span className="st-notes__detail">{toast.notice.detail}</span> : null}
            </span>
            {toast.notice.href ? (
              <Link href={toast.notice.href} className="st-btn-ghost" onClick={() => setToast(null)}>
                Open
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
