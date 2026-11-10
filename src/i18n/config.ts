import type { Language } from "@/lib/translations";

export const LOCALES = ["he", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "he";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Build an app path for a locale: default locale is unprefixed, others get /<locale> prefix. */
export function localePath(locale: Language, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean}`;
}
