"use client";

import { useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  bookingSchema,
  PACKAGE_OPTIONS,
  HONEYPOT_FIELD,
  DEPOSIT_LABEL,
} from "@/lib/booking";
import { trackBookingStarted } from "@/lib/analytics";

type Status = "idle" | "submitting" | "redirecting" | "error";
type FieldErrors = Partial<Record<string, string[]>>;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const inputBase =
  "w-full border-b border-line bg-transparent px-0 py-3 text-ink placeholder:text-ink-faint/70 transition-colors focus:border-wine focus:outline-none";
const labelBase = "block text-sm font-medium text-ink";

export function BookingForm() {
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
      package: String(fd.get("package") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    };

    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setFormError("Please check the highlighted fields.");
      setStatus("error");
      return;
    }

    if (SITE_KEY && !token) {
      setFormError("Please complete the verification below.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
          "cf-turnstile-response": token,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        checkoutUrl?: string | null;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!res.ok || !data.ok || !data.checkoutUrl) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      // Off to Stripe Checkout. Keep the button locked so they can't double-submit.
      trackBookingStarted({ package: parsed.data.package });
      setStatus("redirecting");
      window.location.assign(data.checkoutUrl);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const busy = status === "submitting" || status === "redirecting";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      {/* Honeypot — hidden from humans; bots fill it and get silently dropped. */}
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
        <Field label="Event date" required error={errors.event_date} hint="The day to reserve">
          <input name="event_date" type="date" min={todayStr} max={maxStr} className={inputBase} />
        </Field>

        <Field label="What are you reserving?" required error={errors.package} className="sm:col-span-2">
          <select name="package" defaultValue="" className={`${inputBase} appearance-none`}>
            <option value="" disabled>
              Choose one…
            </option>
            {PACKAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Anything you'd like me to know?" error={errors.notes} className="sm:col-span-2">
          <textarea
            name="notes"
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder="Theme, venue, timeline — anything that helps me plan her day."
          />
        </Field>
      </div>

      {SITE_KEY ? (
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
        You&apos;ll be taken to a secure Stripe checkout to pay the {DEPOSIT_LABEL}{" "}
        deposit — pay in full or in interest-free installments. By reserving, you
        agree to be contacted about your event. See our{" "}
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
        disabled={busy}
        className="inline-flex items-center justify-center gap-3 self-start rounded-full bg-wine px-10 py-4 text-[0.7rem] uppercase tracking-[0.2em] text-cream transition-all duration-300 hover:bg-wine-deep disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream"
              aria-hidden
            />
            {status === "redirecting" ? "Taking you to checkout…" : "Reserving…"}
          </>
        ) : (
          `Reserve my date · ${DEPOSIT_LABEL} deposit`
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
