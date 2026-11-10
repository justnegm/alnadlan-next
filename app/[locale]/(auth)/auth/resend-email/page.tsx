import type { Metadata } from "next";
import ResendEmail from "@/views/auth/resend-email";

export const metadata: Metadata = {
  title: "שליחת אימייל מחדש",
  robots: { index: false, follow: false },
};

export default function ResendEmailPage() {
  return <ResendEmail />;
}
