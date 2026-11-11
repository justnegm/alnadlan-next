import type { Metadata } from "next";
import Register from "@/views/auth/register";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إنشاء حساب" : "הרשמה",
    robots: { index: false, follow: false },
  };
}

export default function RegisterPage() {
  return <Register />;
}
