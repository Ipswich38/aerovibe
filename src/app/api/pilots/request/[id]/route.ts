import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Public GET — client checks their request status (UUID is the access credential)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("pilot_requests")
    .select("id, pilot_name, pilot_contact, client_name, service_type, client_location, status, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  // Only reveal pilot contact after acceptance
  return NextResponse.json({
    id:             data.id,
    pilot_name:     data.pilot_name,
    pilot_contact:  data.status === "accepted" ? data.pilot_contact : null,
    client_name:    data.client_name,
    service_type:   data.service_type,
    location:       data.client_location,
    status:         data.status,
    created_at:     data.created_at,
  });
}

// Pilot accepts or declines — authenticated by pilot_id + contact match
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let b: { action: string; pilot_contact: string };
  try { b = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  if (!["accept", "decline"].includes(b.action)) {
    return NextResponse.json({ error: "action must be accept or decline" }, { status: 400 });
  }
  if (!b.pilot_contact?.trim()) {
    return NextResponse.json({ error: "pilot_contact required to verify identity" }, { status: 400 });
  }

  // Verify this pilot owns the request
  const { data: request } = await supabaseAdmin
    .from("pilot_requests")
    .select("id, pilot_id, pilot_contact, status")
    .eq("id", id)
    .single();

  if (!request) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  if (request.status !== "pending") {
    return NextResponse.json({ error: `Request is already ${request.status}.` }, { status: 409 });
  }
  if (request.pilot_contact.trim().toLowerCase() !== b.pilot_contact.trim().toLowerCase()) {
    return NextResponse.json({ error: "Contact does not match." }, { status: 403 });
  }

  const newStatus = b.action === "accept" ? "accepted" : "declined";
  const { data, error } = await supabaseAdmin
    .from("pilot_requests")
    .update({ status: newStatus })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, status: newStatus, request: data });
}
