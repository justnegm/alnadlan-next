import type { Metadata } from "next";
import ResetPasswordConfirmation from "@/views/auth/reset-password-confirmation";

export const metadata: Metadata = {
  title: "שינוי סיסמה",
  robots: { index: false, follow: false },
};

export default function ResetPasswordConfirmationPage() {
  return <ResetPasswordConfirmation />;
}
