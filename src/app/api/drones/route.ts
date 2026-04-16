import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("drones")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

  const payload = {
    name: body.name.trim(),
    model: body.model?.trim() || null,
    serial_number: body.serial_number?.trim() || null,
    caap_registration: body.caap_registration?.trim() || null,
    purchased_at: body.purchased_at || null,
    status: ["active", "maintenance", "retired"].includes(body.status) ? body.status : "active",
    notes: body.notes?.trim() || null,
  };

  const { data, error } = await supabaseAdmin.from("drones").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
