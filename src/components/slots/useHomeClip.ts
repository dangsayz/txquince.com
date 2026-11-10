"use client";

/**
 * useHomeClip — upload or remove one homepage film loop (admin only).
 * Shared by Studio → Page imagery and the "Replace photo or video" editor on
 * the live page, so both follow the same rules and say the same words.
 */
import { useEffect, useState } from "react";
import { clampFocus, CLIP_PLACE, MAX_CLIP_BYTES, MAX_CLIP_SECONDS, type ClipVariant, type HomeClip, type HomeClipSlot } from "@/lib/home-clip-shared";

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
  const [busy, setBusy] = useState<"shrink" | "upload" | "remove" | "focus" | "phone" | null>(null);
  /** 0 to 100 while a large video is being made smaller. */
  const [percent, setPercent] = useState(0);
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

  /** `variant` "phone" stores a tall cut that phones play in place of the wide clip. */
  async function upload(file: File | undefined, variant: ClipVariant = "wide") {
    if (!slot || !file || busy) return;
    setError(null);
    setStatus(null);
    if (!file.type.startsWith("video/")) return setError("Choose a video file.");
    const seconds = await duration(file);
    // Small MP4 loops go up as they are. Anything else (a big export, an iPhone
    // .mov, a long clip) is made into a small silent MP4 here first.
    let body: Blob = file;
    let note = "";
    if (file.type !== "video/mp4" || file.size > MAX_CLIP_BYTES || (seconds !== null && seconds > MAX_CLIP_SECONDS)) {
      setBusy("shrink");
      setPercent(0);
      try {
        const { shrinkClip } = await import("./shrink-clip");
        const out = await shrinkClip(file, (f) => setPercent(Math.round(f * 100)));
        body = out.blob;
        note =
          out.trimmedFrom !== null
            ? ` Your clip was ${Math.round(out.trimmedFrom)} seconds, so the loop uses the first ${Math.round(out.seconds)}.`
            : ` Made smaller: ${mb(file.size)} to ${mb(out.blob.size)}.`;
      } catch (e) {
        setBusy(null);
        return setError(e instanceof Error && e.name === "ShrinkError" ? e.message : "Could not prepare that video. Try again.");
      }
    }
    setBusy(variant === "phone" ? "phone" : "upload");
    try {
      const res = await fetch(`/api/admin/home-clip?slot=${slot}&variant=${variant}`, { method: "POST", headers: { "content-type": "video/mp4" }, body });
      const d = (await res.json().catch(() => ({}))) as { error?: string; clip?: HomeClip | null };
      if (!res.ok || !d.clip) throw new Error(d.error ?? "Could not save the clip. Try again.");
      setClip(d.clip);
      setChanged(true);
      setStatus(variant === "phone" ? `Tall clip saved. Phones now play it ${CLIP_PLACE[slot]}.${note}` : `Film loop saved. It now plays ${CLIP_PLACE[slot]}.${note}`);
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

  /** Remove only the tall cut: phones go back to the wide clip. */
  async function removePhone() {
    if (!slot || busy) return;
    setBusy("phone");
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/home-clip?slot=${slot}&variant=phone`, { method: "DELETE" });
      const d = (await res.json().catch(() => ({}))) as { error?: string; clip?: HomeClip | null };
      if (!res.ok) throw new Error(d.error ?? "Could not remove the tall clip. Try again.");
      setClip(d.clip ?? null);
      setChanged(true);
      setStatus("Tall clip removed. Phones play the wide clip again.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove the tall clip. Try again.");
    } finally {
      setBusy(null);
    }
  }

  /** Save which part of the clip stays in view where the frame crops its sides (0 left, 100 right). */
  async function saveFocus(focusX: number) {
    if (!slot || !clip || busy) return;
    setBusy("focus");
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/admin/home-clip?slot=${slot}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ focusX: clampFocus(focusX) }) });
      const d = (await res.json().catch(() => ({}))) as { error?: string; clip?: HomeClip | null };
      if (!res.ok || !d.clip) throw new Error(d.error ?? "Could not save the framing. Try again.");
      setClip(d.clip);
      setChanged(true);
      setStatus("Framing saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save the framing. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return { clip, ready, busy, percent, error, status, changed, upload, remove, removePhone, saveFocus };
}
