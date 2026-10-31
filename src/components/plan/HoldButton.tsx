"use client";

import { useState } from "react";
import { trackEvent } from "@/components/Tracker";
import type { PlanLang } from "@/lib/plan";

type Copy = { opening: string; error: string; taken: string; notLive: string; yours: string };

/**
 * "Hold my date" — asks the server to open Stripe Checkout for this plan and
 * goes there. Sends only the slug and the page language; the server prices
 * the deposit and claims the date.
 */
export function HoldButton({ slug, lang, label, copy }: { slug: string; lang: PlanLang; label: string; copy: Copy }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function hold() {
    setBusy(true);
    setError(null);
    trackEvent("plan_hold_clicked", slug);
    try {
      const res = await fetch(`/api/plan/${slug}/hold`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(
        data.error === "taken" ? copy.taken
        : data.error === "notLive" ? copy.notLive
        : data.error === "yours" ? copy.yours
        : copy.error,
      );
      if (data.error === "taken" || data.error === "yours") window.setTimeout(() => window.location.reload(), 2500);
    } catch {
      setError(copy.error);
    }
    setBusy(false);
  }

  return (
    <div className="qp-hold">
      <button type="button" onClick={hold} disabled={busy} aria-busy={busy || undefined} className="tq-btn tq-btn--lg tq-btn--block qp-cta">
        {busy ? (
          <>
            <span className="tq-pg-spinner" aria-hidden />
            {copy.opening}
          </>
        ) : (
          <>
            {label} <span className="tq-arrow" aria-hidden>→</span>
          </>
        )}
      </button>
      {error ? (
        <p role="alert" className="tq-pg-form__alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
