import { StudioPage } from "@/components/admin/StudioPage";
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
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminHero() {
  await requireAdminPage("/admin/hero"); // server-side gate; middleware is not enough
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
    <StudioPage wide title="Page imagery" intro="The first image or film on each page.">
      <div className="min-w-0">
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

      <div className="mt-8 border-t border-[var(--tq-surface-2)] pt-8">
        <h2 className="st-h2">Other pages</h2>
        <p className="st-note mt-1">Pick a portfolio photograph, or leave it on the featured image.</p>
        <div className="mt-6">
          <PageHeroManager pages={pages} library={library} />
        </div>
      </div>
    </StudioPage>
  );
}
