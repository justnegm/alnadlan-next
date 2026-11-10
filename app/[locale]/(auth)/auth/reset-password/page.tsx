import type { Metadata } from "next";
import ResetPassword from "@/views/auth/reset-password";

export const metadata: Metadata = {
  title: "איפוס סיסמה",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
