"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface PilotProfile {
  id: string;
  name: string;
  location: string;
  country: string;
  primary_specialization: string | null;
  skill_level: string | null;
  subscription_status: string;
  subscription_expires_at: string | null;
}

const V = "#8b5cf6";
const Vd = "rgba(139,92,246,0.15)";

const QUICK_TOOLS = [
  {
    title: "Below 7kg review",
    desc: "Use this as the default CAAP RPAS study path for Small RPA.",
    href: "/pilots/guide#weight-class",
    color: V,
  },
  {
    title: "Checklist discipline",
    desc: "Pre-flight, post-flight, safety, and equipment checks before each flight.",
    href: "/pilots/guide#checks",
    color: "#06b6d4",
  },
  {
    title: "Smart logbook",
    desc: "Record location, date, time, aircraft class, checklist result, and remarks.",
    href: "/pilots/guide#logbook",
    color: "#34d399",
  },
  {
    title: "7kg+ notes",
    desc: "Large RPA material is separated so it does not mix into below-7kg prep.",
    href: "/pilots/guide#weight-class",
    color: "#fbbf24",
  },
];

export default function PilotDashboard() {
  const supabase = createSupabaseBrowser();
  const [user, setUser] = useState<User | null>(null);
  const [pilot, setPilot] = useState<PilotProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkContact, setLinkContact] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkErr, setLinkErr] = useState("");

  async function loadProfile(token: string) {
    const res = await fetch("/api/pilots/my-profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.onboarded) {
      window.location.href = "/pilots/onboarding";
      return;
    }
    setPilot(data.operator ?? null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = "/pilots/auth";
        return;
      }
      setUser(session.user);
      await loadProfile(session.access_token);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") window.location.href = "/pilots/auth";
      if (session) {
        setUser(session.user);
        await loadProfile(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/pilots/auth";
  }

  async function linkExistingApplication() {
    if (!linkContact.trim()) return;
    setLinking(true);
    setLinkErr("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/pilots/my-profile", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ contact: linkContact }),
    });
    const data = await res.json();
    setLinking(false);
    if (!res.ok) {
      setLinkErr(data.error ?? "Profile not found");
      return;
    }
    await loadProfile(session.access_token);
  }

  const isActive = pilot?.subscription_status === "active" || pilot?.subscription_status === "trial";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0a" }}>
        <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/pilots">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>x</span>
          <span className="font-bold text-[15px]" style={{ color: V, fontFamily: "'League Spartan', sans-serif" }}>
            WaevPilots
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px]" style={{ color: "#555" }}>{user?.email}</span>
          <button onClick={signOut}
            className="text-[11px] hover:text-white transition-colors px-3 py-1.5 rounded-lg"
            style={{ color: "#666", border: "1px solid rgba(255,255,255,0.08)" }}>
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {!pilot && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: Vd, border: `1px solid ${V}40` }}>
              <span className="text-2xl">RP</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "'League Spartan', sans-serif" }}>
              Connect your pilot profile
            </h1>
            <p className="text-sm mb-8 max-w-lg mx-auto" style={{ color: "#666" }}>
              Already created a profile? Enter the contact you used to link it to this account.
              Otherwise, return to onboarding and create your study profile.
            </p>
            <div className="max-w-sm mx-auto space-y-3">
              <input
                type="text"
                placeholder="Your registered contact"
                value={linkContact}
                onChange={event => setLinkContact(event.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
              {linkErr && <p className="text-[12px]" style={{ color: "#ef4444" }}>{linkErr}</p>}
              <button onClick={linkExistingApplication} disabled={linking || !linkContact.trim()}
                className="w-full py-3 rounded-xl font-semibold transition-all"
                style={{ background: linking ? `${V}60` : V, color: "#fff", cursor: linking ? "not-allowed" : "pointer", fontFamily: "'League Spartan', sans-serif" }}>
                {linking ? "Linking..." : "Link My Profile"}
              </button>
            </div>
          </div>
        )}

        {pilot && (
          <>
            <section className="rounded-2xl p-6 mb-6 flex items-start justify-between gap-4 flex-wrap"
              style={{ background: Vd, border: `1px solid ${V}30` }}>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] mb-1"
                  style={{ color: V, fontFamily: "'IBM Plex Mono', monospace" }}>
                  Pilot Dashboard
                </p>
                <h1 className="text-2xl font-bold text-white mb-1"
                  style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  {pilot.name}
                </h1>
                <p className="text-sm" style={{ color: "#888" }}>
                  {pilot.location}, {pilot.country}
                  {pilot.primary_specialization ? ` · ${pilot.primary_specialization}` : ""}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                  style={{
                    background: isActive ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.1)",
                    border: `1px solid ${isActive ? "rgba(52,211,153,0.3)" : "rgba(139,92,246,0.25)"}`,
                    color: isActive ? "#34d399" : "#c4b5fd",
                  }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: isActive ? "#34d399" : V }} />
                  {isActive ? "Premium active" : "Free plan"}
                </div>
                {pilot.subscription_expires_at && isActive && (
                  <p className="text-[10px] mt-1" style={{ color: "#555" }}>
                    Until {new Date(pilot.subscription_expires_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl p-4 mb-6 flex items-center justify-between gap-4 flex-wrap"
              style={{
                background: isActive ? "rgba(52,211,153,0.05)" : "rgba(139,92,246,0.07)",
                border: `1px solid ${isActive ? "rgba(52,211,153,0.2)" : "rgba(139,92,246,0.25)"}`,
              }}>
              <div>
                <p className="text-[12px] font-semibold" style={{ color: isActive ? "#34d399" : "#c4b5fd" }}>
                  {isActive ? "Study and logbook tools unlocked" : "Upgrade for structured review"}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "#777" }}>
                  Below-7kg CAAP review, checklist routines, smart logbook, and Large RPA labels.
                </p>
              </div>
              <Link href="/pilots/subscribe"
                className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all hover:opacity-90 shrink-0"
                style={{ background: isActive ? "rgba(52,211,153,0.15)" : V, color: isActive ? "#34d399" : "#fff" }}>
                {isActive ? "Manage plan" : "View plans"}
              </Link>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {QUICK_TOOLS.map(tool => (
                <Link key={tool.title} href={tool.href}
                  className="rounded-2xl p-5 transition-all hover:border-white/20"
                  style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-[10px] uppercase tracking-[0.16em] mb-2"
                    style={{ color: tool.color, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Review
                  </p>
                  <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    {tool.title}
                  </h2>
                  <p className="text-[12px] leading-relaxed" style={{ color: "#888" }}>{tool.desc}</p>
                </Link>
              ))}
            </section>

            <section className="text-center py-8 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[14px] text-white/50 mb-2">Smart logbook integration is next</p>
              <p className="text-[12px] max-w-lg mx-auto" style={{ color: "#555" }}>
                This dashboard is focused on study, checklist review, and flight records for this phase.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
