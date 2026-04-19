"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface CalendarEvent {
  id: string;
  type: "shoot" | "deadline" | "flight" | "invoice_due" | "contract" | "survey";
  title: string;
  date: string;
  status: string | null;
  color: string;
  href: string;
}

const TYPE_LABELS: Record<string, string> = {
  shoot: "Shoot",
  deadline: "Deadline",
  flight: "Flight",
  invoice_due: "Invoice",
  contract: "Contract",
  survey: "Survey",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

export default function CalendarPage() {
  const { token } = useOps();
  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const mk = monthKey(new Date(current.year, current.month));

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/calendar?month=${mk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      setEvents(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calendar");
    }
    setLoading(false);
  }, [token, mk]);

  useEffect(() => {
    fetchEvents();
    setSelectedDate(null);
  }, [fetchEvents]);

  function prevMonth() {
    setCurrent((c) => {
      const d = new Date(c.year, c.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setCurrent((c) => {
      const d = new Date(c.year, c.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToday() {
    const now = new Date();
    setCurrent({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(now.toISOString().slice(0, 10));
  }

  const filteredEvents = useMemo(
    () => (typeFilter === "all" ? events : events.filter((e) => e.type === typeFilter)),
    [events, typeFilter]
  );

  // Build calendar grid
  const grid = useMemo(() => {
    const totalDays = daysInMonth(current.year, current.month);
    const firstDay = new Date(current.year, current.month, 1).getDay();
    const cells: { date: string; day: number; inMonth: boolean }[] = [];

    // Previous month padding
    const prevDays = daysInMonth(current.year, current.month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      const dt = new Date(current.year, current.month - 1, d);
      cells.push({ date: dt.toISOString().slice(0, 10), day: d, inMonth: false });
    }

    // Current month
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(current.year, current.month, d);
      cells.push({ date: dt.toISOString().slice(0, 10), day: d, inMonth: true });
    }

    // Next month padding
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(current.year, current.month + 1, d);
      cells.push({ date: dt.toISOString().slice(0, 10), day: d, inMonth: false });
    }

    return cells;
  }, [current]);

  // Events by date lookup
  const eventsByDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    for (const ev of filteredEvents) {
      const d = ev.date.slice(0, 10);
      if (!m[d]) m[d] = [];
      m[d].push(ev);
    }
    return m;
  }, [filteredEvents]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const monthLabel = new Date(current.year, current.month).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  // Unique event types for filter
  const activeTypes = useMemo(() => [...new Set(events.map((e) => e.type))], [events]);

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: SYSTEM_FONT }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-white">{monthLabel}</h1>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                aria-label="Previous month"
              >
                ‹
              </button>
              <button
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none"
                aria-label="Next month"
              >
                ›
              </button>
            </div>
          </div>
          <button
            onClick={goToday}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded-md hover:bg-white/[0.06] transition-colors"
          >
            Today
          </button>
        </div>
        {activeTypes.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                typeFilter === "all"
                  ? "bg-cyan-500/20 text-cyan-300"
                  : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              All
            </button>
            {activeTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {TYPE_LABELS[t] || t}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="px-5 py-2 bg-red-500/10 border-b border-red-500/20">
          <span className="text-[12px] text-red-400">{error}</span>
        </div>
      )}

      {/* Calendar + Detail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className="text-center text-[10px] text-white/30 font-medium py-1">
                    {wd}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 flex-1">
                {grid.map((cell) => {
                  const dayEvents = eventsByDate[cell.date] || [];
                  const isToday = cell.date === todayStr;
                  const isSelected = cell.date === selectedDate;
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={cell.date}
                      onClick={() => setSelectedDate(cell.date === selectedDate ? null : cell.date)}
                      className={`
                        relative p-1 min-h-[72px] border border-white/[0.03] rounded-md transition-colors text-left
                        focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none
                        ${cell.inMonth ? "" : "opacity-30"}
                        ${isSelected ? "bg-cyan-500/10 border-cyan-500/30" : "hover:bg-white/[0.03]"}
                      `}
                    >
                      <span
                        className={`
                          text-[12px] font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
                          ${isToday ? "bg-cyan-500 text-black" : cell.inMonth ? "text-white/70" : "text-white/25"}
                        `}
                      >
                        {cell.day}
                      </span>
                      {hasEvents && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5 px-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div
                              key={ev.id}
                              className="w-full truncate text-[9px] font-medium px-1 py-0.5 rounded"
                              style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                            >
                              {ev.title.length > 18 ? ev.title.slice(0, 16) + "…" : ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[9px] text-white/30 px-1">+{dayEvents.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Day detail panel */}
        {selectedDate && (
          <div className="w-72 border-l border-white/[0.08] bg-[#252527] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-white">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-PH", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-white/30 hover:text-white text-[14px]"
                  aria-label="Close detail"
                >
                  ×
                </button>
              </div>
              {isSameDay(selectedDate, todayStr) && (
                <span className="text-[10px] text-cyan-400 font-medium">Today</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {selectedEvents.length === 0 ? (
                <p className="text-white/25 text-[12px] text-center py-8">No events</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((ev) => (
                    <Link
                      key={ev.id}
                      href={ev.href}
                      className="block bg-white/[0.03] rounded-lg px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                        <span className="text-[12px] text-white font-medium truncate">{ev.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 ml-4">
                        <span className="text-[10px] text-white/30">{TYPE_LABELS[ev.type] || ev.type}</span>
                        {ev.status && (
                          <span className="text-[10px] text-white/25 capitalize">{ev.status}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
