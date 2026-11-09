import { redirect } from "next/navigation";

/** Passwords now live in the shared Quince Network account (Clerk handles resets on its sign-in page). */
export default function ResetPasswordPage() {
  redirect("/admin/login");
}
