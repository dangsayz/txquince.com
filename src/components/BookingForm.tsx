"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { bookingSchema, HONEYPOT_FIELD } from "@/lib/booking";
import { packages, type CollectionId } from "@/content/packages";
import { trackBookingStarted } from "@/lib/analytics";
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
  "w-full border-b border-line bg-transparent px-0 py-3 text-ink placeholder:text-ink-faint/70 transition-colors focus:border-wine focus:outline-none";
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

export function BookingForm({
  defaultCollection,
}: {
  defaultCollection?: CollectionId;
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
  // what they typed. defaultCollection only wins if there's no saved draft.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<Draft>;
        if (d.name) setName(d.name);
        if (d.email) setEmail(d.email);
        if (d.phone) setPhone(d.phone);
        if (d.eventDate) setEventDate(d.eventDate);
        if (d.collection) setCollection(d.collection);
        if (d.essentialService) setEssentialService(d.essentialService);
        if (d.notes) setNotes(d.notes);
      }
    } catch {
      /* ignore */
    }
    restored.current = true;
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
      <div className="rounded-[1.5rem] border border-line bg-ivory p-8 text-center md:p-10">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream ring-1 ring-line">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
            <path d="M1 8.5L7 14.5L19 1.5" stroke="var(--color-wine)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 font-display text-2xl text-ink">Your date request is in.</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      {/* Honeypot */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={HONEYPOT_FIELD}>Do not fill this in</label>
        <input ref={honeypotRef} id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Your name" required error={errors.name}>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" autoComplete="name" className={inputBase} placeholder="First and last" />
        </Field>
        <Field label="Email" required error={errors.email}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className={inputBase} placeholder="you@email.com" />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" className={inputBase} placeholder="(optional)" />
        </Field>
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
                <a href="/check-your-date" className="underline hover:text-wine-deep">join the waitlist</a>.
              </span>
            ) : dateOpen ? (
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-green-700">
                <span aria-hidden>●</span>
                Open — I only book one celebration a day, so request it before it&apos;s claimed.
              </span>
            ) : null}
          </span>
        </Field>

        <Field
          label="Which collection?"
          required
          error={errors.collection}
          hint="Applies to your final balance"
          className={collection === "essential" ? "" : "sm:col-span-2"}
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

        {collection === "essential" && (
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

      <p className="text-xs leading-relaxed text-ink-faint">
        <strong className="text-ink-soft">No payment now.</strong> I&apos;ll confirm
        your date is open and send a secure link to place your{" "}
        {selectedCollection.depositLabel} {selectedCollection.name} deposit — it
        applies to your final balance. By requesting, you agree to be contacted
        about your event. See our{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-ink">privacy policy</a>.
      </p>

      {formError ? (
        <p role="alert" className="text-sm text-wine">{formError}</p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-3 self-start rounded-full bg-ink px-8 py-4 text-[0.95rem] font-medium text-cream transition-all duration-300 hover:bg-[#3c2a1b] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-cream/40 border-t-cream" aria-hidden />
            Sending request…
          </>
        ) : (
          "Reserve my date"
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
