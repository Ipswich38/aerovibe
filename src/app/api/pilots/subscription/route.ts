import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { PILOT_PLANS, calcTotal } from "@/lib/addons";

async function getAuthUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  return user ?? null;
}

function stripeAvailable() {
  return !!process.env.STRIPE_SECRET_KEY;
}

// GET — current subscription
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data } = await supabaseAdmin
    .from("operator_subscriptions")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  return NextResponse.json({ subscription: data ?? null, stripe_ready: stripeAvailable() });
}

// POST — create checkout session or pending activation
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { plan?: string; addons?: string[] };
  try { body = await req.json(); } catch { body = {}; }

  const addons = (body.addons ?? []).filter(Boolean);
  const plan = PILOT_PLANS.find(p => p.id === body.plan) ?? PILOT_PLANS[0];
  const total = plan.price + (calcTotal(addons) - PILOT_PLANS[0].price);

  // If Stripe is configured → create checkout session
  if (stripeAvailable()) {
    const Stripe  = (await import("stripe")).default;
    const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const origin  = req.headers.get("origin") ?? "https://waevpoint.quest";

    // Upsert Stripe customer
    const { data: existing } = await supabaseAdmin
      .from("operator_subscriptions")
      .select("stripe_customer_id")
      .eq("auth_user_id", user.id)
      .single();

    let customerId = existing?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { auth_user_id: user.id },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer:            customerId,
      mode:                "subscription",
      line_items:          [{
        quantity: 1,
        price_data: {
          currency: "php",
          unit_amount: total * 100,
          recurring: { interval: "month" },
          product_data: {
            name: `WaevPilots ${plan.label}`,
            description: addons.length > 0
              ? `Includes ${addons.length} selected mini-app${addons.length === 1 ? "" : "s"}.`
              : plan.desc,
          },
        },
      }],
      success_url:         `${origin}/pilots/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:          `${origin}/pilots/subscribe`,
      metadata:            { auth_user_id: user.id, plan: plan.id, addons: JSON.stringify(addons) },
      subscription_data:   { metadata: { auth_user_id: user.id, plan: plan.id, addons: JSON.stringify(addons) } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  }

  // Stripe not configured → save as pending, activate manually
  const { error } = await supabaseAdmin
    .from("operator_subscriptions")
    .upsert({
      auth_user_id: user.id,
      status:       "pending_activation",
      addons,
    }, { onConflict: "auth_user_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ pending: true, total, plan: plan.id, addons });
}

// PATCH — update add-ons, pause, cancel
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { action?: string; addons?: string[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid" }, { status: 400 }); }

  const { data: sub } = await supabaseAdmin
    .from("operator_subscriptions")
    .select("*")
    .eq("auth_user_id", user.id)
    .single();

  if (!sub) return NextResponse.json({ error: "No subscription found" }, { status: 404 });

  if (body.action === "cancel") {
    if (stripeAvailable() && process.env.STRIPE_PRICE_ADDON && sub.stripe_sub_id) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await stripe.subscriptions.update(sub.stripe_sub_id, { cancel_at_period_end: true });
    }
    await supabaseAdmin
      .from("operator_subscriptions")
      .update({ status: "cancelled" })
      .eq("auth_user_id", user.id);
    return NextResponse.json({ success: true, action: "cancelled" });
  }

  if (body.action === "pause") {
    if (stripeAvailable() && sub.stripe_sub_id) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await stripe.subscriptions.update(sub.stripe_sub_id, {
        pause_collection: { behavior: "void" },
      });
    }
    await supabaseAdmin
      .from("operator_subscriptions")
      .update({ status: "paused", paused_at: new Date().toISOString() })
      .eq("auth_user_id", user.id);
    return NextResponse.json({ success: true, action: "paused" });
  }

  if (body.action === "resume") {
    if (stripeAvailable() && sub.stripe_sub_id) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await stripe.subscriptions.update(sub.stripe_sub_id, { pause_collection: "" as unknown as null });
    }
    await supabaseAdmin
      .from("operator_subscriptions")
      .update({ status: "active", paused_at: null })
      .eq("auth_user_id", user.id);
    return NextResponse.json({ success: true, action: "resumed" });
  }

  if (body.action === "update-addons" && body.addons !== undefined) {
    if (stripeAvailable() && sub.stripe_sub_id) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_sub_id);
      const addonItem = stripeSub.items.data.find(
        (i) => i.price.id === process.env.STRIPE_PRICE_ADDON,
      );
      if (body.addons.length === 0 && addonItem) {
        await stripe.subscriptionItems.del(addonItem.id);
      } else if (body.addons.length > 0) {
        if (addonItem) {
          await stripe.subscriptionItems.update(addonItem.id, { quantity: body.addons.length });
        } else {
          await stripe.subscriptionItems.create({
            subscription: sub.stripe_sub_id,
            price:        process.env.STRIPE_PRICE_ADDON!,
            quantity:     body.addons.length,
          });
        }
      }
    }
    await supabaseAdmin
      .from("operator_subscriptions")
      .update({ addons: body.addons })
      .eq("auth_user_id", user.id);
    return NextResponse.json({ success: true, addons: body.addons });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
