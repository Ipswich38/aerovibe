import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const STATUSES = ["new", "contacted", "qualified", "converted", "dismissed"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("status" in body && STATUSES.includes(body.status)) allowed.status = body.status;
  if ("notes" in body) allowed.notes = body.notes?.trim() || null;
  if ("phone" in body) allowed.phone = body.phone?.trim() || null;
  if ("email" in body) allowed.email = body.email?.trim() ? body.email.trim().toLowerCase() : null;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("leads")
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
