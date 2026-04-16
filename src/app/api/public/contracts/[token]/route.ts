import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .select("id, title, content, status, signed_at, client_signature_name")
    .eq("public_token", token)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = await req.json();
  const name = String(body?.signature_name || "").trim();
  if (!name) return NextResponse.json({ error: "signature_name required" }, { status: 400 });

  const { data: existing } = await supabaseAdmin
    .from("contracts")
    .select("id, status")
    .eq("public_token", token)
    .single();

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.status === "signed") {
    return NextResponse.json({ error: "Already signed" }, { status: 400 });
  }
  if (existing.status === "cancelled") {
    return NextResponse.json({ error: "Contract cancelled" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ua = req.headers.get("user-agent") || null;

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .update({
      status: "signed",
      client_signature_name: name,
      signed_at: new Date().toISOString(),
      signed_ip: ip,
      signed_user_agent: ua,
      updated_at: new Date().toISOString(),
    })
    .eq("public_token", token)
    .select("id, title, signed_at, client_signature_name")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
