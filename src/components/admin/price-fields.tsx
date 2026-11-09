"use client";

/**
 * Price pieces for the one package editor (PackageManager, /admin/packages):
 * the number form <-> price book, the number field, and the "what a family
 * would pay" preview. /admin/prices now redirects to /admin/packages.
 */
import { useState } from "react";
import {
  ADD_ON_IDS,
  PUBLIC_TIER_IDS,
  TIER_IDS,
  maxHoursFor,
  quoteCommission,
  usd,
  type AddOnId,
  type PriceBook,
  type TierId,
} from "@/lib/commission";
import { ADD_ONS } from "@/components/txq/data";
import { tierName } from "@/lib/price-text";

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

export type PriceForm = {
  packages: Record<TierId, { price: string; hours: string; extraHour: string; maxHours: string }>;
  addOns: Record<AddOnId, string>;
  maxHours: string;
  depositPercent: string;
  balanceDueDays: string;
  holdDays: string;
  trioSpotsTotal: string;
  trioSpotsLeft: string;
  planHoldUsd: string;
  momentsSaturdayDays: string;
};

export const toForm = (b: PriceBook): PriceForm => ({
  packages: Object.fromEntries(
    TIER_IDS.map((id) => [
      id,
      {
        price: String(b.packages[id].price),
        hours: String(b.packages[id].hours),
        extraHour: String(b.packages[id].extraHour),
        maxHours: String(b.packages[id].maxHours),
      },
    ]),
  ) as PriceForm["packages"],
  addOns: Object.fromEntries(ADD_ON_IDS.map((id) => [id, String(b.addOns[id])])) as PriceForm["addOns"],
  maxHours: String(b.maxHours),
  depositPercent: String(b.depositPercent),
  balanceDueDays: String(b.balanceDueDays),
  holdDays: String(b.holdDays),
  trioSpotsTotal: String(b.trioSpotsTotal),
  trioSpotsLeft: String(b.trioSpotsLeft),
  planHoldUsd: String(b.planHoldUsd),
  momentsSaturdayDays: String(b.momentsSaturdayDays),
});

/** "$4,900" / "4900" / " 4,900 " → 4900, "1.5" → 1.5; anything else → NaN (zod reports it). */
export const num = (v: string) => {
  const t = v.replace(/[$,\s%]/g, "");
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : Number.NaN;
};

/** The numbers from the form + everything else (names, wording) from `base`. */
export const fromForm = (f: PriceForm, base: PriceBook): unknown => ({
  packages: Object.fromEntries(
    TIER_IDS.map((id) => [
      id,
      {
        price: num(f.packages[id].price),
        hours: num(f.packages[id].hours),
        extraHour: num(f.packages[id].extraHour),
        maxHours: num(f.packages[id].maxHours),
      },
    ]),
  ),
  addOns: Object.fromEntries(ADD_ON_IDS.map((id) => [id, num(f.addOns[id])])),
  maxHours: num(f.maxHours),
  depositPercent: num(f.depositPercent),
  balanceDueDays: num(f.balanceDueDays),
  holdDays: num(f.holdDays),
  trioSpotsTotal: num(f.trioSpotsTotal),
  trioSpotsLeft: num(f.trioSpotsLeft),
  planHoldUsd: num(f.planHoldUsd),
  momentsSaturdayDays: num(f.momentsSaturdayDays),
  sessionPhotos: base.sessionPhotos,
  content: base.content,
  addOnNotes: base.addOnNotes,
  updatedAt: base.updatedAt,
  updatedBy: base.updatedBy,
});

/** Schema messages for a number field, in plain words. */
export const numberError = (message: string) =>
  /expected number|NaN/i.test(message) ? "Enter a number (half hours like 1.5 are OK for hours)." : message;

export const when = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(d);
};

/* ---------------- small pieces ---------------- */

export function Field({
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
        className={`mt-1.5 flex items-center rounded-lg border bg-white px-3 transition-[border-color,box-shadow] focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(16,16,16,0.12)] ${error ? "border-red-700" : "border-[#c9cac7]"}`}
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
          className="h-12 min-w-0 flex-1 bg-transparent text-base tabular-nums text-ink outline-none focus:outline-none focus-visible:outline-none!"
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

export function Section({ title, dek, children }: { title: string; dek?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-7">
      <h2 className="st-h2">{title}</h2>
      {dek ? <p className="mt-1 max-w-[60ch] text-[15px] leading-relaxed text-ink-soft">{dek}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ---------------- preview ---------------- */

export function PricePreview({ book }: { book: PriceBook | null }) {
  const [tier, setTier] = useState<TierId>("trio");
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
  const maxExtra = Math.max(0, maxHoursFor(book, tier) - pkg.hours);
  const canAdd = maxExtra > 0;
  const extraNow = Math.min(extra, maxExtra);
  const q = quoteCommission(book, tier, addOns, pkg.hours + extraNow);
  const name = (id: TierId) => tierName(book, id);

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
              aria-label="Half an hour less"
              disabled={extraNow <= 0}
              onClick={() => setExtra(Math.max(0, extraNow - 0.5))}
              className="st-btn-ghost w-12 !px-0 disabled:opacity-40"
            >
              −
            </button>
            <output className="min-w-[2ch] text-center text-base tabular-nums" aria-live="polite">
              {extraNow}
            </output>
            <button
              type="button"
              aria-label="Half an hour more"
              disabled={extraNow >= maxExtra}
              onClick={() => setExtra(Math.min(maxExtra, extraNow + 0.5))}
              className="st-btn-ghost w-12 !px-0 disabled:opacity-40"
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
