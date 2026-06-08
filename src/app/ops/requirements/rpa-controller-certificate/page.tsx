"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

const STEPS = [
  {
    n: 1,
    title: "Pass the CAAP Knowledge Test",
    detail: "Take the RPAS Controller Knowledge Test at CAAP. Fee: ₱230 per subject. The test covers air law, RPAS theory, airspace, meteorology, and navigation.",
    fee: "₱230/subject",
  },
  {
    n: 2,
    title: "Obtain Your Knowledge Test Report",
    detail: "After passing, secure your Knowledge Test Report from the examination office.",
    fee: "₱140",
  },
  {
    n: 3,
    title: "Complete RPAS Training",
    detail: "Complete an RPAS training course from your drone's manufacturer or a CAAP-recognized training provider. You must log a minimum of 5 flight hours outside of controlled airspace.",
    highlight: true,
  },
  {
    n: 4,
    title: "Prepare Your Documents",
    detail: "Gather all required documents (see checklist below). Ensure your CAAP Form 542 is fully accomplished, and your training certificate reflects the required minimum hours.",
  },
  {
    n: 5,
    title: "Submit Application & Pay Fee",
    detail: "Submit your complete application package to the Licensing and Certification Department (LCD). Pay the prescribed application fee of ₱3,360 at the CAAP Cashiering Office.",
    fee: "₱3,360",
    highlight: true,
  },
  {
    n: 6,
    title: "Demonstration Flight Before CAAP Inspector",
    detail: "Schedule and conduct a demonstration flight evaluated by a CAAP Aviation Safety Inspector. This verifies your practical competency to operate RPAS safely.",
    highlight: true,
  },
  {
    n: 7,
    title: "Claim Your RPC",
    detail: "After 5 working days, collect your RPA Controller Certificate (RPC) at the CAAP Annex Building, Old MIA Road, Pasay City. The certificate is valid for 5 years.",
    done: true,
  },
];

const CHECKLIST = [
  {
    category: "Application Form",
    color: "#a78bfa",
    items: [
      "CAAP Form 542 — fully accomplished",
    ],
  },
  {
    category: "Training & Experience",
    color: "#06b6d4",
    items: [
      "Training Certificate from manufacturer or CAAP-recognized provider",
      "Minimum 5 flight hours logged outside of controlled airspace",
    ],
  },
  {
    category: "Knowledge Test",
    color: "#fbbf24",
    items: [
      "CAAP Knowledge Test Result / Report",
    ],
  },
  {
    category: "RPA Documentation",
    color: "#34d399",
    items: [
      "Technical specifications / documentation of your RPA",
      "Photographs of your RPA showing the serial number",
    ],
  },
  {
    category: "Personal Documents",
    color: "#f472b6",
    items: [
      "2 pcs. 1×1 ID photos (white background)",
    ],
  },
];

export default function RpaControllerCertificatePage() {
  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: SYSTEM_FONT, background: "#0f0f0f" }}
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5 text-[11px] text-white/25 mb-3">
          <Link href="/ops/requirements" className="hover:text-white/60 transition-colors">Requirements</Link>
          <span>›</span>
          <span className="text-white/50">RPA Controller Certificate</span>
        </div>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0 mt-0.5"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}
          >
            ⊛
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-white">RPA Controller Certificate</h1>
            <p className="text-[11px] text-white/35">Remote Pilot Certificate (RPC) · Licensing and Certification Department, CAAP</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Who needs it */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.2)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Who Must Hold an RPC</p>
          <ul className="space-y-1.5 text-[13px] text-white/70 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">●</span>
              <span><strong className="text-white">All remote pilots conducting commercial RPAS operations</strong> must hold a valid CAAP RPA Controller Certificate (RPC).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 shrink-0">●</span>
              <span><strong className="text-white">Minimum age: 18 years old.</strong> Applicants must also be medically fit to operate RPAS safely.</span>
            </li>
          </ul>
        </div>

        {/* Contact card */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">Concerned Office</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Department</p>
              <p className="text-[12.5px] text-white/80">Licensing and Certification Department</p>
              <p className="text-[11px] text-white/40">LCD, CAAP Annex Building</p>
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-[12.5px]" style={{ color: "#a78bfa" }}>lcd@caap.gov.ph</p>
              <p className="text-[11px] text-white/40">Old MIA Road, Pasay City</p>
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Telephone</p>
              <p className="text-[12.5px] text-white/80">(02) 8246-4988</p>
              <p className="text-[11px] text-white/40">Local 2121</p>
            </div>
          </div>
        </div>

        {/* Fees row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { amount: "₱230", label: "Knowledge Test", sub: "per subject" },
            { amount: "₱140", label: "Test Report", sub: "knowledge test report" },
            { amount: "₱3,360", label: "Application Fee", sub: "paid at CAAP cashier" },
          ].map((f) => (
            <div
              key={f.label}
              className="rounded-2xl p-3.5 text-center"
              style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}
            >
              <p className="text-[20px] font-bold leading-none" style={{ color: "#fbbf24" }}>{f.amount}</p>
              <p className="text-[11px] font-semibold text-white mt-1">{f.label}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{f.sub}</p>
            </div>
          ))}
        </div>

        {/* Validity */}
        <div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <div className="text-[28px] shrink-0">⊙</div>
          <div>
            <p className="text-[12.5px] font-semibold text-white">Valid for 5 Years</p>
            <p className="text-[11.5px] text-white/45 mt-0.5">The RPC must be renewed before expiry. Carry the certificate during all commercial drone operations.</p>
          </div>
        </div>

        {/* 7-step process */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">Process</p>
          <div className="relative">
            <div className="absolute left-[18px] top-8 bottom-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="space-y-3">
              {STEPS.map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div
                    className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={
                      step.done
                        ? { background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399" }
                        : step.highlight
                        ? { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }
                        : { background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }
                    }
                  >
                    {step.done ? "✓" : step.n}
                  </div>
                  <div
                    className="flex-1 min-w-0 rounded-xl p-3.5 mb-1"
                    style={
                      step.done
                        ? { background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)" }
                        : step.highlight
                        ? { background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }
                        : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold text-white leading-snug">{step.title}</p>
                      {step.fee && (
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                        >
                          {step.fee}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-white/50 mt-1 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">Document Checklist</p>
          <div className="space-y-3">
            {CHECKLIST.map((group) => (
              <div
                key={group.category}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="px-4 py-2.5 flex items-center gap-2"
                  style={{ background: `${group.color}10`, borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: group.color }} />
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: group.color }}>
                    {group.category}
                  </p>
                </div>
                <div className="divide-y" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" }}>
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center text-[9px] shrink-0 mt-0.5"
                        style={{ background: `${group.color}15`, border: `1px solid ${group.color}30`, color: group.color }}
                      >
                        ○
                      </div>
                      <p className="text-[12.5px] text-white/65 leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source note */}
        <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] text-white/30 leading-relaxed">
            Source: <span className="text-white/45">caap.gov.ph</span> · Civil Aviation Authority of the Philippines · Licensing and Certification Department (LCD)
          </p>
        </div>

      </div>
    </div>
  );
}
