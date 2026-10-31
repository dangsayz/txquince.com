"use client";

/**
 * PriceManager — /admin/prices. Plain-language price editor for the owner.
 *
 * The form edits a draft; nothing changes on the site until "Save new prices"
 * is confirmed. The server re-validates every number, refuses the save if
 * someone else changed prices since this page loaded, and records history.
 */
import { useMemo, useState } from "react";
import {
  ADD_ON_IDS,
  PRICE_LIMITS,
  PUBLIC_TIER_IDS,
  TIER_IDS,
  describeChanges,
  priceBookSchema,
  quoteCommission,
  usd,
  type AddOnId,
  type PriceBook,
  type TierId,
} from "@/lib/commission";
import { ADD_ONS, TIERS } from "@/components/txq/data";

export type PriceHistoryRow = { at: string; by: string; changes: string[] };
export type PricesSnapshot = {
  book: PriceBook;
  defaults: PriceBook;
  version: string;
  storage: "r2" | "local" | "none";
  corrupt: boolean;
  history: PriceHistoryRow[];
};

/* ---------------- form <-> book ---------------- */

type Form = {
  packages: Record<TierId, { price: string; hours: string; extraHour: string }>;
  addOns: Record<AddOnId, string>;
  maxHours: string;
  depositPercent: string;
  balanceDueDays: string;
  holdDays: string;
  trioSpotsTotal: string;
  trioSpotsLeft: string;
};

const toForm = (b: PriceBook): Form => ({
  packages: Object.fromEntries(
    TIER_IDS.map((id) => [
      id,
      {
        price: String(b.packages[id].price),
        hours: String(b.packages[id].hours),
        extraHour: String(b.packages[id].extraHour),
      },
    ]),
  ) as Form["packages"],
  addOns: Object.fromEntries(ADD_ON_IDS.map((id) => [id, String(b.addOns[id])])) as Form["addOns"],
  maxHours: String(b.maxHours),
  depositPercent: String(b.depositPercent),
  balanceDueDays: String(b.balanceDueDays),
  holdDays: String(b.holdDays),
  trioSpotsTotal: String(b.trioSpotsTotal),
  trioSpotsLeft: String(b.trioSpotsLeft),
});

/** "$4,900" / "4900" / " 4,900 " → 4900; anything else → NaN (zod reports it). */
const num = (v: string) => {
  const t = v.replace(/[$,\s%]/g, "");
  return /^\d+$/.test(t) ? Number(t) : Number.NaN;
};

const fromForm = (f: Form, base: PriceBook): unknown => ({
  packages: Object.fromEntries(
    TIER_IDS.map((id) => [
      id,
      { price: num(f.packages[id].price), hours: num(f.packages[id].hours), extraHour: num(f.packages[id].extraHour) },
    ]),
  ),
  addOns: Object.fromEntries(ADD_ON_IDS.map((id) => [id, num(f.addOns[id])])),
  maxHours: num(f.maxHours),
  depositPercent: num(f.depositPercent),
  balanceDueDays: num(f.balanceDueDays),
  holdDays: num(f.holdDays),
  trioSpotsTotal: num(f.trioSpotsTotal),
  trioSpotsLeft: num(f.trioSpotsLeft),
  updatedAt: base.updatedAt,
  updatedBy: base.updatedBy,
});

function validate(f: Form, base: PriceBook) {
  const r = priceBookSchema.safeParse(fromForm(f, base));
  if (r.success) return { book: r.data as PriceBook, errors: {} as Record<string, string> };
  const errors: Record<string, string> = {};
  for (const i of r.error.issues) {
    const key = i.path.join(".");
    if (!errors[key]) errors[key] = /expected number|NaN/i.test(i.message) ? "Enter a whole number." : i.message;
  }
  return { book: null, errors };
}

const when = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
};

/* ---------------- small pieces ---------------- */

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  error,
  prefix,
  suffix,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
  suffix?: string;
}) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div
        className={`mt-1.5 flex items-center rounded-lg border bg-white px-3 focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-black ${error ? "border-red-700" : "border-[#c9cac7]"}`}
      >
        {prefix ? <span aria-hidden="true" className="mr-1 text-base text-ink-soft">{prefix}</span> : null}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-12 min-w-0 flex-1 bg-transparent text-base tabular-nums text-ink outline-none"
        />
        {suffix ? <span aria-hidden="true" className="ml-2 whitespace-nowrap text-sm text-ink-soft">{suffix}</span> : null}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm font-medium text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Section({ title, dek, children }: { title: string; dek?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-7">
      <h2 className="text-lg font-medium tracking-[-0.02em] text-ink">{title}</h2>
      {dek ? <p className="mt-1 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">{dek}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ---------------- preview ---------------- */

function Preview({ book }: { book: PriceBook | null }) {
  const [tier, setTier] = useState<TierId>("production");
  const [extra, setExtra] = useState(1);
  const [addOns, setAddOns] = useState<AddOnId[]>(["sameday"]);
  if (!book) {
    return (
      <p className="rounded-lg border border-line bg-ivory p-4 text-[15px] text-ink-soft">
        Fix the highlighted numbers to see what a family would pay.
      </p>
    );
  }
  const pkg = book.packages[tier];
  const canAdd = pkg.extraHour > 0 && book.maxHours > pkg.hours;
  const maxExtra = canAdd ? book.maxHours - pkg.hours : 0;
  const extraNow = Math.min(extra, maxExtra);
  const q = quoteCommission(book, tier, addOns, pkg.hours + extraNow);
  const name = (id: TierId) => TIERS.find((t) => t.id === id)!.name.en;

  return (
    <div className="rounded-xl border border-line bg-ivory p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pv-tier" className="block text-sm font-medium text-ink">
            Package
          </label>
          <select
            id="pv-tier"
            value={tier}
            onChange={(e) => setTier(e.target.value as TierId)}
            className="mt-1.5 min-h-12 w-full rounded-lg border border-[#c9cac7] bg-white px-3 text-base text-ink"
          >
            {PUBLIC_TIER_IDS.map((id) => (
              <option key={id} value={id}>
                {name(id)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span id="pv-hours-label" className="block text-sm font-medium text-ink">
            Extra hours
          </span>
          <div className="mt-1.5 flex items-center gap-3" role="group" aria-labelledby="pv-hours-label">
            <button
              type="button"
              aria-label="One extra hour less"
              disabled={extraNow <= 0}
              onClick={() => setExtra(Math.max(0, extraNow - 1))}
              className="grid h-12 w-12 place-items-center rounded-lg border border-[#c9cac7] bg-white text-xl disabled:opacity-40"
            >
              −
            </button>
            <output className="min-w-[2ch] text-center text-base tabular-nums" aria-live="polite">
              {extraNow}
            </output>
            <button
              type="button"
              aria-label="One extra hour more"
              disabled={extraNow >= maxExtra}
              onClick={() => setExtra(Math.min(maxExtra, extraNow + 1))}
              className="grid h-12 w-12 place-items-center rounded-lg border border-[#c9cac7] bg-white text-xl disabled:opacity-40"
            >
              +
            </button>
            <span className="text-sm text-ink-soft">{canAdd ? `${q.hours} hours on the day` : "Hours can't be added"}</span>
          </div>
        </div>
      </div>
      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-ink">Extras</legend>
        <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
          {ADD_ONS.map((a) => {
            const on = addOns.includes(a.id);
            return (
              <label key={a.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[#c9cac7] bg-white px-3">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => setAddOns(on ? addOns.filter((x) => x !== a.id) : [...addOns, a.id])}
                  className="h-5 w-5 shrink-0 accent-black"
                />
                <span className="min-w-0 flex-1 text-[15px]">{a.name.en}</span>
                <span className="whitespace-nowrap text-sm tabular-nums text-ink-soft">+{usd(book.addOns[a.id])}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center" aria-live="polite">
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-ink-soft">Total</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums sm:text-2xl" data-testid="preview-total">
            {usd(q.totalUsd)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-ink-soft">Deposit ({book.depositPercent}%)</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums sm:text-2xl" data-testid="preview-deposit">
            {usd(q.retainerUsd)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-ink-soft">The rest</dt>
          <dd className="mt-1 text-xl font-medium tabular-nums sm:text-2xl" data-testid="preview-rest">
            {usd(q.balanceUsd)}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-center text-sm text-ink-soft">
        Deposit after you approve their agreement · the rest {book.balanceDueDays} {book.balanceDueDays === 1 ? "day" : "days"}{" "}
        before the event
      </p>
    </div>
  );
}

/* ---------------- main ---------------- */

export function PriceManager({ initial }: { initial: PricesSnapshot }) {
  const [snap, setSnap] = useState(initial);
  const [form, setForm] = useState<Form>(() => toForm(initial.book));
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const { book: draft, errors } = useMemo(() => validate(form, snap.book), [form, snap.book]);
  const changes = useMemo(() => (draft ? describeChanges(snap.book, draft) : []), [draft, snap.book]);
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(snap.book));
  const isDefault = draft ? describeChanges(snap.defaults, draft).length === 0 : false;
  const canWrite = snap.storage !== "none";

  const set = (fn: (f: Form) => Form) => {
    setForm((f) => fn(structuredClone(f)));
    setConfirming(false);
    setMessage(null);
  };
  /** Change one field of the draft. */
  const edit = (mutate: (f: Form) => void) =>
    set((f) => {
      mutate(f);
      return f;
    });

  async function save() {
    if (!draft || saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book: draft, baseVersion: snap.version }),
      });
      const j = (await res.json().catch(() => ({}))) as Partial<PricesSnapshot> & { error?: string; code?: string };
      if (!res.ok) {
        if (j.code === "conflict" && j.book && j.version) {
          // Someone else saved: show their prices, keep nothing stale.
          setSnap(j as PricesSnapshot);
          setForm(toForm(j.book));
        }
        setMessage({ kind: "error", text: j.error || "Couldn't save. Nothing was changed." });
        return;
      }
      setSnap(j as PricesSnapshot);
      setForm(toForm(j.book!));
      setMessage({ kind: "ok", text: "Saved. Your new prices are live on the website now: homepage, package cards, comparison table, inquiry form and every page." });
    } catch {
      setMessage({ kind: "error", text: "Couldn't reach the server. Nothing was changed." });
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  const err = (k: string) => errors[k];
  const tierName = (id: TierId) => TIERS.find((t) => t.id === id)!.name.en;
  const L = PRICE_LIMITS;

  return (
    <div className="pb-6">
      <div className="rounded-xl border border-line bg-ivory p-4 text-[15px] leading-relaxed text-ink sm:p-5">
        <p className="font-medium">Changes apply to new bookings. Families who already signed keep their price.</p>
        <p className="mt-1 text-ink-soft">
          {snap.book.updatedAt
            ? `Last changed ${when(snap.book.updatedAt)}${snap.book.updatedBy ? ` by ${snap.book.updatedBy}` : ""}.`
            : "These are the original launch prices — they haven't been changed yet."}
        </p>
        {snap.corrupt ? (
          <p className="mt-2 font-medium text-red-800" role="alert">
            The saved price file couldn&apos;t be read, so the site is using the launch prices. Saving here will fix it.
          </p>
        ) : null}
        {!canWrite ? (
          <p className="mt-2 font-medium text-red-800" role="alert">
            Price storage isn&apos;t connected here, so changes can&apos;t be saved from this copy of the site.
          </p>
        ) : null}
      </div>

      <form
        className="mt-8 flex flex-col gap-9"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft && changes.length) setConfirming(true);
        }}
        noValidate
      >
        <Section title="Packages" dek="The price of each package and how many hours of coverage it includes. Each extra hour is what families pay for every hour they add.">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Retired packages (the Two-Day Celebration) keep their saved
                numbers for old bookings but are no longer edited here. */}
            {PUBLIC_TIER_IDS.map((id) => (
              <fieldset key={id} className="min-w-0 rounded-xl border border-line p-4 sm:p-5">
                <legend className="px-1 text-base font-medium text-ink">{tierName(id)}</legend>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    id={`p-${id}-price`}
                    label="Price"
                    prefix="$"
                    value={form.packages[id].price}
                    onChange={(v) => edit((f) => {
                      f.packages[id].price = v;
                    })}
                    error={err(`packages.${id}.price`)}
                  />
                  <Field
                    id={`p-${id}-hours`}
                    label="Hours included"
                    suffix="hrs"
                    value={form.packages[id].hours}
                    onChange={(v) => edit((f) => {
                      f.packages[id].hours = v;
                    })}
                    error={err(`packages.${id}.hours`)}
                  />
                  <Field
                    id={`p-${id}-extra`}
                    label="Each extra hour"
                    prefix="$"
                    value={form.packages[id].extraHour}
                    onChange={(v) => edit((f) => {
                      f.packages[id].extraHour = v;
                    })}
                    error={err(`packages.${id}.extraHour`)}
                  />
                </div>
                {num(form.packages[id].extraHour) === 0 ? (
                  <p className="mt-2 text-sm text-ink-soft">Extra hour $0 means families can&apos;t add hours to this package.</p>
                ) : null}
              </fieldset>
            ))}
          </div>
          <div className="mt-4 max-w-xs">
            <Field
              id="max-hours"
              label="Longest day we cover"
              suffix="hours"
              hint="Families can add hours up to this."
              value={form.maxHours}
              onChange={(v) => edit((f) => {
                      f.maxHours = v;
                    })}
              error={err("maxHours")}
            />
          </div>
        </Section>

        <Section title="Extras" dek="What each extra adds to the total.">
          <div className="grid gap-4 sm:grid-cols-2">
            {ADD_ONS.map((a) => (
              <Field
                key={a.id}
                id={`a-${a.id}`}
                label={a.name.en}
                prefix="$"
                value={form.addOns[a.id]}
                onChange={(v) => edit((f) => {
                      f.addOns[a.id] = v;
                    })}
                error={err(`addOns.${a.id}`)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Trio launch offer"
          dek="The homepage says “only N of 5 Trio dates left at this price” while dates are left. Lower “dates left” by one each time you confirm a Trio. At 0 the message disappears; raise the Trio price above when you're ready."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="trio-total"
              label="Dates at the launch price"
              suffix="dates"
              hint={`Between ${L.trioSpots.min} and ${L.trioSpots.max}.`}
              value={form.trioSpotsTotal}
              onChange={(v) => edit((f) => {
                      f.trioSpotsTotal = v;
                    })}
              error={err("trioSpotsTotal")}
            />
            <Field
              id="trio-left"
              label="Dates left"
              suffix="left"
              hint="0 hides the offer."
              value={form.trioSpotsLeft}
              onChange={(v) => edit((f) => {
                      f.trioSpotsLeft = v;
                    })}
              error={err("trioSpotsLeft")}
            />
          </div>
        </Section>

        <Section title="Deposit and payments" dek="Families sign online, you approve, then they pay the deposit. The rest is paid before the event.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              id="deposit"
              label="Deposit %"
              suffix="%"
              hint={`Between ${L.depositPercent.min} and ${L.depositPercent.max}.`}
              value={form.depositPercent}
              onChange={(v) => edit((f) => {
                      f.depositPercent = v;
                    })}
              error={err("depositPercent")}
            />
            <Field
              id="balance"
              label="Rest due before the event"
              suffix="days"
              hint={`Between ${L.balanceDueDays.min} and ${L.balanceDueDays.max} days.`}
              value={form.balanceDueDays}
              onChange={(v) => edit((f) => {
                      f.balanceDueDays = v;
                    })}
              error={err("balanceDueDays")}
            />
            <Field
              id="hold"
              label="Hold a date while I review"
              suffix="days"
              hint={`Between ${L.holdDays.min} and ${L.holdDays.max} days.`}
              value={form.holdDays}
              onChange={(v) => edit((f) => {
                      f.holdDays = v;
                    })}
              error={err("holdDays")}
            />
          </div>
        </Section>

        <Section title="What a family would pay" dek="A live preview with the numbers above. Try a package, extra hours and extras.">
          <Preview book={draft} />
        </Section>

        {/* Save bar: sticky on small screens so the main action stays in thumb reach. */}
        <div className="sticky bottom-0 z-10 -mx-5 border-t border-line bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:backdrop-blur-none">
          {message ? (
            <p
              role={message.kind === "error" ? "alert" : "status"}
              className={`mb-3 text-[15px] font-medium ${message.kind === "error" ? "text-red-800" : "text-green-800"}`}
            >
              {message.text}
            </p>
          ) : null}

          {confirming && draft ? (
            <div className="rounded-xl border border-ink p-4" role="group" aria-labelledby="confirm-title">
              <p id="confirm-title" className="text-base font-medium text-ink">
                Save these new prices? The website changes right away.
              </p>
              <ul className="mt-2 max-h-48 list-disc overflow-y-auto pl-5 text-[15px] leading-relaxed text-ink">
                {changes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-ink-soft">Families who already signed keep their price.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="min-h-12 whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Yes, save new prices"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={saving}
                  className="min-h-12 whitespace-nowrap rounded-lg border border-ink px-5 text-base font-medium text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!draft || !changes.length || !canWrite}
                className="min-h-12 whitespace-nowrap rounded-lg bg-ink px-6 text-base font-medium text-white disabled:opacity-40"
              >
                Save new prices
              </button>
              {dirty ? (
                <button
                  type="button"
                  onClick={() => set(() => toForm(snap.book))}
                  className="min-h-12 whitespace-nowrap rounded-lg border border-[#c9cac7] px-5 text-base text-ink"
                >
                  Undo my edits
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => set(() => toForm(snap.defaults))}
                disabled={isDefault}
                className="min-h-12 whitespace-nowrap rounded-lg border border-[#c9cac7] px-5 text-base text-ink disabled:opacity-40"
              >
                Reset to launch prices
              </button>
              <span className="text-sm text-ink-soft">
                {!draft
                  ? "Fix the highlighted numbers first."
                  : changes.length
                    ? `${changes.length} ${changes.length === 1 ? "change" : "changes"} not saved yet.`
                    : "No changes."}
              </span>
            </div>
          )}
        </div>
      </form>

      <section className="mt-12 border-t border-line pt-7" aria-labelledby="history-title">
        <h2 id="history-title" className="text-lg font-medium tracking-[-0.02em] text-ink">
          Price history
        </h2>
        {snap.history.length ? (
          <ol className="mt-4 flex flex-col gap-4">
            {snap.history.map((h) => (
              <li key={h.at} className="rounded-xl border border-line p-4">
                <p className="text-sm font-medium text-ink">
                  {when(h.at)}
                  {h.by ? <span className="font-normal text-ink-soft"> · {h.by}</span> : null}
                </p>
                {h.changes.length ? (
                  <ul className="mt-2 list-disc pl-5 text-[15px] leading-relaxed text-ink-soft">
                    {h.changes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-[15px] text-ink-soft">Saved with no number changes.</p>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-[15px] text-ink-soft">No changes yet.</p>
        )}
      </section>
    </div>
  );
}
