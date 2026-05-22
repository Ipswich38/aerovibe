import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = event.data.object as any;

  switch (event.type) {
    case "checkout.session.completed": {
      const meta   = obj.metadata ?? {};
      const authId = meta.auth_user_id as string;
      const addons = JSON.parse(meta.addons ?? "[]") as string[];
      const subId  = obj.subscription as string;
      const custId = obj.customer as string;

      if (authId && subId) {
        const stripeSub = await stripe.subscriptions.retrieve(subId);
        const periodStart = new Date((stripeSub as unknown as { current_period_start: number }).current_period_start * 1000).toISOString();
        const periodEnd   = new Date((stripeSub as unknown as { current_period_end: number }).current_period_end   * 1000).toISOString();

        await supabaseAdmin.from("operator_subscriptions").upsert({
          auth_user_id:         authId,
          stripe_customer_id:   custId,
          stripe_sub_id:        subId,
          status:               "active",
          addons,
          current_period_start: periodStart,
          current_period_end:   periodEnd,
        }, { onConflict: "auth_user_id" });

        await supabaseAdmin.from("pilot_applications")
          .update({ subscription_status: "active", subscription_expires_at: periodEnd.slice(0, 10) })
          .eq("auth_user_id", authId);

        // Mark referral conversion
        const { data: ref } = await supabaseAdmin
          .from("referrals")
          .select("id, code, subscribed")
          .eq("auth_user_id", authId)
          .single();
        if (ref && !ref.subscribed) {
          const { data: partner } = await supabaseAdmin
            .from("referral_partners")
            .select("rate_usd")
            .eq("code", ref.code)
            .single();
          await supabaseAdmin.from("referrals").update({
            subscribed:    true,
            subscribed_at: new Date().toISOString(),
            payout_due:    partner?.rate_usd ?? 1,
          }).eq("id", ref.id);
        }
      }
      break;
    }

    case "invoice.payment_succeeded": {
      const subId = obj.subscription as string | null;
      if (!subId) break;
      const stripeSub = await stripe.subscriptions.retrieve(subId);
      const raw       = stripeSub as unknown as { metadata: Record<string, string>; current_period_start: number; current_period_end: number };
      const authId    = raw.metadata?.auth_user_id;
      if (authId) {
        await supabaseAdmin.from("operator_subscriptions").update({
          status:               "active",
          current_period_start: new Date(raw.current_period_start * 1000).toISOString(),
          current_period_end:   new Date(raw.current_period_end   * 1000).toISOString(),
        }).eq("auth_user_id", authId);
      }
      break;
    }

    case "customer.subscription.deleted":
    case "invoice.payment_failed": {
      const raw    = obj as unknown as { metadata: Record<string, string> };
      const authId = raw.metadata?.auth_user_id;
      if (authId) {
        await supabaseAdmin.from("operator_subscriptions").update({ status: "inactive" }).eq("auth_user_id", authId);
        await supabaseAdmin.from("pilot_applications").update({ subscription_status: "expired" }).eq("auth_user_id", authId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
