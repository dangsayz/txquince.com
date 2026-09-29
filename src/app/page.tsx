import Image from "next/image";
import Link from "next/link";
import { Figure } from "@/components/Figure";
import { InquiryForm } from "@/components/InquiryForm";
import { EditOverlay } from "@/components/EditMode";
import { HomeWorkGallery, type HomeImage } from "@/components/home/HomeWorkGallery";
import { VideoGallery } from "@/components/VideoGallery";
import { home } from "@/content/home";
import { about } from "@/content/about";
import { packages } from "@/content/packages";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { altPhraseFor, categoryLabel } from "@/content/portfolio-taxonomy";
import { site } from "@/content/site";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getHeroMedia, getVideos } from "@/lib/content-db";
import { heroObjectPosition } from "@/lib/hero-focus";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

export const revalidate = 60;

const sectionSpace = "mx-auto max-w-[88rem] px-5 sm:px-8 lg:px-12";

export default async function HomePage() {
  const [featured, videos, heroMedia] = await Promise.all([
    getFeaturedImages(12),
    getVideos(),
    getHeroMedia(),
  ]);
  const testimonials = releasedTestimonials();
  const operatorName = about.operatorName.trim();
  const hasNamedPhotographer = Boolean(operatorName) && !operatorName.startsWith("[");
  const images: HomeImage[] = featured.length
    ? featured.map((image) => ({
        id: image.id,
        url: image.url,
        alt: publicPhotoCopy(image, altPhraseFor(image.section)).alt,
        section: image.section,
        slug: image.slug ?? null,
        focusX: image.focus_x ?? null,
        focusY: image.focus_y ?? null,
      }))
    : portfolioFallback.map((image) => ({
        id: null,
        url: image.url,
        alt: image.alt,
        section: image.section,
        slug: image.slug,
        focusX: null,
        focusY: image.url === portfolioFallback[0]?.url ? 0.65 : null,
      }));
  const topImage = featured[0];
  const fallbackHero = portfolioFallback.find((image) => image.slug === "red-gown-garden-portrait") ?? portfolioFallback[0];
  const hero = heroMedia?.kind === "image" && heroMedia.imageUrl
    ? { url: heroMedia.imageUrl, alt: heroMedia.imageAlt, focusX: null, focusY: null, id: null, slug: null }
    : heroMedia?.kind === "video" && heroMedia.posterUrl
      ? { url: heroMedia.posterUrl, alt: "Quinceañera film still", focusX: null, focusY: null, id: null, slug: null }
      : topImage
        ? { url: topImage.url, alt: publicPhotoCopy(topImage, altPhraseFor(topImage.section)).alt, focusX: topImage.focus_x, focusY: topImage.focus_y, id: topImage.id, slug: topImage.slug }
        : fallbackHero
          ? { url: fallbackHero.url, alt: fallbackHero.alt, focusX: null, focusY: 0.5, id: null, slug: null }
          : null;
  const heroPosition = heroMedia?.kind === "image"
    ? heroObjectPosition(heroMedia)
    : `${Math.round((hero?.focusX ?? 0.5) * 100)}% ${Math.round((hero?.focusY ?? 0.35) * 100)}%`;
  const usingFallbackHero = !featured.length && hero?.url === fallbackHero?.url;
  const supportingImages = images.filter((image) => image.url !== hero?.url && (!usingFallbackHero || image.url !== portfolioFallback[0]?.url)).slice(0, 2);
  const coverUrls = new Set([hero?.url, ...(usingFallbackHero ? [fallbackHero?.url] : []), ...supportingImages.map((image) => image.url)]);
  const workImages = images.length >= 8 ? images.filter((image) => !coverUrls.has(image.url)) : images;

  return (
    <>
      <section className="border-b border-line bg-white" aria-labelledby="home-title">
        <div className="mx-auto grid max-w-[88rem] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 lg:px-8 xl:gap-12 xl:px-12">
          <div className="relative h-[clamp(16rem,39svh,21rem)] overflow-hidden bg-greige sm:h-[26rem] lg:h-[clamp(34rem,55vw,42rem)]">
            {hero ? (
              <Link href="/portfolio" className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label="Browse the quinceañera portfolio">
                <Image src={hero.url} alt={hero.alt} fill priority fetchPriority="high" decoding="sync" unoptimized={hero.url.startsWith("/portfolio/")} sizes="(max-width: 1023px) 100vw, (max-width: 1440px) 46vw, 36rem" className="object-cover" style={{ objectPosition: heroPosition }} />
              </Link>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <p className="font-display text-xl text-ink">Portfolio photos are unavailable.</p>
                <p className="mt-2 max-w-xs text-base leading-6 text-ink-soft">Ask us about photo and film coverage for your date.</p>
              </div>
            )}
            {heroMedia?.kind === "image"
              ? <EditOverlay image={{ alt: hero?.alt }} editHref="/admin/hero#framing" label="Set focal point" />
              : hero?.id && <EditOverlay image={{ id: hero.id, slug: hero.slug, alt: hero.alt, fx: hero.focusX, fy: hero.focusY }} />}
          </div>
          <div className="flex min-w-0 flex-col justify-between px-5 pb-8 pt-7 sm:px-8 sm:pb-10 sm:pt-9 lg:px-0 lg:pb-0 lg:pt-10">
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-ink-soft uppercase sm:text-sm">Dallas–Fort Worth · Quinceañera photography &amp; film</p>
              <h1 id="home-title" className="mt-4 max-w-[22ch] font-display text-[clamp(1.875rem,3vw,2.5rem)] font-normal leading-[1.14] tracking-[-0.035em] text-ink sm:mt-6">{home.hero.headline}</h1>
              <p className="mt-4 max-w-[31rem] text-base leading-7 text-ink-soft sm:mt-5">{home.hero.subline}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 sm:mt-8">
                <Link href="/check-your-date" className="inline-flex min-h-12 items-center justify-center gap-4 whitespace-nowrap rounded-md bg-ink px-6 text-base font-medium text-white transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Check her date <span aria-hidden="true">↗</span></Link>
                <Link href="/portfolio" className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap border-b border-ink text-base font-medium text-ink transition-colors hover:border-ink-soft hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">View the portfolio <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
            {supportingImages.length > 0 && (
              <div className="mt-7 grid grid-cols-2 gap-3 lg:mt-0" aria-label="More quinceañera photographs">
                {supportingImages.map((image) => (
                  <figure key={image.id ?? image.url} className="min-w-0">
                    <div className="relative aspect-[4/5] overflow-hidden bg-greige sm:aspect-[8/5]">
                      <Link href={image.id && image.slug ? `/photos/${encodeURIComponent(image.section)}/${encodeURIComponent(image.slug)}` : "/portfolio"} className="block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label={`View ${image.alt}`}>
                        <Image src={image.url} alt={image.alt} fill sizes="(max-width: 1023px) 45vw, (max-width: 1440px) 24vw, 20rem" unoptimized={image.id === null} className="object-cover" style={{ objectPosition: `${Math.round((image.focusX ?? 0.5) * 100)}% ${Math.round((image.focusY ?? 0.35) * 100)}%` }} />
                      </Link>
                      {image.id && <EditOverlay image={{ id: image.id, slug: image.slug, alt: image.alt, fx: image.focusX, fy: image.focusY }} />}
                    </div>
                    <figcaption className="mt-2 text-xs font-medium tracking-[0.12em] text-ink-soft uppercase">{categoryLabel(image.section)}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="work" className={`${sectionSpace} scroll-mt-24 py-16 sm:py-20`} aria-labelledby="work-title">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">The portfolio</p>
            <h2 id="work-title" className="mt-3 max-w-2xl font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">A day worth this much care, frame by frame.</h2>
          </div>
          <Link href="/portfolio" className="inline-flex min-h-11 items-center self-start whitespace-nowrap border-b border-accent text-base font-medium text-accent-strong transition-colors hover:text-ink md:self-end">View full portfolio <span aria-hidden="true" className="ml-3">↗</span></Link>
        </div>
        <HomeWorkGallery images={workImages} />
      </section>

      {videos.length > 0 && (
        <section className="bg-ivory py-16 sm:py-20" aria-labelledby="film-title">
          <div className={sectionSpace}>
            <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">On film</p>
                <h2 id="film-title" className="mt-3 font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">Some moments only motion can hold.</h2>
              </div>
              <Link href="/portfolio#films" className="inline-flex min-h-11 items-center border-b border-accent text-base font-medium text-accent-strong hover:text-ink">Explore films ↗</Link>
            </div>
            <VideoGallery videos={videos.slice(0, 2)} />
          </div>
        </section>
      )}

      <section className={`${sectionSpace} py-16 sm:py-20`} aria-labelledby="collections-title">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">Collections</p>
            <h2 id="collections-title" className="mt-3 font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">The coverage that fits her day.</h2>
          </div>
          <Link href="/investment" className="inline-flex min-h-11 items-center self-start border-b border-accent text-base font-medium text-accent-strong hover:text-ink sm:self-end">Compare every detail ↗</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {packages.map((item, index) => (
            <article key={item.id} className="flex min-w-0 flex-col rounded-lg border border-line bg-white p-6 sm:p-7">
              <span aria-hidden="true" className="text-xs font-medium tracking-[0.14em] text-ink-faint">0{index + 1} / 04</span>
              <h3 className="mt-5 font-display text-[clamp(1.5rem,2vw,1.875rem)] leading-tight text-ink">{item.name}</h3>
              <p className="mt-2 max-w-lg text-base leading-7 text-ink-soft">{item.teaser}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-x-5 gap-y-4 pt-8">
                <p className="font-display text-xl text-ink sm:text-2xl">{item.priceLabel}</p>
                <Link href={`/reserve?collection=${item.id}`} className="inline-flex min-h-12 items-center justify-between gap-4 whitespace-nowrap rounded-md border border-ink px-5 text-base font-medium text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Request {item.name} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 max-w-3xl text-base leading-7 text-ink-soft">A request starts the conversation. Collection deposits vary; we confirm the details before sending a payment link.</p>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-labelledby="process-title">
        <div className={sectionSpace}>
          <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">The process</p>
          <h2 id="process-title" className="mt-3 font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">From first look to her day.</h2>
          <ol className="mt-10 grid gap-7 md:grid-cols-3 md:gap-8">
            {[
              { title: "Explore the work", body: "Browse real photographs and films to see how the day is documented." },
              { title: "Tell us your date", body: "Choose a collection and send your request. We will check availability and confirm the details with you." },
              { title: "Plan the celebration", body: "Once your date and coverage are confirmed, we plan the portraits, traditions, and timeline together." },
            ].map((step, index) => (
              <li key={step.title} className="border-t border-line pt-5">
                <span className="text-xs font-medium tracking-widest text-accent-strong">0{index + 1}</span>
                <h3 className="mt-5 font-display text-[1.375rem] text-ink">{step.title}</h3>
                <p className="mt-3 max-w-sm text-base leading-7 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${sectionSpace} py-16 sm:py-20`} aria-labelledby="studio-title">
        <div className="grid gap-7 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-stretch lg:gap-12">
          <div className="flex flex-col justify-center border-t border-line py-7 md:py-10">
            <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">Behind the lens</p>
            <h2 id="studio-title" className="mt-4 max-w-lg font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">{hasNamedPhotographer ? `Meet ${operatorName}` : "About TX Quince"}</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-ink-soft">{about.approach.body}</p>
            <p className="mt-4 max-w-lg text-base leading-7 text-ink-soft">Based in {site.serviceArea}. Learn how TX Quince approaches portraits, traditions, and the celebration itself.</p>
            <Link href="/about" className="mt-7 inline-flex min-h-11 w-fit items-center border-b border-ink text-base font-medium text-ink hover:border-accent hover:text-accent-strong">About the studio <span aria-hidden="true" className="ml-3">↗</span></Link>
          </div>
          {about.portraitKey ? (
            <Figure imageKey={about.portraitKey} alt={about.portraitAlt} ratio="portrait" sizes="(max-width: 768px) 100vw, 50vw" className="min-h-80 overflow-hidden rounded-lg" />
          ) : (
            <div className="flex min-h-64 items-end rounded-lg bg-accent-soft p-7 sm:p-10 lg:p-14">
              <p className="max-w-xs font-display text-[1.375rem] leading-tight text-ink">Quinceañera photography and film in Dallas–Fort Worth.</p>
            </div>
          )}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-ivory py-16 sm:py-20" aria-labelledby="voices-title">
          <div className={sectionSpace}>
            <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">From our families</p>
            <h2 id="voices-title" className="mt-3 font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">What families say.</h2>
            <div className="mt-9 grid gap-4 md:grid-cols-2">
              {testimonials.slice(0, 2).map((item) => (
                <figure key={`${item.momName}-${item.daughterName}`} className="rounded-lg border border-line bg-white p-6 sm:p-8">
                  <blockquote className="font-display text-[1.375rem] leading-snug text-ink">“{item.quote}”</blockquote>
                  <figcaption className="mt-6 text-base text-ink-soft">{item.momName}{item.location ? ` · ${item.location}` : ""}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${sectionSpace} py-16 sm:py-20`} aria-labelledby="faq-title">
        <div className="grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">Good to know</p>
            <h2 id="faq-title" className="mt-3 font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">Frequently asked questions.</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-ink-soft">Have a different question? Send it with your inquiry and we will answer directly.</p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {[
              { q: "What happens when I request a date?", a: "Send your date and preferred collection. We will confirm availability and the next steps with you. There is no payment in the initial request." },
              { q: "Can we plan in Spanish?", a: home.faq.items[1].a },
              { q: "Do you charge travel within Dallas–Fort Worth?", a: home.faq.items[2].a },
              { q: "What are the collection deposits?", a: `${packages.map((collection) => `${collection.name} ${collection.depositLabel}`).join(", ")}. Each deposit applies to its collection after your date is confirmed.` },
            ].map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">{item.q}<span aria-hidden="true" className="text-2xl font-light text-accent-strong group-open:rotate-45">+</span></summary>
                <p className="max-w-2xl pt-3 text-base leading-7 text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {site.social.instagram && (
        <section className="bg-white py-12 sm:py-16">
          <div className={`${sectionSpace} flex flex-col justify-between gap-5 sm:flex-row sm:items-center`}>
            <div>
              <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">Follow along</p>
              <h2 className="mt-2 font-display text-[clamp(1.875rem,2.8vw,2.625rem)] text-ink">TX Quince on Instagram</h2>
            </div>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center self-start whitespace-nowrap rounded-md border border-ink px-6 text-base font-medium text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Visit @txquince <span aria-hidden="true" className="ml-3">↗</span></a>
          </div>
        </section>
      )}

      <section className={`${sectionSpace} py-16 sm:py-20`} aria-labelledby="date-title">
        <div className="grid gap-9 rounded-lg border border-line bg-white px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14 lg:px-12">
          <div className="lg:pt-4">
            <p className="text-xs font-medium tracking-[0.14em] text-accent-strong uppercase">Your celebration starts here</p>
            <h2 id="date-title" className="mt-4 max-w-xl font-display text-[clamp(1.875rem,2.8vw,2.625rem)] leading-tight text-ink">Check your celebration date.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink-soft">Tell us when and where you are celebrating. We will check the calendar personally and talk through the coverage that fits your family.</p>
            <p className="mt-5 text-base font-medium text-ink">No payment is needed to ask.</p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
