"use client";

import { useId, useState } from "react";

export type SupportCopy = {
  topic: string;
  topics: { booking: string; payment: string; contract: string; other: string };
  phone: string;
  phoneHint: string;
  message: string;
  messageHint: string;
  send: string;
  sending: string;
  sent: string;
  error: string;
  tooShort: string;
};

/** "Send us a message": a support ticket the owner gets by email (POST /api/account/support). */
export function SupportForm({ lang, bookingId, copy }: { lang: "en" | "es"; bookingId: string | null; copy: SupportCopy }) {
  const [topic, setTopic] = useState(bookingId ? "booking" : "other");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const ids = { topic: useId(), phone: useId(), phoneHint: useId(), msg: useId(), msgHint: useId(), err: useId() };

  if (state === "sent") {
    return (
      <p role="status" className="acct__lead" style={{ color: "var(--tq-ink)" }}>
        {copy.sent}
      </p>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) return setError(copy.tooShort);
    setState("busy");
    setError(null);
    try {
      const res = await fetch("/api/account/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, phone: phone.trim() || undefined, message: message.trim(), bookingId: bookingId ?? undefined, lang }),
      });
      if (res.ok) return setState("sent");
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error || copy.error);
    } catch {
      setError(copy.error);
    }
    setState("idle");
  };

  return (
    <form className="acct-form" onSubmit={submit} noValidate>
      <div className="tq-field">
        <label htmlFor={ids.topic} className="tq-mono">{copy.topic}</label>
        <select id={ids.topic} className="tq-input" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={state === "busy"}>
          <option value="booking">{copy.topics.booking}</option>
          <option value="payment">{copy.topics.payment}</option>
          <option value="contract">{copy.topics.contract}</option>
          <option value="other">{copy.topics.other}</option>
        </select>
      </div>
      <div className="tq-field">
        <label htmlFor={ids.msg} className="tq-mono">{copy.message}</label>
        <textarea
          id={ids.msg}
          className="tq-input"
          rows={4}
          maxLength={4000}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby={`${ids.msgHint}${error ? ` ${ids.err}` : ""}`}
          aria-invalid={error ? true : undefined}
          disabled={state === "busy"}
        />
        <p id={ids.msgHint} className="tq-hint" style={{ margin: 0 }}>{copy.messageHint}</p>
      </div>
      <div className="tq-field">
        <label htmlFor={ids.phone} className="tq-mono">{copy.phone}</label>
        <input
          id={ids.phone}
          className="tq-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={40}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-describedby={ids.phoneHint}
          disabled={state === "busy"}
        />
        <p id={ids.phoneHint} className="tq-hint" style={{ margin: 0 }}>{copy.phoneHint}</p>
      </div>
      {error && <p id={ids.err} className="tq-error" role="alert">{error}</p>}
      <button type="submit" className="tq-btn tq-btn--lg" disabled={state === "busy"}>
        {state === "busy" ? copy.sending : copy.send}
      </button>
    </form>
  );
}
