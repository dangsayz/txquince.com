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
      <header className="relative isolate min-h-[34rem] overflow-hidden bg-ink text-white sm:min-h-[42rem]" aria-labelledby="areas-title">
        <Image src={hero?.url ?? "/portfolio/kimberly-reception.webp"} alt={hero ? publicPhotoCopy(hero, "Retrato de quinceañera").alt : "Celebración de quinceañera en Dallas–Fort Worth"} fill priority sizes="100vw" className="object-cover" style={hero ? { objectPosition: focal(hero.focus_x, hero.focus_y) } : { objectPosition: "center 60%" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/10" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[34rem] max-w-[88rem] flex-col justify-between px-5 pb-10 pt-8 sm:min-h-[42rem] sm:px-8 sm:pb-14 lg:px-12">
          <p className="text-xs uppercase tracking-[0.2em] text-white/90">TX Quince / Dónde trabajamos</p>
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-white/75">Dallas–Fort Worth, Texas</p>
            <h1 id="areas-title" className="mt-4 max-w-[19ch] font-display text-[clamp(2.25rem,4.5vw,4.25rem)] font-normal leading-[1.06] tracking-[-0.035em]">Su historia, en cualquier lugar del día.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">De la iglesia al salón, fotografiamos y filmamos quinceañeras por todo el metroplex.</p>
            <a href="#ciudades" className="mt-8 inline-flex min-h-12 items-center gap-4 border-b border-white pb-1 text-base">Encuentra tu ciudad <span aria-hidden="true">↓</span></a>
          </div>
        </div>
      </header>

      <section id="ciudades" className="scroll-mt-24 bg-[#f4f2ee]" aria-labelledby="ciudades-title">
        <div className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] lg:items-end lg:gap-16">
            <div><p className="text-xs uppercase tracking-[0.18em] text-ink-soft">Explora la zona</p><h2 id="ciudades-title" className="mt-4 max-w-[18ch] font-display text-[clamp(1.875rem,3vw,3rem)] font-normal leading-tight text-ink">Cada ciudad tiene su propia historia.</h2></div>
            <p className="max-w-lg text-base leading-7 text-ink-soft">Elige tu ciudad para ver ideas de retratos, lugares y detalles de la cobertura. La planeación está disponible en español e inglés.</p>
          </div>
          <ol className="mt-12 grid border-t border-ink/25 lg:mt-16 lg:grid-cols-2 lg:gap-x-14">
            {locations.map((location, index) => {
              const image = imageFor(index);
              return <li key={location.slug} className="min-w-0 border-b border-ink/25">
                <Link href={"/es/fotografo-de-quinceaneras/" + location.slug} className="group grid min-h-28 grid-cols-[2rem_minmax(0,1fr)_5.5rem] items-center gap-3 py-4 text-ink sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem] sm:gap-5" aria-label={"Ver fotografía de quinceañera en " + location.city}>
                  <span className="self-start pt-2 text-xs text-ink-faint">0{index + 1}</span>
                  <span className="min-w-0"><span className="block font-display text-[clamp(1.375rem,2.3vw,2rem)] font-normal leading-tight">{location.city}</span><span className="mt-2 block text-sm leading-5 text-ink-soft">{location.county}</span></span>
                  <span className="relative block aspect-[4/3] overflow-hidden bg-greige">{image?.url ? <Image src={image.url} alt={publicPhotoCopy(image, "Retrato de quinceañera").alt} fill sizes="(max-width: 640px) 88px, 112px" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" style={{ objectPosition: focal(image.focus_x, image.focus_y) }} /> : <span aria-hidden="true" className="flex h-full items-center justify-center text-2xl">↗</span>}</span>
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
