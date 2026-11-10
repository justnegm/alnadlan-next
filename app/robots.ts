import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/profile", "/auth", "/property/create", "/property/edit", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
