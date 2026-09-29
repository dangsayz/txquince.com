import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual styleguide",
  robots: { index: false, follow: false },
};

export default function StyleguideLayout({ children }: { children: React.ReactNode }) {
  return children;
}
