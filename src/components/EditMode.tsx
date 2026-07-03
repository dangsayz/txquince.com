"use client";

/**
 * EditMode — admin-only, on-page image editing for the PUBLIC site.
 *
 * When the operator is signed in, every branded image grows a quiet "Frame"
 * control. It opens the full (uncropped) photograph; one click places the
 * focal anchor — the point every crop on the site will keep in frame — and
 * "Replace" swaps the file in place (same permanent slug, links never break).
 *
 * Visitors never see or pay for any of this: the admin probe only fires when
 * a localStorage hint (set by visiting /admin) exists.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

const HINT_KEY = "txq_admin";

let adminCache: boolean | null = null;
let adminPromise: Promise<boolean> | null = null;

function checkAdmin(): Promise<boolean> {
  if (adminCache !== null) return Promise.resolve(adminCache);
  if (typeof window === "undefined") return Promise.resolve(false);
  try {
    if (!window.localStorage.getItem(HINT_KEY)) return Promise.resolve(false);
  } catch {
    return Promise.resolve(false);
  }
  adminPromise ??= fetch("/api/admin/me", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { admin: false }))
    .then((d: { admin?: boolean }) => {
      adminCache = !!d.admin;
      if (!adminCache) {
        try {
          window.localStorage.removeItem(HINT_KEY);
        } catch {
          /* ignore */
        }
      }
      return adminCache;
    })
    .catch(() => (adminCache = false));
  return adminPromise;
}

/**
 * Subscribe to admin status on the PUBLIC site. Returns false for visitors;
 * true once the /api/admin/me probe confirms a signed-in operator. Shares the
 * same module-level cache + localStorage hint as the image editor, so it costs
 * a visitor nothing.
 */
export function useIsAdmin(): boolean {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    let alive = true;
    checkAdmin().then((ok) => alive && setAdmin(ok));
    return () => {
      alive = false;
    };
  }, []);
  return admin;
}

/** Mounted on /admin — marks this browser so the public site offers editing. */
export function AdminHint() {
  useEffect(() => {
    try {
      window.localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}

/** Resize (long edge ≤ 3200px) + WebP recompress in-browser before upload. */
async function optimize(
  file: File,
): Promise<{ body: Blob; ext: string; type: string; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const MAX = 3200;
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.9));
  if (!blob) throw new Error("Could not encode image");
  return { body: blob, ext: "webp", type: "image/webp", width: w, height: h };
}

export type EditableImageMeta = {
  id?: string | null;
  slug?: string | null;
  alt?: string;
  fx?: number | null;
  fy?: number | null;
};

/**
 * Drop inside any `relative` image frame. Renders nothing for visitors.
 * For the admin: a "Frame" chip → anchor/replace dialog.
 */
export function EditOverlay({ image }: { image: EditableImageMeta }) {
  const [admin, setAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    checkAdmin().then((ok) => alive && setAdmin(ok));
    return () => {
      alive = false;
    };
  }, []);

  if (!admin) return null;

  const editable = Boolean(image.id && image.slug);

  function activate(e: React.SyntheticEvent) {
    // Frames often live inside links/buttons — never trigger navigation.
    e.preventDefault();
    e.stopPropagation();
    if (editable) setOpen(true);
    else window.location.href = "/admin";
  }

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        onClick={activate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") activate(e);
        }}
        title={editable ? "Set the focal anchor or replace this photo" : "Edit in admin"}
        className="absolute bottom-2 left-2 z-20 inline-flex cursor-pointer items-center gap-1.5 bg-ink/80 px-2.5 py-1.5 text-[0.58rem] uppercase tracking-[0.18em] text-cream backdrop-blur-sm transition-colors hover:bg-wine"
      >
        <span aria-hidden>⌖</span> {editable ? "Frame" : "Edit"}
      </span>
      {open && editable ? (
        <FrameDialog image={image} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function FrameDialog({
  image,
  onClose,
}: {
  image: EditableImageMeta;
  onClose: () => void;
}) {
  const router = useRouter();
  const [fx, setFx] = useState(image.fx ?? 0.5);
  const [fy, setFy] = useState(image.fy ?? 0.3);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Esc closes; lock scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const place = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setFx(Math.round(x * 100) / 100);
    setFy(Math.round(y * 100) / 100);
    setDirty(true);
  }, []);

  async function saveAnchor() {
    if (!image.id) return;
    setBusy("Saving anchor…");
    setError(null);
    try {
      const res = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: image.id, focus_x: fx, focus_y: fy }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Could not save.");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
      setBusy(null);
    }
  }

  async function replace(files: FileList | null) {
    if (!files?.length || !image.id) return;
    setBusy("Optimizing & uploading…");
    setError(null);
    try {
      const { body, ext, type, width, height } = await optimize(files[0]);
      const upRes = await fetch(`/api/admin/upload?ext=${ext}`, {
        method: "POST",
        headers: { "content-type": type },
        body,
      });
      if (!upRes.ok) throw new Error("Upload failed.");
      const { path } = (await upRes.json()) as { path: string };

      const res = await fetch("/api/admin/images", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: image.id, storage_path: path, width, height }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Could not save.");
      }
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setBusy(null);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Portal to <body> so `position: fixed` resolves against the viewport — not a
  // transformed/contained ancestor (which would strand the card far down the
  // page while the dark backdrop reads as a "gray screen").
  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/85 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Adjust framing"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-cream p-4 shadow-2xl md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-ink-faint">
            Click the most important point — every crop keeps it in frame
          </p>
          <button
            onClick={onClose}
            className="text-[0.62rem] uppercase tracking-[0.2em] text-ink-soft hover:text-wine"
          >
            Close ✕
          </button>
        </div>

        <div className="relative mt-3 cursor-crosshair select-none bg-ink/5" onClick={place}>
          {/* Full, uncropped photograph — clicks map 1:1 to the anchor. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/img/${image.slug}?w=1080`}
            alt={image.alt ?? ""}
            draggable={false}
            className="mx-auto block max-h-[62vh] w-auto"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute"
            style={{ left: `${fx * 100}%`, top: `${fy * 100}%`, transform: "translate(-50%, -50%)" }}
          >
            <span className="block h-7 w-7 rounded-full border-2 border-cream shadow-[0_0_0_2px_rgba(108,31,49,0.9)]" />
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
          <button
            onClick={saveAnchor}
            disabled={!!busy || !dirty}
            className="bg-ink px-6 py-2.5 text-[0.66rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-wine disabled:opacity-40"
          >
            Save anchor
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={!!busy}
            className="text-[0.66rem] uppercase tracking-[0.18em] text-ink underline decoration-ink/30 underline-offset-4 hover:text-wine hover:decoration-wine disabled:opacity-40"
          >
            Replace photo
          </button>
          <a
            href="/admin"
            className="text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint underline decoration-ink/20 underline-offset-4 hover:text-ink"
          >
            Open admin
          </a>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => replace(e.target.files)}
          />
        </div>
        {busy ? <p className="mt-3 text-sm text-ink-soft">{busy}</p> : null}
        {error ? <p className="mt-3 text-sm text-wine">{error}</p> : null}
      </div>
    </div>,
    document.body,
  );
}
