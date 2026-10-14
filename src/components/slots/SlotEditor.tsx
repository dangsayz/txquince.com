"use client";

/**
 * SlotEditor — replace the photo in one image slot (admin only; loaded on
 * demand by SlotAdminControl and by Admin → Every image).
 *
 * Choose a photo → it is resized here into 480/960/1600/2400px WebP copies
 * (never wider than the original; re-encoding strips EXIF/GPS) → tap the most
 * important point → check the phone and computer crops → describe it in
 * English and Spanish → Save. Earlier versions can be restored at any time.
 * Built phone-first: a full-height sheet with 48px actions.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ALT_MAX, ALT_MIN, focalPosition, renditionUrl } from "@/lib/image-slot-shared";
import { decodePhoto, encodeRenditions, sourceProblem, type Encoded } from "./encode-renditions";

type L = { en: string; es: string };
type Version = {
  id: string;
  key: string;
  w: number;
  h: number;
  widths: number[];
  ext?: "webp" | "jpg";
  alt: L;
  focal: { x: number; y: number };
  uploadedAt: string;
  uploadedBy: string;
};
export type SlotInfo = {
  id: string;
  group: string;
  page: string;
  label: string;
  crops: { phone: string; desktop: string };
  defaultSrc: string;
  defaultAlt: L;
  defaultWidth?: number;
  format?: "jpeg";
  current: Version | null;
  history: Version[];
};

const INK = "#111110";

const url = (v: Version, target: number) => {
  const w = v.widths.find((x) => x >= target) ?? v.widths[v.widths.length - 1];
  return renditionUrl(v.key, w, v.ext ?? "webp");
};

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function errorOf(res: Response): Promise<string> {
  const d = (await res.json().catch(() => ({}))) as { error?: string };
  return d.error ?? (res.status === 401 ? "Please sign in to the studio again." : "That did not work. Try again.");
}

export function SlotEditor({
  slot,
  pageSrc,
  initial,
  onClose,
  onSaved,
}: {
  slot: string;
  /** The photo currently on the page (shown while nothing new is chosen). */
  pageSrc?: string;
  /** Already-loaded slot info (the admin grid passes it); else fetched. */
  initial?: SlotInfo;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [info, setInfo] = useState<SlotInfo | null>(initial ?? null);
  const [encoded, setEncoded] = useState<Encoded | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [focal, setFocal] = useState(initial?.current?.focal ?? { x: 0.5, y: 0.4 });
  const [alt, setAlt] = useState<L>(initial?.current?.alt ?? initial?.defaultAlt ?? { en: "", es: "" });
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fresh state from the server (another device may have changed it).
  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/images/${encodeURIComponent(slot)}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(await errorOf(r));
        return r.json() as Promise<{ slot: SlotInfo }>;
      })
      .then(({ slot: s }) => {
        if (!alive) return;
        setInfo(s);
        if (!initial) {
          setFocal(s.current?.focal ?? { x: 0.5, y: 0.4 });
          setAlt(s.current?.alt ?? s.defaultAlt);
        }
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [slot, initial]);

  // Esc closes; the page behind does not scroll; focus moves into the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, busy]);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const current = info?.current ?? null;
  const shownSrc = preview ?? (current ? url(current, 1600) : (pageSrc ?? info?.defaultSrc ?? ""));
  const canFrame = Boolean(encoded || current);
  const altOk = (s: string) => s.trim().length >= ALT_MIN && s.trim().length <= ALT_MAX;
  const valid = altOk(alt.en) && altOk(alt.es);
  const canSave = !busy && valid && (encoded !== null || (current !== null && dirty));

  async function choose(files: FileList | null) {
    const file = files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const problem = sourceProblem(file);
    if (problem) return setError(problem);
    setError(null);
    setBusy("Preparing the photo…");
    try {
      const decoded = await decodePhoto(file);
      try {
        const enc = await encodeRenditions(
          decoded,
          (n, total) => setBusy(`Preparing the photo… ${n} of ${total}`),
          info?.format === "jpeg" ? "jpeg" : "webp",
        );
        setEncoded(enc);
        setPreview(URL.createObjectURL(enc.renditions[enc.renditions.length - 1].blob));
        setFocal({ x: 0.5, y: 0.4 });
        setDirty(true);
      } finally {
        decoded.done();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "This photo could not be prepared.");
    } finally {
      setBusy(null);
    }
  }

  const place = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!canFrame) return;
      const r = e.currentTarget.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      setFocal({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
      setDirty(true);
    },
    [canFrame],
  );

  async function save() {
    if (!canSave) return;
    setError(null);
    setBusy("Saving…");
    try {
      let res: Response;
      if (encoded) {
        const form = new FormData();
        form.set("meta", JSON.stringify({ w: encoded.w, h: encoded.h, alt, focal }));
        const ext = encoded.type === "image/webp" ? "webp" : "jpg";
        for (const r of encoded.renditions) form.set(`r${r.w}`, r.blob, `r${r.w}.${ext}`);
        res = await fetch(`/api/admin/images/${encodeURIComponent(slot)}`, { method: "POST", body: form });
      } else {
        res = await fetch(`/api/admin/images/${encodeURIComponent(slot)}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ alt, focal }),
        });
      }
      if (!res.ok) throw new Error(await errorOf(res));
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setBusy(null);
    }
  }

  async function undo(versionId?: string) {
    setError(null);
    setBusy("Restoring…");
    try {
      const res = await fetch(`/api/admin/images/${encodeURIComponent(slot)}/undo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(versionId ? { versionId } : {}),
      });
      if (!res.ok) throw new Error(await errorOf(res));
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not restore.");
      setBusy(null);
    }
  }

  const small = encoded && encoded.w < 1600;
  const crops = info?.crops ?? { phone: "4 / 5", desktop: "16 / 9" };
  const position = useMemo(() => (canFrame ? focalPosition(focal) : "50% 50%"), [canFrame, focal]);

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 sm:items-center sm:p-6"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="slot-editor-title"
        tabIndex={-1}
        className="flex max-h-[100dvh] w-full max-w-3xl flex-col bg-white outline-none sm:max-h-[92dvh]"
        style={{ color: INK, fontFamily: "system-ui, -apple-system, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start gap-3 border-b px-4 py-3 sm:px-6" style={{ borderColor: INK }}>
          <div className="min-w-0 flex-1">
            <h2 id="slot-editor-title" className="text-lg font-semibold leading-snug">Replace photo</h2>
            <p className="text-base leading-snug">{info?.label ?? "Loading…"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!!busy}
            aria-label="Close"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center border text-2xl leading-none disabled:opacity-40"
            style={{ borderColor: INK }}
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 sm:px-6">
          {/* 1. The photo + focal point */}
          <section aria-labelledby="slot-photo-h">
            <h3 id="slot-photo-h" className="text-base font-semibold">1. The photo</h3>
            <p className="mt-1 text-base leading-snug">
              {canFrame
                ? "Tap the most important point — usually her face. Every crop keeps it in view."
                : "This spot shows the website’s original photo. Choose a new one to replace it."}
            </p>
            <div
              className="relative mt-3 select-none overflow-hidden"
              style={{ background: "#f4f4f2", cursor: canFrame ? "crosshair" : "default", touchAction: "manipulation" }}
              onPointerUp={place}
              data-testid="slot-focal-stage"
            >
              {shownSrc ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview / admin-only
                <img
                  src={shownSrc}
                  alt=""
                  draggable={false}
                  className="mx-auto block h-auto max-h-[46dvh] w-auto max-w-full"
                />
              ) : (
                <div className="aspect-[4/3]" />
              )}
              {canFrame ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute block h-8 w-8 rounded-full border-[3px] border-white"
                  style={{
                    left: `${focal.x * 100}%`,
                    top: `${focal.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    boxShadow: `0 0 0 2px ${INK}`,
                  }}
                />
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={!!busy}
                className="inline-flex min-h-12 items-center whitespace-nowrap px-5 text-base font-medium text-white disabled:opacity-40"
                style={{ background: INK }}
              >
                {encoded ? "Choose a different photo" : "Choose a new photo"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => choose(e.target.files)} />
              {encoded ? (
                <span className="text-base">
                  {encoded.w} × {encoded.h}px · copies at {encoded.renditions.map((r) => r.w).join(", ")}px
                </span>
              ) : null}
            </div>
            {small ? (
              <p className="mt-2 text-base font-medium">
                Heads up: this photo is only {encoded!.w}px wide. It will never be stretched, but it may look small or soft on big screens.
              </p>
            ) : null}
          </section>

          {/* 2. Preview */}
          <section aria-labelledby="slot-prev-h" className="mt-6">
            <h3 id="slot-prev-h" className="text-base font-semibold">2. How it will look</h3>
            <div className="mt-3 grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)] items-start gap-3">
              {(["phone", "desktop"] as const).map((k) => (
                <figure key={k} className="m-0">
                  <div className="relative overflow-hidden" style={{ aspectRatio: crops[k], background: "#f4f4f2" }}>
                    {shownSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local preview / admin-only
                      <img src={shownSrc} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: position }} />
                    ) : null}
                  </div>
                  <figcaption className="mt-1 text-base">{k === "phone" ? "On a phone" : "On a computer"}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* 3. Description */}
          <section aria-labelledby="slot-alt-h" className="mt-6">
            <h3 id="slot-alt-h" className="text-base font-semibold">3. Describe the photo</h3>
            <p className="mt-1 text-base leading-snug">
              Say what is in it, for people who can’t see it and for Google. For example: “Quinceañera in a lilac gown under an oak tree at
              the Dallas Arboretum.” No need to start with “photo of”.
            </p>
            {(["en", "es"] as const).map((lang) => (
              <label key={lang} className="mt-3 block">
                <span className="text-base font-medium">{lang === "en" ? "In English (required)" : "En español (obligatorio)"}</span>
                <textarea
                  value={alt[lang]}
                  required
                  maxLength={ALT_MAX}
                  rows={2}
                  onChange={(e) => {
                    setAlt((a) => ({ ...a, [lang]: e.target.value }));
                    setDirty(true);
                  }}
                  className="mt-1 block w-full border px-3 py-2 text-base"
                  style={{ borderColor: INK, color: INK }}
                  aria-invalid={!altOk(alt[lang])}
                />
                {!altOk(alt[lang]) ? (
                  <span className="mt-1 block text-base">{lang === "en" ? "Please describe the photo." : "Describe la foto, por favor."}</span>
                ) : null}
              </label>
            ))}
          </section>

          {/* 4. Earlier versions */}
          {info && (info.history.length > 0 || current) ? (
            <section aria-labelledby="slot-hist-h" className="mt-6">
              <h3 id="slot-hist-h" className="text-base font-semibold">Earlier versions</h3>
              <ul className="mt-2 grid gap-2">
                {info.history.map((v) => {
                  const showing = current?.id === v.id;
                  return (
                    <li key={v.id} className="flex items-center gap-3 border p-2" style={{ borderColor: INK }}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-only thumbnail */}
                      <img src={url(v, 480)} alt="" width={56} height={56} className="h-14 w-14 shrink-0 object-cover" style={{ objectPosition: focalPosition(v.focal) }} />
                      <span className="min-w-0 flex-1 text-base leading-snug">
                        {formatDay(v.uploadedAt)}
                        {showing ? <strong className="block">Showing now</strong> : null}
                      </span>
                      {!showing ? (
                        <button type="button" disabled={!!busy} onClick={() => undo(v.id)} className="inline-flex min-h-11 items-center whitespace-nowrap border px-3 text-base disabled:opacity-40" style={{ borderColor: INK }}>
                          Use this one
                        </button>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 flex flex-wrap gap-3">
                {current ? (
                  <>
                    <button type="button" disabled={!!busy} onClick={() => undo()} className="inline-flex min-h-11 items-center whitespace-nowrap border px-4 text-base disabled:opacity-40" style={{ borderColor: INK }}>
                      Undo last change
                    </button>
                    <button type="button" disabled={!!busy} onClick={() => undo("original")} className="inline-flex min-h-11 items-center whitespace-nowrap border px-4 text-base disabled:opacity-40" style={{ borderColor: INK }}>
                      Back to the original
                    </button>
                  </>
                ) : (
                  <p className="text-base">Showing the original photo now.</p>
                )}
              </div>
            </section>
          ) : null}
        </div>

        <footer
          className="flex flex-wrap items-center gap-3 border-t px-4 pt-3 sm:px-6"
          style={{ borderColor: INK, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <p role="status" aria-live="polite" className="min-w-0 flex-1 text-base">
            {error ? <span role="alert" className="font-semibold">{error}</span> : busy}
          </p>
          <button type="button" onClick={onClose} disabled={!!busy} className="inline-flex min-h-12 items-center whitespace-nowrap border px-5 text-base disabled:opacity-40" style={{ borderColor: INK }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="inline-flex min-h-12 items-center whitespace-nowrap px-6 text-base font-semibold text-white disabled:opacity-40"
            style={{ background: INK }}
          >
            Save
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
