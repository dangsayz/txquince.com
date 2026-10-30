import { redirect, notFound } from "next/navigation";
import { CATEGORY_IDS } from "@/content/portfolio-taxonomy";

/** Keep category URLs pointed at the matching portfolio filter. */
export default async function PhotoCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORY_IDS.includes(category)) notFound();
  redirect(`/portfolio#${category}`);
}
