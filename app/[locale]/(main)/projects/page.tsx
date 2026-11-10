import { createListPage } from "@/server/list-page";
import Projects from "@/views/main/projects";

const { Page, generateMetadata } = createListPage({
  path: "/projects",
  endpoint: "/projects/",
  mediaEndpoint: "/pages/projects/",
  filterKeys: ["property_type", "area", "city", "contract_type", "property_price", "query"],
  apiKeys: ["price_from", "price_to", "property_type", "query", "contract_type", "area", "city", "company"],
  title: { he: "פרויקטים חדשים", ar: "مشاريع جديدة" },
  description: {
    he: "פרויקטים חדשים בבנייה ודירות מקבלן – כל הפרויקטים במקום אחד ב-Alnadlan.",
    ar: "مشاريع جديدة قيد الإنشاء وشقق من المقاول – جميع المشاريع في مكان واحد على Alnadlan.",
  },
  Component: Projects,
});

export { generateMetadata };
export default Page;
