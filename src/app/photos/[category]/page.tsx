import { redirect, notFound } from "next/navigation";
import { CATEGORY_IDS } from "@/content/portfolio-taxonomy";

/** Category index → the matching portfolio gallery anchor (the tabs resolve a
 *  category hash to its public tab). */
export default async function PhotoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORY_IDS.includes(category)) notFound();
  redirect(`/portfolio#${category}`);
}
