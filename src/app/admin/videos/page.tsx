import { getVideos } from "@/lib/content-db";
import { VideosManager } from "@/components/admin/VideosManager";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  const videos = await getVideos();
  return (
    <main className="mx-auto max-w-[90rem] px-5 pb-20 pt-8 md:px-10 md:pt-12 lg:px-16">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-7">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Website / Library</p>
          <h1 className="mt-3 text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.04em] text-neutral-950">Films</h1>
          <p className="mt-2 text-sm text-neutral-600">Manage the films and featured story shown on your site.</p>
        </div>
        <p className="text-sm tabular-nums text-neutral-500">{videos.length} films</p>
      </div>
      <div className="mt-8">
        <VideosManager initial={videos} />
      </div>
    </main>
  );
}
