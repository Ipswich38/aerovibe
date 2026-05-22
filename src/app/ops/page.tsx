"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

interface AppCard {
  href: string;
  label: string;
  icon: string;
  desc: string;
}

interface AppSection {
  label: string;
  color: string;
  apps: AppCard[];
}

const SECTIONS: AppSection[] = [
  {
    label: "Field Ops",
    color: "#06b6d4",
    apps: [
      { href: "/ops/missions", label: "Missions", icon: "◇", desc: "Plan & track drone missions" },
      { href: "/ops/flights", label: "Flights", icon: "✈", desc: "Flight logs & airtime records" },
      { href: "/ops/checklist", label: "Pilot Checklist", icon: "✓", desc: "Pre-flight, post-flight & safety logs" },
      { href: "/ops/map", label: "Map", icon: "◎", desc: "Live map & zone planning" },
      { href: "/ops/surveys", label: "Surveys", icon: "▣", desc: "Area surveys & site reports" },
    ],
  },
  {
    label: "Gear",
    color: "#f97316",
    apps: [
      { href: "/ops/drone",  label: "Drone Parts", icon: "◈", desc: "Mini 5 Pro & RC-N3 parts breakdown" },
      { href: "/ops/manual", label: "User Manual",  icon: "≡", desc: "DJI Mini 5 Pro manual reference" },
    ],
  },
  {
    label: "Studio",
    color: "#a78bfa",
    apps: [
      { href: "/ops/luts", label: "LUTs", icon: "⊞", desc: "DJI Mini 5 Pro color LUTs" },
    ],
  },
  {
    label: "Manage",
    color: "#34d399",
    apps: [
      { href: "/ops/calendar", label: "Calendar", icon: "▥", desc: "Schedule & availability" },
      { href: "/ops/projects", label: "Projects", icon: "▦", desc: "Active jobs & milestones" },
      { href: "/ops/activity", label: "Activity", icon: "◷", desc: "Recent actions & timeline" },
    ],
  },
  {
    label: "Marketing",
    color: "#fbbf24",
    apps: [
      { href: "/ops/blitz", label: "Blitz", icon: "◐", desc: "Campaigns & content launch" },
    ],
  },
  {
    label: "CRM",
    color: "#f472b6",
    apps: [
      { href: "/ops/leads", label: "Leads", icon: "⌕", desc: "Prospect pipeline" },
      { href: "/ops/clients", label: "Clients", icon: "◉", desc: "Client records & contacts" },
      { href: "/ops/contracts", label: "Contracts", icon: "✎", desc: "Agreements & sign-offs" },
    ],
  },
  {
    label: "Finance",
    color: "#4ade80",
    apps: [
      { href: "/ops/wavi", label: "Wavi", icon: "₩", desc: "Wallet & financial overview" },
      { href: "/ops/invoices", label: "Invoices", icon: "₱", desc: "Billing & payment tracking" },
      { href: "/ops/books", label: "Books", icon: "≡", desc: "Accounting & expenses" },
    ],
  },
  {
    label: "Inbox",
    color: "#60a5fa",
    apps: [
      { href: "/ops/inbox", label: "Messages", icon: "✉", desc: "Client & team messages" },
    ],
  },
];

export default function OpsHome() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "#0f0f0f", fontFamily: SYSTEM_FONT }}
    >
      <div className="max-w-[960px] mx-auto px-8 py-10">

        {/* Header */}
        <div className="mb-10">
          <p className="text-white/25 text-[12px] mb-1.5">{dateStr}</p>
          <h1 className="text-white text-[26px] font-semibold tracking-tight leading-none">
            {greeting}
          </h1>
          <p className="text-white/35 text-[13px] mt-2">
            waevpoint ops — ready to fly
          </p>
        </div>

        {/* Captain Panchi hero card */}
        <Link href="/ops/flight-assist" className="block mb-10 group">
          <div
            className="relative rounded-2xl overflow-hidden p-6 flex items-center gap-5 transition-opacity group-hover:opacity-90"
            style={{
              background: "linear-gradient(130deg, #0a2535 0%, #0d1b30 100%)",
              border: "1px solid rgba(6,182,212,0.18)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-[26px] shrink-0"
              style={{ background: "rgba(6,182,212,0.12)" }}
            >
              ⚡
            </div>
            <div className="min-w-0">
              <p className="text-cyan-400/70 text-[10px] font-semibold uppercase tracking-[0.12em] mb-1">
                AI Flight Assistant
              </p>
              <h2 className="text-white text-[17px] font-semibold leading-snug">
                Captain Panchi
              </h2>
              <p className="text-white/45 text-[13px] mt-0.5 leading-snug">
                Flight planning, weather briefings & airspace intelligence
              </p>
            </div>
            <div className="ml-auto shrink-0 text-cyan-400/40 group-hover:text-cyan-400/70 transition-colors">
              <svg
                width="18" height="18" viewBox="0 0 18 18" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M4 9h10M9 4l5 5-5 5" />
              </svg>
            </div>
          </div>
        </Link>

        <div className="grid gap-3 mb-10 md:grid-cols-2">
          <Link href="/ops/regs" className="group block">
            <div
              className="rounded-2xl p-5 transition-opacity group-hover:opacity-90"
              style={{ background: "rgba(168,139,250,0.08)", border: "1px solid rgba(168,139,250,0.18)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px]" style={{ background: "rgba(168,139,250,0.13)" }}>
                  ⚖
                </div>
                <div>
                  <p className="text-purple-300/70 text-[10px] font-semibold uppercase tracking-[0.12em]">Reference</p>
                  <h2 className="text-white text-[14px] font-semibold">PCAR / RPAS Regulations</h2>
                </div>
              </div>
              <p className="text-white/40 text-[12px] mt-3 leading-relaxed">
                CAAP rules, licensing, registration, operational limits, zones, and enforcement.
              </p>
            </div>
          </Link>
          <Link href="/ops/exam" className="group block">
            <div
              className="rounded-2xl p-5 transition-opacity group-hover:opacity-90"
              style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.18)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px]" style={{ background: "rgba(251,191,36,0.13)" }}>
                  ✎
                </div>
                <div>
                  <p className="text-amber-300/70 text-[10px] font-semibold uppercase tracking-[0.12em]">Practice</p>
                  <h2 className="text-white text-[14px] font-semibold">Pilot Exam</h2>
                </div>
              </div>
              <p className="text-white/40 text-[12px] mt-3 leading-relaxed">
                Situational, theoretical, practical reviewer, and actual field skill test prep.
              </p>
            </div>
          </Link>
        </div>

        {/* App grid */}
        <div className="space-y-9">
          {SECTIONS.map((section) => (
            <div key={section.label}>
              {/* Section label */}
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-[5px] h-[5px] rounded-full shrink-0"
                  style={{ background: section.color }}
                />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: `${section.color}99` }}
                >
                  {section.label}
                </span>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {section.apps.map((app) => (
                  <Link key={app.href} href={app.href} className="group">
                    <div
                      className="p-4 rounded-xl border border-white/[0.06] transition-all group-hover:border-white/[0.11] group-hover:bg-white/[0.02] cursor-pointer"
                      style={{ background: "#161616" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] mb-3.5 transition-transform group-hover:scale-105"
                        style={{ background: `${section.color}14` }}
                      >
                        <span style={{ color: section.color }}>{app.icon}</span>
                      </div>
                      <p className="text-white text-[13px] font-medium leading-tight">
                        {app.label}
                      </p>
                      <p className="text-white/30 text-[11px] mt-0.5 leading-snug">
                        {app.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-white/15 text-[11px]">
            waevpoint ops · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
