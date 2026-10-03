export type GalleryCredit = {
  name: string;
  business: string | null;
  slug: string;
  category: string | null;
  ig_handle: string | null;
  website: string | null;
  role: string | null;
};

export type GalleryItem = {
  url: string | null;
  alt: string;
  ratio?: "portrait" | "landscape" | "square";
  feature?: boolean;
  width?: number | null;
  height?: number | null;
  slug?: string | null;
  section?: string;
  id?: string | null;
  fx?: number | null;
  fy?: number | null;
  title?: string | null;
  caption?: string | null;
  city?: string | null;
  vendors?: GalleryCredit[];
  detailAvailable?: boolean;
};

export type GallerySection = { id: string; title: string };
export type RenderableGalleryItem = GalleryItem & { url: string };

function hasImage(item: GalleryItem): item is RenderableGalleryItem {
  return typeof item.url === "string" && item.url.length > 0;
}

export function selectGalleryItems(
  images: GalleryItem[],
  sections: GallerySection[],
  options: { query: string; category: string; sort: "curated" | "title"; savedOnly: boolean; saved: string[] },
): RenderableGalleryItem[] {
  const term = options.query.trim().toLocaleLowerCase();
  const results = images.filter(hasImage).filter((item) => {
    if (options.savedOnly && (!item.section || !item.slug || !options.saved.includes(`${item.section}/${item.slug}`))) return false;
    if (options.category !== "all" && item.section !== options.category) return false;
    return !term || [item.title, item.alt, item.caption, item.city, sections.find((section) => section.id === item.section)?.title]
      .some((value) => value?.toLocaleLowerCase().includes(term));
  });
  return options.sort === "title"
    ? results.sort((a, b) => (a.title || a.alt).localeCompare(b.title || b.alt))
    : results;
}
