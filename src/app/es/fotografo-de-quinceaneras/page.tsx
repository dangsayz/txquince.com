import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { locations } from "@/content/locations";
import { getFeaturedImages, getImagesByCity, getPageHero } from "@/lib/content-db";
import { publicPhotoCopy } from "@/lib/public-photo-copy";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Fotógrafo de Quinceañeras — Dallas–Fort Worth",
  description: "Fotografía y video de quinceañera en todo Dallas–Fort Worth — Grand Prairie, Irving, Garland, Dallas, Fort Worth, Arlington, Mansfield y Farmers Branch. Colecciones a precio fijo desde $1,800.",
  alternates: {
    canonical: "/es/fotografo-de-quinceaneras",
    languages: {
      "en-US": site.url + "/quinceanera-photographer",
      "es-MX": site.url + "/es/fotografo-de-quinceaneras",
      "x-default": site.url + "/quinceanera-photographer",
    },
  },
  openGraph: {
    title: "Fotógrafo de Quinceañeras — Dallas–Fort Worth · " + site.brand,
    description: "Fotografía y video de quinceañera en todo el metroplex de DFW. Colecciones a precio fijo desde $1,800.",
    url: site.url + "/es/fotografo-de-quinceaneras",
    locale: "es_MX",
  },
};

function focal(fx?: number | null, fy?: number | null): string {
  return String(Math.round((fx ?? 0.5) * 100)) + "% " + String(Math.round((fy ?? 0.32) * 100)) + "%";
}

const fallbackCityPhotos = [
  "/portfolio/hero.webp", "/portfolio/reception.webp", "/portfolio/red-garden.webp", "/portfolio/lilac-arch.webp",
  "/portfolio/save-date.webp", "/portfolio/kimberly-reception.webp", "/portfolio/dance.webp", "/portfolio/shoe-ceremony.webp",
];

export default async function LocationsHubEs() {
  const [imgs, assignedHero, cityPhotoSets] = await Promise.all([
    getFeaturedImages(24),
    getPageHero("areas"),
    Promise.all(locations.map((location) => getImagesByCity(location.slug, 2))),
  ]);
  const hero = assignedHero ?? imgs.find((image) => (image.width ?? 0) >= (image.height ?? 0)) ?? imgs[0] ?? null;
  const cityImages = imgs.filter((image) => image.url !== hero?.url);
  const imageFor = (index: number) =>
    cityPhotoSets[index].find((image) => image.url !== hero?.url) ??
    (cityImages.length ? cityImages[index % cityImages.length] : (imgs[0] ?? null));

  return (
    <>
      <header className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-ink text-white sm:min-h-[80svh]" aria-labelledby="areas-title">
        <Image src={hero?.url ?? "/portfolio/kimberly-reception.webp"} alt={hero ? publicPhotoCopy(hero, "Retrato de quinceañera").alt : "Celebración de quinceañera en Dallas–Fort Worth"} fill priority sizes="100vw" className="object-cover" style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : { objectPosition: "center 60%" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[90rem] px-5 pb-12 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
          <p className="text-xs uppercase tracking-[0.24em] text-white/85">TX Quince / Dónde trabajamos</p>
          <h1 id="areas-title" className="mt-5 max-w-3xl font-display text-[clamp(2.15rem,4vw,4rem)] font-light leading-[1.14]">Por todo Dallas–Fort Worth</h1>
        </div>
      </header>

      <section className="bg-ivory px-5 py-20 sm:px-10 sm:py-28">
        <div className="mx-auto grid max-w-[78rem] gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-20">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Fotografiando su día</p>
          <div><p className="max-w-[29ch] font-display text-[clamp(1.85rem,3vw,3rem)] font-light leading-[1.24] text-ink">De la iglesia al último baile, dondequiera que celebres.</p><p className="mt-6 max-w-xl text-base leading-8 text-ink-soft">Fotografiamos y filmamos quinceañeras por todo Dallas–Fort Worth. Descubre las ciudades donde trabajamos y las celebraciones reales detrás de las imágenes.</p><a href="#ciudades" className="mt-7 inline-flex min-h-12 items-center gap-4 border-b border-ink text-xs uppercase tracking-[0.16em] text-ink">Encuentra tu ciudad <span aria-hidden="true">↓</span></a></div>
        </div>
      </section>

      <section id="ciudades" className="scroll-mt-24 bg-white" aria-labelledby="ciudades-title">
        <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:items-end lg:gap-16">
            <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Explora la zona</p><h2 id="ciudades-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">Cada ciudad tiene su propia historia.</h2></div>
            <p className="max-w-lg text-base leading-7 text-ink-soft">Elige tu ciudad para ver ideas de retratos, lugares y detalles de la cobertura. La planeación está disponible en español e inglés.</p>
          </div>
          <ol className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-x-7">
            {locations.map((location, index) => {
              const image = imageFor(index);
              return <li key={location.slug} className="min-w-0">
                <Link href={"/es/fotografo-de-quinceaneras/" + location.slug} className="group block text-ink" aria-label={"Ver fotografía de quinceañera en " + location.city}>
                  <span className="relative block aspect-[4/5] overflow-hidden bg-greige"><Image src={image?.url ?? fallbackCityPhotos[index]} alt={image ? publicPhotoCopy(image, "Retrato de quinceañera").alt : "Quinceañera fotografiada por TX Quince"} fill unoptimized={!image} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" style={image ? { objectPosition: focal(image.focus_x, image.focus_y) } : { objectPosition: "center 35%" }} /></span>
                  <span className="mt-4 flex items-baseline justify-between gap-3 border-b border-ink/25 pb-4"><span className="font-display text-[clamp(1.5rem,2vw,2rem)] font-light leading-tight">{location.city}</span><span className="shrink-0 text-xs uppercase tracking-[0.12em] text-ink-soft">0{index + 1} ↗</span></span>
                  <span className="mt-2 block text-sm leading-5 text-ink-soft">{location.county}</span>
                </Link>
              </li>;
            })}
          </ol>
        </div>
      </section>

      <section className="bg-white" aria-labelledby="coverage-title">
        <div className="mx-auto grid max-w-[88rem] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:gap-20 lg:px-12 lg:py-24">
          <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Más allá del mapa</p><h2 id="coverage-title" className="mt-4 max-w-[20ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">Del primer retrato al último baile.</h2></div>
          <div><p className="max-w-lg text-base leading-7 text-ink-soft">Planeamos alrededor de tu iglesia, el lugar de retratos y el salón. Explora el trabajo y las cuatro colecciones; luego dinos qué fecha tienes en mente.</p><div className="mt-8 flex flex-wrap gap-x-8 gap-y-3"><Link href="/portfolio" className="inline-flex min-h-11 items-center gap-3 border-b border-ink text-base text-ink">Ver fotografías ↗</Link><Link href="/es/paquetes" className="inline-flex min-h-11 items-center gap-3 border-b border-ink text-base text-ink">Ver colecciones ↗</Link><Link href="/es/consulta" className="inline-flex min-h-11 items-center gap-3 border-b border-ink text-base text-ink">Consultar fecha ↗</Link></div></div>
        </div>
      </section>
    </>
  );
}
