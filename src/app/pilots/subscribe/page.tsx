"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { ADDONS, BASE_PRICE, PILOT_PLANS } from "@/lib/addons";

const V = "#8b5cf6";

interface Subscription {
  id: string;
  status: "inactive" | "pending_activation" | "active" | "trial" | "paused" | "cancelled";
  addons: string[];
  current_period_end: string | null;
  trial_expires_at:   string | null;
  is_founder:         boolean;
  paused_at: string | null;
}

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string; desc: string }> = {
  trial:               { color: "#a78bfa", bg: "rgba(139,92,246,0.12)", label: "Free Trial",          desc: "Founding pilot — 30-day free access" },
  active:              { color: "#34d399", bg: "rgba(52,211,153,0.1)",  label: "Active",              desc: "Study, checklist, and logbook tools unlocked" },
  paused:              { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  label: "Paused",              desc: "Subscription paused — premium tools inactive" },
  cancelled:           { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Cancelled",           desc: "Subscription ended" },
  pending_activation:  { color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   label: "Pending Activation",  desc: "We'll activate shortly" },
  inactive:            { color: "#888",    bg: "rgba(255,255,255,0.05)", label: "Not subscribed",      desc: "Subscribe to unlock structured study and logbook tools" },
};

export default function SubscribePage() {
  const supabase    = createSupabaseBrowser();
  const [token,     setToken]     = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sub,       setSub]       = useState<Subscription | null>(null);
  const [stripeOk,  setStripeOk]  = useState(false);

  // Selected add-ons for new subscription or update
  const [selected,  setSelected]  = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<(typeof PILOT_PLANS)[number]["id"]>("pro");
  const [submitting,setSubmitting]= useState(false);
  const [msg,       setMsg]       = useState("");
  const [acting,    setActing]    = useState("");

  // Manage mode
  const [editAddons, setEditAddons] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/pilots/auth"; return; }
      setToken(session.access_token);
      const res = await fetch("/api/pilots/subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSub(data.subscription);
        setStripeOk(data.stripe_ready);
        if (data.subscription?.addons) setSelected(data.subscription.addons);
      }
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }

  async function subscribe() {
    setSubmitting(true); setMsg("");
    const res = await fetch("/api/pilots/subscription", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan, addons: selected }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setMsg(data.error ?? "Something went wrong."); return; }
    if (data.url) { window.location.href = data.url; return; } // Stripe checkout
    if (data.pending) {
      setMsg("Your subscription request has been received. We'll activate it shortly and notify you by email.");
      const r2 = await fetch("/api/pilots/subscription", { headers: { Authorization: `Bearer ${token}` } });
      if (r2.ok) { const d = await r2.json(); setSub(d.subscription); }
    }
  }

  async function doAction(action: string) {
    setActing(action); setMsg("");
    const body: Record<string, unknown> = { action };
    if (action === "update-addons") body.addons = selected;
    const res = await fetch("/api/pilots/subscription", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setActing("");
    if (!res.ok) { setMsg(data.error ?? "Failed"); return; }
    const r2 = await fetch("/api/pilots/subscription", { headers: { Authorization: `Bearer ${token}` } });
    if (r2.ok) { const d = await r2.json(); setSub(d.subscription); if (d.subscription?.addons) setSelected(d.subscription.addons); }
    setEditAddons(false);
    setMsg(action === "cancel" ? "Subscription cancelled." : action === "pause" ? "Subscription paused." : action === "resume" ? "Subscription resumed." : "Add-ons updated.");
  }

  const activePlan = PILOT_PLANS.find(plan => plan.id === selectedPlan) ?? PILOT_PLANS[1];
  const total = activePlan.price + selected.reduce((sum, id) => {
    const addon = ADDONS.find(a => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
  const isActive  = sub?.status === "active";
  const isTrial   = sub?.status === "trial";
  const isPaused  = sub?.status === "paused";
  const hasSub    = isActive || isTrial || isPaused || sub?.status === "pending_activation";

  const trialDaysLeft = isTrial && sub?.trial_expires_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_expires_at).getTime() - Date.now()) / 86_400_000))
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/pilots">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>×</span>
          <span className="font-bold text-[15px]" style={{ color: V, fontFamily: "'League Spartan', sans-serif" }}>
            WaevPilots
          </span>
        </div>
        <Link href="/pilots/dashboard" className="text-[11px] hover:text-white transition-colors" style={{ color: "#555" }}>
          ← Dashboard
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] mb-1"
            style={{ color: V, fontFamily: "'IBM Plex Mono', monospace" }}>
            Subscription
          </p>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>
            {hasSub ? "Manage your plan" : "Unlock pilot tools"}
          </h1>
        </div>

        {msg && (
          <div className="rounded-xl px-4 py-3 mb-6"
            style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <p className="text-[13px]" style={{ color: "#67e8f9" }}>{msg}</p>
          </div>
        )}

        {/* Current status */}
        {sub && sub.status !== "inactive" && (
          <div className="rounded-2xl p-5 mb-6"
            style={{ background: (STATUS_STYLE[sub.status] ?? STATUS_STYLE.inactive).bg, border: `1px solid ${(STATUS_STYLE[sub.status] ?? STATUS_STYLE.inactive).color}30` }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: (STATUS_STYLE[sub.status] ?? STATUS_STYLE.inactive).color }} />
                  <span className="font-semibold text-white">{(STATUS_STYLE[sub.status] ?? STATUS_STYLE.inactive).label}</span>
                </div>
                <p className="text-[13px]" style={{ color: "#888" }}>
                  {(STATUS_STYLE[sub.status] ?? STATUS_STYLE.inactive).desc}
                </p>
                {sub.current_period_end && isActive && (
                  <p className="text-[11px] mt-1" style={{ color: "#666" }}>
                    Renews {new Date(sub.current_period_end).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
                {isTrial && trialDaysLeft !== null && (
                  <p className="text-[12px] font-medium mt-1" style={{ color: "#a78bfa" }}>
                    {trialDaysLeft > 0
                      ? `${trialDaysLeft} days remaining in your free trial`
                      : "Trial expired — subscribe to keep access"}
                  </p>
                )}
                {isTrial && sub.is_founder && (
                  <p className="text-[11px] mt-0.5" style={{ color: "#666" }}>
                    You&apos;re one of the first 100 founding pilots 🎉
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px]" style={{ color: "#666" }}>
                    from ₱{BASE_PRICE}/month
                  </p>
                  <p className="text-[10px]" style={{ color: "#555" }}>
                  plan tier + selected mini-apps
                  </p>
              </div>
            </div>

            {/* Active add-ons */}
            {(sub.addons?.length ?? 0) > 0 && !editAddons && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#666" }}>Active add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {sub.addons.map(id => {
                    const a = ADDONS.find(x => x.id === id);
                    return a ? (
                      <span key={id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px]"
                        style={{ background: "rgba(139,92,246,0.15)", color: "#c4b5fd" }}>
                        {a.icon} {a.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Manage actions */}
            {(isActive || isPaused) && !editAddons && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => { setEditAddons(true); setSelected(sub.addons ?? []); }}
                  className="px-3 py-1.5 rounded-lg text-[11px] transition-colors hover:border-white/20"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#aaa" }}>
                  Edit add-ons
                </button>
                {isActive && (
                  <button onClick={() => doAction("pause")} disabled={acting === "pause"}
                    className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                    style={{ border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", background: "rgba(251,191,36,0.08)" }}>
                    {acting === "pause" ? "…" : "Pause subscription"}
                  </button>
                )}
                {isPaused && (
                  <button onClick={() => doAction("resume")} disabled={acting === "resume"}
                    className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                    style={{ border: "1px solid rgba(52,211,153,0.3)", color: "#34d399", background: "rgba(52,211,153,0.08)" }}>
                    {acting === "resume" ? "…" : "Resume subscription"}
                  </button>
                )}
                <button onClick={() => doAction("cancel")} disabled={acting === "cancel"}
                  className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                  style={{ border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", background: "rgba(239,68,68,0.06)" }}>
                  {acting === "cancel" ? "…" : "Cancel"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* New subscription or edit add-ons */}
        {(!hasSub || editAddons) && (
          <>
            {/* Plan tiers */}
            {!editAddons && (
              <div className="mb-5">
                <p className="text-[13px] font-semibold text-white mb-1">Choose a pilot plan</p>
                <p className="text-[12px] mb-4" style={{ color: "#666" }}>
                  Free accounts can preview the basics. Paid tiers unlock deeper CAAP review, smart checklists, and flight logbook tools.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PILOT_PLANS.map(plan => {
                    const on = selectedPlan === plan.id;
                    return (
                      <button key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                        className="text-left rounded-2xl p-4 transition-all"
                        style={{
                          background: on ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
                          border: on ? `1px solid ${V}55` : "1px solid rgba(255,255,255,0.08)",
                        }}>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: on ? V : "#666", fontFamily: "'IBM Plex Mono', monospace" }}>{plan.audience}</p>
                            <h2 className="text-[17px] font-bold text-white mt-1" style={{ fontFamily: "'League Spartan', sans-serif" }}>{plan.label}</h2>
                          </div>
                          <span className="w-4 h-4 rounded-full border flex items-center justify-center mt-0.5"
                            style={{ borderColor: on ? V : "rgba(255,255,255,0.18)", background: on ? V : "transparent" }}>
                            {on && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-[28px] font-bold" style={{ color: on ? V : "#fff", fontFamily: "'League Spartan', sans-serif" }}>₱{plan.price}</span>
                          <span className="text-[11px]" style={{ color: "#666" }}>/month</span>
                        </div>
                        <p className="text-[11px] leading-snug mb-3" style={{ color: "#777" }}>{plan.desc}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: on ? "#c4b5fd" : "#555", fontFamily: "'IBM Plex Mono', monospace" }}>{plan.badge}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add-ons */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    {editAddons ? "Edit your add-ons" : "Add-ons"}
                    <span className="ml-2 text-[11px] font-normal" style={{ color: "#666" }}>₱20/month each</span>
                  </p>
                  <p className="text-[12px] mt-0.5" style={{ color: "#666" }}>
                    Mini-apps for study, recurrent review, and safer flight routines. Add or remove anytime.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {ADDONS.map(a => {
                  const on = selected.includes(a.id);
                  return (
                    <button key={a.id} onClick={() => toggle(a.id)}
                      className="text-left p-3.5 rounded-xl transition-all"
                      style={{
                        background: on ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
                        border: on ? `1px solid ${V}50` : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[16px]">{a.icon}</span>
                          <span className="text-[12px] font-medium" style={{ color: on ? "#c4b5fd" : "#ccc" }}>{a.label}</span>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: on ? V : "#555" }}>+₱{a.price}</span>
                      </div>
                      <p className="text-[11px] leading-snug" style={{ color: "#666" }}>{a.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total + CTA */}
            <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] text-white/60">
                    {editAddons ? "New total" : "Total"}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-[32px] font-bold text-white"
                      style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    ₱{total}
                    </span>
                    <span className="text-[13px]" style={{ color: "#666" }}>/month</span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: "#666" }}>
                    {editAddons
                      ? `From ₱${BASE_PRICE} base plus selected mini-apps`
                      : `${activePlan.label} plan${selected.length > 0 ? ` + ₱${total - activePlan.price} in mini-apps` : ""}`}
                  </p>
                </div>
                {!stripeOk && !editAddons && (
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px]"
                      style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24" }}>
                      ⚡ Payment coming soon
                    </div>
                  </div>
                )}
              </div>

              {editAddons ? (
                <div className="flex gap-3">
                  <button onClick={() => doAction("update-addons")} disabled={acting === "update-addons"}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={{ background: acting === "update-addons" ? `${V}60` : V, color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
                    {acting === "update-addons" ? "Updating…" : "Save Changes"}
                  </button>
                  <button onClick={() => { setEditAddons(false); setSelected(sub?.addons ?? []); }}
                    className="px-5 py-3 rounded-xl transition-all hover:border-white/20"
                    style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={subscribe} disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all"
                  style={{ background: submitting ? `${V}60` : V, color: "#fff", fontFamily: "'League Spartan', sans-serif", cursor: submitting ? "not-allowed" : "pointer" }}>
                  {submitting
                    ? "Processing…"
                    : stripeOk
                    ? `Subscribe — ₱${total}/month`
                    : `Request Subscription — ₱${total}/month`}
                </button>
              )}

              {!stripeOk && !editAddons && (
                <p className="text-[11px] text-center mt-3" style={{ color: "#555" }}>
                  Payment gateway is being configured. Your request will be activated manually within 24 hours.
                </p>
              )}
            </div>
          </>
        )}

        {/* FAQ */}
        <div className="mt-10 space-y-4">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: "#555", fontFamily: "'IBM Plex Mono', monospace" }}>
            About subscriptions
          </p>
          {[
            { q: "Can I pause or cancel anytime?", a: "Yes. Pause when you do not need premium study or logbook tools. Cancel anytime. No lock-in, no penalties." },
            { q: "What happens to my add-ons if I cancel?", a: "Add-ons are tied to your subscription. If you cancel, add-ons deactivate at the end of the billing period." },
            { q: "Can free accounts still use WaevPilots?", a: "Yes. Free accounts can preview core study notes and basic checklist concepts. The subscription unlocks the deeper workflows." },
            { q: "What payment methods are accepted?", a: "Visa, Mastercard, GCash, GrabPay, Maya, and most major cards worldwide. Payment is processed securely via Stripe." },
          ].map(f => (
            <details key={f.q} className="group rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-[13px] text-white/70 hover:text-white list-none">
                {f.q}
                <span className="text-[16px] transition-transform group-open:rotate-45" style={{ color: "#555" }}>+</span>
              </summary>
              <p className="px-4 pb-4 text-[13px] leading-relaxed" style={{ color: "#777" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
