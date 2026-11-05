"use client";

import { useId, useMemo, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { usePriceBook } from "@/components/PriceBookProvider";
import { useSite, handoffToBooking } from "@/components/txq/state";
import { tierById } from "@/components/txq/data";
import { getFirstTouch, trackEvent } from "@/components/Tracker";
import { HONEYPOT_FIELD } from "@/lib/inquiry";
import { BUDGET_FOR_TIER, servicesForTier } from "@/lib/inquiry-package";
import { coverageForBudget, smallestCoverage, EVENT_TIERS, type CoverageOption, type EventTier } from "@/lib/budget-options";
import { hourSteps, momentsDateAllowed, usd, type AddOnId } from "@/lib/commission";
import { todayInDallas } from "@/lib/plan";
import { BUDGET_COPY } from "./budget-copy";
import { detailsFor, goodToKnow } from "./budget-details";
import { DetailIcon } from "./DetailIcon";
import { ShareBar } from "./ShareBar";
import "./budget.css";
import { TrustLine } from "@/components/TrustLine";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Turnstile is locked to production hostnames; local dev skips it (as Intake does).
const SHOW_TURNSTILE = Boolean(SITE_KEY) && process.env.NODE_ENV === "production";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "1500", "$1,500", "1.5k" → 1500 (whole dollars), else null. */
function parseUsd(v: string): number | null {
  const s = v.trim().toLowerCase().replace(/[$,\s]/g, "");
  if (!s) return null;
  const k = s.endsWith("k");
  const n = Number(k ? s.slice(0, -1) : s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(k ? n * 1000 : n);
}

export function BudgetPlanner() {
  const { lang, homeHref } = useSite();
  const { book, quote, maxHours } = usePriceBook();
  const c = BUDGET_COPY[lang];
  const uid = useId();

  const [budgetText, setBudgetText] = useState("");
  const [wantVideo, setWantVideo] = useState(false);
  const budget = parseUsd(budgetText);
  const result = useMemo(() => (budget ? coverageForBudget(book, budget, wantVideo) : null), [book, budget, wantVideo]);
  const smallest = useMemo(() => smallestCoverage(book, wantVideo), [book, wantVideo]);

  const nameOf = (tier: EventTier) => tierById(tier).name[lang];
  const label = (o: CoverageOption) => `${c.hours(o.hours)}${o.addOns.includes("momentsfilm") ? `, ${c.withFilm}` : ""}`;

  const choose = (o: CoverageOption) => {
    trackEvent("budget_choose", o.tier);
    handoffToBooking({ tier: o.tier, hours: o.hours, addOns: o.addOns });
    // The choice travels as this tab's booking draft; the link only has to land
    // on the panel, which the browser and the router both scroll to.
    window.location.assign(homeHref("#intake"));
  };

  /* ---------- offer ---------- */
  const [offerTier, setOfferTier] = useState<EventTier>("moments");
  const [offerHours, setOfferHours] = useState<number>(book.packages.moments.hours);
  const [offerFilm, setOfferFilm] = useState(false);
  const [offerText, setOfferText] = useState("");
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [errors, setErrors] = useState<Partial<Record<"amount" | "date" | "name" | "email" | "form", string>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const offerAddOns: AddOnId[] = offerTier === "moments" && offerFilm ? ["momentsfilm"] : [];
  const hoursForOffer = Math.min(Math.max(offerHours, book.packages[offerTier].hours), maxHours(offerTier));
  const ourPrice = quote(offerTier, offerAddOns, hoursForOffer).totalUsd;
  const today = todayInDallas();
  const satBlocked = Boolean(date) && !momentsDateAllowed(book, offerTier, date, today);

  const pickOfferTier = (t: EventTier) => {
    setOfferTier(t);
    setOfferHours(book.packages[t].hours);
    if (t !== "moments") setOfferFilm(false);
  };

  const startOffer = () => {
    const best = result?.fits[0] ?? smallest;
    if (best) {
      setOfferTier(best.tier);
      setOfferHours(best.hours);
      setOfferFilm(best.addOns.includes("momentsfilm"));
    }
    if (budget && !offerText) setOfferText(String(budget));
    document.getElementById(`${uid}-offer`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const amount = parseUsd(offerText);
    const e: typeof errors = {};
    if (!amount || amount < 50) e.amount = c.errors.amount;
    if (!date || date <= today) e.date = c.errors.date;
    else if (satBlocked) e.date = c.errors.saturday(book.momentsSaturdayDays);
    if (name.trim().length < 2) e.name = c.errors.name;
    if (!EMAIL.test(email.trim())) e.email = c.errors.email;
    if (!Object.keys(e).length && SHOW_TURNSTILE && !token) e.form = c.errors.verify;
    setErrors(e);
    if (Object.keys(e).length) return;
    setSending(true);
    let ok = false;
    try {
      const fd = new FormData(ev.currentTarget);
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          event_date: date,
          venue: "",
          services: servicesForTier(offerTier, offerAddOns),
          budget_range: BUDGET_FOR_TIER[offerTier],
          message: "",
          package: {
            city: "dfw",
            venue: "",
            start_time: "",
            scope: "both",
            tier: offerTier,
            add_ons: offerAddOns,
            hours: hoursForOffer,
            honoree: "",
            language: lang,
            share_permission: true,
            offer_usd: amount,
          },
          [HONEYPOT_FIELD]: String(fd.get(HONEYPOT_FIELD) ?? ""),
          "cf-turnstile-response": token,
          attribution: getFirstTouch(),
        }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        setErrors({ form: j.error || c.errors.failed });
        return;
      }
      ok = true;
      trackEvent("budget_offer", offerTier);
      setSent(true);
    } catch {
      setErrors({ form: c.errors.failed });
    } finally {
      setSending(false);
      if (!ok && SHOW_TURNSTILE) setToken("");
    }
  };

  return (
    <div className="bp">
      <header className="bp-head">
        <p className="bp-eyebrow">{c.eyebrow}</p>
        <h1 className="bp-title">{c.title}</h1>
        <p className="bp-dek">{c.dek}</p>
        <TrustLine lang={lang} />
        <a className="bp-sharelink" href="#share-bottom">
          {c.shareTop} <span aria-hidden>↓</span>
        </a>
      </header>

      <section className="bp-panel" aria-labelledby={`${uid}-in`}>
        <h2 id={`${uid}-in`} className="bp-sr">{c.budgetLabel}</h2>
        <label className="bp-label bp-label--first" htmlFor={`${uid}-budget`}>
          {c.budgetLabel}
        </label>
        <div className="bp-money">
          <span aria-hidden>$</span>
          <input
            id={`${uid}-budget`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="1,000"
            value={budgetText}
            onChange={(e) => setBudgetText(e.target.value)}
            aria-describedby={`${uid}-budget-hint`}
          />
        </div>
        <p id={`${uid}-budget-hint`} className="bp-hint">
          {c.budgetHint}
        </p>

        <p className="bp-label" id={`${uid}-want`}>
          {c.wantLabel}
        </p>
        <div className="bp-seg" role="radiogroup" aria-labelledby={`${uid}-want`}>
          {[
            [false, c.photos],
            [true, c.photosVideo],
          ].map(([v, l]) => (
            <button key={String(v)} type="button" role="radio" aria-checked={wantVideo === v} onClick={() => setWantVideo(v as boolean)}>
              {l as string}
            </button>
          ))}
        </div>
      </section>

      <section className="bp-results" aria-live="polite" aria-labelledby={`${uid}-res`}>
        <h2 id={`${uid}-res`} className="bp-h2">
          {budget ? c.resultsTitle(usd(budget)) : c.resultsEmpty}
        </h2>
        {result && result.fits.length === 0 && smallest ? (
          <p className="bp-note">{c.nothingFits(`${c.hours(smallest.hours)}, ${usd(smallest.totalUsd)}`)}</p>
        ) : null}
        {result ? (
          <ul className="bp-cards">
            {result.fits.map((o) => {
              const t = tierById(o.tier);
              return (
                <li key={`${o.tier}-${o.hours}-${o.addOns.join()}`} className="bp-card">
                  <div className="bp-card__top">
                    <h3 className="bp-card__name">{t.name[lang]}</h3>
                    <p className="bp-card__price">{usd(o.totalUsd)}</p>
                  </div>
                  <p className="bp-card__meta">
                    {label(o)} · {o.video ? c.includesVideo : c.photosOnly}
                  </p>
                  <WhatYouGet option={o} />
                  {o.tier === "moments" ? <p className="bp-hint bp-hint--note">{c.satNote(book.momentsSaturdayDays)}</p> : null}
                  <button type="button" className="bp-btn" onClick={() => choose(o)} aria-label={c.chooseAria(t.name[lang])}>
                    {c.choose} <span aria-hidden>→</span>
                  </button>
                </li>
              );
            })}
            {result.stretch ? (
              <li className="bp-card bp-card--stretch">
                <p className="bp-card__kicker">{c.stretch(usd(result.stretch.totalUsd - (budget ?? 0)))}</p>
                <div className="bp-card__top">
                  <h3 className="bp-card__name">{nameOf(result.stretch.tier)}</h3>
                  <p className="bp-card__price">{usd(result.stretch.totalUsd)}</p>
                </div>
                <p className="bp-card__meta">
                  {label(result.stretch)} · {result.stretch.video ? c.includesVideo : c.photosOnly}
                </p>
                <WhatYouGet option={result.stretch} />
                <button type="button" className="bp-btn bp-btn--line" onClick={() => choose(result.stretch!)}>
                  {c.choose} <span aria-hidden>→</span>
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}
        {budget ? (
          <button type="button" className="bp-link" onClick={startOffer}>
            {c.offerTitle}
          </button>
        ) : null}
      </section>

      <section className="bp-know" aria-labelledby={`${uid}-know`}>
        <h2 id={`${uid}-know`} className="bp-h2">{c.knowTitle}</h2>
        <ul className="bp-lines">
          {goodToKnow(lang, book).map((l) => (
            <li key={l.label} className="bp-line">
              <DetailIcon name={l.icon} />
              <div>
                <p className="bp-line__label">{l.label}</p>
                <p className="bp-line__text">{l.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id={`${uid}-offer`} className="bp-panel bp-offer" aria-labelledby={`${uid}-offer-t`}>
        <h2 id={`${uid}-offer-t`} className="bp-h2">
          {c.offerTitle}
        </h2>
        <p className="bp-dek bp-dek--sm">{c.offerDek}</p>
        {sent ? (
          <div className="bp-sent" role="status">
            <p className="bp-card__name">{c.sentTitle}</p>
            <p>{c.sentBody}</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" className="bp-hp" aria-hidden />

            <label className="bp-label bp-label--first" htmlFor={`${uid}-amt`}>{c.offerAmount}</label>
            <div className="bp-money" data-invalid={errors.amount ? true : undefined}>
              <span aria-hidden>$</span>
              <input id={`${uid}-amt`} inputMode="numeric" value={offerText} onChange={(e) => setOfferText(e.target.value)} aria-invalid={Boolean(errors.amount)} />
            </div>
            {errors.amount ? <p className="bp-err">{errors.amount}</p> : null}

            <p className="bp-label" id={`${uid}-cov`}>{c.offerCoverage}</p>
            <div className="bp-seg bp-seg--wrap" role="radiogroup" aria-labelledby={`${uid}-cov`}>
              {EVENT_TIERS.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={offerTier === t} onClick={() => pickOfferTier(t)}>
                  {nameOf(t)}
                </button>
              ))}
            </div>

            <div className="bp-row">
              <label className="bp-label" htmlFor={`${uid}-hrs`}>{c.offerHours}</label>
              <select id={`${uid}-hrs`} className="bp-input" value={hoursForOffer} onChange={(e) => setOfferHours(Number(e.target.value))}>
                {hourSteps(book, offerTier).map((h) => (
                  <option key={h} value={h}>{c.hours(h)}</option>
                ))}
              </select>
            </div>
            {offerTier === "moments" ? (
              <label className="bp-check">
                <input type="checkbox" checked={offerFilm} onChange={(e) => setOfferFilm(e.target.checked)} />
                <span>{c.offerFilm} (+{usd(book.addOns.momentsfilm)})</span>
              </label>
            ) : null}
            <p className="bp-hint">{c.offerOurPrice(usd(ourPrice))}</p>

            <label className="bp-label" htmlFor={`${uid}-date`}>{c.date}</label>
            <input id={`${uid}-date`} type="date" className="bp-input" min={today} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={Boolean(errors.date)} />
            {errors.date ? <p className="bp-err">{errors.date}</p> : satBlocked ? <p className="bp-err">{c.errors.saturday(book.momentsSaturdayDays)}</p> : null}

            <label className="bp-label" htmlFor={`${uid}-name`}>{c.name}</label>
            <input id={`${uid}-name`} className="bp-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} />
            {errors.name ? <p className="bp-err">{errors.name}</p> : null}

            <label className="bp-label" htmlFor={`${uid}-email`}>{c.email}</label>
            <input id={`${uid}-email`} type="email" className="bp-input" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)} />
            {errors.email ? <p className="bp-err">{errors.email}</p> : null}

            <label className="bp-label" htmlFor={`${uid}-phone`}>{c.phone}</label>
            <input id={`${uid}-phone`} type="tel" className="bp-input" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

            {SHOW_TURNSTILE && SITE_KEY ? (
              <div className="bp-ts">
                <Turnstile siteKey={SITE_KEY} onSuccess={setToken} onExpire={() => setToken("")} onError={() => setToken("")} options={{ theme: "light", language: lang }} />
              </div>
            ) : null}
            {errors.form ? <p className="bp-err" role="alert">{errors.form}</p> : null}

            <button type="submit" className="bp-btn bp-btn--lg" disabled={sending} aria-busy={sending}>
              {sending ? c.sending : c.send} <span aria-hidden>→</span>
            </button>
            <TrustLine lang={lang} />
          </form>
        )}
      </section>

      <ShareBar placement="bottom" />

      <p className="bp-fine">
        {c.fine} <a href={homeHref("#commissions")}>{c.seePackages}</a>
      </p>
    </div>
  );
}

/** Exactly what an option includes, one icon line each, then what isn't included. */
function WhatYouGet({ option }: { option: CoverageOption }) {
  const { lang } = useSite();
  const { book } = usePriceBook();
  const c = BUDGET_COPY[lang];
  const d = detailsFor(option.tier, option.hours, option.addOns, lang, book);
  return (
    <div className="bp-get">
      <p className="bp-get__h">{c.youGet}</p>
      <ul className="bp-lines">
        {d.included.map((l) => (
          <li key={l.label} className="bp-line">
            <DetailIcon name={l.icon} />
            <div>
              <p className="bp-line__label">{l.label}</p>
              <p className="bp-line__text">{l.text}</p>
            </div>
          </li>
        ))}
      </ul>
      {d.notIncluded.length ? (
        <>
          <p className="bp-get__h bp-get__h--no">{c.notIncluded}</p>
          <ul className="bp-nots">
            {d.notIncluded.map((n) => (
              <li key={n}>
                <DetailIcon name="no" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
