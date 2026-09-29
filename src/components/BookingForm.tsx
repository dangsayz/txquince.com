"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { bookingSchema, HONEYPOT_FIELD } from "@/lib/booking";
import { packages, type CollectionId } from "@/content/packages";
import { trackBookingStarted } from "@/lib/analytics";
import { trackEvent, getFirstTouch } from "@/components/Tracker";
import { Select } from "@/components/Select";

type Status = "idle" | "submitting" | "done" | "error";
type FieldErrors = Partial<Record<string, string[]>>;
type Step = 0 | 1 | 2 | 3;

const STEPS = ["Her date", "The setting", "Collection", "Your details"] as const;

function firstErrorStep(errors: FieldErrors): Step {
  if (errors.event_date?.length) return 0;
  if (errors.notes?.length) return 1;
  if (errors.collection?.length || errors.package?.length) return 2;
  return 3;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Locked to production hostnames, so it errors on localhost (110200). Only
// render in production; local dev skips the bot check (secret on the Worker).
const SHOW_TURNSTILE =
  Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

const DRAFT_KEY = "txq_reserve_draft";

const inputBase =
  "min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-wine focus:outline-none focus:ring-2 focus:ring-wine/20";
const labelBase = "block text-sm font-medium text-ink";

type Draft = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  collection: CollectionId;
  essentialService: "photo" | "video";
  notes: string;
};

function isCollectionId(value: unknown): value is CollectionId {
  return packages.some((item) => item.id === value);
}

function isEssentialService(value: unknown): value is "photo" | "video" {
  return value === "photo" || value === "video";
}

export function BookingForm({
  defaultCollection,
  defaultDate,
}: {
  defaultCollection?: CollectionId;
  /** Prefill from ?date= (e.g. the homepage date-checker). Wins over a saved draft. */
  defaultDate?: string;
} = {}) {
  const [step, setStep] = useState<Step>(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  // Controlled fields (so we can auto-save the draft + restore it).
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [collection, setCollection] = useState<CollectionId>(
    defaultCollection ?? "signature",
  );
  const [essentialService, setEssentialService] = useState<"photo" | "video">(
    "photo",
  );
  const [notes, setNotes] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const restored = useRef(false);

  useEffect(() => {
    if (step > 0) headingRef.current?.focus();
  }, [step]);

  // Restore any saved draft on mount, so pressing back / reloading never loses
  // what they typed. defaultCollection only wins if there's no saved draft.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            const draft = parsed as Record<keyof Draft, unknown>;
            if (typeof draft.name === "string") setName(draft.name);
            if (typeof draft.email === "string") setEmail(draft.email);
            if (typeof draft.phone === "string") setPhone(draft.phone);
            if (typeof draft.eventDate === "string") setEventDate(draft.eventDate);
            if (isCollectionId(draft.collection)) setCollection(draft.collection);
            if (isEssentialService(draft.essentialService)) setEssentialService(draft.essentialService);
            if (typeof draft.notes === "string") setNotes(draft.notes);
          }
        }
      } catch {
        /* A malformed or unavailable draft should not block booking. */
      }
      if (defaultDate && /^\d{4}-\d{2}-\d{2}$/.test(defaultDate)) {
        setEventDate(defaultDate);
      }
      restored.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [defaultDate]);

  // Auto-save the draft on every change (after the initial restore).
  useEffect(() => {
    if (!restored.current || status === "done") return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ name, email, phone, eventDate, collection, essentialService, notes }),
      );
    } catch {
      /* ignore */
    }
  }, [name, email, phone, eventDate, collection, essentialService, notes, status]);

  // Live date availability.
  const [takenDates, setTakenDates] = useState<Set<string> | null>(null);
  useEffect(() => {
    let alive = true;
    fetch("/api/availability")
      .then((r) => r.json())
      .then((d: { takenDates?: string[] }) => {
        if (alive && Array.isArray(d.takenDates)) setTakenDates(new Set(d.takenDates));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const dateTaken = Boolean(eventDate && takenDates?.has(eventDate));
  const dateOpen = Boolean(eventDate && takenDates && !takenDates.has(eventDate));

  const selectedCollection =
    packages.find((p) => p.id === collection) ?? packages[1];
  const packageValue: "photo" | "video" | "both" =
    collection === "essential" ? essentialService : "both";

  const { todayStr, maxStr } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const max = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { todayStr: fmt(today), maxStr: fmt(max) };
  }, []);

  function nextStep() {
    if (step === 3) return;
    const partial = step === 0
      ? bookingSchema.pick({ event_date: true }).safeParse({ event_date: eventDate })
      : step === 1
        ? bookingSchema.pick({ notes: true }).safeParse({ notes })
        : bookingSchema.pick({ collection: true, package: true }).safeParse({ collection, package: packageValue });
    if (!partial.success) {
      setErrors(partial.error.flatten().fieldErrors);
      setFormError("Please check this step before continuing.");
      return;
    }
    if (step === 0 && takenDates?.has(eventDate)) {
      setErrors({ event_date: ["That date is already requested. Please choose another."] });
      setFormError("That date is already requested. Please choose another.");
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

    const payload = {
      name,
      email,
      phone,
      event_date: eventDate,
      collection,
      package: packageValue,
      notes,
    };

    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors(fieldErrors);
      setStep(firstErrorStep(fieldErrors));
      setFormError("Please check the highlighted fields.");
      setStatus("error");
      return;
    }

    if (takenDates?.has(parsed.data.event_date)) {
      setStep(0);
      setErrors({ event_date: ["That date is already requested. Please choose another."] });
      setFormError("That date is already requested. Please choose another.");
      setStatus("error");
      return;
    }

    if (SHOW_TURNSTILE && !token) {
      setFormError("Please complete the verification below.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/reserve-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          [HONEYPOT_FIELD]: honeypotRef.current?.value ?? "",
          "cf-turnstile-response": token,
          attribution: getFirstTouch(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (!res.ok || !data.ok) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
          setStep(firstErrorStep(data.fieldErrors));
        }
        setFormError(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      trackBookingStarted({ package: parsed.data.package });
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      setStatus("done");
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  const busy = status === "submitting";

  // ---- Success state ----
  if (status === "done") {
    return (
      <div className="rounded-[1.5rem] border border-line bg-ivory p-8 text-center md:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream ring-1 ring-line">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
            <path d="M1 8.5L7 14.5L19 1.5" stroke="var(--color-wine)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl text-ink">Your date request is in.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Thank you, {name.split(" ")[0] || "there"}. I&apos;ll personally confirm your
          date is open and reach out to talk through the
          day and send you a secure link to place your {selectedCollection.depositLabel}{" "}
          deposit. <strong className="text-ink">No payment is needed right now.</strong>
        </p>
        <p className="mt-4 text-xs text-ink-faint">
          A confirmation is on its way to {email}.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-8"
      onFocusCapture={(e) => {
        const f = e.currentTarget;
        if (f.dataset.started) return;
        f.dataset.started = "1";
        trackEvent("form_started", "reserve");
      }}
    >
      {/* Honeypot */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Do not fill this in</label>
        <input ref={honeypotRef} id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">Step {step + 1} of {STEPS.length}</p>
      <ol className="mt-3 grid grid-cols-4 gap-1.5" aria-label="Reservation progress">
        {STEPS.map((title, index) => (
          <li key={title} className="min-w-0">
            <span className={`block h-1.5 rounded-full ${index <= step ? "bg-wine" : "bg-greige"}`} />
            <span className={`mt-2 block truncate text-[0.68rem] ${index === step ? "font-semibold text-ink" : "text-ink-faint"}`} aria-current={index === step ? "step" : undefined}>{title}</span>
          </li>
        ))}
      </ol>
      <h2 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-semibold tracking-tight text-ink focus:outline-none">
        {step === 0 ? "Choose her date" : step === 1 ? "Where is the celebration?" : step === 2 ? "Choose a collection" : "Who should we contact?"}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {step === 0 ? "We will confirm it personally before any payment." : step === 1 ? "Share the venue or city and any details you already know." : step === 2 ? "Every collection has a clear price and deposit." : "Your request holds the conversation. No payment is needed now."}
      </p>

      <div hidden={step !== 3} style={{ display: step !== 3 ? "none" : undefined }} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" className={inputBase} placeholder="First and last" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className={inputBase} placeholder="you@email.com" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" className={inputBase} placeholder="(optional)" />
        </Field>
      </div>
      <div hidden={step !== 0} style={{ display: step !== 0 ? "none" : undefined }} className="mt-8">
        <Field label="Event date" required error={errors.event_date} hint="The day to reserve">
          <input
            type="date"
            min={todayStr}
            max={maxStr}
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className={inputBase}
            aria-describedby="date-availability"
          />
          <span id="date-availability" aria-live="polite" className="block">
            {dateTaken ? (
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-wine">
                <span aria-hidden>●</span>
                That date is already requested — pick another, or{" "}
                <a href="/check-your-date" className="underline hover:text-wine-deep">ask about your options</a>.
              </span>
            ) : dateOpen ? (
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-green-700">
                <span aria-hidden>●</span>
                Not currently marked as requested. I&apos;ll confirm availability personally.
              </span>
            ) : null}
          </span>
        </Field>
      </div>

      <div hidden={step !== 2} style={{ display: step !== 2 ? "none" : undefined }} className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field
          label="Which collection?"
          required
          error={errors.collection}
          hint="Applies to your final balance"
          className={collection === "essential" ? "" : "sm:col-span-2"}
        >
          <Select
            value={collection}
            onChange={(value) => {
              if (isCollectionId(value)) setCollection(value);
            }}
            options={packages.map((p) => ({
              value: p.id,
              label: `${p.name} · ${p.priceLabel}`,
            }))}
          />
        </Field>

        {collection === "essential" && (
          <Field label="Photo or film?" required>
            <Select
              value={essentialService}
              onChange={(value) => {
                if (isEssentialService(value)) setEssentialService(value);
              }}
              options={[
                { value: "photo", label: "Photography" },
                { value: "video", label: "Film / Video" },
              ]}
            />
          </Field>
        )}
      </div>

      <div hidden={step !== 1} style={{ display: step !== 1 ? "none" : undefined }} className="mt-8">
        <Field label="Anything you'd like me to know?" error={errors.notes} className="sm:col-span-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder="Venue or city, theme, timeline — anything you know so far."
          />
        </Field>
      </div>

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
        <strong className="text-ink-soft">No payment now.</strong> I&apos;ll confirm
        your date is open and send a secure link to place your{" "}
        {selectedCollection.depositLabel} {selectedCollection.name} deposit — it
        applies to your final balance. By requesting, you agree to be contacted
        about your event. See our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink">privacy policy</a>.
      </p>

      {formError ? <p role="alert" className="mt-6 text-sm text-wine">{formError}</p> : null}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
        {step > 0 ? (
          <button type="button" onClick={() => { setStep((step - 1) as Step); setFormError(null); }} className="min-h-11 rounded-lg px-4 text-sm font-semibold text-ink hover:bg-greige">Back</button>
        ) : <span />}
        {step < 3 ? (
          <button type="button" onClick={nextStep} className="min-h-11 rounded-lg bg-ink px-6 text-sm font-semibold text-white hover:bg-ink-soft">Continue</button>
        ) : (
          <button type="submit" disabled={busy} className="min-h-11 rounded-lg bg-wine px-6 text-sm font-semibold text-white hover:bg-wine-deep disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "Sending request…" : "Request her date"}
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
        {required ? <span className="text-wine"> *</span> : null}
        {hint ? <span className="ml-2 text-xs font-normal text-ink-faint">{hint}</span> : null}
      </span>
      {children}
      {error?.length ? <span className="text-xs text-wine">{error[0]}</span> : null}
    </label>
  );
}
