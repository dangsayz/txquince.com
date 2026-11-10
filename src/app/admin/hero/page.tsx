import { StudioPage, StudioSection } from "@/components/admin/StudioPage";
import { HomeClipManager } from "@/components/admin/HomeClipManager";
import { getHomeClips } from "@/lib/home-clips";
import Link from "next/link";
import {
  getPageHero,
  getPortfolioImages,
  HERO_PAGES,
} from "@/lib/content-db";
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
  const [clips, allImages, ...currents] = await Promise.all([
    getHomeClips(),
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
    <StudioPage
      wide
      title="Page imagery"
      intro="The film loops on the homepage and the first photo on each page."
      actions={
        <Link href="/admin/images" className="st-btn-ghost whitespace-nowrap">
          Homepage photos
        </Link>
      }
    >
      <StudioSection title="Film loop at the top of the homepage" intro="A short silent clip that plays over the first photo a family sees.">
        <HomeClipManager slot="hero" place="at the top of the homepage" initial={clips.hero ?? null} />
      </StudioSection>
      <StudioSection title="Film loop behind the featured package" intro="A short silent clip that plays behind the featured package. It also adds a “Watch our films” button there.">
        <HomeClipManager slot="feature" place="behind the featured package" initial={clips.feature ?? null} />
      </StudioSection>
      {/* The homepage's photos (top photo, featured-package background, questions)
          are image slots: Every image, or "Replace photo" on the live page. */}
      <StudioSection title="Other pages" intro="Pick a portfolio photograph, or leave it on the featured image.">
        <PageHeroManager pages={pages} library={library} />
      </StudioSection>
    </StudioPage>
  );
}
