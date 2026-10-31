import type { Metadata } from "next";
import Link from "next/link";
import { HideDock } from "@/components/plan/HideDock";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/plan/PrintButton";
import { PLAN_COPY } from "@/content/plan-copy";
import { site } from "@/content/site";
import { getPlanBySlug } from "@/lib/plan-db";
import { isPlanSlug } from "@/lib/plan-slug";
import { planPath, timelinePath, todayInDallas, type PlanLang } from "@/lib/plan";
import { buildQuinceTimeline } from "@/lib/plan-timeline";
import { languageAlternates } from "@/lib/hreflang";
import type { PlanParams } from "@/components/plan/PlanPage";
import "./plan.css";

export async function timelineMetadata(params: PlanParams, lang: PlanLang): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: PLAN_COPY[lang].timeline.metaTitle,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
    alternates: isPlanSlug(slug) ? { languages: languageAlternates(timelinePath(slug, "en"), timelinePath(slug, "es")) } : undefined,
  };
}

/**
 * The free quince-day timeline for a plan's date: a printable page (the
 * browser's "Save as PDF" makes the download). A page rather than a PDF file
 * because Facebook's in-app browser can't reliably download files, but it
 * can show, share and print a page.
 */
export async function TimelinePage({ params, lang }: { params: PlanParams; lang: PlanLang }) {
  const { slug } = await params;
  if (!isPlanSlug(slug)) notFound();
  const plan = await getPlanBySlug(slug);
  if (!plan) notFound();
  const t = PLAN_COPY[lang].timeline;
  const tl = buildQuinceTimeline(plan.event_date, lang, todayInDallas());

  return (
    <div className="tq-wrap qp-page qp-tl">
      <HideDock />
      <header className="qp-head">
        <p className="tq-mono qp-eyebrow">[{t.eyebrow} / {site.brand}]</p>
        <h1 className="tq-display qp-title">{t.title}</h1>
        <p className="qp-tl__date">{tl.dateLabel}</p>
        {tl.sunset ? (
          <p className="qp-tl__sunset">
            <span className="tq-mono">{t.sunset}</span> {tl.sunset}
          </p>
        ) : null}
        <div className="qp-tl__actions qp-noprint">
          <PrintButton label={t.print} />
          <Link href={planPath(plan.slug, lang)} className="qp-link">
            ← {t.back}
          </Link>
        </div>
      </header>

      <section className="qp-section" aria-labelledby="qp-day">
        <h2 id="qp-day" className="tq-display qp-h2">{t.dayTitle}</h2>
        <p className="qp-muted">{t.dayNote}</p>
        <ol className="qp-tl__list">
          {tl.day.map((r) => (
            <li key={`${r.minutes}-${r.title}`}>
              <span className="qp-tl__time tq-nums">{r.time}</span>
              <span className="qp-tl__body">
                <strong>{r.title}</strong>
                {r.note ? <span>{r.note}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="qp-section" aria-labelledby="qp-check">
        <h2 id="qp-check" className="tq-display qp-h2">{t.checklistTitle}</h2>
        <ol className="qp-tl__list qp-tl__check">
          {tl.checklist.map((c) => (
            <li key={c.title} data-overdue={c.overdue || undefined}>
              <span className="qp-tl__time">{c.overdue ? c.by : `${t.by} ${c.by}`}</span>
              <span className="qp-tl__body">
                <strong>{c.title}</strong>
                <span>{c.note}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="tq-mono qp-share">
          {site.brand} · {site.contact.phone} · {site.domain}
        </p>
      </section>
    </div>
  );
}
