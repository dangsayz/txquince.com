"use client";

import { useRef, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { parseVideoUrl } from "@/lib/video";
import type { HeroMedia } from "@/lib/content-db";

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
  const [media, setMedia] = useState<HeroMedia | null>(initial);
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
      const supabase = createBrowserSupabaseClient();
      const { body, ext, type } = await optimize(files[0]);
      const signRes = await fetch("/api/admin/sign-upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ext }),
      });
      if (!signRes.ok) throw new Error("Could not start upload.");
      const { path, token } = (await signRes.json()) as { path: string; token: string };
      const { error: upErr } = await supabase.storage
        .from("portfolio")
        .uploadToSignedUrl(path, token, body, { contentType: type });
      if (upErr) throw upErr;

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
    setVideoUrl("");
    setStatus("Reset — the hero now shows your top featured photo.");
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      {/* Current */}
      <div className="border border-line bg-ivory p-5">
        <p className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">Showing now</p>
        <div className="mt-3 flex items-center gap-4">
          {media?.kind === "image" && media.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.imageUrl} alt="" className="h-24 w-20 rounded-lg object-cover" />
          ) : media?.kind === "video" ? (
            <div className="flex h-24 w-36 items-center justify-center rounded-lg bg-greige text-xs uppercase tracking-wider text-ink-soft">
              {media.provider} video
            </div>
          ) : (
            <div className="claura-art h-24 w-20 rounded-lg" />
          )}
          <div className="text-sm text-ink-soft">
            {media?.kind === "image" && "A photo you uploaded."}
            {media?.kind === "video" && (
              <a href={media.videoUrl ?? "#"} target="_blank" rel="noopener noreferrer" className="text-wine underline">
                {media.videoUrl}
              </a>
            )}
            {!media && "Your top featured portfolio photo (default)."}
          </div>
        </div>
        {media ? (
          <button onClick={reset} disabled={busy} className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-faint hover:text-wine disabled:opacity-50">
            Reset to default →
          </button>
        ) : null}
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-full border border-line bg-ivory p-1 text-sm">
        {(["photo", "video"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-1.5 capitalize transition-colors ${
              tab === t ? "bg-ink text-cream" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t === "photo" ? "Photo" : "Video link"}
          </button>
        ))}
      </div>

      {tab === "photo" ? (
        <div className="border border-line bg-ivory p-5">
          <p className="text-sm text-ink-soft">
            Upload a vertical (portrait) photo for the sharpest hero. It&apos;s
            optimized automatically before upload.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files)}
            disabled={busy}
            className="mt-4 block text-sm text-ink file:mr-4 file:rounded-full file:border-0 file:bg-wine file:px-5 file:py-2 file:text-[0.66rem] file:uppercase file:tracking-[0.16em] file:text-cream hover:file:bg-wine-deep"
          />
        </div>
      ) : (
        <form onSubmit={saveVideo} className="border border-line bg-ivory p-5">
          <label className="block text-sm text-ink">
            Video link
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste a YouTube, Vimeo, or direct .mp4 link…"
              className="mt-1 w-full border-b border-line bg-transparent py-1.5 text-sm focus:border-wine focus:outline-none"
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
            className="mt-4 rounded-full bg-wine px-6 py-2.5 text-[0.66rem] uppercase tracking-[0.16em] text-cream hover:bg-wine-deep disabled:opacity-50"
          >
            {busy ? "Saving…" : "Use this video"}
          </button>
        </form>
      )}

      {status ? <p className="text-sm text-emerald-700">{status}</p> : null}
      {error ? <p className="text-sm text-wine">{error}</p> : null}
    </div>
  );
}
