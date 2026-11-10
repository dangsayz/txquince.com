"use client";

/**
 * useHomeClip — upload or remove one homepage film loop (admin only).
 * Shared by Studio → Page imagery and the "Replace photo or video" editor on
 * the live page, so both follow the same rules and say the same words.
 */
import { useEffect, useState } from "react";
import { CLIP_PLACE, MAX_CLIP_BYTES, MAX_CLIP_SECONDS, type HomeClip, type HomeClipSlot } from "@/lib/home-clip-shared";

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

export const mb = (n: number) => `${Number((n / 1024 / 1024).toFixed(1))} MB`;

/**
 * `initial`: the clip when the caller already knows it (null = none);
 * leave it out and the hook asks the server. `slot` null = this place has no loop.
 */
export function useHomeClip(slot: HomeClipSlot | null, initial?: HomeClip | null) {
  const [clip, setClip] = useState<HomeClip | null>(initial ?? null);
  const [ready, setReady] = useState(initial !== undefined || !slot);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  /** True once a loop was saved or removed here (the live page needs a reload). */
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (!slot || initial !== undefined) return;
    let alive = true;
    fetch(`/api/admin/home-clip?slot=${slot}`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ clip?: HomeClip | null }>) : { clip: null }))
      .then((d) => alive && setClip(d.clip ?? null))
      .catch(() => undefined)
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [slot, initial]);

  async function upload(file: File | undefined) {
    if (!slot || !file || busy) return;
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
      setChanged(true);
      setStatus(`Film loop saved. It now plays ${CLIP_PLACE[slot]}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the clip. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!slot || busy || !confirm("Remove the film loop? The section goes back to its photo.")) return;
    setBusy("remove");
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/home-clip?slot=${slot}`, { method: "DELETE" });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Could not remove the clip. Try again.");
      setClip(null);
      setChanged(true);
      setStatus("Film loop removed. The section shows its photo.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove the clip. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return { clip, ready, busy, error, status, changed, upload, remove };
}
