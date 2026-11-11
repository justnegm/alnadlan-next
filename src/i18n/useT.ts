"use client";

import { useLanguage } from "@/context/LanguageContext";
import he, { type Dictionary } from "./dictionaries/he";
import ar from "./dictionaries/ar";

export type { Dictionary };

export const dictionaries: Record<string, Dictionary> = { he, ar };

/** UI strings for the current route's locale (/ → Hebrew, /ar → Arabic). */
export function useT(): Dictionary {
  const { language } = useLanguage();
  return dictionaries[language] ?? he;
}
