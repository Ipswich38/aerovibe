import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const [contactRes, projectsRes, messagesRes, txRes] = await Promise.all([
    supabaseAdmin.from("contacts").select("*").eq("id", id).single(),
    supabaseAdmin
      .from("projects")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("waevpoint_messages")
      .select("*")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("contact_id", id)
      .order("date", { ascending: false }),
  ]);

  if (contactRes.error || !contactRes.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    contact: contactRes.data,
    projects: projectsRes.data || [],
    messages: messagesRes.data || [],
    transactions: txRes.data || [],
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("name" in body && body.name?.trim()) allowed.name = body.name.trim();
  if ("email" in body) allowed.email = body.email?.trim() ? body.email.trim().toLowerCase() : null;
  if ("phone" in body) allowed.phone = body.phone?.trim() || null;
  if ("status" in body && ["lead", "active", "past"].includes(body.status)) allowed.status = body.status;
  if ("notes" in body) allowed.notes = body.notes?.trim() || null;
  if ("tags" in body && Array.isArray(body.tags)) allowed.tags = body.tags;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("contacts")
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Contact update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id);
  if (error) {
    console.error("Contact delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
