"use client";

import { useCallback, useEffect, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type AppStatus  = "pending" | "approved" | "rejected";
type SubStatus  = "unpaid" | "active" | "expired";
type JobStatus  = "open" | "matched" | "completed" | "cancelled";
type Tab        = "applications" | "jobs" | "referrals";

interface PilotApp {
  id: string; name: string; contact: string; email: string | null;
  location: string; province: string; caap_license: string;
  drone_models: string; services: string; experience_yrs: number;
  portfolio_url: string | null; about: string | null;
  status: AppStatus;
  subscription_status: SubStatus;
  subscription_paid_at: string | null;
  subscription_expires_at: string | null;
  created_at: string;
}

interface PilotJob {
  id: string; client_name: string; contact: string;
  location: string; province: string; service_type: string;
  budget: string | null; preferred_date: string | null;
  description: string; status: JobStatus; created_at: string;
}

const APP_STYLE: Record<AppStatus, { color: string; bg: string; label: string }> = {
  pending:  { color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  label: "Pending" },
  approved: { color: "#34d399", bg: "rgba(52,211,153,0.1)",  label: "Approved" },
  rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Rejected" },
};

const SUB_STYLE: Record<SubStatus, { color: string; bg: string; label: string }> = {
  unpaid:  { color: "#888",    bg: "rgba(255,255,255,0.05)", label: "Unpaid" },
  active:  { color: "#34d399", bg: "rgba(52,211,153,0.1)",  label: "Active" },
  expired: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Expired" },
};

const JOB_STYLE: Record<JobStatus, { color: string; bg: string; label: string }> = {
  open:      { color: "#06b6d4", bg: "rgba(6,182,212,0.1)",  label: "Open" },
  matched:   { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", label: "Matched" },
  completed: { color: "#34d399", bg: "rgba(52,211,153,0.1)", label: "Done" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  label: "Cancelled" },
};

interface ReferralPartner {
  code: string; name: string; rate_usd: number; active: boolean;
  signups: number; converted: number; owedTotal: number; owedUnpaid: number;
  referrals: Array<{ id: string; email: string | null; subscribed: boolean; subscribed_at: string | null; payout_sent: boolean; created_at: string }>;
}

function fmtTs(ts: string) {
  return new Date(ts).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function daysUntil(dateStr: string): number {
  const exp  = new Date(dateStr + "T00:00:00");
  const now  = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / 86_400_000);
}

function ExpiryBadge({ dateStr }: { dateStr: string }) {
  const days = daysUntil(dateStr);
  if (days < 0)  return <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>Expired {Math.abs(days)}d ago</span>;
  if (days <= 14) return <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>Expires in {days}d</span>;
  return <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(52,211,153,0.08)", color: "#34d399" }}>Until {fmtTs(dateStr)}</span>;
}

export default function PilotsOpsPage() {
  const { token }  = useOps();
  const [tab, setTab]           = useState<Tab>("applications");
  const [apps, setApps]         = useState<PilotApp[]>([]);
  const [jobs, setJobs]         = useState<PilotJob[]>([]);
  const [refs, setRefs]         = useState<ReferralPartner[]>([]);
  const [loading, setLoading]   = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [subFilter, setSubFilter] = useState<"all" | SubStatus>("all");

  const auth = { "x-ops-token": token };

  const loadApps = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pilots/applications", { headers: auth });
    if (res.ok) setApps(await res.json());
    setLoading(false);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJobs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pilots/jobs", { headers: auth });
    if (res.ok) setJobs(await res.json());
    setLoading(false);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRefs = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pilots/referrals", { headers: auth });
    if (res.ok) { const d = await res.json(); setRefs(d.partners ?? []); }
    setLoading(false);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === "applications") loadApps();
    else if (tab === "jobs") loadJobs();
    else loadRefs();
  }, [tab, loadApps, loadJobs, loadRefs]);

  async function markPayout(code: string) {
    setUpdating(code);
    await fetch("/api/pilots/referrals", {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ code, mark_all: true }),
    });
    await loadRefs();
    setUpdating(null);
  }

  async function patchApp(id: string, payload: Record<string, string>) {
    setUpdating(id);
    await fetch("/api/pilots/applications", {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    await loadApps();
    setUpdating(null);
  }

  // Stats
  const approved = apps.filter(a => a.status === "approved");
  const subCounts = approved.reduce((acc, a) => {
    const s = a.subscription_status ?? "unpaid";
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const expiringSoon = approved.filter(a =>
    a.subscription_status === "active" &&
    a.subscription_expires_at &&
    daysUntil(a.subscription_expires_at) <= 14
  );

  const mrr = (subCounts.active ?? 0) * 120;

  const appCounts = apps.reduce((a, b) => { a[b.status] = (a[b.status] ?? 0) + 1; return a; }, {} as Record<string, number>);
  const jobCounts = jobs.reduce((a, b) => { a[b.status] = (a[b.status] ?? 0) + 1; return a; }, {} as Record<string, number>);

  const filteredApps = subFilter === "all"
    ? apps
    : apps.filter(a => (a.subscription_status ?? "unpaid") === subFilter);

  const isUpd = (id: string) => updating === id;

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: SYSTEM_FONT }}>
      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[17px] font-semibold text-white">WaevPilots</h1>
            <p className="text-[12px] text-white/40 mt-0.5">Pilot applications &amp; client job postings</p>
          </div>
          <a href="/pilots" target="_blank" rel="noopener noreferrer"
            className="text-[11px] text-white/40 hover:text-white/70 border border-white/[0.08] rounded-lg px-3 py-1.5 transition-colors">
            View page ↗
          </a>
        </div>

        {/* Revenue snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="rounded-xl p-3 border" style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.25)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#8b5cf6" }}>Active Pilots</p>
            <p className="text-[22px] font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>{subCounts.active ?? 0}</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.2)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#34d399" }}>Est. MRR</p>
            <p className="text-[22px] font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>₱{mrr.toLocaleString()}</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.2)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#fbbf24" }}>Expiring Soon</p>
            <p className="text-[22px] font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>{expiringSoon.length}</p>
          </div>
          <div className="rounded-xl p-3 border" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#ef4444" }}>Unpaid</p>
            <p className="text-[22px] font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>{subCounts.unpaid ?? 0}</p>
          </div>
        </div>

        {/* Pricing reminder */}
        <div className="rounded-xl p-3 mb-5 flex items-center gap-6 flex-wrap"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#8b5cf6" }} />
            <span className="text-[12px] text-white/70">Intro (3 months)</span>
            <span className="text-[13px] font-semibold" style={{ color: "#8b5cf6" }}>₱199</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#34d399" }} />
            <span className="text-[12px] text-white/70">Monthly renewal</span>
            <span className="text-[13px] font-semibold" style={{ color: "#34d399" }}>₱120/mo</span>
          </div>
          <span className="text-[11px] text-white/30 ml-auto">Collect via GCash · update manually here</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-white/[0.03] rounded-lg p-0.5 mb-5 w-fit">
          {(["applications", "jobs", "referrals"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-[11px] transition-colors ${tab === t ? "bg-white/[0.09] text-white" : "text-white/40 hover:text-white/60"}`}>
              {t === "applications" ? `Pilots (${apps.length})` : t === "jobs" ? `Jobs (${jobs.length})` : `Referrals`}
            </button>
          ))}
        </div>

        {/* ── Applications ─────────────────────────────────────────────── */}
        {tab === "applications" && (
          <>
            {/* App status strip */}
            <div className="flex gap-3 mb-3 flex-wrap">
              {(["pending", "approved", "rejected"] as AppStatus[]).map(s => {
                const st = APP_STYLE[s];
                return (
                  <div key={s} className="rounded-lg px-3 py-1.5 border"
                    style={{ background: st.bg, borderColor: `${st.color}30` }}>
                    <span className="text-[11px] font-medium" style={{ color: st.color }}>
                      {st.label} {appCounts[s] ?? 0}
                    </span>
                  </div>
                );
              })}

              {/* Subscription filter (approved pilots only) */}
              <div className="ml-auto flex gap-1">
                {(["all", "unpaid", "active", "expired"] as const).map(f => (
                  <button key={f} onClick={() => setSubFilter(f)}
                    className={`px-2.5 py-1 rounded-md text-[10px] border transition-colors ${subFilter === f ? "bg-white/[0.09] text-white border-white/20" : "border-white/[0.06] text-white/30 hover:text-white/50"}`}>
                    {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
              </div>
            ) : filteredApps.length === 0 ? (
              <p className="text-center py-16 text-[13px] text-white/30">No pilot applications yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredApps.map(a => {
                  const ast = APP_STYLE[a.status];
                  const sub = a.subscription_status ?? "unpaid" as SubStatus;
                  const sst = SUB_STYLE[sub];
                  const isApproved = a.status === "approved";

                  return (
                    <div key={a.id} className="rounded-xl border p-4"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        borderColor: a.status === "pending" ? "rgba(251,191,36,0.2)"
                          : sub === "expired" ? "rgba(239,68,68,0.2)"
                          : "rgba(255,255,255,0.07)",
                      }}>
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          {/* Name + badges */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-[14px] font-semibold text-white">{a.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: ast.bg, color: ast.color }}>{ast.label}</span>
                            {isApproved && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: sst.bg, color: sst.color }}>
                                {sst.label}
                              </span>
                            )}
                            {isApproved && a.subscription_expires_at && sub === "active" && (
                              <ExpiryBadge dateStr={a.subscription_expires_at} />
                            )}
                          </div>

                          {/* Info row */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-[11px]">
                            <span style={{ color: "#06b6d4" }}>📍 {a.location}, {a.province}</span>
                            <span style={{ color: "#8b5cf6" }}>✈ CAAP: {a.caap_license}</span>
                            <span style={{ color: "#888" }}>🚁 {a.drone_models}</span>
                          </div>
                          <p className="text-[11px] mb-1" style={{ color: "#888" }}>Services: {a.services}</p>
                          <p className="text-[11px]" style={{ color: "#777" }}>
                            Contact: {a.contact}{a.email ? ` · ${a.email}` : ""}
                          </p>
                          {a.about && <p className="text-[11px] mt-1 leading-snug" style={{ color: "#666" }}>"{a.about}"</p>}
                          {a.portfolio_url && (
                            <a href={a.portfolio_url} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] hover:text-cyan-300 transition-colors" style={{ color: "#06b6d4" }}>
                              Portfolio ↗
                            </a>
                          )}

                          {/* Subscription dates */}
                          {isApproved && a.subscription_paid_at && (
                            <p className="text-[10px] mt-2" style={{ color: "#555" }}>
                              Paid {fmtTs(a.subscription_paid_at)}
                              {a.subscription_expires_at ? ` · expires ${fmtTs(a.subscription_expires_at)}` : ""}
                            </p>
                          )}
                          <p className="text-[10px] mt-1" style={{ color: "#333" }}>
                            Applied {fmtTs(a.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {/* Approval */}
                          {a.status === "pending" && (
                            <>
                              <button onClick={() => patchApp(a.id, { status: "approved" })} disabled={isUpd(a.id)}
                                className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                                style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                                {isUpd(a.id) ? "…" : "Approve"}
                              </button>
                              <button onClick={() => patchApp(a.id, { status: "rejected" })} disabled={isUpd(a.id)}
                                className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                                style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>
                                Reject
                              </button>
                            </>
                          )}

                          {/* Subscription actions (approved pilots only) */}
                          {isApproved && (
                            <>
                              {(sub === "unpaid" || sub === "expired") && (
                                <button onClick={() => patchApp(a.id, { action: "pay-intro" })} disabled={isUpd(a.id)}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                                  style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.3)" }}>
                                  {isUpd(a.id) ? "…" : "₱199 Paid (3 mo)"}
                                </button>
                              )}
                              {sub === "active" && (
                                <button onClick={() => patchApp(a.id, { action: "pay-renewal" })} disabled={isUpd(a.id)}
                                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                                  style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                                  {isUpd(a.id) ? "…" : "₱120 Renewed"}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Jobs ─────────────────────────────────────────────────────── */}
        {tab === "jobs" && (
          <>
            <div className="flex gap-3 mb-5 flex-wrap">
              {(["open", "matched", "completed", "cancelled"] as JobStatus[]).map(s => {
                const st = JOB_STYLE[s];
                return (
                  <div key={s} className="rounded-lg px-3 py-1.5 border"
                    style={{ background: st.bg, borderColor: `${st.color}30` }}>
                    <span className="text-[11px] font-medium" style={{ color: st.color }}>
                      {st.label} {jobCounts[s] ?? 0}
                    </span>
                  </div>
                );
              })}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            ) : jobs.length === 0 ? (
              <p className="text-center py-16 text-[13px] text-white/30">No job postings yet.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map(j => {
                  const st = JOB_STYLE[j.status];
                  return (
                    <div key={j.id} className="rounded-xl border p-4"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                            <span className="text-[14px] font-semibold text-white">{j.client_name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                            <span className="text-[11px]" style={{ color: "#06b6d4" }}>{j.service_type}</span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2 text-[11px]">
                            <span style={{ color: "#888" }}>📍 {j.location}, {j.province}</span>
                            {j.preferred_date && <span style={{ color: "#888" }}>📅 {j.preferred_date}</span>}
                            {j.budget && <span style={{ color: "#34d399" }}>💰 {j.budget}</span>}
                          </div>
                          <p className="text-[11px] leading-snug mb-1" style={{ color: "#777" }}>{j.description}</p>
                          <p className="text-[11px]" style={{ color: "#666" }}>Contact: {j.contact}</p>
                          <p className="text-[10px] mt-2" style={{ color: "#333" }}>Posted {fmtTs(j.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Referrals ─────────────────────────────────────────────────── */}
        {tab === "referrals" && (
          <>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            ) : refs.length === 0 ? (
              <p className="text-center py-16 text-[13px] text-white/30">No referral partners yet.</p>
            ) : (
              <div className="space-y-6">
                {refs.map(p => (
                  <div key={p.code} className="rounded-2xl border overflow-hidden"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    {/* Partner header */}
                    <div className="flex items-center justify-between px-5 py-4"
                      style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div>
                        <p className="text-[15px] font-semibold text-white">{p.name}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#666" }}>
                          Link: waevpoint.quest/pilots?ref={p.code}
                          {" · "}Rate: ${p.rate_usd}/conversion
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {p.owedUnpaid > 0 && (
                          <div className="text-right">
                            <p className="text-[13px] font-semibold" style={{ color: "#fbbf24" }}>${p.owedUnpaid.toFixed(2)} owed</p>
                            <p className="text-[10px]" style={{ color: "#666" }}>unpaid conversions</p>
                          </div>
                        )}
                        {p.owedUnpaid > 0 && (
                          <button onClick={() => markPayout(p.code)} disabled={updating === p.code}
                            className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                            {updating === p.code ? "…" : "Mark all paid"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 divide-x" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.06)" }}>
                      {[
                        { label: "Signups",    val: p.signups },
                        { label: "Converted",  val: p.converted },
                        { label: "Total owed", val: `$${p.owedTotal.toFixed(2)}` },
                        { label: "Unpaid",     val: `$${p.owedUnpaid.toFixed(2)}` },
                      ].map(s => (
                        <div key={s.label} className="px-4 py-3 text-center">
                          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#555" }}>{s.label}</p>
                          <p className="text-[18px] font-bold text-white"
                            style={{ fontFamily: "'League Spartan', sans-serif" }}>{s.val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Referral list */}
                    {p.referrals.length > 0 && (
                      <div className="px-5 py-3 space-y-1.5">
                        {p.referrals.map(r => (
                          <div key={r.id} className="flex items-center gap-3 text-[11px]"
                            style={{ color: "#777" }}>
                            <span className="w-2 h-2 rounded-full shrink-0"
                              style={{ background: r.subscribed ? "#34d399" : "#555" }} />
                            <span className="flex-1">{r.email ?? "anonymous"}</span>
                            <span style={{ color: r.subscribed ? "#34d399" : "#555" }}>
                              {r.subscribed ? "Subscribed" : "Signed up"}
                            </span>
                            {r.subscribed && (
                              <span style={{ color: r.payout_sent ? "#555" : "#fbbf24" }}>
                                {r.payout_sent ? "Paid ✓" : `$${p.rate_usd} owed`}
                              </span>
                            )}
                            <span style={{ color: "#444" }}>{fmtTs(r.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
