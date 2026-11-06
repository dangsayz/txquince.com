import { getVideos } from "@/lib/content-db";
import { StudioPage } from "@/components/admin/StudioPage";
import { VideosManager } from "@/components/admin/VideosManager";
import { requireAdminPage } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminVideosPage() {
  await requireAdminPage("/admin/videos"); // server-side gate; middleware is not enough
  const videos = await getVideos();
  return (
    <StudioPage wide title="Films" intro={`The films and featured story on your site. ${videos.length} in the library.`}>
      <div className="min-w-0">
        <VideosManager initial={videos} />
      </div>
    </StudioPage>
  );
}
