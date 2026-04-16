import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { messageId, to, subject, body } = await req.json();

  if (!to || !subject || !body || !messageId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const res = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MAILERSEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: "hello@waevpoint.quest", name: "waevpoint2740" },
      to: [{ email: to }],
      subject,
      text: body,
      html: body
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>")
        + '<br><br><p style="color:#888;font-size:12px;">— waevpoint2740 · <a href="https://waevpoint.quest">waevpoint.quest</a></p>',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("MailerSend error:", res.status, err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  await supabaseAdmin
    .from("waevpoint_messages")
    .update({ status: "replied", replied_at: new Date().toISOString() })
    .eq("id", messageId);

  return NextResponse.json({ ok: true });
}
