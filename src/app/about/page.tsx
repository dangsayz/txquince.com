import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { about } from "@/content/about";
import { site } from "@/content/site";
import { getImageBySlug, getImagesBySection, getFeaturedImages, getPageHero } from "@/lib/content-db";
import { Figure } from "@/components/Figure";
import { EditOverlay } from "@/components/EditMode";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About",
  description: "Quinceañera photography and film in Dallas–Fort Worth, shaped around the portraits, traditions, and celebrations that matter to your family.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About · TX Quince",
    description: "Quinceañera photography and film in Dallas–Fort Worth.",
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
      <section aria-labelledby="about-title" className="mx-auto max-w-[88rem] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-12 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16">
          <figure className="min-w-0">
            <div className="relative aspect-[4/3] overflow-hidden bg-greige sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image src={hero?.url ?? "/portfolio/hero.webp"} alt={hero?.alt || "Quinceañera portrait in Dallas–Fort Worth"} fill priority sizes="(max-width: 1024px) 100vw, 56vw" className="object-cover" style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : { objectPosition: "center 58%" }} />
            </div>
            <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">Portraits / traditions / celebration</figcaption>
          </figure>
          <div className="max-w-xl lg:pb-8">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">{about.eyebrow} / Dallas–Fort Worth</p>
            <h1 id="about-title" className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,3.2vw,3rem)] font-normal leading-[1.14] text-ink">A day worth remembering in full.</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">TX Quince photographs the moments that make her celebration hers, from the quiet portrait to the last dance.</p>
            <Link href="/portfolio" className="mt-8 inline-flex min-h-12 items-center gap-8 whitespace-nowrap border-b border-ink text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Explore the work <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="story-title" className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-20 lg:px-12">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">What guides the work</p>
            <h2 id="story-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight text-ink">Present for the moments you planned. Ready for the ones you didn&apos;t.</h2>
            <div className="mt-6 space-y-5 text-base leading-7 text-ink-soft">{about.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </div>
          <figure className="min-w-0">
            {aboutImg ? (
              <div className="relative aspect-[4/5] overflow-hidden bg-greige">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sized(900)} srcSet={sized(640) + " 640w, " + sized(900) + " 900w, " + sized(1200) + " 1200w"} sizes="(max-width: 1024px) 100vw, 50vw" alt={aboutImg.alt || about.portraitAlt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: focal(aboutImg.focus_x, aboutImg.focus_y) }} />
                <EditOverlay image={{ id: aboutImg.id, slug: aboutImg.slug, alt: aboutImg.alt, fx: aboutImg.focus_x, fy: aboutImg.focus_y }} />
              </div>
            ) : about.portraitKey ? (
              <div className="relative"><Figure imageKey={about.portraitKey} alt={about.portraitAlt} ratio="portrait" sizes="(max-width: 1024px) 100vw, 50vw" /><EditOverlay image={{}} /></div>
            ) : (
              <div className="relative aspect-[4/5] overflow-hidden bg-greige"><Image src="/portfolio/red-garden.webp" alt="Quinceañera in a red gown holding flowers" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><EditOverlay image={{}} /></div>
            )}
            <figcaption className="mt-3 text-xs uppercase tracking-[0.16em] text-ink-soft">{aboutImg ? "Behind the camera" : "From the TX Quince portfolio"}</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="approach-title" className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="grid gap-8 border-b border-line pb-8 md:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">The approach / 01</p>
          <div><h2 id="approach-title" className="font-display text-[clamp(1.65rem,2.4vw,2.25rem)] font-normal leading-tight text-ink">{about.culture.heading}</h2><p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">{about.culture.body}</p></div>
        </div>
        <div className="grid gap-8 py-8 md:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">The approach / 02</p>
          <div><h3 className="font-display text-[clamp(1.65rem,2.4vw,2.25rem)] font-normal leading-tight text-ink">{about.approach.heading}</h3><p className="mt-3 max-w-2xl text-base leading-7 text-ink-soft">{about.approach.body}</p></div>
        </div>
      </section>

      <section aria-labelledby="about-next-title" className="bg-ink text-white">
        <div className="mx-auto grid max-w-[88rem] gap-8 px-5 py-14 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] md:items-end lg:px-12">
          <div><p className="text-xs uppercase tracking-[0.18em] text-white/70">Your celebration</p><h2 id="about-next-title" className="mt-4 max-w-xl font-display text-[clamp(1.75rem,2.7vw,2.5rem)] font-normal leading-tight">{about.closing}</h2></div>
          <div className="flex flex-col gap-5 md:items-start"><Link href="/check-your-date" className="inline-flex min-h-12 items-center justify-between gap-8 self-start whitespace-nowrap border border-white px-6 text-base text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Check her date <span aria-hidden="true">↗</span></Link><Link href="/quinceanera-photographer" className="inline-flex min-h-11 items-center border-b border-white/70 text-base text-white">See the areas we serve ↗</Link></div>
        </div>
      </section>
    </>
  );
}
