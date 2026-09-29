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
import { site } from "@/content/site";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getHeroMedia, getVideos } from "@/lib/content-db";

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
        alt: image.alt,
        section: image.section,
        slug: image.slug ?? null,
        title: image.title ?? null,
        location: image.location ?? null,
        focusX: image.focus_x ?? null,
        focusY: image.focus_y ?? null,
      }))
    : portfolioFallback.map((image) => ({
        id: null,
        url: image.url,
        alt: image.alt,
        section: image.section,
        slug: image.slug,
        title: image.title,
        location: image.city ?? null,
        focusX: null,
        focusY: image.url === portfolioFallback[0]?.url ? 0.65 : null,
      }));
  const topImage = featured[0];
  const fallbackHero = portfolioFallback[0];
  const hero = heroMedia?.kind === "image" && heroMedia.imageUrl
    ? { url: heroMedia.imageUrl, alt: heroMedia.imageAlt, focusX: null, focusY: null, id: null, slug: null }
    : heroMedia?.kind === "video" && heroMedia.posterUrl
      ? { url: heroMedia.posterUrl, alt: "Quinceañera film still", focusX: null, focusY: null, id: null, slug: null }
      : topImage
        ? { url: topImage.url, alt: topImage.alt, focusX: topImage.focus_x, focusY: topImage.focus_y, id: topImage.id, slug: topImage.slug }
        : fallbackHero
          ? { url: "/portfolio/hero-960.webp", alt: fallbackHero.alt, focusX: null, focusY: 0.75, id: null, slug: null }
          : null;
  const heroPosition = `${Math.round((hero?.focusX ?? 0.5) * 100)}% ${Math.round((hero?.focusY ?? 0.35) * 100)}%`;

  return (
    <>
      <section className={`${sectionSpace} pb-12 pt-5 sm:pb-16 sm:pt-10 lg:pt-14`}>
        <div className="grid overflow-hidden rounded-[1.5rem] border border-line bg-white lg:min-h-[42rem] lg:grid-cols-[0.9fr_1.1fr] lg:rounded-[2rem]">
          <div className="flex flex-col justify-center px-5 py-7 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <p className="text-xs font-semibold text-accent-strong">Dallas–Fort Worth · Quinceañera photography &amp; film</p>
            <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(2rem,4vw,4rem)] leading-[1.12] text-ink sm:mt-7">
              Quinceañera <span className="text-accent">photo &amp; film</span> for her day.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-ink-soft sm:mt-7 sm:text-lg sm:leading-7">{home.hero.subline}<span className="hidden sm:inline"> Explore the photographs, find the collection that fits your day, and ask about your date.</span></p>
            <div className="mt-5 flex flex-wrap gap-3 sm:mt-9">
              <Link href={site.cta.href} className="inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-7 text-sm font-semibold text-white transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Request your date <span aria-hidden="true" className="ml-3">↗</span></Link>
              <Link href="#work" className="hidden min-h-12 items-center justify-center rounded-full border border-line bg-white px-7 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:inline-flex">Explore the work</Link>
            </div>
            <p className="mt-8 hidden border-t border-line pt-5 text-sm text-ink-soft sm:block">Photo and film for the portraits, traditions, and celebration you will want to revisit.</p>
          </div>
          <div className="relative min-h-[22rem] overflow-hidden bg-greige sm:min-h-[34rem] lg:min-h-full">
            {hero ? (
              <Image src={hero.url} alt={hero.alt} fill priority fetchPriority="high" decoding="sync" unoptimized={hero.url.startsWith("/portfolio/")} sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" style={{ objectPosition: heroPosition }} />
            ) : (
              <div className="flex h-full min-h-[24rem] flex-col items-center justify-center px-8 text-center sm:min-h-[34rem]">
                <span aria-hidden="true" className="font-display text-6xl text-accent/30">TX</span>
                <p className="mt-4 max-w-xs font-display text-2xl text-ink">Portfolio photos are unavailable.</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-ink-soft">Ask us about photo and film coverage for your date.</p>
              </div>
            )}
            {hero?.id && <EditOverlay image={{ id: hero.id, slug: hero.slug, alt: hero.alt, fx: hero.focusX, fy: hero.focusY }} />}
          </div>
        </div>
      </section>

      <section id="work" className={`${sectionSpace} scroll-mt-24 py-16 sm:py-20`} aria-labelledby="work-title">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold text-accent-strong">The portfolio</p>
            <h2 id="work-title" className="mt-3 max-w-2xl font-display text-[clamp(1.875rem,3.2vw,3rem)] leading-tight text-ink">Explore the photo portfolio.</h2>
          </div>
          <Link href="/portfolio" className="inline-flex self-start border-b border-accent pb-1 text-sm font-semibold text-accent transition-colors hover:text-accent-strong md:self-end">View full portfolio <span aria-hidden="true" className="ml-3">↗</span></Link>
        </div>
        <HomeWorkGallery images={images} />
      </section>

      {videos.length > 0 && (
        <section className="bg-white py-16 sm:py-24" aria-labelledby="film-title">
          <div className={sectionSpace}>
            <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold text-accent-strong">On film</p>
                <h2 id="film-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">Watch the quinceañera films.</h2>
              </div>
              <Link href="/portfolio#films" className="border-b border-accent pb-1 text-sm font-semibold text-accent hover:text-accent-strong">Explore films ↗</Link>
            </div>
            <VideoGallery videos={videos.slice(0, 2)} />
          </div>
        </section>
      )}

      <section className={`${sectionSpace} py-16 sm:py-24`} aria-labelledby="collections-title">
        <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-accent-strong">Collections</p>
            <h2 id="collections-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">Compare photo and film collections.</h2>
          </div>
          <Link href="/investment" className="self-start border-b border-accent pb-1 text-sm font-semibold text-accent hover:text-accent-strong sm:self-end">Compare every detail ↗</Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((item) => (
            <article key={item.id} className="flex flex-col rounded-2xl border border-line bg-white p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-3xl text-ink">{item.name}</h3>
                <p className="font-display text-2xl text-ink">{item.priceLabel}</p>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-ink-soft">{item.teaser}</p>
              <ul className="my-7 space-y-3 border-t border-line pt-6 text-sm leading-6 text-ink-soft">
                {item.includes.slice(0, 3).map((detail) => <li key={detail} className="flex gap-3"><span aria-hidden="true" className="text-accent-strong">✓</span>{detail}</li>)}
              </ul>
              <Link href={`/reserve?collection=${item.id}`} className="mt-auto inline-flex min-h-11 items-center justify-between rounded-full border border-ink px-5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Request {item.name} <span aria-hidden="true">↗</span></Link>
            </article>
          ))}
        </div>
        <p className="mt-5 text-sm text-ink-soft">A request starts the conversation. Collection deposits vary; we confirm the details before sending a payment link.</p>
      </section>

      <section className="bg-white py-16 sm:py-24" aria-labelledby="process-title">
        <div className={sectionSpace}>
          <p className="text-xs font-semibold text-accent-strong">The process</p>
          <h2 id="process-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">How booking works.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { title: "Explore the work", body: "Browse real photographs and films to see how the day is documented." },
              { title: "Tell us your date", body: "Choose a collection and send your request. We will check availability and confirm the details with you." },
              { title: "Plan the celebration", body: "Once your date and coverage are confirmed, we plan the portraits, traditions, and timeline together." },
            ].map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-cream p-6 sm:p-8">
                <span className="text-xs font-semibold text-accent-strong">0{index + 1}</span>
                <h3 className="mt-7 font-display text-2xl text-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${sectionSpace} py-16 sm:py-24`} aria-labelledby="studio-title">
        <div className="grid overflow-hidden rounded-2xl border border-line bg-white md:grid-cols-[1fr_0.8fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <p className="text-xs font-semibold text-accent-strong">Studio profile</p>
            <h2 id="studio-title" className="mt-4 max-w-lg font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">{hasNamedPhotographer ? `Meet ${operatorName}` : "About TX Quince"}</h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-ink-soft">{about.approach.body}</p>
            <p className="mt-4 max-w-lg text-sm leading-6 text-ink-soft">Based in {site.serviceArea}. Learn how TX Quince approaches portraits, traditions, and the celebration itself.</p>
            <Link href="/about" className="mt-7 inline-flex border-b border-ink pb-1 text-sm font-semibold text-ink hover:border-accent hover:text-accent">About the studio <span aria-hidden="true" className="ml-3">↗</span></Link>
          </div>
          {about.portraitKey ? (
            <Figure imageKey={about.portraitKey} alt={about.portraitAlt} ratio="portrait" sizes="(max-width: 768px) 100vw, 40vw" className="min-h-80" />
          ) : (
            <div className="flex min-h-64 items-end bg-greige p-7 sm:p-10 lg:p-14">
              <p className="max-w-xs font-display text-3xl leading-tight text-ink">Quinceañera photography and film in Dallas–Fort Worth.</p>
            </div>
          )}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className={`${sectionSpace} py-16 sm:py-24`} aria-labelledby="voices-title">
          <p className="text-xs font-semibold text-accent-strong">From our families</p>
          <h2 id="voices-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">What families say.</h2>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            {testimonials.slice(0, 2).map((item) => (
              <figure key={`${item.momName}-${item.daughterName}`} className="rounded-2xl border border-line bg-white p-7 sm:p-9">
                <blockquote className="font-display text-2xl leading-snug text-ink">“{item.quote}”</blockquote>
                <figcaption className="mt-6 text-sm text-ink-soft">{item.momName}{item.location ? ` · ${item.location}` : ""}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      {testimonials.length === 0 && (
        <section className={`${sectionSpace} pb-16 sm:pb-24`} aria-labelledby="family-voices-title">
          <div className="rounded-2xl border border-line bg-white px-7 py-9 sm:px-10">
            <p className="text-xs font-semibold text-accent-strong">Family voices</p>
            <h2 id="family-voices-title" className="mt-3 font-display text-2xl text-ink">Family reviews</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">We publish family feedback only with permission. No reviews are available to share here yet.</p>
          </div>
        </section>
      )}

      <section className={`${sectionSpace} py-16 sm:py-24`} aria-labelledby="faq-title">
        <div className="grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold text-accent-strong">Good to know</p>
            <h2 id="faq-title" className="mt-3 font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">Frequently asked questions.</h2>
            <p className="mt-5 max-w-sm text-sm leading-6 text-ink-soft">Have a different question? Send it with your inquiry and we will answer directly.</p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {[
              { q: "What happens when I request a date?", a: "Send your date and preferred collection. We will confirm availability and the next steps with you. There is no payment in the initial request." },
              { q: "Can we plan in Spanish?", a: home.faq.items[1].a },
              { q: "Do you charge travel within Dallas–Fort Worth?", a: home.faq.items[2].a },
              { q: "What are the collection deposits?", a: `Essential ${packages[0].depositLabel}, Signature ${packages[1].depositLabel}, and Legacy ${packages[2].depositLabel}. Each deposit applies to its collection after your date is confirmed.` },
            ].map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">{item.q}<span aria-hidden="true" className="text-2xl font-light text-accent-strong group-open:rotate-45">+</span></summary>
                <p className="max-w-2xl pt-3 text-sm leading-6 text-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {site.social.instagram && (
        <section className="bg-white py-12 sm:py-16">
          <div className={`${sectionSpace} flex flex-col justify-between gap-5 sm:flex-row sm:items-center`}>
            <div>
              <p className="text-xs font-semibold text-accent-strong">Follow along</p>
              <h2 className="mt-2 font-display text-2xl text-ink sm:text-3xl">TX Quince on Instagram</h2>
            </div>
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex self-start rounded-full border border-ink px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">Visit @txquince <span aria-hidden="true" className="ml-3">↗</span></a>
          </div>
        </section>
      )}

      <section className={`${sectionSpace} py-16 sm:py-24`} aria-labelledby="date-title">
        <div className="grid gap-9 rounded-[1.5rem] bg-greige px-5 py-10 sm:rounded-[2rem] sm:px-10 sm:py-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14 lg:px-12">
          <div className="lg:pt-4">
            <p className="text-xs font-semibold text-accent-strong">Your celebration starts here</p>
            <h2 id="date-title" className="mt-4 max-w-xl font-display text-[clamp(1.875rem,3vw,2.875rem)] leading-tight text-ink">Check your celebration date.</h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-ink-soft">Tell us when and where you are celebrating. We will check the calendar personally and talk through the coverage that fits your family.</p>
            <p className="mt-5 text-sm font-medium text-ink">No payment is needed to ask.</p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
