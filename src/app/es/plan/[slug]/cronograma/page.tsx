import { TimelinePage, timelineMetadata } from "@/components/plan/TimelinePage";
import type { PlanParams } from "@/components/plan/PlanPage";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: PlanParams }) {
  return timelineMetadata(params, "es");
}

export default function Page({ params }: { params: PlanParams }) {
  return <TimelinePage params={params} lang="es" />;
}
