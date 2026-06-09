import Link from "next/link";
import { getHeroMedia } from "@/lib/content-db";
import { HeroManager } from "@/components/admin/HeroManager";

export const dynamic = "force-dynamic";

export default async function AdminHero() {
  const media = await getHeroMedia();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link
        href="/admin"
        className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-faint hover:text-wine"
      >
        ← Studio
      </Link>
      <h1 className="mt-3 font-display text-3xl text-ink">Homepage hero</h1>
      <p className="mt-2 text-sm text-ink-soft">
        The big visual at the top of your homepage. Drop in a photo or a video
        link (YouTube, Vimeo, or a direct .mp4) and it goes live within a minute.
      </p>
      <div className="mt-10">
        <HeroManager initial={media} />
      </div>
    </main>
  );
}
