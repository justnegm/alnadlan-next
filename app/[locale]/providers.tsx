"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useRouter as useLocaleRouter, usePathname as useAppPathname } from "@/i18n/navigation";
import { isProtectedPath } from "@/lib/protected-routes";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuth } from "@/store/auth-slice";
import type { Locale } from "@/i18n/config";

function AuthBootstrap() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}

/**
 * When the session ends: drop cached user data, and leave pages that need login.
 * Clicked logout → home (they chose to leave). Session expired → login, then back here.
 * On public pages the user just stays put.
 */
function LogoutRedirect() {
  const isAuth = useAuth((s) => s.isAuth);
  const reason = useAuth((s) => s.logoutReason);
  const target = useAuth((s) => s.logoutTarget);
  const path = useAppPathname();
  const router = useLocaleRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuth || !reason) return;
    useAuth.setState({ logoutReason: null, logoutTarget: null }); // handle each logout once
    queryClient.resetQueries(); // profile, favorites, is_favorite flags...
    if (target) router.replace(target);
    else if (isProtectedPath(path)) router.replace(reason === "user" ? "/" : `/auth?next=${encodeURIComponent(path)}`);
  }, [isAuth, reason, target, path, router, queryClient]);

  return null;
}

/** Meta Pixel: init once, track a PageView on every route change. */
function FacebookPixel() {
  const pathname = usePathname();

  useEffect(() => {
    const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
    if (!pixelId) return;
    import("@/lib/fbpixel").then(({ initPixel, pageView }) => {
      initPixel(pixelId);
      pageView();
    });
  }, [pathname]);

  return null;
}

export default function Providers({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider locale={locale}>
        <AuthBootstrap />
        <LogoutRedirect />
        <FacebookPixel />
        {children}
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
