"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseVideoUrl } from "@/lib/video";
import type { HeroMedia } from "@/lib/content-db";
import { heroObjectPosition, resolveHeroFocus, type HeroFocus } from "@/lib/hero-focus";
import { HeroResponseSchema, type HeroLibraryPhoto } from "@/lib/hero-cover";
import brandedImageLoader from "@/lib/image-loader";

async function optimize(file: File): Promise<{ body: Blob; ext: string; type: string }> {
  const fallback = { body: file, ext: (file.name.split(".").pop() || "jpg").toLowerCase().replace("jpeg", "jpg"), type: file.type || "image/jpeg" };
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 3200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close(); return fallback; }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.9));
    return blob ? { body: blob, ext: "webp", type: "image/webp" } : fallback;
  } catch {
    return fallback;
  }
}

type CoverDraft = {
  source: { kind: "current" } | { kind: "portfolio"; slug: string } | { kind: "upload"; file: File; stagedPath?: string };
  previewUrl: string;
  alt: string;
  focus: HeroFocus;
};

function draftFromMedia(media: HeroMedia | null): CoverDraft | null {
  return media?.kind === "image" && media.imageUrl
    ? { source: { kind: "current" }, previewUrl: media.imageUrl, alt: media.imageAlt, focus: resolveHeroFocus(media) }
    : null;
}

async function responseBody(response: Response): Promise<unknown> {
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "Could not save your changes. Try again.";
    throw new Error(message);
  }
  return body;
}

const primary = "inline-flex min-h-12 items-center justify-center bg-ink px-5 py-3 text-base font-medium text-white hover:bg-ink/85 disabled:opacity-40";
const secondary = "inline-flex min-h-11 items-center justify-center border border-line px-4 py-2 text-base text-ink hover:bg-greige disabled:opacity-40";

export function HeroManager({ initial, library }: { initial: HeroMedia | null; library: HeroLibraryPhoto[] }) {
  const router = useRouter();
  const [media, setMedia] = useState(initial);
  const [draft, setDraft] = useState<CoverDraft | null>(() => draftFromMedia(initial));
  const [tab, setTab] = useState<"photo" | "video">(initial?.kind === "video" ? "video" : "photo");
  const [sourcePanel, setSourcePanel] = useState<"library" | "upload" | null>(null);
  const [search, setSearch] = useState("");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const submitting = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrl = draft?.source.kind === "upload" ? draft.previewUrl : null;
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  const dirty = draft !== null && (draft.source.kind !== "current" || draft.alt !== media?.imageAlt || draft.focus.focusX !== media?.focusX || draft.focus.focusY !== media?.focusY);
  const video = parseVideoUrl(videoUrl);
  const visiblePhotos = library.filter((photo) => `${photo.alt} ${photo.slug}`.toLowerCase().includes(search.toLowerCase()));

  function start(): boolean {
    if (submitting.current) return false;
    submitting.current = true;
    setBusy(true);
    setError(null);
    setStatus(null);
    return true;
  }
  function finish() { submitting.current = false; setBusy(false); }
  function adopt(next: HeroMedia) {
    setMedia(next);
    setDraft(draftFromMedia(next));
    setSourcePanel(null);
    setPreviewError(false);
    setStatus("Cover saved. View the homepage to see the published framing.");
    router.refresh();
  }

  function choosePhoto(photo: HeroLibraryPhoto) {
    setDraft({ source: { kind: "portfolio", slug: photo.slug }, previewUrl: photo.url, alt: photo.alt, focus: resolveHeroFocus(photo) });
    setPreviewError(false);
    setError(null);
    setStatus(null);
    setSourcePanel(null);
  }

  function chooseFile(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) { setError("Choose a JPEG, PNG, WebP, or AVIF photograph."); return; }
    if (!file.size || file.size > 20_000_000) { setError("Choose a photograph smaller than 20 MB."); return; }
    setDraft({ source: { kind: "upload", file }, previewUrl: URL.createObjectURL(file), alt: "Quinceañera portrait", focus: resolveHeroFocus({}) });
    setPreviewError(false);
    setError(null);
    setStatus(null);
    setSourcePanel(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function placeFocus(event: React.MouseEvent<HTMLButtonElement>) {
    if (!draft || event.detail === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setDraft({ ...draft, focus: {
      focusX: Math.round(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) * 100) / 100,
      focusY: Math.round(Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)) * 100) / 100,
    } });
    setStatus(null);
  }

  async function publishPhoto() {
    if (!draft || !dirty || !draft.alt.trim() || !start()) return;
    try {
      let payload: object;
      let method: "POST" | "PATCH" = "POST";
      if (draft.source.kind === "current") {
        method = "PATCH";
        payload = { ...draft.focus, imageAlt: draft.alt, expectedUpdatedAt: media?.updatedAt };
      } else {
        let source: { kind: "portfolio"; slug: string } | { kind: "upload"; storagePath: string };
        if (draft.source.kind === "portfolio") {
          source = draft.source;
        } else {
          let storagePath = draft.source.stagedPath;
          if (!storagePath) {
            const optimized = await optimize(draft.source.file);
            const result = await responseBody(await fetch(`/api/admin/upload?ext=${optimized.ext}`, { method: "POST", headers: { "content-type": optimized.type }, body: optimized.body }));
            if (!result || typeof result !== "object" || !("path" in result) || typeof result.path !== "string") throw new Error("The upload could not be confirmed. Select the file again.");
            storagePath = result.path;
            const uploadSource = { ...draft.source, stagedPath: storagePath };
            setDraft((current) => current?.source.kind === "upload" ? { ...current, source: uploadSource } : current);
          }
          source = { kind: "upload", storagePath };
        }
        payload = { kind: "image", source, imageAlt: draft.alt, ...draft.focus, expectedUpdatedAt: media?.updatedAt ?? null };
      }
      const result = HeroResponseSchema.safeParse(await responseBody(await fetch("/api/admin/hero", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })));
      if (!result.success || !result.data.value) throw new Error("Could not confirm the saved cover. Load the latest cover before trying again.");
      adopt(result.data.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not publish the cover. Try again.");
    } finally { finish(); }
  }

  async function saveVideo(event: React.FormEvent) {
    event.preventDefault();
    if (!video.embedUrl || !start()) return;
    try {
      const result = HeroResponseSchema.safeParse(await responseBody(await fetch("/api/admin/hero", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "video", videoUrl, expectedUpdatedAt: media?.updatedAt ?? null }) })));
      if (!result.success || !result.data.value) throw new Error("Could not confirm the saved video. Load the latest cover before trying again.");
      adopt(result.data.value);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save the video. Try again."); }
    finally { finish(); }
  }

  async function loadLatest() {
    if (!start()) return;
    try {
      const result = HeroResponseSchema.safeParse(await responseBody(await fetch("/api/admin/hero", { cache: "no-store" })));
      if (!result.success) throw new Error("Could not load the current cover. Try again.");
      const latest = result.data.value;
      const sourceChanged = draft?.source.kind === "current" && draft.previewUrl !== latest?.imageUrl;
      if (sourceChanged && dirty && !confirm("The published photograph has changed. Discard your focal point and description edits to load the new cover?")) {
        setStatus("Your draft is still available. Load the latest cover when you are ready to discard these edits.");
        return;
      }
      setMedia(latest);
      setDraft((current) => current?.source.kind === "current"
        ? dirty && !sourceChanged ? current : draftFromMedia(latest)
        : current ?? draftFromMedia(latest));
      setStatus(sourceChanged ? "The new published cover is loaded. Your previous framing draft was discarded." : "Latest cover loaded. Review your draft before publishing.");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load the cover. Try again."); }
    finally { finish(); }
  }

  async function reset() {
    if (!media || !confirm("Reset the homepage cover to your featured portfolio photograph? Any unpublished draft will be discarded.")) return;
    if (!start()) return;
    try {
      await responseBody(await fetch("/api/admin/hero", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ expectedUpdatedAt: media.updatedAt }) }));
      setMedia(null);
      setDraft(null);
      setVideoUrl("");
      setStatus("Cover reset. The homepage now uses your featured portfolio photograph.");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not reset the cover. Try again."); }
    finally { finish(); }
  }

  const draftUrl = draft ? brandedImageLoader({ src: draft.previewUrl, width: 1440 }) : "";

  return (
    <div className="min-w-0 space-y-6 text-base">
      <section className="border border-line bg-white p-5 sm:p-7" aria-labelledby="current-cover-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="current-cover-heading" className="text-lg font-medium text-ink">Homepage cover</h2>
          <span className="text-base text-ink-soft">Published</span>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          {media?.kind === "image" && media.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandedImageLoader({ src: media.imageUrl, width: 384 })} alt={media.imageAlt} className="h-28 w-28 object-cover" style={{ objectPosition: heroObjectPosition(media) }} />
          ) : <div className="grid h-28 w-28 place-items-center bg-greige px-2 text-center text-ink-soft">{media?.kind === "video" ? "Video cover" : "Automatic"}</div>}
          <p className="min-w-0 flex-1 text-base leading-6 text-ink-soft">{media?.kind === "image" ? "Your chosen photograph opens the homepage." : media?.kind === "video" ? "Your selected film opens the homepage." : "The homepage uses your featured portfolio photograph. Choose a photo to set its own focal point."}</p>
        </div>
        {media ? <button type="button" onClick={reset} disabled={busy} className="mt-4 min-h-11 text-base text-ink-soft underline underline-offset-4 disabled:opacity-40">Reset to automatic selection</button> : null}
      </section>

      {status ? <p role="status" className="text-base leading-6 text-emerald-700">{status} <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center underline">View homepage ↗</a></p> : null}
      {error ? <div role="alert" className="border border-danger/30 bg-white p-4 text-base leading-6 text-danger"><p>{error}</p><button type="button" disabled={busy} onClick={loadLatest} className="mt-2 min-h-11 text-base underline disabled:opacity-40">Load latest cover</button></div> : null}

      <div role="group" aria-label="Cover format" className="flex gap-5 border-b border-line">
        {(["photo", "video"] as const).map((format) => <button key={format} type="button" disabled={busy} onClick={() => setTab(format)} aria-pressed={tab === format} className={`min-h-11 border-b-2 px-1 py-2 text-base disabled:opacity-40 ${tab === format ? "border-ink font-medium text-ink" : "border-transparent text-ink-soft"}`}>{format === "photo" ? "Photograph" : "Video link"}</button>)}
      </div>

      {tab === "photo" ? <section className="min-w-0 border border-line bg-white p-5 sm:p-7" aria-labelledby="photo-cover-heading">
        <h2 id="photo-cover-heading" className="text-lg font-medium text-ink">Choose your cover photograph</h2>
        <p className="mt-2 text-base leading-6 text-ink-soft">Select a photograph, frame the subject, then publish. Your selection stays private until you save.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={() => setSourcePanel(sourcePanel === "library" ? null : "library")} aria-expanded={sourcePanel === "library"} className={secondary}>Choose from portfolio</button>
          <button type="button" disabled={busy} onClick={() => setSourcePanel(sourcePanel === "upload" ? null : "upload")} aria-expanded={sourcePanel === "upload"} className={secondary}>Upload a photo</button>
        </div>
        {sourcePanel === "upload" ? <div className="mt-5 border border-line p-4">
          <label className="block text-base text-ink">Choose a file from your device<input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => chooseFile(event.target.files?.[0])} disabled={busy} className="mt-3 block min-h-11 w-full min-w-0 max-w-full text-base file:mr-3 file:min-h-11 file:border-0 file:bg-ink file:px-3 file:text-base file:text-white" /></label>
          <p className="mt-3 text-base leading-6 text-ink-soft">JPEG, PNG, WebP, or AVIF, up to 20 MB. A large original keeps the full width cover sharp.</p>
        </div> : null}
        {sourcePanel === "library" ? <div className="mt-5 border border-line p-4">
          <label className="block text-base text-ink">Find a photograph<input value={search} onChange={(event) => setSearch(event.target.value)} disabled={busy} type="search" className="mt-2 min-h-11 w-full border border-line px-3 py-2 text-base" /></label>
          {!visiblePhotos.length ? <p className="mt-4 text-base text-ink-soft">{library.length ? "No photographs match. Try another search." : "Your portfolio is empty. Upload a cover photograph to get started."}</p> : <div className="mt-4 grid max-h-[32rem] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">{visiblePhotos.map((photo) => <button key={photo.slug} type="button" disabled={busy} onClick={() => choosePhoto(photo)} aria-label={`Use ${photo.alt}`} className="min-w-0 border border-line text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brandedImageLoader({ src: photo.url, width: 384 })} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
            <span className="block px-2 py-3 text-base leading-5 text-ink line-clamp-2">{photo.alt}</span>
            {photo.width && photo.height && Math.max(photo.width, photo.height) < 2400 ? <span className="block px-2 pb-3 text-base leading-5 text-ink-soft">Small original. May look soft on large screens.</span> : null}
          </button>)}</div>}
        </div> : null}
        {draft ? <div id="framing" className="mt-8 border-t border-line pt-6">
          <h3 className="text-lg font-medium text-ink">Choose the focal point</h3>
          <p id="focus-help" className="mt-2 text-base leading-6 text-ink-soft">Tap the subject in the full photo, or adjust the sliders. The crosshair marks the point kept in view as the cover crops.</p>
          <button type="button" onClick={placeFocus} disabled={busy || previewError} aria-label="Place focal point on the full photograph" aria-describedby="focus-help" className="relative mx-auto mt-5 block w-fit max-w-full cursor-crosshair bg-greige focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:opacity-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draftUrl} alt={draft.alt} draggable={false} onError={() => setPreviewError(true)} onLoad={() => setPreviewError(false)} className="block max-h-[34rem] max-w-full" />
            <span aria-hidden="true" className="pointer-events-none absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-ink text-xl text-white shadow-lg" style={{ left: `${draft.focus.focusX * 100}%`, top: `${draft.focus.focusY * 100}%` }}>⌖</span>
          </button>
          {previewError ? <p role="alert" className="mt-3 text-base text-danger">The preview could not load. Choose the photograph again or select another photo.</p> : null}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{([["Left / right", "focusX"], ["Up / down", "focusY"]] as const).map(([label, key]) => <label key={key} htmlFor={`hero-${key}`} className="text-base text-ink">{label} <output htmlFor={`hero-${key}`} className="text-ink-soft">{Math.round(draft.focus[key] * 100)}%</output><input id={`hero-${key}`} type="range" min="0" max="1" step="0.01" disabled={busy} value={draft.focus[key]} onChange={(event) => { setDraft({ ...draft, focus: { ...draft.focus, [key]: Number(event.target.value) } }); setStatus(null); }} className="block min-h-11 w-full accent-ink" /></label>)}</div>
          <label className="mt-4 block text-base text-ink">Photo description<input value={draft.alt} maxLength={200} disabled={busy} onChange={(event) => { setDraft({ ...draft, alt: event.target.value }); setStatus(null); }} className="mt-2 min-h-11 w-full border border-line px-3 py-2 text-base" /></label>
          <p className="mt-2 text-base leading-6 text-ink-soft">Describe the image for visitors who use a screen reader.</p>
          <div className="mt-6 grid items-start gap-5 md:grid-cols-[2fr_1fr]">{([["Desktop example · 1440 × 900", "aspect-[1440/900]"], ["Mobile example · 390 × 844", "aspect-[390/844] max-w-[15rem]"]] as const).map(([label, ratio]) => <div key={label}><p className="mb-3 text-base text-ink-soft">{label}</p><div className={`relative w-full overflow-hidden bg-greige ${ratio}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={draftUrl} alt="" className="absolute inset-0 size-full object-cover" style={{ objectPosition: heroObjectPosition(draft.focus) }} />
          </div></div>)}</div>
          <p className="mt-4 text-base leading-6 text-ink-soft">Viewport examples. The visible area adjusts with each visitor’s screen.</p>
          <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={publishPhoto} disabled={busy || !dirty || !draft.alt.trim() || previewError} className={primary}>{busy ? "Saving…" : draft.source.kind === "current" ? "Save focal point" : "Publish cover"}</button><button type="button" disabled={busy || !dirty} onClick={() => { setDraft(draftFromMedia(media)); setSourcePanel(null); setPreviewError(false); setError(null); setStatus("Draft discarded. Your published cover is unchanged."); }} className={secondary}>Discard changes</button></div>
        </div> : <p className="mt-6 text-base leading-6 text-ink-soft">Choose from your portfolio or upload a photograph to preview and frame it.</p>}
      </section> : <form onSubmit={saveVideo} className="border border-line bg-white p-5 sm:p-7">
        <h2 className="text-lg font-medium text-ink">Use a film</h2>
        <label className="mt-4 block text-base text-ink">Video link<input value={videoUrl} disabled={busy} onChange={(event) => setVideoUrl(event.target.value)} placeholder="YouTube, Vimeo, or a direct video file link" className="mt-2 min-h-11 w-full border border-line px-3 py-2 text-base" /></label>
        {videoUrl ? <p className="mt-3 text-base leading-6 text-ink-soft">{video.embedUrl ? `This ${video.provider === "file" ? "video file" : video.provider} video will play as a silent cover.` : "Use a YouTube, Vimeo, or direct video file link."}</p> : null}
        <button type="submit" disabled={busy || !video.embedUrl} className={`mt-5 ${primary}`}>{busy ? "Saving…" : "Publish video cover"}</button>
      </form>}
    </div>
  );
}
