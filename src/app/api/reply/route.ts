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
      from: { email: "hello@waevpoint.quest", name: "waevpoint" },
      to: [{ email: to }],
      subject,
      text: body + "\n\n—\nWaevPoint Team\nAerial Creative Services\nwaevpoint.quest",
      html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;">
${body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}
<br><br>
<table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:#333;">
  <tr><td style="padding:0 0 10px 0;"><div style="border-top:1px solid #e5e5e5;"></div></td></tr>
  <tr><td>
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding-right:14px;vertical-align:top;">
        <a href="https://waevpoint.quest" target="_blank" style="text-decoration:none;">
          <img src="https://waevpoint.quest/images/email-logo-small.png" width="120" height="44" alt="waevpoint" style="display:block;border:0;border-radius:4px;" />
        </a>
      </td>
      <td style="vertical-align:top;border-left:2px solid #06b6d4;padding-left:12px;">
        <div style="font-size:14px;font-weight:600;color:#1c1c1e;">WaevPoint Team</div>
        <div style="font-size:12px;color:#666;margin-top:2px;">Aerial Creative Services</div>
        <div style="margin-top:4px;"><a href="https://waevpoint.quest" style="font-size:11px;color:#06b6d4;text-decoration:none;">waevpoint.quest</a></div>
      </td>
    </tr></table>
  </td></tr>
</table>
</div>`,
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
