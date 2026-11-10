import { serverFetchOrNull } from "@/server/http";
import { pageMetadata } from "@/i18n/metadata";
import Landing from "@/views/landing";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return pageMetadata(
    locale,
    "/landing",
    { he: "הצטרפו ל-Alnadlan", ar: "انضم إلى Alnadlan" },
    {
      he: "הצטרפו לפלטפורמת הנדל״ן המובילה בישראל – פרסמו נכסים והגיעו לאלפי לקוחות.",
      ar: "انضم إلى منصة العقارات الرائدة في إسرائيل – انشر عقاراتك وتواصل مع آلاف العملاء.",
    },
  );
}

export default async function LandingPage() {
  const data = await serverFetchOrNull("/landingpage/", { revalidate: 3600 });
  return <Landing initialData={data} />;
}
