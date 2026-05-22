"use client";

import { useCallback, useEffect, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

type Status = "pending" | "confirmed" | "completed" | "cancelled";
type Filter = "all" | Status;

interface Booking {
  id: string;
  name: string;
  contact: string;
  package: string;
  date: string;
  area: string;
  notes: string | null;
  status: Status;
  source: string;
  created_at: string;
}

const PKG_LABELS: Record<string, string> = {
  "aerial-snaps":      "Aerial Snaps — ₱1,888",
  "aerial-snaps-reel": "Aerial Snaps + Reel — ₱2,888",
};

const STATUS_STYLES: Record<Status, { bg: string; color: string; label: string }> = {
  pending:   { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "Pending" },
  confirmed: { bg: "rgba(6,182,212,0.12)",   color: "#06b6d4", label: "Confirmed" },
  completed: { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Completed" },
  cancelled: { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", label: "Cancelled" },
};

const NEXT_STATUS: Record<Status, Status | null> = {
  pending:   "confirmed",
  confirmed: "completed",
  completed: null,
  cancelled: null,
};

const NEXT_LABEL: Record<Status, string> = {
  pending:   "Confirm",
  confirmed: "Mark done",
  completed: "",
  cancelled: "",
};

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-PH", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

function fmtCreated(ts: string) {
  return new Date(ts).toLocaleDateString("en-PH", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function BookingsPage() {
  const { token } = useOps();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter]     = useState<Filter>("all");
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const authHeader = { "x-ops-token": token };

  const load = useCallback(async () => {
    setLoading(true);
    const url = filter === "all" ? "/api/bookings" : `/api/bookings?status=${filter}`;
    const res = await fetch(url, { headers: authHeader });
    if (res.ok) setBookings(await res.json());
    setLoading(false);
  }, [filter, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: Status) {
    setUpdating(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
    setUpdating(null);
  }

  async function deleteBooking(id: string) {
    if (!confirm("Delete this booking permanently?")) return;
    setUpdating(id);
    await fetch(`/api/bookings/${id}`, { method: "DELETE", headers: authHeader });
    await load();
    setUpdating(null);
  }

  // Stats
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalAll  = (counts.pending ?? 0) + (counts.confirmed ?? 0) + (counts.completed ?? 0) + (counts.cancelled ?? 0);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",       label: `All (${totalAll})` },
    { key: "pending",   label: `Pending (${counts.pending ?? 0})` },
    { key: "confirmed", label: `Confirmed (${counts.confirmed ?? 0})` },
    { key: "completed", label: `Completed (${counts.completed ?? 0})` },
    { key: "cancelled", label: `Cancelled (${counts.cancelled ?? 0})` },
  ];

  return (
    <div className="h-full overflow-y-auto" style={{ fontFamily: SYSTEM_FONT }}>
      <div className="max-w-4xl mx-auto px-4 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[17px] font-semibold text-white">Bookings</h1>
            <p className="text-[12px] text-white/40 mt-0.5">
              Requests from waevpoint.quest/opentofly
            </p>
          </div>
          <button onClick={load}
            className="text-[11px] text-white/40 hover:text-white/70 border border-white/[0.08] rounded-lg px-3 py-1.5 transition-colors">
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {(["pending", "confirmed", "completed", "cancelled"] as Status[]).map((s) => {
            const st = STATUS_STYLES[s];
            return (
              <div key={s} className="rounded-xl p-3 border"
                style={{ background: st.bg, borderColor: `${st.color}30` }}>
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: st.color }}>
                  {st.label}
                </p>
                <p className="text-[22px] font-bold text-white" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  {counts[s] ?? 0}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-white/[0.03] rounded-lg p-0.5 mb-5 w-fit">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-md text-[11px] transition-colors ${filter === f.key ? "bg-white/[0.09] text-white" : "text-white/40 hover:text-white/60"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[13px] text-white/30">No bookings yet.</p>
            {filter !== "all" && (
              <button onClick={() => setFilter("all")} className="text-[11px] text-cyan-400/60 mt-2 hover:text-cyan-400">
                Show all
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const st     = STATUS_STYLES[b.status];
              const next   = NEXT_STATUS[b.status];
              const isUpd  = updating === b.id;
              const isPast = b.date < new Date().toISOString().slice(0, 10);

              return (
                <div key={b.id} className="rounded-xl border p-4 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderColor: b.status === "pending" ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.07)",
                  }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Left: main info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className="text-[14px] font-semibold text-white">{b.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                        {isPast && b.status === "pending" && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
                            Past date
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                        <span className="text-[12px] text-white/60">
                          📅 {fmtDate(b.date)}
                        </span>
                        <span className="text-[12px] text-white/60">
                          📍 {b.area}
                        </span>
                        <span className="text-[12px]" style={{ color: "#06b6d4" }}>
                          {PKG_LABELS[b.package] ?? b.package}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] text-white/40">Contact:</span>
                        <span className="text-[11px] text-white/70">{b.contact}</span>
                      </div>

                      {b.notes && (
                        <p className="text-[11px] text-white/40 leading-snug mt-1">
                          📝 {b.notes}
                        </p>
                      )}

                      <p className="text-[10px] text-white/20 mt-2">
                        Received {fmtCreated(b.created_at)}
                      </p>
                    </div>

                    {/* Right: actions */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {next && (
                        <button
                          onClick={() => updateStatus(b.id, next)}
                          disabled={isUpd}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                          style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.25)" }}>
                          {isUpd ? "…" : NEXT_LABEL[b.status]}
                        </button>
                      )}
                      {b.status === "pending" && (
                        <button
                          onClick={() => updateStatus(b.id, "cancelled")}
                          disabled={isUpd}
                          className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                          style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}>
                          Cancel
                        </button>
                      )}
                      {(b.status === "completed" || b.status === "cancelled") && (
                        <button
                          onClick={() => deleteBooking(b.id)}
                          disabled={isUpd}
                          className="px-3 py-1.5 rounded-lg text-[11px] transition-colors"
                          style={{ color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
