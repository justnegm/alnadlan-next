import type { Metadata } from "next";
import { Suspense } from "react";
import Auth from "@/views/auth/auth";

export const metadata: Metadata = {
  title: "כניסה",
  robots: { index: false, follow: false },
};

// Auth reads useSearchParams (the ?next= redirect target), which needs a
// Suspense boundary so static prerendering of this page doesn't fail.
export default function AuthPage() {
  return (
    <Suspense>
      <Auth />
    </Suspense>
  );
}
