"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import { PLAN_COPY, POPULAR_COLOR_IDS } from "@/content/plan-copy";
import { QUINCE_COLORS, MAX_PLAN_COLORS, type ColorId } from "@/lib/quince-colors";
import { PLAN_HONEYPOT_FIELD, parseContact, type PlanField, type PlanLang } from "@/lib/plan";
import { getFirstTouch, trackEvent } from "@/components/Tracker";
import { useShell } from "@/components/txq/SiteShell";
import "@/components/txq/pages/pages.css";
import "./plan.css";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Production only: the widget is locked to production hostnames (same as InquiryForm).
const SHOW_TURNSTILE = Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

type ErrorKey = keyof (typeof PLAN_COPY)["en"]["intake"]["errors"];

export function PlanIntake({
  lang: pageLang,
  initialDate,
  initialColors,
  src,
  minDate,
  maxDate,
  cities,
  errorCode,
}: {
  lang: PlanLang;
  initialDate: string;
  initialColors: ColorId[];
  src: string | null;
  minDate: string;
  maxDate: string;
  cities: string[];
  errorCode?: string | null;
}) {
  const router = useRouter();
  const { setDockHidden } = useShell();
  // The family's preferred language. Changing it re-renders the form in place.
  const [lang, setLang] = useState<PlanLang>(pageLang);
  const t = PLAN_COPY[lang].intake;
  const [colors, setColors] = useState<ColorId[]>(initialColors);
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<PlanField[]>([]);
  const [formError, setFormError] = useState<ErrorKey | null>(
    errorCode && errorCode in PLAN_COPY.en.intake.errors ? (errorCode as ErrorKey) : null,
  );
  const [token, setToken] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;

  // The mobile booking dock steps aside while the form is on screen.
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDockHidden(e.isIntersecting), { rootMargin: "0px 0px -20% 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      setDockHidden(false);
    };
  }, [setDockHidden]);

  // Popular colors first; anything prefilled from the link always shows.
  const visible = useMemo(() => {
    if (showAll) return QUINCE_COLORS;
    const ids = new Set<ColorId>([...POPULAR_COLOR_IDS, ...colors]);
    return QUINCE_COLORS.filter((c) => ids.has(c.id));
  }, [showAll, colors]);

  const full = colors.length >= MAX_PLAN_COLORS;
  const toggle = (id: ColorId) =>
    setColors((cur) => (cur.includes(id) ? cur.filter((c) => c !== id) : cur.length >= MAX_PLAN_COLORS ? cur : [...cur, id]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      event_date: String(fd.get("event_date") ?? ""),
      city: String(fd.get("city") ?? "").trim(),
      colors,
      theme: String(fd.get("theme") ?? ""),
      name: String(fd.get("name") ?? "").trim(),
      contact: String(fd.get("contact") ?? "").trim(),
      language: lang,
      src,
    };

    // Instant checks (the server re-validates everything).
    const bad: PlanField[] = [];
    if (!payload.event_date || payload.event_date < minDate || payload.event_date > maxDate) bad.push("event_date");
    if (payload.city.length < 2) bad.push("city");
    if (payload.name.length < 2) bad.push("name");
    if (!parseContact(payload.contact)) bad.push("contact");
    setFieldErrors(bad);
    if (bad.length) {
      setFormError("form");
      focusFirst(bad[0]);
      return;
    }
    if (SHOW_TURNSTILE && !token) {
      setFormError("verification");
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          [PLAN_HONEYPOT_FIELD]: String(fd.get(PLAN_HONEYPOT_FIELD) ?? ""),
          "cf-turnstile-response": token,
          attribution: getFirstTouch(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { slug?: string | null; path?: string; error?: string; fieldErrors?: PlanField[] };
      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? []);
        setFormError(data.error && data.error in t.errors ? (data.error as ErrorKey) : "generic");
        if (data.fieldErrors?.[0]) focusFirst(data.fieldErrors[0]);
        setBusy(false);
        return;
      }
      trackEvent("plan_created", src ?? "direct");
      if (data.path) router.push(data.path);
      else setBusy(false);
    } catch {
      setFormError("network");
      setBusy(false);
    }
  }

  function focusFirst(field: PlanField) {
    document.getElementById(fid(field))?.focus();
  }

  const invalid = (f: PlanField) => fieldErrors.includes(f);
  const describe = (f: PlanField, hint = false) => {
    const ids = [hint ? `${fid(f)}-hint` : "", invalid(f) ? `${fid(f)}-err` : ""].filter(Boolean).join(" ");
    return { "aria-invalid": invalid(f) || undefined, "aria-describedby": ids || undefined } as const;
  };
  const err = (f: PlanField) =>
    invalid(f) ? (
      <p id={`${fid(f)}-err`} className="tq-error">
        {t.errors[f]}
      </p>
    ) : null;

  return (
    <div className="tq-wrap qp-intake" lang={lang}>
      <header className="qp-intake__head">
        <p className="tq-mono qp-eyebrow">[{t.eyebrow}]</p>
        <h1 className="tq-display qp-intake__title">{t.title}</h1>
        <p className="qp-intake__intro">{t.intro}</p>
        <p className="tq-mono qp-promise">{t.promise}</p>
      </header>

      {/* method=post + action: without JavaScript the browser still POSTs the
          fields in the body (never the URL) and the API redirects to the plan. */}
      <form ref={formRef} method="post" action="/api/plan" onSubmit={onSubmit} noValidate className="tq-pg-form qp-form"
        onFocusCapture={(e) => {
          const f = e.currentTarget;
          if (f.dataset.started) return;
          f.dataset.started = "1";
          trackEvent("form_started", "plan");
        }}
      >
        <div aria-hidden className="tq-pg-hp">
          <label htmlFor={fid("hp")}>Do not fill this in</label>
          <input id={fid("hp")} name={PLAN_HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </div>
        {src ? <input type="hidden" name="src" value={src} /> : null}

        <fieldset className="tq-field qp-lang">
          <legend className="tq-mono tq-legend">{t.language}</legend>
          <div className="tq-pills">
            {(["es", "en"] as const).map((l) => (
              <label key={l} className="tq-pill" lang={l}>
                <input type="radio" name="language" value={l} checked={lang === l} onChange={() => setLang(l)} />
                {l === "es" ? "Español" : "English"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="qp-row">
          <div className="tq-field">
            <label htmlFor={fid("event_date")} className="tq-mono">
              {t.date} <span aria-hidden>*</span>
            </label>
            <input id={fid("event_date")} name="event_date" type="date" required min={minDate} max={maxDate} defaultValue={initialDate} className="tq-input" {...describe("event_date", true)} />
            <p id={`${fid("event_date")}-hint`} className="tq-hint">{t.dateHint}</p>
            {err("event_date")}
          </div>
          <div className="tq-field">
            <label htmlFor={fid("city")} className="tq-mono">
              {t.city} <span aria-hidden>*</span>
            </label>
            <input id={fid("city")} name="city" type="text" required autoComplete="address-level2" list={fid("cities")} placeholder={t.cityPlaceholder} className="tq-input" {...describe("city")} />
            <datalist id={fid("cities")}>
              {cities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {err("city")}
          </div>
        </div>

        <fieldset className="tq-field" aria-describedby={`${fid("colors")}-hint`}>
          <legend className="tq-mono tq-legend">
            {t.colors} <span className="tq-muted">— {t.optional}</span>
          </legend>
          <p id={`${fid("colors")}-hint`} className="tq-hint qp-hint-top">{t.colorsHint}</p>
          <div className="tq-pills qp-colors">
            {visible.map((c) => {
              const on = colors.includes(c.id);
              return (
                <label key={c.id} className="tq-pill qp-color" data-disabled={(!on && full) || undefined}>
                  <input type="checkbox" name="colors" value={c.id} checked={on} disabled={!on && full} onChange={() => toggle(c.id)} />
                  <span className="qp-swatch" style={{ background: c.hex }} aria-hidden />
                  {c[lang]}
                </label>
              );
            })}
          </div>
          <button type="button" className="qp-more" aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
            {showAll ? t.fewerColors : t.moreColors}
          </button>
        </fieldset>

        <div className="tq-field">
          <label htmlFor={fid("theme")} className="tq-mono">
            {t.theme} <span className="tq-muted">— {t.optional}</span>
          </label>
          <input id={fid("theme")} name="theme" type="text" maxLength={120} autoComplete="off" placeholder={t.themePlaceholder} className="tq-input" />
        </div>

        <div className="qp-row">
          <div className="tq-field">
            <label htmlFor={fid("name")} className="tq-mono">
              {t.name} <span aria-hidden>*</span>
            </label>
            <input id={fid("name")} name="name" type="text" required autoComplete="name" placeholder={t.namePlaceholder} className="tq-input" {...describe("name")} />
            {err("name")}
          </div>
          <div className="tq-field">
            <label htmlFor={fid("contact")} className="tq-mono">
              {t.contact} <span aria-hidden>*</span>
            </label>
            <input id={fid("contact")} name="contact" type="text" required autoComplete="tel" autoCapitalize="none" spellCheck={false} placeholder={t.contactPlaceholder} className="tq-input" {...describe("contact", true)} />
            <p id={`${fid("contact")}-hint`} className="tq-hint">{t.contactHint}</p>
            {err("contact")}
          </div>
        </div>

        {SHOW_TURNSTILE && SITE_KEY ? (
          <Turnstile siteKey={SITE_KEY} onSuccess={setToken} onExpire={() => setToken("")} onError={() => setToken("")} options={{ theme: "light", appearance: "interaction-only", language: lang }} />
        ) : null}

        <div className="qp-submit">
          {formError ? (
            <p role="alert" className="tq-pg-form__alert">
              {t.errors[formError]}
            </p>
          ) : null}
          <button type="submit" disabled={busy} aria-busy={busy || undefined} className="tq-btn tq-btn--lg tq-btn--block qp-cta">
            {busy ? (
              <>
                <span className="tq-pg-spinner" aria-hidden />
                {t.sending}
              </>
            ) : (
              <>
                {t.submit} <span className="tq-arrow" aria-hidden>→</span>
              </>
            )}
          </button>
          <p className="tq-pg-form__fine">
            {t.fine}{" "}
            <a href="/privacy" className="tq-pg-inline">
              {t.privacy}
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  );
}
