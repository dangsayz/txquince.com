import Image from "next/image";
import Link from "next/link";
import { EditOverlay } from "@/components/EditMode";
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
import "./pixieset-home.css";

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
    title: "Her quinceañera. Her story.",
    heroKicker: "Quinceañera photography & film · Dallas–Fort Worth",
    heroBody: "The portraits, traditions, and people who made the day hers.",
    date: "Check her date",
    browse: "Explore the photographs",
    workRail: "Explore the work",
    featureKicker: "Photography & film",
    featureTitle: "Portraits, traditions, and the moments between.",
    featurePhotoBody: "Time for the quiet portraits, the family photographs, and everything that happens between them.",
    workKicker: "Selected work",
    workTitle: "The details she chose. The people who showed up.",
    workBody: "The portraits, the people, the little in-between moments. Browse real celebrations photographed across Dallas–Fort Worth.",
    allWork: "See the complete portfolio",
    filmKicker: "In motion",
    filmTitle: "And then, the day moves.",
    filmBody: "The music, the voices, the entrance. Film keeps the moments a photograph cannot hold.",
    allFilm: "Explore the films",
    priceKicker: "The collections",
    priceTitle: "Choose how her story is kept.",
    priceBody: "Four clear collections, from focused coverage to a complete photo and film record.",
    priceNote: "A date request is free. We confirm availability and collection details before any deposit is due.",
    allPrices: "Compare the collections",
    choose: "Ask about this collection",
    processKicker: "The experience",
    processTitle: "A considered path from hello to her day.",
    steps: [
      ["Look through the work", "Find the portraits, celebrations, and films that feel like her."],
      ["Tell us your date", "Share when and where you are celebrating. We will check availability personally."],
      ["Make a plan together", "Once the date and coverage are confirmed, we plan around your family and its traditions."],
    ],
    studioKicker: "The studio",
    studioTitle: "Present for the moments that matter.",
    studioBody: about.approach.body,
    about: "Meet TX Quince",
    quoteKicker: "From our families",
    faqKicker: "Good to know",
    faqTitle: "Before you ask about a date.",
    faq: [
      ["What happens when I request a date?", "Tell us your date and preferred collection. We check availability and reply with the next steps. There is no payment in the initial request."],
      ["Can we plan in Spanish?", home.faq.items[1].a],
      ["Do you travel throughout Dallas–Fort Worth?", home.faq.items[2].a],
    ],
  },
  es: {
    title: "Sus quince años. Su historia.",
    heroKicker: "Fotografía y video de quinceañeras · Dallas–Fort Worth",
    heroBody: "Para recordar sus retratos, tradiciones y a quienes la acompañaron.",
    date: "Consulta su fecha",
    browse: "Explora las fotografías",
    workRail: "Explora el trabajo",
    featureKicker: "Fotografía y video",
    featureTitle: "Retratos, tradiciones y los momentos entre ellos.",
    featurePhotoBody: "Tiempo para sus retratos, las fotos con su familia y los momentos entre ellos.",
    workKicker: "Trabajo destacado",
    workTitle: "Los detalles que eligió. Quienes la acompañaron.",
    workBody: "Los retratos, las personas y los momentos entre ellos. Conoce celebraciones reales en Dallas–Fort Worth.",
    allWork: "Ver todo el portafolio",
    filmKicker: "En movimiento",
    filmTitle: "Y el día cobra movimiento.",
    filmBody: "La música, las voces, la entrada. El video conserva lo que una fotografía no puede guardar.",
    allFilm: "Explora los videos",
    priceKicker: "Las colecciones",
    priceTitle: "Elige cómo recordar su historia.",
    priceBody: "Cuatro colecciones claras, desde cobertura enfocada hasta fotografía y video de todo el día.",
    priceNote: "Consultar una fecha es gratis. Confirmamos la disponibilidad y los detalles antes de solicitar un depósito.",
    allPrices: "Compara las colecciones",
    choose: "Pregunta por esta colección",
    processKicker: "La experiencia",
    processTitle: "Del primer mensaje hasta su gran día.",
    steps: [
      ["Explora el trabajo", "Encuentra retratos, celebraciones y videos que se sientan como ella."],
      ["Cuéntanos la fecha", "Comparte cuándo y dónde celebran. Confirmaremos la disponibilidad personalmente."],
      ["Planeamos juntos", "Una vez confirmada la fecha y la cobertura, planeamos alrededor de su familia y tradiciones."],
    ],
    studioKicker: "El estudio",
    studioTitle: "Presentes en los momentos importantes.",
    studioBody: "Fotografiamos los retratos, la ceremonia y la celebración con atención a las tradiciones de cada familia.",
    about: "Conoce TX Quince",
    quoteKicker: "Nuestras familias",
    faqKicker: "Lo que debes saber",
    faqTitle: "Antes de consultar una fecha.",
    faq: [
      ["¿Qué pasa después de consultar una fecha?", "Comparte la fecha y la colección que te interesa. Confirmaremos disponibilidad y próximos pasos. La consulta inicial no requiere pago."],
      ["¿Podemos planear en español?", home.faq.items[1].a],
      ["¿Viajan por Dallas–Fort Worth?", home.faq.items[2].a],
    ],
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
    <figure className={`pix-home-photo ${className}`}>
      <div className="pix-home-photo-frame">
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
    focusY: image.url === portfolioFallback[0]?.url ? 0.64 : null,
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
  const storyImage = images[5] ?? fallbackImages[5];
  const studioImage = images[7] ?? fallbackImages[7];
  const testimonials = releasedTestimonials().slice(0, 1);

  return (
    <div className="pix-home">
      <section className="pix-home-hero" aria-labelledby="pix-home-title">
        {heroSlides.length > 0 ? (
          <HeroCarousel
            slides={heroSlides}
            locale={locale}
            firstSlideOverlay={selectedHero && (heroMedia?.kind === "image"
              ? <EditOverlay image={{ alt: selectedHero.alt }} editHref="/admin/hero#framing" label="Set focal point" />
              : selectedHero.id && <EditOverlay image={{ id: selectedHero.id, slug: selectedHero.slug, alt: selectedHero.alt, fx: selectedHero.focusX, fy: selectedHero.focusY }} />)}
          />
        ) : <div className="pix-home-hero-empty">TX Quince</div>}
        <div className="pix-home-hero-shade" aria-hidden="true" />
        <div className="pix-home-hero-content">
          <p className="pix-home-eyebrow">{copy.heroKicker}</p>
          <h1 id="pix-home-title">{copy.title}</h1>
          <p className="pix-home-hero-body">{copy.heroBody}</p>
          <div className="pix-home-hero-actions">
            <Link href="#pix-home-work">{copy.browse} <span aria-hidden="true">↓</span></Link>
            <Link href={dateHref}>{copy.date} <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <span className="pix-home-hero-side" aria-hidden="true">TX Quince / {copy.workRail}</span>
      </section>

      <section id="pix-home-work" className="pix-home-work" aria-labelledby="pix-home-work-title">
        <div className="pix-home-intro">
          <p className="pix-home-eyebrow">{copy.workKicker}</p>
          <h2 id="pix-home-work-title">{copy.workTitle}</h2>
          <p>{copy.workBody}</p>
        </div>
        {workImages.length > 0 ? (
          <div className="pix-home-work-grid">
            {workImages.map((image, index) => <WorkPhoto key={image.id ?? image.url} image={image} label={stageLabel(image.section, locale)} locale={locale} className={`pix-home-photo-${index + 1}`} />)}
          </div>
        ) : <p className="pix-home-empty">{isSpanish ? "Las fotografías no están disponibles por ahora." : "Portfolio photographs are unavailable right now."}</p>}
        <Link href="/portfolio" className="pix-home-text-link pix-home-work-more">{copy.allWork} <span aria-hidden="true">↗</span></Link>
      </section>

      <section className="pix-home-story" aria-labelledby="pix-home-story-title">
        <div className="pix-home-story-image">
          {storyImage && <Image src={storyImage.url} alt={storyImage.alt} fill sizes="(max-width: 767px) 100vw, 55vw" className="object-cover" style={{ objectPosition: photoPosition(storyImage) }} unoptimized={storyImage.id === null} />}
        </div>
        <div className="pix-home-story-copy">
          <p className="pix-home-eyebrow">{copy.featureKicker}</p>
          <h2 id="pix-home-story-title">{copy.featureTitle}</h2>
          <p>{copy.featurePhotoBody}</p>
          <Link href="/portfolio#photographs" className="pix-home-text-link">{copy.allWork} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="pix-home-film" aria-labelledby="pix-home-film-title">
          <div className="pix-home-section-heading">
            <div><p className="pix-home-eyebrow">{copy.filmKicker}</p><h2 id="pix-home-film-title">{copy.filmTitle}</h2></div>
            <div><p>{copy.filmBody}</p><Link href={isSpanish ? "/es/videografo-de-quinceaneras" : "/portfolio#films"} className="pix-home-text-link">{copy.allFilm} <span aria-hidden="true">↗</span></Link></div>
          </div>
          <VideoGallery videos={videos.filter((video) => video.orientation !== "vertical").slice(0, 2)} />
        </section>
      )}

      <section className="pix-home-pricing" aria-labelledby="pix-home-pricing-title">
        <div className="pix-home-section-heading">
          <div><p className="pix-home-eyebrow">{copy.priceKicker}</p><h2 id="pix-home-pricing-title">{copy.priceTitle}</h2></div>
          <div><p>{copy.priceBody}</p><Link href={priceHref} className="pix-home-text-link">{copy.allPrices} <span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className="pix-home-price-list">
          {packages.map((item, index) => (
            <Link key={item.id} href={isSpanish ? priceHref : `/reserve?collection=${item.id}`} className="pix-home-price-row" aria-label={`${copy.choose}: ${item.name}, ${item.priceLabel}`}>
              <span className="pix-home-price-index">0{index + 1}</span>
              <span className="pix-home-price-name">{item.name}<small>{isSpanish ? spanishCollectionTeasers[item.id] : item.teaser}</small></span>
              <span className="pix-home-price-value">{item.priceLabel}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <p className="pix-home-price-note">{copy.priceNote}</p>
      </section>

      <section className="pix-home-process" aria-labelledby="pix-home-process-title">
        <div className="pix-home-section-heading"><div><p className="pix-home-eyebrow">{copy.processKicker}</p><h2 id="pix-home-process-title">{copy.processTitle}</h2></div></div>
        <ol>
          {copy.steps.map(([title, body], index) => <li key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></li>)}
        </ol>
      </section>

      <section className="pix-home-studio" aria-labelledby="pix-home-studio-title">
        <div className="pix-home-studio-photo">
          {studioImage && <Image src={studioImage.url} alt={studioImage.alt} fill sizes="(max-width: 767px) 100vw, 55vw" className="object-cover" style={{ objectPosition: photoPosition(studioImage) }} unoptimized={studioImage.id === null} />}
        </div>
        <div className="pix-home-studio-copy">
          <p className="pix-home-eyebrow">{copy.studioKicker}</p>
          <h2 id="pix-home-studio-title">{copy.studioTitle}</h2>
          <p>{copy.studioBody}</p>
          <Link href="/about" className="pix-home-text-link">{copy.about} <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      {testimonials.map((item) => <figure className="pix-home-quote" key={`${item.momName}-${item.daughterName}`}><p className="pix-home-eyebrow">{copy.quoteKicker}</p><blockquote>“{item.quote}”</blockquote><figcaption>{item.momName}{item.location ? ` · ${item.location}` : ""}</figcaption></figure>)}

      <section className="pix-home-faq" aria-labelledby="pix-home-faq-title">
        <div><p className="pix-home-eyebrow">{copy.faqKicker}</p><h2 id="pix-home-faq-title">{copy.faqTitle}</h2></div>
        <div className="pix-home-faq-list">{copy.faq.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>
      </section>

    </div>
  );
}
