import { createListPage } from "@/server/list-page";
import Designers from "@/views/main/designers";

const { Page, generateMetadata } = createListPage({
  path: "/designers",
  endpoint: "/profiles/designers/",
  mediaEndpoint: "/pages/designers/",
  filterKeys: ["expertise", "area", "city", "query"],
  apiKeys: ["query", "area", "city", "expertise"],
  title: { he: "מעצבי פנים", ar: "مصممو الديكور الداخلي" },
  description: {
    he: "מעצבי פנים ואדריכלים מובילים לבית ולעסק ב-Alnadlan.",
    ar: "أفضل مصممي الديكور الداخلي والمهندسين المعماريين للمنزل والأعمال على Alnadlan.",
  },
  Component: Designers,
});

export { generateMetadata };
export default Page;
