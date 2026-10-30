"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DUMP_TAGS,
  TAG_LABELS,
  srcFor,
  type DumpAlbum,
  type DumpManifest,
  type DumpPhoto,
  type L,
} from "@/lib/photo-dump-shared";
import { shortName } from "./prepare-photo";
import { sendPhoto, UploadQueue, type QueueItem } from "./upload-queue";

export type SlotRow = { id: string; group: string; label: string; src: string; alt: string };

type Patch = (body: Record<string, unknown>) => Promise<boolean>;

/* ------------------------------ shared bits ------------------------------ */

const btn =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap border px-4 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50";
const btnPrimary = `${btn} min-h-12 border-neutral-950 bg-neutral-950 px-6 text-white hover:bg-neutral-700`;
const btnSecondary = `${btn} border-neutral-400 bg-white text-neutral-950 hover:bg-neutral-100`;
const btnDanger = `${btn} border-red-700 bg-white text-red-800 hover:bg-red-50`;
const input =
  "mt-1.5 block min-h-12 w-full border border-neutral-400 bg-white px-3 text-base text-neutral-950 focus:border-neutral-950 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black";
const label = "block text-base font-medium text-neutral-950";

function Thumb({ photo, size = 384, className = "" }: { photo: DumpPhoto; size?: number; className?: string }) {
  return (
    /* eslint-disable-next-line @next/next/no-img-element -- our own R2 media route, fixed square box */
    <img
      src={srcFor(photo, size)}
      alt={photo.alt.en || ""}
      width={photo.w}
      height={photo.h}
      loading="lazy"
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

function dateLabel(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) || d.getTime() === 0
    ? ""
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* -------------------------------- manager -------------------------------- */

export function PhotosManager({ initial, slots }: { initial: DumpManifest | null; slots: SlotRow[] }) {
  const [manifest, setManifest] = useState<DumpManifest | null>(initial);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/photos", { cache: "no-store" });
      if (res.ok) setManifest(((await res.json()) as { manifest: DumpManifest }).manifest);
    } catch {
      /* keep what we have */
    }
  }, []);

  const patch: Patch = useCallback(async (body) => {
    setError(null);
    try {
      const res = await fetch("/api/admin/photos", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { manifest?: DumpManifest; error?: string };
      if (!res.ok || !data.manifest) {
        setError(res.status === 401 ? "You were signed out. Sign in again, then try again." : data.error ?? "That didn't save. Please try again.");
        return false;
      }
      setManifest(data.manifest);
      return true;
    } catch {
      setError("No connection. Please try again.");
      return false;
    }
  }, []);

  if (!manifest) {
    return (
      <div className="mt-8 border border-neutral-300 bg-white p-6 text-base leading-7 text-neutral-950">
        <p className="font-medium">Photo storage isn&rsquo;t connected here.</p>
        <p className="mt-1">This page works on the live website (txquince.com). Open it there to add photos.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-12">
      {error && (
        <p role="alert" className="sticky top-2 z-20 border border-red-300 bg-red-50 px-4 py-3 text-base text-red-900">
          {error}
        </p>
      )}
      <Uploader onSettled={reload} />
      <Library manifest={manifest} patch={patch} />
      <HomeSlots manifest={manifest} slots={slots} patch={patch} />
    </div>
  );
}

/* -------------------------------- uploader ------------------------------- */

function Uploader({ onSettled }: { onSettled: () => void }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const queue = useRef<UploadQueue | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"album" | "single">("album");
  const [title, setTitle] = useState<L>({ en: "", es: "" });
  const [caption, setCaption] = useState<L>({ en: "", es: "" });
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const [formError, setFormError] = useState("");
  const [over, setOver] = useState(false);

  useEffect(() => {
    const q = new UploadQueue(setItems, 2);
    queue.current = q;
    return () => q.dispose();
  }, []);

  const done = items.filter((i) => i.state === "done").length;
  const failed = items.filter((i) => i.state === "failed").length;
  const settled = started && items.length > 0 && done + failed === items.length;

  // Refresh the library each time a batch settles.
  useEffect(() => {
    if (settled) onSettled();
  }, [settled, onSettled]);

  function add(list: FileList | File[] | null | undefined) {
    if (!list || !list.length || !queue.current) return;
    setProblems(queue.current.add([...list]));
    setFormError("");
    if (fileInput.current) fileInput.current.value = "";
  }

  async function start() {
    if (!queue.current || !items.length) return;
    if (mode === "album" && !title.en.trim() && !title.es.trim()) {
      setFormError("Give the album a name first (for example: Sofía’s quince).");
      return;
    }
    setFormError("");
    setStarting(true);
    try {
      let fields: Record<string, string>;
      if (mode === "album") {
        const res = await fetch("/api/admin/photos", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "createAlbum", title, caption }),
        });
        const data = (await res.json().catch(() => ({}))) as { album?: DumpAlbum; error?: string };
        if (!res.ok || !data.album) throw new Error(data.error ?? "Could not start the album. Please try again.");
        fields = { albumId: data.album.id };
      } else {
        fields = { titleEn: title.en, titleEs: title.es };
      }
      queue.current.start(sendPhoto(fields));
      setStarted(true);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Could not start. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  function reset() {
    queue.current?.clear();
    setStarted(false);
    setTitle({ en: "", es: "" });
    setCaption({ en: "", es: "" });
    setProblems([]);
    setFormError("");
  }

  return (
    <section aria-labelledby="upload-title" className="border border-neutral-300 bg-white">
      <div className="border-b border-neutral-200 px-4 py-5 sm:px-6">
        <h2 id="upload-title" className="text-xl font-medium tracking-[-0.02em] text-neutral-950">
          Add photos
        </h2>
        <p className="mt-1 text-base text-neutral-950">Pick a few or a few hundred. We shrink them for the web before they upload.</p>
      </div>

      <div className="grid gap-6 px-4 py-6 sm:px-6">
        <label
          className={`flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-4 py-8 text-center focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black ${
            over ? "border-neutral-950 bg-neutral-100" : "border-neutral-400 bg-[#faf8f5]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            add(e.dataTransfer.files);
          }}
        >
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => add(e.target.files)}
          />
          <span className="inline-flex min-h-12 items-center bg-neutral-950 px-6 text-base font-medium text-white">
            {items.length ? "Add more photos" : "Choose photos"}
          </span>
          <span className="text-base text-neutral-950">or drag them here</span>
        </label>

        {problems.length > 0 && (
          <ul role="alert" className="grid gap-1 border border-amber-400 bg-amber-50 px-4 py-3 text-base text-neutral-950">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}

        {items.length > 0 && !started && (
          <div className="grid gap-5">
            <fieldset className="grid gap-3 sm:grid-cols-2">
              <legend className="mb-2 text-base font-medium text-neutral-950">
                How should {plural(items.length, "photo")} show?
              </legend>
              {(
                [
                  ["album", "As one album", "Photos from the same quince stay together."],
                  ["single", "As single photos", "Each photo shows on its own."],
                ] as const
              ).map(([value, name, hint]) => (
                <label
                  key={value}
                  className={`flex min-h-16 cursor-pointer items-start gap-3 border px-4 py-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black ${
                    mode === value ? "border-neutral-950 bg-neutral-50" : "border-neutral-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="dump-mode"
                    value={value}
                    checked={mode === value}
                    onChange={() => setMode(value)}
                    className="mt-1 h-5 w-5 accent-neutral-950"
                  />
                  <span>
                    <span className="block text-base font-medium text-neutral-950">{name}</span>
                    <span className="block text-base text-neutral-950">{hint}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                {mode === "album" ? "Album name" : "Name (optional)"}
                <input className={input} value={title.en} maxLength={140} placeholder="Sofía’s quince" onChange={(e) => setTitle({ ...title, en: e.target.value })} />
              </label>
              <label className={label}>
                In Spanish (optional)
                <input className={input} value={title.es} maxLength={140} placeholder="Los XV de Sofía" onChange={(e) => setTitle({ ...title, es: e.target.value })} />
              </label>
            </div>
            {mode === "album" && (
              <details className="border border-neutral-200 px-4">
                <summary className="flex min-h-12 cursor-pointer items-center text-base font-medium text-neutral-950">Add a short caption (optional)</summary>
                <div className="grid gap-4 pb-4 sm:grid-cols-2">
                  <label className={label}>
                    Caption
                    <textarea className={`${input} min-h-24 py-2`} value={caption.en} maxLength={600} onChange={(e) => setCaption({ ...caption, en: e.target.value })} />
                  </label>
                  <label className={label}>
                    In Spanish
                    <textarea className={`${input} min-h-24 py-2`} value={caption.es} maxLength={600} onChange={(e) => setCaption({ ...caption, es: e.target.value })} />
                  </label>
                </div>
              </details>
            )}
            {formError && (
              <p role="alert" className="text-base text-red-800">
                {formError}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <button type="button" className={btnPrimary} disabled={starting} onClick={start}>
                {starting ? "Starting…" : `Upload ${plural(items.length, "photo")}`}
              </button>
              <button type="button" className={btnSecondary} onClick={reset} disabled={starting}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {started && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-neutral-200 py-3" aria-live="polite">
            <p className="text-base font-medium text-neutral-950">
              {settled && !failed
                ? `All ${plural(done, "photo")} uploaded. They’re on the homepage now.`
                : `${done} of ${items.length} uploaded${failed ? ` · ${failed} didn’t make it` : ""}`}
            </p>
            <div className="flex flex-wrap gap-3">
              {failed > 0 && (
                <button type="button" className={btnSecondary} onClick={() => queue.current?.retryAll()}>
                  Try those again
                </button>
              )}
              {settled && (
                <button type="button" className={btnSecondary} onClick={reset}>
                  Start a new upload
                </button>
              )}
            </div>
          </div>
        )}

        {items.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <QueueRow key={item.id} item={item} onRetry={() => queue.current?.retry(item.id)} onRemove={() => queue.current?.remove(item.id)} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function QueueRow({ item, onRetry, onRemove }: { item: QueueItem; onRetry: () => void; onRemove: () => void }) {
  const status =
    item.state === "waiting"
      ? "Waiting"
      : item.state === "preparing"
        ? "Getting it ready…"
        : item.state === "uploading"
          ? `Uploading ${item.progress}%`
          : item.state === "done"
            ? "Uploaded ✓"
            : item.error ?? "Didn’t upload";
  return (
    <li className="flex min-h-16 items-center gap-3 border border-neutral-200 bg-white p-2">
      <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file */}
        <img src={item.preview} alt="" width={56} height={56} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base text-neutral-950">{shortName(item.name)}</span>
        <span className={`block text-base ${item.state === "failed" ? "text-red-800" : "text-neutral-950"}`}>{status}</span>
        {(item.state === "uploading" || item.state === "preparing") && (
          <span className="mt-1 block h-1 w-full bg-neutral-200" aria-hidden>
            <span className="block h-1 bg-neutral-950 transition-[width]" style={{ width: `${item.state === "preparing" ? 5 : item.progress}%` }} />
          </span>
        )}
      </span>
      {item.state === "failed" && (
        <button type="button" className={`${btnSecondary} px-3`} onClick={onRetry}>
          Retry
        </button>
      )}
      {(item.state === "failed" || item.state === "waiting") && (
        <button type="button" className={`${btnSecondary} min-w-11 px-3`} onClick={onRemove} aria-label={`Remove ${item.name}`}>
          ×
        </button>
      )}
    </li>
  );
}

/* -------------------------------- library -------------------------------- */

function Library({ manifest, patch }: { manifest: DumpManifest; patch: Patch }) {
  const [selected, setSelected] = useState<string | null>(null);
  const total = manifest.albums.reduce((n, a) => n + a.photos.length, 0);

  return (
    <section aria-labelledby="library-title">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h2 id="library-title" className="text-xl font-medium tracking-[-0.02em] text-neutral-950">
            Your photos
          </h2>
          <p className="mt-1 text-base text-neutral-950">Tap a photo to star it, describe it, move it or delete it.</p>
        </div>
        <p className="text-base tabular-nums text-neutral-950">
          {plural(manifest.albums.length, "album")} · {plural(total, "photo")}
        </p>
      </div>
      {manifest.albums.length === 0 ? (
        <p className="py-10 text-base text-neutral-950">No photos yet. Add some above and they&rsquo;ll show here.</p>
      ) : (
        <ol className="mt-6 grid gap-8">
          {manifest.albums.map((album, i) => (
            <AlbumCard
              key={album.id}
              album={album}
              first={i === 0}
              last={i === manifest.albums.length - 1}
              selected={selected}
              onSelect={setSelected}
              patch={patch}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function AlbumCard({
  album,
  first,
  last,
  selected,
  onSelect,
  patch,
}: {
  album: DumpAlbum;
  first: boolean;
  last: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
  patch: Patch;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState<L>(album.title);
  const [caption, setCaption] = useState<L>(album.caption ?? { en: "", es: "" });
  const current = album.photos.find((p) => p.id === selected) ?? null;
  const name = album.title.en || album.title.es || (album.photos.length === 1 ? "Single photo" : "Untitled album");

  async function run(body: Record<string, unknown>) {
    setBusy(true);
    const ok = await patch(body);
    setBusy(false);
    return ok;
  }

  return (
    <li className={`border border-neutral-300 bg-white ${album.hidden ? "border-dashed" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-medium text-neutral-950">
            {name}
            {album.hidden && <span className="ml-2 inline-block border border-neutral-950 px-2 text-sm font-medium uppercase tracking-wide">Hidden</span>}
          </h3>
          {album.title.es && album.title.en && <p className="text-base text-neutral-950">ES: {album.title.es}</p>}
          <p className="text-base text-neutral-950">
            {plural(album.photos.length, "photo")}
            {dateLabel(album.createdAt) && ` · ${dateLabel(album.createdAt)}`}
            {album.source === "drive" && " · from Google Drive"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btnSecondary} onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
            {editing ? "Close" : "Edit name"}
          </button>
          <button type="button" className={`${btnSecondary} min-w-11 px-3`} disabled={busy || first} onClick={() => run({ action: "moveAlbum", albumId: album.id, delta: -1 })} aria-label={`Move ${name} up`}>
            ↑
          </button>
          <button type="button" className={`${btnSecondary} min-w-11 px-3`} disabled={busy || last} onClick={() => run({ action: "moveAlbum", albumId: album.id, delta: 1 })} aria-label={`Move ${name} down`}>
            ↓
          </button>
          <button type="button" className={btnSecondary} disabled={busy} onClick={() => run({ action: "album", albumId: album.id, hidden: !album.hidden })}>
            {album.hidden ? "Show" : "Hide"}
          </button>
          <button
            type="button"
            className={btnDanger}
            disabled={busy}
            onClick={() => {
              if (confirm(`Delete “${name}” and its ${plural(album.photos.length, "photo")}? This can’t be undone.`))
                void run({ action: "deleteAlbum", albumId: album.id });
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {editing && (
        <form
          className="grid gap-4 border-t border-neutral-200 px-4 py-5 sm:grid-cols-2 sm:px-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run({ action: "album", albumId: album.id, title, caption })) setEditing(false);
          }}
        >
          <label className={label}>
            Album name
            <input className={input} value={title.en} maxLength={140} onChange={(e) => setTitle({ ...title, en: e.target.value })} />
          </label>
          <label className={label}>
            In Spanish
            <input className={input} value={title.es} maxLength={140} onChange={(e) => setTitle({ ...title, es: e.target.value })} />
          </label>
          <label className={label}>
            Caption (optional)
            <textarea className={`${input} min-h-24 py-2`} value={caption.en} maxLength={600} onChange={(e) => setCaption({ ...caption, en: e.target.value })} />
          </label>
          <label className={label}>
            Caption in Spanish
            <textarea className={`${input} min-h-24 py-2`} value={caption.es} maxLength={600} onChange={(e) => setCaption({ ...caption, es: e.target.value })} />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      )}

      {album.photos.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 border-t border-neutral-200 p-3 sm:grid-cols-4 sm:p-4 lg:grid-cols-6 xl:grid-cols-8">
          {album.photos.map((p) => (
            <li key={p.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(selected === p.id ? null : p.id)}
                aria-pressed={selected === p.id}
                aria-label={`Photo ${p.alt.en || p.id}${p.featured ? ", starred" : ""}${p.hidden ? ", hidden" : ""}`}
                className={`relative block aspect-square w-full overflow-hidden bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                  selected === p.id ? "ring-4 ring-neutral-950 ring-offset-2" : ""
                }`}
              >
                <Thumb photo={p} className={p.hidden ? "opacity-40" : ""} />
                {p.featured && (
                  <span className="absolute left-1 top-1 bg-neutral-950 px-1.5 text-sm text-white" aria-hidden>
                    ★
                  </span>
                )}
                {p.hidden && (
                  <span className="absolute bottom-1 left-1 bg-white px-1.5 text-sm font-medium text-neutral-950" aria-hidden>
                    Hidden
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="border-t border-neutral-200 px-5 py-4 text-base text-neutral-950">This album is empty.</p>
      )}

      {current && (
        <PhotoEditor
          key={current.id}
          photo={current}
          index={album.photos.indexOf(current)}
          count={album.photos.length}
          patch={patch}
          onDeleted={() => onSelect(null)}
        />
      )}
    </li>
  );
}

function PhotoEditor({
  photo,
  index,
  count,
  patch,
  onDeleted,
}: {
  photo: DumpPhoto;
  index: number;
  count: number;
  patch: Patch;
  onDeleted: () => void;
}) {
  const [alt, setAlt] = useState<L>(photo.alt);
  const [tags, setTags] = useState<string[]>(photo.tags);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = alt.en !== photo.alt.en || alt.es !== photo.alt.es || tags.join() !== photo.tags.join();

  async function run(body: Record<string, unknown>) {
    setBusy(true);
    setSaved(false);
    const ok = await patch({ photoId: photo.id, ...body });
    setBusy(false);
    return ok;
  }

  return (
    <div className="grid gap-5 border-t border-neutral-950 bg-[#faf8f5] px-4 py-5 sm:px-5 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <div className="mx-auto w-full max-w-[18rem]" style={{ maxWidth: Math.min(288, photo.w) }}>
        <div className="overflow-hidden bg-neutral-100" style={{ aspectRatio: `${photo.w} / ${photo.h}` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- our own R2 media route; box reserves the ratio */}
          <img src={srcFor(photo, 640)} alt={photo.alt.en || ""} width={photo.w} height={photo.h} className="h-full w-full object-contain" />
        </div>
        <p className="mt-2 text-base text-neutral-950">
          Photo {index + 1} of {count} · {photo.w}×{photo.h}
        </p>
      </div>

      <div className="grid content-start gap-5">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={photo.featured ? btnPrimary : btnSecondary} aria-pressed={!!photo.featured} disabled={busy} onClick={() => run({ action: "photo", featured: !photo.featured })}>
            {photo.featured ? "★ Starred — shows first" : "☆ Star it (show first)"}
          </button>
          <button type="button" className={btnSecondary} disabled={busy} onClick={() => run({ action: "photo", hidden: !photo.hidden })}>
            {photo.hidden ? "Show it" : "Hide it"}
          </button>
          <button type="button" className={btnSecondary} disabled={busy || index === 0} onClick={() => run({ action: "movePhoto", delta: -1 })}>
            ← Earlier
          </button>
          <button type="button" className={btnSecondary} disabled={busy || index === count - 1} onClick={() => run({ action: "movePhoto", delta: 1 })}>
            Later →
          </button>
          <button
            type="button"
            className={btnDanger}
            disabled={busy}
            onClick={async () => {
              if (confirm("Delete this photo? This can’t be undone.") && (await run({ action: "deletePhoto" }))) onDeleted();
            }}
          >
            Delete photo
          </button>
        </div>

        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await run({ action: "photo", alt, tags })) setSaved(true);
          }}
        >
          <p className="text-base text-neutral-950">
            Describe the photo in a few words. Google reads this, and so do people who can&rsquo;t see the picture.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <label className={label}>
              Description
              <input className={input} value={alt.en} maxLength={300} placeholder="Quinceañera dancing with her dad" onChange={(e) => setAlt({ ...alt, en: e.target.value })} />
            </label>
            <label className={label}>
              In Spanish
              <input className={input} value={alt.es} maxLength={300} placeholder="Quinceañera bailando con su papá" onChange={(e) => setAlt({ ...alt, es: e.target.value })} />
            </label>
          </div>
          <fieldset>
            <legend className="text-base font-medium text-neutral-950">What&rsquo;s in it?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {DUMP_TAGS.map((t) => {
                const on = tags.includes(t);
                return (
                  <label
                    key={t}
                    className={`relative inline-flex min-h-11 cursor-pointer items-center whitespace-nowrap rounded-full border px-4 text-base focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black ${
                      on ? "border-neutral-950 bg-neutral-950 text-white" : "border-neutral-400 bg-white text-neutral-950"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
                    />
                    {TAG_LABELS[t].en}
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={btnPrimary} disabled={busy || !dirty}>
              {busy ? "Saving…" : "Save details"}
            </button>
            {saved && !dirty && (
              <span className="text-base text-neutral-950" role="status">
                Saved ✓
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------ homepage swaps --------------------------- */

function HomeSlots({ manifest, slots, patch }: { manifest: DumpManifest; slots: SlotRow[]; patch: Patch }) {
  const [picking, setPicking] = useState<SlotRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const photos = useMemo(() => manifest.albums.flatMap((a) => a.photos), [manifest]);
  const byKey = useMemo(() => new Map(photos.map((p) => [p.key, p])), [photos]);
  const groups = useMemo(() => {
    const map = new Map<string, SlotRow[]>();
    for (const s of slots) map.set(s.group, [...(map.get(s.group) ?? []), s]);
    return [...map.entries()];
  }, [slots]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (picking && !d.open) d.showModal();
    if (!picking && d.open) d.close();
  }, [picking]);

  async function choose(slot: string, key: string | null) {
    setBusy(slot);
    const ok = await patch({ action: "override", slot, key });
    setBusy(null);
    if (ok) setPicking(null);
  }

  return (
    <section aria-labelledby="slots-title">
      <div className="border-b border-neutral-200 pb-4">
        <h2 id="slots-title" className="text-xl font-medium tracking-[-0.02em] text-neutral-950">
          Change homepage pictures
        </h2>
        <p className="mt-1 max-w-[60ch] text-base text-neutral-950">
          Swap either picture at the top of the homepage for one of your uploaded photos. &ldquo;Use original&rdquo; puts it back.
        </p>
      </div>
      {groups.map(([group, rows]) => (
        <div key={group} className="mt-6">
          <h3 className="text-base font-semibold text-neutral-950">{group}</h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((slot) => {
              const chosen = manifest.overrides?.[slot.id] ? byKey.get(manifest.overrides[slot.id]) : undefined;
              return (
                <li key={slot.id} className="flex items-center gap-3 border border-neutral-300 bg-white p-3">
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100">
                    {chosen ? (
                      <Thumb photo={chosen} />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element -- static original in /public */
                      <img src={slot.src} alt={slot.alt} width={64} height={80} loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-medium text-neutral-950">{slot.label}</span>
                    <span className="block text-base text-neutral-950">{chosen ? "Your photo" : "Original"}</span>
                  </span>
                  <span className="flex shrink-0 flex-col gap-2">
                    <button type="button" className={`${btnSecondary} px-3`} disabled={!photos.length || busy === slot.id} onClick={() => setPicking(slot)}>
                      Change
                    </button>
                    {chosen && (
                      <button type="button" className={`${btnSecondary} px-3`} disabled={busy === slot.id} onClick={() => choose(slot.id, null)}>
                        Use original
                      </button>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      {!photos.length && <p className="mt-4 text-base text-neutral-950">Upload a photo first, then you can use it here.</p>}

      <dialog
        ref={dialog}
        aria-labelledby="picker-title"
        onClose={() => setPicking(null)}
        className="m-auto h-[min(90dvh,48rem)] w-[min(100vw-1rem,64rem)] max-w-none overflow-hidden border border-neutral-950 bg-white p-0 text-neutral-950 backdrop:bg-black/60"
      >
        {picking && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
              <h2 id="picker-title" className="min-w-0 text-lg font-medium">
                Pick a photo for: {picking.label}
              </h2>
              <button type="button" className={`${btnSecondary} px-3`} onClick={() => setPicking(null)}>
                Close
              </button>
            </div>
            <ul className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto p-3 sm:grid-cols-4 lg:grid-cols-6">
              {photos.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={busy === picking.id}
                    onClick={() => choose(picking.id, p.key)}
                    aria-label={`Use ${p.alt.en || "this photo"}`}
                    className={`relative block aspect-[4/5] w-full overflow-hidden bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                      manifest.overrides?.[picking.id] === p.key ? "ring-4 ring-neutral-950 ring-offset-2" : ""
                    }`}
                  >
                    <Thumb photo={p} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </dialog>
    </section>
  );
}

