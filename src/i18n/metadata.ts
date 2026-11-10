import type { Metadata } from "next";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

/** Localized title/description plus canonical and he/ar hreflang alternates for a fixed path. */
export function pageMetadata(
  locale: string,
  path: string,
  title: Record<Locale, string> | null,
  description: Record<Locale, string>,
): Metadata {
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const arPath = path === "/" ? "/ar" : `/ar${path}`;
  const canonical = l === DEFAULT_LOCALE ? path : arPath;
  return {
    ...(title ? { title: title[l] } : {}),
    description: description[l],
    alternates: {
      canonical,
      languages: { he: path, ar: arPath },
    },
    openGraph: {
      ...(title ? { title: title[l] } : {}),
      description: description[l],
      url: canonical,
    },
  };
}
