import { createListPage } from "@/server/list-page";
import Brokers from "@/views/main/brokers";

const { Page, generateMetadata } = createListPage({
  path: "/brokers",
  endpoint: "/profiles/brokers/",
  mediaEndpoint: "/pages/brokers/",
  filterKeys: ["expertise", "area", "city", "query"],
  apiKeys: ["query", "area", "city", "expertise", "company"],
  title: { he: "מתווכים", ar: "وسطاء عقاريون" },
  description: {
    he: "מתווכי נדל״ן מקצועיים בכל רחבי הארץ – מצאו את המתווך המתאים לכם ב-Alnadlan.",
    ar: "وسطاء عقاريون محترفون في جميع أنحاء البلاد – اعثر على الوسيط المناسب لك على Alnadlan.",
  },
  Component: Brokers,
});

export { generateMetadata };
export default Page;
