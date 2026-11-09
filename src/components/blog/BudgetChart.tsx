"use client";

import { useId, useState, type CSSProperties } from "react";
import {
  AXIS_MAX_USD,
  BUDGET_MAX,
  BUDGET_MIN,
  BUDGET_START,
  BUDGET_STEP,
  BUDGET_TYPICAL_MAX,
  budgetRows,
  clampTotal,
  fmtUsd,
  packageFit,
  parseUsd,
} from "@/content/budget-lines";
import "./blog-interactive.css";

type Lang = "en" | "es";
export type BudgetPackage = { name: string; price: string };

const COPY = {
  en: {
    kicker: "Budget tool",
    title: "Move the total. See each line.",
    total: "Your total budget",
    typical: "Most DFW parties",
    luxury: "Luxury",
    line: "Line",
    range: "Typical amount",
    note: "Each line is a range from the list above, so the lines do not add up to exactly your total.",
    fitTitle: "Our packages against your photo + video share",
    in: "In your range",
    below: "Under your range",
    above: "Over your range",
    marks: "The marks on the photo + video bar are our published package prices.",
  },
  es: {
    kicker: "Herramienta de presupuesto",
    title: "Mueva el total. Vea cada rubro.",
    total: "Su presupuesto total",
    typical: "La mayoría en DFW",
    luxury: "Lujo",
    line: "Rubro",
    range: "Monto típico",
    note: "Cada rubro es un rango de la lista de arriba, así que los rubros no suman exactamente su total.",
    fitTitle: "Nuestros paquetes frente a su parte de foto y video",
    in: "Dentro de su rango",
    below: "Debajo de su rango",
    above: "Arriba de su rango",
    marks: "Las marcas en la barra de foto y video son los precios publicados de nuestros paquetes.",
  },
} as const;

const pctOfAxis = (usd: number) => Math.min(100, (usd / AXIS_MAX_USD) * 100);

/**
 * The budget post's percentages as a live chart: the reader moves one slider
 * (the total) and every line shows its dollar range. Package prices come from
 * the live price book through the block's price tokens.
 */
export function BudgetChart({ lang = "en", packages = [] }: { lang?: Lang; packages?: BudgetPackage[] }) {
  const c = COPY[lang];
  const id = useId();
  const [total, setTotal] = useState(BUDGET_START);
  const rows = budgetRows(total);
  const priced = packages
    .map((p) => ({ ...p, usd: parseUsd(p.price) }))
    .filter((p): p is BudgetPackage & { usd: number } => p.usd !== null && Boolean(p.name));
  const fill = ((total - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
  const typicalEnd = ((BUDGET_TYPICAL_MAX - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;
  const groups = (["in", "below", "above"] as const)
    .map((fit) => ({ fit, items: priced.filter((p) => packageFit(p.usd, total) === fit) }))
    .filter((g) => g.items.length);

  return (
    <section className="tq-bx tq-budget" aria-labelledby={`${id}-t`}>
      <header className="tq-bx__head">
        <p className="tq-mono tq-bx__kicker">{c.kicker}</p>
        <h3 id={`${id}-t`} className="tq-display tq-bx__title">
          {c.title}
        </h3>
      </header>

      <div className="tq-budget__control">
        <div className="tq-budget__total">
          <label htmlFor={`${id}-r`} className="tq-budget__label">
            {c.total}
          </label>
          <output htmlFor={`${id}-r`} className="tq-display tq-nums tq-budget__amount">
            {fmtUsd(total)}
          </output>
        </div>
        <input
          id={`${id}-r`}
          className="tq-budget__range"
          type="range"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={total}
          aria-valuetext={fmtUsd(total)}
          onChange={(e) => setTotal(clampTotal(Number(e.target.value)))}
          style={{ "--fill": `${fill}%` } as CSSProperties}
        />
        <div className="tq-budget__zones tq-mono" aria-hidden>
          <span style={{ width: `${typicalEnd}%` }}>{c.typical}</span>
          <span>{c.luxury}</span>
        </div>
      </div>

      <table className="tq-budget__table">
        <thead className="tq-sr">
          <tr>
            <th scope="col">{c.line}</th>
            <th scope="col">{c.range}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="tq-budget__row" data-line={r.id}>
              <th scope="row" className="tq-budget__name">
                {r[lang]}
                <span className="tq-mono tq-budget__pct">
                  {r.low === r.high ? `${r.low}%` : `${r.low}–${r.high}%`}
                </span>
              </th>
              <td className="tq-nums tq-budget__usd">
                {r.lowUsd === r.highUsd ? fmtUsd(r.lowUsd) : `${fmtUsd(r.lowUsd)} – ${fmtUsd(r.highUsd)}`}
              </td>
              <td className="tq-budget__track" aria-hidden>
                <span
                  className="tq-budget__bar"
                  style={
                    {
                      // A fixed share still needs a visible bar: draw it from zero.
                      "--from": r.low === r.high ? "0%" : `${pctOfAxis(r.lowUsd)}%`,
                      "--to": `${pctOfAxis(r.highUsd)}%`,
                    } as CSSProperties
                  }
                />
                {r.id === "photo"
                  ? priced.map((p) => (
                      <span key={p.name} className="tq-budget__mark" style={{ left: `${pctOfAxis(p.usd)}%` }} />
                    ))
                  : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {priced.length ? (
        <div className="tq-budget__fit" aria-live="polite">
          <p className="tq-budget__fit-title">{c.fitTitle}</p>
          <dl>
            {groups.map((g) => (
              <div key={g.fit} data-fit={g.fit}>
                <dt className="tq-mono">{c[g.fit]}</dt>
                <dd>
                  {g.items.map((p) => (
                    <span key={p.name} className="tq-budget__pkg">
                      {p.name} <span className="tq-nums">{fmtUsd(p.usd)}</span>
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <p className="tq-bx__note">{c.marks}</p>
        </div>
      ) : null}
      <p className="tq-bx__note">{c.note}</p>
    </section>
  );
}
