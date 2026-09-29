"use client";

import { useState } from "react";
import type { VideoRow } from "@/lib/content-db";

function poster(v: VideoRow): string | null {
  if (v.poster_url) return v.poster_url;
  if (v.provider === "youtube" && v.video_id)
    return `https://i.ytimg.com/vi/${v.video_id}/hqdefault.jpg`;
  return null;
}

export function VideosManager({ initial }: { initial: VideoRow[] }) {
  const [videos, setVideos] = useState<VideoRow[]>(
    [...initial].sort((a, b) => a.sort_order - b.sort_order),
  );
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/videos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, title }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Could not add video.");
      setBusy(false);
      return;
    }
    const { video } = (await res.json()) as { video: VideoRow };
    setVideos((p) => [...p, video]);
    setUrl("");
    setTitle("");
    setBusy(false);
  }

  async function patch(id: string, fields: Partial<VideoRow>) {
    setVideos((p) => p.map((v) => (v.id === id ? { ...v, ...fields } : v)));
    await fetch("/api/admin/videos", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
  }

  async function remove(id: string) {
    if (!confirm("Remove this video?")) return;
    setVideos((p) => p.filter((v) => v.id !== id));
    await fetch("/api/admin/videos", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= videos.length) return;
    const list = [...videos];
    [list[index], list[target]] = [list[target], list[index]];
    const reordered = list.map((v, i) => ({ ...v, sort_order: i }));
    setVideos(reordered);
    await fetch("/api/admin/videos/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(reordered.map((r) => ({ id: r.id, sort_order: r.sort_order }))),
    });
  }

  return (
    <div>
      <form
        onSubmit={add}
        className="flex flex-col gap-3 border border-line bg-white p-5 sm:flex-row sm:items-end"
      >
        <label className="flex-1 text-sm text-ink">
          Video link
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a YouTube, Vimeo, or QuinceNetwork link…"
            className="mt-1 w-full min-h-11 rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          />
        </label>
        <label className="text-sm text-ink sm:w-56">
          Title (optional)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sofia's Quinceañera"
            className="mt-1 w-full min-h-11 rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          />
        </label>
        <button
          type="submit"
          disabled={busy || !url}
          className="min-h-12 rounded-lg bg-accent px-6 py-2.5 text-base font-medium text-cream hover:bg-accent-strong disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      <div className="mt-8 flex flex-col gap-3">
        {videos.length === 0 ? (
          <p className="text-sm text-ink-faint">No videos yet. Paste a link above.</p>
        ) : (
          videos.map((v, i) => {
            const p = poster(v);
            return (
              <div
                key={v.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-white p-4"
              >
                <div className="relative h-16 w-28 shrink-0 overflow-hidden bg-greige">
                  {p ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm uppercase tracking-wider text-ink-faint">
                      {v.provider}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 basis-full sm:basis-52">
                  <input
                    defaultValue={v.title}
                    placeholder="Title"
                    onBlur={(e) =>
                      e.target.value !== v.title && patch(v.id, { title: e.target.value })
                    }
                    className="w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent"
                  />
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block truncate text-xs text-ink-faint hover:text-accent"
                  >
                    {v.provider} · {v.url}
                  </a>
                  {!p ? (
                    <input
                      defaultValue={v.poster_url ?? ""}
                      placeholder="Poster image URL (recommended for this link type)"
                      onBlur={(e) =>
                        e.target.value !== (v.poster_url ?? "") &&
                        patch(v.id, { poster_url: e.target.value })
                      }
                      className="mt-1 min-h-11 w-full rounded-lg border border-line bg-white px-3 py-2 text-base focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent"
                    />
                  ) : null}
                </div>
                <label className="flex min-h-11 items-center gap-1.5 text-base text-ink-soft">
                  <input
                    type="checkbox"
                    checked={v.is_feature}
                    onChange={(e) => patch(v.id, { is_feature: e.target.checked })}
                  />
                  Feature
                </label>
                <label className="flex min-h-11 items-center gap-1.5 text-base text-ink-soft">
                  Shorts
                  <input
                    type="checkbox"
                    checked={v.orientation === "vertical"}
                    onChange={(e) =>
                      patch(v.id, { orientation: e.target.checked ? "vertical" : "landscape" })
                    }
                  />
                </label>
                <div className="flex items-center gap-2 text-ink-soft">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="min-h-11 min-w-11 rounded-lg border border-line disabled:opacity-30" aria-label="Up">↑</button>
                  <button onClick={() => move(i, 1)} disabled={i === videos.length - 1} className="min-h-11 min-w-11 rounded-lg border border-line disabled:opacity-30" aria-label="Down">↓</button>
                  <button onClick={() => remove(v.id)} className="min-h-11 min-w-11 rounded-lg border border-line text-danger" aria-label="Delete">✕</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
