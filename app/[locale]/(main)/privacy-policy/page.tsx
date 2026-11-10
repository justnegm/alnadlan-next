import { notFound } from "next/navigation";
import { serverFetchOrNull } from "@/server/http";
import { pageMetadata } from "@/i18n/metadata";
import PrivacyPolicy from "@/views/main/privacy-policy";

type Params = Promise<{ locale: string }>;

const fetchPrivacy = () => serverFetchOrNull<any>("/info/privacy-policy/", { revalidate: 3600 });

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const data = await fetchPrivacy();
  return pageMetadata(
    locale,
    "/privacy-policy",
    { he: data?.title || "מדיניות פרטיות", ar: data?.title || "سياسة الخصوصية" },
    { he: "מדיניות הפרטיות של Alnadlan.", ar: "سياسة الخصوصية لموقع Alnadlan." },
  );
}

export default async function PrivacyPage() {
  const data = await fetchPrivacy();
  if (!data) notFound();
  return <PrivacyPolicy data={data} />;
}
