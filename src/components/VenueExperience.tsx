"use client";

/**
 * "Our experience at this venue and its staff" — the owner's own account of
 * working at a venue, shown on the venue page and on each post about it.
 *
 * Visitors see it only once it is written. The owner (logged in to Studio)
 * sees an empty spot with a button, and writes or edits it right here; the
 * server checks the Studio session again on every save.
 */
import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/components/EditMode";
import { SHARE_ICONS } from "@/components/ShareModal";
import { trackEvent } from "@/components/Tracker";
import { EXPERIENCE_MAX, VERDICTS, experienceText, paragraphs, type VenueExperience as Experience, type Verdict } from "@/lib/venue-experience";
import "./venue-experience.css";

type Lang = "en" | "es";

const COPY = {
  en: {
    kicker: "From behind the camera",
    title: (v: string) => `Our experience at ${v} and its staff`,
    verdict: { great: "We love working here", mixed: "Good, with a few things to know", poor: "A hard place to work" } as Record<Verdict, string>,
    by: "TX Quince",
    updated: "Updated",
    fair: "This is our own experience as the photo and video team. Yours may differ.",
    share: "Share this",
    copy: "Copy link",
    copied: "Link copied",
  },
  es: {
    kicker: "Desde detrás de la cámara",
    title: (v: string) => `Nuestra experiencia en ${v} y con su personal`,
    verdict: { great: "Nos encanta trabajar aquí", mixed: "Bien, con algunos detalles que conviene saber", poor: "Un lugar difícil para trabajar" } as Record<Verdict, string>,
    by: "TX Quince",
    updated: "Actualizado",
    fair: "Es nuestra propia experiencia como equipo de foto y video. La suya puede ser distinta.",
    share: "Compartir",
    copy: "Copiar enlace",
    copied: "Enlace copiado",
  },
} as const;

function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "es" ? "es-MX" : "en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/Chicago" }).format(d);
}

export function VenueExperience({
  venue,
  lang = "en",
  initial,
  shareUrl,
  headingLevel = "h2",
}: {
  venue: { slug: string; name: string };
  lang?: Lang;
  initial: Experience | null;
  /** Absolute address of this venue's share page (/venues/<slug>/experience). */
  shareUrl?: string;
  headingLevel?: "h1" | "h2";
}) {
  const c = COPY[lang];
  const admin = useIsAdmin();
  const router = useRouter();
  const id = useId();
  const [saved, setSaved] = useState<Experience | null>(initial);
  const [editing, setEditing] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(initial?.verdict ?? null);
  const [en, setEn] = useState(initial?.body_en ?? "");
  const [es, setEs] = useState(initial?.body_es ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | undefined>(undefined);
  const Heading = headingLevel;

  if (!saved && !admin) return null;

  // Each channel gets its own ?src= tag, so a visit from the post is counted.
  const tagged = (src: "facebook" | "whatsapp") => (shareUrl ? `${shareUrl}?src=${src}` : "");
  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackEvent("share", "venue-experience:copy");
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt(c.copy, shareUrl);
    }
  }

  function startEdit() {
    setVerdict(saved?.verdict ?? null);
    setEn(saved?.body_en ?? "");
    setEs(saved?.body_es ?? "");
    setError(null);
    setEditing(true);
  }

  async function call(method: "PUT" | "DELETE", body: unknown): Promise<{ experience?: Experience } | null> {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/venue-experience", {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const data = ((await res?.json().catch(() => ({}))) ?? {}) as { error?: string; experience?: Experience };
    setBusy(false);
    if (!res?.ok) {
      setError(data.error ?? "Could not save. Try again.");
      return null;
    }
    return data;
  }

  async function save() {
    const data = await call("PUT", { slug: venue.slug, verdict, body_en: en, body_es: es });
    if (!data?.experience) return;
    setSaved(data.experience);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Remove your experience at ${venue.name} from the site? The text is deleted.`)) return;
    if (!(await call("DELETE", { slug: venue.slug }))) return;
    setSaved(null);
    setEditing(false);
    router.refresh();
  }

  const shown = saved ? experienceText(saved, lang) : null;

  return (
    <section className="tq-vx" aria-labelledby={`${id}-t`} data-verdict={saved?.verdict ?? undefined}>
      <header className="tq-vx__head">
        <p className="tq-mono tq-vx__kicker">{c.kicker}</p>
        <Heading id={`${id}-t`} className="tq-display tq-vx__title">
          {c.title(venue.name)}
        </Heading>
        {saved?.verdict && !editing ? (
          <p className="tq-vx__verdict">
            <span className="tq-vx__dot" aria-hidden />
            {c.verdict[saved.verdict]}
          </p>
        ) : null}
      </header>

      {editing ? (
        <form
          className="tq-vx__form"
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <p className="tq-vx__owner">Only you see this editor. Write what happened and how it felt, in your own words.</p>
          <fieldset className="tq-vx__verdicts">
            <legend>In one line (optional)</legend>
            <label>
              <input type="radio" name={`${id}-v`} checked={verdict === null} onChange={() => setVerdict(null)} />
              <span>No label</span>
            </label>
            {VERDICTS.map((v) => (
              <label key={v}>
                <input type="radio" name={`${id}-v`} checked={verdict === v} onChange={() => setVerdict(v)} />
                <span>{COPY.en.verdict[v]}</span>
              </label>
            ))}
          </fieldset>
          <label className="tq-vx__field">
            <span>Your experience (English)</span>
            <textarea value={en} onChange={(e) => setEn(e.target.value)} rows={8} maxLength={EXPERIENCE_MAX} required placeholder="The staff, the rules, load-in, lighting, timing. Leave an empty line between paragraphs." />
          </label>
          <label className="tq-vx__field">
            <span>Spanish version (optional)</span>
            <textarea value={es} onChange={(e) => setEs(e.target.value)} rows={5} maxLength={EXPERIENCE_MAX} placeholder="Leave empty to show the English text on Spanish pages." />
          </label>
          {error ? (
            <p role="alert" className="tq-vx__error">
              {error}
            </p>
          ) : null}
          <div className="tq-vx__actions">
            <button type="submit" className="tq-vx__btn tq-vx__btn--primary" disabled={busy || !en.trim()}>
              {busy ? "Saving…" : "Save and publish"}
            </button>
            <button type="button" className="tq-vx__btn" disabled={busy} onClick={() => setEditing(false)}>
              Cancel
            </button>
            {saved ? (
              <button type="button" className="tq-vx__link" disabled={busy} onClick={remove}>
                Remove from the site
              </button>
            ) : null}
          </div>
        </form>
      ) : shown && saved ? (
        <>
          <div className="tq-vx__body" lang={shown.lang}>
            {paragraphs(shown.text).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <p className="tq-vx__foot">
            <span className="tq-mono">
              {c.by} · {c.updated} <time dateTime={saved.updated_at}>{formatDate(saved.updated_at, lang)}</time>
            </span>
            <span>{c.fair}</span>
          </p>
          {shareUrl ? (
            <div className="tq-vx__share" role="group" aria-label={c.share}>
              <span className="tq-mono tq-vx__kicker">{c.share}</span>
              <a
                className="tq-vx__btn tq-vx__btn--primary tq-vx__sharebtn"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tagged("facebook"))}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("share", "venue-experience:facebook")}
              >
                <span className="tq-vx__icon" aria-hidden>
                  {SHARE_ICONS.facebook}
                </span>
                Facebook
              </a>
              <a
                className="tq-vx__btn tq-vx__sharebtn"
                href={`https://wa.me/?text=${encodeURIComponent(`${c.title(venue.name)} ${tagged("whatsapp")}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("share", "venue-experience:whatsapp")}
              >
                <span className="tq-vx__icon" aria-hidden>
                  {SHARE_ICONS.whatsapp}
                </span>
                WhatsApp
              </a>
              <button type="button" className="tq-vx__btn tq-vx__sharebtn" onClick={copyLink}>
                <span role="status">{copied ? c.copied : c.copy}</span>
              </button>
            </div>
          ) : null}
          {admin ? (
            <button type="button" className="tq-vx__btn" onClick={startEdit}>
              Edit our experience
            </button>
          ) : null}
        </>
      ) : (
        <div className="tq-vx__empty">
          <p>
            <strong>Not written yet.</strong> Only you see this spot. Visitors see nothing here until you publish.
          </p>
          <button type="button" className="tq-vx__btn tq-vx__btn--primary" onClick={startEdit}>
            Write our experience
          </button>
        </div>
      )}
    </section>
  );
}
