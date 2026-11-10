import { notFound } from "next/navigation";
import { serverFetchOrNull } from "@/server/http";
import { pageMetadata } from "@/i18n/metadata";
import PeopleWithDisabilities from "@/views/main/people-with-disabli";

type Params = Promise<{ locale: string }>;

const fetchAccessibility = () =>
  serverFetchOrNull<any>("/info/people-with-disabilities/", { revalidate: 3600 });

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const data = await fetchAccessibility();
  return pageMetadata(
    locale,
    "/people-with-disabilities",
    { he: data?.title || "הצהרת נגישות", ar: data?.title || "بيان إمكانية الوصول" },
    { he: "הצהרת הנגישות של Alnadlan.", ar: "بيان إمكانية الوصول لموقع Alnadlan." },
  );
}

export default async function AccessibilityPage() {
  const data = await fetchAccessibility();
  if (!data) notFound();
  return <PeopleWithDisabilities data={data} />;
}
