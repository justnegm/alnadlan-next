import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { serverFetchOrNull } from "@/server/http";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/i18n/config";
import Designer from "@/views/main/designer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

type Params = Promise<{ locale: string; id: string }>;

function fetchDesigner(id: string) {
  const slug = decodeURIComponent(id);
  return serverFetchOrNull<any>(`/profiles/designers/${slug}/`, { tags: ["designers"] });
}

function metaText(text?: string | null) {
  if (!text) return undefined;
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, 160) : undefined;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const data = await fetchDesigner(id);
  if (!data) return {};
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const path = `/designers/${data.slug ?? decodeURIComponent(id)}`;
  const description = metaText(data.bio ?? data.description);
  return {
    title: data.full_name,
    description,
    alternates: {
      canonical: localePath(l, path),
      languages: { he: path, ar: `/ar${path}` },
    },
    openGraph: {
      title: data.full_name,
      description,
      url: localePath(l, path),
      type: "profile",
      ...(data.image ? { images: [{ url: data.image }] } : {}),
    },
  };
}

export default async function DesignerPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const data = await fetchDesigner(id);
  if (!data) notFound();
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const path = `/designers/${data.slug ?? decodeURIComponent(id)}`;
  const url = `${SITE_URL}${localePath(l, path)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.full_name,
    jobTitle: "Interior Designer",
    description: metaText(data.bio ?? data.description),
    url,
    ...(data.image ? { image: data.image } : {}),
    ...(data.city?.[0]?.name
      ? { address: { "@type": "PostalAddress", addressLocality: data.city[0].name, addressCountry: "IL" } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Suspense fallback={null}>
        <Designer initialData={data} />
      </Suspense>
    </>
  );
}
