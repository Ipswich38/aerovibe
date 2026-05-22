import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// GET — fetch authenticated user's full profile (operator + client)
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Operator profile
  const { data: operator } = await supabaseAdmin
    .from("pilot_applications")
    .select("id, name, contact, location, province, country, primary_specialization, skill_level, services, offered_services, drone_models, status, subscription_status, subscription_expires_at, auth_user_id, about")
    .eq("auth_user_id", user.id)
    .single();

  // Client profile
  const { data: client } = await supabaseAdmin
    .from("client_profiles")
    .select("id, name, contact, location, country")
    .eq("auth_user_id", user.id)
    .single();

  // Operator requests
  let requests: unknown[] = [];
  if (operator) {
    const { data } = await supabaseAdmin
      .from("pilot_requests")
      .select("id, client_name, client_contact, client_location, service_type, description, budget, preferred_date, status, created_at")
      .eq("pilot_id", operator.id)
      .order("created_at", { ascending: false });

    requests = (data ?? []).map(r => ({
      ...r,
      client_contact: r.status === "accepted" ? r.client_contact : null,
    }));
  }

  // Determine if user has completed onboarding
  const onboarded = !!(operator || client);

  return NextResponse.json({ operator, client, requests, onboarded, email: user.email });
}

// PATCH — link auth user to existing pilot application by contact
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let b: { contact: string };
  try { b = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  // Find pilot by contact and link to this auth user
  const { data, error } = await supabaseAdmin
    .from("pilot_applications")
    .update({ auth_user_id: user.id })
    .ilike("contact", b.contact.trim())
    .eq("status", "approved")
    .is("auth_user_id", null) // only link if not already linked
    .select("id, name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No approved pilot found with that contact, or already linked to another account." }, { status: 404 });
  }

  return NextResponse.json({ success: true, pilot: data });
}
