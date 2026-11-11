"use client";

// Route error boundary (runtime errors). The 404 screen lives in
// app/[locale]/not-found.tsx, reusing src/views/error.tsx.
import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useT } from "@/i18n/useT";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useT();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-col items-center justify-center h-screen gap-5 p-5 text-center">
      <h3 className="lg:text-4xl text-2xl font-bold">{t.common.errorTitle}</h3>
      <button
        onClick={() => reset()}
        className="text-blue-500 underline underline-offset-2 cursor-pointer"
      >
        {t.common.tryAgain}
      </button>
      <Link href={'/'} className="text-blue-500 underline underline-offset-2">
        {t.common.backHome}
      </Link>
    </section>
  );
}
