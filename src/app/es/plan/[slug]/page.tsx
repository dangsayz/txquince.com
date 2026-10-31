import { PlanPage, planPageMetadata, type PlanParams, type PlanSearch } from "@/components/plan/PlanPage";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: PlanParams }) {
  return planPageMetadata(params, "es");
}

export default function Page({ params, searchParams }: { params: PlanParams; searchParams: PlanSearch }) {
  return <PlanPage params={params} searchParams={searchParams} lang="es" />;
}
