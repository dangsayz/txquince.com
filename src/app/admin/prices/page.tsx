import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/require-admin";

/** Prices and package wording are edited together now, on one page. */
export default async function AdminPrices() {
  await requireAdminPage("/admin/packages?tab=extras"); // server-side gate, like every admin page
  redirect("/admin/packages?tab=extras");
}
