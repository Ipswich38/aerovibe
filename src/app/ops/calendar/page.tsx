"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";
import { useOps } from "../OpsContext";

interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  date: string;
  time?: string;
  end_time?: string;
  notes?: string;
  location?: string;
  status: string | null;
  color: string;
  href: string;
  editable?: boolean;
  sourceId?: string;
}

const TYPE_LABELS: Record<string, string> = {
  shoot: "Shoot",
  deadline: "Deadline",
  flight: "Flight",
  invoice_due: "Invoice",
  contract: "Contract",
  survey: "Survey",
  activity: "Activity",
  appointment: "Appointment",
  reminder: "Reminder",
  meeting: "Meeting",
};

const EDITABLE_TYPES = [
  { value: "activity",    label: "Activity",    color: "#06b6d4" },
  { value: "appointment", label: "Appointment", color: "#a78bfa" },
  { value: "reminder",    label: "Reminder",    color: "#fbbf24" },
  { value: "meeting",     label: "Meeting",     color: "#34d399" },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_HEIGHT = 56; // px per hour in timeline
const LABEL_W = 40;    // px for hour label column

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function fmtShort(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function fmtHour(h: number, fmt: "12h" | "24h"): string {
  if (fmt === "24h") return `${String(h).padStart(2, "0")}:00`;
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

function fmtTime(t: string, fmt: "12h" | "24h"): string {
  if (fmt === "24h") return t;
  const [h, m] = t.split(":").map(Number);
  const label = h === 0 ? "12" : h <= 12 ? `${h}` : `${h - 12}`;
  const suffix = h < 12 ? "am" : "pm";
  return m === 0 ? `${label}${suffix}` : `${label}:${String(m).padStart(2, "0")}${suffix}`;
}

interface LayoutItem {
  ev: CalendarEvent;
  startMin: number;
  endMin: number;
  col: number;
  totalCols: number;
}

function layoutTimedEvents(events: CalendarEvent[]): LayoutItem[] {
  const items: LayoutItem[] = events
    .filter((e) => e.time)
    .map((ev) => {
      const startMin = timeToMin(ev.time!);
      const endMin = ev.end_time
        ? Math.max(startMin + 15, timeToMin(ev.end_time))
        : startMin + 60;
      return { ev, startMin, endMin, col: 0, totalCols: 1 };
    })
    .sort((a, b) => a.startMin - b.startMin);

  // Greedy column assignment
  const colEnds: number[] = [];
  for (const item of items) {
    let placed = false;
    for (let c = 0; c < colEnds.length; c++) {
      if (colEnds[c] <= item.startMin) {
        item.col = c;
        colEnds[c] = item.endMin;
        placed = true;
        break;
      }
    }
    if (!placed) {
      item.col = colEnds.length;
      colEnds.push(item.endMin);
    }
  }

  // Compute totalCols per overlap group
  for (const item of items) {
    let max = item.col;
    for (const other of items) {
      if (other !== item && other.startMin < item.endMin && other.endMin > item.startMin) {
        max = Math.max(max, other.col);
      }
    }
    item.totalCols = max + 1;
  }

  return items;
}

interface EventFormState {
  title: string;
  type: string;
  time: string;
  end_time: string;
  notes: string;
  location: string;
  date: string; // edit only
}

const BLANK_FORM: EventFormState = {
  title: "", type: "activity", time: "", end_time: "",
  notes: "", location: "", date: "",
};

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

  const [formMode, setFormMode] = useState<"none" | "create" | "edit">("none");
  const [form, setForm] = useState<EventFormState>(BLANK_FORM);
  const [formDates, setFormDates] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("12h");
  useEffect(() => {
    const saved = localStorage.getItem("cal-time-fmt");
    if (saved === "24h" || saved === "12h") setTimeFormat(saved);
  }, []);
  function toggleTimeFormat() {
    setTimeFormat((f) => {
      const next = f === "12h" ? "24h" : "12h";
      localStorage.setItem("cal-time-fmt", next);
      return next;
    });
  }

  const titleRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(320);
  const showPanel = selectedDate !== null || formMode !== "none";
  const [nowMin, setNowMin] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

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
    setFormMode("none");
    setFormDates([]);
  }, [fetchEvents]);

  // Refresh when Panchi makes calendar changes
  useEffect(() => {
    const handler = () => fetchEvents();
    window.addEventListener("panchi:calendar_changed", handler);
    return () => window.removeEventListener("panchi:calendar_changed", handler);
  }, [fetchEvents]);

  // Focus title when form opens
  useEffect(() => {
    if (formMode !== "none") setTimeout(() => titleRef.current?.focus(), 50);
  }, [formMode]);

  // Track panel width for timeline layout
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      setPanelWidth(entries[0].contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [showPanel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll timeline to current time (or first event) when date selected
  useEffect(() => {
    if (!selectedDate || !timelineRef.current) return;
    const target = selectedDate === toDateStr(new Date())
      ? Math.max(0, nowMin - 60)
      : 0;
    timelineRef.current.scrollTop = (target / 60) * HOUR_HEIGHT;
  }, [selectedDate, nowMin]);

  // Update current time every minute
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setNowMin(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

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
    setSelectedDate(toDateStr(now));
    setFormMode("none");
    setFormDates([]);
  }

  function toggleFormDate(date: string) {
    setFormDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date].sort()
    );
  }

  function handleDayClick(date: string) {
    if (formMode === "create") { toggleFormDate(date); return; }
    if (formMode === "edit") return;
    setSelectedDate((prev) => (prev === date ? null : date));
    setFormMode("none");
  }

  function openCreate(anchor: string, prefillTime?: string) {
    setForm({ ...BLANK_FORM, time: prefillTime ?? "" });
    setFormDates([anchor]);
    setEditingId(null);
    setFormError("");
    setFormMode("create");
    setSelectedDate(anchor);
  }

  function openEdit(ev: CalendarEvent) {
    if (!ev.editable || !ev.sourceId) return;
    setForm({
      title: ev.title, type: ev.type, date: ev.date,
      time: ev.time ?? "", end_time: ev.end_time ?? "",
      notes: ev.notes ?? "", location: ev.location ?? "",
    });
    setFormDates([]);
    setEditingId(ev.sourceId);
    setFormError("");
    setFormMode("edit");
  }

  function cancelForm() {
    setFormMode("none");
    setEditingId(null);
    setFormDates([]);
    setFormError("");
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError("Title is required."); titleRef.current?.focus(); return; }
    if (formMode === "create" && formDates.length === 0) {
      setFormError("Select at least one date on the calendar."); return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (formMode === "create") {
        const results = await Promise.all(
          formDates.map((date) =>
            fetch("/api/calendar/events", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                title: form.title.trim(), type: form.type, date,
                time: form.time || null, end_time: form.end_time || null,
                notes: form.notes || null, location: form.location || null,
              }),
            })
          )
        );
        const failed = results.filter((r) => !r.ok);
        if (failed.length) {
          const j = await failed[0].json().catch(() => ({}));
          throw new Error(j.error || `${failed.length} event(s) failed`);
        }
      } else {
        const res = await fetch(`/api/calendar/events/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: form.title.trim(), type: form.type, date: form.date,
            time: form.time || null, end_time: form.end_time || null,
            notes: form.notes || null, location: form.location || null,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Request failed (${res.status})`);
        }
      }
      setFormMode("none");
      setEditingId(null);
      setFormDates([]);
      await fetchEvents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    }
    setSaving(false);
  }

  async function handleDelete(sourceId: string) {
    if (!confirm("Delete this event?")) return;
    setDeletingId(sourceId);
    try {
      const res = await fetch(`/api/calendar/events/${sourceId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok && res.status !== 204) throw new Error(`Failed to delete (${res.status})`);
      if (formMode === "edit" && editingId === sourceId) { setFormMode("none"); setEditingId(null); }
      await fetchEvents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
    setDeletingId(null);
  }

  const filteredEvents = useMemo(
    () => (typeFilter === "all" ? events : events.filter((e) => e.type === typeFilter)),
    [events, typeFilter]
  );

  const grid = useMemo(() => {
    const totalDays = daysInMonth(current.year, current.month);
    const firstDay = new Date(current.year, current.month, 1).getDay();
    const cells: { date: string; day: number; inMonth: boolean }[] = [];

    const prevDays = daysInMonth(current.year, current.month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ date: toDateStr(new Date(current.year, current.month - 1, prevDays - i)), day: prevDays - i, inMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push({ date: toDateStr(new Date(current.year, current.month, d)), day: d, inMonth: true });
    }
    for (let d = 1; d <= 42 - cells.length; d++) {
      cells.push({ date: toDateStr(new Date(current.year, current.month + 1, d)), day: d, inMonth: false });
    }
    return cells;
  }, [current]);

  const eventsByDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    for (const ev of filteredEvents) {
      const d = ev.date.slice(0, 10);
      if (!m[d]) m[d] = [];
      m[d].push(ev);
    }
    return m;
  }, [filteredEvents]);

  const todayStr = toDateStr(new Date());
  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const allDayEvents = selectedEvents.filter((e) => !e.time);
  const timedEvents = selectedEvents.filter((e) => !!e.time);
  const timelineLayout = useMemo(() => layoutTimedEvents(timedEvents), [timedEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  // Conflict detection: events on the form's dates whose time overlaps the form's time range
  const formConflicts = useMemo(() => {
    if (!form.time || formMode === "none") return [];
    const formStart = timeToMin(form.time);
    const formEnd = form.end_time ? Math.max(formStart + 1, timeToMin(form.end_time)) : formStart + 60;
    const checkDates = formMode === "edit" ? (form.date ? [form.date] : []) : formDates;
    const found: CalendarEvent[] = [];
    for (const date of checkDates) {
      for (const ev of (eventsByDate[date] || [])) {
        if (!ev.time) continue;
        if (formMode === "edit" && ev.sourceId === editingId) continue;
        const evStart = timeToMin(ev.time);
        const evEnd = ev.end_time ? Math.max(evStart + 1, timeToMin(ev.end_time)) : evStart + 60;
        if (formStart < evEnd && formEnd > evStart && !found.find((f) => f.id === ev.id)) {
          found.push(ev);
        }
      }
    }
    return found;
  }, [form.time, form.end_time, formMode, formDates, form.date, eventsByDate, editingId]);

  // Which minutes are occupied (for hour-row busy indicators)
  const occupiedRanges = useMemo(
    () => timelineLayout.map(({ ev, startMin, endMin }) => ({ ev, startMin, endMin })),
    [timelineLayout]
  );

  // Busy times for the form's first selected date (to show existing schedule)
  const busyTimes = useMemo(() => {
    if (formMode === "none") return [];
    const date = formMode === "edit" ? form.date : (formDates.length === 1 ? formDates[0] : null);
    if (!date) return [];
    return (eventsByDate[date] || []).filter(
      (e) => e.time && !(formMode === "edit" && e.sourceId === editingId)
    );
  }, [formMode, form.date, formDates, eventsByDate, editingId]);

  const monthLabel = new Date(current.year, current.month).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  const activeTypes = useMemo(() => [...new Set(events.map((e) => e.type))], [events]);
  const formDatesSet = useMemo(() => new Set(formDates), [formDates]);

  const inputCls =
    "w-full bg-white/[0.05] border border-white/[0.1] rounded-md px-2.5 py-1.5 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] transition-colors";
  const labelCls = "block text-[10px] text-white/40 font-medium mb-1 uppercase tracking-wide";

  // Timeline event positioning
  const eventAreaW = Math.max(100, panelWidth - LABEL_W - 6);

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: SYSTEM_FONT }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="text-[15px] font-semibold text-white">{monthLabel}</h1>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors" aria-label="Previous month">‹</button>
              <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors" aria-label="Next month">›</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {formMode === "none" && (
              <button
                onClick={() => openCreate(selectedDate ?? todayStr)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 text-[12px] font-medium transition-colors"
              >
                <span className="text-[16px] leading-none">+</span>
                New event
              </button>
            )}
            <button onClick={toggleTimeFormat} className="text-[11px] text-white/40 hover:text-white px-2 py-1 rounded-md hover:bg-white/[0.06] transition-colors tabular-nums font-mono" title="Toggle time format">
              {timeFormat === "12h" ? "12h" : "24h"}
            </button>
            <button onClick={goToday} className="text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/[0.06] transition-colors">Today</button>
          </div>
        </div>
        {activeTypes.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setTypeFilter("all")} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${typeFilter === "all" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"}`}>All</button>
            {activeTypes.map((t) => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${typeFilter === t ? "bg-cyan-500/20 text-cyan-300" : "bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]"}`}>
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

      {formMode === "create" && (
        <div className="px-5 py-2 bg-cyan-500/[0.08] border-b border-cyan-500/20 shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-cyan-300">Click calendar days to toggle dates</span>
          <span className="text-[11px] text-cyan-400 font-semibold">{formDates.length} {formDates.length === 1 ? "date" : "dates"} selected</span>
        </div>
      )}

      {/* Calendar + Detail */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Calendar grid */}
        <div className={`flex-1 flex flex-col p-4 overflow-y-auto ${showPanel ? "pb-24 md:pb-4" : ""}`}>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className="text-center text-[10px] text-white/30 font-medium py-1">{wd}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 flex-1">
                {grid.map((cell) => {
                  const dayEvents = eventsByDate[cell.date] || [];
                  const isToday = cell.date === todayStr;
                  const isSelected = cell.date === selectedDate && formMode !== "create";
                  const isFormDate = formDatesSet.has(cell.date);
                  return (
                    <button
                      key={cell.date}
                      onClick={() => handleDayClick(cell.date)}
                      className={`relative p-1 min-h-[72px] border rounded-md transition-colors text-left focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${cell.inMonth ? "" : "opacity-30"} ${
                        isFormDate ? "bg-purple-500/15 border-purple-500/40"
                          : isSelected ? "bg-cyan-500/10 border-cyan-500/30"
                          : "border-white/[0.03] hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`text-[12px] font-medium inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? "bg-cyan-500 text-black" : cell.inMonth ? "text-white/70" : "text-white/25"} ${isFormDate && !isToday ? "ring-2 ring-purple-400" : ""}`}>
                        {cell.day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-0.5 px-0.5">
                          {dayEvents.slice(0, 3).map((ev) => (
                            <div key={ev.id} className="w-full truncate text-[9px] font-medium px-1 py-0.5 rounded" style={{ backgroundColor: `${ev.color}20`, color: ev.color }}>
                              {ev.time && <span className="opacity-60 mr-0.5">{fmtTime(ev.time, timeFormat)}</span>}
                              {ev.title.length > 14 ? ev.title.slice(0, 13) + "…" : ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && <span className="text-[9px] text-white/30 px-1">+{dayEvents.length - 3}</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Mobile backdrop */}
        {showPanel && (
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => { setSelectedDate(null); cancelForm(); }} />
        )}

        {/* Side panel — bottom sheet on mobile, side panel on desktop */}
        {showPanel && (
          <div
            ref={panelRef}
            className={[
              "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl overflow-hidden",
              formMode === "create" ? "max-h-[65vh]" : "max-h-[88vh]",
              "md:static md:bottom-auto md:left-auto md:right-auto md:z-auto",
              "md:w-80 md:rounded-none md:max-h-none md:border-l md:border-white/[0.08] md:shrink-0",
              "bg-[#252527] flex flex-col",
            ].join(" ")}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-2.5 pb-1 md:hidden shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Panel header */}
            <div className="px-4 py-3 border-b border-white/[0.06] shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  {formMode === "create" ? (
                    <h2 className="text-[13px] font-semibold text-white">New Event</h2>
                  ) : formMode === "edit" ? (
                    <h2 className="text-[13px] font-semibold text-white">Edit Event</h2>
                  ) : selectedDate ? (
                    <>
                      <h2 className="text-[13px] font-semibold text-white">
                        {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}
                      </h2>
                      {selectedDate === todayStr && <span className="text-[10px] text-cyan-400 font-medium">Today</span>}
                    </>
                  ) : null}
                </div>
                <div className="flex items-center gap-1.5">
                  {formMode === "none" && selectedDate && (
                    <button
                      onClick={() => openCreate(selectedDate)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 text-[11px] font-medium transition-colors"
                    >
                      + Add
                    </button>
                  )}
                  <button onClick={() => { setSelectedDate(null); cancelForm(); }} className="text-white/30 hover:text-white text-[16px] w-6 h-6 flex items-center justify-center rounded" aria-label="Close">×</button>
                </div>
              </div>
            </div>

            {/* Create / Edit form */}
            {formMode !== "none" && (
              <div className="border-b border-white/[0.06] p-3 overflow-y-auto shrink-0">
                <div className="space-y-2.5">
                  <div>
                    <label className={labelCls}>Title</label>
                    <input ref={titleRef} type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleSave()} placeholder="Event title" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Type</label>
                    <div className="grid grid-cols-2 gap-1">
                      {EDITABLE_TYPES.map((t) => (
                        <button key={t.value} type="button" onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors border ${form.type === t.value ? "border-transparent text-white" : "border-white/[0.08] text-white/50 hover:text-white hover:border-white/20"}`}
                          style={form.type === t.value ? { backgroundColor: `${t.color}25`, borderColor: `${t.color}60` } : {}}
                        >
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formMode === "create" && (
                    <div>
                      <label className={labelCls}>Dates <span className="normal-case text-white/25 font-normal">— click calendar to toggle</span></label>
                      {formDates.length === 0 ? (
                        <p className="text-[11px] text-white/30 italic">No dates selected yet</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {formDates.map((d) => (
                            <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] rounded-full">
                              {fmtShort(d)}
                              <button type="button" onClick={() => toggleFormDate(d)} className="hover:text-white leading-none">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {formMode === "edit" && (
                    <div>
                      <label className={labelCls}>Date</label>
                      <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputCls} />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Start</label>
                      <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>End</label>
                      <input type="time" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} className={inputCls} />
                    </div>
                  </div>

                  {/* Conflict warning */}
                  {formConflicts.length > 0 && (
                    <div className="rounded-md bg-amber-500/10 border border-amber-500/25 px-2.5 py-2">
                      <p className="text-[10px] font-semibold text-amber-400 mb-1">⚠ Time conflict</p>
                      {formConflicts.map((ev) => (
                        <p key={ev.id} className="text-[10px] text-amber-300/70 leading-snug">
                          "{ev.title}" {ev.time}{ev.end_time ? ` – ${ev.end_time}` : ""}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Busy times on this day */}
                  {busyTimes.length > 0 && (
                    <div>
                      <label className={labelCls}>Already scheduled</label>
                      <div className="space-y-0.5">
                        {busyTimes.map((ev) => (
                          <div key={ev.id} className="flex items-center gap-1.5 text-[10px]">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                            <span className="text-white/50 tabular-nums">{fmtTime(ev.time!, timeFormat)}{ev.end_time ? `–${fmtTime(ev.end_time, timeFormat)}` : ""}</span>
                            <span className="text-white/30 truncate">{ev.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={labelCls}>Location</label>
                    <input type="text" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Venue, address, or link…" className={inputCls} />
                  </div>

                  <div>
                    <label className={labelCls}>Notes</label>
                    <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" rows={2} className={`${inputCls} resize-none`} />
                  </div>
                </div>

                {formError && <p className="text-[11px] text-red-400 mt-2">{formError}</p>}

                <div className="flex gap-2 mt-3">
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black text-[12px] font-semibold transition-colors">
                    {saving ? "Saving…" : formMode === "create" ? (formDates.length > 1 ? `Create ${formDates.length} events` : "Create") : "Save changes"}
                  </button>
                  <button onClick={cancelForm} disabled={saving} className="px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-white/60 hover:text-white text-[12px] transition-colors">Cancel</button>
                </div>
                {formMode === "edit" && editingId && (
                  <button
                    onClick={() => handleDelete(editingId)}
                    disabled={!!deletingId || saving}
                    className="w-full mt-2 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-[12px] transition-colors disabled:opacity-40"
                  >
                    {deletingId === editingId ? "Deleting…" : "Delete event"}
                  </button>
                )}
              </div>
            )}

            {/* Day view — timeline */}
            {formMode === "none" && selectedDate && (
              <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                {/* All-day events */}
                {allDayEvents.length > 0 && (
                  <div className="px-3 pt-2 pb-1.5 border-b border-white/[0.05] shrink-0">
                    <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5">All day</p>
                    <div className="space-y-1">
                      {allDayEvents.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between gap-1 rounded-md px-2 py-1" style={{ backgroundColor: `${ev.color}15` }}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
                            {ev.editable ? (
                              <span className="text-[11px] font-medium truncate text-white">{ev.title}</span>
                            ) : (
                              <Link href={ev.href} className="text-[11px] font-medium truncate text-white hover:opacity-70">{ev.title}</Link>
                            )}
                          </div>
                          {ev.editable && ev.sourceId && (
                            <div className="flex gap-0.5 shrink-0">
                              <button onClick={() => openEdit(ev)} className="w-5 h-5 flex items-center justify-center rounded text-white/30 hover:text-cyan-400 text-[11px]" title="Edit">✎</button>
                              <button onClick={() => handleDelete(ev.sourceId!)} disabled={deletingId === ev.sourceId} className="w-5 h-5 flex items-center justify-center rounded text-white/30 hover:text-red-400 text-[10px]" title="Delete">{deletingId === ev.sourceId ? "…" : "✕"}</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 24-hour timeline */}
                <div ref={timelineRef} className="flex-1 overflow-y-auto">
                  <div className="relative" style={{ height: `${24 * HOUR_HEIGHT}px` }}>

                    {/* Occupied range — solid colored band spanning full booked duration */}
                    {occupiedRanges.map(({ ev, startMin, endMin }) => (
                      <div
                        key={`shade-${ev.id}`}
                        className="absolute pointer-events-none z-0"
                        style={{
                          left: LABEL_W,
                          right: 0,
                          top: `${(startMin / 60) * HOUR_HEIGHT}px`,
                          height: `${((endMin - startMin) / 60) * HOUR_HEIGHT}px`,
                          backgroundColor: ev.color + "28",
                          borderLeft: `2px solid ${ev.color}60`,
                          backgroundImage: `repeating-linear-gradient(
                            -45deg,
                            transparent,
                            transparent 6px,
                            ${ev.color}12 6px,
                            ${ev.color}12 12px
                          )`,
                        }}
                      />
                    ))}

                    {/* Hour rows */}
                    {Array.from({ length: 24 }, (_, hour) => {
                      const hourStart = hour * 60;
                      const hourEnd = hourStart + 60;
                      const busyRange = occupiedRanges.find(
                        (r) => r.startMin < hourEnd && r.endMin > hourStart
                      );
                      const isBusy = !!busyRange;

                      return (
                        <div
                          key={hour}
                          className="absolute left-0 right-0 border-t border-white/[0.04]"
                          style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        >
                          <div className="flex h-full items-start">
                            {/* Hour label */}
                            <span
                              className="text-[9px] pt-0.5 select-none shrink-0 text-right pr-2 font-medium"
                              style={{
                                width: LABEL_W,
                                color: isBusy ? (busyRange!.ev.color + "cc") : "rgba(255,255,255,0.22)",
                              }}
                            >
                              {fmtHour(hour, timeFormat)}
                            </span>
                            {/* Clickable slot */}
                            <button
                              onClick={() => openCreate(selectedDate!, `${String(hour).padStart(2, "0")}:00`)}
                              className="flex-1 h-full transition-colors group text-left relative"
                              style={{ background: isBusy ? "transparent" : undefined }}
                              aria-label={`Add event at ${fmtHour(hour, timeFormat)}`}
                            >
                              {isBusy ? (
                                <span className="opacity-0 group-hover:opacity-100 text-[9px] text-amber-400/70 pl-1 transition-opacity">+ overlap</span>
                              ) : (
                                <span className="opacity-0 group-hover:opacity-100 text-[9px] text-cyan-500/50 pl-1 transition-opacity">+ event</span>
                              )}
                            </button>
                          </div>
                          {/* Half-hour tick */}
                          <div className="absolute left-0 right-0 border-t border-white/[0.02]" style={{ top: HOUR_HEIGHT / 2 }} />
                        </div>
                      );
                    })}

                    {/* Current time indicator */}
                    {selectedDate === todayStr && (
                      <div
                        className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                        style={{ top: `${(nowMin / 60) * HOUR_HEIGHT}px` }}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" style={{ marginLeft: LABEL_W - 4 }} />
                        <div className="flex-1 h-px bg-red-500/60" />
                      </div>
                    )}

                    {/* Timed events */}
                    {timelineLayout.map(({ ev, startMin, endMin, col, totalCols }) => {
                      const top = (startMin / 60) * HOUR_HEIGHT;
                      const height = Math.max(HOUR_HEIGHT * 0.45, ((endMin - startMin) / 60) * HOUR_HEIGHT) - 2;
                      const slotW = eventAreaW / totalCols;
                      const left = LABEL_W + col * slotW;
                      const width = slotW - 2;

                      return (
                        <div
                          key={ev.id}
                          className={`absolute rounded overflow-hidden px-1.5 py-0.5 z-10 ${ev.editable ? "cursor-pointer hover:brightness-110" : ""}`}
                          style={{
                            top, height, left, width,
                            backgroundColor: `${ev.color}55`,
                            borderLeft: `3px solid ${ev.color}`,
                            boxShadow: `inset 0 0 0 1px ${ev.color}40`,
                          }}
                          onClick={() => ev.editable ? openEdit(ev) : undefined}
                        >
                          <p className="text-[10px] font-semibold leading-tight truncate" style={{ color: ev.color }}>{ev.title}</p>
                          <p className="text-[9px] text-white/40 leading-tight">
                            {fmtTime(ev.time!, timeFormat)}
                            {ev.end_time ? ` – ${fmtTime(ev.end_time, timeFormat)}` : ""}
                          </p>
                          {ev.location && height > 48 && (
                            <p className="text-[9px] text-white/30 leading-tight truncate">📍 {ev.location}</p>
                          )}
                          {ev.editable && ev.sourceId && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(ev.sourceId!); }}
                              disabled={deletingId === ev.sourceId}
                              className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded bg-black/30 text-white/50 hover:bg-red-500 hover:text-white text-[10px] transition-colors"
                              title="Delete"
                            >{deletingId === ev.sourceId ? "…" : "✕"}</button>
                          )}
                        </div>
                      );
                    })}

                    {/* No events hint */}
                    {timedEvents.length === 0 && allDayEvents.length === 0 && (
                      <div
                        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
                        style={{ top: `${8 * HOUR_HEIGHT}px`, height: `${4 * HOUR_HEIGHT}px` }}
                      >
                        <p className="text-[11px] text-white/15 text-center">
                          Tap a time slot to add an event
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dates summary while creating */}
            {formMode === "create" && formDates.length > 0 && (
              <div className="p-3 border-t border-white/[0.06] shrink-0">
                <p className="text-[10px] text-white/30">
                  {formDates.length} {formDates.length === 1 ? "date" : "dates"}: {formDates.map(fmtShort).join(", ")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
