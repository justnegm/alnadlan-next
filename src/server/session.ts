import "server-only";
import type { NextRequest, NextResponse } from "next/server";

/**
 * Auth session cookies. The JWTs live in httpOnly cookies the browser's JS can
 * never read; `logged_in` is a non-secret flag so client UI knows auth state.
 */
export const TOKEN_COOKIE = "token";
export const REFRESH_COOKIE = "refresh";
export const FLAG_COOKIE = "logged_in";

const TOKEN_MAX_AGE = 60 * 60 * 24; // 1 day; refreshed on demand
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL!;

const isSecure = (req: NextRequest) => req.nextUrl.protocol === "https:";

export function setSession(res: NextResponse, req: NextRequest, access: string, refresh?: string | null) {
  const base = { path: "/", sameSite: "lax" as const, secure: isSecure(req) };
  res.cookies.set(TOKEN_COOKIE, access, { ...base, httpOnly: true, maxAge: TOKEN_MAX_AGE });
  if (refresh) {
    res.cookies.set(REFRESH_COOKIE, refresh, { ...base, httpOnly: true, maxAge: REFRESH_MAX_AGE });
    res.cookies.set(FLAG_COOKIE, "1", { ...base, httpOnly: false, maxAge: REFRESH_MAX_AGE });
  }
}

export function clearSession(res: NextResponse) {
  for (const name of [TOKEN_COOKIE, REFRESH_COOKIE, FLAG_COOKIE]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
}

/**
 * Cookie-authenticated state-changing requests must come from our own origin.
 * SameSite=Lax already blocks most cross-site sends; this closes the rest.
 */
export function isSameOrigin(req: NextRequest) {
  if (req.method === "GET" || req.method === "HEAD") return true;
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients / same-origin navigations without Origin
  return origin === req.nextUrl.origin || origin === new URL(req.url).origin;
}

type Tokens = { access: string; refresh: string | null };

// Parallel requests that all hit an expired token share one refresh call, so a
// backend that rotates/blacklists refresh tokens doesn't log the user out.
const inflight = new Map<string, Promise<Tokens | null>>();

export function refreshTokens(refresh: string): Promise<Tokens | null> {
  const pending = inflight.get(refresh);
  if (pending) return pending;

  const p = (async () => {
    try {
      const res = await fetch(new URL("/auth/token/refresh/", BACKEND_URL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        cache: "no-store",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data?.access ? { access: data.access, refresh: data.refresh ?? null } : null;
    } catch {
      return null;
    }
  })();

  inflight.set(refresh, p);
  // Keep the result briefly for stragglers, then forget it.
  p.finally(() => setTimeout(() => inflight.delete(refresh), 10_000));
  return p;
}
