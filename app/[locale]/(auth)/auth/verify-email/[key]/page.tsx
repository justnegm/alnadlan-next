import type { Metadata } from "next";
import VerifyEmail from "@/views/auth/verify-email";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "تأكيد البريد الإلكتروني" : "אימות אימייל",
    robots: { index: false, follow: false },
  };
}

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
