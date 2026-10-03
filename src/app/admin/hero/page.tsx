import {
  getHeroMedia,
  getPageHero,
  getPortfolioImages,
  HERO_PAGES,
} from "@/lib/content-db";
import { HeroManager } from "@/components/admin/HeroManager";
import {
  PageHeroManager,
  type HeroPageRow,
  type HeroLibraryItem,
} from "@/components/admin/PageHeroManager";

export const dynamic = "force-dynamic";

export default async function AdminHero() {
  const pageKeys = Object.keys(HERO_PAGES);
  const [media, allImages, ...currents] = await Promise.all([
    getHeroMedia(),
    getPortfolioImages(),
    ...pageKeys.map((k) => getPageHero(k)),
  ]);

  const library: HeroLibraryItem[] = allImages
    .filter((i) => i.slug)
    .map((i) => ({
      slug: i.slug as string,
      url: i.url,
      alt: i.alt || "Quinceañera",
      section: i.section,
      landscape: (i.width ?? 0) >= (i.height ?? 0),
    }));

  const pages: HeroPageRow[] = pageKeys.map((k, idx) => {
    const img = currents[idx];
    return {
      key: k,
      label: HERO_PAGES[k].label,
      current: img?.slug
        ? { slug: img.slug, url: img.url, alt: img.alt || "Quinceañera" }
        : null,
    };
  });

  return (
    <main className="mx-auto max-w-[90rem] px-5 pb-20 pt-8 md:px-10 md:pt-12 lg:px-16">
      <div className="border-b border-neutral-200 pb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Website / Art direction</p>
        <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-neutral-950">Page imagery</h1>
        <p className="mt-2 text-sm text-neutral-600">Choose the opening image or film for each page.</p>
      </div>
      <div className="mt-8">
        <HeroManager initial={media} library={allImages.flatMap((image) => image.slug ? [{
          slug: image.slug,
          url: image.url,
          alt: image.alt || "Quinceañera portrait",
          width: image.width,
          height: image.height,
          focusX: image.focus_x ?? null,
          focusY: image.focus_y ?? null,
        }] : [])} />
      </div>

      <div className="mt-14 border-t border-neutral-200 pt-10">
        <h2 className="text-xl font-medium tracking-[-0.03em] text-neutral-950">Other pages</h2>
        <p className="mt-2 text-sm text-neutral-600">Select a portfolio photograph or use the featured image automatically.</p>
        <div className="mt-8">
          <PageHeroManager pages={pages} library={library} />
        </div>
      </div>
    </main>
  );
}
