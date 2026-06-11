import type { Metadata } from "next";
import { AdminHeader } from "@/components/admin/AdminHeader";
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
    <div className="min-h-screen bg-cream">
      {/* Marks this browser so the public site offers on-page image editing. */}
      <AdminHint />
      <AdminHeader />
      {children}
    </div>
  );
}
