import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const PURPOSES = ["training", "commercial", "test", "recreational", "other"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("date" in body) allowed.date = body.date;
  if ("pilot_name" in body && body.pilot_name?.trim()) allowed.pilot_name = body.pilot_name.trim();
  if ("drone_id" in body) allowed.drone_id = body.drone_id || null;
  if ("drone_name" in body) allowed.drone_name = body.drone_name?.trim() || null;
  if ("location" in body && body.location?.trim()) allowed.location = body.location.trim();
  if ("takeoff_time" in body) allowed.takeoff_time = body.takeoff_time || null;
  if ("landing_time" in body) allowed.landing_time = body.landing_time || null;
  if ("duration_minutes" in body) allowed.duration_minutes = body.duration_minutes;
  if ("purpose" in body && PURPOSES.includes(body.purpose)) allowed.purpose = body.purpose;
  if ("weather" in body) allowed.weather = body.weather?.trim() || null;
  if ("incidents" in body) allowed.incidents = body.incidents?.trim() || null;
  if ("project_id" in body) allowed.project_id = body.project_id || null;
  if ("notes" in body) allowed.notes = body.notes?.trim() || null;
  if ("latitude" in body) allowed.latitude = typeof body.latitude === "number" ? body.latitude : null;
  if ("longitude" in body) allowed.longitude = typeof body.longitude === "number" ? body.longitude : null;
  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("flight_logs")
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
  const { error } = await supabaseAdmin.from("flight_logs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
