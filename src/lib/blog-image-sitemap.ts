/**
 * Blog photos for /image-sitemap.xml: one <url> per post (EN and ES), listing
 * every `image` block photo that post actually shows. An image sitemap's <loc>
 * must be the indexable page the image appears on, so each photo is listed
 * under its post, not under /portfolio. Gallery blocks are left out: they show
 * an even sample of an album, so listing the whole album would name photos the
 * page does not show.
 */
import type { BlogPost } from "@/content/blog";
import { getBlogPhoto } from "@/content/blog-photos";

export type BlogImageEntry = { loc: string; images: string[] };

/** Absolute image URL: static files and /api/img paths both live on the site origin. */
function absolute(origin: string, src: string): string {
  return src.startsWith("http") ? src : `${origin}${src}`;
}

export function blogImageEntries(
  origin: string,
  enPosts: BlogPost[],
  esPosts: BlogPost[],
  lookup: (slug: string) => { src: string } | undefined = getBlogPhoto,
): BlogImageEntry[] {
  const out: BlogImageEntry[] = [];
  const add = (post: BlogPost, prefix: string) => {
    const images = Array.from(
      new Set(
        post.content.flatMap((b) => {
          if (b.type !== "image") return [];
          const photo = lookup(b.slug);
          return photo ? [absolute(origin, photo.src)] : [];
        }),
      ),
    );
    if (images.length) out.push({ loc: `${origin}${prefix}/${post.slug}`, images });
  };
  for (const p of enPosts) add(p, "/blog");
  for (const p of esPosts) add(p, "/es/blog");
  return out;
}
