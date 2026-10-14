"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignaturePad } from "@/components/txq/SignaturePad";
import { JOURNEY_COPY } from "./copy";

/**
 * Step 1: ESIGN consent + typed full name + finger signature → /api/my/sign.
 * The server re-checks everything (token, state, consent version, signature).
 */
export function SignPanel({
  token,
  lang,
  consentText,
  consentVersion,
  defaultName,
}: {
  token: string;
  lang: "en" | "es";
  consentText: string;
  consentVersion: string;
  defaultName: string;
}) {
  const copy = JOURNEY_COPY[lang];
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [signature, setSignature] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; signature?: string; consent?: string; form?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = copy.signErrors.name;
    if (!signature) next.signature = copy.signErrors.signature;
    if (!consent) next.consent = copy.signErrors.consent;
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/my/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signedName: name.trim(), signature, consent: true, consentVersion }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; code?: string };
      if (!res.ok || !j.ok) {
        if (j.code === "already_signed") return router.refresh();
        setErrors({ form: j.error || copy.signErrors.failed });
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setErrors({ form: copy.signErrors.failed });
      setBusy(false);
    }
  };

  return (
    <form className="tq-jr-sign" onSubmit={submit} noValidate>
      <div className="tq-jr-consent">
        {consentText.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <label className="tq-check">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (e.target.checked) setErrors((x) => ({ ...x, consent: undefined }));
          }}
          aria-describedby={errors.consent ? "err-consent" : undefined}
        />
        <span className="tq-check__box" aria-hidden>
          {consent ? "✓" : ""}
        </span>
        <span>{copy.consentLabel}</span>
      </label>
      {errors.consent && (
        <p id="err-consent" className="tq-error" role="alert">
          {errors.consent}
        </p>
      )}
      <div className="tq-field">
        <label className="tq-mono" htmlFor="jr-name">
          {copy.typedName}
        </label>
        <input
          id="jr-name"
          className="tq-input"
          autoComplete="name"
          value={name}
          maxLength={120}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "err-name" : undefined}
        />
        {errors.name && (
          <p id="err-name" className="tq-error" role="alert">
            {errors.name}
          </p>
        )}
      </div>
      <SignaturePad
        value={signature}
        onChange={(png) => {
          setSignature(png);
          if (png) setErrors((x) => ({ ...x, signature: undefined }));
        }}
        label={copy.signHere}
        clearLabel={copy.clear}
        typedName={name}
        useTypedLabel={copy.useTyped}
        error={errors.signature}
      />
      {errors.form && (
        <p className="tq-pg-form__alert" role="alert">
          {errors.form}
        </p>
      )}
      <button type="submit" className="tq-btn tq-btn--lg tq-btn--block" disabled={busy}>
        {busy ? copy.signing : copy.signBtn}
      </button>
    </form>
  );
}
