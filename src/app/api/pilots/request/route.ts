import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ipLog = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 5) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let b: Record<string, string>;
  try { b = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const required = ["pilot_id", "client_name", "client_contact", "service_type", "description"];
  for (const f of required) {
    if (!b[f]?.trim()) return NextResponse.json({ error: `${f} is required` }, { status: 400 });
  }

  // Verify pilot exists, is approved, and has active subscription
  const { data: pilot, error: pilotErr } = await supabaseAdmin
    .from("pilot_applications")
    .select("id, name, contact, status, subscription_status")
    .eq("id", b.pilot_id)
    .single();

  if (pilotErr || !pilot) {
    return NextResponse.json({ error: "Pilot not found." }, { status: 404 });
  }
  if (pilot.status !== "approved") {
    return NextResponse.json({ error: "Pilot is not available." }, { status: 400 });
  }
  if (pilot.subscription_status !== "active") {
    return NextResponse.json({ error: "This pilot is not currently accepting requests." }, { status: 400 });
  }

  // Check pilot doesn't already have a pending request from this client (same contact)
  const { count } = await supabaseAdmin
    .from("pilot_requests")
    .select("id", { count: "exact", head: true })
    .eq("pilot_id", b.pilot_id)
    .eq("client_contact", b.client_contact.trim())
    .eq("status", "pending");

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "You already have a pending request with this pilot." }, { status: 409 });
  }

  const { data, error } = await supabaseAdmin
    .from("pilot_requests")
    .insert({
      pilot_id:       pilot.id,
      pilot_name:     pilot.name,
      pilot_contact:  pilot.contact,
      client_name:    b.client_name.trim().slice(0, 100),
      client_contact: b.client_contact.trim().slice(0, 120),
      client_location:b.client_location?.trim().slice(0, 150) ?? null,
      service_type:   b.service_type.trim().slice(0, 100),
      description:    b.description.trim().slice(0, 600),
      budget:         b.budget?.trim().slice(0, 80) ?? null,
      preferred_date: b.preferred_date || null,
      status:         "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Request insert error:", error);
    return NextResponse.json({ error: "Could not send request. Try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true, request_id: data.id });
}
