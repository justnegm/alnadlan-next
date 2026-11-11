import type { Metadata } from "next";
import ResetPassword from "@/views/auth/reset-password";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إعادة تعيين كلمة المرور" : "איפוס סיסמה",
    robots: { index: false, follow: false },
  };
}

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
