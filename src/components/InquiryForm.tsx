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
import { trackEvent } from "@/components/Tracker";

type Status = "idle" | "submitting" | "error";
type FieldErrors = Partial<Record<string, string[]>>;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Locked to production hostnames, so it errors on localhost (110200). Only render
// in production; local dev skips the bot check (secret lives on the Worker).
const SHOW_TURNSTILE =
  Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

const inputBase =
  "w-full border-b border-line bg-transparent px-0 py-3 text-ink placeholder:text-ink-faint/70 transition-colors focus:border-wine focus:outline-none";
const labelBase = "block text-sm font-medium text-ink";

export function InquiryForm() {
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
      setErrors(parsed.error.flatten().fieldErrors);
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
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          fieldErrors?: FieldErrors;
        };
        if (data.fieldErrors) setErrors(data.fieldErrors);
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
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-8"
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

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name}>
          <input name="name" type="text" autoComplete="name" className={inputBase} placeholder="First and last" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input name="email" type="email" autoComplete="email" className={inputBase} placeholder="you@email.com" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input name="phone" type="tel" autoComplete="tel" className={inputBase} placeholder="(optional)" />
        </Field>
        <Field label="Event date" error={errors.event_date} hint="Future dates only">
          <input name="event_date" type="date" min={todayStr} max={maxStr} className={inputBase} />
        </Field>
        <Field label="Venue or city" error={errors.venue} className="sm:col-span-2">
          <input name="venue" type="text" className={inputBase} placeholder="Church, hall, or city" />
        </Field>

        <Field label="What do you need?" required error={errors.services}>
          <select name="services" defaultValue="" className={`${inputBase} appearance-none`}>
            <option value="" disabled>
              Choose one…
            </option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget range" required error={errors.budget_range}>
          <select name="budget_range" defaultValue="" className={`${inputBase} appearance-none`}>
            <option value="" disabled>
              Choose a range…
            </option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="How did you hear about us?" error={errors.referral} className="sm:col-span-2">
          <select name="referral" defaultValue="" className={`${inputBase} appearance-none`}>
            <option value="">Optional</option>
            {REFERRAL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Anything you'd like me to know?" error={errors.message} className="sm:col-span-2">
          <textarea
            name="message"
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder="Tell me about her day — the theme, the venue, what matters most."
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

      <p className="text-xs leading-relaxed text-ink-faint">
        By submitting, you agree to be contacted about your event. See our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
          privacy policy
        </a>
        .
      </p>

      {formError ? (
        <p role="alert" className="text-sm text-wine">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-3 self-start rounded-full bg-wine px-10 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition-all duration-300 hover:bg-wine-deep disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream"
              aria-hidden
            />
            Sending…
          </>
        ) : (
          "Send my inquiry"
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
        {hint ? <span className="ml-2 text-xs font-normal text-ink-faint">{hint}</span> : null}
      </span>
      {children}
      {error?.length ? <span className="text-xs text-wine">{error[0]}</span> : null}
    </label>
  );
}
