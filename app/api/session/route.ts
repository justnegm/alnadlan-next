import { NextResponse, type NextRequest } from "next/server";
import { clearSession, isSameOrigin, setSession } from "@/server/session";

/** POST: one-time upgrade of tokens left in localStorage by the old SPA. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const { token, refresh } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || !token) {
    return NextResponse.json({ detail: "token required" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  setSession(res, req, token, typeof refresh === "string" ? refresh : null);
  return res;
}

/** DELETE: logout — the client can't clear httpOnly cookies itself. */
export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  clearSession(res);
  return res;
}
