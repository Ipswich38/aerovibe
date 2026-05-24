"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

// ── Calendar helpers ──────────────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toYM(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function calendarDays(year: number, month: number) {
  const firstDow   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: string; day: number }> = [];
  for (let i = 0; i < firstDow; i++) cells.push({ date: "", day: 0 });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: toDateStr(year, month, d), day: d });
  while (cells.length % 7 !== 0) cells.push({ date: "", day: 0 });
  return cells;
}

// 2 days from today = earliest bookable
function bufferDate() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().slice(0, 10);
}

// ── Availability calendar component ──────────────────────────────────────────

function AvailabilityCalendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (date: string) => void;
}) {
  const today    = new Date();
  const [year,   setYear]   = useState(today.getFullYear());
  const [month,  setMonth]  = useState(today.getMonth());
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchBooked = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/booking/availability?month=${toYM(y, m)}`);
      if (res.ok) {
        const data = await res.json() as { booked: string[] };
        setBooked(new Set(data.booked));
      }
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchBooked(year, month); }, [year, month, fetchBooked]);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const buffer  = bufferDate();
  const cells   = calendarDays(year, month);
  const monthLabel = new Date(year, month).toLocaleDateString("en-PH", { month: "long", year: "numeric" });

  // Don't allow navigating to past months
  const todayYM  = toYM(today.getFullYear(), today.getMonth());
  const viewYM   = toYM(year, month);
  const canGoPrev = viewYM > todayYM;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Month nav */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={prevMonth} disabled={!canGoPrev}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{
            color: canGoPrev ? "#aaa" : "rgba(255,255,255,0.15)",
            background: canGoPrev ? "rgba(255,255,255,0.06)" : "transparent",
          }}>
          ‹
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-white">{monthLabel}</span>
          {loading && <div className="w-3 h-3 border border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />}
        </div>
        <button onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.06]"
          style={{ color: "#aaa" }}>
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2 pb-1">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium pb-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 px-2 pb-3">
        {cells.map((cell, i) => {
          if (!cell.date) return <div key={i} />;

          const isPast    = cell.date < buffer;
          const isBooked  = booked.has(cell.date);
          const isSel     = cell.date === selected;
          const disabled  = isPast || isBooked;

          let bg = "transparent";
          let color = "#ccc";
          let border = "transparent";
          let cursor = "pointer";

          if (isSel) {
            bg = "#06b6d4"; color = "#000"; border = "#06b6d4";
          } else if (isBooked) {
            bg = "rgba(239,68,68,0.1)"; color = "rgba(239,68,68,0.5)"; border = "rgba(239,68,68,0.15)"; cursor = "not-allowed";
          } else if (isPast) {
            color = "rgba(255,255,255,0.15)"; cursor = "not-allowed";
          } else {
            border = "rgba(255,255,255,0.06)";
          }

          return (
            <button key={cell.date} disabled={disabled}
              onClick={() => onSelect(cell.date)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-[12px] font-medium transition-all"
              style={{ background: bg, color, border: `1px solid ${border}`, cursor,
                ...((!disabled && !isSel) ? {} : {}),
              }}
              title={isBooked ? "Already booked" : isPast ? "Not available" : `Book ${cell.date}`}
            >
              {cell.day}
              {isBooked && <span className="text-[7px] leading-none" style={{ color: "rgba(239,68,68,0.6)" }}>full</span>}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 pb-3 flex-wrap">
        {[
          { color: "#06b6d4", bg: "#06b6d4", label: "Selected" },
          { color: "rgba(239,68,68,0.5)", bg: "rgba(239,68,68,0.1)", label: "Booked" },
          { color: "rgba(255,255,255,0.15)", bg: "transparent", label: "Unavailable" },
          { color: "#ccc", bg: "rgba(255,255,255,0.06)", label: "Available" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: l.bg, border: `1px solid ${l.color}` }} />
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const FB_PAGE  = "https://www.facebook.com/profile.php?id=61589289392539";
const FB_MSG   = "https://m.me/61589289392539";

const PACKAGES = [
  {
    key: "aerial-snaps",
    name: "Aerial Snaps",
    tagline: "That one drone shot you've been missing",
    foundingPrice: "₱1,888",
    regularPrice: "₱3,500",
    includes: [
      "5 edited aerial photos",
      "Google Drive delivery within 48 hrs",
      "Ready to post, no raw files",
      "CAAP licensed operator",
    ],
    featured: false,
  },
  {
    key: "aerial-snaps-reel",
    name: "Aerial Snaps + Reel",
    tagline: "Photos + a scroll-stopper aerial clip",
    foundingPrice: "₱2,888",
    regularPrice: "₱5,000",
    includes: [
      "5 edited aerial photos",
      "30–45 sec aerial reel with BGM",
      "Google Drive delivery within 72 hrs",
      "Ready for Facebook, IG, TikTok",
      "CAAP licensed operator",
    ],
    featured: true,
  },
];

const AREAS = [
  "San Jose del Monte", "Caloocan", "Novaliches",
  "Quezon City (nearby)", "Marilao · Meycauayan", "Norzagaray",
];

const STEPS = [
  {
    n: "01",
    title: "Pick a date",
    body: "Choose your preferred shoot date and fill in your details below. Takes under a minute.",
  },
  {
    n: "02",
    title: "We confirm",
    body: "We review your booking and confirm via Facebook Messenger within a few hours.",
  },
  {
    n: "03",
    title: "Receive & post",
    body: "Edited files in your Google Drive within 48–72 hrs. Ready to publish, no extra steps.",
  },
];

export default function OpenToFlyPage() {
  const [selectedPkg, setSelectedPkg] = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [error, setError]             = useState("");

  const [name,    setName]    = useState("");
  const [contact, setContact] = useState("");
  const [date,    setDate]    = useState("");
  const [area,    setArea]    = useState("");
  const [notes,   setNotes]   = useState("");

  function selectPackage(key: string) {
    setSelectedPkg(key);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name || !contact || !date || !area) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, pkg: selectedPkg, date, area, notes }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "#0f0f0f", fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="waevpoint" style={{ height: 22, width: "auto" }} />
        </Link>
        <a href={FB_PAGE} target="_blank" rel="noopener noreferrer"
          className="text-[11px] uppercase tracking-[0.2em] hover:text-white transition-colors"
          style={{ color: "#666", fontFamily: "'IBM Plex Mono', monospace" }}>
          Facebook Page ↗
        </a>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] mb-8"
          style={{ background: "rgba(201,52,42,0.12)", border: "1px solid rgba(201,52,42,0.25)", color: "#e05a50", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em" }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#c9342a" }} />
          FIRST 100 FOUNDING CLIENTS ONLY
        </div>
        <h1 className="text-[clamp(2.8rem,7vw,5rem)] leading-[1.05] mb-6 text-white"
          style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 800 }}>
          Open to <span style={{ color: "#06b6d4" }}>Fly.</span>
        </h1>
        <p className="text-[clamp(1rem,2.5vw,1.2rem)] leading-relaxed mb-4 max-w-xl mx-auto" style={{ color: "#999" }}>
          Professional aerial drone photography at founding client rates, before our full launch pricing kicks in.
        </p>
        <p className="text-sm max-w-md mx-auto" style={{ color: "#666" }}>
          SJDM Bulacan &amp; nearby Quezon City only.{" "}
          <span style={{ color: "#06b6d4" }}>CAAP licensed operator.</span> DJI Mini 5 Pro.
        </p>
      </section>

      {/* ── Packages ────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 max-w-3xl mx-auto">
        <p className="text-center text-[11px] uppercase tracking-[0.2em] mb-10"
          style={{ color: "#666", fontFamily: "'IBM Plex Mono', monospace" }}>
          Choose a package to book
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PACKAGES.map((pkg) => {
            const active = selectedPkg === pkg.key;
            return (
              <div key={pkg.key} className="rounded-2xl p-7 flex flex-col transition-all"
                style={{
                  background: active ? "rgba(6,182,212,0.08)" : pkg.featured ? "rgba(6,182,212,0.04)" : "rgba(255,255,255,0.03)",
                  border: active ? "1px solid rgba(6,182,212,0.6)" : pkg.featured ? "1px solid rgba(6,182,212,0.25)" : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: active ? "0 0 40px rgba(6,182,212,0.12)" : pkg.featured ? "0 0 30px rgba(6,182,212,0.06)" : "none",
                }}>
                {pkg.featured && !active && (
                  <div className="text-[10px] uppercase tracking-[0.2em] mb-4"
                    style={{ color: "#06b6d4", fontFamily: "'IBM Plex Mono', monospace" }}>
                    Most popular
                  </div>
                )}
                {active && (
                  <div className="text-[10px] uppercase tracking-[0.2em] mb-4"
                    style={{ color: "#06b6d4", fontFamily: "'IBM Plex Mono', monospace" }}>
                    ✓ Selected
                  </div>
                )}
                <h2 className="text-xl mb-1 text-white" style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 700 }}>
                  {pkg.name}
                </h2>
                <p className="text-sm mb-5" style={{ color: "#888" }}>{pkg.tagline}</p>
                <div className="mb-6">
                  <div className="flex items-end gap-3">
                    <span className="text-[2.4rem] leading-none font-bold text-white"
                      style={{ fontFamily: "'League Spartan', sans-serif" }}>
                      {pkg.foundingPrice}
                    </span>
                    <div className="flex flex-col pb-1">
                      <span className="text-xs line-through" style={{ color: "#555" }}>{pkg.regularPrice} regular</span>
                      <span className="text-xs" style={{ color: "#06b6d4" }}>founding rate</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke={active || pkg.featured ? "#06b6d4" : "#555"}
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                        <path d="M9 12.75L11.25 15 15 9.75" />
                      </svg>
                      <span className="text-sm leading-snug" style={{ color: "#aaa" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => selectPackage(pkg.key)}
                  className="block w-full text-center rounded-xl py-3 text-sm font-semibold transition-all"
                  style={{
                    background: active ? "#06b6d4" : pkg.featured ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.06)",
                    color: active ? "#000" : pkg.featured ? "#06b6d4" : "#ccc",
                    border: active ? "none" : pkg.featured ? "1px solid rgba(6,182,212,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  }}>
                  {active ? "Booking form below ↓" : "Book this"}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-center mt-6 text-xs" style={{ color: "#555" }}>
          No time limits. Deliverable-based, you get exactly what&apos;s listed.
        </p>
      </section>

      {/* ── Booking form ────────────────────────────────────────────────── */}
      {showForm && (
        <section id="booking-form" className="px-6 pb-20 max-w-xl mx-auto">
          <div className="rounded-2xl p-8"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>

            {submitted ? (
              /* ── Success state ── */
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.3)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "'League Spartan', sans-serif" }}>
                  Booking received!
                </h3>
                <p className="text-sm mb-2" style={{ color: "#888" }}>
                  We&apos;ll review your request and confirm your schedule via Facebook Messenger within a few hours.
                </p>
                <p className="text-sm mb-8" style={{ color: "#666" }}>
                  Package: <span style={{ color: "#06b6d4" }}>
                    {PACKAGES.find(p => p.key === selectedPkg)?.name}
                  </span> · Date: <span style={{ color: "#06b6d4" }}>{date}</span>
                </p>
                <a href={FB_MSG} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-black transition-all hover:opacity-90"
                  style={{ background: "#06b6d4", fontFamily: "'League Spartan', sans-serif" }}>
                  Say hi on Messenger
                  <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </a>
                <p className="text-xs mt-4" style={{ color: "#555" }}>
                  Or wait, we&apos;ll message you first once we confirm your slot.
                </p>
              </div>
            ) : (
              /* ── Form ── */
              <>
                <div className="mb-6">
                  <p className="text-[11px] uppercase tracking-[0.2em] mb-1"
                    style={{ color: "#666", fontFamily: "'IBM Plex Mono', monospace" }}>
                    Booking
                  </p>
                  <h3 className="text-xl font-bold text-white"
                    style={{ fontFamily: "'League Spartan', sans-serif" }}>
                    {PACKAGES.find(p => p.key === selectedPkg)?.name}
                    <span className="ml-2 text-base font-normal" style={{ color: "#06b6d4" }}>
                      {PACKAGES.find(p => p.key === selectedPkg)?.foundingPrice}
                    </span>
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Package switcher */}
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "#666" }}>Package</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PACKAGES.map((p) => (
                        <button key={p.key} type="button" onClick={() => setSelectedPkg(p.key)}
                          className="py-2 px-3 rounded-lg text-[11px] text-left transition-all"
                          style={{
                            background: selectedPkg === p.key ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.04)",
                            border: selectedPkg === p.key ? "1px solid rgba(6,182,212,0.4)" : "1px solid rgba(255,255,255,0.08)",
                            color: selectedPkg === p.key ? "#06b6d4" : "#888",
                          }}>
                          {p.name}<br />
                          <span className="font-semibold" style={{ color: selectedPkg === p.key ? "#06b6d4" : "#ccc" }}>{p.foundingPrice}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date: availability calendar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs" style={{ color: "#666" }}>
                        Preferred shoot date <span style={{ color: "#c9342a" }}>*</span>
                      </label>
                      {date && (
                        <span className="text-[11px] font-medium" style={{ color: "#06b6d4" }}>
                          {new Date(date + "T00:00:00").toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                    <AvailabilityCalendar selected={date} onSelect={setDate} />
                    {!date && (
                      <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                        Tap a date to select it
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="booking-name" className="block text-xs mb-1.5" style={{ color: "#666" }}>
                      Your name <span style={{ color: "#c9342a" }}>*</span>
                    </label>
                    <input id="booking-name" type="text" required
                      placeholder="Juan dela Cruz"
                      value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label htmlFor="booking-contact" className="block text-xs mb-1.5" style={{ color: "#666" }}>
                      Facebook / phone / Messenger <span style={{ color: "#c9342a" }}>*</span>
                    </label>
                    <input id="booking-contact" type="text" required
                      placeholder="fb.com/yourname or 09xxxxxxxxx"
                      value={contact} onChange={(e) => setContact(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>

                  {/* Area */}
                  <div>
                    <label htmlFor="booking-area" className="block text-xs mb-1.5" style={{ color: "#666" }}>
                      Shoot location / area <span style={{ color: "#c9342a" }}>*</span>
                    </label>
                    <input id="booking-area" type="text" required
                      placeholder="e.g. Tungkong Mangga, SJDM or Novaliches, QC"
                      value={area} onChange={(e) => setArea(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="booking-notes" className="block text-xs mb-1.5" style={{ color: "#666" }}>
                      What do you need the shots for? <span style={{ color: "#555" }}>(optional)</span>
                    </label>
                    <textarea id="booking-notes" rows={2}
                      placeholder="Real estate listing, event, personal, business..."
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 resize-none"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>

                  {error && (
                    <p className="text-sm px-3 py-2 rounded-lg" style={{ color: "#e05a50", background: "rgba(201,52,42,0.08)", border: "1px solid rgba(201,52,42,0.2)" }}>
                      {error}
                    </p>
                  )}

                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 rounded-xl font-semibold transition-all"
                    style={{
                      background: submitting ? "rgba(6,182,212,0.4)" : "#06b6d4",
                      color: "#000",
                      fontFamily: "'League Spartan', sans-serif",
                      cursor: submitting ? "not-allowed" : "pointer",
                    }}>
                    {submitting ? "Sending booking…" : "Submit booking request"}
                  </button>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    <span className="text-xs" style={{ color: "#444" }}>or</span>
                    <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                  </div>

                  <a href={FB_MSG} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all hover:border-white/20"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#aaa" }}>
                    Message us directly on Facebook
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8m0 0L7 3m3 3L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </a>
                </form>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.2em] mb-12 text-center"
          style={{ color: "#666", fontFamily: "'IBM Plex Mono', monospace" }}>
          How it works
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.n}>
              <div className="text-[2rem] font-bold mb-3"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: "rgba(6,182,212,0.3)" }}>
                {step.n}
              </div>
              <h3 className="text-base font-semibold text-white mb-2"
                style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#777" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Coverage ────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 border-y" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] mb-6 text-center"
            style={{ color: "#666", fontFamily: "'IBM Plex Mono', monospace" }}>
            Coverage area
          </p>
          <p className="text-center text-2xl mb-8 text-white"
            style={{ fontFamily: "'League Spartan', sans-serif", fontWeight: 600 }}>
            SJDM Bulacan &amp; nearby Quezon City
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {AREAS.map((area) => (
              <span key={area} className="px-3 py-1.5 rounded-full text-sm"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#aaa" }}>
                {area}
              </span>
            ))}
          </div>
          <p className="text-center text-xs mt-6" style={{ color: "#555" }}>
            Not sure if you&apos;re within range? Message us and we&apos;ll confirm.
          </p>
        </div>
      </section>

      {/* ── Trust ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-12 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8">
          {[
            { label: "CAAP Licensed", sub: "Civil Aviation Authority PH" },
            { label: "DJI Mini 5 Pro", sub: "Professional aerial camera" },
            { label: "Deliverable-based", sub: "No time limits. You get the shot." },
            { label: "SJDM Based", sub: "Local operator, fast turnaround" },
          ].map((t) => (
            <div key={t.label} className="text-center">
              <p className="text-sm font-semibold text-white mb-0.5"
                style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {t.label}
              </p>
              <p className="text-xs" style={{ color: "#555" }}>{t.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8 border-t text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <Link href="/" className="text-xs transition-colors hover:text-white" style={{ color: "#555" }}>waevpoint.quest</Link>
          <span style={{ color: "#333" }} className="hidden sm:block">·</span>
          <a href={FB_PAGE} target="_blank" rel="noopener noreferrer"
            className="text-xs transition-colors hover:text-white" style={{ color: "#555" }}>
            Facebook
          </a>
          <span style={{ color: "#333" }} className="hidden sm:block">·</span>
          <a href="mailto:waevpoint@gmail.com"
            className="text-xs transition-colors hover:text-white" style={{ color: "#555" }}>
            waevpoint@gmail.com
          </a>
        </div>
        <p className="text-xs" style={{ color: "#333" }}>
          © {new Date().getFullYear()} waevpoint · San Jose del Monte, Bulacan, Philippines
        </p>
      </footer>
    </div>
  );
}
