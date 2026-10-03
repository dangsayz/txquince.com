"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseVideoUrl } from "@/lib/video";
import type { HeroMedia } from "@/lib/content-db";
import { heroObjectPosition, resolveHeroFocus } from "@/lib/hero-focus";

function publicUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/portfolio/${path}`;
}

/** Resize (long edge ≤ 2400px) + WebP recompress in-browser before upload. */
async function optimize(file: File): Promise<{ body: Blob; ext: string; type: string }> {
  const fallback = {
    body: file,
    ext: (file.name.split(".").pop() || "jpg").toLowerCase().replace("jpeg", "jpg"),
    type: file.type || "image/jpeg",
  };
  if (!file.type.startsWith("image/")) return fallback;
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 3200;
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no-ctx");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.9));
    if (!blob) throw new Error("no-blob");
    return { body: blob, ext: "webp", type: "image/webp" };
  } catch {
    return fallback;
  }
}

type Tab = "photo" | "video";

export function HeroManager({ initial }: { initial: HeroMedia | null }) {
  const router = useRouter();
  const [media, setMedia] = useState<HeroMedia | null>(initial);
  const [focus, setFocus] = useState(resolveHeroFocus(initial ?? {}));
  const [focusDirty, setFocusDirty] = useState(false);
  const [tab, setTab] = useState<Tab>(initial?.kind === "video" ? "video" : "photo");
  const [videoUrl, setVideoUrl] = useState(initial?.kind === "video" ? initial.videoUrl ?? "" : "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = parseVideoUrl(videoUrl || "");

  async function saveVideo(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    const res = await fetch("/api/admin/hero", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind: "video", videoUrl }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(d.error ?? "Could not save.");
    } else {
      setMedia(d.value as HeroMedia);
      setStatus("Saved — live on your homepage within a minute.");
    }
    setBusy(false);
  }

  async function handleFile(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    setStatus("Optimizing & uploading…");
    try {
      const { body, ext, type } = await optimize(files[0]);
      const upRes = await fetch(`/api/admin/upload?ext=${ext}`, {
        method: "POST",
        headers: { "content-type": type },
        body,
      });
      if (!upRes.ok) throw new Error("Upload failed.");
      const { path } = (await upRes.json()) as { path: string };

      const url = publicUrl(path);
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "image", imageUrl: url, imageAlt: "Quinceañera portrait" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Could not save.");
      // Preview through the branded route (the bucket may be private).
      setMedia({ ...(d.value as HeroMedia), imageUrl: "/api/img/hero" });
      setFocus(resolveHeroFocus(d.value as HeroMedia));
      setFocusDirty(false);
      setStatus("Saved — live on your homepage within a minute.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function reset() {
    if (!confirm("Reset the hero to your top featured photo?")) return;
    setBusy(true);
    setError(null);
    await fetch("/api/admin/hero", { method: "DELETE" });
    setMedia(null);
    setFocusDirty(false);
    setVideoUrl("");
    setStatus("Reset — the hero now shows your top featured photo.");
    setBusy(false);
  }

  function placeFocus(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setFocus({
      focusX: Math.round(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)) * 100) / 100,
      focusY: Math.round(Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height)) * 100) / 100,
    });
    setFocusDirty(true);
    setStatus(null);
  }

  async function saveFocus() {
    if (media?.kind !== "image") return;
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...focus, expectedUpdatedAt: media.updatedAt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save the focal point.");
      setMedia({ ...media, ...focus, updatedAt: data.updatedAt as string });
      setFocusDirty(false);
      setStatus("Focal point saved. The homepage will update within a minute.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the focal point.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-7">
      <div className="border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h2 className="text-base font-medium text-ink">Homepage cover</h2>
          <span className="text-xs text-ink-soft">Showing now</span>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          {media?.kind === "image" && media.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.imageUrl} alt="" className="h-28 w-24 object-cover" />
          ) : media?.kind === "video" ? (
            <div className="flex h-28 w-36 items-center justify-center bg-greige text-xs uppercase tracking-wider text-ink-soft">
              {media.provider} video
            </div>
          ) : (
            <div className="claura-art h-28 w-24" />
          )}
          <div className="text-sm text-ink-soft">
            {media?.kind === "image" && "Selected photograph"}
            {media?.kind === "video" && (
              <a href={media.videoUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                {media.videoUrl}
              </a>
            )}
            {!media && "Automatic selection from your featured portfolio photographs."}
          </div>
        </div>
        {media ? (
          <button onClick={reset} disabled={busy} className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-ink-soft hover:text-ink disabled:opacity-50">
            Reset to default →
          </button>
        ) : null}
      </div>

      {media?.kind === "image" && media.imageUrl ? (
        <section id="framing" className="scroll-mt-8 border border-line bg-white p-5 sm:p-7" aria-labelledby="framing-heading">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">Framing</p>
          <h2 id="framing-heading" className="mt-2 text-lg font-medium text-ink">Choose the focal point</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
            Tap the subject in the full photo. The previews show how the homepage will crop around that point on different screens.
          </p>
          <button
            type="button"
            aria-label="Place focal point on the full photo"
            onClick={placeFocus}
            disabled={busy}
            className="relative mx-auto mt-6 block w-fit max-w-full cursor-crosshair overflow-hidden bg-greige focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:opacity-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${media.imageUrl}?w=1080`} alt={media.imageAlt || "Homepage hero"} draggable={false} className="block max-h-[34rem] max-w-full" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-accent text-lg text-white shadow-lg"
              style={{ left: `${focus.focusX * 100}%`, top: `${focus.focusY * 100}%` }}
            >⌖</span>
          </button>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {([ ["Wide screen crop", "aspect-video"], ["Tall screen crop", "aspect-[4/5]"] ] as const).map(([name, aspect]) => (
              <div key={name}>
                <p className="mb-2 text-sm font-medium text-ink-soft">{name}</p>
                <div className={`relative w-full overflow-hidden bg-greige ${aspect}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`${media.imageUrl}?w=1080`} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: heroObjectPosition(focus) }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {([ ["Left / right", "focusX"], ["Up / down", "focusY"] ] as const).map(([name, key]) => (
              <label key={key} className="text-sm text-ink-soft">
                {name}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={focus[key]}
                  onChange={(e) => {
                    setFocus((old) => ({ ...old, [key]: Number(e.target.value) }));
                    setFocusDirty(true);
                    setStatus(null);
                  }}
                  className="mt-2 block w-full accent-accent"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={saveFocus}
            disabled={busy || !focusDirty}
            className="mt-6 min-h-11 bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink/85 disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save focal point"}
          </button>
        </section>
      ) : null}

      {status ? <p role="status" className="text-sm text-emerald-700">{status}</p> : null}
      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}

      <div role="group" aria-label="Cover format" className="flex gap-7 border-b border-line">
        {(["photo", "video"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`min-h-11 border-b-2 px-1 py-2 text-sm capitalize transition-colors ${
              tab === t ? "border-ink font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {t === "photo" ? "Photo" : "Video link"}
          </button>
        ))}
      </div>

      {tab === "photo" ? (
        <div className="border border-line bg-white p-5 sm:p-6">
          <h2 className="text-base font-medium text-ink">Use a photograph</h2>
          <p className="mt-1 text-sm text-ink-soft">A portrait image gives the homepage more room to crop on mobile.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files)}
            disabled={busy}
            className="mt-4 block min-h-11 text-base text-ink file:mr-4 file:min-h-11 file:border-0 file:bg-ink file:px-5 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-ink/85"
          />
        </div>
      ) : (
        <form onSubmit={saveVideo} className="border border-line bg-white p-5 sm:p-6">
          <h2 className="mb-4 text-base font-medium text-ink">Use a film</h2>
          <label className="block text-sm text-ink">
            Video link
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste a YouTube, Vimeo, or direct .mp4 link…"
              className="mt-1 w-full min-h-11 border border-line bg-white px-3 py-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            />
          </label>
          {videoUrl ? (
            <p className="mt-2 text-xs text-ink-faint">
              {preview.embedUrl
                ? `Detected: ${preview.provider} — it'll play as a silent ambient loop in the hero.`
                : "This link can't be embedded. Use YouTube, Vimeo, or a direct .mp4 link."}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy || !preview.embedUrl}
            className="mt-4 min-h-11 bg-ink px-5 py-2.5 text-sm font-medium text-white hover:bg-ink/85 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Use this video"}
          </button>
        </form>
      )}

    </div>
  );
}
