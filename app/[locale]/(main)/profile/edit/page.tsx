import type { Metadata } from "next";
import ProfileEdit from "@/views/main/profile-edit";

export const metadata: Metadata = {
  title: "עריכת פרופיל",
  robots: { index: false, follow: false },
};

export default function ProfileEditPage() {
  return <ProfileEdit />;
}
