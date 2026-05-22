import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

// Ops: GET all referral stats
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: partners } = await supabaseAdmin
    .from("referral_partners")
    .select("*")
    .order("created_at");

  const { data: referrals } = await supabaseAdmin
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false });

  const stats = (partners ?? []).map(p => {
    const pRefs      = (referrals ?? []).filter(r => r.code === p.code);
    const signups    = pRefs.length;
    const converted  = pRefs.filter(r => r.subscribed).length;
    const paidOut    = pRefs.filter(r => r.payout_sent).length;
    const owedTotal  = converted * p.rate_usd;
    const owedUnpaid = (converted - paidOut) * p.rate_usd;
    return { ...p, signups, converted, owedTotal, owedUnpaid, referrals: pRefs };
  });

  return NextResponse.json({ partners: stats });
}

// Ops: PATCH — mark payout sent for a referral
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let b: { referral_id?: string; code?: string; mark_all?: boolean };
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  if (b.mark_all && b.code) {
    await supabaseAdmin
      .from("referrals")
      .update({ payout_sent: true })
      .eq("code", b.code)
      .eq("subscribed", true)
      .eq("payout_sent", false);
    return NextResponse.json({ success: true });
  }

  if (b.referral_id) {
    await supabaseAdmin
      .from("referrals")
      .update({ payout_sent: true })
      .eq("id", b.referral_id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Provide referral_id or code+mark_all" }, { status: 400 });
}
