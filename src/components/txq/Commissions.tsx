"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, useReducedMotion } from "motion/react";
import { tierById, ADD_ONS, TIERS, matrixFor, money, pick, tierBullets, tierTeam, type Lang, type Tier, type TierId } from "./data";
import { addOnNote } from "@/lib/package-text";
import { useSite } from "./state";
import { usePriceBook } from "@/components/PriceBookProvider";
import { BASE_CREW, COORDINATOR_INCLUDED, CREW_ROLES, addOnAllowed, canShift, hourSteps, type CrewRole } from "@/lib/commission";

/**
 * Packages & Prices — the section heading. The booking panel (Intake) renders
 * inside it, so packages, hours, date, details and the request are one panel
 * with five steps instead of a long scroll.
 */
export function Commissions({ children }: { children: ReactNode }) {
  const { t } = useSite();
  return (
    <section id="commissions" className="tq-section" aria-labelledby="tq-comm-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.commissions.index}]
          </p>
          <h2 id="tq-comm-title" className="tq-display tq-head__title">
            {t.commissions.title}
          </h2>
          <p className="tq-head__dek">{t.commissions.dek}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — Package                                                    */
/* ------------------------------------------------------------------ */

/** Hours line for a package card ("6 hours included" / "8 hours, both days"). */
function hoursLine(t: ReturnType<typeof useSite>["t"], id: TierId, hours: number) {
  return id === "archive" ? t.booking.hoursBothDays(hours) : t.booking.hoursIncluded(hours);
}

/**
 * The four packages as cards — native radios, so arrow keys move between them
 * and the prices are plain server-rendered text.
 */
export function PackageStep() {
  const { t } = useSite();
  return (
    <>
      <fieldset className="tq-pkgs">
        <legend className="tq-sr">{t.booking.packagesLabel}</legend>
        {TIERS.map((x) => (
          <PackageCard key={x.id} tier={x} />
        ))}
      </fieldset>
      <CompareDialog />
    </>
  );
}

function PackageCard({ tier: x }: { tier: Tier }) {
  const { t, lang, tier, setTier } = useSite();
  const { book } = usePriceBook();
  const sel = tier === x.id;
  const id = `tq-pkg-${x.id}`;
  const p = book.packages[x.id];
  return (
    <div className="tq-pkg" data-sel={sel}>
      <input
        type="radio"
        className="tq-pkg__input"
        name="tq-package"
        id={id}
        value={x.id}
        checked={sel}
        onChange={() => setTier(x.id)}
        aria-describedby={`${id}-p ${id}-m ${id}-l`}
      />
      <div className="tq-pkg__top">
        <span className="tq-display tq-pkg__num" aria-hidden>
          {x.numeral}
        </span>
        {x.recommended ? <span className="tq-pkg__badge">{t.booking.recommended}</span> : null}
      </div>
      <label htmlFor={id} className="tq-display tq-pkg__name">
        {pick(lang, x.name)}
      </label>
      <p id={`${id}-p`} className="tq-display tq-pkg__price tq-nums">
        {money(p.price)}
      </p>
      <p id={`${id}-m`} className="tq-pkg__meta">
        {hoursLine(t, x.id, p.hours)} · {pick(lang, tierTeam(book, x.id))}
      </p>
      <ul id={`${id}-l`} className="tq-pkg__list">
        {tierBullets(book, x.id).map((b) => (
          <li key={b.en}>{pick(lang, b)}</li>
        ))}
      </ul>
      <span className="tq-pkg__mark" aria-hidden>
        {sel ? `✓ ${t.booking.chosen}` : t.booking.choose}
      </span>
    </div>
  );
}

/** "Compare all packages" — the full comparison behind a button, in a native modal dialog. */
export function CompareDialog() {
  const { t, lang, pickPackage } = useSite();
  const { book } = usePriceBook();
  const ref = useRef<HTMLDialogElement>(null);
  const matrix = useMemo(() => matrixFor(book), [book]);
  const close = () => ref.current?.close();
  const choose = (id: TierId) => {
    close();
    pickPackage(id);
  };

  return (
    <>
      <button
        type="button"
        className="tq-btn tq-btn--ghost tq-btn--lg tq-bk-compare"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        {t.booking.compare}
      </button>
      <a className="tq-bk-budget" href={lang === "es" ? "/es/presupuesto" : "/budget"}>
        {t.booking.budgetLink} <span aria-hidden>→</span>
      </a>
      <dialog
        ref={ref}
        className="tq-compare"
        aria-labelledby="tq-compare-title"
        onClick={(e) => {
          // A click on the backdrop (the dialog box itself, outside its content) closes it.
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="tq-compare__inner">
          <div className="tq-compare__head">
            <h3 id="tq-compare-title" className="tq-display tq-compare__title">
              {t.booking.compareTitle}
            </h3>
            <button type="button" className="tq-btn tq-btn--ghost" onClick={close}>
              {t.booking.compareClose} <span aria-hidden>✕</span>
            </button>
          </div>

          {/* Tablet + desktop: the full table */}
          <table className="tq-matrix tq-compare__table">
            <caption className="tq-sr">{t.booking.compareTitle}</caption>
            <colgroup>
              <col style={{ width: "22%" }} />
              {TIERS.map((x) => (
                <col key={x.id} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <td aria-hidden />
                {TIERS.map((x) => (
                  <th key={x.id} scope="col">
                    <span className="tq-compare__name">{pick(lang, x.name)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">{t.booking.comparePrice}</th>
                {TIERS.map((x) => (
                  <td key={x.id} className="tq-compare__price tq-nums">
                    {money(book.packages[x.id].price)}
                  </td>
                ))}
              </tr>
            </tbody>
            {matrix.map((g) => (
              <tbody key={g.id}>
                <tr className="tq-group">
                  <th scope="colgroup" colSpan={TIERS.length + 1}>
                    {pick(lang, g.title)}
                  </th>
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.label.en}>
                    <th scope="row">{pick(lang, r.label)}</th>
                    {TIERS.map((x) => (
                      <td key={x.id}>
                        <Cell value={r.values[x.id]} lang={lang} none={t.commissions.notIncluded} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
            <tfoot>
              <tr>
                <td aria-hidden />
                {TIERS.map((x) => (
                  <td key={x.id}>
                    <button type="button" className="tq-btn tq-btn--block" onClick={() => choose(x.id)}>
                      {t.booking.compareChoose}
                      <span className="tq-sr">: {pick(lang, x.name)}</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>

          {/* Phones: one list per package */}
          <div className="tq-compare__cards">
            {TIERS.map((x) => (
              <article key={x.id} className="tq-tiercard">
                <h4 className="tq-display tq-compare__cardname">{pick(lang, x.name)}</h4>
                <p className="tq-display tq-compare__cardprice tq-nums">{money(book.packages[x.id].price)}</p>
                {matrix.map((g) => (
                  <div key={g.id}>
                    <h5 className="tq-compare__group">{pick(lang, g.title)}</h5>
                    <dl>
                      {g.rows.map((r) => (
                        <div key={r.label.en}>
                          <dt>{pick(lang, r.label)}</dt>
                          <dd>
                            <Cell value={r.values[x.id]} lang={lang} none={t.commissions.notIncluded} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
                <button type="button" className="tq-btn tq-btn--lg tq-btn--block" onClick={() => choose(x.id)}>
                  {t.booking.compareChoose}
                  <span className="tq-sr">: {pick(lang, x.name)}</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </dialog>
    </>
  );
}

function Cell({ value, lang, none }: { value: { en: string; es: string } | null; lang: Lang; none: string }) {
  if (value) return <>{pick(lang, value)}</>;
  return (
    <span className="tq-none">
      <span aria-hidden>—</span>
      <span className="tq-sr">{none}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Hours & extras                                             */
/* ------------------------------------------------------------------ */

export function ExtrasStep({ onChangePackage }: { onChangePackage: () => void }) {
  const { t, lang, tier, hours, setHours, addOns, toggleAddOn } = useSite();
  const { book, maxHours, canAddHours } = usePriceBook();
  const p = book.packages[tier];
  const x = tierById(tier);
  const options = hourSteps(book, tier);
  const at = Math.max(0, options.indexOf(hours));
  const extras = ADD_ONS.filter((a) => addOnAllowed(tier, a.id));
  const has = tierBullets(book, tier);

  return (
    <>
      <div className="tq-bk-chosen">
        <span>
          <span className="tq-bk-chosen__name">{pick(lang, x.name)}</span>
          <span className="tq-nums"> · {money(p.price)}</span>
        </span>
        <button type="button" className="tq-bk-link" onClick={onChangePackage}>
          {t.booking.changePackage}
        </button>
      </div>

      {has.length ? (
        <div className="tq-bk-has">
          <p className="tq-bk-has__title">{t.booking.hasTitle}</p>
          <ul>
            {has.map((b) => (
              <li key={b.en}>{pick(lang, b)}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <fieldset className="tq-bk-group">
        <legend className="tq-bk-label">{t.booking.hoursTitle}</legend>
        {canAddHours(tier) && options.length > 1 ? (
          <>
            <p className="tq-bk-hint">{t.booking.hoursNote(p.hours, money(p.extraHour), maxHours(tier))}</p>
            <div className="tq-bk-hourstep">
              <span className="tq-bk-hourstep__value" aria-live="polite">
                <span className="tq-bk-hourstep__h">{t.booking.hourOption(hours)}</span>
                <span className="tq-bk-hourstep__p tq-nums">
                  {hours <= p.hours ? t.booking.includedTag : `+${money(Math.round((hours - p.hours) * p.extraHour))}`}
                </span>
              </span>
              <span className="tq-stepper-ctl">
                <button type="button" aria-label={t.booking.hoursLess} disabled={at === 0} onClick={() => setHours(options[at - 1])}>
                  −
                </button>
                <button type="button" aria-label={t.booking.hoursMoreAria} disabled={at >= options.length - 1} onClick={() => setHours(options[at + 1])}>
                  +
                </button>
              </span>
            </div>
          </>
        ) : (
          <p className="tq-bk-hint">{tier === "archive" ? t.hours.full(p.hours) : t.hours.value(p.hours)}</p>
        )}
      </fieldset>

      {extras.length ? (
        <fieldset className="tq-bk-group">
          <legend className="tq-bk-label">
            {t.booking.extrasTitle} <span className="tq-bk-opt">— {t.booking.optional}</span>
          </legend>
          <div className="tq-addons">
            {extras.map((a) => {
              const on = addOns.includes(a.id);
              return (
                <button key={a.id} type="button" className="tq-addon" aria-pressed={on} onClick={() => toggleAddOn(a.id)}>
                  <span className="tq-addon__name">{pick(lang, a.name)}</span>
                  <span className="tq-addon__state tq-nums">
                    +{money(book.addOns[a.id])}
                    <span className="tq-addon__box" aria-hidden>
                      {on ? "✓" : ""}
                    </span>
                  </span>
                  <span className="tq-addon__note">{pick(lang, addOnNote(book, a.id))}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {BASE_CREW[tier] > 1 ? (
        <details className="tq-bk-group tq-bk-more">
          <summary>{t.booking.mixToggle}</summary>
          <p className="tq-bk-hint">{t.crew.dek(BASE_CREW[tier])}</p>
          <CrewControl />
        </details>
      ) : null}
    </>
  );
}

/** Included crew: families set the photographer / videographer mix at no extra cost. */
export function CrewControl() {
  const { t, tier, crew, setCrew } = useSite();
  const total = BASE_CREW[tier];
  const shift = (to: CrewRole) => {
    const from: CrewRole = to === "photo" ? "motion" : "photo";
    setCrew({ ...crew, [to]: crew[to] + 1, [from]: crew[from] - 1 });
  };

  return (
    <div className="tq-crew" role="group" aria-label={t.crew.title}>
      {CREW_ROLES.map((role) => {
        const other: CrewRole = role === "photo" ? "motion" : "photo";
        return (
          <div key={role} className="tq-crew__row">
            <span className="tq-crew__label">{role === "photo" ? t.crew.photo : t.crew.motion}</span>
            <span className="tq-stepper-ctl">
              <button
                type="button"
                aria-label={other === "photo" ? t.crew.toPhoto : t.crew.toMotion}
                disabled={!canShift(tier, crew, other)}
                onClick={() => shift(other)}
              >
                −
              </button>
              <output className="tq-nums" aria-live="polite">
                {crew[role]}
              </output>
              <button
                type="button"
                aria-label={role === "photo" ? t.crew.toPhoto : t.crew.toMotion}
                disabled={!canShift(tier, crew, role)}
                onClick={() => shift(role)}
              >
                +
              </button>
            </span>
          </div>
        );
      })}
      <p className="tq-crew__total">
        {t.crew.total(total)}
        {COORDINATOR_INCLUDED[tier] ? <span> · {t.crew.coordinator}</span> : null}
      </p>
    </div>
  );
}

/** Tween a number toward its new value (snaps under reduced motion). */
export function useTween(value: number) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduce) {
      from.current = value;
      return;
    }
    const c = animate(from.current, value, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        from.current = v;
        setShown(Math.round(v));
      },
    });
    return () => c.stop();
  }, [value, reduce]);
  return reduce ? value : shown;
}
