"use client";

import Image from "next/image";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ADD_ONS,
  CITIES,
  SCOPES,
  TIERS,
  estimate,
  money,
  pick,
  tierById,
  workById,
  type Lang,
  type Scope,
} from "./data";
import { isoDate, useAvailability, useSite } from "./state";
import { useTween } from "./Commissions";

const EASE = [0.22, 1, 0.36, 1] as const;
const MAX_MONTHS_AHEAD = 36;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Request = {
  date: string;
  city: string;
  venue: string;
  scope: Scope;
  tier: string;
  addOns: string[];
  estimate: number;
  name: string;
  honoree: string;
  email: string;
  phone: string;
  language: Lang;
  note: string;
};

/**
 * Submission adapter. Resolves locally for the design preview so the full flow
 * can be exercised without a backend; connect it to /api/inquiry (Turnstile +
 * schema) once the commission tiers are mirrored in src/lib/inquiry.ts.
 */
async function submitRequest(req: Request): Promise<{ ok: boolean; ref: string }> {
  await new Promise((r) => setTimeout(r, 900));
  const ref = `TXQ-${req.date.slice(2, 4)}${req.date.slice(5, 7)}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
  return { ok: true, ref };
}

const localeOf = (l: Lang) => (l === "es" ? "es-MX" : "en-US");
const fromIso = (s: string) => new Date(`${s}T00:00:00`);

function longDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(localeOf(lang), {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(fromIso(iso));
}

export const Intake = forwardRef<HTMLElement>(function Intake(_, ref) {
  const { t, lang, tier, setTier, addOns, toggleAddOn } = useSite();
  const avail = useAvailability();
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [scope, setScope] = useState<Scope>("both");
  const [name, setName] = useState("");
  const [honoree, setHonoree] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [prefLang, setPrefLang] = useState<Lang | null>(null);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    // Bring the new step's top into view if it starts above the fold.
    const top = flowRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 64) flowRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    titleRef.current?.focus({ preventScroll: true });
  }, [step, done, reduce]);

  const total = estimate(tier, addOns);
  const shown = useTween(total);
  const language = prefLang ?? lang;
  const portrait = workById("w02");

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!date) e.date = t.intake.errors.date;
      if (!city) e.city = t.intake.errors.city;
    }
    if (s === 2) {
      if (name.trim().length < 2) e.name = t.intake.errors.name;
      if (!EMAIL.test(email.trim())) e.email = t.intake.errors.email;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => validate(step) && setStep((s) => Math.min(s + 1, 2));
  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < 2) return next();
    if (!validate(2) || !date) return;
    setSending(true);
    try {
      const res = await submitRequest({
        date,
        city,
        venue: venue.trim(),
        scope,
        tier,
        addOns,
        estimate: total,
        name: name.trim(),
        honoree: honoree.trim(),
        email: email.trim(),
        phone: phone.trim(),
        language,
        note: note.trim(),
      });
      if (res.ok) setDone(res.ref);
      else setErrors({ form: t.intake.errors.failed });
    } catch {
      setErrors({ form: t.intake.errors.failed });
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setDone(null);
    setStep(0);
    setDate(null);
    setNote("");
  };

  const cityLabel = CITIES.find((c) => c.id === city);
  const slide = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, x: 28 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -28 },
      };

  return (
    <section ref={ref} id="intake" className="tq-section" aria-labelledby="tq-intake-title">
      <div className="tq-wrap">
        <header className="tq-head">
          <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
            [{t.intake.index}]
          </p>
          <h2 id="tq-intake-title" className="tq-display tq-head__title">
            {t.intake.title}
          </h2>
        </header>

        <div className="tq-intake">
          {/* Editorial context */}
          <aside className="tq-intake__aside">
            <div className="tq-intake__portrait">
              <Image
                src={portrait.src}
                alt={pick(lang, portrait.alt)}
                fill
                unoptimized
                sizes="(min-width: 960px) 40vw, 100vw"
                style={{ objectPosition: portrait.focus }}
              />
            </div>
            <div className="tq-live">
              <span className="tq-mono" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="tq-dot" data-pending={!avail.ready} data-limited={avail.limited} aria-hidden />
                {t.intake.live}
              </span>
              <p className="tq-display tq-live__count" style={{ margin: 0 }} aria-live="polite">
                {avail.ready ? t.intake.liveCount(avail.openSaturdays) : t.status.loading}
              </p>
              <span className="tq-mono tq-muted">{t.intake.liveNote}</span>
            </div>
            <div>
              <h3 className="tq-mono" style={{ margin: "0 0 8px" }}>
                {t.intake.nextTitle}
              </h3>
              <ol className="tq-timeline">
                {t.intake.next.map((n, i) => (
                  <li key={n}>
                    <span className="tq-mono tq-muted">0{i + 1}</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          {/* Interactive flow */}
          <div ref={flowRef} className="tq-intake__flow">
            {done ? (
              <motion.div
                className="tq-done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <span className="tq-mono" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="tq-dot" aria-hidden /> {t.intake.reference} — {done}
                </span>
                <h3 ref={titleRef} tabIndex={-1} className="tq-display" style={{ outline: "none" }}>
                  {t.intake.doneTitle}
                </h3>
                <p>{t.intake.doneBody(date ? longDate(date, lang) : "", email.trim())}</p>
                <Summary
                  date={date}
                  city={cityLabel ? pick(lang, cityLabel.label) : ""}
                  total={total}
                />
                <div>
                  <button type="button" className="tq-btn tq-btn--ghost" onClick={reset}>
                    {t.intake.again}
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={submit} noValidate>
                <ol className="tq-stepper" aria-label={t.intake.stepOf(step + 1, 3)}>
                  {t.intake.steps.map((s, i) => {
                    const state = i < step ? "done" : i === step ? "current" : "todo";
                    return (
                      <li key={s} data-state={state}>
                        <button
                          type="button"
                          disabled={i >= step}
                          aria-current={i === step ? "step" : undefined}
                          onClick={() => {
                            setErrors({});
                            setStep(i);
                          }}
                        >
                          <span className="tq-mono">0{i + 1}</span>
                          <span className="tq-stepper__label">{s}</span>
                        </button>
                        {i <= step && (
                          <motion.span
                            className="tq-stepper__bar"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.6, ease: EASE }}
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    className="tq-step"
                    {...slide}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <h3 ref={titleRef} tabIndex={-1} className="tq-display tq-step__title">
                      <span className="tq-sr">{t.intake.stepOf(step + 1, 3)}: </span>
                      {t.intake.steps[step]}
                    </h3>

                    {step === 0 && (
                      <>
                        <Calendar
                          value={date}
                          onChange={(d) => {
                            setDate(d);
                            setErrors((e) => ({ ...e, date: "" }));
                          }}
                          error={errors.date}
                        />

                        <fieldset className="tq-field" style={{ border: 0, padding: 0, margin: 0 }}>
                          <legend className="tq-mono tq-legend" style={{ marginBottom: 10 }}>
                            {t.intake.city}
                          </legend>
                          <div className="tq-pills">
                            {CITIES.map((c) => (
                              <label key={c.id} className="tq-pill">
                                <input
                                  type="radio"
                                  name="city"
                                  value={c.id}
                                  checked={city === c.id}
                                  onChange={() => {
                                    setCity(c.id);
                                    setErrors((e) => ({ ...e, city: "" }));
                                  }}
                                  aria-describedby={errors.city ? "err-city" : undefined}
                                />
                                {pick(lang, c.label)}
                              </label>
                            ))}
                          </div>
                          {errors.city && (
                            <p id="err-city" className="tq-error" role="alert">
                              {errors.city}
                            </p>
                          )}
                        </fieldset>

                        <div className="tq-field">
                          <label htmlFor="tq-venue" className="tq-mono">
                            {t.intake.venue} <span className="tq-muted">— {t.intake.optional}</span>
                          </label>
                          <input
                            id="tq-venue"
                            className="tq-input"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            autoComplete="off"
                            aria-describedby="tq-venue-hint"
                          />
                          <p id="tq-venue-hint" className="tq-hint">
                            {t.intake.venueHint}
                          </p>
                        </div>

                        <fieldset className="tq-field" style={{ border: 0, padding: 0, margin: 0 }}>
                          <legend className="tq-mono tq-legend" style={{ marginBottom: 10 }}>
                            {t.intake.scope}
                          </legend>
                          <div className="tq-pills">
                            {SCOPES.map((s) => (
                              <label key={s.id} className="tq-pill">
                                <input
                                  type="radio"
                                  name="scope"
                                  value={s.id}
                                  checked={scope === s.id}
                                  onChange={() => setScope(s.id)}
                                />
                                {pick(lang, s.label)}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <fieldset className="tq-field" style={{ border: 0, padding: 0, margin: 0 }}>
                          <legend className="tq-mono tq-legend" style={{ marginBottom: 10 }}>
                            {t.intake.tier}
                          </legend>
                          <div className="tq-choice">
                            {TIERS.map((x) => (
                              <label key={x.id}>
                                <input
                                  type="radio"
                                  name="tier"
                                  value={x.id}
                                  checked={tier === x.id}
                                  onChange={() => setTier(x.id)}
                                />
                                <span className="tq-display tq-choice__num">{x.numeral}</span>
                                <span>
                                  <span className="tq-choice__name" style={{ display: "block" }}>
                                    {pick(lang, x.name)}
                                  </span>
                                  <span className="tq-muted" style={{ fontSize: "0.9375rem" }}>
                                    {pick(lang, x.summary)}
                                  </span>
                                </span>
                                <span className="tq-mono tq-choice__price tq-nums">{money(x.price)}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        <fieldset className="tq-field" style={{ border: 0, padding: 0, margin: 0 }}>
                          <legend className="tq-mono tq-legend" style={{ marginBottom: 10 }}>
                            {t.intake.addOns} <span className="tq-muted">— {t.intake.optional}</span>
                          </legend>
                          <div className="tq-choice tq-choice--check">
                            {ADD_ONS.map((a) => (
                              <label key={a.id}>
                                <input
                                  type="checkbox"
                                  checked={addOns.includes(a.id)}
                                  onChange={() => toggleAddOn(a.id)}
                                />
                                <span className="tq-choice__box" aria-hidden>
                                  {addOns.includes(a.id) ? "✓" : ""}
                                </span>
                                <span>{pick(lang, a.name)}</span>
                                <span className="tq-mono tq-choice__price tq-nums">+{money(a.price)}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>

                        <div className="tq-total">
                          <span className="tq-mono">{t.intake.estimate}</span>
                          <span className="tq-display tq-nums" aria-live="polite">
                            <span className="tq-sr">{money(total)}</span>
                            <span aria-hidden>{money(shown)}</span>
                          </span>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <Summary
                          date={date}
                          city={cityLabel ? pick(lang, cityLabel.label) : ""}
                          total={total}
                        />
                        <div className="tq-fieldrow">
                          <Field
                            id="tq-name"
                            label={t.intake.parent}
                            hint={t.intake.parentHint}
                            value={name}
                            onChange={setName}
                            autoComplete="name"
                            error={errors.name}
                            required
                          />
                          <Field
                            id="tq-honoree"
                            label={t.intake.honoree}
                            optional={t.intake.optional}
                            value={honoree}
                            onChange={setHonoree}
                            autoComplete="off"
                          />
                        </div>
                        <div className="tq-fieldrow">
                          <Field
                            id="tq-email"
                            type="email"
                            label={t.intake.email}
                            value={email}
                            onChange={setEmail}
                            autoComplete="email"
                            inputMode="email"
                            error={errors.email}
                            required
                          />
                          <Field
                            id="tq-phone"
                            type="tel"
                            label={t.intake.phone}
                            optional={t.intake.optional}
                            value={phone}
                            onChange={setPhone}
                            autoComplete="tel"
                            inputMode="tel"
                          />
                        </div>
                        <fieldset className="tq-field" style={{ border: 0, padding: 0, margin: 0 }}>
                          <legend className="tq-mono tq-legend" style={{ marginBottom: 10 }}>
                            {t.intake.language}
                          </legend>
                          <div className="tq-pills">
                            {(["en", "es"] as Lang[]).map((l) => (
                              <label key={l} className="tq-pill" lang={l}>
                                <input
                                  type="radio"
                                  name="language"
                                  value={l}
                                  checked={language === l}
                                  onChange={() => setPrefLang(l)}
                                />
                                {t.intake.langs[l]}
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        <div className="tq-field">
                          <label htmlFor="tq-note" className="tq-mono">
                            {t.intake.note} <span className="tq-muted">— {t.intake.optional}</span>
                          </label>
                          <textarea
                            id="tq-note"
                            className="tq-input"
                            rows={3}
                            value={note}
                            placeholder={t.intake.notePlaceholder}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>
                        {errors.form && (
                          <p className="tq-error" role="alert">
                            {errors.form}
                          </p>
                        )}
                      </>
                    )}

                    <div className="tq-step__nav">
                      {step > 0 && (
                        <button type="button" className="tq-btn tq-btn--ghost tq-btn--lg" onClick={back}>
                          ← {t.intake.back}
                        </button>
                      )}
                      <button type="submit" className="tq-btn tq-btn--lg" disabled={sending}>
                        {step < 2 ? (
                          <>
                            {t.intake.continue} <span className="tq-arrow" aria-hidden>→</span>
                          </>
                        ) : sending ? (
                          t.intake.sending
                        ) : (
                          <>
                            {t.intake.submit} <span className="tq-arrow" aria-hidden>↗</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

/* ------------------------------------------------------------------ */

function Summary({ date, city, total }: { date: string | null; city: string; total: number }) {
  const { t, lang, tier, addOns } = useSite();
  const x = tierById(tier);
  const extras = ADD_ONS.filter((a) => addOns.includes(a.id));
  return (
    <dl className="tq-summary" aria-label={t.intake.summary}>
      <div>
        <dt className="tq-mono">{t.intake.steps[0]}</dt>
        <dd>
          {date ? longDate(date, lang) : "—"}
          {city ? ` · ${city}` : ""}
        </dd>
      </div>
      <div>
        <dt className="tq-mono">{t.intake.steps[1]}</dt>
        <dd>
          {x.numeral} {pick(lang, x.name)}
          {extras.length > 0 && ` + ${extras.map((a) => pick(lang, a.name)).join(", ")}`}
        </dd>
      </div>
      <div>
        <dt className="tq-mono">{t.intake.estimate}</dt>
        <dd className="tq-nums">{money(total)}</dd>
      </div>
    </dl>
  );
}

function Field({
  id,
  label,
  hint,
  optional,
  value,
  onChange,
  error,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  hint?: string;
  optional?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(" ") || undefined;
  return (
    <div className="tq-field">
      <label htmlFor={id} className="tq-mono">
        {label}
        {optional && <span className="tq-muted"> — {optional}</span>}
      </label>
      <input
        id={id}
        type={type}
        className="tq-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint && (
        <p id={`${id}-hint`} className="tq-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} className="tq-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Calendar({
  value,
  onChange,
  error,
}: {
  value: string | null;
  onChange: (iso: string) => void;
  error?: string;
}) {
  const { t, lang } = useSite();
  const { taken } = useAvailability();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const [view, setView] = useState(() => {
    const d = value ? fromIso(value) : today;
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const monthsAhead = (view.y - today.getFullYear()) * 12 + (view.m - today.getMonth());
  const shift = (d: number) =>
    setView(({ y, m }) => {
      const n = new Date(y, m + d, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });

  const loc = localeOf(lang);
  const monthLabel = new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" }).format(
    new Date(view.y, view.m, 1),
  );
  // 2023-01-01 was a Sunday.
  const dows = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(loc, { weekday: "short" }).format(new Date(2023, 0, 1 + i)).replace(".", ""),
  );
  const lead = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const dayFmt = new Intl.DateTimeFormat(loc, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="tq-field" role="group" aria-labelledby="tq-cal-label">
      <span id="tq-cal-label" className="tq-mono tq-legend">
        {t.intake.date}
      </span>
      <div>
        <div className="tq-cal__nav">
          <span className="tq-display tq-cal__month" aria-live="polite">
            {monthLabel}
          </span>
          <span className="tq-cal__arrows">
            <button
              type="button"
              className="tq-icon-btn"
              onClick={() => shift(-1)}
              disabled={monthsAhead <= 0}
              aria-label={t.intake.prevMonth}
              style={monthsAhead <= 0 ? { opacity: 0.35, cursor: "not-allowed" } : undefined}
            >
              ←
            </button>
            <button
              type="button"
              className="tq-icon-btn"
              onClick={() => shift(1)}
              disabled={monthsAhead >= MAX_MONTHS_AHEAD}
              aria-label={t.intake.nextMonth}
            >
              →
            </button>
          </span>
        </div>
        <div className="tq-cal__grid">
          {dows.map((d) => (
            <span key={d} className="tq-cal__dow tq-mono" aria-hidden>
              {d}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`b${i}`} aria-hidden />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = new Date(view.y, view.m, i + 1);
            const iso = isoDate(d);
            const past = d < today;
            const isTaken = taken.has(iso);
            const picked = value === iso;
            return (
              <button
                key={iso}
                type="button"
                className="tq-day tq-nums"
                disabled={past || isTaken}
                aria-pressed={picked}
                aria-label={`${dayFmt.format(d)}${isTaken ? ` — ${t.intake.legendTaken}` : ""}`}
                data-past={past}
                data-taken={isTaken}
                data-today={d.getTime() === today.getTime()}
                data-sat={d.getDay() === 6}
                onClick={() => onChange(iso)}
              >
                <span>{i + 1}</span>
              </button>
            );
          })}
        </div>
        <div className="tq-cal__legend tq-mono" aria-hidden>
          <span>
            <i className="tq-cal__key" /> {t.intake.legendOpen}
          </span>
          <span>
            <i className="tq-cal__key tq-cal__key--taken" /> {t.intake.legendTaken}
          </span>
          <span>
            <i className="tq-cal__key tq-cal__key--picked" /> {t.intake.legendPicked}
          </span>
        </div>
      </div>
      <p className="tq-picked" aria-live="polite" style={{ margin: 0 }}>
        {value ? (
          <>
            <span className="tq-dot" aria-hidden />
            <span>
              <span className="tq-mono tq-muted">{t.intake.pickedPrefix} — </span>
              {longDate(value, lang)}
            </span>
          </>
        ) : (
          <span className="tq-muted">{t.intake.noDate}</span>
        )}
      </p>
      {error && (
        <p className="tq-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
