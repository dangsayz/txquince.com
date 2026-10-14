import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { about } from "@/content/about";
import { site } from "@/content/site";
import { getImageBySlug, getImagesBySection, getFeaturedImages, getPageHero } from "@/lib/content-db";
import { Figure } from "@/components/Figure";
import { EditOverlay } from "@/components/EditMode";
import { FinalCTA } from "@/components/FinalCTA";
import { commissionLinks } from "@/content/commissions";
import "@/components/txq/pages/pages.css";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description: "Quinceañera photos and video in Dallas–Fort Worth, shaped around the portraits, traditions, and celebrations that matter to your family.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · TX Quince",
    description: "Quinceañera photos and video in Dallas–Fort Worth.",
    url: site.url + "/about",
  },
};

function focal(fx?: number | null, fy?: number | null): string {
  return String(Math.round((fx ?? 0.5) * 100)) + "% " + String(Math.round((fy ?? 0.32) * 100)) + "%";
}

export default async function AboutPage() {
  const aboutImg =
    (await getImagesBySection("about"))[0] ??
    (await getImageBySlug("about-portrait")) ??
    null;
  const sized = (w: number) =>
    aboutImg ? aboutImg.url + (aboutImg.url.includes("?") ? "&" : "?") + "w=" + w : "";
  const featured = await getFeaturedImages(12);
  const hero =
    (await getPageHero("about")) ??
    featured.find((i) => (i.width ?? 0) >= (i.height ?? 0)) ??
    featured[0] ??
    null;

  return (
    <>
      <div className="tq-wrap">
        <header className="tq-pg-mast" aria-labelledby="about-title">
          <p className="tq-pg-mast__index tq-mono">[About / The studio · DFW]</p>
          <div className="tq-pg-mast__body">
            <h1 id="about-title" className="tq-display tq-pg-mast__title">
              About TX Quince <em>— photos and video for her fifteen.</em>
            </h1>
            <p className="tq-pg-mast__dek">
              Quinceañera photos and video centered on the people and traditions that make each celebration her own.
            </p>
            <div className="tq-pg-actions">
              <Link href="/portfolio" className="tq-btn tq-btn--lg tq-btn--ghost">
                View the work <span className="tq-arrow" aria-hidden>↗</span>
              </Link>
            </div>
          </div>
        </header>
        <figure className="tq-pg-plate">
          <Image src={hero?.url ?? "/portfolio/stockyards.webp"} alt={hero?.alt || "Quinceañera portrait in Dallas–Fort Worth"} fill unoptimized={!hero} priority sizes="100vw" style={{ objectPosition: hero ? focal(hero.focus_x, hero.focus_y) : "center 58%" }} />
          <figcaption>
            <span className="tq-tag tq-tag--bl tq-mono">[The studio — Dallas–Fort Worth]</span>
          </figcaption>
        </figure>
        <div className="tq-manifesto" style={{ paddingTop: 56, borderTop: "1px solid var(--border-hairline)" }}>
          <p className="tq-display">
            A celebration has a rhythm of its own. <em>We make room for every part of it.</em>
          </p>
        </div>
      </div>

      <section className="tq-section" aria-labelledby="story-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [01 / What guides the work]
            </p>
            <h2 id="story-title" className="tq-display tq-head__title">
              Present for the moments you planned. <em>Ready for the ones you didn&apos;t.</em>
            </h2>
          </header>
          <div className="tq-pg-duo">
            <figure className="tq-pg-duo__media" style={{ margin: 0 }}>
              {aboutImg ? (
                <div className="tq-pg-figure">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sized(900)} srcSet={sized(640) + " 640w, " + sized(900) + " 900w, " + sized(1200) + " 1200w"} sizes="(max-width: 960px) 100vw, 40vw" alt={aboutImg.alt || about.portraitAlt} loading="lazy" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: focal(aboutImg.focus_x, aboutImg.focus_y) }} />
                  <EditOverlay image={{ id: aboutImg.id, slug: aboutImg.slug, alt: aboutImg.alt, fx: aboutImg.focus_x, fy: aboutImg.focus_y }} />
                </div>
              ) : about.portraitKey ? (
                <div style={{ position: "relative" }}>
                  <Figure imageKey={about.portraitKey} alt={about.portraitAlt} ratio="portrait" sizes="(max-width: 960px) 100vw, 40vw" />
                  <EditOverlay image={{}} />
                </div>
              ) : (
                <div className="tq-pg-figure">
                  <Image src="/portfolio/red-garden.webp" alt="Quinceañera in a red gown holding flowers" fill unoptimized sizes="(max-width: 960px) 100vw, 40vw" />
                  <EditOverlay image={{}} />
                </div>
              )}
              <figcaption className="tq-pg-figcap tq-mono">
                [{aboutImg ? "Behind the camera" : "From the TX Quince portfolio"}]
              </figcaption>
            </figure>
            <div className="tq-pg-duo__text">
              <div className="tq-pg-prose">
                {about.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tq-section" aria-labelledby="approach-title">
        <div className="tq-wrap">
          <header className="tq-head">
            <p className="tq-head__index tq-mono" style={{ margin: 0 }}>
              [02 / The approach]
            </p>
            <h2 id="approach-title" className="tq-display tq-head__title">
              How we work. <em>Around your family, not a template.</em>
            </h2>
          </header>
          <ol className="tq-principles">
            <li>
              <span className="tq-mono tq-muted">[01]</span>
              <h3 className="tq-display">{about.culture.heading}</h3>
              <p>{about.culture.body}</p>
            </li>
            <li>
              <span className="tq-mono tq-muted">[02]</span>
              <h3 className="tq-display">{about.approach.heading}</h3>
              <p>{about.approach.body}</p>
            </li>
            <li>
              <span className="tq-mono tq-muted">[03]</span>
              <h3 className="tq-display">Published packages.</h3>
              <p>
                Four packages with prices on the page, from the Portrait Session to the Two-Day Celebration.{" "}
                <Link href={commissionLinks.en.compare} className="tq-pg-inline">
                  Compare packages
                </Link>
                .
              </p>
            </li>
          </ol>
        </div>
      </section>

      <FinalCTA
        accent="03 / Your date"
        headline="Tell us about her day."
        sub={about.closing}
        href={commissionLinks.en.book}
        label="Check her date"
      />
    </>
  );
}
