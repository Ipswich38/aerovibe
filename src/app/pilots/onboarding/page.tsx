"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const V = "#8b5cf6";

const COUNTRIES = [
  "Philippines", "United States", "United Kingdom", "Australia", "Canada",
  "United Arab Emirates", "Singapore", "Malaysia", "Indonesia", "India",
  "Japan", "South Korea", "Hong Kong", "New Zealand", "South Africa", "Other",
];

const SPECIALIZATIONS = [
  "Events & Weddings", "Real Estate", "Construction & Infrastructure",
  "Aerial Survey & Mapping", "Film & Cinematic", "Social Media Content",
  "Industrial Inspection", "Agriculture & Farming", "Tourism & Travel",
  "FPV & Racing", "News & Journalism", "Search & Rescue",
];

const OFFERED_SERVICES = [
  { key: "below-7kg",    label: "Below 7kg review" },
  { key: "large-rpa",    label: "7kg+ notes" },
  { key: "exam-prep",    label: "Exam prep" },
  { key: "practical",    label: "Practical skill prep" },
  { key: "checklists",   label: "Flight checklists" },
  { key: "logbook",      label: "Smart logbook" },
  { key: "policy",       label: "Policy refresher" },
  { key: "equipment",    label: "Equipment tracking" },
];

const ROLES = [
  {
    key: "operator",
    icon: "RP",
    title: "I am preparing or flying",
    desc: "Create a study profile for CAAP RPAS review, checklists, and smart logbook workflows.",
  },
  {
    key: "enthusiast",
    icon: "7K",
    title: "I want to compare weight classes",
    desc: "Start with below-7kg content and keep 7kg-and-above material clearly marked as a separate path.",
  },
];

type Step = "roles" | "operator-profile" | "client-profile" | "done";

const INPUT = "w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 transition-colors focus:border-violet-400/40";
const INPUT_S = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" };

export default function OnboardingPage() {
  const supabase       = createSupabaseBrowser();
  const [token,        setToken]        = useState("");
  const [loading,      setLoading]      = useState(true);
  const [step,         setStep]         = useState<Step>("roles");
  const [selectedRoles,setSelectedRoles]= useState<string[]>([]);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState("");

  // Operator form
  const [opName,   setOpName]   = useState("");
  const [opContact,setOpContact]= useState("");
  const [opCity,   setOpCity]   = useState("");
  const [opRegion, setOpRegion] = useState("");
  const [opCountry,setOpCountry]= useState("");
  const [opDrones, setOpDrones] = useState("");
  const [opSpec,   setOpSpec]   = useState("");
  const [opSkill,  setOpSkill]  = useState("intermediate");
  const [opServices,setOpServices]=useState<string[]>([]);
  const [opLicense,setOpLicense]= useState("");
  const [opAbout,  setOpAbout]  = useState("");

  // Client form
  const [clName,   setClName]   = useState("");
  const [clContact,setClContact]= useState("");
  const [clCity,   setClCity]   = useState("");
  const [clCountry,setClCountry]= useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.href = "/pilots/auth"; return; }
      setToken(session.access_token);
      if (session.user.email) setOpContact(session.user.email);
      // Save referral to auth metadata if present
      try {
        const stored = localStorage.getItem("wavepilots_ref");
        if (stored) {
          const { code, ts } = JSON.parse(stored) as { code: string; ts: number };
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          if (Date.now() - ts < thirtyDays) {
            await fetch("/api/pilots/referrals/track", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
              body: JSON.stringify({ code, email: session.user.email }),
            });
          } else {
            localStorage.removeItem("wavepilots_ref");
          }
        }
      } catch { /* silent */ }
      // If already onboarded, go to dashboard
      const res = await fetch("/api/pilots/my-profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.onboarded) { window.location.href = "/pilots/dashboard"; return; }
      }
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleRole(key: string) {
    setSelectedRoles(prev =>
      prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]
    );
  }

  function toggleService(key: string) {
    setOpServices(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  }

  function proceedFromRoles() {
    if (!selectedRoles.length) return;
    if (selectedRoles.includes("operator")) { setStep("operator-profile"); return; }
    handleSubmit(); // enthusiast only — no profile needed
  }

  async function handleSubmit(skipOperator = false) {
    setSubmitting(true); setError("");

    const payload: Record<string, unknown> = { roles: selectedRoles };

    if (!skipOperator && selectedRoles.includes("operator")) {
      if (!opName.trim() || !opDrones.trim() || !opCity.trim()) {
        setError("Please fill in your name, drone model, and city."); setSubmitting(false); return;
      }
      payload.operator = {
        name: opName, contact: opContact, location: opCity, region: opRegion,
        country: opCountry, drones: opDrones, specialization: opSpec,
        skill_level: opSkill, services: opServices.join(", "),
        offered_services: opServices.join(", "), license: opLicense, about: opAbout,
      };
    }

    if (selectedRoles.includes("client") && step === "client-profile") {
      if (!clName.trim()) { setError("Please enter your name."); setSubmitting(false); return; }
      payload.client = { name: clName, contact: clContact, location: clCity, country: clCountry };
    }

    const res = await fetch("/api/pilots/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    setSubmitting(false);
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
    setStep("done");
  }

  // After profile form, save the learner/pilot record.
  function afterOperator() {
    handleSubmit();
  }

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
          <span style={{ color: "rgba(255,255,255,0.2)" }}>×</span>
          <span className="font-bold text-[15px]" style={{ color: V, fontFamily: "'League Spartan', sans-serif" }}>WaevPilots</span>
        </div>
        <span className="text-[11px]" style={{ color: "#444" }}>Setting up your profile</span>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* ── Role selection ── */}
        {step === "roles" && (
          <>
            <div className="text-center mb-10">
              <div className="text-4xl mb-4">RP</div>
              <h1 className="text-3xl font-bold text-white mb-2"
                style={{ fontFamily: "'League Spartan', sans-serif" }}>
                Welcome to WaevPilots!
              </h1>
              <p className="text-[14px]" style={{ color: "#777" }}>
                Choose how you want WaevPilots to frame your study and flight-review tools.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {ROLES.map(role => {
                const active = selectedRoles.includes(role.key);
                return (
                  <button key={role.key} onClick={() => toggleRole(role.key)}
                    className="w-full text-left p-5 rounded-2xl transition-all flex items-start gap-4"
                    style={{
                      background: active ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.03)",
                      border: active ? `1px solid ${V}50` : "1px solid rgba(255,255,255,0.08)",
                    }}>
                    <div className="text-3xl shrink-0">{role.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1"
                        style={{ fontFamily: "'League Spartan', sans-serif" }}>
                        {role.title}
                      </p>
                      <p className="text-[13px] leading-snug" style={{ color: "#888" }}>{role.desc}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 shrink-0 mt-1 flex items-center justify-center"
                      style={{
                        borderColor: active ? V : "rgba(255,255,255,0.2)",
                        background: active ? V : "transparent",
                      }}>
                      {active && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button onClick={proceedFromRoles} disabled={!selectedRoles.length}
              className="w-full py-4 rounded-xl font-semibold text-[15px] transition-all"
              style={{
                background: selectedRoles.length ? V : "rgba(255,255,255,0.06)",
                color: selectedRoles.length ? "#fff" : "rgba(255,255,255,0.3)",
                cursor: selectedRoles.length ? "pointer" : "not-allowed",
                fontFamily: "'League Spartan', sans-serif",
              }}>
              Continue →
            </button>
          </>
        )}

        {/* ── Operator profile ── */}
        {step === "operator-profile" && (
          <>
            <div className="mb-8">
              <button onClick={() => setStep("roles")}
                className="text-[12px] mb-4 hover:text-white transition-colors flex items-center gap-1"
                style={{ color: "#555" }}>
                ← Back
              </button>
              <div className="text-2xl mb-2">RP</div>
              <h2 className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'League Spartan', sans-serif" }}>
                Set up your pilot study profile
              </h2>
              <p className="text-[13px]" style={{ color: "#777" }}>
                This helps the app frame checklists, review notes, and logbook context around your drone and skill level.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Your name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className={INPUT} style={INPUT_S} placeholder="Juan dela Cruz"
                    value={opName} onChange={e => setOpName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Contact / Messenger</label>
                  <input className={INPUT} style={INPUT_S} placeholder="fb.com/yourname or 09xx"
                    value={opContact} onChange={e => setOpContact(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#888" }}>City <span style={{ color: "#ef4444" }}>*</span></label>
                  <input className={INPUT} style={INPUT_S} placeholder="Your city"
                    value={opCity} onChange={e => setOpCity(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Country</label>
                  <select className={INPUT} style={INPUT_S} value={opCountry} onChange={e => setOpCountry(e.target.value)}>
                    <option value="">Select your country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Drone model(s) <span style={{ color: "#ef4444" }}>*</span></label>
                <input className={INPUT} style={INPUT_S} placeholder="e.g. DJI Mini 5 Pro, DJI Mavic 3"
                  value={opDrones} onChange={e => setOpDrones(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: "#888" }}>What are you using WaevPilots for?</label>
                <div className="grid grid-cols-2 gap-2">
                  {OFFERED_SERVICES.map(s => (
                    <button key={s.key} type="button" onClick={() => toggleService(s.key)}
                      className="px-3 py-2.5 rounded-xl text-[12px] text-left transition-all"
                      style={{
                        background: opServices.includes(s.key) ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)",
                        border: opServices.includes(s.key) ? `1px solid ${V}50` : "1px solid rgba(255,255,255,0.08)",
                        color: opServices.includes(s.key) ? "#c4b5fd" : "#999",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Main flying context</label>
                <select className={INPUT} style={INPUT_S} value={opSpec} onChange={e => setOpSpec(e.target.value)}>
                  <option value="">Select the closest context</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-2" style={{ color: "#888" }}>Skill level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: "beginner",     l: "Beginner",     s: "< 1 year" },
                    { v: "intermediate", l: "Intermediate", s: "1–3 years" },
                    { v: "expert",       l: "Expert",       s: "3+ years" },
                  ].map(sl => (
                    <button key={sl.v} type="button" onClick={() => setOpSkill(sl.v)}
                      className="py-2.5 px-3 rounded-xl text-left transition-all"
                      style={{
                        background: opSkill === sl.v ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.04)",
                        border: opSkill === sl.v ? `1px solid ${V}50` : "1px solid rgba(255,255,255,0.08)",
                      }}>
                      <p className="text-[12px] font-medium" style={{ color: opSkill === sl.v ? "#c4b5fd" : "#ccc" }}>{sl.l}</p>
                      <p className="text-[10px]" style={{ color: "#666" }}>{sl.s}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#888" }}>License / Certificate (optional)</label>
                <input className={INPUT} style={INPUT_S} placeholder="CAAP, FAA, CAA — or leave blank"
                  value={opLicense} onChange={e => setOpLicense(e.target.value)} />
              </div>

              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#888" }}>About you</label>
                <textarea rows={3} className={INPUT} style={INPUT_S}
                  placeholder="Add notes about your training status, drone class, weak topics, or flight-review goals..."
                  value={opAbout} onChange={e => setOpAbout(e.target.value)} />
              </div>

              {error && (
                <p className="text-[13px] px-3 py-2 rounded-lg"
                  style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </p>
              )}

              <button onClick={afterOperator} disabled={submitting}
                className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all"
                style={{ background: submitting ? `${V}60` : V, color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
                {submitting ? "Setting up…" : "Create My Pilot Profile →"}
              </button>
            </div>
          </>
        )}

        {/* ── Client profile ── */}
        {step === "client-profile" && (
          <>
            <div className="mb-8">
              <button onClick={() => setStep(selectedRoles.includes("operator") ? "operator-profile" : "roles")}
                className="text-[12px] mb-4 hover:text-white transition-colors" style={{ color: "#555" }}>
                ← Back
              </button>
              <div className="text-2xl mb-2">🎬</div>
              <h2 className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'League Spartan', sans-serif" }}>
                Additional profile details
              </h2>
              <p className="text-[13px]" style={{ color: "#777" }}>
                This legacy step is not part of the current pilot study flow.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Your name <span style={{ color: "#ef4444" }}>*</span></label>
                <input className={INPUT} style={INPUT_S} placeholder="Maria Santos"
                  value={clName} onChange={e => setClName(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Contact / Messenger</label>
                <input className={INPUT} style={INPUT_S} placeholder="fb.com/yourname or 09xx"
                  value={clContact} onChange={e => setClContact(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#888" }}>City</label>
                  <input className={INPUT} style={INPUT_S} placeholder="Manila, Dubai, Sydney..."
                    value={clCity} onChange={e => setClCity(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "#888" }}>Country</label>
                  <select className={INPUT} style={INPUT_S} value={clCountry} onChange={e => setClCountry(e.target.value)}>
                    <option value="">Select your country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-[13px] px-3 py-2 rounded-lg"
                  style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </p>
              )}

              <button onClick={() => handleSubmit()} disabled={submitting}
                className="w-full py-3.5 rounded-xl font-semibold text-[15px] transition-all"
                style={{ background: submitting ? "rgba(6,182,212,0.4)" : "#06b6d4", color: "#000", fontFamily: "'League Spartan', sans-serif" }}>
                {submitting ? "Setting up…" : "Done — Go to My Dashboard →"}
              </button>
            </div>
          </>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-white mb-3"
              style={{ fontFamily: "'League Spartan', sans-serif" }}>
              You&apos;re in!
            </h2>
            <p className="text-[14px] mb-2" style={{ color: "#888" }}>
              Welcome to the WaevPilots community.
            </p>
            <p className="text-[13px] mb-10" style={{ color: "#666" }}>
              {selectedRoles.includes("operator") && "Your study profile is ready. Use the dashboard for review, checklist, and logbook workflows. "}
              {selectedRoles.includes("enthusiast") && "Start with below-7kg review and keep 7kg+ topics marked separately."}
            </p>
            <a href="/pilots/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-[15px] transition-all hover:opacity-90"
              style={{ background: V, color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
              Go to My Dashboard →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
