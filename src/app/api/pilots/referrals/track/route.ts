import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let b: { code: string; email?: string };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  if (!b.code?.trim()) return NextResponse.json({ ok: true }); // no-op

  // Verify partner code exists
  const { data: partner } = await supabaseAdmin
    .from("referral_partners")
    .select("id, rate_usd")
    .eq("code", b.code.toLowerCase())
    .eq("active", true)
    .single();

  if (!partner) return NextResponse.json({ ok: true }); // unknown code, silent

  // Only insert if not already tracked for this user
  const { data: existing } = await supabaseAdmin
    .from("referrals")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!existing) {
    await supabaseAdmin.from("referrals").insert({
      code:         b.code.toLowerCase(),
      auth_user_id: user.id,
      email:        b.email ?? user.email ?? null,
      subscribed:   false,
      payout_due:   0,
    });
  }

  return NextResponse.json({ ok: true });
}
