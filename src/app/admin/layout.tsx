import type { Metadata } from "next";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { AdminHint } from "@/components/EditMode";
import "./studio.css";

export const metadata: Metadata = {
  title: "TX Quince Studio",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="studio-skin min-h-dvh bg-white">
      {/* Marks this browser so the public site offers on-page image editing. */}
      <AdminHint />
      <AdminWorkspace>{children}</AdminWorkspace>
    </div>
  );
}
