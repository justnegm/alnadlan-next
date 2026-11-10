import { createListPage } from "@/server/list-page";
import Offices from "@/views/main/offices";

const { Page, generateMetadata } = createListPage({
  path: "/offices",
  endpoint: "/profiles/companies/",
  mediaEndpoint: "/pages/company-profile/",
  filterKeys: ["expertise", "area", "city", "query"],
  apiKeys: ["query", "area", "city", "expertise"],
  title: { he: "משרדי תיווך", ar: "مكاتب الوساطة العقارية" },
  description: {
    he: "מצאו משרדי תיווך נדל״ן מובילים באזור שלכם ב-Alnadlan.",
    ar: "اعثر على أفضل مكاتب الوساطة العقارية في منطقتك على Alnadlan.",
  },
  Component: Offices,
});

export { generateMetadata };
export default Page;
