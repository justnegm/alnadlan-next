import { notFound } from "next/navigation";
import { serverFetchOrNull } from "@/server/http";
import { pageMetadata } from "@/i18n/metadata";
import TermsAndConditions from "@/views/main/terms-and-conditions";

type Params = Promise<{ locale: string }>;

const fetchTerms = () => serverFetchOrNull<any>("/info/terms-and-conditions/", { revalidate: 3600 });

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  const data = await fetchTerms();
  return pageMetadata(
    locale,
    "/terms-and-conditions",
    { he: data?.title || "תנאי שימוש", ar: data?.title || "الشروط والأحكام" },
    { he: "תנאי השימוש באתר Alnadlan.", ar: "شروط وأحكام استخدام موقع Alnadlan." },
  );
}

export default async function TermsPage() {
  const data = await fetchTerms();
  if (!data) notFound();
  return <TermsAndConditions data={data} />;
}
