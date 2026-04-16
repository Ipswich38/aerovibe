import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("name" in body && body.name?.trim()) allowed.name = body.name.trim();
  if ("model" in body) allowed.model = body.model?.trim() || null;
  if ("serial_number" in body) allowed.serial_number = body.serial_number?.trim() || null;
  if ("caap_registration" in body) allowed.caap_registration = body.caap_registration?.trim() || null;
  if ("purchased_at" in body) allowed.purchased_at = body.purchased_at || null;
  if ("status" in body && ["active", "maintenance", "retired"].includes(body.status))
    allowed.status = body.status;
  if ("notes" in body) allowed.notes = body.notes?.trim() || null;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("drones")
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
  const { error } = await supabaseAdmin.from("drones").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
