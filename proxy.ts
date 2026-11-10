import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_LOCALE = "he";
const NON_DEFAULT_LOCALES = ["ar"];

const PROTECTED_PREFIXES = ["/profile", "/property/create", "/property/edit"];
const AUTH_PREFIX = "/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Resolve locale from the URL. Default locale ("he") is unprefixed;
  //    /he/* redirects to the unprefixed canonical URL; /ar/* is served as-is.
  if (pathname === `/${DEFAULT_LOCALE}` || pathname.startsWith(`/${DEFAULT_LOCALE}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
    return NextResponse.redirect(url, 308);
  }

  let locale = DEFAULT_LOCALE;
  let appPath = pathname; // path without locale prefix, used for guard checks
  for (const l of NON_DEFAULT_LOCALES) {
    if (pathname === `/${l}` || pathname.startsWith(`/${l}/`)) {
      locale = l;
      appPath = pathname.slice(l.length + 1) || "/";
      break;
    }
  }

  // Legacy ?lang= URLs → redirect to the locale-segment equivalent.
  const legacyLang = request.nextUrl.searchParams.get("lang");
  if (legacyLang && (legacyLang === DEFAULT_LOCALE || NON_DEFAULT_LOCALES.includes(legacyLang))) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    url.pathname = legacyLang === DEFAULT_LOCALE ? appPath : `/${legacyLang}${appPath === "/" ? "" : appPath}`;
    return NextResponse.redirect(url, 308);
  }

  // 2. Auth guards (cookie-based).
  const hasToken = Boolean(request.cookies.get("token")?.value || request.cookies.get("refresh")?.value);
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  if (!hasToken && PROTECTED_PREFIXES.some((p) => appPath === p || appPath.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}/auth`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (hasToken && (appPath === AUTH_PREFIX || appPath.startsWith(`${AUTH_PREFIX}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = prefix || "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 3. Serve the default locale from the unprefixed URL via internal rewrite.
  if (locale === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals, API routes, and any file with an extension (public assets).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
