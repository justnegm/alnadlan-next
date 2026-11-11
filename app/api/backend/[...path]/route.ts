import { NextResponse, type NextRequest } from "next/server";
import {
  BACKEND_URL,
  REFRESH_COOKIE,
  TOKEN_COOKIE,
  clearSession,
  isSameOrigin,
  refreshTokens,
  setSession,
} from "@/server/session";

/**
 * Backend-for-frontend: every browser API call goes through here. The JWTs stay
 * in httpOnly cookies and are attached server-side, so page JS never sees them.
 */

const PREFIX = "/api/backend";
const LOGIN_PATH = "/auth/login/";

const FORWARD_REQUEST_HEADERS = ["content-type", "accept", "accept-language"];
const FORWARD_RESPONSE_HEADERS = ["content-type", "content-disposition", "cache-control"];

async function callBackend(req: NextRequest, path: string, body: ArrayBuffer | undefined, token?: string) {
  const url = new URL(path + req.nextUrl.search, BACKEND_URL);
  const headers = new Headers();
  for (const h of FORWARD_REQUEST_HEADERS) {
    const v = req.headers.get(h);
    if (v) headers.set(h, v);
  }
  if (token) headers.set("authorization", `Bearer ${token}`);

  return fetch(url, { method: req.method, headers, body, cache: "no-store", redirect: "manual" });
}

async function handle(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ detail: "Cross-origin request rejected." }, { status: 403 });
  }

  // Next strips the trailing slash before we get here; every Django endpoint
  // needs one (APPEND_SLASH can't redirect POSTs), so put it back.
  const stripped = req.nextUrl.pathname.slice(PREFIX.length) || "/";
  const path = stripped.endsWith("/") ? stripped : `${stripped}/`;
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

  let token = req.cookies.get(TOKEN_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  let renewed: { access: string; refresh: string | null } | null = null;
  let sessionDead = false;

  // Access cookie expired but session is still alive: refresh up front.
  if (!token && refresh) {
    renewed = await refreshTokens(refresh);
    if (renewed) token = renewed.access;
    else sessionDead = true;
  }

  let upstream = await callBackend(req, path, body, token);

  if (upstream.status === 401 && refresh && !renewed && !sessionDead) {
    renewed = await refreshTokens(refresh);
    if (renewed) upstream = await callBackend(req, path, body, renewed.access);
    else sessionDead = true;
  }

  // Login: move the tokens into httpOnly cookies and strip them from the body.
  if (path === LOGIN_PATH && req.method === "POST" && upstream.ok) {
    const data = await upstream.json();
    const { access, refresh: newRefresh, ...rest } = data ?? {};
    const res = NextResponse.json(rest, { status: upstream.status });
    if (access) setSession(res, req, access, newRefresh);
    return res;
  }

  const headers = new Headers();
  for (const h of FORWARD_RESPONSE_HEADERS) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  const res = new NextResponse(upstream.status === 204 ? null : upstream.body, {
    status: upstream.status,
    headers,
  });

  if (renewed) setSession(res, req, renewed.access, renewed.refresh);
  else if (sessionDead || (upstream.status === 401 && !refresh && token)) clearSession(res);
  return res;
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;

export const dynamic = "force-dynamic";
