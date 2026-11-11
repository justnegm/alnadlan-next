import type { Metadata } from "next";
import UpdatePassword from "@/views/main/update-password";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تغيير كلمة المرور" : "שינוי סיסמה",
    robots: { index: false, follow: false },
  };
}

export default function ChangePasswordPage() {
  return <UpdatePassword />;
}
