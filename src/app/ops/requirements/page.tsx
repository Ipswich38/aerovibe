"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

const PAGES = [
  {
    href: "/ops/requirements/rpa-registration",
    icon: "⊟",
    color: "#06b6d4",
    title: "RPA Registration",
    desc: "Step-by-step process and document checklist for registering your drone with CAAP Airworthiness Department.",
    badge: "CAAP · Airworthiness",
    available: true,
  },
  {
    href: "/ops/requirements/rpa-controller-certificate",
    icon: "⊛",
    color: "#a78bfa",
    title: "RPA Controller Certificate",
    desc: "Requirements and application process for the CAAP RPA Controller Certificate (RPC) — required for all commercial remote pilots.",
    badge: "CAAP · LCD",
    available: true,
  },
  {
    href: "/ops/requirements/rpas-operator-certificate",
    icon: "⊞",
    color: "#fbbf24",
    title: "RPAS Operator Certificate",
    desc: "Full 5-phase COA certification process and document checklist for commercial drone operators under AC 001-2025.",
    badge: "CAAP · AWOCID",
    available: true,
  },
  {
    href: "/ops/requirements/forms",
    icon: "⊘",
    color: "#f472b6",
    title: "CAAP Forms",
    desc: "Download official CAAP forms required for RPA registration, controller certificate, and operator certificate applications.",
    badge: "CAAP · Forms",
    available: true,
  },
];

export default function RequirementsPage() {
  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: SYSTEM_FONT, background: "#0f0f0f" }}
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <span className="text-[22px]">⊟</span>
          <div>
            <h1 className="text-[17px] font-bold text-white">Requirements</h1>
            <p className="text-[11px] text-white/35">CAAP Philippines · Official application processes & document checklists</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
          {PAGES.map((p) => (
            <div key={p.href}>
              {p.available ? (
                <Link
                  href={p.href}
                  className="flex flex-col gap-3 p-5 rounded-2xl transition-all group"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0"
                      style={{ background: `${p.color}15`, border: `1px solid ${p.color}30`, color: p.color }}
                    >
                      {p.icon}
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}30` }}
                    >
                      {p.badge}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white mb-1">{p.title}</p>
                    <p className="text-[12px] text-white/45 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: p.color }}>
                    View guide
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 5h5M5 2.5L7.5 5 5 7.5" />
                    </svg>
                  </div>
                </Link>
              ) : (
                <div
                  className="flex flex-col gap-3 p-5 rounded-2xl opacity-40"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.25)" }}
                    >
                      {p.icon}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30">
                      {p.badge}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white/50 mb-1">{p.title}</p>
                    <p className="text-[12px] text-white/25 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
