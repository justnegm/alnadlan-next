import type { Metadata } from "next";
import ResetPasswordConfirmation from "@/views/auth/reset-password-confirmation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تغيير كلمة المرور" : "שינוי סיסמה",
    robots: { index: false, follow: false },
  };
}

export default function ResetPasswordConfirmationPage() {
  return <ResetPasswordConfirmation />;
}
