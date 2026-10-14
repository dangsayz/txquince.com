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
  CREW_ROLES,
  EXTRA_DIRECTOR_USD,
  addOnAllowed,
  maxExtraCrew,
  quoteCommission,
  type CrewRole,
} from "@/lib/commission";

/** Interchangeable crew: add photographers or videographers up to the day's maximum. */
export function CrewControl({ compact = false }: { compact?: boolean }) {
  const { t, tier, crew, setCrew } = useSite();
  const cap = maxExtraCrew(tier);
  const added = crew.photo + crew.motion;
  const size = BASE_CREW[tier] + added;

  if (cap === 0 && BASE_CREW[tier] === 1) {
    return <p className="tq-crew__note">{t.crew.studyNote}</p>;
  }
  const step = (role: CrewRole, d: number) =>
    setCrew({ ...crew, [role]: Math.max(0, crew[role] + d) });

  return (
    <div className={`tq-crew${compact ? " tq-crew--compact" : ""}`} role="group" aria-label={t.crew.title}>
      {CREW_ROLES.map((role) => (
        <div key={role} className="tq-crew__row">
          <span className="tq-crew__label">
            {role === "photo" ? t.crew.photo : t.crew.motion}
            <span className="tq-mono tq-muted"> +{money(EXTRA_DIRECTOR_USD)}</span>
          </span>
          <span className="tq-stepper-ctl">
            <button
              type="button"
              aria-label={t.crew.remove(t.crew.roleOne[role])}
              disabled={crew[role] === 0}
              onClick={() => step(role, -1)}
            >
              −
            </button>
            <output className="tq-nums" aria-live="polite">
              {crew[role]}
            </output>
            <button
              type="button"
              aria-label={t.crew.add(t.crew.roleOne[role])}
              disabled={added >= cap}
              onClick={() => step(role, 1)}
            >
              +
            </button>
          </span>
        </div>
      ))}
      <p className="tq-crew__total tq-mono">
        {t.crew.total(size)} · {t.crew.included(BASE_CREW[tier])}
        {added >= cap ? <span className="tq-muted"> · {t.crew.full}</span> : null}
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
  const { t, lang, tier, addOns, toggleAddOn, crew } = useSite();
  const total = estimate(tier, addOns, crew);
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
              <h4 className="tq-mono">{t.crew.title}</h4>
              <p className="tq-crew__dek">{t.crew.dek}</p>
              <CrewControl />
            </div>
            <div className="tq-addons">
              {ADD_ONS.map((a) => {
                const allowed = addOnAllowed(tier, a.id);
                const on = allowed && addOns.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    className="tq-addon"
                    aria-pressed={on}
                    disabled={!allowed}
                    onClick={() => toggleAddOn(a.id)}
                  >
                    <span className="tq-addon__name">{pick(lang, a.name)}</span>
                    <span className="tq-addon__state tq-mono">
                      +{money(a.price)}
                      <span className="tq-addon__box" aria-hidden>
                        {on ? "✓" : ""}
                      </span>
                    </span>
                    <span className="tq-addon__note">
                      {pick(lang, a.note)}
                      {!allowed ? <em className="tq-mono"> · {t.crew.eventOnly}</em> : null}
                    </span>
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
              {CREW_ROLES.filter((r) => crew[r] > 0).map((r) => (
                <div key={r}>
                  <dt>{t.crew.line(crew[r], r)}</dt>
                  <dd>+{money(crew[r] * EXTRA_DIRECTOR_USD)}</dd>
                </div>
              ))}
              {ADD_ONS.filter((a) => addOns.includes(a.id)).map((a) => (
                <div key={a.id}>
                  <dt>{pick(lang, a.name)}</dt>
                  <dd>+{money(a.price)}</dd>
                </div>
              ))}
              <div>
                <dt>{t.crew.total(quoteCommission(tier, addOns, crew).crewSize)}</dt>
                <dd />
              </div>
              <div>
                <dt>{t.commissions.retainer}</dt>
                <dd>{money(retainer(tier, addOns, crew))}</dd>
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
