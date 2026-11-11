import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/protected-routes";

const DEFAULT_LOCALE = "he";
const NON_DEFAULT_LOCALES = ["ar"];

const AUTH_PREFIX = "/auth";

export function proxy(request: NextRequest) {
  return upgradeLegacySession(request, route(request));
}

/**
 * Sessions created before the httpOnly switch have JS-readable token cookies and
 * no `logged_in` flag. Re-issue them as httpOnly (same name/path overwrites).
 */
function upgradeLegacySession(request: NextRequest, res: NextResponse) {
  const token = request.cookies.get("token")?.value;
  const refresh = request.cookies.get("refresh")?.value;
  if (!refresh || request.cookies.get("logged_in")) return res;

  const base = { path: "/", sameSite: "lax" as const, secure: request.nextUrl.protocol === "https:" };
  const month = 60 * 60 * 24 * 30;
  if (token) res.cookies.set("token", token, { ...base, httpOnly: true, maxAge: 60 * 60 * 24 });
  res.cookies.set("refresh", refresh, { ...base, httpOnly: true, maxAge: month });
  res.cookies.set("logged_in", "1", { ...base, httpOnly: false, maxAge: month });
  return res;
}

function route(request: NextRequest): NextResponse {
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

  if (!hasToken && isProtectedPath(appPath)) {
    const url = request.nextUrl.clone();
    url.pathname = `${prefix}/auth`;
    // Send them back here after login (auth.tsx reads ?next=, locale-less).
    url.search = `?next=${encodeURIComponent(appPath + request.nextUrl.search)}`;
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
