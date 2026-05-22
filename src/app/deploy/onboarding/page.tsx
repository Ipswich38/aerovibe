"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

export default function DeployOnboardingPage() {
  const supabase = createSupabaseBrowser();
  const [role, setRole] = useState<"pilot" | "client">("pilot");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [pilotName, setPilotName] = useState("");
  const [pilotContact, setPilotContact] = useState("");
  const [pilotCity, setPilotCity] = useState("");
  const [pilotProvince, setPilotProvince] = useState("");
  const [pilotCountry, setPilotCountry] = useState("Philippines");
  const [pilotDrones, setPilotDrones] = useState("DJI Mini 5 Pro");
  const [pilotSpecialization, setPilotSpecialization] = useState("Real Estate");
  const [pilotSkill, setPilotSkill] = useState("intermediate");
  const [pilotServices, setPilotServices] = useState("pilot matching, map listing, flight jobs");
  const [pilotLicense, setPilotLicense] = useState("");
  const [pilotAbout, setPilotAbout] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientCountry, setClientCountry] = useState("Philippines");

  const pilotLabel = useMemo(() => role === "pilot" ? "Pilot profile" : "Client profile", [role]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRole(params.get("role") === "client" ? "client" : "pilot");

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = "/deploy/auth";
        return;
      }
      setToken(session.access_token);
      if (session.user.email) {
        setPilotContact(session.user.email);
        setClientContact(session.user.email);
      }
      const res = await fetch("/api/pilots/my-profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.onboarded) {
          window.location.href = "/deploy/dashboard";
          return;
        }
      }
      setLoading(false);
    });
  }, [supabase]);

  async function submit() {
    setSubmitting(true);
    setError("");

    const payload: Record<string, unknown> = { roles: [role === "pilot" ? "operator" : "client"] };

    if (role === "pilot") {
      if (!pilotName.trim() || !pilotCity.trim() || !pilotDrones.trim()) {
        setError("Pilot profile needs name, city, and drone model.");
        setSubmitting(false);
        return;
      }
      payload.operator = {
        name: pilotName.trim(),
        contact: pilotContact.trim(),
        location: pilotCity.trim(),
        region: pilotProvince.trim(),
        country: pilotCountry.trim(),
        drones: pilotDrones.trim(),
        specialization: pilotSpecialization,
        skill_level: pilotSkill,
        services: pilotServices,
        offered_services: pilotServices,
        license: pilotLicense.trim(),
        about: pilotAbout.trim(),
      };
    } else {
      if (!clientName.trim() || !clientCity.trim()) {
        setError("Client profile needs a name and city.");
        setSubmitting(false);
        return;
      }
      payload.client = {
        name: clientName.trim(),
        contact: clientContact.trim(),
        location: clientCity.trim(),
        country: clientCountry.trim(),
      };
    }

    const res = await fetch("/api/pilots/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Failed to save profile.");
      return;
    }
    window.location.href = "/deploy/dashboard";
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <Link href="/deploy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.65 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.22)" }}>×</span>
          <span className="text-[15px] font-bold" style={{ fontFamily: "'League Spartan', sans-serif", color: V }}>Deploy</span>
        </div>
        <Link href="/deploy/dashboard" className="text-[11px] text-white/45 hover:text-white/70">Dashboard</Link>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <button onClick={() => setRole("pilot")} className="rounded-full border px-4 py-2 text-[12px]" style={{ background: role === "pilot" ? "rgba(168,139,250,0.16)" : "rgba(255,255,255,0.04)", borderColor: role === "pilot" ? "rgba(168,139,250,0.35)" : "rgba(255,255,255,0.08)" }}>
            Pilot profile
          </button>
          <button onClick={() => setRole("client")} className="rounded-full border px-4 py-2 text-[12px]" style={{ background: role === "client" ? "rgba(6,182,212,0.16)" : "rgba(255,255,255,0.04)", borderColor: role === "client" ? "rgba(6,182,212,0.35)" : "rgba(255,255,255,0.08)" }}>
            Client profile
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-3xl border border-white/[0.08] bg-[#141416] p-5 md:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">Onboarding</p>
            <h1 className="mt-3 text-3xl font-bold" style={{ fontFamily: "'League Spartan', sans-serif" }}>{pilotLabel}</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-white/55">
              Create the profile that will show up on the map and drive your matching results.
            </p>

            {error && <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</div>}

            {role === "pilot" ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Field label="Name" value={pilotName} onChange={setPilotName} />
                <Field label="Contact" value={pilotContact} onChange={setPilotContact} />
                <Field label="City" value={pilotCity} onChange={setPilotCity} />
                <Field label="Province" value={pilotProvince} onChange={setPilotProvince} />
                <SelectField label="Country" value={pilotCountry} onChange={setPilotCountry} options={COUNTRIES} />
                <Field label="Drone models" value={pilotDrones} onChange={setPilotDrones} />
                <SelectField label="Specialization" value={pilotSpecialization} onChange={setPilotSpecialization} options={SPECIALIZATIONS} />
                <SelectField label="Skill level" value={pilotSkill} onChange={setPilotSkill} options={["beginner", "intermediate", "expert"]} />
                <Field label="Services" value={pilotServices} onChange={setPilotServices} className="md:col-span-2" />
                <Field label="CAAP license" value={pilotLicense} onChange={setPilotLicense} />
                <Field label="About" value={pilotAbout} onChange={setPilotAbout} className="md:col-span-2" />
              </div>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <Field label="Name" value={clientName} onChange={setClientName} />
                <Field label="Contact" value={clientContact} onChange={setClientContact} />
                <Field label="City" value={clientCity} onChange={setClientCity} />
                <SelectField label="Country" value={clientCountry} onChange={setClientCountry} options={COUNTRIES} />
              </div>
            )}

            <button
              onClick={submit}
              disabled={submitting}
              className="mt-5 rounded-xl px-5 py-3 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ background: V, fontFamily: "'League Spartan', sans-serif" }}
            >
              {submitting ? "Saving..." : "Continue to dashboard"}
            </button>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">What this unlocks</p>
              <div className="mt-4 space-y-2">
                {role === "pilot" ? [
                  "Appear on the live map.",
                  "Show your service coverage and drone inventory.",
                  "See open jobs and client demand.",
                  "Match faster with a profile that clients can scan.",
                ] : [
                  "Post jobs from the same platform.",
                  "Search pilots on the map by location and service.",
                  "Keep inquiries and matches in one place.",
                  "Move from search to shortlist without leaving the site.",
                ].map((item) => (
                  <div key={item} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] text-white/65">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-white/35">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-[13px] text-white outline-none"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-white/35">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-[13px] text-white outline-none"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {options.map((option) => (
          <option key={option} value={option} style={{ background: "#111112" }}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
