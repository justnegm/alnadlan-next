import type { Metadata } from "next";
import UpdatePassword from "@/views/main/update-password";

export const metadata: Metadata = {
  title: "שינוי סיסמה",
  robots: { index: false, follow: false },
};

export default function ChangePasswordPage() {
  return <UpdatePassword />;
}
