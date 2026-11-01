import { PlanIntakePage, planIntakeMetadata, type IntakeSearch } from "@/components/plan/PlanIntakePage";

export const metadata = planIntakeMetadata("es");

export default function PlanPageEs({ searchParams }: { searchParams: IntakeSearch }) {
  return <PlanIntakePage lang="es" searchParams={searchParams} />;
}
