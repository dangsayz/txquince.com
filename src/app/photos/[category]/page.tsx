import { redirect, notFound } from "next/navigation";

const SECTIONS = new Set(["save-the-date", "church", "portraits", "celebration", "films"]);

/** Category index → the matching portfolio gallery anchor. */
export default async function PhotoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!SECTIONS.has(category)) notFound();
  redirect(`/portfolio#${category}`);
}
