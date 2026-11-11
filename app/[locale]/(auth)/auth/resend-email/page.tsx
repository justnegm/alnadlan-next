import type { Metadata } from "next";
import ResendEmail from "@/views/auth/resend-email";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "إعادة إرسال البريد الإلكتروني" : "שליחת אימייל מחדש",
    robots: { index: false, follow: false },
  };
}

export default function ResendEmailPage() {
  return <ResendEmail />;
}
