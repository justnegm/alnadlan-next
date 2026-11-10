"use client";

import type { Language } from "@/lib/translations";
import { DEFAULT_LOCALE, localePath } from "@/i18n/config";
import React, { createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";

type LanguageContextType = {
  language: Language;
  changeLanguage: (lang: Language) => void;
};
const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LOCALE,
  changeLanguage: () => {},
});

export const LanguageProvider = ({
  locale,
  children,
}: {
  locale: Language;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname(); // already has no /he prefix; /ar pages start with /ar

  const changeLanguage = (lang: Language) => {
    if (lang === locale) return;
    const bare = pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
    router.push(localePath(lang, bare));
  };

  return (
    <LanguageContext.Provider value={{ language: locale, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
