import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const VALID_STATUSES = ["lead", "booked", "shooting", "editing", "delivered", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("title" in body && body.title?.trim()) allowed.title = body.title.trim();
  if ("service_type" in body) allowed.service_type = body.service_type?.trim() || null;
  if ("status" in body && VALID_STATUSES.includes(body.status)) allowed.status = body.status;
  if ("shoot_date" in body) allowed.shoot_date = body.shoot_date || null;
  if ("deadline" in body) allowed.deadline = body.deadline || null;
  if ("amount" in body) {
    allowed.amount = typeof body.amount === "number" && Number.isFinite(body.amount) ? body.amount : null;
  }
  if ("location" in body) allowed.location = body.location?.trim() || null;
  if ("description" in body) allowed.description = body.description?.trim() || null;
  if ("notes" in body) allowed.notes = body.notes?.trim() || null;
  if (body.generate_delivery_token) {
    allowed.delivery_token = randomBytes(16).toString("hex");
  }
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("projects")
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Project update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
  if (error) {
    console.error("Project delete error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
