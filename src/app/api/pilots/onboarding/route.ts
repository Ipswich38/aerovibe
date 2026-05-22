import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    roles: string[];
    operator?: Record<string, string>;
    client?: Record<string, string>;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const results: Record<string, unknown> = {};

  // ── Operator profile ──────────────────────────────────────────────────────
  if (body.roles.includes("operator") && body.operator) {
    const op = body.operator;
    if (!op.name?.trim() || !op.contact?.trim() || !op.location?.trim()) {
      return NextResponse.json({ error: "Operator profile requires name, contact, and location." }, { status: 400 });
    }

    // Check if already has a profile linked to this auth user
    const { data: existing } = await supabaseAdmin
      .from("pilot_applications")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!existing) {
      // Check founding pilot count (first 100 get 30-day free trial)
      const { count: operatorCount } = await supabaseAdmin
        .from("pilot_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("account_type", "operator");

      const isFounder     = (operatorCount ?? 0) < 100;
      const trialExpires  = isFounder ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

      const { data, error } = await supabaseAdmin.from("pilot_applications").insert({
        auth_user_id:           user.id,
        name:                   op.name.trim().slice(0, 100),
        contact:                op.contact.trim().slice(0, 120),
        email:                  user.email ?? null,
        location:               op.location.trim().slice(0, 150),
        province:               op.region?.trim().slice(0, 80) ?? null,
        country:                op.country?.trim() ?? "",
        caap_license:           op.license?.trim().slice(0, 80) ?? null,
        drone_models:           op.drones?.trim().slice(0, 200) ?? "",
        primary_specialization: op.specialization?.trim().slice(0, 100) ?? null,
        skill_level:            op.skill_level?.trim() ?? "intermediate",
        services:               op.services?.trim().slice(0, 400) ?? "",
        offered_services:       op.offered_services?.trim().slice(0, 400) ?? null,
        experience_yrs:         parseInt(op.experience_yrs ?? "0", 10) || 0,
        about:                  op.about?.trim().slice(0, 600) ?? null,
        status:                 "approved",
        subscription_status:    isFounder ? "active" : "unpaid",
        subscription_expires_at:isFounder ? trialExpires!.toISOString().slice(0, 10) : null,
        account_type:           "operator",
      }).select("id").single();

      if (error) {
        console.error("Operator insert error:", error);
      } else {
        results.operator = data;
        // Create subscription record for founders
        if (isFounder && data) {
          await supabaseAdmin.from("operator_subscriptions").upsert({
            auth_user_id:      user.id,
            status:            "trial",
            is_founder:        true,
            trial_expires_at:  trialExpires!.toISOString(),
            addons:            [],
          }, { onConflict: "auth_user_id" });
          results.is_founder = true;
          results.trial_days = 30;
        }
      }
    } else {
      results.operator = existing;
    }
  }

  // ── Client profile ────────────────────────────────────────────────────────
  if (body.roles.includes("client") && body.client) {
    const cl = body.client;
    if (!cl.name?.trim() || !cl.contact?.trim()) {
      return NextResponse.json({ error: "Client profile requires name and contact." }, { status: 400 });
    }

    const { data: existing } = await supabaseAdmin
      .from("client_profiles")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (!existing) {
      const { data, error } = await supabaseAdmin.from("client_profiles").insert({
        auth_user_id: user.id,
        name:         cl.name.trim().slice(0, 100),
        contact:      cl.contact.trim().slice(0, 120),
        location:     cl.location?.trim().slice(0, 150) ?? null,
        country:      cl.country?.trim() ?? "Philippines",
      }).select("id").single();

      if (error) console.error("Client insert error:", error);
      else results.client = data;
    } else {
      results.client = existing;
    }
  }

  // ── Enthusiast / exploring — no profile needed ────────────────────────────
  // Just save their role preference to auth metadata
  if (body.roles.includes("enthusiast") || body.roles.includes("exploring")) {
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...((await supabaseAdmin.auth.admin.getUserById(user.id)).data.user?.user_metadata ?? {}),
        community_role: body.roles,
        onboarded_at: new Date().toISOString(),
      },
    });
    results.enthusiast = true;
  }

  return NextResponse.json({ success: true, results });
}
