"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { PortfolioImage } from "@/lib/content-db";

const SECTIONS: { value: string; label: string }[] = [
  { value: "save-the-date", label: "Save-the-Date" },
  { value: "church", label: "Church & Mass" },
  { value: "portraits", label: "Portraits" },
  { value: "celebration", label: "The Celebration" },
  { value: "films", label: "Films" },
];

function publicUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/portfolio/${path}`;
}

function extOf(file: File): string {
  return (file.name.split(".").pop() || "jpg").toLowerCase().replace("jpeg", "jpg");
}

const SECTION_ALT_PHRASE: Record<string, string> = {
  "save-the-date": "Quinceañera save-the-date photo",
  church: "Quinceañera church ceremony photo",
  portraits: "Quinceañera portrait",
  celebration: "Quinceañera celebration photo",
  films: "Quinceañera film still",
};

/**
 * Free, no-AI starting alt text built from what the upload already knows:
 * the file name (if it's a real name, not a camera serial like IMG_4821),
 * the section, and the tagged location. Always editable afterward.
 */
function defaultAlt(fileName: string, section: string, location: string): string {
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Camera/phone serial names (IMG_4821, DSC0042, PXL_2026...) say nothing —
  // fall back to the section phrase instead.
  const isCameraName =
    /^(img|dsc|dscf|dcim|pxl|gopr|mvimg|p|photo|image|untitled|screenshot|edit|export|final)?[\s\d()]*$/i.test(
      base,
    );
  const subject = isCameraName || !base ? SECTION_ALT_PHRASE[section] ?? "Quinceañera photo" : base;
  const loc = location.trim();
  return (loc ? `${subject} at ${loc}` : subject).slice(0, 300);
}

/**
 * Resize (long edge ≤ 2400px) + recompress to WebP in the browser BEFORE upload.
 * Keeps full-resolution camera/phone files from bloating storage and wrecking
 * mobile LCP. Falls back to the original file if the browser can't decode it
 * (e.g. some HEIC) so an upload never silently fails.
 */
async function optimize(
  file: File,
): Promise<{ body: Blob; ext: string; type: string; width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) {
    return { body: file, ext: extOf(file), type: file.type || "image/jpeg" };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 2400;
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
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/webp", 0.82),
    );
    if (!blob) throw new Error("no-blob");
    // If compression somehow didn't help on an already-small file, keep original.
    if (blob.size >= file.size && file.size < 1_500_000) {
      return { body: file, ext: extOf(file), type: file.type, width: w, height: h };
    }
    return { body: blob, ext: "webp", type: "image/webp", width: w, height: h };
  } catch {
    return { body: file, ext: extOf(file), type: file.type || "image/jpeg" };
  }
}

/**
 * Location field with Facebook/Instagram-style autocomplete. Suggestions come
 * from `suggestions` (the distinct locations already tagged across the gallery),
 * so a place typed once reappears for every later photo and persists across
 * sessions. Type a new place to create it; pick an existing one to reuse it.
 */
function LocationCombobox({
  value,
  suggestions,
  onCommit,
}: {
  value: string | null;
  suggestions: string[];
  onCommit: (next: string | null) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside this field.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = draft.trim().toLowerCase();
  const matches = suggestions
    .filter((s) => s.toLowerCase().includes(q) && s.toLowerCase() !== q)
    .slice(0, 6);

  function commit(next: string) {
    const clean = next.trim();
    setDraft(clean);
    setOpen(false);
    setActive(-1);
    const normalized = clean || null;
    if (normalized !== (value ?? null)) onCommit(normalized);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={draft}
        placeholder="Location (where it was shot)"
        onChange={(e) => {
          setDraft(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(a + 1, matches.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, -1));
          } else if (e.key === "Enter") {
            e.preventDefault();
            commit(active >= 0 && matches[active] ? matches[active] : draft);
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            setOpen(false);
            setActive(-1);
          }
        }}
        onBlur={() => commit(draft)}
        className="w-full border-b border-line bg-transparent pb-1 text-xs focus:border-wine focus:outline-none"
      />
      {open && matches.length > 0 ? (
        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-44 overflow-auto border border-line bg-ivory shadow-[0_12px_30px_-12px_rgba(44,29,18,0.4)]">
          {matches.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                // mousedown (not click) so it fires before the input blur,
                // and preventDefault keeps focus so blur never overrides it.
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(s);
                }}
                onMouseEnter={() => setActive(i)}
                className={`block w-full px-2.5 py-1.5 text-left text-xs transition-colors ${
                  i === active ? "bg-greige text-ink" : "text-ink-soft"
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function PortfolioManager({ initial }: { initial: PortfolioImage[] }) {
  const [images, setImages] = useState<PortfolioImage[]>(initial);
  const [section, setSection] = useState<string>("celebration");
  const [uploadLocation, setUploadLocation] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [describing, setDescribing] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const grouped = useMemo(() => {
    const by: Record<string, PortfolioImage[]> = {};
    for (const s of SECTIONS) by[s.value] = [];
    for (const img of images) (by[img.section] ??= []).push(img);
    for (const k of Object.keys(by))
      by[k].sort((a, b) => a.sort_order - b.sort_order);
    return by;
  }, [images]);

  // Distinct locations already tagged across the gallery, most-used first —
  // the autocomplete source so a place typed once is reusable everywhere.
  const locationSuggestions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const img of images) {
      const loc = img.location?.trim();
      if (loc) counts.set(loc, (counts.get(loc) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
  }, [images]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const supabase = createBrowserSupabaseClient();
    const list = Array.from(files);
    const total = list.length;
    let done = 0;
    let failed = 0;

    const tick = () =>
      setStatus(
        `Optimizing & uploading ${done} of ${total}${failed ? ` · ${failed} failed` : ""}…`,
      );
    tick();

    async function upload(file: File) {
      try {
        const { body, ext, type, width, height } = await optimize(file);
        const signRes = await fetch("/api/admin/sign-upload", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ext }),
        });
        if (!signRes.ok) throw new Error("sign failed");
        const { path, token } = (await signRes.json()) as { path: string; token: string };

        const { error: upErr } = await supabase.storage
          .from("portfolio")
          .uploadToSignedUrl(path, token, body, { contentType: type });
        if (upErr) throw upErr;

        const recRes = await fetch("/api/admin/images", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            storage_path: path,
            section,
            alt: defaultAlt(file.name, section, uploadLocation),
            width,
            height,
            location: uploadLocation.trim() || undefined,
          }),
        });
        if (!recRes.ok) throw new Error("record failed");
        const { image } = (await recRes.json()) as { image: Omit<PortfolioImage, "url"> };
        setImages((prev) => [...prev, { ...image, url: publicUrl(image.storage_path) }]);
      } catch {
        failed++;
      } finally {
        done++;
        tick();
      }
    }

    // Upload a few at a time so hundreds of images import quickly.
    const CONCURRENCY = 3;
    const queue = [...list];
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (queue.length) {
          const f = queue.shift();
          if (f) await upload(f);
        }
      }),
    );

    setStatus(
      `Done — ${total - failed} uploaded${failed ? `, ${failed} failed (try again)` : ""}.`,
    );
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function patch(id: string, fields: Partial<PortfolioImage>) {
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, ...fields } : i)));
    await fetch("/api/admin/images", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
  }

  // Draft alt text for one image with the vision model and save it. The text is
  // editable afterward — this just fills the blank so you're not staring at an
  // empty field. Returns true on success so the bulk runner can pace itself.
  async function describe(img: PortfolioImage): Promise<boolean> {
    setDescribing((prev) => new Set(prev).add(img.id));
    try {
      const res = await fetch("/api/admin/describe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: img.url }),
      });
      const data = (await res.json().catch(() => ({}))) as { alt?: string; error?: string };
      if (res.ok && data.alt) {
        await patch(img.id, { alt: data.alt });
        return true;
      }
      setStatus(data.error || "Could not generate alt text.");
      return false;
    } catch {
      setStatus("Could not generate alt text.");
      return false;
    } finally {
      setDescribing((prev) => {
        const next = new Set(prev);
        next.delete(img.id);
        return next;
      });
    }
  }

  // Fill every blank alt field, one at a time (keeps cost predictable and avoids
  // hammering the model). Stops early if a request fails (e.g. key missing).
  async function describeBlankAlts() {
    const blanks = images.filter((i) => !i.alt?.trim());
    if (blanks.length === 0) {
      setStatus("Every image already has alt text.");
      return;
    }
    setBusy(true);
    let done = 0;
    for (const img of blanks) {
      setStatus(`Writing alt text… ${done}/${blanks.length}`);
      const ok = await describe(img);
      if (!ok) break;
      done++;
    }
    setStatus(`Done — wrote alt text for ${done} image${done === 1 ? "" : "s"}.`);
    setBusy(false);
  }

  // One-time: read intrinsic dimensions for images uploaded before we started
  // storing them, so the public masonry grid reserves space (no layout shift).
  async function backfillDimensions() {
    const missing = images.filter((i) => !i.width || !i.height);
    if (missing.length === 0) {
      setStatus("All images already have sizes — nothing to fix.");
      return;
    }
    setBusy(true);
    let done = 0;
    for (const img of missing) {
      try {
        const dims = await new Promise<{ w: number; h: number }>((res, rej) => {
          const el = new window.Image();
          el.onload = () => res({ w: el.naturalWidth, h: el.naturalHeight });
          el.onerror = () => rej(new Error("load-failed"));
          el.src = img.url;
        });
        if (dims.w && dims.h) {
          await patch(img.id, { width: dims.w, height: dims.h });
          done++;
        }
      } catch {
        /* skip unreadable image */
      }
      setStatus(`Fixing image sizes… ${done}/${missing.length}`);
    }
    setStatus(`Done — added sizes to ${done} image${done === 1 ? "" : "s"}.`);
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this image? This cannot be undone.")) return;
    setImages((prev) => prev.filter((i) => i.id !== id));
    await fetch("/api/admin/images", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function move(sectionKey: string, index: number, dir: -1 | 1) {
    const list = [...grouped[sectionKey]];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    const reordered = list.map((img, i) => ({ ...img, sort_order: i }));
    setImages((prev) =>
      prev.map((i) => reordered.find((r) => r.id === i.id) ?? i),
    );
    await fetch("/api/admin/images/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(reordered.map((r) => ({ id: r.id, sort_order: r.sort_order }))),
    });
  }

  return (
    <div>
      {/* Upload bar */}
      <div className="flex flex-wrap items-center gap-4 border border-line bg-ivory p-5">
        <label className="text-sm text-ink">
          Upload into{" "}
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="border-b border-line bg-transparent py-1 focus:border-wine focus:outline-none"
          >
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          at
          <div className="w-52">
            <LocationCombobox
              value={uploadLocation || null}
              suggestions={locationSuggestions}
              onCommit={(loc) => setUploadLocation(loc ?? "")}
            />
          </div>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
          className="text-sm text-ink-soft file:mr-3 file:rounded-full file:border file:border-wine file:bg-transparent file:px-5 file:py-2 file:text-[0.66rem] file:uppercase file:tracking-[0.16em] file:text-wine"
        />
        {images.some((i) => !i.width || !i.height) ? (
          <button
            type="button"
            onClick={backfillDimensions}
            disabled={busy}
            className="rounded-full border border-line px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-50"
            title="Read sizes for older images so the public grid loads without shifting"
          >
            Fix image sizes
          </button>
        ) : null}
        {images.some((i) => !i.alt?.trim()) ? (
          <button
            type="button"
            onClick={describeBlankAlts}
            disabled={busy}
            className="rounded-full border border-line px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-50"
            title="Draft alt text with AI for every image still missing it (you can edit after)"
          >
            Write blank alt text
          </button>
        ) : null}
        {status ? <span className="text-xs text-ink-faint">{status}</span> : null}
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        Select as many as you like — images are automatically resized and
        optimized in your browser before upload (originals stay on your computer).
        Then curate ruthlessly: a few stunning frames beat a hundred good ones.
      </p>

      {/* Sections */}
      {SECTIONS.map((s) => (
        <section key={s.value} className="mt-10">
          <div className="flex items-baseline justify-between border-b border-line pb-2">
            <h2 className="font-display text-xl text-ink">{s.label}</h2>
            <span className="text-xs text-ink-faint">
              {grouped[s.value].length} image{grouped[s.value].length === 1 ? "" : "s"}
            </span>
          </div>

          {grouped[s.value].length === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">No images yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {grouped[s.value].map((img, i) => (
                <div key={img.id} className="border border-line bg-ivory">
                  {/* Click the photo to set its focal anchor — cropped renders
                      (homepage spreads, hero) keep that point in frame. */}
                  <button
                    type="button"
                    title="Click where her face is — crops will keep that point in frame"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const fx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
                      const fy = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
                      patch(img.id, {
                        focus_x: Math.round(fx * 100) / 100,
                        focus_y: Math.round(fy * 100) / 100,
                      });
                    }}
                    className="relative block aspect-[3/4] w-full cursor-crosshair bg-greige"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || "portfolio image"}
                      fill
                      sizes="200px"
                      className="object-cover"
                      unoptimized
                    />
                    {/* current anchor marker */}
                    <span
                      aria-hidden
                      className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cream bg-wine/80 shadow"
                      style={{
                        left: `${(img.focus_x ?? 0.5) * 100}%`,
                        top: `${(img.focus_y ?? 0.5) * 100}%`,
                      }}
                    />
                    {img.is_feature ? (
                      <span className="absolute left-2 top-2 bg-wine px-2 py-0.5 text-[0.55rem] uppercase tracking-[0.14em] text-cream">
                        Featured
                      </span>
                    ) : null}
                  </button>
                  <div className="flex flex-col gap-2 p-2.5">
                    <div className="flex items-end gap-1.5">
                      <input
                        key={`alt-${img.id}-${img.alt}`}
                        defaultValue={img.alt}
                        placeholder="Alt text (describe the photo)"
                        onBlur={(e) =>
                          e.target.value !== img.alt && patch(img.id, { alt: e.target.value })
                        }
                        className="w-full border-b border-line bg-transparent pb-1 text-xs focus:border-wine focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => describe(img)}
                        disabled={describing.has(img.id)}
                        title="Draft alt text with AI (you can edit it)"
                        className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-40"
                      >
                        {describing.has(img.id) ? "…" : "AI"}
                      </button>
                    </div>
                    <select
                      value={img.section}
                      onChange={(e) => patch(img.id, { section: e.target.value })}
                      className="w-full border-b border-line bg-transparent pb-1 text-xs focus:border-wine focus:outline-none"
                    >
                      {SECTIONS.map((ss) => (
                        <option key={ss.value} value={ss.value}>
                          {ss.label}
                        </option>
                      ))}
                    </select>
                    <LocationCombobox
                      value={img.location}
                      suggestions={locationSuggestions}
                      onCommit={(location) => patch(img.id, { location })}
                    />
                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-1.5 text-ink-soft">
                        <input
                          type="checkbox"
                          checked={img.is_feature}
                          onChange={(e) => patch(img.id, { is_feature: e.target.checked })}
                        />
                        Feature
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => move(s.value, i, -1)}
                          disabled={i === 0}
                          className="px-1.5 text-ink-soft disabled:opacity-30"
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => move(s.value, i, 1)}
                          disabled={i === grouped[s.value].length - 1}
                          className="px-1.5 text-ink-soft disabled:opacity-30"
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => remove(img.id)}
                          className="px-1.5 text-wine"
                          aria-label="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
