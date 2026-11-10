"use client";

import { clipUrl, MAX_CLIP_BYTES, type HomeClip, type HomeClipSlot } from "@/lib/home-clip-shared";
import { mb, useHomeClip } from "@/components/slots/useHomeClip";

/**
 * Upload or remove one of the homepage's silent film loops. The clip stays
 * private until the upload finishes; removing it puts the photo back.
 */
export function HomeClipManager({ slot, initial }: { slot: HomeClipSlot; initial: HomeClip | null }) {
  const { clip, busy, error, status, upload, remove } = useHomeClip(slot, initial);

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
          <input type="file" accept="video/mp4" className="peer sr-only" id={`clip-${slot}`} disabled={busy !== null} onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void upload(file);
          }} />
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
