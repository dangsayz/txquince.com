"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
type Step = 0 | 1 | 2 | 3;

const STEPS = ["Her date", "The setting", "Coverage", "Your details"] as const;
const STEP_FIELDS = [
  ["event_date"],
  ["venue"],
  ["services", "budget_range"],
  ["name", "email", "phone", "referral", "message"],
] as const;

function firstErrorStep(errors: FieldErrors): Step {
  const found = STEP_FIELDS.findIndex((fields) => fields.some((field) => errors[field]?.length));
  return (found < 0 ? 3 : found) as Step;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Locked to production hostnames, so it errors on localhost (110200). Only render
// in production; local dev skips the bot check (secret lives on the Worker).
const SHOW_TURNSTILE =
  Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

const inputBase =
  "min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";
const labelBase = "block text-sm font-medium text-ink";

export function InquiryForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  const { todayStr, maxStr } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const max = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { todayStr: fmt(today), maxStr: fmt(max) };
  }, []);

  function nextStep() {
    if (!formRef.current || step === 3) return;
    const data = new FormData(formRef.current);
    const partial = Object.fromEntries(
      STEP_FIELDS[step].map((field) => [field, String(data.get(field) ?? "")]),
    );
    const shape = step === 0
      ? inquirySchema.pick({ event_date: true })
      : step === 1
        ? inquirySchema.pick({ venue: true })
        : inquirySchema.pick({ services: true, budget_range: true });
    const parsed = shape.safeParse(partial);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setFormError("Please check this step before continuing.");
      return;
    }
    setErrors({});
    setFormError(null);
    setStep((step + 1) as Step);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    if (step !== 3) {
      nextStep();
      return;
    }
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
      setErrors(fieldErrors);
      setStep(firstErrorStep(fieldErrors));
      setFormError("Please check the highlighted fields.");
      setStatus("error");
      return;
    }

    // Turnstile gate: require a token only when the widget is shown (production).
    if (SHOW_TURNSTILE && !token) {
      setFormError("Please complete the verification below.");
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
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
          setStep(firstErrorStep(data.fieldErrors));
        }
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      trackInquirySubmitted({
        budget_range: parsed.data.budget_range,
        services: parsed.data.services,
      });
      router.push("/thank-you");
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const submitting = status === "submitting";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8"
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

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Step {step + 1} of {STEPS.length}</p>
      <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Inquiry progress">
        {STEPS.map((name, index) => (
          <li key={name} className="min-w-0">
            <span className={`block h-1.5 rounded-full ${index <= step ? "bg-accent" : "bg-greige"}`} />
            <span className={`mt-2 block truncate text-[0.68rem] ${index === step ? "font-semibold text-ink" : "text-ink-faint"}`} aria-current={index === step ? "step" : undefined}>{name}</span>
          </li>
        ))}
      </ol>
      <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-semibold tracking-tight text-ink focus:outline-none">
        {step === 0 ? "When is her quinceañera?" : step === 1 ? "Where will you celebrate?" : step === 2 ? "What would you like captured?" : "How can we reach you?"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {step === 0 ? "Still choosing a date? Leave this blank and continue." : step === 1 ? "A church, venue, or city is enough. You can add details later." : step === 2 ? "Choose the coverage and budget that fit your celebration." : "We will reply personally. No payment is needed to ask."}
      </p>

      <div hidden={step !== 0} style={{ display: step !== 0 ? "none" : undefined }} className="mt-8">
        <Field label="Event date" error={errors.event_date} hint="Optional">
          <input name="event_date" type="date" min={todayStr} max={maxStr} className={inputBase} />
        </Field>
      </div>
      <div hidden={step !== 1} style={{ display: step !== 1 ? "none" : undefined }} className="mt-8">
        <Field label="Venue or city" error={errors.venue} hint="Optional">
          <input name="venue" type="text" maxLength={160} className={inputBase} placeholder="Church, venue, or city" />
        </Field>
      </div>
      <div hidden={step !== 2} style={{ display: step !== 2 ? "none" : undefined }} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="What do you need?" required error={errors.services}>
          <select name="services" defaultValue="" className={inputBase}>
            <option value="" disabled>Choose one…</option>
            {SERVICE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </Field>
        <Field label="Budget range" required error={errors.budget_range}>
          <select name="budget_range" defaultValue="" className={inputBase}>
            <option value="" disabled>Choose a range…</option>
            {BUDGET_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </Field>
      </div>
      <div hidden={step !== 3} style={{ display: step !== 3 ? "none" : undefined }} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name}>
          <input name="name" type="text" autoComplete="name" className={inputBase} placeholder="First and last" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input name="email" type="email" autoComplete="email" className={inputBase} placeholder="you@email.com" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" className={inputBase} placeholder="Optional" />
        </Field>
        <Field label="How did you hear about us?" error={errors.referral}>
          <select name="referral" defaultValue="" className={inputBase}>
            <option value="">Optional</option>
            {REFERRAL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </Field>
        <Field label="Anything else?" error={errors.message} className="sm:col-span-2">
          <textarea name="message" rows={4} className={`${inputBase} resize-y`} placeholder="Tell us about her day and what matters most." />
        </Field>
      </div>

      {/* Turnstile (primary abuse gate). Production-only (errors on localhost). */}
      {SHOW_TURNSTILE && SITE_KEY ? (
        <div hidden={step !== 3} className="mt-5">
          <Turnstile
            siteKey={SITE_KEY}
            onSuccess={setToken}
            onExpire={() => setToken("")}
            onError={() => setToken("")}
            options={{ theme: "light" }}
          />
        </div>
      ) : null}

      <p hidden={step !== 3} className="mt-5 text-xs leading-relaxed text-ink-faint">
        By submitting, you agree to be contacted about your event. See our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
          privacy policy
        </a>
        .
      </p>

      {formError ? (
        <p role="alert" className="mt-6 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        {step > 0 ? (
          <button type="button" onClick={() => { setStep((step - 1) as Step); setFormError(null); }} className="min-h-11 rounded-lg px-4 text-sm font-semibold text-ink hover:bg-greige">Back</button>
        ) : <span />}
        {step < 3 ? (
          <button type="button" onClick={nextStep} className="min-h-11 rounded-lg bg-ink px-6 text-sm font-semibold text-white hover:bg-ink-soft">Continue</button>
        ) : (
          <button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-accent px-6 text-sm font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Sending…" : "Send my inquiry"}
          </button>
        )}
      </div>
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
        {required ? <span className="text-danger"> *</span> : null}
        {hint ? <span className="ml-2 text-xs font-normal text-ink-faint">{hint}</span> : null}
      </span>
      {children}
      {error?.length ? <span className="text-xs text-danger">{error[0]}</span> : null}
    </label>
  );
}
