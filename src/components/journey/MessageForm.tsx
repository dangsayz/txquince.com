"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JourneyCopy } from "./copy";

const KINDS = ["message", "change_date", "change_time", "change_package", "cancel"] as const;

/** A question or a change / cancel request. Only a message — nothing changes on its own. */
export function MessageForm({ token, copy }: { token: string; copy: JourneyCopy }) {
  const router = useRouter();
  const [kind, setKind] = useState<(typeof KINDS)[number]>("message");
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setState("busy");
    try {
      const res = await fetch("/api/my/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, kind, body: body.trim() }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(j.error || copy.messageError);
        setState("error");
        return;
      }
      setBody("");
      setState("sent");
      router.refresh();
    } catch {
      setError(copy.messageError);
      setState("error");
    }
  };

  return (
    <form className="tq-jr-form" onSubmit={send}>
      <div className="tq-field">
        <label className="tq-mono" htmlFor="jr-kind">
          {copy.kindLabel}
        </label>
        <select id="jr-kind" className="tq-input tq-pg-select" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {copy.kinds[k]}
            </option>
          ))}
        </select>
      </div>
      <div className="tq-field">
        <label className="tq-mono" htmlFor="jr-body">
          {copy.messageLabel}
        </label>
        <textarea
          id="jr-body"
          className="tq-input"
          value={body}
          maxLength={4000}
          rows={4}
          onChange={(e) => {
            setBody(e.target.value);
            if (state !== "busy") setState("idle");
          }}
          required
        />
      </div>
      <div className="tq-pg-actions">
        <button type="submit" className="tq-btn tq-btn--lg" disabled={state === "busy" || !body.trim()}>
          {state === "busy" ? copy.sending : copy.send}
        </button>
      </div>
      {state === "sent" && <p role="status">{copy.sent}</p>}
      {state === "error" && (
        <p className="tq-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
