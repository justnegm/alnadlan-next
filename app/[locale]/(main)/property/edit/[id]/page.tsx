import type { Metadata } from "next";
import PropertyForm from "@/views/main/create-property";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تعديل عقار" : "עריכת נכס",
    robots: { index: false, follow: false },
  };
}

export default function PropertyEditPage() {
  return <PropertyForm />;
}
