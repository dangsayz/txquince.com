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

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
// Locked to production hostnames, so it errors on localhost (110200). Only
// render in production; local dev skips the bot check (secret on the Worker).
const SHOW_TURNSTILE =
  Boolean(SITE_KEY) && process.env.NODE_ENV === "production";

const DRAFT_KEY = "txq_reserve_draft";

const inputBase =
  "min-h-12 w-full rounded-md border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-ink-faint transition-colors focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15";
const labelBase =
  "block text-base font-medium text-ink";

type Draft = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  collection: CollectionId;
  essentialService: "photo" | "video";
  notes: string;
};

export function BookingForm({
  defaultCollection,
  defaultDate,
}: {
  defaultCollection?: CollectionId;
  /** Prefill from ?date= (e.g. the homepage date-checker). Wins over a saved draft. */
  defaultDate?: string;
} = {}) {
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
  const restored = useRef(false);

  // Restore any saved draft on mount, so pressing back / reloading never loses
  // what they typed. An explicit collection from a pricing link wins over a saved draft.
  useEffect(() => {
    let active = true;
    let draft: Partial<Draft> = {};
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) draft = JSON.parse(raw) as Partial<Draft>;
    } catch {
      /* ignore */
    }
    queueMicrotask(() => {
      if (!active) return;
      if (draft.name) setName(draft.name);
      if (draft.email) setEmail(draft.email);
      if (draft.phone) setPhone(draft.phone);
      if (!defaultCollection && draft.collection && packages.some((item) => item.id === draft.collection)) setCollection(draft.collection);
      if (draft.essentialService === "photo" || draft.essentialService === "video") setEssentialService(draft.essentialService);
      if (draft.notes) setNotes(draft.notes);
      // An explicit URL date takes precedence over a saved draft.
      const nextDate = defaultDate && /^\d{4}-\d{2}-\d{2}$/.test(defaultDate) ? defaultDate : draft.eventDate;
      if (nextDate && /^\d{4}-\d{2}-\d{2}$/.test(nextDate)) setEventDate(nextDate);
      restored.current = true;
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const { todayStr, maxStr } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const max = new Date(today.getFullYear() + 3, today.getMonth(), today.getDate());
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { todayStr: fmt(today), maxStr: fmt(max) };
  }, []);

  const dateOutOfRange = Boolean(eventDate && (eventDate < todayStr || eventDate > maxStr));
  const dateTaken = Boolean(eventDate && !dateOutOfRange && takenDates?.has(eventDate));
  const dateOpen = Boolean(eventDate && !dateOutOfRange && takenDates && !takenDates.has(eventDate));

  const selectedCollection =
    packages.find((p) => p.id === collection) ?? packages[1];
  const packageValue: "photo" | "video" | "both" =
    selectedCollection.singleCraft ? essentialService : "both";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      setErrors(parsed.error.flatten().fieldErrors);
      setFormError("Please check the highlighted fields.");
      setStatus("error");
      return;
    }

    if (takenDates?.has(parsed.data.event_date)) {
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
        if (data.fieldErrors) setErrors(data.fieldErrors);
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
      <div className="rounded-xl border border-line bg-white p-8 text-center md:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream ring-1 ring-line">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
            <path d="M1 8.5L7 14.5L19 1.5" stroke="var(--color-wine)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl text-ink">Your date request is in.</h3>
        <p className="mx-auto mt-3 max-w-md text-base leading-7 text-ink-soft">
          Thank you, {name.split(" ")[0] || "there"}. I&apos;ll personally confirm your
          date is open and reach out — usually within 24 hours — to talk through the
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
      className="flex flex-col gap-8"
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

      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <div className="border-t border-line pt-5 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">01 / Your details</p>
          <h3 className="mt-2 text-lg font-medium text-ink">How we can reach you</h3>
        </div>
        <Field label="Your name" required error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" className={inputBase} placeholder="First and last" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className={inputBase} placeholder="you@email.com" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" className={inputBase} placeholder="(optional)" />
        </Field>
        <div className="border-t border-line pt-5 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">02 / Her celebration</p>
          <h3 className="mt-2 text-lg font-medium text-ink">Date and coverage</h3>
        </div>
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
            {dateOutOfRange ? (
              <span className="mt-1.5 inline-flex text-xs text-red-700">
                Choose a date within the next three years.
              </span>
            ) : dateTaken ? (
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-red-700">
                <span aria-hidden>●</span>
                That date is already requested — pick another, or{" "}
                <a href="/check-your-date" className="underline hover:text-red-800">join the waitlist</a>.
              </span>
            ) : dateOpen ? (
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-green-700">
                <span aria-hidden>●</span>
                Our calendar currently shows this date as open. We will confirm before reserving it.
              </span>
            ) : null}
          </span>
        </Field>

        <Field
          label="Which collection?"
          required
          error={errors.collection}
          hint="Applies to your final balance"
          className={selectedCollection.singleCraft ? "" : "sm:col-span-2"}
        >
          <Select
            value={collection}
            onChange={(v) => setCollection(v as CollectionId)}
            options={packages.map((p) => ({
              value: p.id,
              label: `${p.name} · ${p.priceLabel}${p.highlight ? " — most popular" : ""}`,
            }))}
          />
        </Field>

        {selectedCollection.singleCraft && (
          <Field label="Photo or film?" required>
            <Select
              value={essentialService}
              onChange={(v) => setEssentialService(v as "photo" | "video")}
              options={[
                { value: "photo", label: "Photography" },
                { value: "video", label: "Film / Video" },
              ]}
            />
          </Field>
        )}

        <div className="grid gap-3 border-y border-line bg-ivory px-5 py-5 sm:col-span-2 sm:grid-cols-2">
          <div><p className="text-xs uppercase tracking-[0.14em] text-ink-soft">Selected collection</p><p className="mt-1 text-lg text-ink">{selectedCollection.name} · {selectedCollection.priceLabel}</p></div>
          <div><p className="text-xs uppercase tracking-[0.14em] text-ink-soft">After we confirm the date</p><p className="mt-1 text-lg text-ink">{selectedCollection.depositLabel} deposit</p></div>
        </div>
        <div className="border-t border-line pt-5 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-soft">03 / One more thing</p>
          <h3 className="mt-2 text-lg font-medium text-ink">Tell us what matters most</h3>
        </div>
        <Field label="Anything you'd like me to know?" error={errors.notes} className="sm:col-span-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className={`${inputBase} resize-none`}
            placeholder="Theme, venue, timeline — anything that helps me plan her day."
          />
        </Field>
      </div>

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
        No payment now — I&apos;ll confirm your date and send a secure deposit link,
        applied to your final balance. By requesting you agree to be contacted.{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink">Privacy</a>.
      </p>

      {formError ? (
        <p role="alert" className="text-sm text-red-700">{formError}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 bg-ink px-8 py-3 text-base font-medium text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {busy ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" aria-hidden />
            Sending request…
          </>
        ) : (
          "Send reservation request"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  /** Accepted for call-site clarity; not rendered (editorial labels stay clean). */
  required?: boolean;
  error?: string[];
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className={labelBase}>{label}</span>
      {children}
      {error?.length ? <span className="text-sm text-red-700">{error[0]}</span> : null}
    </label>
  );
}
