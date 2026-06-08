"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SYSTEM_FONT,
  loadSession,
  saveSession,
  touchSession,
  clearSession,
} from "@/lib/ops";
import { OpsContext } from "./OpsContext";
import PanchiAssistant from "./PanchiAssistant";

interface AppItem {
  href: string;
  label: string;
  icon: string;
  desc: string;
}

interface Section {
  key: string;
  label: string;
  icon: string;
  color: string;
  apps: AppItem[];
}

const SECTIONS: Section[] = [
  {
    key: "field",
    label: "Field Ops",
    icon: "✈",
    color: "#06b6d4",
    apps: [
      { href: "/ops/missions", label: "Missions", icon: "◇", desc: "Plan & track missions" },
      { href: "/ops/flights", label: "Flights", icon: "✈", desc: "Flight logs & records" },
      { href: "/ops/map", label: "Map", icon: "◎", desc: "Live map & zones" },
      { href: "/ops/surveys", label: "Surveys", icon: "▣", desc: "Area surveys" },
      { href: "/ops/ingest", label: "Ingest", icon: "↓", desc: "Import & parse footage" },
    ],
  },
  {
    key: "studio",
    label: "Studio",
    icon: "◈",
    color: "#a78bfa",
    apps: [
      { href: "/ops/luts", label: "LUTs", icon: "◈", desc: "DJI Mini 5 Pro color LUTs" },
    ],
  },
  {
    key: "manage",
    label: "Manage",
    icon: "▦",
    color: "#34d399",
    apps: [
      { href: "/ops/bookings", label: "Bookings", icon: "✈", desc: "Client booking requests" },
      { href: "/ops/calendar", label: "Calendar", icon: "▥", desc: "Schedule" },
      { href: "/ops/projects", label: "Projects", icon: "▦", desc: "Active jobs" },
      { href: "/ops/activity", label: "Activity", icon: "◷", desc: "Timeline" },
    ],
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: "◐",
    color: "#fbbf24",
    apps: [
      { href: "/ops/blitz", label: "Blitz", icon: "◐", desc: "Campaign launcher" },
    ],
  },
  {
    key: "crm",
    label: "CRM",
    icon: "◉",
    color: "#f472b6",
    apps: [
      { href: "/ops/leads", label: "Leads", icon: "⌕", desc: "Prospect pipeline" },
      { href: "/ops/clients", label: "Clients", icon: "◉", desc: "Client records" },
      { href: "/ops/contracts", label: "Contracts", icon: "✎", desc: "Agreements" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    icon: "₱",
    color: "#4ade80",
    apps: [
      { href: "/ops/wavi", label: "Wavi", icon: "₩", desc: "Wallet overview" },
      { href: "/ops/invoices", label: "Invoices", icon: "₱", desc: "Billing" },
      { href: "/ops/books", label: "Books", icon: "≡", desc: "Accounting" },
    ],
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: "✉",
    color: "#60a5fa",
    apps: [
      { href: "/ops/inbox", label: "Messages", icon: "✉", desc: "Client messages" },
    ],
  },
  {
    key: "wavepilots",
    label: "WaevPilots",
    icon: "⬡",
    color: "#8b5cf6",
    apps: [
      { href: "/ops/pilots", label: "WaevPilots", icon: "⬡", desc: "Pilot applications & jobs" },
    ],
  },
];

function getActiveSectionKey(pathname: string): string | null {
  if (pathname === "/ops" || pathname.startsWith("/ops/flight-assist") || pathname.startsWith("/ops/checklist")) return null;
  for (const s of SECTIONS) {
    if (s.apps.some((a) => pathname.startsWith(a.href))) return s.key;
  }
  return null;
}

// ── Section icon with hover flyout ────────────────────────────────────────────

function SectionRailItem({
  section,
  isActive,
  pathname,
}: {
  section: Section;
  isActive: boolean;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  }
  function hide() {
    timerRef.current = setTimeout(() => setOpen(false), 120);
  }

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <button
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] transition-all"
        style={{
          background: isActive ? `${section.color}22` : open ? "rgba(255,255,255,0.07)" : "transparent",
          color: isActive ? section.color : "rgba(255,255,255,0.45)",
          boxShadow: isActive ? `0 0 0 1px ${section.color}40` : "none",
        }}
        title={section.label}
      >
        {section.icon}
      </button>

      {open && (
        <div
          className="absolute left-full top-0 z-50 ml-3"
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <div
            className="rounded-2xl p-3 shadow-2xl"
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.09)",
              minWidth: 200,
            }}
          >
            {/* Section header */}
            <div className="flex items-center gap-2 px-1 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: section.color }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: `${section.color}bb` }}
              >
                {section.label}
              </span>
            </div>

            {/* App mini-cards */}
            <div className="grid grid-cols-2 gap-1.5">
              {section.apps.map((app) => {
                const active = pathname.startsWith(app.href);
                return (
                  <Link
                    key={app.href}
                    href={app.href}
                    className="flex flex-col gap-1.5 p-2.5 rounded-xl transition-all"
                    style={{
                      background: active ? `${section.color}18` : "rgba(255,255,255,0.04)",
                      border: active ? `1px solid ${section.color}35` : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                  >
                    <span
                      className="text-[15px] leading-none"
                      style={{ color: active ? section.color : "rgba(255,255,255,0.6)" }}
                    >
                      {app.icon}
                    </span>
                    <span
                      className="text-[11px] font-medium leading-none"
                      style={{ color: active ? section.color : "rgba(255,255,255,0.75)" }}
                    >
                      {app.label}
                    </span>
                    <span className="text-[10px] leading-tight" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {app.desc}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Icon rail ──────────────────────────────────────────────────────────────────

function IconRail({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  const activeSectionKey = getActiveSectionKey(pathname);
  const isHome = pathname === "/ops";
  const isPanchi = pathname.startsWith("/ops/flight-assist");
  const isRegs = pathname.startsWith("/ops/regs");
  const isExam = pathname.startsWith("/ops/exam");
  const isChecklist = pathname.startsWith("/ops/checklist");
  const isReqs = pathname.startsWith("/ops/requirements");

  return (
    <div
      className="flex flex-col items-center h-full py-3 gap-1"
      style={{
        width: 56,
        background: "#0d0d0d",
        borderRight: "1px solid rgba(255,255,255,0.055)",
        flexShrink: 0,
      }}
    >
      {/* Logo → Home */}
      <Link href="/ops" className="mb-1" title="Home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, width: "auto", opacity: 0.85 }} />
      </Link>

      <div style={{ width: 24, borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />

      {/* Panchi ⚡ */}
      <Link
        href="/ops/flight-assist"
        title="Captain Panchi"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] transition-all"
        style={{
          background: isPanchi ? "#06b6d4" : "rgba(6,182,212,0.12)",
          color: isPanchi ? "#000" : "#06b6d4",
        }}
      >
        ⚡
      </Link>

      {/* PCAR/RPAS Regulations ⚖ */}
      <Link
        href="/ops/regs"
        title="PCAR / RPAS Regulations"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] transition-all"
        style={{
          background: isRegs ? "rgba(168,139,250,0.25)" : "rgba(168,139,250,0.10)",
          color: isRegs ? "#c4b5fd" : "#a78bfa",
          boxShadow: isRegs ? "0 0 0 1px rgba(167,139,250,0.35)" : "none",
        }}
      >
        ⚖
      </Link>

      {/* Pilot Exam ✎ */}
      <Link
        href="/ops/exam"
        title="Pilot Exam"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] transition-all"
        style={{
          background: isExam ? "rgba(251,191,36,0.25)" : "rgba(251,191,36,0.10)",
          color: isExam ? "#fde68a" : "#fbbf24",
          boxShadow: isExam ? "0 0 0 1px rgba(251,191,36,0.35)" : "none",
        }}
      >
        ✎
      </Link>

      {/* Pilot Checklist ✓ */}
      <Link
        href="/ops/checklist"
        title="Pilot Checklist"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] transition-all"
        style={{
          background: isChecklist ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.10)",
          color: isChecklist ? "#86efac" : "#34d399",
          boxShadow: isChecklist ? "0 0 0 1px rgba(52,211,153,0.35)" : "none",
        }}
      >
        ✓
      </Link>

      {/* Requirements ⊟ */}
      <Link
        href="/ops/requirements"
        title="Requirements"
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] transition-all"
        style={{
          background: isReqs ? "rgba(251,146,60,0.25)" : "rgba(251,146,60,0.10)",
          color: isReqs ? "#fdba74" : "#fb923c",
          boxShadow: isReqs ? "0 0 0 1px rgba(251,146,60,0.35)" : "none",
        }}
      >
        ⊟
      </Link>

      {/* Home icon */}
      <Link
        href="/ops"
        title="All Apps"
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
        style={{
          background: isHome ? "rgba(255,255,255,0.12)" : "transparent",
          color: isHome ? "#fff" : "rgba(255,255,255,0.4)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 6L7 1.5 12.5 6V13H9V9.5H5V13H1.5V6z" />
        </svg>
      </Link>

      <div style={{ width: 24, borderTop: "1px solid rgba(255,255,255,0.06)", margin: "2px 0" }} />

      {/* Section icons with flyouts */}
      {SECTIONS.map((section) => (
        <SectionRailItem
          key={section.key}
          section={section}
          isActive={activeSectionKey === section.key}
          pathname={pathname}
        />
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Site link */}
      <Link
        href="/"
        target="_blank"
        title="View site"
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 1.5H2a1 1 0 0 0-1 1v7.5a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V6.5M8.5 1.5h3v3M5.5 8l6-6" />
        </svg>
      </Link>

      {/* Logout */}
      <button
        onClick={onLogout}
        title="Sign out"
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 11H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h2M9 9l3-3-3-3M12 6.5H5" />
        </svg>
      </button>
    </div>
  );
}

// ── Root layout ────────────────────────────────────────────────────────────────

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const session = loadSession();
    if (session) {
      fetch("/api/ops/session", {
        headers: { Authorization: `Bearer ${session.token}` },
      }).then((res) => {
        if (res.ok) {
          setToken(session.token);
          setAuthed(true);
        } else {
          clearSession();
        }
      }).catch(() => clearSession());
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const events = ["click", "keydown", "scroll", "mousemove"] as const;
    let throttle = 0;
    const handler = () => {
      const now = Date.now();
      if (now - throttle < 30_000) return;
      throttle = now;
      touchSession();
    };
    events.forEach((ev) => window.addEventListener(ev, handler, { passive: true }));
    const interval = setInterval(() => {
      if (!loadSession()) {
        setAuthed(false);
        setToken("");
      }
    }, 60_000);
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler));
      clearInterval(interval);
    };
  }, [authed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/ops/session", {
      headers: { Authorization: `Bearer ${password}` },
    });
    if (!res.ok) {
      setError("Invalid password");
      setPassword("");
      clearSession();
      return;
    }
    setToken(password);
    setAuthed(true);
    saveSession(password);
    setPassword("");
    setError("");
  }

  function logout() {
    clearSession();
    setAuthed(false);
    setToken("");
  }

  if (!hydrated) {
    return <div className="min-h-screen" style={{ background: "#0d0d0d" }} />;
  }

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "#0d0d0d", fontFamily: SYSTEM_FONT }}
      >
        <form onSubmit={handleLogin} className="w-full max-w-[320px]">
          <div className="flex flex-col items-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 52 }} />
            <h1 className="text-white text-[16px] font-semibold mt-5">Ops Center</h1>
            <p className="text-white/35 text-[12px] mt-1">Sign in to continue</p>
          </div>
          {error && <p className="text-amber-400 text-[12px] mb-3 text-center">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-[13px] outline-none focus:border-cyan-400/40 mb-3 placeholder:text-white/20"
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 text-black font-semibold rounded-xl py-3 text-[13px] hover:bg-cyan-400 transition-colors"
          >
            Sign in
          </button>
          <p className="text-white/20 text-[11px] mt-5 text-center">
            Sessions expire after 24 h of inactivity.
          </p>
        </form>
      </div>
    );
  }

  return (
    <OpsContext.Provider value={{ token, logout }}>
      <div
        className="h-screen flex text-white overflow-hidden"
        style={{ background: "#0f0f0f", fontFamily: SYSTEM_FONT }}
      >
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile slide-over (full section list) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] flex-col lg:hidden transition-transform duration-200 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: 260, background: "#111", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-white/[0.06] px-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20 }} />
            <span className="text-white text-[13px] font-semibold">Ops Center</span>
          </div>
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-24 pt-3">
            <Link
              href="/ops/flight-assist"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 bg-cyan-500/10 text-cyan-400"
            >
              <span>⚡</span>
              <span className="text-[13px] font-semibold">Captain Panchi</span>
            </Link>
            <Link
              href="/ops/regs"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 bg-purple-500/10 text-purple-400"
            >
              <span>⚖</span>
              <span className="text-[13px] font-semibold">PCAR / RPAS Regulations</span>
            </Link>
            <Link
              href="/ops/exam"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 bg-amber-500/10 text-amber-300"
            >
              <span>✎</span>
              <span className="text-[13px] font-semibold">Pilot Exam</span>
            </Link>
            <Link
              href="/ops/checklist"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 bg-emerald-500/10 text-emerald-400"
            >
              <span>✓</span>
              <span className="text-[13px] font-semibold">Pilot Checklist</span>
            </Link>
            <Link
              href="/ops/requirements"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-3 bg-orange-500/10 text-orange-400"
            >
              <span>⊟</span>
              <span className="text-[13px] font-semibold">Requirements</span>
            </Link>
            <Link href="/ops" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-white/60 mb-2">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1.5 6L7 1.5 12.5 6V13H9V9.5H5V13H1.5V6z" />
              </svg>
              All Apps
            </Link>
            {SECTIONS.map((section) => (
              <div key={section.key} className="mb-3">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: `${section.color}80` }}>
                  {section.label}
                </p>
                {section.apps.map((app) => (
                  <Link
                    key={app.href}
                    href={app.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-white/60 hover:text-white hover:bg-white/[0.05]"
                  >
                    <span>{app.icon}</span>
                    <span>{app.label}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Icon rail — desktop only */}
        <div className="hidden lg:flex">
          <IconRail pathname={pathname} onLogout={logout} />
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Mobile top bar */}
          <header
            className="h-[52px] flex items-center justify-between px-4 border-b border-white/[0.06] shrink-0 lg:hidden"
            style={{ background: "#0d0d0d" }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 4.5h12M2 8h12M2 11.5h12" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 18 }} />
            <div className="w-8" />
          </header>

          <div className="flex-1 overflow-hidden">{children}</div>
        </div>

        <PanchiAssistant />
      </div>
    </OpsContext.Provider>
  );
}
