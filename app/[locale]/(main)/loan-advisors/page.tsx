import { createListPage } from "@/server/list-page";
import LoanAdvisors from "@/views/main/loan-advicers";

const { Page, generateMetadata } = createListPage({
  path: "/loan-advisors",
  endpoint: "/profiles/loan-advisors/",
  mediaEndpoint: "/pages/loan-advisors/",
  filterKeys: ["expertise", "area", "city", "query"],
  apiKeys: ["query", "area", "city", "expertise"],
  title: { he: "יועצי משכנתאות", ar: "مستشارو القروض العقارية" },
  description: {
    he: "יועצי משכנתאות מקצועיים שיעזרו לכם למצוא את המימון המתאים ב-Alnadlan.",
    ar: "مستشارو قروض عقارية محترفون لمساعدتك في إيجاد التمويل المناسب على Alnadlan.",
  },
  Component: LoanAdvisors,
});

export { generateMetadata };
export default Page;
