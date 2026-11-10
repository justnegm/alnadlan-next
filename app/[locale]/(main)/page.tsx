import { Suspense } from "react";
import { serverFetchOrNull } from "@/server/http";
import { pageMetadata } from "@/i18n/metadata";
import Home from "@/views/main/home";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  // Title falls back to the root layout default ("Alnadlan").
  return pageMetadata(locale, "/", null, {
    he: "Alnadlan – פלטפורמת הנדל”ן המובילה בישראל. מצא נכסים, סיורים וירטואליים בתלת־ממד, מתווכים, משרדי תיווך ופרויקטים חדשים – הכל במקום אחד.",
    ar: "Alnadlan – منصة العقارات الرائدة في إسرائيل. اعثر على عقارات، جولات افتراضية ثلاثية الأبعاد، وسطاء، مكاتب وساطة ومشاريع جديدة – كل ذلك في مكان واحد.",
  });
}

export default async function HomePage() {
  // Same endpoints/params as the client fetchers called with no arguments.
  const [mainInfo, newest, special, brokers, offices, projects, media] = await Promise.all([
    serverFetchOrNull("/info/main-info/", { revalidate: 3600 }),
    serverFetchOrNull("/properties/", { revalidate: 60 }),
    serverFetchOrNull("/property-ads/", { revalidate: 60 }),
    serverFetchOrNull("/profiles/brokers/", { revalidate: 300 }),
    serverFetchOrNull("/profiles/companies/", { revalidate: 300 }),
    serverFetchOrNull("/projects/", { revalidate: 300 }),
    serverFetchOrNull("/pages/home/", { revalidate: 3600 }),
  ]);

  return (
    <Suspense>
      <Home initialData={{ mainInfo, newest, special, brokers, offices, projects, media }} />
    </Suspense>
  );
}
