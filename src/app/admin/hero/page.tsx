import Link from "next/link";
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
    <main className="mx-auto max-w-5xl px-5 py-10 md:px-10 md:py-14">
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center text-sm font-medium text-ink-soft hover:text-ink"
      >
        ← Studio
      </Link>
      <h1 className="mt-4 font-display text-[clamp(1.75rem,2.8vw,2.25rem)] leading-tight text-ink">Homepage hero</h1>
      <p className="mt-3 text-base leading-7 text-ink-soft">
        The big visual at the top of your homepage. Drop in a photo or a video
        link (YouTube, Vimeo, or a direct .mp4) and it goes live within a minute.
      </p>
      <div className="mt-8">
        <HeroManager initial={media} />
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <h2 className="font-display text-[clamp(1.75rem,2.8vw,2.25rem)] leading-tight text-ink">Page heroes</h2>
        <p className="mt-3 text-base leading-7 text-ink-soft">
          The cinematic photo at the top of your other tabs. Choose the exact
          frame for each — picked from photos already in your portfolio — or
          leave it on Automatic to use your top featured shot.
        </p>
        <div className="mt-8">
          <PageHeroManager pages={pages} library={library} />
        </div>
      </div>
    </main>
  );
}
