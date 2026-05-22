"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import DeployMap from "@/components/DeployMap";

const V = "#8b5cf6";

type Job = {
  id: string;
  client_name: string;
  location: string;
  province: string;
  service_type: string;
  budget: string | null;
  preferred_date: string | null;
  description: string;
  status: string;
  created_at: string;
};

export default function DeployDashboardPage() {
  const supabase = createSupabaseBrowser();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"pilot" | "client">("pilot");
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [matched, setMatched] = useState<any[]>([]);

  const [jobName, setJobName] = useState("");
  const [jobContact, setJobContact] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [jobProvince, setJobProvince] = useState("");
  const [jobService, setJobService] = useState("Real Estate");
  const [jobBudget, setJobBudget] = useState("");
  const [jobDate, setJobDate] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = "/deploy/auth";
        return;
      }
      setToken(session.access_token);

      const res = await fetch("/api/pilots/my-profile", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        window.location.href = "/deploy/onboarding";
        return;
      }
      const data = await res.json();
      setProfile(data);
      setView(data.operator ? "pilot" : "client");
      setJobName(data.client?.name || data.operator?.name || "");
      setJobContact(data.client?.contact || data.operator?.contact || session.user.email || "");
      setJobLocation(data.client?.location || data.operator?.location || "");
      setJobProvince(data.operator?.province || "");
      setLoading(false);
    });
  }, [supabase]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/deploy/jobs")
      .then((r) => r.json())
      .then((d) => setJobs(Array.isArray(d.jobs) ? d.jobs : []))
      .catch(() => setJobs([]));
  }, [token]);

  const mapSpec = useMemo(() => (view === "pilot" ? profile?.operator?.primary_specialization || "" : ""), [view, profile]);

  async function findMatches() {
    const q = new URLSearchParams();
    q.set("service_type", jobService);
    if (profile?.client?.country || profile?.operator?.country) q.set("country", profile?.client?.country || profile?.operator?.country);
    if (jobProvince.trim()) q.set("province", jobProvince.trim());
    const res = await fetch(`/api/pilots/match?${q.toString()}`);
    const data = await res.json().catch(() => ({ pilots: [] }));
    setMatched(Array.isArray(data?.pilots) ? data.pilots : []);
  }

  async function postJob() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/pilots/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_name: jobName.trim(),
        contact: jobContact.trim(),
        location: jobLocation.trim(),
        province: jobProvince.trim(),
        service_type: jobService,
        budget: jobBudget.trim() || null,
        preferred_date: jobDate || null,
        description: jobDescription.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not submit job");
      return;
    }
    setJobDescription("");
    const refresh = await fetch("/api/deploy/jobs");
    const updated = await refresh.json();
    setJobs(Array.isArray(updated.jobs) ? updated.jobs : []);
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
        <div className="flex items-center gap-2">
          <Link href="/deploy/onboarding" className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/65">
            Edit profile
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/deploy/auth";
            }}
            className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/65"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300/80">Platform dashboard</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: "'League Spartan', sans-serif" }}>
              {view === "pilot" ? "Pilot workspace" : "Client workspace"}
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-white/48">
              {view === "pilot"
                ? "Watch the job board and keep your profile visible on the map."
                : "Post work, filter pilots, and compare coverage without leaving the dashboard."}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-right">
            <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">Signed in as</p>
            <p className="text-[13px] text-white/70">{profile?.email || "-"}</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-300">{error}</div>}

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <DeployMap spec={mapSpec} />

            {view === "pilot" ? (
              <section className="rounded-3xl border border-white/[0.08] bg-[#141416] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">Open jobs</p>
                    <h2 className="text-[18px] font-semibold text-white">Latest client posts</h2>
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] text-white/45">
                    {jobs.length} open
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {jobs.slice(0, 6).map((job) => (
                    <article key={job.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-cyan-300/80">{job.service_type}</p>
                      <h3 className="mt-1 text-[14px] font-semibold text-white">{job.client_name}</h3>
                      <p className="mt-1 text-[12px] text-white/45">{job.location}, {job.province}</p>
                      <p className="mt-2 text-[12px] leading-relaxed text-white/60 line-clamp-3">{job.description}</p>
                      <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-white/38">
                        <span>{job.budget || "Budget not set"}</span>
                        <span>{job.preferred_date || "Flexible date"}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : (
              <section className="rounded-3xl border border-white/[0.08] bg-[#141416] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300/80">Match pilots</p>
                    <h2 className="text-[18px] font-semibold text-white">Find pilots for your job</h2>
                  </div>
                  <button onClick={findMatches} className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-[12px] text-white/70">
                    Match now
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Client name" value={jobName} onChange={setJobName} />
                  <Field label="Contact" value={jobContact} onChange={setJobContact} />
                  <Field label="Location" value={jobLocation} onChange={setJobLocation} />
                  <Field label="Province" value={jobProvince} onChange={setJobProvince} />
                  <Field label="Budget" value={jobBudget} onChange={setJobBudget} />
                  <Field label="Preferred date" value={jobDate} onChange={setJobDate} type="date" />
                  <SelectField label="Service type" value={jobService} onChange={setJobService} options={["Real Estate", "Construction", "Events", "Inspection", "Survey"]} />
                  <Field label="Description" value={jobDescription} onChange={setJobDescription} className="md:col-span-2" />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={postJob} disabled={saving} className="rounded-xl px-4 py-2 text-[12px] font-semibold text-white" style={{ background: V }}>
                    {saving ? "Posting..." : "Post job"}
                  </button>
                  <button onClick={findMatches} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[12px] text-white/70">
                    Refresh matches
                  </button>
                </div>
                {matched.length > 0 && (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {matched.slice(0, 6).map((pilot) => (
                      <article key={pilot.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-300/80">{pilot.primary_specialization || "Pilot"}</p>
                        <h3 className="mt-1 text-[14px] font-semibold text-white">{pilot.name}</h3>
                        <p className="mt-1 text-[12px] text-white/45">{pilot.location}</p>
                        <p className="mt-2 text-[12px] leading-relaxed text-white/60 line-clamp-2">{pilot.services}</p>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/[0.08] bg-[#141416] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">Profile</p>
              <div className="mt-3 space-y-2 text-[13px] text-white/64">
                {view === "pilot" ? (
                  <>
                    <Row label="Name" value={profile?.operator?.name || "—"} />
                    <Row label="License" value={profile?.operator?.caap_license || "—"} />
                    <Row label="Specialization" value={profile?.operator?.primary_specialization || "—"} />
                    <Row label="Coverage" value={`${profile?.operator?.location || ""}${profile?.operator?.province ? `, ${profile.operator.province}` : ""}`} />
                    <Row label="Subscription" value={profile?.operator?.subscription_status || "—"} />
                  </>
                ) : (
                  <>
                    <Row label="Name" value={profile?.client?.name || "—"} />
                    <Row label="Contact" value={profile?.client?.contact || "—"} />
                    <Row label="Location" value={`${profile?.client?.location || ""}${profile?.client?.country ? `, ${profile.client.country}` : ""}`} />
                    <Row label="Role" value="Client" />
                  </>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">Quick links</p>
              <div className="mt-3 grid gap-2">
                <Link href="/deploy/auth?role=pilot" className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/70">Pilot sign-in</Link>
                <Link href="/deploy/auth?role=client" className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/70">Client sign-up</Link>
                <Link href="/deploy/onboarding" className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[13px] text-white/70">Edit profile</Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2">
      <span className="text-[11px] uppercase tracking-[0.12em] text-white/30">{label}</span>
      <span className="text-right text-[12px] text-white/70">{value}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", className = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-white/35">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-3 text-[13px] text-white outline-none"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
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
