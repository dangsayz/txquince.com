"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SlotListItem } from "@/lib/image-slot-admin";
import { focalPosition, renditionUrl } from "@/lib/image-slot-shared";
import { SlotEditor, formatDay } from "@/components/slots/SlotEditor";

const INK = "#111110";

function thumb(s: SlotListItem): { src: string; position?: string } {
  const v = s.current;
  if (!v) return { src: s.defaultSrc };
  const w = v.widths.find((x) => x >= 480) ?? v.widths[v.widths.length - 1];
  return { src: renditionUrl(v.key, w, v.ext ?? "webp"), position: focalPosition(v.focal) };
}

export function ImagesManager({ slots }: { slots: SlotListItem[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SlotListItem | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out: { group: string; slots: SlotListItem[] }[] = [];
    for (const s of slots) {
      if (q && !`${s.group} ${s.label}`.toLowerCase().includes(q)) continue;
      const last = out[out.length - 1];
      if (last?.group === s.group) last.slots.push(s);
      else out.push({ group: s.group, slots: [s] });
    }
    return out;
  }, [slots, query]);

  const changed = slots.filter((s) => s.current).length;

  async function undo(s: SlotListItem) {
    setBusy(s.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/images/${encodeURIComponent(s.id)}/undo`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(d.error ?? "Could not undo.");
      setMessage(`Undone: ${s.label}`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not undo.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6" style={{ color: INK }}>
      <div className="flex flex-wrap items-end gap-4">
        <label className="block min-w-0 flex-1 sm:max-w-sm">
          <span className="text-base font-medium">Find a photo — try “Dallas” or “blog”</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-1 block min-h-12 w-full border px-3 text-base"
            style={{ borderColor: INK, color: INK }}
          />
        </label>
        <p className="text-base">
          {slots.length} spots · {changed} changed
        </p>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-6 text-base font-medium">
        {message}
      </p>

      {groups.map(({ group, slots: list }) => (
        <section key={group} className="mt-8" aria-labelledby={`g-${group}`}>
          <h2 id={`g-${group}`} className="border-b pb-2 text-lg font-semibold" style={{ borderColor: INK }}>
            {group}
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((s) => {
              const t = thumb(s);
              return (
                <li key={s.id} className="flex flex-col border" style={{ borderColor: INK }}>
                  <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "#f4f4f2" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                    <img src={t.src} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: t.position }} />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="text-base font-medium leading-snug">{s.label}</p>
                    <p className="text-base">{s.current ? `Changed on ${formatDay(s.current.uploadedAt)}` : "Original"}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditing(s)}
                        aria-label={`Replace: ${s.label}`}
                        className="inline-flex min-h-11 items-center whitespace-nowrap px-4 text-base font-medium text-white"
                        style={{ background: INK }}
                      >
                        Replace
                      </button>
                      {s.current ? (
                        <button
                          type="button"
                          onClick={() => undo(s)}
                          disabled={busy === s.id}
                          aria-label={`Undo: ${s.label}`}
                          className="inline-flex min-h-11 items-center whitespace-nowrap border px-4 text-base"
                          style={{ borderColor: INK }}
                        >
                          {busy === s.id ? "Undoing…" : "Undo"}
                        </button>
                      ) : null}
                      <a href={s.page} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center whitespace-nowrap px-2 text-base underline underline-offset-4">
                        View <span aria-hidden>↗</span>
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {groups.length === 0 ? <p className="mt-8 text-base">No photo matches “{query}”.</p> : null}

      {editing ? (
        <SlotEditor
          slot={editing.id}
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setMessage("Saved. The website shows the new photo now.");
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
