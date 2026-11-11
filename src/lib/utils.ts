import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Dictionary } from "@/i18n/useT";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const Links = (lang_1: Dictionary) => ([
  {
    name: lang_1.nav.home,
    href: "/",
  },
  {
    name: lang_1.nav.propertiesForSale,
    href: "/properties?contract_type=2",
  },
  {
    name: lang_1.nav.propertiesForRent,
    href: "/properties?contract_type=1",
  },
  {
    name: lang_1.nav.projectsInProgress,
    href: "/projects",
  },
  {
    name: lang_1.nav.lawyers,
    href: "/lawyers",
  },
  {
    name: lang_1.nav.designers,
    href: "/designers",
  },
  {
    name: lang_1.nav.loanAdvisors,
    href: "/loan-advisors",
  },
])

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("he-IL", options);
}


export const getUserUrl = (user: any) => {
  if (!user) return ""
  if (user?.account_type === 'broker') return `brokers/${user?.slug}/`
  if (user?.account_type === 'company_manager') return `office/${user?.company?.slug}/`
  return ""
}