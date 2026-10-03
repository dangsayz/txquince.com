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
      <header aria-labelledby="about-title" className="relative isolate flex min-h-[72svh] items-end overflow-hidden bg-ink text-white sm:min-h-[82svh]">
        <Image src={hero?.url ?? "/portfolio/stockyards.webp"} alt={hero?.alt || "Quinceañera portrait in Dallas–Fort Worth"} fill unoptimized={!hero} priority sizes="100vw" className="object-cover" style={{ objectPosition: hero ? focal(hero.focus_x, hero.focus_y) : "center 58%" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[96rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-[0.68rem] uppercase tracking-[0.26em] text-white/85">The studio · Dallas–Fort Worth</p>
          <h1 id="about-title" className="mt-5 max-w-3xl font-display text-[clamp(2.2rem,4vw,4rem)] font-light leading-[1.13] tracking-[0.01em]">About TX Quince</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/90">Quinceañera photography and film centered on the people and traditions that make each celebration her own.</p>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28 lg:py-36">
        <div className="mx-auto grid max-w-[78rem] gap-10 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-24">
          <p className="text-xs uppercase tracking-[0.22em] text-ink-soft">What stays with you</p>
          <div><p className="max-w-[26ch] font-display text-[clamp(1.9rem,3vw,3rem)] font-light leading-[1.25] text-ink">A celebration has a rhythm of its own. We make room for every part of it.</p><Link href="/portfolio" className="mt-8 inline-flex min-h-12 items-center gap-5 border-b border-ink text-xs uppercase tracking-[0.17em] text-ink">View the work <span aria-hidden="true">↗</span></Link></div>
        </div>
      </section>

      <section aria-labelledby="story-title" className="bg-white">
        <div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-20 sm:px-10 sm:py-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-24 lg:py-36">
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
              <div className="relative aspect-[4/5] overflow-hidden bg-greige"><Image src="/portfolio/red-garden.webp" alt="Quinceañera in a red gown holding flowers" fill unoptimized sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><EditOverlay image={{}} /></div>
            )}
            <figcaption className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-soft">{aboutImg ? "Behind the camera" : "From the TX Quince portfolio"}</figcaption>
          </figure>
          <div className="max-w-xl lg:py-14">
            <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">What guides the work</p>
            <h2 id="story-title" className="mt-6 max-w-[20ch] font-display text-[clamp(1.85rem,2.8vw,2.75rem)] font-light leading-[1.2] text-ink">Present for the moments you planned. Ready for the ones you didn&apos;t.</h2>
            <div className="mt-8 space-y-6 text-base leading-8 text-ink-soft">{about.story.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          </div>
        </div>
      </section>

      <section aria-labelledby="approach-title" className="bg-ivory px-5 py-20 sm:px-10 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-[78rem]"><div className="grid gap-8 border-b border-line pb-10 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:gap-20">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">The approach / 01</p>
          <div><h2 id="approach-title" className="font-display text-[clamp(1.7rem,2.5vw,2.5rem)] font-light leading-tight text-ink">{about.culture.heading}</h2><p className="mt-5 max-w-2xl text-base leading-8 text-ink-soft">{about.culture.body}</p></div>
        </div>
        <div className="grid gap-8 pt-10 md:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)] md:gap-20">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-soft">The approach / 02</p>
          <div><h3 className="font-display text-[clamp(1.7rem,2.5vw,2.5rem)] font-light leading-tight text-ink">{about.approach.heading}</h3><p className="mt-5 max-w-2xl text-base leading-8 text-ink-soft">{about.approach.body}</p></div>
        </div>
        <Link href="/check-your-date" className="mt-12 inline-flex min-h-12 items-center gap-5 border-b border-ink text-xs uppercase tracking-[0.17em] text-ink">Tell us about her day <span aria-hidden="true">↗</span></Link></div>
      </section>

    </>
  );
}
