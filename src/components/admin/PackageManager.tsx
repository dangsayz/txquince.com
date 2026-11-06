"use client";

/**
 * PackageManager — /admin/packages. What each package includes, in words.
 *
 * Edits the wording part of the live price book (PriceBook.content, the
 * dress-session photo count and the extras' descriptions). Saving goes
 * through the same writer as /admin/prices (PUT /api/admin/prices), so the
 * server re-validates everything, refuses a stale save and records history.
 * One save changes the package cards, the home page, the comparison table,
 * the budget page, the agreement and every FAQ or post that uses the tokens.
 */
import { useMemo, useState } from "react";
import {
  ADD_ON_IDS,
  ADD_ON_NAME_EN,
  PUBLIC_TIER_IDS,
  TIER_NAME_EN,
  describeChanges,
  priceBookSchema,
  type AddOnId,
  type PriceBook,
  type PublicTierId,
} from "@/lib/commission";
import { CONTENT_LIMITS, type L, type PackageContent } from "@/lib/package-content";
import { matrixFor, tierBullets, tierDetail, tierSummary } from "@/components/txq/data";
import { detailsFor } from "@/components/budget/budget-details";
import type { PricesSnapshot } from "./PriceManager";

type Wording = Pick<PriceBook, "content" | "addOnNotes" | "sessionPhotos">;
const wordingOf = (b: PriceBook): Wording => structuredClone({ content: b.content, addOnNotes: b.addOnNotes, sessionPhotos: b.sessionPhotos });

const EVENT = new Set<PublicTierId>(["moments", "solo", "cinema", "trio"]);

const TEAM_HINT = "Card, home page, table, budget page, agreement. Must not be empty.";

/** The one-line fields, where each shows, in plain words. */
const LINES: { key: keyof PackageContent; label: string; where: string }[] = [
  { key: "photosNote", label: "Said after the photo count", where: "Table and budget page, e.g. “more for each added hour”. Leave empty for nothing." },
  { key: "coverage", label: "What we cover on the day", where: "Budget page. Empty = not shown." },
  { key: "video", label: "Full-length film", where: "Table, budget page, agreement. Empty = no film." },
  { key: "highlight", label: "Highlight film", where: "Table, budget page, agreement. Empty = none (or the extra is offered at its price)." },
  { key: "social", label: "Short videos for social media", where: "Table, budget page, agreement. Empty = none." },
  { key: "session", label: "Dress or save-the-date session", where: "Table, budget page, agreement. Empty = none." },
  { key: "album", label: "Printed album", where: "Table, budget page, agreement. Empty = none." },
  { key: "files", label: "Original files", where: "Table, budget page, agreement. Empty = none." },
  { key: "detail", label: "Home page line", where: "The short line under the name in the home page package list." },
];

const inputCls = (bad?: boolean) =>
  `mt-1 block w-full min-w-0 rounded-lg border bg-white px-3 py-2.5 text-base leading-snug text-ink outline-none transition-[border-color,box-shadow] focus:border-ink focus:shadow-[0_0_0_3px_rgba(16,16,16,0.12)] focus:outline-none focus-visible:outline-none! ${bad ? "border-red-700" : "border-[#c9cac7]"}`;

function Pair({
  id,
  label,
  hint,
  value,
  onChange,
  errors,
  rows = 2,
  max,
}: {
  id: string;
  label: string;
  hint?: string;
  value: L;
  onChange: (v: L) => void;
  errors: Record<string, string>;
  rows?: number;
  max: number;
}) {
  const err = errors[`${id}.en`] || errors[`${id}.es`] || errors[id];
  return (
    <fieldset className="min-w-0">
      <legend className="text-sm font-medium text-ink">{label}</legend>
      {hint ? <p className="mt-0.5 text-sm text-ink-soft">{hint}</p> : null}
      <div className="mt-1.5 grid gap-3 md:grid-cols-2">
        {(["en", "es"] as const).map((lng) => (
          <label key={lng} className="block min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{lng === "en" ? "English" : "Spanish"}</span>
            <textarea
              rows={rows}
              maxLength={max}
              value={value[lng]}
              onChange={(e) => onChange({ ...value, [lng]: e.target.value })}
              aria-invalid={errors[`${id}.${lng}`] ? true : undefined}
              className={inputCls(Boolean(errors[`${id}.${lng}`]))}
            />
          </label>
        ))}
      </div>
      {err ? <p className="mt-1 text-sm font-medium text-red-800">{err}</p> : null}
    </fieldset>
  );
}

function Short({
  id,
  label,
  hint,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        maxLength={CONTENT_LIMITS.short}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-hint`}
        className={`${inputCls(Boolean(error))} h-12`}
      />
      <p id={`${id}-hint`} className="mt-1 text-sm text-ink-soft">
        {hint}
      </p>
      {error ? <p className="mt-1 text-sm font-medium text-red-800">{error}</p> : null}
    </div>
  );
}

function ListEditor({
  id,
  label,
  hint,
  items,
  onChange,
  errors,
  max,
  min,
}: {
  id: string;
  label: string;
  hint: string;
  items: L[];
  onChange: (v: L[]) => void;
  errors: Record<string, string>;
  max: number;
  min: number;
}) {
  return (
    <div className="min-w-0">
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-sm text-ink-soft">{hint}</p>
      <ol className="mt-2 flex flex-col gap-4">
        {items.map((it, i) => (
          <li key={i} className="rounded-lg border border-line p-3">
            <Pair
              id={`${id}.${i}`}
              label={`${i + 1}.`}
              value={it}
              max={CONTENT_LIMITS.line}
              errors={errors}
              onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const next = [...items];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
                className="st-btn-ghost disabled:opacity-40"
              >
                Move up
              </button>
              <button
                type="button"
                disabled={items.length <= min}
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="st-btn-ghost disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={items.length >= max}
        onClick={() => onChange([...items, { en: "", es: "" }])}
        className="st-btn-ghost mt-3 disabled:opacity-40"
      >
        Add a line
      </button>
      {errors[id] ? <p className="mt-1 text-sm font-medium text-red-800">{errors[id]}</p> : null}
    </div>
  );
}

/* ---------------- collapsible rows: closed, they show the current value ---------------- */

const oneLine = (v: L | L[] | undefined) => {
  if (!v) return "";
  if (Array.isArray(v)) return v.map((x) => x.en).filter(Boolean).join(" · ");
  return v.en;
};

function Row({ label, value, empty = "Empty: not shown", bad, children }: { label: string; value: string; empty?: string; bad?: boolean; children: React.ReactNode }) {
  return (
    <details open={bad || undefined} className="group border-b border-line last:border-b-0">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
          <span className="shrink-0 text-[15px] font-medium text-ink sm:w-52">
            {label}
            {bad ? <span className="ml-1.5 text-red-700" aria-label="has a problem">•</span> : null}
          </span>
          <span className={`min-w-0 truncate text-[15px] ${value ? "text-ink-soft" : "italic text-ink-soft/70"}`}>{value || empty}</span>
        </span>
        <span aria-hidden className="shrink-0 text-ink-soft transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="pb-5 pt-1">{children}</div>
    </details>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0">
      <h2 className="st-h2">{title}</h2>
      <div className="mt-2 rounded-xl border border-line bg-white px-4">{children}</div>
    </section>
  );
}

/* ---------------- preview: the package as families see it ---------------- */

function Preview({ book, tier }: { book: PriceBook; tier: PublicTierId }) {
  const [lang, setLang] = useState<"en" | "es">("en");
  const table = matrixFor(book).flatMap((g) => g.rows).filter((r) => r.values[tier]);
  const budget = EVENT.has(tier) ? detailsFor(tier as "moments", book.packages[tier].hours, [], lang, book) : null;
  return (
    <div className="rounded-xl border border-line bg-ivory p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-medium text-ink">How it reads on the site</p>
        <div className="flex gap-2" role="group" aria-label="Preview language">
          {(["en", "es"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={`min-h-11 min-w-11 whitespace-nowrap rounded-lg border px-3 text-sm ${lang === l ? "border-ink bg-ink text-white" : "border-[#c9cac7] bg-white text-ink"}`}
            >
              {l === "en" ? "English" : "Español"}
            </button>
          ))}
        </div>
      </div>
      <h3 className="mt-4 text-[15px] font-semibold">Package card</h3>
      <p className="mt-1 text-[15px] leading-relaxed text-ink">{tierSummary(book, tier)[lang]}</p>
      <ul className="mt-2 list-disc pl-5 text-[15px] leading-relaxed text-ink">
        {tierBullets(book, tier).map((b, i) => (
          <li key={i}>{b[lang]}</li>
        ))}
      </ul>
      <h3 className="mt-4 text-[15px] font-semibold">Home page line</h3>
      <p className="mt-1 text-[15px] text-ink">{tierDetail(book, tier)[lang]}</p>
      <h3 className="mt-4 text-[15px] font-semibold">Comparison table</h3>
      <dl className="mt-1 grid gap-1 text-[15px]">
        {table.map((r) => (
          <div key={r.label.en} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">
            <dt className="text-ink-soft">{r.label[lang]}</dt>
            <dd className="text-ink">{r.values[tier]![lang]}</dd>
          </div>
        ))}
      </dl>
      {budget ? (
        <>
          <h3 className="mt-4 text-[15px] font-semibold">Budget page · what you get</h3>
          <ul className="mt-1 grid gap-1 text-[15px]">
            {budget.included.map((l, i) => (
              <li key={i}>
                <span className="text-ink-soft">{l.label}: </span>
                {l.text}
              </li>
            ))}
          </ul>
          {budget.notIncluded.length ? (
            <p className="mt-2 text-[15px] text-ink-soft">
              {lang === "en" ? "Not included: " : "No incluye: "}
              {budget.notIncluded.join(" · ")}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/* ---------------- main ---------------- */

export function PackageManager({ initial }: { initial: PricesSnapshot }) {
  const [snap, setSnap] = useState(initial);
  const [draft, setDraft] = useState<Wording>(() => wordingOf(initial.book));
  const [tab, setTab] = useState<PublicTierId | "extras">("moments");
  const [lastTier, setLastTier] = useState<PublicTierId>("moments");
  const tier: PublicTierId = tab === "extras" ? lastTier : tab;
  const [showPreview, setShowPreview] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const { book, errors } = useMemo(() => {
    const r = priceBookSchema.safeParse({ ...snap.book, ...draft });
    if (r.success) return { book: r.data as PriceBook, errors: {} as Record<string, string> };
    const errors: Record<string, string> = {};
    for (const i of r.error.issues) {
      const key = i.path.join(".");
      if (!errors[key]) errors[key] = i.message;
    }
    return { book: null, errors };
  }, [draft, snap.book]);
  const changes = useMemo(() => (book ? describeChanges(snap.book, book) : []), [book, snap.book]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(wordingOf(snap.book));
  const canWrite = snap.storage !== "none";
  const c = draft.content[tier];
  const badTiers = new Set(Object.keys(errors).filter((k) => k.startsWith("content.")).map((k) => k.split(".")[1]));

  const update = (fn: (w: Wording) => void) => {
    setDraft((w) => {
      const next = structuredClone(w);
      fn(next);
      return next;
    });
    setConfirming(false);
    setMessage(null);
  };
  const setField = <K extends keyof PackageContent>(k: K, v: PackageContent[K]) => update((w) => void (w.content[tier][k] = v));
  const fieldErrors = Object.fromEntries(
    Object.entries(errors)
      .filter(([k]) => k.startsWith(`content.${tier}.`))
      .map(([k, v]) => [k.slice(`content.${tier}.`.length), v]),
  );

  async function save() {
    if (!book || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book, baseVersion: snap.version }),
      });
      const j = (await res.json().catch(() => ({}))) as Partial<PricesSnapshot> & { error?: string; code?: string };
      if (!res.ok) {
        if (j.code === "conflict" && j.book && j.version) {
          setSnap(j as PricesSnapshot);
          setDraft(wordingOf(j.book));
        }
        setMessage({ kind: "error", text: j.error || "Couldn't save. Nothing was changed." });
        return;
      }
      setSnap(j as PricesSnapshot);
      setDraft(wordingOf(j.book!));
      setMessage({
        kind: "ok",
        text: "Saved. The new wording is live now: package cards, home page, comparison table, budget page, FAQs and posts.",
      });
    } catch {
      setMessage({ kind: "error", text: "Couldn't reach the server. Nothing was changed." });
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  return (
    <div className="pb-6">
      <details className="group rounded-xl border border-line bg-ivory px-4 text-[15px] leading-relaxed text-ink sm:px-5">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 py-2 [&::-webkit-details-marker]:hidden">
          <span className="font-medium">Type it once here and it changes everywhere the package is described.</span>
          <span className="ml-auto shrink-0 text-sm text-ink-soft">Shortcuts <span aria-hidden className="inline-block transition-transform group-open:rotate-90">›</span></span>
        </summary>
        <p className="pb-4 text-ink-soft">
          Shortcuts you can type in any line: <code>{"{photos}"}</code> the photo count, <code>{"{cameras}"}</code> the camera count,{" "}
          <code>{"{hours}"}</code> hours included, <code>{"{maxhours}"}</code> most hours, <code>{"{session}"}</code> dress session photos,{" "}
          <code>{"{team}"}</code> who comes. Prices and hours are on the{" "}
          <a href="/admin/prices" className="underline underline-offset-2">
            Prices
          </a>{" "}
          page. Families who already signed keep what their agreement says.
        </p>
      </details>
      {!canWrite ? (
        <p className="mt-2 font-medium text-red-800" role="alert">
          Storage isn&apos;t connected here, so changes can&apos;t be saved from this copy of the site.
        </p>
      ) : null}

      {/* Package tabs stay pinned while you scroll. */}
      <div className="sticky top-0 z-30 mt-5 border-b border-line bg-cream/95 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Package">
          {PUBLIC_TIER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => {
                setTab(id);
                setLastTier(id);
              }}
              data-on={tab === id || undefined}
              className="st-filter shrink-0"
            >
              {TIER_NAME_EN[id]}
              {badTiers.has(id) ? <span className="ml-1.5 text-red-300" aria-label="has a problem"> •</span> : null}
            </button>
          ))}
          <button
            type="button"
            role="tab"
            aria-selected={tab === "extras"}
            onClick={() => setTab("extras")}
            data-on={tab === "extras" || undefined}
            className="st-filter shrink-0"
          >
            For every package
            {errors.sessionPhotos || Object.keys(errors).some((k) => k.startsWith("addOnNotes")) ? <span className="ml-1.5 text-red-300" aria-label="has a problem"> •</span> : null}
          </button>
        </div>
      </div>

      <form
        className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
        onSubmit={(e) => {
          e.preventDefault();
          if (book && changes.length) setConfirming(true);
        }}
        noValidate
      >
        {tab === "extras" ? (
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
            <div className="max-w-sm">
              <Short
                id="pk-session"
                label="Dress session photos"
                hint="Used by {session}: the Duo, the Trio and the Dress Session extra."
                value={draft.sessionPhotos}
                onChange={(v) => update((w) => void (w.sessionPhotos = v))}
                error={errors.sessionPhotos}
              />
            </div>
            <Group title="Extras · what each one is">
              {ADD_ON_IDS.map((id: AddOnId) => (
                <Row key={id} label={ADD_ON_NAME_EN[id]} value={oneLine(draft.addOnNotes[id])} bad={Boolean(errors[`addOnNotes.${id}.en`] || errors[`addOnNotes.${id}.es`])}>
                  <Pair
                    id={`addOnNotes.${id}`}
                    label={`${ADD_ON_NAME_EN[id]} (extra)`}
                    hint="Shown next to it in the booking panel and on the budget page."
                    value={draft.addOnNotes[id]}
                    max={CONTENT_LIMITS.line}
                    errors={errors}
                    onChange={(v) => update((w) => void (w.addOnNotes[id] = v))}
                  />
                </Row>
              ))}
            </Group>
          </div>
        ) : (
        <div className="flex min-w-0 flex-col gap-6">
          {/* Quick facts: the most-edited fields, first. */}
          <section aria-labelledby="pk-quick" className="rounded-xl border border-line bg-white p-4 sm:p-5">
            <h2 id="pk-quick" className="st-h2">
              Quick facts · {TIER_NAME_EN[tier]}
            </h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Short
                id="pk-photos"
                label="Photo count"
                hint="Shown as “150+ edited photos”. A range like 200–300 works too."
                value={c.photos}
                onChange={(v) => setField("photos", v)}
                error={fieldErrors.photos}
              />
              <Short
                id="pk-cameras"
                label="Cameras"
                hint="Used by {cameras}, e.g. “2” or “2–3”. Empty if it doesn't apply."
                value={c.cameras}
                onChange={(v) => setField("cameras", v)}
                error={fieldErrors.cameras}
              />
            </div>
            <div className="mt-4">
              <Pair id="team" label="Who comes" hint={TEAM_HINT} value={c.team} max={CONTENT_LIMITS.line} errors={fieldErrors} onChange={(v) => setField("team", v)} />
            </div>
          </section>

          <Group title="What's included">
            {LINES.filter((f) => f.key !== "detail").map((f) => (
              <Row key={f.key} label={f.label} value={oneLine(c[f.key] as L)} bad={Boolean(fieldErrors[`${f.key}.en`] || fieldErrors[`${f.key}.es`] || fieldErrors[f.key])}>
                <Pair id={f.key} label={f.label} hint={f.where} value={c[f.key] as L} max={CONTENT_LIMITS.line} errors={fieldErrors} onChange={(v) => setField(f.key, v as never)} />
              </Row>
            ))}
            {EVENT.has(tier) ? (
              <Row label="Not included" value={oneLine(c.notIncluded)} empty="Nothing listed" bad={Object.keys(fieldErrors).some((k) => k.startsWith("notIncluded"))}>
                <ListEditor
                  id="notIncluded"
                  label="Not included"
                  hint="Shown under “Not included” on the budget page. Extras the package can add are listed there on their own, with their price."
                  items={c.notIncluded}
                  min={0}
                  max={CONTENT_LIMITS.notIncluded}
                  errors={fieldErrors}
                  onChange={(v) => setField("notIncluded", v)}
                />
              </Row>
            ) : null}
          </Group>

          <Group title="Site copy">
            {LINES.filter((f) => f.key === "detail").map((f) => (
              <Row key={f.key} label={f.label} value={oneLine(c[f.key] as L)} bad={Boolean(fieldErrors[`${f.key}.en`] || fieldErrors[`${f.key}.es`])}>
                <Pair id={f.key} label={f.label} hint={f.where} value={c[f.key] as L} max={CONTENT_LIMITS.line} errors={fieldErrors} onChange={(v) => setField(f.key, v as never)} />
              </Row>
            ))}
            <Row label="Card paragraph" value={oneLine(c.summary)} bad={Boolean(fieldErrors["summary.en"] || fieldErrors["summary.es"])}>
              <Pair
                id="summary"
                label="Card paragraph"
                hint="The short description on the package card and the SEO pages."
                rows={4}
                value={c.summary}
                max={CONTENT_LIMITS.paragraph}
                errors={fieldErrors}
                onChange={(v) => setField("summary", v)}
              />
            </Row>
            <Row label="Card points" value={oneLine(c.bullets)} bad={Object.keys(fieldErrors).some((k) => k.startsWith("bullets"))}>
              <ListEditor
                id="bullets"
                label="Card points"
                hint={`The points on the package card (1 to ${CONTENT_LIMITS.bullets}).`}
                items={c.bullets}
                min={1}
                max={CONTENT_LIMITS.bullets}
                errors={fieldErrors}
                onChange={(v) => setField("bullets", v)}
              />
            </Row>
          </Group>

          <button
            type="button"
            onClick={() => update((w) => void (w.content[tier] = structuredClone(snap.defaults.content[tier])))}
            className="st-btn-ghost max-w-full self-start whitespace-normal py-2 text-left"
          >
            Reset {TIER_NAME_EN[tier]} to launch wording
          </button>
        </div>
        )}

        {tab !== "extras" ? (
          <aside className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-10rem)] lg:self-start lg:overflow-y-auto">
            <button
              type="button"
              aria-expanded={showPreview}
              onClick={() => setShowPreview((v) => !v)}
              className="st-btn-ghost w-full lg:hidden"
            >
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
            <div className={`${showPreview ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>
              {book ? (
                <Preview book={book} tier={tier} />
              ) : (
                <p className="rounded-lg border border-line bg-ivory p-4 text-[15px] text-ink-soft">Fix the highlighted lines to see the preview.</p>
              )}
            </div>
          </aside>
        ) : null}

        {/* Save bar: sticky on small screens so the main action stays in thumb reach. */}
        <div className="sticky bottom-0 z-20 -mx-4 sm:-mx-8 border-t border-line bg-white px-4 sm:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] lg:col-span-2">
          {message ? (
            <p role={message.kind === "error" ? "alert" : "status"} className={`mb-3 text-[15px] font-medium ${message.kind === "error" ? "text-red-800" : "text-green-800"}`}>
              {message.text}
            </p>
          ) : null}
          {confirming && book ? (
            <div className="rounded-xl border border-ink p-4" role="group" aria-labelledby="pk-confirm">
              <p id="pk-confirm" className="text-base font-medium text-ink">
                Save this wording? The website changes right away.
              </p>
              <ul className="mt-2 max-h-48 list-disc overflow-y-auto pl-5 text-[15px] leading-relaxed text-ink">
                {changes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={save} disabled={saving} className="st-btn disabled:opacity-50">
                  {saving ? "Saving…" : "Yes, save"}
                </button>
                <button type="button" onClick={() => setConfirming(false)} disabled={saving} className="st-btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!book || !changes.length || !canWrite}
                className="st-btn disabled:opacity-40"
              >
                Save wording
              </button>
              {dirty ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(wordingOf(snap.book));
                    setConfirming(false);
                  }}
                  className="st-btn-ghost"
                >
                  Undo my edits
                </button>
              ) : null}
              <span className="text-sm text-ink-soft">
                {!book
                  ? "Fix the highlighted lines first."
                  : changes.length
                    ? `${changes.length} ${changes.length === 1 ? "change" : "changes"} not saved yet.`
                    : "No changes."}
              </span>
            </div>
          )}
        </div>
      </form>

      <details className="group mt-12 border-t border-line pt-7" aria-labelledby="pk-history">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
          <h2 id="pk-history" className="st-h2">
            History
          </h2>
          <span className="text-sm text-ink-soft">Saves from this page and the Prices page</span>
          <span aria-hidden className="ml-auto text-ink-soft transition-transform group-open:rotate-90">›</span>
        </summary>
        {snap.history.length ? (
          <ol className="mt-4 flex flex-col gap-3">
            {snap.history.slice(0, 10).map((h) => (
              <li key={h.at} className="rounded-xl border border-line p-4 text-[15px]">
                <p className="font-medium text-ink">
                  {new Date(h.at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  {h.by ? <span className="font-normal text-ink-soft"> · {h.by}</span> : null}
                </p>
                <ul className="mt-1 list-disc pl-5 text-ink-soft">
                  {h.changes.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-[15px] text-ink-soft">No changes yet.</p>
        )}
      </details>
    </div>
  );
}
