"use client";

import { useMemo, useRef, useState } from "react";
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

type Status = "idle" | "submitting" | "error";
type FieldErrors = Partial<Record<string, string[]>>;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Locked to production hostnames, so it errors on localhost (110200). Only render
// in production; local dev skips the bot check (secret lives on the Worker).
const SHOW_TURNSTILE =
  Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

const inputBase =
  "min-h-12 w-full border border-[#8c8377] bg-white px-4 py-3 text-base text-ink placeholder:text-ink-soft focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/20";
const labelBase = "block text-base font-medium text-ink";

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

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-7"
      onFocusCapture={(e) => {
        const f = e.currentTarget;
        if (f.dataset.started) return;
        f.dataset.started = "1";
        trackEvent("form_started", "inquiry");
      }}
    >
      {/* Honeypot — hidden from humans, obscure name; bots fill it and get dropped. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={es ? spanish.name : "Your name"} required error={errors.name}>
          <input name="name" type="text" autoComplete="name" className={inputBase} placeholder={es ? spanish.namePlaceholder : "First and last"} />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input name="email" type="email" autoComplete="email" className={inputBase} placeholder="you@email.com" />
        </Field>
        <Field label={es ? spanish.phone : "Phone"} error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" className={inputBase} placeholder={es ? spanish.optional : "(optional)"} />
        </Field>
        <Field label={es ? spanish.date : "Event date"} error={errors.event_date} hint={es ? spanish.future : "Future dates only"}>
          <input name="event_date" type="date" min={todayStr} max={maxStr} defaultValue={initialDate} className={inputBase} />
        </Field>
        <Field label={es ? spanish.venue : "Venue or city"} error={errors.venue} className="sm:col-span-2">
          <input name="venue" type="text" className={inputBase} placeholder={es ? spanish.venuePlaceholder : "Church, hall, or city"} />
        </Field>

        <Field label={es ? spanish.service : "What do you need?"} required error={errors.services}>
          <select name="services" defaultValue="" className={`${inputBase} appearance-none`}>
            <option value="" disabled>
              {es ? spanish.chooseService : "Choose one…"}
            </option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {es ? ({ photo: "Fotografía", video: "Video", both: "Foto y video" } as const)[o.value] : o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={es ? spanish.budget : "Budget range"} required error={errors.budget_range}>
          <select name="budget_range" defaultValue="" className={`${inputBase} appearance-none`}>
            <option value="" disabled>
              {es ? spanish.chooseBudget : "Choose a range…"}
            </option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label={es ? spanish.referral : "How did you hear about us?"} error={errors.referral} className="sm:col-span-2">
          <select name="referral" defaultValue="" className={`${inputBase} appearance-none`}>
            <option value="">{es ? spanish.optional : "Optional"}</option>
            {REFERRAL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {es ? ({ Facebook: "Facebook", Instagram: "Instagram", "A friend or family member": "Un amigo o familiar", "A past client": "Un cliente anterior", Google: "Google", "A venue or planner": "Un salón u organizador", Other: "Otro" } as Record<string, string>)[o] : o}
              </option>
            ))}
          </select>
        </Field>

        <Field label={es ? spanish.message : "Anything you'd like me to know?"} error={errors.message} className="sm:col-span-2">
          <textarea
            name="message"
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder={es ? spanish.messagePlaceholder : "Tell me about her day — the theme, the venue, what matters most."}
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

      <p className="text-sm leading-relaxed text-ink-soft">
        {es ? spanish.consent : "By submitting, you agree to be contacted about your event. See our"}{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
          {es ? spanish.privacy : "privacy policy"}
        </a>
        .
      </p>

      {formError ? (
        <p role="alert" className="text-sm font-medium text-[#a73333]">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {submitting ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream"
              aria-hidden
            />
            {es ? spanish.sending : "Sending…"}
          </>
        ) : (
          es ? spanish.submit : "Send my inquiry"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className={labelBase}>
        {label}
        {required ? <span className="text-wine"> *</span> : null}
        {hint ? <span className="ml-2 text-sm font-normal text-ink-soft">{hint}</span> : null}
      </span>
      {children}
      {error?.length ? <span className="text-sm font-medium text-[#a73333]">{error[0]}</span> : null}
    </label>
  );
}
