"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

function CheckIcon() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30">
      <svg width="10" height="9" viewBox="0 0 10 9" fill="none">
        <path d="M1.5 4.5l2.5 2.5 4.5-5" stroke="#34d399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function CloseIcon() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/12 border border-red-500/25">
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="#f87171" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25 pt-5 pb-1 px-1">
      {children}
    </p>
  );
}

interface Row {
  cert: string;
  commercial: "yes" | "no" | "conditional";
  noncommercial: "yes" | "no" | "conditional";
  note?: string;
  commercialNote?: string;
  noncommercialNote?: string;
}

const ROWS: Row[] = [
  {
    cert: "Drone Registration",
    commercial: "yes",
    noncommercial: "conditional",
    noncommercialNote: "Required only for drones weighing 7 kg or above.",
  },
  {
    cert: "Controller Certificate",
    commercial: "yes",
    noncommercial: "conditional",
    noncommercialNote: "Required only for drones weighing 7 kg or above.",
  },
  {
    cert: "RPAS Operator Certificate",
    commercial: "yes",
    noncommercial: "conditional",
    noncommercialNote: "Required only for drones weighing 7 kg or above.",
  },
  {
    cert: "Special Flight Permit",
    commercial: "conditional",
    noncommercial: "conditional",
    commercialNote: "Required for: night operations, BVLOS, within 10 km of ARP, over populated areas, and above 400 ft AGL.",
    noncommercialNote: "Required for: night operations, BVLOS, within 10 km of ARP, over populated areas, and above 400 ft AGL.",
  },
];

function CellStatus({
  status,
  note,
}: {
  status: "yes" | "no" | "conditional";
  note?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {status === "yes" && <CheckIcon />}
      {status === "no" && <CloseIcon />}
      {status === "conditional" && (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/12 border border-amber-500/25">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M4.5 2v2.5M4.5 6.5v.1" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      )}
      {note && (
        <p className="text-[11px] leading-snug max-w-[160px]"
          style={{ color: status === "no" ? "rgba(248,113,113,0.8)" : status === "conditional" ? "rgba(251,191,36,0.8)" : "rgba(52,211,153,0.8)" }}>
          {note}
        </p>
      )}
    </div>
  );
}

export default function Part2Page() {
  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: SYSTEM_FONT, background: "#0f0f0f" }}
    >
      {/* Header */}
      <div
        className="shrink-0 px-6 pt-6 pb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-1.5 text-[11px] text-white/30 mb-3">
          <Link href="/ops/regs" className="hover:text-white/60 transition-colors">
            PCAR / RPAS Regulations
          </Link>
          <span>/</span>
          <span className="text-white/55">Part 2</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}
              >
                PCAR Part 2
              </span>
            </div>
            <h1 className="text-[18px] font-bold text-white leading-snug">
              Types of Operations
            </h1>
            <p className="text-[12px] text-white/35 mt-1">
              Personnel Licensing · Commercial vs. Non-Commercial · Certificates Required
            </p>
          </div>

          <Link
            href="/ops/regs"
            className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-white/70 transition-colors shrink-0 mt-1"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 9L4.5 6l3-3" />
            </svg>
            Back to Regulations
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl space-y-6">

          {/* Intro */}
          <p className="text-[13px] text-white/55 leading-relaxed">
            The Civil Aviation Authority of the Philippines has promulgated rules and regulations for the safe operation of commercial and non-commercial Remotely Piloted Aircraft Systems in the Philippines, covering general RPA operations, required certificates, penalties, and fines.
          </p>

          {/* Type cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Commercial */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.18)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h2 className="text-[14px] font-bold text-emerald-400 uppercase tracking-wide">Commercial</h2>
              </div>
              <p className="text-[13px] text-white/60 leading-relaxed">
                Activities that require the use of drone/s <strong className="text-white">for revenue purposes</strong> — paid shoots, real estate, events, inspections, surveys, or any activity in furtherance of a business.
              </p>
              <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.12)" }}>
                <p className="text-[11px] font-semibold text-emerald-400 mb-1">Full certification required</p>
                <p className="text-[11px] text-white/45">Registration · Controller Certificate · Operator Certificate</p>
              </div>
            </div>

            {/* Non-Commercial */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.18)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <h2 className="text-[14px] font-bold text-blue-400 uppercase tracking-wide">Non-Commercial</h2>
              </div>
              <p className="text-[13px] text-white/60 leading-relaxed">
                Activities where drones are used <strong className="text-white">for sports or recreational purposes</strong> — no compensation, no revenue, not in furtherance of any business.
              </p>
              <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.12)" }}>
                <p className="text-[11px] font-semibold text-blue-400 mb-1">Minimal requirements</p>
                <p className="text-[11px] text-white/45">Most certificates only required if drone weighs 7 kg or above</p>
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div>
            <SectionLabel>Certificates Required</SectionLabel>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {/* Table header */}
              <div
                className="grid grid-cols-3 text-[11px] font-bold uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="px-5 py-3 text-white/30">Certificate</div>
                <div className="px-4 py-3 text-center text-emerald-400/70">Commercial</div>
                <div className="px-4 py-3 text-center text-blue-400/70">Non-Commercial</div>
              </div>

              {/* Rows */}
              {ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 items-start"
                  style={{
                    borderBottom: i < ROWS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  }}
                >
                  {/* Label */}
                  <div className="px-5 py-4">
                    <p className="text-[13px] font-semibold text-white leading-snug">{row.cert}</p>
                    {row.cert === "Special Flight Permit" && (
                      <p className="text-[11px] text-white/35 mt-1 leading-snug">
                        Applies to both operation types under specific conditions.
                      </p>
                    )}
                  </div>

                  {/* Commercial cell */}
                  <div className="px-4 py-4 flex justify-center">
                    <CellStatus
                      status={row.commercial}
                      note={row.commercialNote}
                    />
                  </div>

                  {/* Non-commercial cell */}
                  <div className="px-4 py-4 flex justify-center">
                    <CellStatus
                      status={row.noncommercial}
                      note={row.noncommercialNote}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 mt-3 px-1 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[11px] text-white/40">Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CloseIcon />
                <span className="text-[11px] text-white/40">Not required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/12 border border-amber-500/25">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M4.5 2v2.5M4.5 6.5v.1" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-[11px] text-white/40">Conditional — see note</span>
              </div>
            </div>
          </div>

          {/* Special Flight Permit callout */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.18)" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-purple-400 mb-3">
              Special Flight Permit — When Required (Both Operation Types)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Flying at night",
                "Beyond Visual Line of Sight (BVLOS)",
                "Within 10 km of an Aerodrome Reference Point (ARP)",
                "Over populated areas",
                "Above 400 ft AGL",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <span className="mt-[3px] shrink-0 w-3.5 h-3.5 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                    <svg width="7" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3l2 2 4-4" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[12.5px] text-white/65">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DJI Mini 5 Pro callout */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)" }}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-2">
              Your Drone — DJI Mini 5 Pro (248 g)
            </p>
            <div className="space-y-2 text-[12.5px] text-white/60 leading-relaxed">
              <p>
                <span className="text-emerald-400 font-semibold">Recreational use:</span>{" "}
                Sub-250 g and sub-7 kg — no registration, no controller certificate, no operator certificate required. Just fly safely within the operational rules.
              </p>
              <p>
                <span className="text-amber-400 font-semibold">Commercial use:</span>{" "}
                Requires all three certificates — Drone Registration, Controller Certificate, and RPAS Operator Certificate — plus insurance.
              </p>
              <p>
                <span className="text-purple-400 font-semibold">Either use:</span>{" "}
                A Special Flight Permit is required any time you fly at night, BVLOS, within 10 km of an airport, over populated areas, or above 400 ft AGL.
              </p>
            </div>
          </div>

          {/* Footer citation */}
          <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[11px] text-white/20 leading-relaxed">
              Source: CAAP Types of Operations — caap.gov.ph/types-of-operations · PCAR Part 2 — Personnel Licensing · Civil Aviation Authority of the Philippines · Republic Act 9497
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
