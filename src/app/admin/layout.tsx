import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { AdminHint } from "@/components/EditMode";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-cream">
      {/* Marks this browser so the public site offers on-page image editing. */}
      <AdminHint />
      <AdminWorkspace>{children}</AdminWorkspace>
    </div>
  );
}
