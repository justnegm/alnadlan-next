"use client";

// Locale-aware navigation primitives. The default locale (he) is unprefixed;
// ar routes live under /ar. All internal links and programmatic navigation
// must go through these so the active locale's prefix is preserved.

import NextLink from "next/link";
import { useRouter as useNextRouter, usePathname as useNextPathname } from "next/navigation";
import { forwardRef, type ComponentProps } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { localePath } from "@/i18n/config";

function useLocalize() {
  const { language } = useLanguage();
  return (href: string) => {
    // External/absolute/hash/query-only links pass through untouched.
    if (!href.startsWith("/")) return href;
    return localePath(language, href);
  };
}

type LinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/** Drop-in replacement for next/link that keeps the current locale prefix. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, ...props },
  ref,
) {
  const localize = useLocalize();
  return <NextLink ref={ref} href={localize(href)} {...props} />;
});

/** Locale-aware router: push/replace prepend the locale prefix to app paths. */
export function useRouter() {
  const router = useNextRouter();
  const localize = useLocalize();
  return {
    ...router,
    push: (href: string, opts?: Parameters<typeof router.push>[1]) =>
      router.push(localize(href), opts),
    replace: (href: string, opts?: Parameters<typeof router.replace>[1]) =>
      router.replace(localize(href), opts),
  };
}

/** Pathname WITHOUT the locale prefix (what route the app is on, locale-agnostic). */
export function usePathname() {
  const pathname = useNextPathname();
  return pathname.replace(/^\/ar(?=\/|$)/, "") || "/";
}
