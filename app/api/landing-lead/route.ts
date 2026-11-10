import { NextResponse } from "next/server";

// Proxies landing-page lead submissions to the Make.com webhook so the
// webhook URL stays server-side (it was previously exposed via VITE_*).
export async function POST(request: Request) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Webhook failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
