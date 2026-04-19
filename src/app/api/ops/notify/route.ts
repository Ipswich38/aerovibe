import { NextRequest, NextResponse } from "next/server";
import { sendIMessage } from "@/lib/auto-reply";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const CEO_PHONE = "+639524807848";

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, phone } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const target = phone || CEO_PHONE;
  const sent = await sendIMessage(target, message.slice(0, 1000));

  if (!sent) {
    return NextResponse.json({ error: "iMessage send failed — may need local runtime" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
