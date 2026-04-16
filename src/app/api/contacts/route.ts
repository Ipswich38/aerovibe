import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

interface MsgRow {
  id: string;
  contact_id: string | null;
  status: string;
  created_at: string;
}

interface ProjRow {
  id: string;
  contact_id: string;
}

interface TxRow {
  contact_id: string | null;
  kind: string;
  amount: number | string;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let q = supabaseAdmin.from("contacts").select("*").order("updated_at", { ascending: false });
  if (status && ["lead", "active", "past"].includes(status)) q = q.eq("status", status);
  const { data: contacts, error } = await q;

  if (error) {
    console.error("Contacts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  const ids = (contacts || []).map((c) => c.id);
  if (ids.length === 0) return NextResponse.json([]);

  const [msgRes, projRes, txRes] = await Promise.all([
    supabaseAdmin
      .from("waevpoint_messages")
      .select("id, contact_id, status, created_at")
      .in("contact_id", ids),
    supabaseAdmin.from("projects").select("id, contact_id").in("contact_id", ids),
    supabaseAdmin
      .from("transactions")
      .select("contact_id, kind, amount")
      .in("contact_id", ids)
      .eq("kind", "income"),
  ]);

  const msgByContact = new Map<string, MsgRow[]>();
  for (const m of (msgRes.data as MsgRow[]) || []) {
    if (!m.contact_id) continue;
    const arr = msgByContact.get(m.contact_id) || [];
    arr.push(m);
    msgByContact.set(m.contact_id, arr);
  }

  const projCount = new Map<string, number>();
  for (const p of (projRes.data as ProjRow[]) || []) {
    projCount.set(p.contact_id, (projCount.get(p.contact_id) || 0) + 1);
  }

  const revenue = new Map<string, number>();
  for (const t of (txRes.data as TxRow[]) || []) {
    if (!t.contact_id) continue;
    revenue.set(t.contact_id, (revenue.get(t.contact_id) || 0) + Number(t.amount));
  }

  const enriched = (contacts || []).map((c) => {
    const msgs = msgByContact.get(c.id) || [];
    const unread = msgs.filter((m) => m.status === "unread").length;
    const lastMsg = msgs.reduce<string | null>((latest, m) => {
      if (!latest || m.created_at > latest) return m.created_at;
      return latest;
    }, null);
    return {
      ...c,
      project_count: projCount.get(c.id) || 0,
      message_count: msgs.length,
      unread_count: unread,
      total_revenue: revenue.get(c.id) || 0,
      last_activity: lastMsg || c.updated_at,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, email, phone, status, notes, tags } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }

  const payload = {
    name: name.trim(),
    email: email?.trim() ? email.trim().toLowerCase() : null,
    phone: phone?.trim() || null,
    status: status && ["lead", "active", "past"].includes(status) ? status : "lead",
    notes: notes?.trim() || null,
    tags: Array.isArray(tags) ? tags : [],
  };

  const { data, error } = await supabaseAdmin.from("contacts").insert(payload).select("*").single();
  if (error) {
    console.error("Contact insert error:", error);
    return NextResponse.json({ error: error.message || "Failed to save" }, { status: 500 });
  }
  return NextResponse.json(data);
}
