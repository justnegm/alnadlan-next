import { serverFetchOrNull } from "@/server/http";
import { pageMetadata } from "@/i18n/metadata";
import Contact from "@/views/main/contact";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { locale } = await params;
  return pageMetadata(
    locale,
    "/contact",
    { he: "צור קשר", ar: "اتصل بنا" },
    {
      he: "צרו קשר עם צוות Alnadlan – נשמח לעזור בכל שאלה בנושא נדל״ן.",
      ar: "تواصل مع فريق Alnadlan – يسعدنا مساعدتك في أي سؤال يتعلق بالعقارات.",
    },
  );
}

export default async function ContactPage() {
  const [mainInfo, media] = await Promise.all([
    serverFetchOrNull("/info/main-info/", { revalidate: 3600 }),
    serverFetchOrNull("/pages/contact-us/", { revalidate: 3600 }),
  ]);
  return <Contact initialData={{ mainInfo, media }} />;
}
