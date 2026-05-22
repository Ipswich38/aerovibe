"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

function SectionRef({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
      style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.22)" }}
    >
      {label}
    </span>
  );
}

function Rule({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-[3px] shrink-0 w-3.5 h-3.5 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
        <svg width="7" height="6" viewBox="0 0 8 6" fill="none">
          <path d="M1 3l2 2 4-4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div>
        <p className="text-[13px] text-white/70 leading-snug">{children}</p>
        {note && <p className="text-[11.5px] text-white/35 mt-0.5 leading-snug">{note}</p>}
      </div>
    </li>
  );
}

function Card({ title, children, section }: { title: string; children: React.ReactNode; section?: string }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        {section && <SectionRef label={section} />}
        <p className="text-[13px] font-semibold text-white">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function Part4Page() {
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
          <span className="text-white/55">Part 4</span>
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
              >
                PCAR Part 4
              </span>
            </div>
            <h1 className="text-[18px] font-bold text-white leading-snug">
              Aircraft Registration and Marking
            </h1>
            <p className="text-[12px] text-white/35 mt-1">
              Philippine Civil Aviation Regulations · RPAS Provisions · §4.3.1.12
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
        <div className="max-w-3xl space-y-5">

          {/* Legal basis */}
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.16)" }}
          >
            <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5A6.5 6.5 0 1 1 8 14.5A6.5 6.5 0 0 1 8 1.5z" />
              <path d="M8 7v4M8 5v.5" />
            </svg>
            <p className="text-[12.5px] text-white/60 leading-relaxed">
              Consistent with <strong className="text-white">R.A. 9497</strong> and <strong className="text-white">PCAR Part 4</strong>, all large RPA and other RPA required to be registered shall bear the registration markings <strong className="text-amber-300">"RP-U"</strong> followed by the assigned number 001 to 999, followed by a letter from A to Z.
            </p>
          </div>

          {/* Registration mark format */}
          <Card title="Registration Mark Format" section="§4.3.1.12">
            <div className="flex items-center justify-center gap-2 py-5 mb-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              {[
                { part: "RP-U", desc: "Nationality mark", color: "#06b6d4" },
                { part: "001–999", desc: "Assigned number", color: "#fbbf24" },
                { part: "A–Z", desc: "Assigned letter", color: "#a78bfa" },
              ].map((seg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-center">
                    <div
                      className="text-[22px] font-black tracking-tight px-3 py-1.5 rounded-lg"
                      style={{ color: seg.color, background: `${seg.color}12`, border: `1px solid ${seg.color}25`, fontFamily: "monospace" }}
                    >
                      {seg.part}
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">{seg.desc}</p>
                  </div>
                  {i < 2 && <span className="text-white/20 text-[20px] font-light mb-4">·</span>}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-white/40 text-center">
              Example: <span className="font-mono text-white/70">RP-U001A</span>
            </p>
          </Card>

          {/* Placement requirements */}
          <Card title="Where to Place the Registration Mark" section="§4.3.1.12">
            <ul className="space-y-3">
              <Rule note="All RPAs with an installable ECM must comply with this placement requirement.">
                Must be located on the <strong className="text-white">visible side of the Electronic Control Module (ECM)</strong>
              </Rule>
              <Rule note="Applies when the ECM is fixed or embedded in these areas.">
                Alternatively placed on the <strong className="text-white">fuselage and/or wing area</strong>
              </Rule>
            </ul>
          </Card>

          {/* Size and material */}
          <Card title="Size and Material Requirements" section="§4.3.1.12">
            <ul className="space-y-3">
              <Rule>
                Size of registration marks must be <strong className="text-white">proportionate to the RPA or ECM</strong> — no fixed minimum, but must be clearly legible
              </Rule>
              <Rule>
                Must be made of <strong className="text-white">waterproof, weather-resistant inks, paints, or sticker (decal)</strong> — not paper labels or tape
              </Rule>
            </ul>
          </Card>

          {/* Quick reference */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Quick Reference — Registration Requirements</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  label: "Who needs to register?",
                  value: "All large RPA (≥7 kg) and other RPAs required by CAAP",
                  color: "#fbbf24",
                },
                {
                  label: "What mark format?",
                  value: "RP-U + number (001–999) + letter (A–Z)",
                  color: "#06b6d4",
                },
                {
                  label: "Where to place it?",
                  value: "Visible side of ECM, or fuselage / wing area",
                  color: "#a78bfa",
                },
                {
                  label: "What material?",
                  value: "Waterproof, weather-resistant ink, paint, or decal",
                  color: "#34d399",
                },
                {
                  label: "What size?",
                  value: "Proportionate to the RPA or ECM — clearly legible",
                  color: "#f472b6",
                },
                {
                  label: "Must carry during flight?",
                  value: "Yes — UAS Certificate of Registration (UCR) required on every flight",
                  color: "#f87171",
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="rounded-xl p-3.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <p className="text-[10.5px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: r.color }}>
                    {r.label}
                  </p>
                  <p className="text-[12.5px] text-white/65 leading-snug">{r.value}</p>
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
            <p className="text-[12.5px] text-white/60 leading-relaxed">
              The DJI Mini 5 Pro weighs <strong className="text-white">248 g</strong> — well below the 7 kg threshold for mandatory registration.
              For <strong className="text-white">recreational use</strong>, no CAAP registration or RP-U marking is required.
              For <strong className="text-amber-400">commercial use</strong>, registration applies regardless of weight, and you must carry your UCR on every flight.
            </p>
          </div>

          {/* Footer citation */}
          <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[11px] text-white/20 leading-relaxed">
              Source: PCAR Part 4 — Aircraft Registration and Marking · §4.3.1.12 Registration for RPA · Civil Aviation Authority of the Philippines (CAAP) · Republic Act 9497
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
