"use client";

import { useState } from "react";
import { clampFocus, clipUrl, LOOP_SECONDS, MAX_CLIP_BYTES, type HomeClip, type HomeClipSlot } from "@/lib/home-clip-shared";
import { mb, useHomeClip } from "@/components/slots/useHomeClip";

/**
 * Upload or remove one of the homepage's silent film loops. The clip stays
 * private until the upload finishes; removing it puts the photo back.
 */
export function HomeClipManager({ slot, initial }: { slot: HomeClipSlot; initial: HomeClip | null }) {
  const { clip, busy, percent, error, status, upload, remove, removePhone, saveFocus } = useHomeClip(slot, initial);
  const saved = clampFocus(clip?.focusX ?? 50);
  // The slider's own value while it is dragged; null = showing the saved one.
  const [draft, setDraft] = useState<number | null>(null);
  const focus = draft ?? saved;

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
          <li>Best: 8 to 12 seconds, filmed wide. Any video file works, also straight from an iPhone.</li>
          <li>Large files are made smaller here before they upload (under {mb(MAX_CLIP_BYTES)}, no sound). A long clip keeps its first {LOOP_SECONDS} seconds.</li>
          <li>Slow motion works best: the dress, hands, the room.</li>
        </ul>
        <p className="st-note mt-2">It plays silent, behind a light dark tint. Slow phones and visitors who turn motion off keep the photo.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input type="file" accept="video/*" className="peer sr-only" id={`clip-${slot}`} disabled={busy !== null} onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            void upload(file);
          }} />
          <label htmlFor={`clip-${slot}`} className="st-btn cursor-pointer whitespace-nowrap peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--tq-ink)] peer-disabled:opacity-50">
            {busy === "shrink" ? `Making it smaller… ${percent}%` : busy === "upload" ? "Uploading…" : clip ? "Replace film loop" : "Upload film loop"}
          </label>
          {clip ? (
            <button type="button" onClick={remove} disabled={busy !== null} className="st-btn-ghost whitespace-nowrap">
              {busy === "remove" ? "Removing…" : "Remove"}
            </button>
          ) : null}
          <a href="/" target="_blank" rel="noopener noreferrer" className="st-link">View homepage</a>
        </div>
        {clip ? (
          <div className="mt-5 grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-4 border-t border-[var(--tq-surface-2)] pt-5">
            {/* What a phone plays: the tall cut, or a narrow slice of the wide clip. */}
            <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[var(--tq-radius-sm)] bg-[var(--tq-surface-2)]">
              {clip.phone ? (
                <video key={clip.phone.name} src={clipUrl(clip.phone.name)} muted loop playsInline autoPlay preload="metadata" className="absolute inset-0 size-full object-cover" aria-hidden tabIndex={-1} />
              ) : (
                <video key={clip.name} src={clipUrl(clip.name)} muted loop playsInline autoPlay preload="metadata" className="absolute inset-0 size-full object-cover" style={{ objectPosition: `${focus}% 50%` }} aria-hidden tabIndex={-1} />
              )}
            </div>
            <div className="min-w-0">
              {clip.phone ? (
                <>
                  <p className="m-0 text-base font-medium text-[var(--tq-ink)]">Phones play this tall clip</p>
                  <p className="st-note mt-1">Computers and tablets play the wide clip.</p>
                </>
              ) : (
                <>
                  <label htmlFor={`focus-${slot}`} className="block text-base font-medium text-[var(--tq-ink)]">What a phone shows</label>
                  <p className="st-note mt-1">A phone is tall, so it shows a slice of a wide clip. Slide to the part that matters, or upload a tall clip (9:16) of the same moment.</p>
                  <input id={`focus-${slot}`} type="range" min={0} max={100} step={1} value={focus} disabled={busy !== null} onChange={(e) => setDraft(Number(e.target.value))} className="mt-2 block min-h-11 w-full accent-[var(--tq-ink)]" aria-valuetext={focus < 34 ? "left" : focus > 66 ? "right" : "middle"} />
                </>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {clip.phone ? null : (
                  <button type="button" disabled={busy !== null || focus === saved} onClick={() => void saveFocus(focus).then(() => setDraft(null))} className="st-btn-ghost whitespace-nowrap">
                    {busy === "focus" ? "Saving…" : "Save framing"}
                  </button>
                )}
                <input type="file" accept="video/*" className="peer sr-only" id={`clip-phone-${slot}`} disabled={busy !== null} onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  void upload(file, "phone");
                }} />
                <label htmlFor={`clip-phone-${slot}`} className="st-btn-ghost cursor-pointer whitespace-nowrap peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--tq-ink)] peer-disabled:opacity-50">
                  {busy === "phone" ? "Working…" : clip.phone ? "Replace tall clip" : "Upload tall clip"}
                </label>
                {clip.phone ? (
                  <button type="button" onClick={() => void removePhone()} disabled={busy !== null} className="st-btn-ghost whitespace-nowrap">
                    Remove tall clip
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
        {status ? <p role="status" className="st-note mt-3 text-[var(--tq-ink)]">{status}</p> : null}
        {error ? <p role="alert" className="mt-3 text-base leading-6 text-danger">{error}</p> : null}
      </div>
    </div>
  );
}
