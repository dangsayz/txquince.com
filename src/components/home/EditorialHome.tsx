import Image from "next/image";
import Link from "next/link";
import { EditOverlay } from "@/components/EditMode";
import { InquiryForm } from "@/components/InquiryForm";
import { VideoGallery } from "@/components/VideoGallery";
import { about } from "@/content/about";
import { home } from "@/content/home";
import { packages } from "@/content/packages";
import { portfolioFallback } from "@/content/portfolio-fallback";
import { altPhraseFor, categoryLabel, groupForCategory } from "@/content/portfolio-taxonomy";
import { releasedTestimonials } from "@/content/testimonials";
import { getFeaturedImages, getHeroMedia, getVideos } from "@/lib/content-db";
import { heroObjectPosition } from "@/lib/hero-focus";
import { publicPhotoCopy } from "@/lib/public-photo-copy";
import { HeroCarousel, type HeroSlide } from "@/components/home/HeroCarousel";

type EditorialImage = {
  id: string | null;
  url: string;
  alt: string;
  section: string;
  slug: string | null;
  focusX: number | null;
  focusY: number | null;
};

const words = {
  en: {
    title: "Quinceañera photography, seen her way.",
    heroKicker: "Quinceañera photography & film · Dallas–Fort Worth",
    heroBody: "For the portraits, traditions, and people she will always remember.",
    date: "Check her date",
    browse: "Explore the photographs",
    heroNote: "Real celebrations, photographed in Dallas–Fort Worth.",
    workRail: "Explore the work",
    workCategories: [
      ["All photographs", "/portfolio#photographs"],
      ["Before the day", "/portfolio#save-the-date"],
      ["Portraits", "/portfolio#portraits"],
      ["The celebration", "/portfolio#celebration"],
      ["Films", "/portfolio#films"],
    ],
    featureKicker: "Photography & film",
    featureTitle: "The whole day, beautifully remembered.",
    featurePhotoTitle: "The portrait, and the person.",
    featurePhotoBody: "Time for the quiet portraits, the family photographs, and everything that happens between them.",
    featureFilmTitle: "The moments that move.",
    featureFilmBody: "The voices, music, and celebrations belong in motion, too.",
    workKicker: "The work / 01",
    workTitle: "Every celebration has a story.",
    workBody: "The portraits, the people, the little in-between moments. Browse real celebrations photographed across Dallas–Fort Worth.",
    allWork: "See the complete portfolio",
    filmKicker: "In motion / 02",
    filmTitle: "And then, the day moves.",
    filmBody: "The music, the voices, the entrance. Film keeps the moments a photograph cannot hold.",
    allFilm: "Explore the films",
    priceKicker: "The collections / 03",
    priceTitle: "Choose how her story is kept.",
    priceBody: "Four clear collections, from focused coverage to a complete photo and film record.",
    priceNote: "A date request is free. We confirm availability and collection details before any deposit is due.",
    allPrices: "Compare the collections",
    choose: "Ask about this collection",
    processKicker: "The experience / 04",
    processTitle: "A considered path from hello to her day.",
    steps: [
      ["Look through the work", "Find the portraits, celebrations, and films that feel like her."],
      ["Tell us your date", "Share when and where you are celebrating. We will check availability personally."],
      ["Make a plan together", "Once the date and coverage are confirmed, we plan around your family and its traditions."],
    ],
    studioKicker: "The studio / 05",
    studioTitle: "Present for the moments that matter.",
    studioBody: about.approach.body,
    about: "Meet TX Quince",
    quoteKicker: "From our families",
    faqKicker: "Good to know / 06",
    faqTitle: "Before you ask about a date.",
    faq: [
      ["What happens when I request a date?", "Tell us your date and preferred collection. We check availability and reply with the next steps. There is no payment in the initial request."],
      ["Can we plan in Spanish?", home.faq.items[1].a],
      ["Do you travel throughout Dallas–Fort Worth?", home.faq.items[2].a],
    ],
    lastKicker: "Begin here",
    lastTitle: "Tell us about her day.",
    lastBody: "Send the date, location, and what you are imagining. We will reply personally with availability and a clear next step.",
  },
  es: {
    title: "Fotografía de quinceañera, a su manera.",
    heroKicker: "Fotografía y video de quinceañeras · Dallas–Fort Worth",
    heroBody: "Para recordar sus retratos, tradiciones y a quienes la acompañaron.",
    date: "Consulta su fecha",
    browse: "Explora las fotografías",
    heroNote: "Celebraciones reales, fotografiadas en Dallas–Fort Worth.",
    workRail: "Explora el trabajo",
    workCategories: [
      ["Todas las fotos", "/portfolio#photographs"],
      ["Antes del día", "/portfolio#save-the-date"],
      ["Retratos", "/portfolio#portraits"],
      ["La celebración", "/portfolio#celebration"],
      ["Videos", "/portfolio#films"],
    ],
    featureKicker: "Fotografía y video",
    featureTitle: "Un día entero para recordar.",
    featurePhotoTitle: "El retrato y la persona.",
    featurePhotoBody: "Tiempo para sus retratos, las fotos con su familia y los momentos entre ellos.",
    featureFilmTitle: "Los momentos en movimiento.",
    featureFilmBody: "Las voces, la música y la celebración también se recuerdan en video.",
    workKicker: "El trabajo / 01",
    workTitle: "Cada celebración tiene su historia.",
    workBody: "Los retratos, las personas y los momentos entre ellos. Conoce celebraciones reales en Dallas–Fort Worth.",
    allWork: "Ver todo el portafolio",
    filmKicker: "En movimiento / 02",
    filmTitle: "Y el día cobra movimiento.",
    filmBody: "La música, las voces, la entrada. El video conserva lo que una fotografía no puede guardar.",
    allFilm: "Explora los videos",
    priceKicker: "Las colecciones / 03",
    priceTitle: "Elige cómo recordar su historia.",
    priceBody: "Cuatro colecciones claras, desde cobertura enfocada hasta fotografía y video de todo el día.",
    priceNote: "Consultar una fecha es gratis. Confirmamos la disponibilidad y los detalles antes de solicitar un depósito.",
    allPrices: "Compara las colecciones",
    choose: "Pregunta por esta colección",
    processKicker: "La experiencia / 04",
    processTitle: "Del primer mensaje hasta su gran día.",
    steps: [
      ["Explora el trabajo", "Encuentra retratos, celebraciones y videos que se sientan como ella."],
      ["Cuéntanos la fecha", "Comparte cuándo y dónde celebran. Confirmaremos la disponibilidad personalmente."],
      ["Planeamos juntos", "Una vez confirmada la fecha y la cobertura, planeamos alrededor de su familia y tradiciones."],
    ],
    studioKicker: "El estudio / 05",
    studioTitle: "Presentes en los momentos importantes.",
    studioBody: "Fotografiamos los retratos, la ceremonia y la celebración con atención a las tradiciones de cada familia.",
    about: "Conoce TX Quince",
    quoteKicker: "Nuestras familias",
    faqKicker: "Lo que debes saber / 06",
    faqTitle: "Antes de consultar una fecha.",
    faq: [
      ["¿Qué pasa después de consultar una fecha?", "Comparte la fecha y la colección que te interesa. Confirmaremos disponibilidad y próximos pasos. La consulta inicial no requiere pago."],
      ["¿Podemos planear en español?", home.faq.items[1].a],
      ["¿Viajan por Dallas–Fort Worth?", home.faq.items[2].a],
    ],
    lastKicker: "Empecemos aquí",
    lastTitle: "Cuéntanos sobre su día.",
    lastBody: "Comparte la fecha, el lugar y lo que tienes en mente. Responderemos personalmente con disponibilidad y el siguiente paso.",
  },
} as const;

const spanishCollectionTeasers = {
  moments: "Cinco horas para los momentos principales del día.",
  essential: "Fotografía o video con un artista durante los momentos importantes.",
  signature: "Fotografía y video del día completo con dos artistas.",
  legacy: "Fotografía, video largo, tomas aéreas y álbum premium.",
} as const;

function photoHref(image: EditorialImage) {
  return image.id && image.slug
    ? `/photos/${encodeURIComponent(image.section)}/${encodeURIComponent(image.slug)}`
    : "/portfolio";
}

function photoPosition(image: Pick<EditorialImage, "focusX" | "focusY">) {
  return `${Math.round((image.focusX ?? 0.5) * 100)}% ${Math.round((image.focusY ?? 0.4) * 100)}%`;
}

function stageLabel(section: string, locale: "en" | "es") {
  if (locale === "en") return categoryLabel(section);
  const spanishLabels: Record<ReturnType<typeof groupForCategory>, string> = {
    before: "Antes del día",
    misa: "La misa",
    portraits: "Retratos",
    celebration: "La celebración",
    details: "Los detalles",
    vendors: "El equipo",
    films: "Videos",
  };
  return spanishLabels[groupForCategory(section)];
}

function WorkPhoto({ image, className = "", label, locale }: { image: EditorialImage; className?: string; label: string; locale: "en" | "es" }) {
  return (
    <figure className={`editorial-photo ${className}`}>
      <div className="editorial-photo-frame">
        <span className="editorial-photo-stage-label" aria-hidden="true">{label}</span>
        <Link href={photoHref(image)} aria-label={locale === "es" ? `Ver fotografía: ${image.alt}` : `View photograph: ${image.alt}`}>
          <Image src={image.url} alt={image.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" style={{ objectPosition: photoPosition(image) }} unoptimized={image.id === null} />
        </Link>
        {image.id && <EditOverlay image={{ id: image.id, slug: image.slug, alt: image.alt, fx: image.focusX, fy: image.focusY }} />}
      </div>
      <figcaption>{label} <span aria-hidden="true">↗</span></figcaption>
    </figure>
  );
}

export async function EditorialHome({ locale }: { locale: "en" | "es" }) {
  const [featured, videos, heroMedia] = await Promise.all([getFeaturedImages(12), getVideos(), getHeroMedia()]);
  const copy = words[locale];
  const isSpanish = locale === "es";
  const dateHref = isSpanish ? "/es/consulta" : "/check-your-date";
  const priceHref = isSpanish ? "/es/paquetes" : "/investment";
  const fallbackImages: EditorialImage[] = portfolioFallback.map((image) => ({
    id: null,
    url: image.url,
    alt: image.alt,
    section: image.section,
    slug: image.slug,
    focusX: null,
    focusY: image.url === portfolioFallback[0]?.url ? 0.78 : null,
  }));
  const images: EditorialImage[] = featured.length
    ? featured.map((image) => ({
        id: image.id,
        url: image.url,
        alt: publicPhotoCopy(image, altPhraseFor(image.section)).alt,
        section: image.section,
        slug: image.slug ?? null,
        focusX: image.focus_x ?? null,
        focusY: image.focus_y ?? null,
      }))
    : fallbackImages;
  const selectedHero = heroMedia?.kind === "image" && heroMedia.imageUrl
    ? { url: heroMedia.imageUrl, alt: heroMedia.imageAlt, id: null, slug: null, focusX: null, focusY: null }
    : heroMedia?.kind === "video" && heroMedia.posterUrl
      ? { url: heroMedia.posterUrl, alt: isSpanish ? "Escena de un video de quinceañera" : "Quinceañera film still", id: null, slug: null, focusX: null, focusY: null }
      : images[0] ?? null;
  const heroPosition = heroMedia?.kind === "image" ? heroObjectPosition(heroMedia) : selectedHero ? photoPosition(selectedHero) : "center";
  const carouselCandidates: HeroSlide[] = [
    ...portfolioFallback.filter((image) => image.url === "/portfolio/red-garden.webp" || image.url === "/portfolio/lilac-arch.webp"),
    ...portfolioFallback,
    ...images,
  ].map((image) => ({ url: image.url, alt: image.alt, position: "50% 45%" }));
  const initialSlide = selectedHero
    ? { url: selectedHero.url, alt: isSpanish ? "Retrato de una quinceañera en su celebración" : "Portrait of a quinceañera on her celebration day", position: heroPosition }
    : carouselCandidates[0];
  const remainingSlides = carouselCandidates.filter((image, index, all) =>
    image.url !== initialSlide?.url && all.findIndex((candidate) => candidate.url === image.url) === index,
  ).slice(0, 2);
  const heroSlides: HeroSlide[] = initialSlide
    ? [initialSlide, ...remainingSlides]
    : remainingSlides;
  const featuredWork = images.filter((image) => image.id && image.url !== selectedHero?.url);
  const portraitForWork = fallbackImages.find((image) => image.section === "portraits" && image.url !== selectedHero?.url);
  const celebrationForWork = fallbackImages.find((image) => image.section === "celebration" && image.url !== selectedHero?.url);
  const workCandidates = [featuredWork[0], portraitForWork, featuredWork[1], celebrationForWork, ...images, ...fallbackImages]
    .filter((image): image is EditorialImage => Boolean(image));
  const workImages = workCandidates
    .filter((image, index) => image.url !== selectedHero?.url && workCandidates.findIndex((item) => item.url === image.url) === index)
    .slice(0, 4);
  const filmPoster = videos.find((video) => video.poster_url);
  const testimonials = releasedTestimonials().slice(0, 1);

  return (
    <div className="editorial-home">
      <section className="editorial-hero" aria-labelledby="editorial-home-title">
        <div className="editorial-hero-content">
          <p className="editorial-overline">{copy.heroKicker}</p>
          <h1 id="editorial-home-title">{copy.title}</h1>
          <p className="editorial-hero-body">{copy.heroBody}</p>
          <div className="editorial-hero-actions">
            <Link href={dateHref} className="editorial-hero-action">{copy.date} <span aria-hidden="true">↗</span></Link>
            <Link href="#editorial-work" className="editorial-hero-secondary">{copy.browse} <span aria-hidden="true">↓</span></Link>
          </div>
          <p className="editorial-hero-note">{copy.heroNote}</p>
        </div>
        <div className="editorial-hero-showcase">
          <div className="editorial-hero-primary">
            {heroSlides.length > 0 ? (
              <HeroCarousel
                slides={heroSlides}
                locale={locale}
                firstSlideOverlay={selectedHero && (heroMedia?.kind === "image"
                  ? <EditOverlay image={{ alt: selectedHero.alt }} editHref="/admin/hero#framing" label="Set focal point" />
                  : selectedHero.id && <EditOverlay image={{ id: selectedHero.id, slug: selectedHero.slug, alt: selectedHero.alt, fx: selectedHero.focusX, fy: selectedHero.focusY }} />)}
              />
            ) : (
              <div className="editorial-hero-empty">{isSpanish ? "Fotografía de quinceañera" : "Quinceañera photography"}</div>
            )}
            <span className="editorial-hero-primary-label">01 / {isSpanish ? "Imagen destacada" : "Featured photograph"}</span>
          </div>
          <div className="editorial-hero-accent">
            <span>{isSpanish ? "El día es suyo" : "A day all her own"}</span>
            {workImages[0] && (
              <div className="editorial-hero-accent-photo">
                <Image src={workImages[0].url} alt={workImages[0].alt} fill sizes="(max-width: 767px) 34vw, 15vw" className="object-cover" style={{ objectPosition: photoPosition(workImages[0]) }} unoptimized={workImages[0].id === null} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="editorial-work" className="editorial-section editorial-work" aria-labelledby="editorial-work-title">
        <aside className="editorial-work-rail" aria-label={copy.workRail}>
          <p className="editorial-work-rail-title">TX Quince</p>
          <h2 id="editorial-work-title">{copy.workRail}</h2>
          <nav aria-label={copy.workRail}>
            {copy.workCategories.map(([label, href]) => (
              <Link key={href} href={href}>{label} <span aria-hidden="true">↗</span></Link>
            ))}
          </nav>
        </aside>
        <div className="editorial-work-content">
          <div className="editorial-work-heading">
            <div><p className="editorial-overline">{copy.workKicker}</p><p>{copy.workTitle}</p></div>
            <p>{copy.workBody}</p>
          </div>
          {workImages.length > 0 ? (
            <div className="editorial-work-grid">
              {workImages.map((image, index) => (
                <WorkPhoto key={image.id ?? image.url} image={image} label={stageLabel(image.section, locale)} locale={locale} className={`editorial-work-photo-${index + 1}`} />
              ))}
            </div>
          ) : (
            <p className="editorial-empty">{isSpanish ? "Las fotografías no están disponibles por ahora." : "Portfolio photographs are unavailable right now."}</p>
          )}
          <Link href="/portfolio" className="editorial-text-link">{copy.allWork} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="editorial-features" aria-labelledby="editorial-features-title">
        <div className="editorial-section">
          <div className="editorial-features-heading">
            <p className="editorial-overline">{copy.featureKicker}</p>
            <h2 id="editorial-features-title">{copy.featureTitle}</h2>
          </div>
          <div className="editorial-feature-grid">
            <article className="editorial-feature-card">
              <div>
                <span className="editorial-feature-number">01 / {isSpanish ? "Fotografía" : "Photography"}</span>
                <h3>{copy.featurePhotoTitle}</h3>
                <p>{copy.featurePhotoBody}</p>
                <Link href="/portfolio#photographs" className="editorial-text-link">{copy.allWork} <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="editorial-feature-art editorial-feature-art-photo">
                {portraitForWork && <Image src={portraitForWork.url} alt={portraitForWork.alt} fill sizes="(max-width: 767px) 80vw, 40vw" className="object-cover" style={{ objectPosition: photoPosition(portraitForWork) }} unoptimized />}
              </div>
            </article>
            <article className="editorial-feature-card">
              <div>
                <span className="editorial-feature-number">02 / {isSpanish ? "Video" : "Film"}</span>
                <h3>{copy.featureFilmTitle}</h3>
                <p>{copy.featureFilmBody}</p>
                <Link href={isSpanish ? "/es/videografo-de-quinceaneras" : "/portfolio#films"} className="editorial-text-link">{copy.allFilm} <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="editorial-feature-art editorial-feature-art-film">
                {filmPoster?.poster_url ? (
                  <Image src={filmPoster.poster_url} alt={isSpanish ? `Fotograma del video ${filmPoster.title || "de quinceañera"}` : `Still from ${filmPoster.title || "a quinceañera film"}`} fill sizes="(max-width: 767px) 80vw, 40vw" className="object-cover" unoptimized />
                ) : (
                  <div className="editorial-feature-film-fallback" aria-hidden="true"><span>TX QUINCE</span><span>{isSpanish ? "En movimiento" : "In motion"}</span></div>
                )}
              </div>
            </article>
          </div>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="editorial-film" aria-labelledby="editorial-film-title">
          <div className="editorial-section">
            <div className="editorial-intro editorial-intro-light">
              <p className="editorial-overline">{copy.filmKicker}</p>
              <h2 id="editorial-film-title">{copy.filmTitle}</h2>
              <div><p>{copy.filmBody}</p><Link href={isSpanish ? "/es/videografo-de-quinceaneras" : "/portfolio#films"} className="editorial-text-link">{copy.allFilm} <span aria-hidden="true">↗</span></Link></div>
            </div>
            <VideoGallery videos={videos.filter((video) => video.orientation !== "vertical").slice(0, 2)} />
          </div>
        </section>
      )}

      <section className="editorial-section editorial-pricing" aria-labelledby="editorial-pricing-title">
        <div className="editorial-intro">
          <p className="editorial-overline">{copy.priceKicker}</p>
          <h2 id="editorial-pricing-title">{copy.priceTitle}</h2>
          <div><p>{copy.priceBody}</p><Link href={priceHref} className="editorial-text-link">{copy.allPrices} <span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className="editorial-price-list">
          {packages.map((item, index) => (
            <Link key={item.id} href={isSpanish ? priceHref : `/reserve?collection=${item.id}`} className="editorial-price-row" aria-label={`${copy.choose}: ${item.name}, ${item.priceLabel}`}>
              <span className="editorial-price-number">0{index + 1}</span>
              <span className="editorial-price-name">{item.name}<small>{isSpanish ? spanishCollectionTeasers[item.id] : item.teaser}</small></span>
              <span className="editorial-price-value">{item.priceLabel}</span>
              <span className="editorial-price-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <p className="editorial-price-note">{copy.priceNote}</p>
      </section>

      <section className="editorial-process" aria-labelledby="editorial-process-title">
        <div className="editorial-section">
          <div className="editorial-intro">
            <p className="editorial-overline">{copy.processKicker}</p>
            <h2 id="editorial-process-title">{copy.processTitle}</h2>
          </div>
          <ol className="editorial-steps">
            {copy.steps.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="editorial-section editorial-studio" aria-labelledby="editorial-studio-title">
        <div className="editorial-studio-image">
          {images[5] && <Image src={images[5].url} alt={images[5].alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" unoptimized={images[5].id === null} />}
        </div>
        <div className="editorial-studio-copy">
          <p className="editorial-overline">{copy.studioKicker}</p>
          <h2 id="editorial-studio-title">{copy.studioTitle}</h2>
          <p>{copy.studioBody}</p>
          <Link href="/about" className="editorial-text-link">{copy.about} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      {testimonials.map((item) => <figure className="editorial-quote" key={`${item.momName}-${item.daughterName}`}><p className="editorial-overline">{copy.quoteKicker}</p><blockquote>“{item.quote}”</blockquote><figcaption>{item.momName}{item.location ? ` · ${item.location}` : ""}</figcaption></figure>)}

      <section className="editorial-section editorial-faq" aria-labelledby="editorial-faq-title">
        <div><p className="editorial-overline">{copy.faqKicker}</p><h2 id="editorial-faq-title">{copy.faqTitle}</h2></div>
        <div className="editorial-questions">{copy.faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>

      <section className="editorial-contact" aria-labelledby="editorial-contact-title">
        <div className="editorial-section editorial-contact-grid">
          <div><p className="editorial-overline">{copy.lastKicker}</p><h2 id="editorial-contact-title">{copy.lastTitle}</h2><p>{copy.lastBody}</p></div>
          {isSpanish ? <Link href={dateHref} className="editorial-contact-link">{copy.date} <span aria-hidden="true">↗</span></Link> : <InquiryForm />}
        </div>
      </section>
    </div>
  );
}
