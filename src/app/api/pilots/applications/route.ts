import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  let q = supabaseAdmin.from("pilot_applications").select("*").order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let b: { id: string; status?: string; action?: string };
  try { b = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  // Standard status update
  if (b.status) {
    if (!["pending", "approved", "rejected"].includes(b.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from("pilot_applications").update({ status: b.status }).eq("id", b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Subscription actions
  if (b.action === "pay-intro") {
    // First payment: ₱199 for 3 months
    const today = new Date();
    const expires = new Date(today);
    expires.setMonth(expires.getMonth() + 3);
    const { data, error } = await supabaseAdmin
      .from("pilot_applications")
      .update({
        subscription_status:     "active",
        subscription_paid_at:    today.toISOString().slice(0, 10),
        subscription_expires_at: expires.toISOString().slice(0, 10),
      })
      .eq("id", b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (b.action === "pay-renewal") {
    // Renewal: ₱120 for 1 month
    // Extend from current expiry or today, whichever is later
    const { data: current } = await supabaseAdmin
      .from("pilot_applications").select("subscription_expires_at").eq("id", b.id).single();
    const base = current?.subscription_expires_at
      ? new Date(current.subscription_expires_at)
      : new Date();
    if (base < new Date()) base.setTime(new Date().getTime());
    base.setMonth(base.getMonth() + 1);
    const { data, error } = await supabaseAdmin
      .from("pilot_applications")
      .update({
        subscription_status:     "active",
        subscription_paid_at:    new Date().toISOString().slice(0, 10),
        subscription_expires_at: base.toISOString().slice(0, 10),
      })
      .eq("id", b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (b.action === "expire") {
    const { data, error } = await supabaseAdmin
      .from("pilot_applications")
      .update({ subscription_status: "expired" })
      .eq("id", b.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "No valid action" }, { status: 400 });
}
