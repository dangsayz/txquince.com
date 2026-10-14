"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import {
  ADD_ONS,
  MATRIX,
  TIERS,
  estimate,
  money,
  retainer,
  pick,
  tierById,
  type Lang,
} from "./data";
import { useSite } from "./state";
import {
  BASE_CREW,
  BASE_HOURS,
  COORDINATOR_INCLUDED,
  CREW_ROLES,
  EXTRA_HOUR_USD,
  MAX_HOURS,
  canShift,
  type CrewRole,
} from "@/lib/commission";

/** Hours on the day: included hours, plus extra hours one at a time up to MAX_HOURS. */
export function HoursControl() {
  const { t, tier, hours, setHours } = useSite();
  const base = BASE_HOURS[tier];
  if (base >= MAX_HOURS) {
    return <p className="tq-crew__note">{t.hours.full(base)}</p>;
  }
  return (
    <div className="tq-crew" role="group" aria-label={t.hours.title}>
      <div className="tq-crew__row">
        <span className="tq-crew__label">{t.hours.label}</span>
        <span className="tq-stepper-ctl">
          <button type="button" aria-label={t.hours.less} disabled={hours <= base} onClick={() => setHours(hours - 1)}>
            −
          </button>
          <output className="tq-nums" aria-live="polite">
            {hours}
          </output>
          <button type="button" aria-label={t.hours.more} disabled={hours >= MAX_HOURS} onClick={() => setHours(hours + 1)}>
            +
          </button>
        </span>
      </div>
      <p className="tq-crew__total tq-mono">
        {t.hours.value(hours)}
        {hours > base ? <span> · +{money((hours - base) * EXTRA_HOUR_USD[tier])}</span> : null}
      </p>
    </div>
  );
}

/** Included crew: families set the photographer / videographer mix at no extra cost. */
export function CrewControl({ compact = false }: { compact?: boolean }) {
  const { t, tier, crew, setCrew } = useSite();
  const total = BASE_CREW[tier];

  if (total === 1) {
    return <p className="tq-crew__note">{t.crew.studyNote}</p>;
  }
  const shift = (to: CrewRole) => {
    const from: CrewRole = to === "photo" ? "motion" : "photo";
    setCrew({ ...crew, [to]: crew[to] + 1, [from]: crew[from] - 1 });
  };

  return (
    <div className={`tq-crew${compact ? " tq-crew--compact" : ""}`} role="group" aria-label={t.crew.title}>
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
      <p className="tq-crew__total tq-mono">
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

export function Commissions() {
  const { t, lang, tier, addOns, toggleAddOn, crew, hours } = useSite();
  const total = estimate(tier, addOns, hours);
  const shown = useTween(total);
  const current = tierById(tier);

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

        {/* Desktop: exposed 1px comparison matrix */}
        <div className="tq-matrix-wrap">
          <table className="tq-matrix">
            <caption className="tq-sr">{t.commissions.title}</caption>
            <colgroup>
              <col style={{ width: "18%" }} />
              {TIERS.map((x) => (
                <col key={x.id} className={x.id === tier ? "is-sel" : undefined} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <td aria-hidden />
                {TIERS.map((x) => (
                  <th key={x.id} scope="col">
                    <TierHead id={x.id} lang={lang} />
                  </th>
                ))}
              </tr>
            </thead>
            {MATRIX.map((g) => (
              <tbody key={g.id}>
                <tr className="tq-group">
                  <th scope="colgroup" colSpan={TIERS.length + 1} className="tq-mono">
                    {pick(lang, g.title)}
                  </th>
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.label.en}>
                    <th scope="row">{pick(lang, r.label)}</th>
                    {TIERS.map((x) => {
                      const val = r.values[x.id];
                      return (
                        <td key={x.id}>
                          {val ? (
                            pick(lang, val)
                          ) : (
                            <span className="tq-none">
                              <span aria-hidden>—</span>
                              <span className="tq-sr">{t.commissions.notIncluded}</span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        {/* Mobile + tablet: one card per tier */}
        <div className="tq-tiercards">
          {TIERS.map((x) => (
            <article key={x.id} className="tq-tiercard" data-sel={x.id === tier}>
              <TierHead id={x.id} lang={lang} />
              {MATRIX.map((g) => (
                <div key={g.id}>
                  <h4 className="tq-mono">{pick(lang, g.title)}</h4>
                  <dl style={{ margin: 0 }}>
                    {g.rows.map((r) => {
                      const val = r.values[x.id];
                      return (
                        <div key={r.label.en}>
                          <dt>{pick(lang, r.label)}</dt>
                          <dd className={val ? undefined : "tq-none"}>
                            {val ? pick(lang, val) : <><span aria-hidden>—</span><span className="tq-sr">{t.commissions.notIncluded}</span></>}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              ))}
            </article>
          ))}
        </div>

        {/* Tailor drawer + live estimate */}
        <div className="tq-tailor">
          <div className="tq-tailor__left">
            <h3 className="tq-display">{t.commissions.tailor}</h3>
            <p>{t.commissions.tailorDek}</p>
            <div className="tq-crew-block">
              <h4 className="tq-mono">{t.hours.title}</h4>
              {BASE_HOURS[tier] < MAX_HOURS ? (
                <p className="tq-crew__dek">{t.hours.dek(BASE_HOURS[tier], money(EXTRA_HOUR_USD[tier]), MAX_HOURS)}</p>
              ) : null}
              <HoursControl />
            </div>
            <div className="tq-crew-block">
              <h4 className="tq-mono">{t.crew.title}</h4>
              {BASE_CREW[tier] > 1 ? <p className="tq-crew__dek">{t.crew.dek(BASE_CREW[tier])}</p> : null}
              <CrewControl />
            </div>
            <div className="tq-addons">
              {ADD_ONS.map((a) => {
                const on = addOns.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    className="tq-addon"
                    aria-pressed={on}
                    onClick={() => toggleAddOn(a.id)}
                  >
                    <span className="tq-addon__name">{pick(lang, a.name)}</span>
                    <span className="tq-addon__state tq-mono">
                      +{money(a.price)}
                      <span className="tq-addon__box" aria-hidden>
                        {on ? "✓" : ""}
                      </span>
                    </span>
                    <span className="tq-addon__note">{pick(lang, a.note)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside className="tq-estimate" aria-labelledby="tq-est-label">
            <p id="tq-est-label" className="tq-mono" style={{ margin: 0 }}>
              {t.commissions.estimate}
            </p>
            <p className="tq-display tq-estimate__total tq-nums" style={{ margin: 0 }} aria-live="polite" aria-atomic>
              <span className="tq-sr">{money(total)}</span>
              <span aria-hidden>{money(shown)}</span>
            </p>
            <dl className="tq-estimate__lines tq-nums">
              <div>
                <dt>
                  {current.numeral} {pick(lang, current.name)}
                </dt>
                <dd>{money(current.price)}</dd>
              </div>
              <div>
                <dt>{t.hours.label}</dt>
                <dd>{t.hours.value(hours)}</dd>
              </div>
              {hours > BASE_HOURS[tier] ? (
                <div>
                  <dt>{t.hours.extra(hours - BASE_HOURS[tier])}</dt>
                  <dd>+{money((hours - BASE_HOURS[tier]) * EXTRA_HOUR_USD[tier])}</dd>
                </div>
              ) : null}
              {ADD_ONS.filter((a) => addOns.includes(a.id)).map((a) => (
                <div key={a.id}>
                  <dt>{pick(lang, a.name)}</dt>
                  <dd>+{money(a.price)}</dd>
                </div>
              ))}
              <div>
                <dt>{t.crew.total(BASE_CREW[tier])}</dt>
                <dd>{BASE_CREW[tier] > 1 ? t.crew.mix(crew.photo, crew.motion) : t.crew.mix(1, 0)}</dd>
              </div>
              {COORDINATOR_INCLUDED[tier] ? (
                <div>
                  <dt>{t.crew.coordinator}</dt>
                  <dd>✓</dd>
                </div>
              ) : null}
              <div>
                <dt>{t.commissions.retainer}</dt>
                <dd>{money(retainer(tier, addOns, hours))}</dd>
              </div>
            </dl>
            <a href="#intake" className="tq-btn tq-btn--lg tq-btn--block">
              {t.commissions.begin} <span className="tq-arrow" aria-hidden>→</span>
            </a>
            <p className="tq-estimate__fine">{t.commissions.fine}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function TierHead({ id, lang }: { id: (typeof TIERS)[number]["id"]; lang: Lang }) {
  const { t, tier, setTier } = useSite();
  const x = tierById(id);
  const sel = tier === id;
  return (
    <div className="tq-tierhead">
      <span className="tq-display tq-tierhead__num">{x.numeral}</span>
      <span className="tq-display tq-tierhead__name">{pick(lang, x.name)}</span>
      <p className="tq-tierhead__sum">{pick(lang, x.summary)}</p>
      <span>
        <span className="tq-mono tq-muted" style={{ display: "block", marginBottom: 4 }}>
          {t.commissions.investment}
        </span>
        <span className="tq-display tq-tierhead__price tq-nums">{money(x.price)}</span>
      </span>
      <button
        type="button"
        className={`tq-btn ${sel ? "" : "tq-btn--ghost"}`}
        aria-pressed={sel}
        onClick={() => setTier(id)}
      >
        {sel ? `✓ ${t.commissions.selected}` : t.commissions.select}
        <span className="tq-sr">: {pick(lang, x.name)}</span>
      </button>
    </div>
  );
}
