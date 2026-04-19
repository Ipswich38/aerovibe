import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { classifyAndDraft, sendAutoReply, sendIMessage } from "@/lib/auto-reply";

const CEO_PHONE = "+639524807848";

const SERVICE_LABELS: Record<string, string> = {
  social: "Social Media",
  "real-estate": "Real Estate",
  event: "Wedding / Event",
  construction: "Construction",
  travel: "Travel / Tourism",
  commercial: "Commercial",
  "just-asking": "Pricing Inquiry",
  other: "Other",
};

const NOTIFY_EMAIL = "rootbyte.tech@gmail.com";

async function sendNotification(payload: {
  name: string;
  contact: string;
  service_type: string | null;
  message: string;
}) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  if (!apiKey) {
    console.warn("MAILERSEND_API_KEY not set — skipping notification");
    return;
  }

  const serviceLabel = payload.service_type
    ? SERVICE_LABELS[payload.service_type] || payload.service_type
    : "General inquiry";

  const subject = `New ${serviceLabel} inquiry from ${payload.name}`;

  const text = `New message from waevpoint.quest

From: ${payload.name}
Contact: ${payload.contact}
Service: ${serviceLabel}

Message:
${payload.message}

—
View and reply in inbox: https://waevpoint.quest/inbox`;

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;">
  <div style="border-left:3px solid #06b6d4;padding-left:14px;margin-bottom:20px;">
    <div style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">New inquiry</div>
    <h2 style="margin:0;font-size:18px;color:#111827;">${escape(serviceLabel)}</h2>
  </div>
  <table style="width:100%;font-size:13px;line-height:1.6;color:#374151;border-collapse:collapse;">
    <tr><td style="color:#6b7280;width:80px;padding:6px 0;">From</td><td style="padding:6px 0;font-weight:600;">${escape(payload.name)}</td></tr>
    <tr><td style="color:#6b7280;padding:6px 0;">Contact</td><td style="padding:6px 0;">${escape(payload.contact)}</td></tr>
    <tr><td style="color:#6b7280;padding:6px 0;vertical-align:top;">Message</td><td style="padding:6px 0;white-space:pre-wrap;">${escape(payload.message)}</td></tr>
  </table>
  <div style="margin-top:24px;">
    <a href="https://waevpoint.quest/inbox" style="display:inline-block;background:#06b6d4;color:#000;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;">Open Inbox</a>
  </div>
  <p style="color:#9ca3af;font-size:11px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:14px;">
    Forwarded from waevpoint.quest contact form. Reply directly from your <a href="https://waevpoint.quest/inbox" style="color:#06b6d4;">inbox dashboard</a>.
  </p>
</div>`;

  try {
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: "hello@waevpoint.quest", name: "waevpoint inbox" },
        to: [{ email: NOTIFY_EMAIL }],
        reply_to: payload.contact.includes("@")
          ? { email: payload.contact, name: payload.name }
          : undefined,
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error("MailerSend notification failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("MailerSend notification error:", err);
  }
}

async function upsertContact(name: string, contact: string): Promise<string | null> {
  const isEmail = contact.includes("@");
  const email = isEmail ? contact.toLowerCase() : null;
  const phone = isEmail ? null : contact;

  // Try to find existing contact first.
  const lookup = email
    ? supabaseAdmin.from("contacts").select("id").ilike("email", email).maybeSingle()
    : supabaseAdmin.from("contacts").select("id").eq("phone", phone).maybeSingle();

  const { data: existing, error: findErr } = await lookup;
  if (findErr) {
    console.warn("Contact lookup failed (table may not be migrated yet):", findErr.message);
    return null;
  }
  if (existing?.id) return existing.id;

  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("contacts")
    .insert({ name, email, phone })
    .select("id")
    .single();
  if (insertErr) {
    console.warn("Contact insert failed:", insertErr.message);
    return null;
  }
  return inserted?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contact, service_type, message } = body;

    if (!name?.trim() || !contact?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = {
      name: name.trim(),
      contact: contact.trim(),
      service_type: service_type || null,
      message: message.trim(),
    };

    const contactId = await upsertContact(payload.name, payload.contact);

    const { error } = await supabaseAdmin
      .from("waevpoint_messages")
      .insert({ ...payload, contact_id: contactId });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    // Fire-and-forget: notify CEO + classify + auto-reply + iMessage
    (async () => {
      await sendNotification(payload);

      const result = await classifyAndDraft(payload);
      if (!result) return;

      // Store classification as internal note
      const noteText = `[AUTO] Category: ${result.category} | Personal: ${result.personal_attention} | Auto-replied: ${result.can_auto_reply || result.personal_attention}`;
      await supabaseAdmin
        .from("waevpoint_messages")
        .update({ notes: noteText, service_type: result.category !== "unrelated" ? result.category : payload.service_type })
        .eq("contact", payload.contact)
        .eq("message", payload.message)
        .order("created_at", { ascending: false })
        .limit(1);

      // Send auto-reply email to client
      if (result.reply_draft && payload.contact.includes("@")) {
        const sent = await sendAutoReply(payload.contact, payload.name, result.reply_draft);
        if (sent) {
          await supabaseAdmin
            .from("waevpoint_messages")
            .update({ status: result.personal_attention ? "read" : "replied" })
            .eq("contact", payload.contact)
            .eq("message", payload.message);
        }
      }

      // iMessage CEO if personal attention needed
      if (result.personal_attention) {
        const serviceLabel = SERVICE_LABELS[result.category] || result.category;
        const imsg = `waevpoint inquiry needs your attention\n\nFrom: ${payload.name}\nContact: ${payload.contact}\nType: ${serviceLabel}\n\n"${payload.message.slice(0, 200)}"\n\nThis is about pricing/scheduling — auto-reply sent, they're expecting a personal follow-up.`;
        await sendIMessage(CEO_PHONE, imsg);
      }
    })().catch((e) => console.error("Auto-reply pipeline error:", e));

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
