import { redirect } from "next/navigation";

/** Log in is by emailed code now (Clerk); there is no password to reset. */
export default function ResetPasswordPage() {
  redirect("/admin/login");
}
