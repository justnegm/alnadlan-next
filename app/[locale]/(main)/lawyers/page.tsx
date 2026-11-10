import { createListPage } from "@/server/list-page";
import Lawyers from "@/views/main/lawyers";

const { Page, generateMetadata } = createListPage({
  path: "/lawyers",
  endpoint: "/profiles/lawyers/",
  mediaEndpoint: "/pages/lawyers/",
  filterKeys: ["expertise", "area", "city", "query"],
  apiKeys: ["query", "area", "city", "expertise"],
  title: { he: "עורכי דין למקרקעין", ar: "محامو العقارات" },
  description: {
    he: "עורכי דין המתמחים בנדל״ן ומקרקעין – ליווי משפטי בעסקאות ב-Alnadlan.",
    ar: "محامون متخصصون في العقارات – مرافقة قانونية في الصفقات على Alnadlan.",
  },
  Component: Lawyers,
});

export { generateMetadata };
export default Page;
