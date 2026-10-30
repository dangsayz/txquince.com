"use client";

/**
 * The booking panel — ONE panel with five steps (Package · Hours & extras ·
 * Date · Your details · Send request) inside the Packages & Prices section.
 *
 * Steps are a stepper, not an ARIA tablist: it is one form filled in order,
 * later steps stay locked until the earlier ones are valid, and the current
 * step is announced with aria-current="step". Plain buttons keep Tab order
 * honest (no roving tabindex to learn) and screen readers read "Step 2 of 5".
 *
 * The family SENDS AN INQUIRY here — nothing is held, signed or charged. Their
 * picks go to /api/inquiry, which re-prices them with the server's book and
 * files them as a normal inquiry; the studio follows up and sends the deposit
 * link. Every number shown comes from the live price book.
 */
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { getFirstTouch } from "@/components/Tracker";
import { ContactLine } from "@/components/ContactButtons";
import { BASE_CREW, COORDINATOR_INCLUDED } from "@/lib/commission";
import { HONEYPOT_FIELD } from "@/lib/inquiry";
import { usePriceBook } from "@/components/PriceBookProvider";
import { ADD_ONS, CITIES, money, pick, tierById, type Lang, type TierId } from "./data";
import { BOOKING_STEPS, isoDate, useAvailability, useQuote, useSite } from "./state";
import { ExtrasStep, PackageStep, useTween } from "./Commissions";

const EASE = [0.22, 1, 0.36, 1] as const;
const LAST = BOOKING_STEPS - 1;
const MAX_MONTHS_AHEAD = 36;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BOOK_HASH = /^#book-(study|cinema|production|archive)$/;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Turnstile is locked to production hostnames; local dev skips it (the API
// also skips verification when no secret is configured outside production).
const SHOW_TURNSTILE = Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

/** Link that opens the booking panel at Hours & extras with this package chosen. */
export const bookHref = (tier: TierId) => `#book-${tier}`;

type Done = { date: string; email: string };
type Errors = Record<string, string>;

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

/** "16:00" → "4:00 PM" (en) / "4:00 p.m." (es). */
function timeLabel(hhmm: string, lang: Lang) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return "";
  return new Intl.DateTimeFormat(localeOf(lang), { hour: "numeric", minute: "2-digit" }).format(
    new Date(2000, 0, 1, Number(m[1]), Number(m[2])),
  );
}

const isTextField = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  el.matches("textarea, select, input:not([type=radio]):not([type=checkbox]):not([type=button]):not([type=submit])");

export const Intake = forwardRef<HTMLDivElement | null>(function Intake(_, ref) {
  const { t, lang, tier, addOns, crew, hours, booking: b, updateBooking, resetBooking, pickPackage, pickTick } =
    useSite();
  const avail = useAvailability();
  const quote = useQuote();
  const step = b.step;

  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const [token, setToken] = useState("");
  /** Month the calendar opens on when no date is picked. */
  const anchor: string | null = null;
  /** Bumps whenever the step changes on purpose: focus the heading, bring the panel into view. */
  const [moveTick, setMoveTick] = useState(0);

  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  useImperativeHandle(ref, () => panelRef.current as HTMLDivElement);

  const language = b.prefLang ?? lang;
  // The package decides what's covered: the Portrait Session is photos only.
  const scope = tier === "study" ? "stills" : "both";
  const moved = moveTick > 0 || pickTick > 0;

  /* ---------- step moves ---------- */

  const errorsFor = (s: number): Errors => {
    const e: Errors = {};
    if (s === 2) {
      if (!b.date) e.date = t.booking.errors.date;
      if (!b.city) e.city = t.booking.errors.city;
    }
    if (s === 3) {
      if (b.name.trim().length < 2) e.name = t.booking.errors.name;
      if (!EMAIL.test(b.email.trim())) e.email = t.booking.errors.email;
      if (b.phone.replace(/\D/g, "").length < 7) e.phone = t.booking.errors.phone;
    }
    return e;
  };

  const focusFirstInvalid = () =>
    requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"]')?.focus(),
    );

  /** Go to a step. Moving forward checks every step in between; the first one with a problem opens instead. */
  const go = (target: number) => {
    for (let s = step; s < target; s++) {
      const e = errorsFor(s);
      if (Object.keys(e).length) {
        setErrors(e);
        if (s !== step) {
          updateBooking({ step: s });
          setMoveTick((n) => n + 1);
        }
        focusFirstInvalid();
        return;
      }
    }
    setErrors({});
    updateBooking({ step: target, reached: Math.max(b.reached, target) });
    setMoveTick((n) => n + 1);
  };

  const clearError = (key: string) => setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));

  // After a deliberate step change: heading gets focus; the panel's top is
  // scrolled into view only when it has gone off-screen.
  useEffect(() => {
    if (!moveTick && !pickTick) return;
    const panel = panelRef.current;
    if (!panel) return;
    const top = panel.getBoundingClientRect().top;
    const header = parseFloat(getComputedStyle(panel).scrollMarginTop) || 64;
    if (top < header - 1 || top > window.innerHeight - 120) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [moveTick, pickTick]);

  // "Book this" links anywhere: #book-<package> opens the panel at Hours & extras.
  useEffect(() => {
    const onHash = () => {
      const m = BOOK_HASH.exec(window.location.hash);
      if (!m) return;
      pickPackage(m[1] as TierId);
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}#intake`);
    };
    // After the draft restore (a parent effect) so the link wins over an old draft.
    const id = window.setTimeout(onHash, 0);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("hashchange", onHash);
    };
  }, [pickPackage]);

  /* ---------- running total bar (phones + tablets) ---------- */

  const [inView, setInView] = useState(false);
  const [navInView, setNavInView] = useState(false);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const panel = panelRef.current;
    const nav = navRef.current;
    if (!panel) return;
    const a = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "0px 0px -30% 0px" });
    a.observe(panel);
    const c = nav ? new IntersectionObserver(([e]) => setNavInView(e.isIntersecting)) : null;
    if (nav) c?.observe(nav);
    return () => {
      a.disconnect();
      c?.disconnect();
    };
  }, [done]);
  // The bar steps aside while the keyboard is up (a text field has focus) and
  // whenever the step's own Back/Next row is on screen.
  const showBar = !done && inView && !navInView && !typing;

  const onPanelFocus = (e: React.FocusEvent) => {
    const text = isTextField(e.target);
    setTyping(text);
    // A control reached by keyboard must never sit under the bar.
    const bar = barRef.current;
    if (!text && showBar && bar && e.target instanceof HTMLElement && !bar.contains(e.target)) {
      const r = e.target.getBoundingClientRect();
      const limit = window.innerHeight - bar.offsetHeight - 12;
      if (r.bottom > limit) window.scrollBy({ top: r.bottom - limit, behavior: "instant" });
    }
  };

  /* ---------- send ---------- */

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (step < LAST) return go(step + 1);
    for (let s = 0; s < LAST; s++) {
      const e = errorsFor(s);
      if (Object.keys(e).length) {
        setErrors(e);
        updateBooking({ step: s });
        setMoveTick((n) => n + 1);
        focusFirstInvalid();
        return;
      }
    }
    if (!b.date) return;
    if (SHOW_TURNSTILE && !token) {
      setErrors({ form: t.booking.errors.verify });
      return;
    }
    setSending(true);
    setErrors({});
    setNotice("");
    let ok = false;
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: b.name.trim(),
          email: b.email.trim(),
          phone: b.phone.trim(),
          event_date: b.date,
          venue: b.venue.trim(),
          // The server derives services, budget and the priced summary from `package`.
          services: tier === "study" ? "photo" : "both",
          budget_range: "full",
          message: b.note.trim(),
          package: {
            city: b.city,
            venue: b.venue.trim(),
            start_time: timeLabel(b.startTime, "en"),
            scope,
            tier,
            add_ons: addOns,
            crew_mix: crew ?? undefined,
            hours,
            honoree: b.honoree.trim(),
            language,
            share_permission: b.share,
          },
          [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
          "cf-turnstile-response": token,
          attribution: getFirstTouch(),
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setErrors({ form: j.error || t.booking.errors.failed });
        return;
      }
      ok = true;
      setDone({ date: b.date, email: b.email.trim() });
      resetBooking();
      avail.refresh();
      setMoveTick((n) => n + 1);
    } catch {
      setErrors({ form: t.booking.errors.failed });
    } finally {
      setSending(false);
      // A Turnstile token is single-use: get a fresh one for the next try.
      if (!ok && SHOW_TURNSTILE) {
        turnstileRef.current?.reset();
        setToken("");
      }
    }
  };

  const nextLabel = step < LAST ? t.booking.next : sending ? t.booking.sending : t.booking.send;

  return (
    <div
      ref={panelRef}
      id="intake"
      className="tq-bk"
      role="region"
      aria-label={t.booking.label}
      onFocus={onPanelFocus}
      onBlur={() => setTyping(false)}
    >
      {done ? (
        <Success done={done} onAgain={() => setDone(null)} headingRef={headingRef} />
      ) : (
        <>
          <nav className="tq-bk-steps" aria-label={t.booking.stepsLabel}>
            <ol>
              {t.booking.steps.map((label, i) => {
                const passed = i < b.reached && i !== step;
                const state = i === step ? "current" : i <= b.reached ? "open" : "locked";
                return (
                  <li key={label} data-state={state}>
                    <button
                      type="button"
                      disabled={i > b.reached}
                      aria-current={i === step ? "step" : undefined}
                      onClick={() => i !== step && go(i)}
                    >
                      <span className="tq-bk-steps__n tq-nums" aria-hidden>
                        {passed ? "✓" : i + 1}
                      </span>
                      <span className="tq-bk-steps__label">{label}</span>
                      {passed ? <span className="tq-sr">, {t.booking.stepDone}</span> : null}
                      {state === "locked" ? <span className="tq-sr">, {t.booking.stepLocked}</span> : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="tq-bk-body">
            <form id="tq-bk-form" className="tq-bk-main" onSubmit={submit} noValidate>
              {/* Honeypot — hidden from people; bots fill it and are quietly dropped. */}
              <div aria-hidden className="tq-sr">
                <label htmlFor={`tq-${HONEYPOT_FIELD}`}>Leave this empty</label>
                <input
                  ref={honeypotRef}
                  id={`tq-${HONEYPOT_FIELD}`}
                  name={HONEYPOT_FIELD}
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <motion.div
                key={step}
                className="tq-bk-step"
                initial={moved ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                <div className="tq-bk-head">
                  <p className="tq-bk-kicker" aria-hidden>
                    {t.booking.stepOf(step + 1, BOOKING_STEPS)}
                  </p>
                  <h3 ref={headingRef} tabIndex={-1} className="tq-display tq-bk-title">
                    <span className="tq-sr">{t.booking.stepOf(step + 1, BOOKING_STEPS)}: </span>
                    {t.booking.steps[step]}
                  </h3>
                  <p className="tq-bk-dek">
                    {[t.booking.packageDek, t.booking.extrasDek, t.booking.dateDek, t.booking.detailsDek, t.booking.sendDek][step]}
                  </p>
                </div>

                {step === 0 && <PackageStep />}

                {step === 1 && <ExtrasStep onChangePackage={() => go(0)} />}

                {step === 2 && (
                  <>
                    <p className="tq-bk-live" aria-live="polite">
                      <span className="tq-dot" data-pending={!avail.ready} data-limited={avail.limited} aria-hidden />
                      {avail.ready ? t.booking.openCount(avail.openSaturdays) : t.status.loading}
                    </p>
                    <Calendar
                      value={b.date}
                      anchor={anchor}
                      onChange={(d) => {
                        updateBooking({ date: d });
                        clearError("date");
                      }}
                      error={errors.date}
                    />
                    <fieldset className="tq-bk-group">
                      <legend className="tq-bk-label">{t.booking.city}</legend>
                      <div className="tq-pills">
                        {CITIES.map((c, i) => (
                          <label key={c.id} className="tq-pill">
                            <input
                              type="radio"
                              name="city"
                              value={c.id}
                              checked={b.city === c.id}
                              onChange={() => {
                                updateBooking({ city: c.id });
                                clearError("city");
                              }}
                              aria-invalid={errors.city && i === 0 ? true : undefined}
                              aria-describedby={errors.city ? "tq-err-city" : undefined}
                            />
                            {pick(lang, c.label)}
                          </label>
                        ))}
                      </div>
                      {errors.city ? (
                        <p id="tq-err-city" className="tq-error" role="alert">
                          {errors.city}
                        </p>
                      ) : null}
                    </fieldset>
                    <div className="tq-fieldrow">
                      <Field
                        id="tq-venue"
                        label={t.booking.venue}
                        optional={t.booking.optional}
                        hint={t.booking.venueHint}
                        value={b.venue}
                        onChange={(v) => updateBooking({ venue: v })}
                        autoComplete="off"
                        maxLength={160}
                      />
                      <Field
                        id="tq-start"
                        type="time"
                        label={t.booking.startTime}
                        optional={t.booking.optional}
                        hint={t.booking.startHint}
                        value={b.startTime}
                        onChange={(v) => updateBooking({ startTime: v })}
                        autoComplete="off"
                      />
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="tq-fieldrow">
                      <Field
                        id="tq-name"
                        label={t.booking.parent}
                        hint={t.booking.parentHint}
                        value={b.name}
                        onChange={(v) => {
                          updateBooking({ name: v });
                          clearError("name");
                        }}
                        autoComplete="name"
                        autoCapitalize="words"
                        maxLength={120}
                        error={errors.name}
                        required
                      />
                      <Field
                        id="tq-email"
                        type="email"
                        label={t.booking.email}
                        value={b.email}
                        onChange={(v) => {
                          updateBooking({ email: v });
                          clearError("email");
                        }}
                        autoComplete="email"
                        inputMode="email"
                        autoCapitalize="off"
                        spellCheck={false}
                        maxLength={200}
                        error={errors.email}
                        required
                      />
                    </div>
                    <div className="tq-fieldrow">
                      <Field
                        id="tq-phone"
                        type="tel"
                        label={t.booking.phone}
                        value={b.phone}
                        onChange={(v) => {
                          updateBooking({ phone: v });
                          clearError("phone");
                        }}
                        autoComplete="tel"
                        inputMode="tel"
                        maxLength={40}
                        error={errors.phone}
                        required
                      />
                      <Field
                        id="tq-honoree"
                        label={t.booking.honoree}
                        optional={t.booking.optional}
                        value={b.honoree}
                        onChange={(v) => updateBooking({ honoree: v })}
                        autoComplete="off"
                        autoCapitalize="words"
                        maxLength={80}
                      />
                    </div>
                    <fieldset className="tq-bk-group">
                      <legend className="tq-bk-label">{t.booking.language}</legend>
                      <div className="tq-pills">
                        {(["en", "es"] as Lang[]).map((l) => (
                          <label key={l} className="tq-pill" lang={l}>
                            <input
                              type="radio"
                              name="language"
                              value={l}
                              checked={language === l}
                              onChange={() => updateBooking({ prefLang: l })}
                            />
                            {t.booking.langs[l]}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <label className="tq-check">
                      <input
                        type="checkbox"
                        checked={b.share}
                        onChange={(e) => updateBooking({ share: e.target.checked })}
                      />
                      <span className="tq-check__box" aria-hidden>
                        {b.share ? "✓" : ""}
                      </span>
                      <span>{t.booking.share}</span>
                    </label>
                    <div className="tq-field">
                      <label htmlFor="tq-note" className="tq-bk-label">
                        {t.booking.note} <span className="tq-bk-opt">— {t.booking.optional}</span>
                      </label>
                      <textarea
                        id="tq-note"
                        className="tq-input"
                        rows={3}
                        maxLength={2000}
                        value={b.note}
                        placeholder={t.booking.notePlaceholder}
                        onChange={(e) => updateBooking({ note: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {step === LAST && (
                  <>
                    {/* Prices changed while the tab was open: said right above the new numbers. */}
                    {notice ? (
                      <p ref={noticeRef} className="tq-bk-notice" role="alert" tabIndex={-1}>
                        {notice}
                      </p>
                    ) : null}
                    <Summary onEdit={go} language={language} />
                    <div className="tq-bk-next">
                      <h4 className="tq-bk-label">{t.booking.nextTitle}</h4>
                      <ol>
                        {t.booking.nextSteps.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                      <p className="tq-bk-nocharge">{t.booking.noCharge}</p>
                    </div>
                    <ContactLine lang={lang} placement="booking-send" />

                    {SHOW_TURNSTILE && SITE_KEY ? (
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={SITE_KEY}
                        onSuccess={setToken}
                        onExpire={() => setToken("")}
                        onError={() => setToken("")}
                        options={{ theme: "light", language }}
                      />
                    ) : null}
                  </>
                )}

                {errors.form ? (
                  <p className="tq-error" role="alert">
                    {errors.form}
                  </p>
                ) : null}
              </motion.div>

              <div ref={navRef} className="tq-bk-nav" data-first={step === 0} data-last={step === LAST}>
                {step > 0 ? (
                  <button type="button" className="tq-btn tq-btn--ghost tq-btn--lg" onClick={() => go(step - 1)}>
                    <span aria-hidden>←</span> {t.booking.back}
                  </button>
                ) : null}
                <button type="submit" className="tq-btn tq-btn--lg tq-bk-nav__next" disabled={sending} aria-busy={sending}>
                  {nextLabel} {sending ? null : <span className="tq-arrow" aria-hidden>→</span>}
                </button>
              </div>
            </form>

            <Totals nextLabel={nextLabel} sending={sending} />
          </div>

          {/* Phones + tablets: total · deposit and Next, pinned to the bottom. */}
          <div
            ref={barRef}
            className="tq-bk-bar"
            data-show={showBar}
            aria-hidden={!showBar}
            inert={!showBar}
          >
            <span className="tq-bk-bar__sum tq-nums">
              <span className="tq-bk-bar__total">
                {t.booking.total}: {money(quote.totalUsd)}
              </span>
              <span className="tq-bk-bar__dep">
                {t.booking.depositShort}: {money(quote.retainerUsd)}
              </span>
            </span>
            <button type="submit" form="tq-bk-form" className="tq-btn tq-btn--lg" disabled={sending}>
              {nextLabel} {sending ? null : <span className="tq-arrow" aria-hidden>→</span>}
            </button>
          </div>
        </>
      )}

      {/* One quiet announcement of the total for screen readers. */}
      <p className="tq-sr" aria-live="polite">
        {done ? "" : `${t.booking.total}: ${money(quote.totalUsd)}`}
      </p>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Running total — side card on desktop                                */
/* ------------------------------------------------------------------ */

function Totals({ nextLabel, sending }: { nextLabel: string; sending: boolean }) {
  const { t, lang, tier, addOns, hours } = useSite();
  const { book } = usePriceBook();
  const q = useQuote();
  const shown = useTween(q.totalUsd);
  const x = tierById(tier);
  return (
    <aside className="tq-bk-side" aria-label={t.booking.total}>
      <p className="tq-bk-kicker">{t.booking.total}</p>
      <p className="tq-display tq-bk-side__total tq-nums" aria-hidden>
        {money(shown)}
      </p>
      <dl className="tq-bk-lines tq-nums">
        <div>
          <dt>{pick(lang, x.name)}</dt>
          <dd>{money(q.tierUsd)}</dd>
        </div>
        <div>
          <dt>{t.booking.hourOption(hours)}</dt>
          <dd>{hours > q.baseHours ? `+${money(q.extraHoursUsd)}` : t.booking.includedTag}</dd>
        </div>
        {ADD_ONS.filter((a) => addOns.includes(a.id)).map((a) => (
          <div key={a.id}>
            <dt>{pick(lang, a.name)}</dt>
            <dd>+{money(book.addOns[a.id])}</dd>
          </div>
        ))}
        <div className="tq-bk-lines__strong">
          <dt>
            {t.booking.deposit} <span className="tq-bk-lines__when">({t.booking.depositWhen})</span>
          </dt>
          <dd>{money(q.retainerUsd)}</dd>
        </div>
        <div>
          <dt>{t.booking.rest}</dt>
          <dd>{money(q.balanceUsd)}</dd>
        </div>
      </dl>
      <button type="submit" form="tq-bk-form" className="tq-btn tq-btn--lg tq-btn--block" disabled={sending}>
        {nextLabel} {sending ? null : <span className="tq-arrow" aria-hidden>→</span>}
      </button>
      <p className="tq-bk-fine">
        {t.booking.noCharge} {t.commissions.fine}
      </p>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — summary                                                    */
/* ------------------------------------------------------------------ */

function Summary({ onEdit, language }: { onEdit: (step: number) => void; language: Lang }) {
  const { t, lang, tier, addOns, crew, hours, booking: b } = useSite();
  const q = useQuote();
  const x = tierById(tier);
  const extras = ADD_ONS.filter((a) => addOns.includes(a.id));
  const city = CITIES.find((c) => c.id === b.city);
  const rows: { step: number; label: string; lines: string[] }[] = [
    { step: 0, label: t.booking.rowPackage, lines: [`${pick(lang, x.name)} — ${money(q.tierUsd)}`] },
    {
      step: 1,
      label: t.booking.steps[1],
      lines: [
        `${t.booking.hourOption(hours)}${hours > q.baseHours ? ` (+${money(q.extraHoursUsd)})` : ""}`,
        extras.length ? extras.map((a) => pick(lang, a.name)).join(", ") : t.booking.noExtras,
        `${BASE_CREW[tier] > 1 ? t.crew.mix(crew.photo, crew.motion) : t.crew.mix(1, 0)}${
          COORDINATOR_INCLUDED[tier] ? ` · ${t.crew.coordinator}` : ""
        }`,
      ],
    },
    {
      step: 2,
      label: t.booking.steps[2],
      lines: [
        b.date ? longDate(b.date, lang) : "—",
        [city ? pick(lang, city.label) : "", b.venue.trim(), timeLabel(b.startTime, lang)].filter(Boolean).join(" · "),
      ].filter(Boolean),
    },
    {
      step: 3,
      label: t.booking.rowYou,
      lines: [
        b.name.trim(),
        b.email.trim(),
        b.phone.trim(),
        b.honoree.trim() ? `${t.booking.honoree}: ${b.honoree.trim()}` : "",
        t.booking.langs[language],
      ].filter(Boolean),
    },
  ];
  return (
    <div className="tq-bk-summary">
      <h4 className="tq-sr">{t.booking.summary}</h4>
      <dl>
        {rows.map((r) => (
          <div key={r.step} className="tq-bk-summary__row">
            <dt className="tq-bk-label">{r.label}</dt>
            <dd>
              {r.lines.map((l) => (
                <span key={l} className="tq-bk-summary__line">
                  {l}
                </span>
              ))}
            </dd>
            <button type="button" className="tq-bk-edit" onClick={() => onEdit(r.step)}>
              {t.booking.edit}
              <span className="tq-sr">: {r.label}</span>
            </button>
          </div>
        ))}
      </dl>
      <dl className="tq-bk-due tq-nums">
        <div className="tq-bk-due__total">
          <dt>{t.booking.total}</dt>
          <dd>{money(q.totalUsd)}</dd>
        </div>
        <div>
          <dt>
            {t.booking.deposit} ({t.booking.depositWhen})
          </dt>
          <dd>{money(q.retainerUsd)}</dd>
        </div>
        <div>
          <dt>{t.booking.rest}</dt>
          <dd>{money(q.balanceUsd)}</dd>
        </div>
      </dl>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Success                                                             */
/* ------------------------------------------------------------------ */

function Success({
  done,
  onAgain,
  headingRef,
}: {
  done: Done;
  onAgain: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const { t, lang } = useSite();
  return (
    <motion.div
      className="tq-bk-done"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <h3 ref={headingRef} tabIndex={-1} className="tq-display tq-bk-done__title">
        {t.booking.doneTitle}
      </h3>
      <p className="tq-bk-done__held">{t.booking.doneHeld}</p>
      <p>{t.booking.doneBody(longDate(done.date, lang), done.email)}</p>
      <div className="tq-bk-next">
        <h4 className="tq-bk-label">{t.booking.nextTitle}</h4>
        <ol>
          {t.booking.nextSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>
      <ContactLine lang={lang} placement="booking-done" />
      <div>
        <button type="button" className="tq-btn tq-btn--ghost tq-btn--lg" onClick={onAgain}>
          {t.booking.again}
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Fields                                                              */
/* ------------------------------------------------------------------ */

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
      <label htmlFor={id} className="tq-bk-label">
        {label}
        {optional ? <span className="tq-bk-opt"> — {optional}</span> : null}
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
      {hint ? (
        <p id={`${id}-hint`} className="tq-bk-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="tq-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar — today and the past can't be booked online                */
/* ------------------------------------------------------------------ */

function Calendar({
  value,
  anchor,
  onChange,
  error,
}: {
  value: string | null;
  anchor?: string | null;
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
    const start = value ?? anchor;
    const d = start ? fromIso(start) : today;
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const monthsAhead = (view.y - today.getFullYear()) * 12 + (view.m - today.getMonth());
  const shift = (d: number) =>
    setView(({ y, m }) => {
      const n = new Date(y, m + d, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });

  const loc = localeOf(lang);
  const monthLabel = new Intl.DateTimeFormat(loc, { month: "long", year: "numeric" }).format(new Date(view.y, view.m, 1));
  // 2023-01-01 was a Sunday.
  const dows = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(loc, { weekday: "short" }).format(new Date(2023, 0, 1 + i)).replace(".", ""),
  );
  const lead = new Date(view.y, view.m, 1).getDay();
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const dayFmt = new Intl.DateTimeFormat(loc, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div
      className="tq-field tq-cal"
      role="group"
      aria-labelledby="tq-cal-label"
      tabIndex={error ? -1 : undefined}
      data-invalid={error ? true : undefined}
    >
      <span id="tq-cal-label" className="tq-bk-label">
        {t.booking.date}
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
              aria-label={t.booking.prevMonth}
            >
              ←
            </button>
            <button
              type="button"
              className="tq-icon-btn"
              onClick={() => shift(1)}
              disabled={monthsAhead >= MAX_MONTHS_AHEAD}
              aria-label={t.booking.nextMonth}
            >
              →
            </button>
          </span>
        </div>
        <div className="tq-cal__grid">
          {dows.map((d) => (
            <span key={d} className="tq-cal__dow" aria-hidden>
              {d}
            </span>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <span key={`b${i}`} aria-hidden />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = new Date(view.y, view.m, i + 1);
            const iso = isoDate(d);
            // Today can't be booked online (the server only accepts future dates).
            const past = d <= today;
            const isTaken = taken.has(iso);
            return (
              <button
                key={iso}
                type="button"
                className="tq-day tq-nums"
                disabled={past || isTaken}
                aria-pressed={value === iso}
                aria-label={`${dayFmt.format(d)}${isTaken ? ` — ${t.booking.legendTaken}` : ""}`}
                data-past={past}
                data-taken={isTaken}
                data-sat={d.getDay() === 6}
                onClick={() => onChange(iso)}
              >
                <span>{i + 1}</span>
              </button>
            );
          })}
        </div>
        <div className="tq-cal__legend" aria-hidden>
          <span>
            <i className="tq-cal__key" /> {t.booking.legendOpen}
          </span>
          <span>
            <i className="tq-cal__key tq-cal__key--taken" /> {t.booking.legendTaken}
          </span>
          <span>
            <i className="tq-cal__key tq-cal__key--picked" /> {t.booking.legendPicked}
          </span>
        </div>
      </div>
      <p className="tq-picked" aria-live="polite">
        {value ? (
          <>
            <span className="tq-dot" aria-hidden />
            <span>
              <strong>{t.booking.pickedPrefix}</strong> {longDate(value, lang)}
            </span>
          </>
        ) : (
          <span>{t.booking.noDate}</span>
        )}
      </p>
      {error ? (
        <p className="tq-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
