import type { Language } from "@/lib/translations";
import React, { createContext, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router";

type LanguageContextType = {
  language: Language;
  changeLanguage: (lang: Language) => void;
};
const LanguageContext = createContext<LanguageContextType>({
  language: "ar",
  changeLanguage: () => {},
});
export const LanguageProvider = ({ children } : { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const urlParams = new URLSearchParams(location.search);
  const initialLang = urlParams.get("lang") as Language || "ar";

  const [language, setLanguage] = useState<Language>(initialLang);

  const changeLanguage = (lang : Language) => {
    setLanguage(lang);
    navigate(`?lang=${lang}`);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
