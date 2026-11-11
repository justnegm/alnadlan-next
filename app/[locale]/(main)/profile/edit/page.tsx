import type { Metadata } from "next";
import ProfileEdit from "@/views/main/profile-edit";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تعديل الملف الشخصي" : "עריכת פרופיל",
    robots: { index: false, follow: false },
  };
}

export default function ProfileEditPage() {
  return <ProfileEdit />;
}
