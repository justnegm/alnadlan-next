import type { MetadataRoute } from "next";
import { serverFetchOrNull } from "@/server/http";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

const STATIC_PATHS = [
  "",
  "/properties",
  "/projects",
  "/offices",
  "/brokers",
  "/designers",
  "/lawyers",
  "/loan-advisors",
  "/contact",
  "/terms-and-conditions",
  "/privacy-policy",
  "/people-with-disabilities",
  "/landing",
];

type DRFList = { results?: Array<{ slug?: string; id?: number | string }> };

async function collectSlugs(endpoint: string): Promise<string[]> {
  const data = await serverFetchOrNull<DRFList | Array<{ slug?: string; id?: number | string }>>(
    endpoint,
    { params: { no_pagination: true }, revalidate: 3600 },
  );
  const items = Array.isArray(data) ? data : (data?.results ?? []);
  return items.map((item) => String(item.slug ?? item.id ?? "")).filter(Boolean);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, projects, offices, brokers, designers, lawyers, advisors] =
    await Promise.all([
      collectSlugs("/properties/"),
      collectSlugs("/projects/"),
      collectSlugs("/profiles/companies/"),
      collectSlugs("/profiles/brokers/"),
      collectSlugs("/profiles/designers/"),
      collectSlugs("/profiles/lawyers/"),
      collectSlugs("/profiles/loan-advisors/"),
    ]);

  const dynamicPaths = [
    ...properties.map((s) => `/property/${s}`),
    ...projects.map((s) => `/project/${s}`),
    ...offices.map((s) => `/office/${s}`),
    ...brokers.map((s) => `/brokers/${s}`),
    ...designers.map((s) => `/designers/${s}`),
    ...lawyers.map((s) => `/lawyer/${s}`),
    ...advisors.map((s) => `/loan-advisors/${s}`),
  ];

  // he is unprefixed (canonical), ar lives under /ar.
  return [...STATIC_PATHS, ...dynamicPaths].flatMap((path) => [
    {
      url: `${SITE_URL}${path || "/"}`,
      alternates: {
        languages: { he: `${SITE_URL}${path || "/"}`, ar: `${SITE_URL}/ar${path}` },
      },
    },
    { url: `${SITE_URL}/ar${path}` },
  ]);
}
