"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  inquirySchema,
  SERVICE_OPTIONS,
  BUDGET_OPTIONS,
  REFERRAL_OPTIONS,
  HONEYPOT_FIELD,
} from "@/lib/inquiry";
import { trackInquirySubmitted } from "@/lib/analytics";
import { trackEvent, getFirstTouch } from "@/components/Tracker";
import { useShell } from "@/components/txq/SiteShell";
import "@/components/txq/pages/pages.css";

type Status = "idle" | "submitting" | "error";
type FieldErrors = Partial<Record<string, string[]>>;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Locked to production hostnames, so it errors on localhost (110200). Only render
// in production; local dev skips the bot check (secret lives on the Worker).
const SHOW_TURNSTILE =
  Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

const spanish = {
  validation: "Revisa los campos señalados.",
  verification: "Completa la verificación.",
  genericError: "No se pudo enviar. Inténtalo de nuevo.",
  networkError: "Revisa tu conexión e inténtalo de nuevo.",
  name: "Tu nombre",
  namePlaceholder: "Nombre y apellido",
  phone: "Teléfono",
  optional: "Opcional",
  date: "Fecha de la quinceañera",
  future: "Solo fechas futuras",
  venue: "Salón o ciudad",
  venuePlaceholder: "Iglesia, salón o ciudad",
  service: "¿Qué necesitas?",
  chooseService: "Elige una opción…",
  budget: "Presupuesto",
  chooseBudget: "Elige un rango…",
  referral: "¿Cómo nos encontraste?",
  message: "¿Algo más que debamos saber?",
  messagePlaceholder: "Cuéntanos sobre su día: el tema, el salón y lo más importante para ella.",
  consent: "Al enviar este formulario, aceptas que te contactemos sobre tu evento. Consulta nuestra",
  privacy: "política de privacidad",
  sending: "Enviando…",
  submit: "Enviar mi consulta",
} as const;

function spanishError(message: string): string {
  if (/name/i.test(message)) return "Escribe tu nombre y apellido.";
  if (/email/i.test(message)) return "Escribe un correo electrónico válido.";
  if (/future date/i.test(message)) return "Elige una fecha futura dentro de los próximos tres años.";
  if (/photo|film|service/i.test(message)) return "Elige fotografía, video o ambos.";
  if (/budget/i.test(message)) return "Elige un rango de presupuesto.";
  if (/verification/i.test(message)) return spanish.verification;
  if (/too many requests/i.test(message)) return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";
  if (/save your inquiry/i.test(message)) return "No pudimos guardar tu consulta. Inténtalo de nuevo en unos minutos.";
  return spanish.genericError;
}

function localizeErrors(errors: FieldErrors): FieldErrors {
  return Object.fromEntries(Object.entries(errors).map(([key, messages]) => [key, messages?.map(spanishError)]));
}

export function InquiryForm({ initialDate = "", locale = "en" }: { initialDate?: string; locale?: "en" | "es" }) {
  const es = locale === "es";
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { setDockHidden } = useShell();

  // The global mobile booking dock steps aside while the form is on screen,
  // so it never covers the fields or the submit button.
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setDockHidden(e.isIntersecting), {
      rootMargin: "0px 0px -20% 0px",
    });
    io.observe(el);
    return () => {
      io.disconnect();
      setDockHidden(false);
    };
  }, [setDockHidden]);

  const { todayStr, maxStr } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const max = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { todayStr: fmt(today), maxStr: fmt(max) };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setFormError(null);
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      event_date: String(fd.get("event_date") ?? ""),
      venue: String(fd.get("venue") ?? ""),
      services: String(fd.get("services") ?? ""),
      budget_range: String(fd.get("budget_range") ?? ""),
      referral: String(fd.get("referral") ?? ""),
      message: String(fd.get("message") ?? ""),
    };

    // Client-side validation (server re-validates regardless).
    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(es ? localizeErrors(fieldErrors) : fieldErrors);
      setFormError(es ? spanish.validation : "Please check the highlighted fields.");
      setStatus("error");
      return;
    }

    // Turnstile gate: require a token only when the widget is shown (production).
    if (SHOW_TURNSTILE && !token) {
      setFormError(es ? spanish.verification : "Please complete the verification below.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
          "cf-turnstile-response": token,
          attribution: getFirstTouch(),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          fieldErrors?: FieldErrors;
        };
        if (data.fieldErrors) setErrors(es ? localizeErrors(data.fieldErrors) : data.fieldErrors);
        setFormError(es ? spanishError(data.error ?? "") : (data.error ?? "Something went wrong. Please try again."));
        setStatus("error");
        return;
      }

      trackInquirySubmitted({
        budget_range: parsed.data.budget_range,
        services: parsed.data.services,
      });
      router.push(es ? "/es/gracias" : "/thank-you");
    } catch {
      setFormError(es ? spanish.networkError : "Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const submitting = status === "submitting";
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  /** a11y wiring for a field: invalid state + described by its hint/error. */
  const aria = (name: string, hint = false) => {
    const err = errors[name]?.length;
    const ids = [hint ? `${fid(name)}-hint` : "", err ? `${fid(name)}-err` : ""].filter(Boolean).join(" ");
    return { "aria-invalid": err ? true : undefined, "aria-describedby": ids || undefined } as const;
  };
  const optional = es ? spanish.optional : "Optional";
  const serviceLabel = (value: (typeof SERVICE_OPTIONS)[number]["value"], label: string) =>
    es ? ({ photo: "Fotografía", video: "Video", both: "Foto y video" } as const)[value] : label;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="tq-pg-form"
      onFocusCapture={(e) => {
        const f = e.currentTarget;
        if (f.dataset.started) return;
        f.dataset.started = "1";
        trackEvent("form_started", "inquiry");
      }}
    >
      {/* Honeypot — hidden from humans, obscure name; bots fill it and get dropped. */}
      <div aria-hidden className="tq-pg-hp">
        <label htmlFor={HONEYPOT_FIELD}>Do not fill this in</label>
        <input
          ref={honeypotRef}
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* 01 — Contact */}
      <div className="tq-pg-form__group">
        <GroupHead index={`01 / ${es ? "Contacto" : "Contact"}`} title={es ? "Cómo podemos contactarte" : "How we can reach you"} />
        <Field id={fid("name")} label={es ? spanish.name : "Your name"} required error={errors.name}>
          <input id={fid("name")} name="name" type="text" autoComplete="name" className="tq-input" placeholder={es ? spanish.namePlaceholder : "First and last"} {...aria("name")} />
        </Field>
        <div className="tq-fieldrow">
          <Field id={fid("email")} label="Email" required error={errors.email}>
            <input id={fid("email")} name="email" type="email" inputMode="email" autoComplete="email" className="tq-input" placeholder="you@email.com" {...aria("email")} />
          </Field>
          <Field id={fid("phone")} label={es ? spanish.phone : "Phone"} optional={optional} error={errors.phone}>
            <input id={fid("phone")} name="phone" type="tel" inputMode="tel" autoComplete="tel" className="tq-input" placeholder="(214) 555-0100" {...aria("phone")} />
          </Field>
        </div>
      </div>

      {/* 02 — Celebration */}
      <div className="tq-pg-form__group">
        <GroupHead index={`02 / ${es ? "Celebración" : "Celebration"}`} title={es ? "Cuéntanos sobre su día" : "Tell us about her day"} />
        <div className="tq-fieldrow">
          <Field id={fid("event_date")} label={es ? spanish.date : "Event date"} optional={optional} hint={es ? spanish.future : "Future dates only"} error={errors.event_date}>
            <input id={fid("event_date")} name="event_date" type="date" min={todayStr} max={maxStr} defaultValue={initialDate} className="tq-input" {...aria("event_date", true)} />
          </Field>
          <Field id={fid("venue")} label={es ? spanish.venue : "Venue or city"} optional={optional} error={errors.venue}>
            <input id={fid("venue")} name="venue" type="text" autoComplete="off" className="tq-input" placeholder={es ? spanish.venuePlaceholder : "Church, hall, or city"} {...aria("venue")} />
          </Field>
        </div>

        <fieldset className="tq-field" aria-describedby={errors.services?.length ? `${fid("services")}-err` : undefined}>
          <legend className="tq-mono tq-legend">
            {es ? spanish.service : "What do you need?"} <span aria-hidden>*</span>
          </legend>
          <div className="tq-pills">
            {SERVICE_OPTIONS.map((o) => (
              <label key={o.value} className="tq-pill">
                <input type="radio" name="services" value={o.value} required />
                {serviceLabel(o.value, o.label)}
              </label>
            ))}
          </div>
          <FieldError id={`${fid("services")}-err`} error={errors.services} />
        </fieldset>

        <fieldset className="tq-field" aria-describedby={errors.budget_range?.length ? `${fid("budget_range")}-err` : undefined}>
          <legend className="tq-mono tq-legend">
            {es ? spanish.budget : "Budget range"} <span aria-hidden>*</span>
          </legend>
          <div className="tq-choice">
            {BUDGET_OPTIONS.map((o, i) => {
              const [price, ...rest] = (es ? o.labelEs : o.label).split(" — ");
              return (
                <label key={o.value}>
                  <input type="radio" name="budget_range" value={o.value} required />
                  <span className="tq-display tq-choice__num" aria-hidden>
                    {["I", "II", "III", "IV"][i] ?? i + 1}
                  </span>
                  <span className="tq-choice__name">{rest.join(" — ") || price}</span>
                  <span className="tq-mono tq-choice__price tq-nums">{price}</span>
                </label>
              );
            })}
          </div>
          <FieldError id={`${fid("budget_range")}-err`} error={errors.budget_range} />
        </fieldset>
      </div>

      {/* 03 — Details */}
      <div className="tq-pg-form__group">
        <GroupHead index={`03 / ${es ? "Detalles" : "Details"}`} title={es ? "Algo más que debamos saber" : "Anything else we should know"} />
        <Field id={fid("referral")} label={es ? spanish.referral : "How did you hear about us?"} optional={optional} error={errors.referral}>
          <select id={fid("referral")} name="referral" defaultValue="" className="tq-input tq-pg-select" {...aria("referral")}>
            <option value="">{es ? "Elige una opción…" : "Choose one…"}</option>
            {REFERRAL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {es ? ({ Facebook: "Facebook", Instagram: "Instagram", "A friend or family member": "Un amigo o familiar", "A past client": "Un cliente anterior", Google: "Google", "A venue or planner": "Un salón u organizador", Other: "Otro" } as Record<string, string>)[o] : o}
              </option>
            ))}
          </select>
        </Field>

        <Field id={fid("message")} label={es ? spanish.message : "Anything you'd like me to know?"} optional={optional} error={errors.message}>
          <textarea
            id={fid("message")}
            name="message"
            rows={4}
            className="tq-input"
            placeholder={es ? spanish.messagePlaceholder : "Tell me about her day — the theme, the venue, what matters most."}
            {...aria("message")}
          />
        </Field>
      </div>

      {/* Turnstile (primary abuse gate). Production-only (errors on localhost). */}
      {SHOW_TURNSTILE && SITE_KEY ? (
        <div>
          <Turnstile
            siteKey={SITE_KEY}
            onSuccess={setToken}
            onExpire={() => setToken("")}
            onError={() => setToken("")}
            options={{ theme: "light" }}
          />
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 16, paddingTop: 24, borderTop: "1px solid var(--border-hairline)" }}>
        <p className="tq-pg-form__fine">
          {es ? spanish.consent : "By submitting, you agree to be contacted about your event. See our"}{" "}
          <a href="/privacy" className="tq-pg-inline">
            {es ? spanish.privacy : "privacy policy"}
          </a>
          .
        </p>

        {formError ? (
          <p role="alert" className="tq-pg-form__alert">
            {formError}
          </p>
        ) : null}

        <button type="submit" disabled={submitting} aria-busy={submitting || undefined} className="tq-btn tq-btn--lg tq-btn--block">
          {submitting ? (
            <>
              <span className="tq-pg-spinner" aria-hidden />
              {es ? spanish.sending : "Sending…"}
            </>
          ) : (
            <>
              {es ? spanish.submit : "Send my inquiry"} <span className="tq-arrow" aria-hidden>→</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function GroupHead({ index, title }: { index: string; title: string }) {
  return (
    <div className="tq-pg-form__head">
      <span className="tq-mono">[{index}]</span>
      <h3 className="tq-display">{title}</h3>
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string[] }) {
  return error?.length ? (
    <p id={id} className="tq-error">
      {error[0]}
    </p>
  ) : null;
}

function Field({
  id,
  label,
  required,
  optional,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  /** Localized "optional" marker for non-required fields. */
  optional?: string;
  error?: string[];
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="tq-field">
      <label htmlFor={id} className="tq-mono">
        {label}
        {required ? <span aria-hidden> *</span> : null}
        {optional ? <span className="tq-muted"> — {optional}</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="tq-hint">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-err`} error={error} />
    </div>
  );
}
