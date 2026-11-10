import type { Metadata } from "next";
import PropertyForm from "@/views/main/create-property";

export const metadata: Metadata = {
  title: "פרסום נכס",
  robots: { index: false, follow: false },
};

export default function PropertyCreatePage() {
  return <PropertyForm />;
}
