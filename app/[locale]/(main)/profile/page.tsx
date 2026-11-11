import type { Metadata } from "next";
import Profile from "@/views/main/profile";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "المنطقة الشخصية" : "האזור האישי",
    robots: { index: false, follow: false },
  };
}

export default function ProfilePage() {
  return <Profile />;
}
