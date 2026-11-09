"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { UploadQueue, type QueueItem } from "@/app/admin/photos/upload-queue";
import { REVIEW_BODY_MAX, type ReviewLang } from "@/lib/review";
import { REVIEW_COPY, type ReviewErrorKey } from "./review-copy";
import { useShell } from "@/components/txq/SiteShell";
import "@/components/txq/pages/pages.css";
import "@/components/plan/plan.css";
import "./review.css";

type Field = "rating" | "body" | "display_name" | "consent_publish" | "consent_photos" | "photos";

/**
 * The mom's one-time review form. Photos upload one at a time as soon as she
 * picks them (each is shrunk and stripped of location data in the browser
 * first), so "Send" only sends text plus the saved photo keys.
 */
export function ReviewForm({
  slug,
  lang: initialLang,
  firstName,
  defaultSignature,
  defaultDaughter,
}: {
  slug: string;
  lang: ReviewLang;
  firstName: string;
  defaultSignature: string;
  defaultDaughter: string;
}) {
  const [lang, setLang] = useState<ReviewLang>(initialLang);
  const t = REVIEW_COPY[lang];
  const [rating, setRating] = useState(0);
  const [items, setItems] = useState<QueueItem[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Field[]>([]);
  const [formError, setFormError] = useState<ReviewErrorKey | "waitPhotos" | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const paths = useRef(new Map<string, string>());
  const queue = useRef<UploadQueue | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;
  const { setDockHidden } = useShell();

  // The booking dock ("Reserve your date") has no place on a client's review form.
  useEffect(() => {
    setDockHidden(true);
    return () => setDockHidden(false);
  }, [setDockHidden]);

  useEffect(() => {
    const q = new UploadQueue(setItems, 1);
    q.start(async (photo, _name, signal, progress) => {
      // The queue item id isn't passed to the transport; match by blob instead.
      const res = await fetch(`/api/reviews/${slug}/photo`, { method: "POST", body: photo.blob, signal });
      progress(100);
      const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
      if (!res.ok || !data.path) throw new Error(data.error ?? "upload");
      const item = q.items.find((i) => i.prepared?.blob === photo.blob);
      if (item) paths.current.set(item.id, data.path);
    });
    queue.current = q;
    return () => q.dispose();
  }, [slug]);

  const uploading = items.some((i) => i.state !== "done" && i.state !== "failed");
  const failed = items.some((i) => i.state === "failed");

  function pick(files: FileList | null) {
    if (!files?.length || !queue.current) return;
    queue.current.add([...files]);
    if (fileInput.current) fileInput.current.value = "";
  }

  function remove(id: string) {
    paths.current.delete(id);
    queue.current?.remove(id);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const photos = items.filter((i) => i.state === "done").map((i) => paths.current.get(i.id)).filter((p): p is string => !!p);
    const payload = {
      rating,
      body: String(fd.get("body") ?? "").trim(),
      display_name: String(fd.get("display_name") ?? "").trim(),
      daughter_name: String(fd.get("daughter_name") ?? "").trim(),
      city: String(fd.get("city") ?? "").trim(),
      language: lang,
      photos,
      consent_publish: fd.get("consent_publish") === "on",
      consent_photos: fd.get("consent_photos") === "on",
    };

    const bad: Field[] = [];
    if (!payload.rating) bad.push("rating");
    if (payload.body.length < 10) bad.push("body");
    if (!payload.display_name) bad.push("display_name");
    if (!payload.consent_publish) bad.push("consent_publish");
    if (photos.length && !payload.consent_photos) bad.push("consent_photos");
    if (failed) bad.push("photos");
    setFieldErrors(bad);
    if (bad.length) {
      setFormError(null);
      document.getElementById(fid(bad[0]))?.focus();
      return;
    }
    if (uploading) {
      setFormError("waitPhotos");
      return;
    }

    setBusy(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/reviews/${slug}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: string[] };
      if (!res.ok) {
        const fields = (data.fields ?? []).filter((f): f is Field => f in t.errors) as Field[];
        setFieldErrors(fields);
        setFormError(data.error && data.error in t.errors ? (data.error as ReviewErrorKey) : fields.length ? null : "generic");
        if (data.error === "used") setDone(true);
        setBusy(false);
        return;
      }
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch {
      setFormError("network");
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="tq-wrap qp-intake rv" lang={lang}>
        <header className="qp-intake__head" role="status">
          <p className="tq-mono qp-eyebrow">[{t.eyebrow}]</p>
          <h1 className="tq-display qp-intake__title">{t.doneTitle}</h1>
          <p className="qp-intake__intro">{t.doneBody}</p>
          <p>
            <Link href={lang === "es" ? "/es" : "/portfolio"} className="tq-btn tq-btn--lg tq-btn--ghost">
              {t.doneLink} <span className="tq-arrow" aria-hidden>↗</span>
            </Link>
          </p>
        </header>
      </div>
    );
  }

  const invalid = (f: Field) => fieldErrors.includes(f);
  const err = (f: Field) =>
    invalid(f) ? (
      <p id={`${fid(f)}-err`} className="tq-error">
        {t.errors[f]}
      </p>
    ) : null;
  const aria = (f: Field) => ({ "aria-invalid": invalid(f) || undefined, "aria-describedby": invalid(f) ? `${fid(f)}-err` : undefined });
  const stateLabel = (i: QueueItem) =>
    i.state === "done" ? t.uploaded : i.state === "failed" ? t.failed : i.state === "preparing" || i.state === "waiting" ? t.preparing : t.uploading;

  return (
    <div className="tq-wrap qp-intake rv" lang={lang}>
      <header className="qp-intake__head">
        <p className="tq-mono qp-eyebrow">[{t.eyebrow}]</p>
        <h1 className="tq-display qp-intake__title">{firstName ? t.hello(firstName) : t.helloNoName}</h1>
        <p className="qp-intake__intro">{t.intro}</p>
        <p className="tq-mono tq-muted rv-private">{t.private}</p>
      </header>

      <form onSubmit={onSubmit} noValidate className="tq-pg-form qp-form">
        <fieldset className="tq-field qp-lang">
          <legend className="tq-mono tq-legend">{t.language}</legend>
          <div className="tq-pills">
            {(["es", "en"] as const).map((l) => (
              <label key={l} className="tq-pill" lang={l}>
                <input type="radio" name="language" value={l} checked={lang === l} onChange={() => setLang(l)} />
                {l === "es" ? "Español" : "English"}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="tq-field" {...aria("rating")}>
          <legend className="tq-mono tq-legend">
            {t.rating} <span aria-hidden>*</span>
          </legend>
          <div className="rv-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="rv-star" data-on={n <= rating || undefined}>
                <input
                  id={n === 1 ? fid("rating") : undefined}
                  type="radio"
                  name="rating"
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                />
                <svg viewBox="0 0 20 20" aria-hidden>
                  <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78-4.21-4.1 5.82-.85L10 1.5z" />
                </svg>
                <span className="sr-only">{t.stars(n)}</span>
              </label>
            ))}
          </div>
          {err("rating")}
        </fieldset>

        <div className="tq-field">
          <label htmlFor={fid("body")} className="tq-mono">
            {t.body} <span aria-hidden>*</span>
          </label>
          <textarea id={fid("body")} name="body" required rows={6} maxLength={REVIEW_BODY_MAX} placeholder={t.bodyPlaceholder} className="tq-input" {...aria("body")} />
          {err("body")}
        </div>

        <div className="qp-row">
          <div className="tq-field">
            <label htmlFor={fid("display_name")} className="tq-mono">
              {t.name} <span aria-hidden>*</span>
            </label>
            <input id={fid("display_name")} name="display_name" type="text" required maxLength={80} defaultValue={defaultSignature} autoComplete="off" className="tq-input" {...aria("display_name")} aria-describedby={`${fid("display_name")}-hint${invalid("display_name") ? ` ${fid("display_name")}-err` : ""}`} />
            <p id={`${fid("display_name")}-hint`} className="tq-hint">{t.nameHint}</p>
            {err("display_name")}
          </div>
          <div className="tq-field">
            <label htmlFor={fid("daughter_name")} className="tq-mono">
              {t.daughter} <span className="tq-muted">— {t.optional}</span>
            </label>
            <input id={fid("daughter_name")} name="daughter_name" type="text" maxLength={80} defaultValue={defaultDaughter} autoComplete="off" className="tq-input" />
          </div>
        </div>

        <div className="tq-field">
          <label htmlFor={fid("city")} className="tq-mono">
            {t.city} <span className="tq-muted">— {t.optional}</span>
          </label>
          <input id={fid("city")} name="city" type="text" maxLength={80} autoComplete="address-level2" placeholder={t.cityPlaceholder} className="tq-input" />
        </div>

        <fieldset className="tq-field" aria-describedby={`${fid("photos")}-hint`}>
          <legend className="tq-mono tq-legend">
            {t.photos} <span className="tq-muted">— {t.optional}</span>
          </legend>
          <p id={`${fid("photos")}-hint`} className="tq-hint qp-hint-top">{t.photosHint}</p>
          {items.length ? (
            <ul className="rv-photos">
              {items.map((i) => (
                <li key={i.id} className="rv-photo" data-state={i.state}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                  <img src={i.preview} alt="" />
                  <span className="rv-photo__state tq-mono">{stateLabel(i)}</span>
                  <span className="rv-photo__actions">
                    {i.state === "failed" ? (
                      <button type="button" className="rv-photo__btn" onClick={() => queue.current?.retry(i.id)}>
                        {t.retry}
                      </button>
                    ) : null}
                    <button type="button" className="rv-photo__btn rv-photo__x" aria-label={t.remove(i.name)} onClick={() => remove(i.id)}>
                      <svg viewBox="0 0 16 16" aria-hidden>
                        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <label className="tq-btn tq-btn--lg tq-btn--ghost rv-add">
            <input id={fid("photos")} ref={fileInput} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => pick(e.target.files)} />
            {items.length ? t.addMore : t.addPhotos} <span aria-hidden>+</span>
          </label>
          {err("photos")}
        </fieldset>

        <div className="rv-consents">
          <label className="rv-check">
            <input id={fid("consent_publish")} type="checkbox" name="consent_publish" {...aria("consent_publish")} />
            <span>{t.consentPublish}</span>
          </label>
          {err("consent_publish")}
          {items.length ? (
            <>
              <label className="rv-check">
                <input id={fid("consent_photos")} type="checkbox" name="consent_photos" {...aria("consent_photos")} />
                <span>{t.consentPhotos}</span>
              </label>
              {err("consent_photos")}
            </>
          ) : null}
        </div>

        <div className="qp-submit">
          {formError ? (
            <p role="alert" className="tq-pg-form__alert">
              {formError === "waitPhotos" ? t.waitPhotos : t.errors[formError]}
            </p>
          ) : null}
          <button type="submit" disabled={busy} aria-busy={busy || undefined} className="tq-btn tq-btn--lg tq-btn--block">
            {busy ? (
              <>
                <span className="tq-pg-spinner" aria-hidden />
                {t.sending}
              </>
            ) : (
              <>
                {t.submit} <span className="tq-arrow" aria-hidden>→</span>
              </>
            )}
          </button>
          <p className="tq-pg-form__fine">{t.fine}</p>
        </div>
      </form>
    </div>
  );
}
