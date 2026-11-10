import type { Metadata } from "next";
import type { ComponentType } from "react";
import { Suspense } from "react";
import { serverFetchOrNull } from "@/server/http";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "@/i18n/config";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = Promise<{ locale: string }>;

import type { ListInitialData } from "@/lib/list-initial";

type ListPageConfig = {
  /** Route path, e.g. "/properties". */
  path: string;
  /** API endpoint for the list. */
  endpoint: string;
  /** CMS media endpoint for the hero/ad. */
  mediaEndpoint: string;
  /** URL params the client reads into its filter state (order irrelevant). */
  filterKeys: string[];
  /** Params the API fetcher actually forwards (mirrors src/server/main.ts). */
  apiKeys: string[];
  /** Also prefetch /property-ads/ (properties page only). */
  withSpecial?: boolean;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  Component: ComponentType<{ initialData?: ListInitialData }>;
};

const SPECIAL_API_KEYS = [
  "user", "price_from", "price_to", "property_type", "query", "contract_type", "area", "city",
];

function first(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function pick(filters: Record<string, string | null>, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, filters[k] ?? undefined]));
}

export function createListPage(config: ListPageConfig) {
  async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale } = await params;
    const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
    return {
      title: config.title[l],
      description: config.description[l],
      alternates: {
        canonical: localePath(l, config.path),
        languages: { he: config.path, ar: `/ar${config.path}` },
      },
      openGraph: {
        title: config.title[l],
        description: config.description[l],
        url: localePath(l, config.path),
      },
    };
  }

  async function Page({ searchParams }: { params: Params; searchParams: SearchParams }) {
    const sp = await searchParams;
    const filters = Object.fromEntries(config.filterKeys.map((k) => [k, first(sp[k])]));

    // page=1 matches the client's initial page state, so the query keys line up.
    const [list, media, special] = await Promise.all([
      serverFetchOrNull(config.endpoint, {
        params: { page: 1, ...pick(filters, config.apiKeys) },
        revalidate: 60,
      }),
      serverFetchOrNull(config.mediaEndpoint, { revalidate: 3600 }),
      config.withSpecial
        ? serverFetchOrNull("/property-ads/", {
            params: { page: 1, ...pick(filters, SPECIAL_API_KEYS) },
            revalidate: 60,
          })
        : Promise.resolve(undefined),
    ]);

    const { Component } = config;
    return (
      // Client components read useSearchParams; Suspense keeps the rest of the route static-safe.
      <Suspense>
        <Component initialData={{ filters, list, media, special }} />
      </Suspense>
    );
  }

  return { Page, generateMetadata };
}
