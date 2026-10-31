import { PlanPage, planPageMetadata, type PlanParams, type PlanSearch } from "@/components/plan/PlanPage";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: PlanParams }) {
  return planPageMetadata(params, "en");
}

export default function Page({ params, searchParams }: { params: PlanParams; searchParams: PlanSearch }) {
  return <PlanPage params={params} searchParams={searchParams} lang="en" />;
}
