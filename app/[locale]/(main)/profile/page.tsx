import type { Metadata } from "next";
import Profile from "@/views/main/profile";

export const metadata: Metadata = {
  title: "האזור האישי",
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <Profile />;
}
