import { EditorialHome } from "@/components/home/EditorialHome";

export const revalidate = 60;

export default function HomePage() {
  return <EditorialHome locale="en" />;
}
