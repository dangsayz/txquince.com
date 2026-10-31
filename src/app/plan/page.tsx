import { PlanIntakePage, planIntakeMetadata, type IntakeSearch } from "@/components/plan/PlanIntakePage";

export const metadata = planIntakeMetadata("en");

export default function PlanPage({ searchParams }: { searchParams: IntakeSearch }) {
  return <PlanIntakePage lang="en" searchParams={searchParams} />;
}
