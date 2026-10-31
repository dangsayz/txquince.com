import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HideDock } from "@/components/plan/HideDock";
import { notFound } from "next/navigation";
import { ContactButtons } from "@/components/ContactButtons";
import { HoldButton } from "@/components/plan/HoldButton";
import { PLAN_COPY } from "@/content/plan-copy";
import { commissionLinks, commissionsFor } from "@/content/commissions";
import { site } from "@/content/site";
import { getPortfolioImages } from "@/lib/content-db";
import { getDateStatus, getPlanBySlug } from "@/lib/plan-db";
import { isPlanSlug } from "@/lib/plan-slug";
import { formatPlanDate, planPath, timelinePath, toPublicPlan, type PlanLang } from "@/lib/plan";
import { colorById, colorLabel, matchGallery } from "@/lib/quince-colors";
import { getPriceBook } from "@/lib/pricing";
import { languageAlternates } from "@/lib/hreflang";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { altPhraseFor } from "@/content/portfolio-taxonomy";
import { smsHref } from "@/lib/contact";
import "@/components/txq/pages/pages.css";
import "./plan.css";

/** The three event packages (the Portrait Session is a separate, smaller offer). */
const EVENT_TIERS = new Set(["cinema", "trio", "production"]);

export type PlanParams = Promise<{ slug: string }>;
export type PlanSearch = Promise<Record<string, string | string[] | undefined>>;

/** Private page: never indexed, never followed, nothing personal in the title. */
export async function planPageMetadata(params: PlanParams, lang: PlanLang): Promise<Metadata> {
  const { slug } = await params;
  const ok = isPlanSlug(slug);
  return {
    title: PLAN_COPY[lang].plan.metaTitle,
    robots: { index: false, follow: false },
    referrer: "no-referrer",
    alternates: ok ? { languages: languageAlternates(planPath(slug, "en"), planPath(slug, "es")) } : undefined,
  };
}

export async function PlanPage({ params, searchParams, lang }: { params: PlanParams; searchParams: PlanSearch; lang: PlanLang }) {
  const { slug } = await params;
  if (!isPlanSlug(slug)) notFound();
  const record = await getPlanBySlug(slug);
  if (!record) notFound();
  // Everything below renders from the public slice: no name, phone or email.
  const plan = toPublicPlan(record);
  const t = PLAN_COPY[lang].plan;
  const q = await searchParams;
  const paid = q.paid === "1";

  const [status, images, book] = await Promise.all([getDateStatus(plan.event_date), getPortfolioImages(), getPriceBook()]);
  // Only photos with stored dimensions (zero layout shift).
  const gallery = matchGallery(
    images.filter((i) => i.slug && i.width && i.height),
    plan.colors,
    { limit: 9, min: 6 },
  );
  const packages = commissionsFor(book).filter((c) => EVENT_TIERS.has(c.id));
  const date = formatPlanDate(plan.event_date, lang);
  const reserved = plan.status === "booked";
  const deposit = `$${(site.booking.depositCents / 100).toLocaleString("en-US")}`;
  const colorNames = plan.colors.map((c) => colorLabel(c, lang));
  const galleryTitle = plan.colors.length ? t.gallery[gallery.mode] : t.gallery.best;
  const galleryNote = !plan.colors.length ? t.gallery.noColorsNote : gallery.mode === "best" ? t.gallery.bestNote : null;
  const statusText = reserved ? t.status.yours : t.status[`${status}Note`];
  const fallbackAlt = lang === "es" ? "Quinceañera en Dallas–Fort Worth" : "Quinceañera in Dallas–Fort Worth";

  const holdBlock = (where: string) =>
    reserved ? null : status === "booked" ? (
      <a href={smsHref()} className="tq-btn tq-btn--lg tq-btn--block qp-cta" data-place={where}>
        {t.hold.bookedButton} <span className="tq-arrow" aria-hidden>→</span>
      </a>
    ) : (
      <HoldButton slug={plan.slug} lang={lang} label={t.hold.button(deposit)} copy={{ opening: t.hold.opening, error: t.hold.error, taken: t.hold.taken, notLive: t.hold.notLive, yours: t.status.yours }} />
    );

  return (
    <div className="tq-wrap qp-page">
      <HideDock />
      {paid && !reserved ? (
        <p role="status" className="qp-banner">
          {t.paidBanner}
        </p>
      ) : null}

      <header className="qp-head">
        <p className="tq-mono qp-eyebrow">
          [{t.eyebrow} / {plan.city}]
        </p>
        <h1 className="tq-display qp-title">{t.title(date)}</h1>
        {colorNames.length ? (
          <p className="qp-colorline">
            <span className="tq-mono">{t.inColors}</span>
            {plan.colors.map((c) => (
              <span key={c} className="qp-chip">
                <span className="qp-swatch" style={{ background: colorById(c).hex }} aria-hidden />
                {colorLabel(c, lang)}
              </span>
            ))}
          </p>
        ) : null}
        {plan.theme ? <p className="qp-theme">“{plan.theme}”</p> : null}
      </header>

      <section className="qp-status" aria-labelledby="qp-status-title" data-status={reserved ? "yours" : status}>
        <div className="qp-status__row">
          <span className="tq-dot" data-limited={status === "limited" || undefined} data-pending={status === "booked" && !reserved ? true : undefined} aria-hidden />
          <h2 id="qp-status-title" className="qp-status__label">
            <span className="tq-mono">{t.status.label}</span> {reserved ? `✓ ${t.status.mine}` : t.status[status]}
          </h2>
        </div>
        <p className="qp-status__note">{statusText}</p>
        {!reserved && status !== "booked" ? <p className="qp-status__hold">{t.hold.body(deposit, date)}</p> : null}
        <div className="qp-status__cta">{holdBlock("status")}</div>
        {!reserved && status !== "booked" ? <p className="tq-hint">{t.hold.secure}</p> : null}
      </section>

      <section className="qp-section" aria-labelledby="qp-gallery-title">
        <h2 id="qp-gallery-title" className="tq-display qp-h2">{galleryTitle}</h2>
        {galleryNote ? <p className="qp-muted">{galleryNote}</p> : null}
        {gallery.images.length ? (
          <ul className="qp-grid">
            {gallery.images.map((img, i) => (
              <li key={img.id}>
                <Image
                  src={img.url}
                  alt={publicPhotoCopy(img, altPhraseFor(img.section)).alt || fallbackAlt}
                  width={img.width!}
                  height={img.height!}
                  sizes="(min-width: 960px) 30vw, 50vw"
                  loading={i < 2 ? "eager" : "lazy"}
                  style={{ objectPosition: `${Math.round((img.focus_x ?? 0.5) * 100)}% ${Math.round((img.focus_y ?? 0.35) * 100)}%` }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="qp-muted">{t.gallery.empty}</p>
        )}
        <Link href={lang === "es" ? "/es/fotos-recientes" : "/portfolio"} className="qp-link">
          {t.gallery.seeAll} <span className="tq-arrow" aria-hidden>↗</span>
        </Link>
      </section>

      <section className="qp-section" aria-labelledby="qp-packages-title">
        <h2 id="qp-packages-title" className="tq-display qp-h2">{t.packages.title}</h2>
        <p className="qp-muted">{t.packages.dek}</p>
        <ul className="qp-packages">
          {packages.map((p) => (
            <li key={p.id} className="qp-pkg" data-recommended={p.recommended || undefined}>
              <div className="qp-pkg__top">
                <h3 className="qp-pkg__name">{p.name[lang]}</h3>
                {p.recommended ? <span className="tq-mono qp-pkg__tag">{t.packages.recommended}</span> : null}
              </div>
              <p className="qp-pkg__price tq-nums">{p.priceLabel}</p>
              <p className="qp-pkg__summary">{p.summary[lang]}</p>
              <ul className="qp-pkg__list">
                {p.highlights[lang].map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <Link href={commissionLinks[lang].compare} className="qp-link">
          {t.packages.compare} <span className="tq-arrow" aria-hidden>↗</span>
        </Link>
        <div className="qp-cta-repeat">{holdBlock("packages")}</div>
      </section>

      <section className="qp-section qp-timeline-card" aria-labelledby="qp-timeline-title">
        <h2 id="qp-timeline-title" className="tq-display qp-h2">{t.timeline.title}</h2>
        <p className="qp-muted">{t.timeline.body}</p>
        <Link href={timelinePath(plan.slug, lang)} className="tq-btn tq-btn--lg tq-btn--ghost qp-cta">
          {t.timeline.open} <span className="tq-arrow" aria-hidden>→</span>
        </Link>
      </section>

      <section className="qp-section" aria-label={t.questions}>
        <p className="qp-questions">{t.questions}</p>
        <ContactButtons lang={lang} placement="plan" primary={false} />
        <p className="tq-mono qp-share">{t.share}</p>
      </section>
    </div>
  );
}
