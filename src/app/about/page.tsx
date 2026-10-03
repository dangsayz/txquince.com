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
      <section aria-labelledby="about-title" className="bg-white px-4 pb-16 pt-5 sm:px-8 sm:pb-24 sm:pt-8 lg:px-12">
        <div className="mx-auto grid max-w-[96rem] bg-[#f2efe7] lg:min-h-[44rem] lg:grid-cols-[minmax(0,0.54fr)_minmax(0,0.46fr)]">
          <div className="flex flex-col justify-between px-6 pb-10 pt-12 sm:px-12 sm:pb-14 sm:pt-16 lg:px-16 lg:py-20">
            <p className="text-xs uppercase tracking-[0.23em] text-ink-soft">01 / The studio</p>
            <div className="mt-24 max-w-[36rem] lg:mt-12">
              <h1 id="about-title" className="font-display text-[clamp(2.3rem,4.2vw,4.25rem)] font-light leading-[1.08] tracking-[-0.025em] text-ink">About TX Quince.</h1>
              <p className="mt-6 max-w-md text-base leading-[1.8] text-ink-soft">Quinceañera photography and film across Dallas–Fort Worth, centered on the people and traditions that make each celebration her own.</p>
              <Link href="/portfolio" className="mt-9 inline-flex min-h-12 items-center gap-7 border-b border-ink text-xs font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:text-ink-soft">View the work <span aria-hidden="true">↗</span></Link>
            </div>
            <p className="mt-14 text-xs uppercase tracking-[0.2em] text-ink-soft">Photography / film / family</p>
          </div>
          <figure className="relative min-h-[28rem] bg-greige sm:min-h-[36rem] lg:min-h-full">
            <Image src={hero?.url ?? "/portfolio/hero.webp"} alt={hero?.alt || "Quinceañera portrait in Dallas–Fort Worth"} fill unoptimized={!hero} priority sizes="(max-width: 1023px) 100vw, 46vw" className="object-cover" style={{ objectPosition: hero ? focal(hero.focus_x, hero.focus_y) : "center 58%" }} />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent px-6 pb-5 pt-16 text-xs uppercase tracking-[0.2em] text-white sm:px-10">Dallas–Fort Worth / TX Quince</figcaption>
          </figure>
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
              <div className="relative aspect-[4/5] overflow-hidden bg-greige"><Image src="/portfolio/red-garden.webp" alt="Quinceañera in a red gown holding flowers" fill unoptimized sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><EditOverlay image={{}} /></div>
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

    </>
  );
}
