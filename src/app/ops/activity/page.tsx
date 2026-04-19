"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  timestamp: string;
  icon: string;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "messages", label: "Messages" },
  { key: "projects", label: "Projects" },
  { key: "invoices", label: "Invoices" },
  { key: "flights", label: "Flights" },
  { key: "contacts", label: "Contacts" },
  { key: "surveys", label: "Surveys" },
  { key: "contracts", label: "Contracts" },
  { key: "leads", label: "Leads" },
];

const STATUS_COLORS: Record<string, string> = {
  unread: "bg-blue-500",
  read: "bg-white/20",
  replied: "bg-green-500",
  lead: "bg-amber-500",
  booked: "bg-cyan-500",
  shooting: "bg-orange-500",
  editing: "bg-purple-500",
  delivered: "bg-green-500",
  cancelled: "bg-red-500/60",
  draft: "bg-white/20",
  sent: "bg-blue-500",
  accepted: "bg-cyan-500",
  paid: "bg-green-500",
  overdue: "bg-red-500",
  pending: "bg-amber-500",
  processing: "bg-cyan-500",
  complete: "bg-green-500",
  failed: "bg-red-500",
  signed: "bg-green-500",
  new: "bg-blue-500",
  contacted: "bg-cyan-500",
  qualified: "bg-amber-500",
  converted: "bg-green-500",
  lost: "bg-red-500/60",
};

const PAGE_SIZE = 50;

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" });
}

function groupByDate(events: ActivityEvent[]): [string, ActivityEvent[]][] {
  const groups: Record<string, ActivityEvent[]> = {};
  for (const ev of events) {
    const key = new Date(ev.timestamp).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  }
  return Object.entries(groups);
}

export default function ActivityPage() {
  const { token } = useOps();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const refreshRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/activity?filter=${filter}&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Failed to load activity (${res.status})`);
      }
      setEvents(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    }
    if (!silent) setLoading(false);
  }, [token, filter]);

  useEffect(() => {
    fetchEvents();
    setVisibleCount(PAGE_SIZE);
  }, [fetchEvents]);

  // Auto-refresh every 30s
  useEffect(() => {
    refreshRef.current = setInterval(() => fetchEvents(true), 30_000);
    return () => clearInterval(refreshRef.current);
  }, [fetchEvents]);

  const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount]);
  const grouped = useMemo(() => groupByDate(visibleEvents), [visibleEvents]);
  const hasMore = visibleCount < events.length;

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: SYSTEM_FONT }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[15px] font-semibold text-white">Activity</h1>
          <button
            onClick={() => fetchEvents()}
            className="text-[11px] text-white/30 hover:text-white transition-colors"
            aria-label="Refresh activity"
          >
            ↻ Refresh
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Filter activity by type">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              role="tab"
              aria-selected={filter === f.key}
              className={`
                px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors
                focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none
                ${filter === f.key
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400/80 text-[13px] mb-3">{error}</p>
            <button
              onClick={() => fetchEvents()}
              className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-[13px]">No activity found</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            {grouped.map(([dateKey, dayEvents]) => (
              <div key={dateKey} className="mb-6">
                <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">
                  {formatDate(dayEvents[0].timestamp)}
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" aria-hidden="true" />

                  {dayEvents.map((ev) => (
                    <div key={ev.id} className="relative mb-3 group">
                      <div className="absolute left-[-20px] top-[7px] w-[9px] h-[9px] rounded-full border-2 border-[#1c1c1e] bg-white/30 group-hover:bg-cyan-400 transition-colors" aria-hidden="true" />

                      <div className="bg-white/[0.03] rounded-lg px-3.5 py-2.5 hover:bg-white/[0.06] transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[12px] shrink-0" aria-hidden="true">{ev.icon}</span>
                            <span className="text-[13px] text-white font-medium truncate">{ev.title}</span>
                          </div>
                          <span className="text-[11px] text-white/30 shrink-0">{relativeTime(ev.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 ml-6">
                          {ev.subtitle && (
                            <span className="text-[11px] text-white/40 truncate">{ev.subtitle}</span>
                          )}
                          {ev.status && (
                            <span className="flex items-center gap-1">
                              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[ev.status] || "bg-white/20"}`} aria-hidden="true" />
                              <span className="text-[10px] text-white/35 capitalize">{ev.status}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-white/20 capitalize">{ev.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="text-[12px] text-cyan-400 hover:text-cyan-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded px-3 py-1.5"
                >
                  Load more ({events.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
