import { checkAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { sendIMessage } from "@/lib/auto-reply";

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
