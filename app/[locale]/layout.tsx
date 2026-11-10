import type { Metadata } from "next";
import { Zain } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { LOCALES, isLocale, type Locale } from "@/i18n/config";
import Providers from "./providers";
import "@/index.css";

const zain = Zain({
  weight: ["200", "300", "400", "700", "800", "900"],
  subsets: ["arabic", "latin"],
  display: "swap",
  variable: "--font-zain",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alnadlan.co.il";

const DESCRIPTIONS: Record<Locale, string> = {
  he: "Alnadlan – פלטפורמת הנדל”ן המובילה בישראל. מצא נכסים, סיורים וירטואליים בתלת־ממד, מתווכים, משרדי תיווך ופרויקטים חדשים – הכל במקום אחד.",
  ar: "Alnadlan – منصة العقارات الرائدة في إسرائيل. اعثر على عقارات، جولات افتراضية ثلاثية الأبعاد، وسطاء، مكاتب وساطة ومشاريع جديدة – كل ذلك في مكان واحد.",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : "he";
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "Alnadlan", template: "%s | Alnadlan" },
    description: DESCRIPTIONS[l],
    icons: { icon: "/logo.jpeg", apple: "/logo.jpeg" },
    alternates: {
      languages: { he: "/", ar: "/ar" },
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir="rtl" className={zain.variable}>
      <head>
        <link rel="preconnect" href="https://api.alnadlan.co.il" />
      </head>
      <body>
        <Providers locale={locale}>{children}</Providers>
        <Script id="nagishli-config" strategy="afterInteractive">
          {`window.nagishli_config = { language: "en", color: "blue" };`}
        </Script>
        <Script src="/nagishli_beta.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
