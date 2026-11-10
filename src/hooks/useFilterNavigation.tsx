"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

const useFilterNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /** Push the given filters onto the URL (drops `page`) so SSR picks them up on fresh loads. */
  const handleFilters = (filters: Record<string, unknown>, path = "/properties") => {
    const cleanFilters: Record<string, string> = Object.fromEntries(
      Object.entries(filters)
        .filter(([_, value]) => value !== "" && value != null)
        .map(([key, value]) => [key, String(value)])
    );

    const queryString = new URLSearchParams(cleanFilters).toString();

    router.push(queryString ? `${path}?${queryString}` : path);
  };

  /** Keep the current filters in the URL and set/drop the `page` param. */
  const handlePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  return { handleFilters, handlePage };
};

export default useFilterNavigation;
