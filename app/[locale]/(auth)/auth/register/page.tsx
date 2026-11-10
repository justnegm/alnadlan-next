import type { Metadata } from "next";
import Register from "@/views/auth/register";

export const metadata: Metadata = {
  title: "הרשמה",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <Register />;
}
