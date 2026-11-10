"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { usePriceBook } from "@/components/PriceBookProvider";
import { useSite, handoffToBooking } from "@/components/txq/state";
import { useShell } from "@/components/txq/SiteShell";
import { tierNameL } from "@/components/txq/data";
import { getFirstTouch, trackEvent } from "@/components/Tracker";
import { HONEYPOT_FIELD } from "@/lib/inquiry";
import { BUDGET_FOR_TIER, servicesForTier } from "@/lib/inquiry-package";
import { coverageForBudget, smallestCoverage, EVENT_TIERS, type CoverageOption, type EventTier } from "@/lib/budget-options";
import { hourSteps, momentsDateAllowed, usd, type AddOnId } from "@/lib/commission";
import { todayInDallas } from "@/lib/plan";
import { BUDGET_COPY } from "./budget-copy";
import { detailsFor, goodToKnow, type Details } from "./budget-details";
import { BUDGET_PHOTOS, budgetPhotoSrc } from "./budget-photos";
import { DetailIcon } from "./DetailIcon";
import { ShareBar } from "./ShareBar";
import "./budget.css";
import { TrustLine } from "@/components/TrustLine";
import { WhatsAppChatButton } from "@/components/WhatsAppChatButton";

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

const noSubscribe = () => () => {};

/** Digits get thousands separators as she types ("1500" → "1,500"); "1.5k" is left as typed. */
function fmtTyping(raw: string): string {
  const t = raw.replace(/[$\s]/g, "");
  if (!/^[\d,]*$/.test(t)) return raw.slice(0, 10);
  const digits = t.replace(/,/g, "").replace(/^0+/, "").slice(0, 6);
  return digits ? Number(digits).toLocaleString("en-US") : "";
}

export function BudgetPlanner() {
  const { lang, homeHref } = useSite();
  const { book, quote, maxHours } = usePriceBook();
  const c = BUDGET_COPY[lang];
  const uid = useId();

  // A shared link carries her number: /budget?b=1500&v=1 opens on the same answer.
  // The link is the starting value; whatever she types or taps after that wins.
  const urlQuery = useSyncExternalStore(noSubscribe, () => window.location.search, () => "");
  const fromUrl = useMemo(() => {
    const q = new URLSearchParams(urlQuery);
    const b = parseUsd(q.get("b") ?? "");
    return { text: b ? fmtTyping(String(Math.min(b, 999999))) : "", video: q.get("v") === "1" };
  }, [urlQuery]);
  const [typedBudget, setBudgetText] = useState<string | null>(null);
  const [pickedVideo, setWantVideo] = useState<boolean | null>(null);
  const budgetText = typedBudget ?? fromUrl.text;
  const wantVideo = pickedVideo ?? fromUrl.video;
  const budget = parseUsd(budgetText);
  const result = useMemo(() => (budget ? coverageForBudget(book, budget, wantVideo) : null), [book, budget, wantVideo]);
  const smallest = useMemo(() => smallestCoverage(book, wantVideo), [book, wantVideo]);

  const nameOf = (tier: EventTier) => tierNameL(book, tier)[lang];
  /** Each package at its included hours: the real starting prices (chips and the empty state). */
  const starts = useMemo(
    () => EVENT_TIERS.map((tier) => ({ tier, hours: book.packages[tier].hours, usd: quote(tier, [], book.packages[tier].hours).totalUsd, video: tier !== "moments" })),
    [book, quote],
  );

  const shareQuery = budget ? `?b=${budget}${wantVideo ? "&v=1" : ""}` : "";
  const touched = typedBudget !== null || pickedVideo !== null;
  useEffect(() => {
    if (!touched) return;
    const id = window.setTimeout(() => window.history.replaceState(window.history.state, "", `${window.location.pathname}${shareQuery}${window.location.hash}`), 400);
    return () => window.clearTimeout(id);
  }, [touched, shareQuery]);

  // The page has its own money action, so the site-wide "Reserve your date" dock
  // steps aside; ours names the closest package once the budget field and its button scroll away.
  const { setDockHidden } = useShell();
  useEffect(() => {
    setDockHidden(true);
    return () => setDockHidden(false);
  }, [setDockHidden]);
  const bestBtn = useRef<HTMLButtonElement>(null);
  const offerRef = useRef<HTMLElement>(null);
  const toolRef = useRef<HTMLElement>(null);
  const [dockOn, setDockOn] = useState(false);
  const bestKey = result?.fits[0] ? `${result.fits[0].tier}-${result.fits[0].hours}` : "";
  useEffect(() => {
    const btn = bestBtn.current;
    const offer = offerRef.current;
    const tool = toolRef.current;
    if (!btn || !offer || !tool) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      // Never over the budget field and its controls, the card's own button, or the offer form.
      setDockOn(!seen.get(btn) && !seen.get(offer) && !seen.get(tool));
    });
    io.observe(tool);
    io.observe(btn);
    io.observe(offer);
    return () => {
      io.disconnect();
      setDockOn(false);
    };
  }, [bestKey]);

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
  const [offerOpen, setOfferOpen] = useState(false);

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

  const startOffer = (scroll = false) => {
    const best = result?.fits[0] ?? smallest;
    if (best) {
      setOfferTier(best.tier);
      setOfferHours(best.hours);
      setOfferFilm(best.addOns.includes("momentsfilm"));
    }
    if (budget && !offerText) setOfferText(fmtTyping(String(budget)));
    setOfferOpen(true);
    if (scroll) requestAnimationFrame(() => offerRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }));
  };

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const amount = parseUsd(offerText);
    const e: typeof errors = {};
    if (!amount || amount < 50) e.amount = c.errors.amount;
    if (!date || date <= today) e.date = c.errors.date;
    else if (satBlocked) e.date = c.errors.saturday(book.momentsSaturdayDays, nameOf("moments"));
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

  const best = result?.fits[0] ?? null;
  const others = result?.fits.slice(1) ?? [];
  const pick = (usdAmount: number) => {
    trackEvent("budget_chip", String(usdAmount));
    setBudgetText(fmtTyping(String(usdAmount)));
  };

  return (
    <div className="bp">
      <header className="bp-head">
        <h1 className="bp-title">{c.title}</h1>
        <p className="bp-dek">{c.dek}</p>
      </header>

      <div className="bp-grid">
        <section ref={toolRef} className="bp-tool" aria-labelledby={`${uid}-in`}>
          <h2 id={`${uid}-in`} className="bp-sr">{c.budgetLabel}</h2>
          <label className="bp-label bp-label--first" htmlFor={`${uid}-budget`}>
            {c.budgetLabel}
          </label>
          <MoneyInput id={`${uid}-budget`} value={budgetText} onChange={setBudgetText} placeholder={usd(starts[1]?.usd ?? starts[0].usd).replace("$", "")} describedBy={`${uid}-budget-hint`} />
          <p id={`${uid}-budget-hint`} className="bp-hint">
            {c.budgetHint}
          </p>

          <p className="bp-label" id={`${uid}-starts`}>
            {c.startsAt}
          </p>
          <ul className="bp-chips" aria-labelledby={`${uid}-starts`}>
            {starts.map((s) => (
              <li key={s.tier}>
                <button type="button" aria-pressed={budget === s.usd} aria-label={`${usd(s.usd)}, ${nameOf(s.tier)}`} onClick={() => pick(s.usd)}>
                  {usd(s.usd)}
                </button>
              </li>
            ))}
          </ul>

          <p className="bp-label" id={`${uid}-want`}>
            {c.wantLabel}
          </p>
          <div className="bp-seg" role="radiogroup" aria-labelledby={`${uid}-want`}>
            {(
              [
                [false, c.photos],
                [true, c.photosVideo],
              ] as const
            ).map(([v, l]) => (
              <button key={String(v)} type="button" role="radio" aria-checked={wantVideo === v} onClick={() => setWantVideo(v)}>
                {l}
              </button>
            ))}
          </div>
        </section>

        <section className="bp-results" aria-live="polite" aria-labelledby={`${uid}-res`}>
          <h2 id={`${uid}-res`} className="bp-h2">
            {budget ? c.resultsTitle(usd(budget)) : c.resultsEmpty}
          </h2>

          {!budget ? (
            <ul className="bp-ladder">
              {starts.map((s) => (
                <li key={s.tier}>
                  <button type="button" className="bp-rung" onClick={() => pick(s.usd)}>
                    <Photo tier={s.tier} size="thumb" />
                    <span className="bp-rung__text">
                      <span className="bp-card__name">{nameOf(s.tier)}</span>
                      <span className="bp-card__meta">
                        {c.hours(s.hours)} · {s.video ? c.includesVideo : c.photosOnly}
                      </span>
                    </span>
                    <span className="bp-rung__price">{c.from(usd(s.usd))}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          {result && !best && smallest ? (
            <p className="bp-note">{c.nothingFits(`${c.hours(smallest.hours)}, ${usd(smallest.totalUsd)}`)}</p>
          ) : null}

          {result && budget ? (
            <ul className="bp-cards">
              {best ? (
                <li key={keyOf(best)} className="bp-card bp-card--best">
                  <div className="bp-card__photo">
                    <Photo tier={best.tier} size="wide" />
                    <p className="bp-tag">{c.closest}</p>
                  </div>
                  <div className="bp-card__body">
                    <CardText option={best} budget={budget} />
                    <button ref={bestBtn} type="button" className="bp-btn" onClick={() => choose(best)} aria-label={c.chooseAria(nameOf(best.tier))}>
                      {c.choose} <span aria-hidden>→</span>
                    </button>
                  </div>
                </li>
              ) : null}
              {others.map((o) => (
                <li key={keyOf(o)} className="bp-card">
                  <div className="bp-card__row">
                    <Photo tier={o.tier} size="thumb" />
                    <div className="bp-card__body">
                      <CardText option={o} budget={budget} />
                    </div>
                  </div>
                  <button type="button" className="bp-btn bp-btn--line" onClick={() => choose(o)} aria-label={c.chooseAria(nameOf(o.tier))}>
                    {c.choose} <span aria-hidden>→</span>
                  </button>
                </li>
              ))}
              {result.stretch ? (
                <li key={`over-${keyOf(result.stretch)}`} className="bp-card bp-card--over">
                  <div className="bp-card__row">
                    <Photo tier={result.stretch.tier} size="thumb" />
                    <div className="bp-card__body">
                      <CardText option={result.stretch} budget={budget} />
                    </div>
                  </div>
                  <button type="button" className="bp-btn bp-btn--line" onClick={() => choose(result.stretch!)} aria-label={c.chooseAria(nameOf(result.stretch.tier))}>
                    {c.choose} <span aria-hidden>→</span>
                  </button>
                </li>
              ) : null}
            </ul>
          ) : null}
          {budget ? (
            <button type="button" className="bp-link" onClick={() => startOffer(true)}>
              {c.offerTitle}
            </button>
          ) : null}
        </section>
      </div>

      <section className="bp-know" aria-labelledby={`${uid}-know`}>
        <h2 id={`${uid}-know`} className="bp-h2">{c.knowTitle}</h2>
        <ul className="bp-lines bp-lines--know">
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

      <section ref={offerRef} id={`${uid}-offer`} className="bp-offer" data-open={offerOpen || undefined} aria-labelledby={`${uid}-offer-t`}>
        <h2 id={`${uid}-offer-t`} className="bp-offer__h">
          <button type="button" className="bp-offer__toggle" aria-expanded={offerOpen} aria-controls={`${uid}-offer-body`} onClick={() => (offerOpen ? setOfferOpen(false) : startOffer())}>
            <span>{c.offerTitle}</span>
            <svg className="bp-offer__chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </h2>
        <div id={`${uid}-offer-body`} className="bp-offer__body" hidden={!offerOpen}>
          <p className="bp-dek bp-dek--sm">{c.offerDek}</p>
          {sent ? (
            <div className="bp-sent" role="status">
              <p className="bp-card__name">{c.sentTitle}</p>
              <p>{c.sentBody}</p>
            </div>
          ) : offerOpen ? (
            <form onSubmit={submit} noValidate>
              <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" className="bp-hp" aria-hidden />

              <div className="bp-fields">
                <div>
                  <label className="bp-label bp-label--first" htmlFor={`${uid}-amt`}>{c.offerAmount}</label>
                  <MoneyInput id={`${uid}-amt`} value={offerText} onChange={setOfferText} invalid={Boolean(errors.amount)} describedBy={errors.amount ? `${uid}-amt-err` : undefined} />
                  {errors.amount ? <p id={`${uid}-amt-err`} className="bp-err">{errors.amount}</p> : null}
                </div>

                <div>
                  <p className="bp-label bp-label--first" id={`${uid}-cov`}>{c.offerCoverage}</p>
                  <div className="bp-seg bp-seg--wrap" role="radiogroup" aria-labelledby={`${uid}-cov`}>
                    {EVENT_TIERS.map((t) => (
                      <button key={t} type="button" role="radio" aria-checked={offerTier === t} onClick={() => pickOfferTier(t)}>
                        {nameOf(t)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="bp-label bp-label--first" htmlFor={`${uid}-hrs`}>{c.offerHours}</label>
                  <select id={`${uid}-hrs`} className="bp-input" value={hoursForOffer} onChange={(e) => setOfferHours(Number(e.target.value))}>
                    {hourSteps(book, offerTier).map((h) => (
                      <option key={h} value={h}>{c.hours(h)}</option>
                    ))}
                  </select>
                  {offerTier === "moments" ? (
                    <label className="bp-check">
                      <input type="checkbox" checked={offerFilm} onChange={(e) => setOfferFilm(e.target.checked)} />
                      <span>{c.offerFilm} (+{usd(book.addOns.momentsfilm)})</span>
                    </label>
                  ) : null}
                  <p className="bp-hint">{c.offerOurPrice(usd(ourPrice))}</p>
                </div>

                <div>
                  <label className="bp-label bp-label--first" htmlFor={`${uid}-date`}>{c.date}</label>
                  <input id={`${uid}-date`} type="date" className="bp-input" min={today} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date || satBlocked ? `${uid}-date-err` : undefined} />
                  {errors.date ? <p id={`${uid}-date-err`} className="bp-err">{errors.date}</p> : satBlocked ? <p id={`${uid}-date-err`} className="bp-err">{c.errors.saturday(book.momentsSaturdayDays, nameOf("moments"))}</p> : null}
                </div>

                <div>
                  <label className="bp-label bp-label--first" htmlFor={`${uid}-name`}>{c.name}</label>
                  <input id={`${uid}-name`} className="bp-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
                  {errors.name ? <p id={`${uid}-name-err`} className="bp-err">{errors.name}</p> : null}
                </div>

                <div>
                  <label className="bp-label bp-label--first" htmlFor={`${uid}-email`}>{c.email}</label>
                  <input id={`${uid}-email`} type="email" className="bp-input" autoComplete="email" spellCheck={false} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${uid}-email-err` : undefined} />
                  {errors.email ? <p id={`${uid}-email-err`} className="bp-err">{errors.email}</p> : null}
                </div>

                <div>
                  <label className="bp-label bp-label--first" htmlFor={`${uid}-phone`}>{c.phone}</label>
                  <input id={`${uid}-phone`} type="tel" className="bp-input" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              {SHOW_TURNSTILE && SITE_KEY ? (
                <div className="bp-ts">
                  <Turnstile siteKey={SITE_KEY} onSuccess={setToken} onExpire={() => setToken("")} onError={() => setToken("")} options={{ theme: "light", language: lang }} />
                </div>
              ) : null}
              {errors.form ? <p className="bp-err" role="alert">{errors.form}</p> : null}

              <button type="submit" className="bp-btn bp-btn--lg" disabled={sending} aria-busy={sending}>
                {sending ? c.sending : c.send} <span aria-hidden>→</span>
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <div className="bp-help">
        <TrustLine lang={lang} />
        <WhatsAppChatButton lang={lang} placement="budget-top" />
      </div>

      <ShareBar placement="bottom" query={shareQuery} />

      <p className="bp-fine">
        {c.fine} <a href={homeHref("#commissions")}>{c.seePackages}</a>
      </p>

      {best ? (
        <div className="bp-dock" data-hidden={!dockOn} aria-hidden={!dockOn || undefined}>
          <p className="bp-dock__text">
            <span className="bp-dock__name">{nameOf(best.tier)}</span>
            <span className="bp-dock__meta">
              {usd(best.totalUsd)} · {c.hours(best.hours)}
            </span>
          </p>
          <button type="button" className="bp-btn" tabIndex={dockOn ? undefined : -1} onClick={() => choose(best)} aria-label={c.chooseAria(nameOf(best.tier))}>
            {c.choose} <span aria-hidden>→</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

const keyOf = (o: CoverageOption) => `${o.tier}-${o.hours}-${o.addOns.join()}`;

/** A budget field that shows thousands separators as she types and keeps the caret where it was. */
function MoneyInput({ id, value, onChange, placeholder, invalid, describedBy }: { id: string; value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean; describedBy?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const caretDigits = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || caretDigits.current === null || document.activeElement !== el) return;
    let pos = 0;
    for (let seen = 0; pos < value.length && seen < caretDigits.current; pos += 1) if (/\d/.test(value[pos])) seen += 1;
    el.setSelectionRange(pos, pos);
    caretDigits.current = null;
  }, [value]);
  return (
    <div className="bp-money" data-invalid={invalid || undefined}>
      <span aria-hidden>$</span>
      <input
        ref={ref}
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(e) => {
          const raw = e.target.value;
          caretDigits.current = raw.slice(0, e.target.selectionStart ?? raw.length).replace(/\D/g, "").length;
          onChange(fmtTyping(raw));
        }}
      />
    </div>
  );
}

/** The package's photo, from the published albums, with its space reserved. */
function Photo({ tier, size }: { tier: EventTier; size: "wide" | "thumb" }) {
  const { lang } = useSite();
  const p = BUDGET_PHOTOS[tier];
  const wide = size === "wide";
  return (
    // eslint-disable-next-line @next/next/no-img-element -- /api/img serves its own capped renditions
    <img
      className={wide ? "bp-photo" : "bp-photo bp-photo--thumb"}
      src={budgetPhotoSrc(p.slug, wide ? 800 : 240)}
      srcSet={wide ? `${budgetPhotoSrc(p.slug, 480)} 480w, ${budgetPhotoSrc(p.slug, 800)} 800w, ${budgetPhotoSrc(p.slug, 1200)} 1200w` : undefined}
      sizes={wide ? "(min-width: 1024px) 640px, 100vw" : undefined}
      width={p.w}
      height={p.h}
      alt={wide ? p.alt[lang] : ""}
      loading="lazy"
      decoding="async"
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

/** Name, price, how much of the budget it uses, the short list, and the full list on request. */
function CardText({ option, budget }: { option: CoverageOption; budget: number }) {
  const { lang } = useSite();
  const { book } = usePriceBook();
  const c = BUDGET_COPY[lang];
  const d = detailsFor(option.tier, option.hours, option.addOns, lang, book);
  const over = option.totalUsd - budget;
  const short = d.included.filter((l) => l.icon !== "clock").slice(0, 3);
  return (
    <>
      <div className="bp-card__top">
        <h3 className="bp-card__name">{tierNameL(book, option.tier)[lang]}</h3>
        <p className="bp-card__price">{usd(option.totalUsd)}</p>
      </div>
      <p className="bp-card__meta">
        {c.hours(option.hours)}
        {option.addOns.includes("momentsfilm") ? `, ${c.withFilm}` : ""} · {option.video ? c.includesVideo : c.photosOnly}
      </p>
      {over > 0 ? (
        <p className="bp-over">{c.over(usd(over))}</p>
      ) : (
        <div className="bp-meter">
          <div className="bp-meter__track" aria-hidden>
            <i style={{ transform: `scaleX(${Math.min(option.totalUsd / budget, 1)})` }} />
          </div>
          <p className="bp-meter__text">
            {over === 0 ? c.usesAll(usd(budget)) : c.uses(usd(option.totalUsd), usd(budget))}
            {over < 0 ? <b>{c.left(usd(-over))}</b> : null}
          </p>
        </div>
      )}
      <ul className="bp-short">
        {short.map((l) => (
          <li key={l.label}>
            <DetailIcon name={l.icon} />
            <span>{l.text}</span>
          </li>
        ))}
      </ul>
      <details className="bp-more">
        <summary>{c.seeAll}</summary>
        <WhatYouGet details={d} />
        {option.tier === "moments" ? <p className="bp-hint bp-hint--note">{c.satNote(book.momentsSaturdayDays, tierNameL(book, "moments")[lang])}</p> : null}
      </details>
    </>
  );
}

/** Exactly what an option includes, one icon line each, then what isn't included. */
function WhatYouGet({ details: d }: { details: Details }) {
  const { lang } = useSite();
  const c = BUDGET_COPY[lang];
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
