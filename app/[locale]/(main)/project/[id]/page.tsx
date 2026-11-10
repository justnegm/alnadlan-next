import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { serverFetchOrNull } from "@/server/http";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/i18n/config";
import ProjectDetails from "@/views/main/project-details";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

type Params = Promise<{ locale: string; id: string }>;

function fetchProject(id: string) {
  const slug = decodeURIComponent(id);
  return serverFetchOrNull<any>(`/projects/${slug}/`, { tags: ["projects"] });
}

function metaText(text?: string | null) {
  if (!text) return undefined;
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, 160) : undefined;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const data = await fetchProject(id);
  if (!data) return {};
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const path = `/project/${data.slug ?? decodeURIComponent(id)}`;
  const description = metaText(data.project_desc ?? data.description);
  const image = data.images?.[0]?.image;
  return {
    title: data.title,
    description,
    alternates: {
      canonical: localePath(l, path),
      languages: { he: path, ar: `/ar${path}` },
    },
    openGraph: {
      title: data.title,
      description,
      url: localePath(l, path),
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const data = await fetchProject(id);
  if (!data) notFound();
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const path = `/project/${data.slug ?? decodeURIComponent(id)}`;
  const url = `${SITE_URL}${localePath(l, path)}`;
  const images = (data.images ?? [])
    .map((img: any) => img?.image)
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: data.title,
    description: metaText(data.project_desc ?? data.description),
    url,
    ...(images.length ? { image: images } : {}),
    ...(data.created_at ? { datePosted: data.created_at } : {}),
    ...(data.starting_price
      ? {
          offers: {
            "@type": "Offer",
            price: data.starting_price,
            priceCurrency: "ILS",
          },
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      ...(data.city ? { addressLocality: data.city } : {}),
      ...([data.street, data.property_number].filter(Boolean).length
        ? { streetAddress: [data.street, data.property_number].filter(Boolean).join(" ") }
        : {}),
      addressCountry: "IL",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Suspense fallback={null}>
        <ProjectDetails initialData={data} />
      </Suspense>
    </>
  );
}
