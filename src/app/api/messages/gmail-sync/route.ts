import { checkAuth } from "@/lib/auth";
import { OFFICIAL_EMAIL } from "@/lib/email-config";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const GMAIL_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users";

type GmailHeader = { name?: string; value?: string };
type GmailMessage = {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: { headers?: GmailHeader[] };
};

function header(headers: GmailHeader[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";
}

function parseSender(from: string) {
  const match = from.match(/^(.*?)\s*<([^>]+)>$/);
  if (!match) return { name: from || "Gmail sender", contact: from || "unknown@gmail.com" };
  return {
    name: match[1].replace(/^"|"$/g, "").trim() || match[2],
    contact: match[2].trim().toLowerCase(),
  };
}

async function getAccessToken() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch(GMAIL_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    console.error("Gmail token refresh failed:", res.status, await res.text());
    return null;
  }

  const data = (await res.json()) as { access_token?: string };
  return data.access_token || null;
}

async function upsertContact(name: string, contact: string) {
  if (!contact.includes("@")) return null;

  const { data: existing } = await supabaseAdmin
    .from("contacts")
    .select("id")
    .ilike("email", contact)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: inserted, error } = await supabaseAdmin
    .from("contacts")
    .insert({ name, email: contact })
    .select("id")
    .single();

  if (error) {
    console.warn("Gmail contact insert failed:", error.message);
    return null;
  }

  return inserted?.id ?? null;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      {
        error:
          "Gmail sync is not configured. Add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN.",
      },
      { status: 503 },
    );
  }

  const user = process.env.GMAIL_USER || "me";
  const query = `to:${OFFICIAL_EMAIL} newer_than:30d -from:${OFFICIAL_EMAIL}`;
  const listUrl = `${GMAIL_API}/${encodeURIComponent(user)}/messages?${new URLSearchParams({
    maxResults: "25",
    q: query,
  })}`;

  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    return NextResponse.json({ error: await listRes.text() }, { status: listRes.status });
  }

  const list = (await listRes.json()) as { messages?: Array<{ id: string }> };
  const ids = list.messages?.map((m) => m.id).filter(Boolean) || [];
  let imported = 0;
  let skipped = 0;

  for (const id of ids) {
    const marker = `[GMAIL:${id}]`;
    const { data: existing } = await supabaseAdmin
      .from("waevpoint_messages")
      .select("id")
      .ilike("notes", `%${marker}%`)
      .maybeSingle();

    if (existing?.id) {
      skipped += 1;
      continue;
    }

    const params = new URLSearchParams({ format: "metadata" });
    params.append("metadataHeaders", "From");
    params.append("metadataHeaders", "Subject");
    params.append("metadataHeaders", "Date");

    const msgRes = await fetch(`${GMAIL_API}/${encodeURIComponent(user)}/messages/${id}?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!msgRes.ok) {
      skipped += 1;
      continue;
    }

    const msg = (await msgRes.json()) as GmailMessage;
    const headers = msg.payload?.headers || [];
    const sender = parseSender(header(headers, "From"));
    const subject = header(headers, "Subject") || "Gmail message";
    const date = msg.internalDate ? new Date(Number(msg.internalDate)).toISOString() : new Date().toISOString();
    const contactId = await upsertContact(sender.name, sender.contact);
    const body = `Subject: ${subject}\n\n${msg.snippet || "(No preview available)"}`;

    const { error } = await supabaseAdmin.from("waevpoint_messages").insert({
      name: sender.name,
      contact: sender.contact,
      service_type: "email",
      message: body,
      status: "unread",
      notes: `${marker} Imported from ${OFFICIAL_EMAIL}`,
      contact_id: contactId,
      created_at: date,
    });

    if (error) {
      console.error("Gmail message insert failed:", error.message);
      skipped += 1;
      continue;
    }

    imported += 1;
  }

  return NextResponse.json({ ok: true, imported, skipped });
}
