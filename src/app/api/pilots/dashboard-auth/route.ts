import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Pilot "login" — verify by contact, return their profile + pending requests
export async function POST(req: NextRequest) {
  let b: { contact: string };
  try { b = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  if (!b.contact?.trim()) {
    return NextResponse.json({ error: "Contact required" }, { status: 400 });
  }

  // Find pilot by contact (case-insensitive)
  const { data: pilot } = await supabaseAdmin
    .from("pilot_applications")
    .select("id, name, location, country, primary_specialization, skill_level, services, drone_models, status, subscription_status, subscription_expires_at")
    .ilike("contact", b.contact.trim())
    .eq("status", "approved")
    .single();

  if (!pilot) {
    return NextResponse.json({ error: "No approved pilot found with that contact. Check your registered contact info." }, { status: 404 });
  }

  // Get their requests
  const { data: requests } = await supabaseAdmin
    .from("pilot_requests")
    .select("id, client_name, client_contact, client_location, service_type, description, budget, preferred_date, status, created_at")
    .eq("pilot_id", pilot.id)
    .order("created_at", { ascending: false });

  // Only reveal client contact on accepted requests
  const sanitized = (requests ?? []).map(r => ({
    ...r,
    client_contact: r.status === "accepted" ? r.client_contact : null,
  }));

  return NextResponse.json({ pilot, requests: sanitized });
}
