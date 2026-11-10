"use client";

import { useRef, useState } from "react";
import { clipUrl, MAX_CLIP_BYTES, MAX_CLIP_SECONDS, type HomeClip, type HomeClipSlot } from "@/lib/home-clip-shared";

/** Length of a local video file in seconds (null when the browser cannot read it). */
function duration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    const done = (n: number | null) => {
      URL.revokeObjectURL(url);
      resolve(n);
    };
    v.preload = "metadata";
    v.onloadedmetadata = () => done(Number.isFinite(v.duration) ? v.duration : null);
    v.onerror = () => done(null);
    v.src = url;
  });
}

const mb = (n: number) => `${Number((n / 1024 / 1024).toFixed(1))} MB`;

/**
 * Upload or remove one of the homepage's silent film loops (`place` says
 * where it plays, e.g. "behind the featured package"). The clip stays private until the upload finishes; removing it puts
 * the photo back.
 */
export function HomeClipManager({ slot, place, initial }: { slot: HomeClipSlot; place: string; initial: HomeClip | null }) {
  const [clip, setClip] = useState(initial);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function upload(file: File | undefined) {
    if (input.current) input.current.value = "";
    if (!file || busy) return;
    setError(null);
    setStatus(null);
    if (file.type !== "video/mp4") return setError("Use an MP4 file (H.264). Export it from your editor as MP4.");
    if (file.size > MAX_CLIP_BYTES) {
      return setError(`That file is ${mb(file.size)}. Keep the loop under ${mb(MAX_CLIP_BYTES)}: 8 to 12 seconds at 1080p.`);
    }
    const seconds = await duration(file);
    if (seconds !== null && seconds > MAX_CLIP_SECONDS) {
      return setError(`That clip is ${Math.round(seconds)} seconds. Cut it to 8 to 12 seconds so it loops.`);
    }
    setBusy("upload");
    try {
      const res = await fetch(`/api/admin/home-clip?slot=${slot}`, { method: "POST", headers: { "content-type": "video/mp4" }, body: file });
      const d = (await res.json().catch(() => ({}))) as { error?: string; clip?: HomeClip | null };
      if (!res.ok || !d.clip) throw new Error(d.error ?? "Could not save the clip. Try again.");
      setClip(d.clip);
      setStatus(`Film loop saved. It now plays ${place}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the clip. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (busy || !confirm("Remove the film loop? The section goes back to its photo.")) return;
    setBusy("remove");
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/home-clip?slot=${slot}`, { method: "DELETE" });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Could not remove the clip. Try again.");
      setClip(null);
      setStatus("Film loop removed. The section shows its photo.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove the clip. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:items-start">
      <div className="relative aspect-video w-full overflow-hidden rounded-[var(--tq-radius-sm)] bg-[var(--tq-surface-2)]">
        {clip ? (
          <video key={clip.name} src={clipUrl(clip.name)} muted loop playsInline autoPlay preload="metadata" className="absolute inset-0 size-full object-cover" aria-label="Current film loop" />
        ) : (
          <p className="st-note absolute inset-0 grid place-items-center px-4 text-center">No film loop yet. The section shows its photo.</p>
        )}
      </div>
      <div className="min-w-0">
        <ul className="m-0 grid list-none gap-1 p-0 text-base leading-6 text-[var(--tq-ink)]">
          <li>8 to 12 seconds, MP4 (H.264), 1920 × 1080, under {mb(MAX_CLIP_BYTES)}.</li>
          <li>Slow motion works best: the dress, hands, the room.</li>
        </ul>
        <p className="st-note mt-2">It plays silent, behind a light dark tint. Slow phones and visitors who turn motion off keep the photo.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input ref={input} type="file" accept="video/mp4" className="peer sr-only" id={`clip-${slot}`} disabled={busy !== null} onChange={(e) => upload(e.target.files?.[0])} />
          <label htmlFor={`clip-${slot}`} className="st-btn cursor-pointer whitespace-nowrap peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--tq-ink)] peer-disabled:opacity-50">
            {busy === "upload" ? "Uploading…" : clip ? "Replace film loop" : "Upload film loop"}
          </label>
          {clip ? (
            <button type="button" onClick={remove} disabled={busy !== null} className="st-btn-ghost whitespace-nowrap">
              {busy === "remove" ? "Removing…" : "Remove"}
            </button>
          ) : null}
          <a href="/" target="_blank" rel="noopener noreferrer" className="st-link">View homepage</a>
        </div>
        {status ? <p role="status" className="st-note mt-3 text-[var(--tq-ink)]">{status}</p> : null}
        {error ? <p role="alert" className="mt-3 text-base leading-6 text-danger">{error}</p> : null}
      </div>
    </div>
  );
}
