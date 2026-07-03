"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { PortfolioImage, ImageVendorCredit, Vendor } from "@/lib/content-db";
import {
  CATEGORIES,
  CATEGORIES_BY_GROUP,
  GROUPS,
  altPhraseFor,
  categoryLabel,
  groupById,
  groupForCategory,
  VENDOR_CATEGORIES,
  vendorCategoryLabel,
  vendorCreditLabel,
} from "@/content/portfolio-taxonomy";

function publicUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/portfolio/${path}`;
}

function extOf(file: File): string {
  return (file.name.split(".").pop() || "jpg").toLowerCase().replace("jpeg", "jpg");
}

/** A grouped <select> of every category — one source of truth (taxonomy). */
function CategorySelect({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {CATEGORIES_BY_GROUP.map(({ group, categories }) => (
        <optgroup key={group.id} label={group.label}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

/**
 * Free, no-AI starting alt text built from what the upload already knows:
 * the file name (if it's a real name, not a camera serial like IMG_4821),
 * the category, and the tagged location. Always editable afterward.
 */
function defaultAlt(fileName: string, section: string, location: string): string {
  const base = fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Camera/phone serial names (IMG_4821, DSC0042, PXL_2026...) say nothing —
  // fall back to the category phrase instead.
  const isCameraName =
    /^(img|dsc|dscf|dcim|pxl|gopr|mvimg|p|photo|image|untitled|screenshot|edit|export|final)?[\s\d()]*$/i.test(
      base,
    );
  const subject = isCameraName || !base ? altPhraseFor(section) : base;
  const loc = location.trim();
  return (loc ? `${subject} at ${loc}` : subject).slice(0, 300);
}

/** Build the public-safe credit shape from a full vendor record. */
function toCredit(v: Vendor): ImageVendorCredit {
  return {
    vendor_id: v.id,
    name: v.name,
    business: v.business,
    slug: v.slug,
    category: v.category,
    ig_handle: v.ig_handle,
    website: v.website,
    role: null,
  };
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
    const MAX = 3200;
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
      canvas.toBlob(res, "image/webp", 0.9),
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
        <ul className="absolute left-0 right-0 z-20 mt-1 max-h-44 overflow-auto border border-line bg-ivory shadow-[0_12px_30px_-12px_rgba(28,26,23,0.4)]">
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

/**
 * Vendor tagging for one photo — the reusable directory in action. Type a
 * vendor's name/business/@handle: existing vendors autocomplete (pick to tag);
 * if she's new, "+ Add" opens a tiny form (name, business, category, IG, email,
 * website) that creates the record once and reuses it forever. Email/phone are
 * admin-only and never shown publicly.
 */
function VendorTagger({
  tagged,
  allVendors,
  onChange,
  onCreate,
}: {
  tagged: ImageVendorCredit[];
  allVendors: Vendor[];
  onChange: (vendorIds: string[]) => void;
  onCreate: (fields: Partial<Vendor> & { name: string }) => Promise<Vendor | null>;
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    business: string;
    category: string;
    ig_handle: string;
    email: string;
    website: string;
  }>({ name: "", business: "", category: "florist", ig_handle: "", email: "", website: "" });
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const taggedIds = new Set(tagged.map((t) => t.vendor_id));
  const q = draft.trim().toLowerCase();
  const matches = allVendors
    .filter((v) => !taggedIds.has(v.id))
    .filter(
      (v) =>
        !q ||
        v.name.toLowerCase().includes(q) ||
        (v.business ?? "").toLowerCase().includes(q) ||
        (v.ig_handle ?? "").toLowerCase().includes(q),
    )
    .slice(0, 6);

  function add(vendorId: string) {
    onChange([...tagged.map((t) => t.vendor_id), vendorId]);
    setDraft("");
    setOpen(false);
  }
  function remove(vendorId: string) {
    onChange(tagged.map((t) => t.vendor_id).filter((id) => id !== vendorId));
  }

  function openCreate() {
    setForm((f) => ({ ...f, name: draft.trim() }));
    setCreating(true);
    setOpen(false);
  }

  async function submitCreate() {
    if (!form.name.trim() || busy) return;
    setBusy(true);
    const vendor = await onCreate({
      name: form.name.trim(),
      business: form.business.trim() || null,
      category: form.category || null,
      ig_handle: form.ig_handle.trim() || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
    });
    setBusy(false);
    if (vendor) {
      add(vendor.id);
      setCreating(false);
      setForm({ name: "", business: "", category: "florist", ig_handle: "", email: "", website: "" });
    }
  }

  const fieldCls =
    "w-full border-b border-line bg-transparent pb-1 text-xs focus:border-wine focus:outline-none";

  return (
    <div ref={wrapRef} className="rounded-md border border-line bg-greige/30 p-2">
      <p className="mb-1.5 text-[0.58rem] uppercase tracking-[0.14em] text-ink-faint">
        Vendors credited
      </p>
      {/* Tagged chips */}
      {tagged.length ? (
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {tagged.map((t) => (
            <span
              key={t.vendor_id}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-ivory px-2 py-1 text-[0.66rem] text-ink"
            >
              <span className="text-ink-faint">{t.role || vendorCreditLabel(t.category)}:</span>
              {t.business || t.name}
              <button
                type="button"
                onClick={() => remove(t.vendor_id)}
                aria-label={`Remove ${t.name}`}
                className="ml-0.5 grid h-4 w-4 place-items-center rounded-full text-ink-faint hover:bg-wine hover:text-cream"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {creating ? (
        <div className="flex flex-col gap-1.5">
          <input
            value={form.name}
            placeholder="Vendor name *"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={fieldCls}
          />
          <input
            value={form.business}
            placeholder="Business name"
            onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))}
            className={fieldCls}
          />
          <select
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={fieldCls}
          >
            {VENDOR_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <input
            value={form.ig_handle}
            placeholder="@instagram"
            onChange={(e) => setForm((f) => ({ ...f, ig_handle: e.target.value }))}
            className={fieldCls}
          />
          <input
            value={form.email}
            placeholder="Email (private)"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className={fieldCls}
          />
          <input
            value={form.website}
            placeholder="Website"
            onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            className={fieldCls}
          />
          <div className="mt-0.5 flex items-center gap-2">
            <button
              type="button"
              onClick={submitCreate}
              disabled={busy || !form.name.trim()}
              className="rounded-full bg-wine px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.12em] text-cream disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save & tag"}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            value={draft}
            placeholder="Type a vendor name / @handle…"
            onChange={(e) => {
              setDraft(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={fieldCls}
          />
          {open && (matches.length > 0 || draft.trim()) ? (
            <ul className="absolute left-0 right-0 z-20 mt-1 max-h-52 overflow-auto border border-line bg-ivory shadow-[0_12px_30px_-12px_rgba(28,26,23,0.4)]">
              {matches.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      add(v.id);
                    }}
                    className="block w-full px-2.5 py-2 text-left text-xs text-ink-soft transition-colors hover:bg-greige hover:text-ink"
                  >
                    <span className="text-ink">{v.business || v.name}</span>
                    <span className="ml-1.5 text-ink-faint">
                      {vendorCategoryLabel(v.category)}
                      {v.ig_handle ? ` · @${v.ig_handle}` : ""}
                    </span>
                  </button>
                </li>
              ))}
              {draft.trim() ? (
                <li className="border-t border-line">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      openCreate();
                    }}
                    className="block w-full px-2.5 py-2 text-left text-xs text-wine transition-colors hover:bg-wine hover:text-cream"
                  >
                    + Add new vendor “{draft.trim()}”
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function PortfolioManager({
  initial,
  cities,
  vendors: initialVendors,
}: {
  initial: PortfolioImage[];
  cities: { slug: string; label: string }[];
  vendors: Vendor[];
}) {
  const [images, setImages] = useState<PortfolioImage[]>(initial);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [section, setSection] = useState<string>("celebration");
  const [uploadLocation, setUploadLocation] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [describing, setDescribing] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Images grouped by category id, each list sorted. Every taxonomy category
  // gets a (possibly empty) bucket; unknown/legacy sections get one too so no
  // photo ever disappears.
  const grouped = useMemo(() => {
    const by: Record<string, PortfolioImage[]> = {};
    for (const c of CATEGORIES) by[c.id] = [];
    for (const img of images) (by[img.section] ??= []).push(img);
    for (const k of Object.keys(by))
      by[k].sort((a, b) => a.sort_order - b.sort_order);
    return by;
  }, [images]);

  // The categories to actually render, in taxonomy order: any with photos, plus
  // the current upload target (so you can see where the next dump lands). Each
  // carries its public-tab group label and a flag marking the first category in
  // that group, so we can print a group header above it. Orphan/legacy sections
  // not in the taxonomy fall under "Other".
  const visibleSections = useMemo(() => {
    const out: {
      value: string;
      label: string;
      groupLabel: string;
      firstInGroup: boolean;
    }[] = [];
    let lastGroup = "";
    for (const group of GROUPS) {
      const cats = CATEGORIES.filter(
        (c) =>
          c.group === group.id &&
          ((grouped[c.id]?.length ?? 0) > 0 || c.id === section),
      );
      for (const c of cats) {
        out.push({
          value: c.id,
          label: c.label,
          groupLabel: group.label,
          firstInGroup: lastGroup !== group.id,
        });
        lastGroup = group.id;
      }
    }
    const known = new Set(CATEGORIES.map((c) => c.id));
    for (const id of Object.keys(grouped)) {
      if (known.has(id) || (grouped[id]?.length ?? 0) === 0) continue;
      out.push({
        value: id,
        label: categoryLabel(id),
        groupLabel: "Other",
        firstInGroup: lastGroup !== "__other",
      });
      lastGroup = "__other";
    }
    return out;
  }, [grouped, section]);

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
        const upRes = await fetch(`/api/admin/upload?ext=${ext}`, {
          method: "POST",
          headers: { "content-type": type },
          body,
        });
        if (!upRes.ok) throw new Error("upload failed");
        const { path } = (await upRes.json()) as { path: string };

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
        // Branded route (bucket may be private); raw URL only as last resort.
        setImages((prev) => [
          ...prev,
          { ...image, url: image.slug ? `/api/img/${image.slug}` : publicUrl(image.storage_path) },
        ]);
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

  // Replace the full vendor set for one image. Optimistically rebuilds the
  // image's credit list from the vendor directory, then persists vendor_ids.
  async function setImageVendors(imageId: string, vendorIds: string[]) {
    const byId = new Map(vendors.map((v) => [v.id, v]));
    const credits = vendorIds
      .map((vid) => byId.get(vid))
      .filter((v): v is Vendor => Boolean(v))
      .map(toCredit);
    setImages((prev) =>
      prev.map((i) => (i.id === imageId ? { ...i, vendors: credits } : i)),
    );
    await fetch("/api/admin/images", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: imageId, vendor_ids: vendorIds }),
    });
  }

  // Create a vendor in the directory (once) and add it to the local list so it
  // autocompletes everywhere immediately.
  async function createVendor(
    fields: Partial<Vendor> & { name: string },
  ): Promise<Vendor | null> {
    try {
      const res = await fetch("/api/admin/vendors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = (await res.json().catch(() => ({}))) as { vendor?: Vendor; error?: string };
      if (res.ok && data.vendor) {
        setVendors((prev) =>
          [...prev, data.vendor as Vendor].sort((a, b) => a.name.localeCompare(b.name)),
        );
        return data.vendor;
      }
      setStatus(data.error || "Could not save vendor.");
      return null;
    } catch {
      setStatus("Could not save vendor.");
      return null;
    }
  }

  // Draft alt text OR a longer SEO description for one image with the vision
  // model and save it. Editable afterward — this just fills the field so you're
  // not staring at a blank. Returns true on success so bulk runners can pace
  // themselves.
  async function aiWrite(
    img: PortfolioImage,
    kind: "alt" | "caption" | "hook" | "tags",
  ): Promise<boolean> {
    const noun =
      kind === "caption"
        ? "description"
        : kind === "hook"
          ? "hook"
          : kind === "tags"
            ? "tags"
            : "alt text";
    setDescribing((prev) => new Set(prev).add(img.id));
    try {
      const res = await fetch("/api/admin/describe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: img.url, kind }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, string> & {
        error?: string;
      };
      const text = data[kind];
      if (res.ok && text) {
        await patch(img.id, { [kind]: text } as Partial<PortfolioImage>);
        return true;
      }
      setStatus(data.error || `Could not generate ${noun}.`);
      return false;
    } catch {
      setStatus(`Could not generate ${noun}.`);
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
      const ok = await aiWrite(img, "alt");
      if (!ok) break;
      done++;
    }
    setStatus(`Done — wrote alt text for ${done} image${done === 1 ? "" : "s"}.`);
    setBusy(false);
  }

  // Maximum-SEO pass: (re)write BOTH alt text and an SEO description for every
  // image, one at a time. Overwrites what's there now — the operator opts in via
  // the confirm. Stops early if a request fails (e.g. key missing).
  async function aiWriteAll() {
    if (images.length === 0) return;
    if (
      !confirm(
        `Write AI alt text, SEO description, hook, and tags for all ${images.length} images? This overwrites what you have now.`,
      )
    )
      return;
    setBusy(true);
    let done = 0;
    for (const img of images) {
      setStatus(`AI writing alt · description · hook · tags… ${done}/${images.length}`);
      if (!(await aiWrite(img, "alt"))) break;
      if (!(await aiWrite(img, "caption"))) break;
      if (!(await aiWrite(img, "hook"))) break;
      if (!(await aiWrite(img, "tags"))) break;
      done++;
    }
    setStatus(`Done — full SEO for ${done} image${done === 1 ? "" : "s"}.`);
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

  async function persistOrder(list: PortfolioImage[]) {
    const reordered = list.map((img, i) => ({ ...img, sort_order: i }));
    setImages((prev) => prev.map((i) => reordered.find((r) => r.id === i.id) ?? i));
    await fetch("/api/admin/images/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(reordered.map((r) => ({ id: r.id, sort_order: r.sort_order }))),
    });
  }

  // Keyboard / touch fallback for reordering (drag-and-drop is mouse-only).
  async function move(sectionKey: string, index: number, dir: -1 | 1) {
    const list = [...grouped[sectionKey]];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    await persistOrder(list);
  }

  // Drag-and-drop reorder within a section: drop the dragged tile onto a target.
  async function dropOnto(sectionKey: string, targetId: string) {
    if (!dragId || dragId === targetId) return;
    const list = [...grouped[sectionKey]];
    const from = list.findIndex((i) => i.id === dragId);
    const to = list.findIndex((i) => i.id === targetId);
    if (from < 0 || to < 0) return; // only reorder inside the same section
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    await persistOrder(list);
  }

  const uploadGroup = groupById(groupForCategory(section));

  return (
    <div>
      {/* Upload bar */}
      <div className="flex flex-wrap items-center gap-4 border border-line bg-ivory p-5">
        <label className="text-sm text-ink">
          Upload into{" "}
          <CategorySelect
            value={section}
            onChange={setSection}
            className="border-b border-line bg-transparent py-1 focus:border-wine focus:outline-none"
          />
          {uploadGroup ? (
            <span className="ml-2 whitespace-nowrap text-xs text-ink-faint">
              → appears publicly under{" "}
              <span className="text-wine">{uploadGroup.label}</span>
            </span>
          ) : null}
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
        {images.length > 0 ? (
          <button
            type="button"
            onClick={aiWriteAll}
            disabled={busy}
            className="rounded-full border border-wine/40 px-4 py-2 text-[0.66rem] uppercase tracking-[0.16em] text-wine transition-colors hover:border-wine hover:bg-wine hover:text-cream disabled:opacity-50"
            title="Use AI to (re)write alt, SEO description, hook, and tags for every image — maximum image SEO"
          >
            AI: full SEO (all)
          </button>
        ) : null}
        {status ? <span className="text-xs text-ink-faint">{status}</span> : null}
      </div>
      <p className="mt-2 text-xs text-ink-faint">
        Select as many as you like — images are automatically resized and
        optimized in your browser before upload (originals stay on your computer).
        Then curate ruthlessly: a few stunning frames beat a hundred good ones.
      </p>
      <p className="mt-1 text-xs text-ink-faint">
        Folders roll up into the public tabs — e.g. Crowning, El Vals, and the
        Cake all show under <span className="text-ink-soft">The Celebration</span>.
        A tab only appears on the site once it has its first photo, so empty
        sections (La Misa, Details &amp; Décor, Vendors) stay hidden until you
        add one.
      </p>

      {/* Library — grouped by public tab, then by category. Empty categories
          stay hidden unless they're the current upload target. */}
      {visibleSections.length === 0 ? (
        <p className="mt-8 text-sm text-ink-faint">No images yet — upload above.</p>
      ) : null}
      {visibleSections.map((s) => (
        <div key={s.value}>
          {s.firstInGroup ? (
            <h2 className="mt-12 border-b-2 border-ink/15 pb-2 font-display text-2xl text-ink">
              {s.groupLabel}
            </h2>
          ) : null}
          <section className="mt-6">
          <div className="flex items-baseline justify-between border-b border-line pb-1.5">
            <h3 className="font-display text-lg text-ink">{s.label}</h3>
            <span className="text-xs text-ink-faint">
              {grouped[s.value]?.length ?? 0} image{(grouped[s.value]?.length ?? 0) === 1 ? "" : "s"}
            </span>
          </div>

          {(grouped[s.value]?.length ?? 0) === 0 ? (
            <p className="mt-4 text-sm text-ink-faint">Upload target — no images yet.</p>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {grouped[s.value].map((img, i) => (
                <div
                  key={img.id}
                  onDragOver={(e) => {
                    if (dragId && dragId !== img.id) e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    void dropOnto(s.value, img.id);
                    setDragId(null);
                  }}
                  className={`border bg-ivory transition-colors ${
                    dragId === img.id ? "border-wine opacity-50" : "border-line"
                  }`}
                >
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
                        onClick={() => aiWrite(img, "alt")}
                        disabled={describing.has(img.id)}
                        title="Draft alt text with AI (you can edit it)"
                        className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-40"
                      >
                        {describing.has(img.id) ? "…" : "AI"}
                      </button>
                    </div>
                    {/* SEO description (caption) — feeds the image sitemap,
                        ImageObject.description, and the photo detail page. */}
                    <div className="flex items-start gap-1.5">
                      <textarea
                        key={`cap-${img.id}-${img.caption ?? ""}`}
                        defaultValue={img.caption ?? ""}
                        rows={2}
                        placeholder="SEO description (1–2 sentences)"
                        onBlur={(e) =>
                          e.target.value !== (img.caption ?? "") &&
                          patch(img.id, { caption: e.target.value })
                        }
                        className="w-full resize-none border-b border-line bg-transparent pb-1 text-xs leading-snug focus:border-wine focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => aiWrite(img, "caption")}
                        disabled={describing.has(img.id)}
                        title="Draft an SEO description with AI (you can edit it)"
                        className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-40"
                      >
                        {describing.has(img.id) ? "…" : "AI"}
                      </button>
                    </div>
                    {/* Hook — a short punchy line shown under the title. */}
                    <div className="flex items-end gap-1.5">
                      <input
                        key={`hook-${img.id}-${img.hook ?? ""}`}
                        defaultValue={img.hook ?? ""}
                        placeholder="Hook (one punchy line)"
                        onBlur={(e) =>
                          e.target.value !== (img.hook ?? "") &&
                          patch(img.id, { hook: e.target.value })
                        }
                        className="w-full border-b border-line bg-transparent pb-1 text-xs focus:border-wine focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => aiWrite(img, "hook")}
                        disabled={describing.has(img.id)}
                        title="Draft a hook with AI (you can edit it)"
                        className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-40"
                      >
                        {describing.has(img.id) ? "…" : "AI"}
                      </button>
                    </div>
                    {/* Tags — comma-separated keywords (meta). */}
                    <div className="flex items-end gap-1.5">
                      <input
                        key={`tags-${img.id}-${img.tags ?? ""}`}
                        defaultValue={img.tags ?? ""}
                        placeholder="Tags / meta (comma-separated)"
                        onBlur={(e) =>
                          e.target.value !== (img.tags ?? "") &&
                          patch(img.id, { tags: e.target.value })
                        }
                        className="w-full border-b border-line bg-transparent pb-1 text-xs focus:border-wine focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => aiWrite(img, "tags")}
                        disabled={describing.has(img.id)}
                        title="Draft keyword tags with AI (you can edit them)"
                        className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-wine hover:text-wine disabled:opacity-40"
                      >
                        {describing.has(img.id) ? "…" : "AI"}
                      </button>
                    </div>
                    <CategorySelect
                      value={img.section}
                      onChange={(next) => patch(img.id, { section: next })}
                      className="w-full border-b border-line bg-transparent pb-1 text-xs focus:border-wine focus:outline-none"
                    />
                    <LocationCombobox
                      value={img.location}
                      suggestions={locationSuggestions}
                      onCommit={(location) => patch(img.id, { location })}
                    />
                    {/* City tag — shows this photo on that city's landing page. */}
                    <select
                      value={img.city ?? ""}
                      onChange={(e) => patch(img.id, { city: e.target.value || null })}
                      title="Tag the city so this photo shows on that city's page"
                      className="w-full border-b border-line bg-transparent pb-1 text-xs text-ink-soft focus:border-wine focus:outline-none"
                    >
                      <option value="">— City (for its page) —</option>
                      {cities.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <VendorTagger
                      tagged={img.vendors ?? []}
                      allVendors={vendors}
                      onChange={(ids) => setImageVendors(img.id, ids)}
                      onCreate={createVendor}
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
                        <span
                          draggable
                          onDragStart={(e) => {
                            setDragId(img.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => setDragId(null)}
                          title="Drag to reorder"
                          aria-label="Drag to reorder"
                          className="cursor-grab select-none px-1 text-ink-faint active:cursor-grabbing"
                        >
                          ⠿
                        </span>
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
        </div>
      ))}
    </div>
  );
}
