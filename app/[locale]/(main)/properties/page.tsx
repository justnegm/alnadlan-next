import { createListPage } from "@/server/list-page";
import Properties from "@/views/main/properties";

const { Page, generateMetadata } = createListPage({
  path: "/properties",
  endpoint: "/properties/",
  mediaEndpoint: "/pages/properties/",
  filterKeys: ["property_type", "area", "city", "contract_type", "property_price", "query"],
  apiKeys: ["user", "price_from", "price_to", "property_type", "query", "contract_type", "area", "city", "is_premium", "company"],
  withSpecial: true,
  title: { he: "נכסים למכירה ולהשכרה", ar: "عقارات للبيع والإيجار" },
  description: {
    he: "חפשו דירות, בתים ונכסים מסחריים למכירה ולהשכרה בכל רחבי הארץ ב-Alnadlan.",
    ar: "ابحث عن شقق ومنازل وعقارات تجارية للبيع والإيجار في جميع أنحاء البلاد على Alnadlan.",
  },
  Component: Properties,
});

export { generateMetadata };
export default Page;
