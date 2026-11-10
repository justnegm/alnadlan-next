import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { serverFetchOrNull } from "@/server/http";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/i18n/config";
import Office from "@/views/main/office";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

type Params = Promise<{ locale: string; id: string }>;

function fetchOffice(id: string) {
  const slug = decodeURIComponent(id);
  return serverFetchOrNull<any>(`/profiles/companies/${slug}/`, { tags: ["offices"] });
}

function metaText(text?: string | null) {
  if (!text) return undefined;
  const clean = String(text).replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, 160) : undefined;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, id } = await params;
  const data = await fetchOffice(id);
  if (!data) return {};
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const path = `/office/${data.slug ?? decodeURIComponent(id)}`;
  const title = data.title || data.full_name;
  const description = metaText(data.description ?? data.desc);
  return {
    title,
    description,
    alternates: {
      canonical: localePath(l, path),
      languages: { he: path, ar: `/ar${path}` },
    },
    openGraph: {
      title,
      description,
      url: localePath(l, path),
      type: "profile",
      ...(data.image ? { images: [{ url: data.image }] } : {}),
    },
  };
}

export default async function OfficePage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const data = await fetchOffice(id);
  if (!data) notFound();
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const path = `/office/${data.slug ?? decodeURIComponent(id)}`;
  const url = `${SITE_URL}${localePath(l, path)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.title || data.full_name,
    description: metaText(data.description ?? data.desc),
    url,
    ...(data.image ? { image: data.image } : {}),
    ...(data.address
      ? { address: { "@type": "PostalAddress", streetAddress: data.address, addressCountry: "IL" } }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Suspense fallback={null}>
        <Office initialData={data} />
      </Suspense>
    </>
  );
}
