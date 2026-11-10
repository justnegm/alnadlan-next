import type { Metadata } from "next";
import VerifyEmail from "@/views/auth/verify-email";

export const metadata: Metadata = {
  title: "אימות אימייל",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
