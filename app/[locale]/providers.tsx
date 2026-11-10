"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
        <FacebookPixel />
        {children}
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
