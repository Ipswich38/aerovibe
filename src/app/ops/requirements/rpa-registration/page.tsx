"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

const STEPS = [
  {
    n: 1,
    title: "Submit Letter of Request for RPA Marking Reservation",
    detail: "Address the letter to the Flight Standards Inspectorate Service. Indicate the Model and Serial Number of your RPA.",
  },
  {
    n: 2,
    title: "Await Letter-Approval from CAAP",
    detail: "CAAP will issue a letter indicating your assigned RPA Registration Marking (RP-U format).",
  },
  {
    n: 3,
    title: "Secure Order of Payment Slip (OPS)",
    detail: "Obtain the OPS from a Registration Officer of the Aircraft Registration Section, Airworthiness Department. You may also request via email: aircraftreg@caap.gov.ph",
    highlight: true,
  },
  {
    n: 4,
    title: "Pay the Prescribed Fee",
    detail: "Bring your OPS to the CAAP Cashiering Office and pay ₱1,500 + 12% VAT (₱1,680 total).",
    fee: "₱1,680",
  },
  {
    n: 5,
    title: "Submit All Required Documents",
    detail: "Submit the complete document checklist below. The Airworthiness Department will evaluate and verify all submitted documents.",
  },
  {
    n: 6,
    title: "CAAP Reviews Your Documents",
    detail: "If all documents are satisfactory, you will be scheduled for an RPA inspection. If any document is insufficient or immaterial, CAAP will notify you of the deficiency.",
  },
  {
    n: 7,
    title: "RPA Physical Inspection",
    detail: "The AWD verifies your RPA serial number and inspects the placement, material, and durability of your registration marking. The marking must be waterproof and made of weather-resistant inks, paints, or permanent stickers. A fee may be charged for on-site inspection.",
    highlight: true,
  },
  {
    n: 8,
    title: "Document Processing & Finalization",
    detail: "After the inspection, all documents are processed to finalize your RPA registration.",
  },
  {
    n: 9,
    title: "Claim Your RPA Certificate of Registration",
    detail: "Collect your Certificate of Registration at the Airworthiness Department.",
  },
  {
    n: 10,
    title: "Registration Complete",
    detail: "Your RPA is officially registered with CAAP. The Certificate of Registration (UCR) must be carried during all flights.",
    done: true,
  },
];

const CHECKLIST = [
  {
    category: "Core Forms",
    color: "#06b6d4",
    items: [
      "Notarized Registration Form (CAAP Form 1028-1)",
      "CAAP Prescribed fees and/or penalty",
      "Letter of Intent",
    ],
  },
  {
    category: "Marking Reservation",
    color: "#a78bfa",
    items: [
      "Copy of Letter-request for the reservation of RPAS Registration Marking",
      "Copy of Letter-approval issued by CAAP for the reservation of RPAS Registration Marking",
      "Colored photograph of the RPAS with Philippine Registration Marking",
    ],
  },
  {
    category: "Proof of Ownership",
    color: "#fbbf24",
    items: [
      "Documentary Evidence of Ownership",
      "Invoice",
      "Affidavit of Ownership",
      "History of Ownership (if the aircraft was not purchased from the registered owner)",
    ],
  },
  {
    category: "Supporting Documents (if applicable)",
    color: "#f472b6",
    items: [
      "Secretary's Certificate",
      "Special Power of Attorney",
      "Import Document",
      "DTI Certificate or Corporation Documents (SEC)",
    ],
  },
  {
    category: "CAAP Certificates",
    color: "#34d399",
    items: [
      "RPAS Operator Certificate (ROC)",
      "Certificate of Authorization",
      "Other related CAAP certificates",
    ],
  },
  {
    category: "Insurance & Specifications",
    color: "#fb923c",
    items: [
      "Insurance Policy (RPA, controller, third-party liability)",
      "Documents stating the specifications of your RPA",
    ],
  },
];

export default function RpaRegistrationPage() {
  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: SYSTEM_FONT, background: "#0f0f0f" }}
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-white/25 mb-3">
          <Link href="/ops/requirements" className="hover:text-white/60 transition-colors">Requirements</Link>
          <span>›</span>
          <span className="text-white/50">RPA Registration</span>
        </div>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0 mt-0.5"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" }}
          >
            ⊟
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-white">RPA Registration</h1>
            <p className="text-[11px] text-white/35">Remotely Piloted Aircraft Registration · Airworthiness Department, CAAP</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Who needs to register */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#06b6d4" }}>Who Must Register</p>
          <ul className="space-y-1.5 text-[13px] text-white/70 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">●</span>
              <span><strong className="text-white">All RPAs used for commercial operations</strong>, regardless of weight, must be registered with CAAP.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 shrink-0">●</span>
              <span><strong className="text-white">Non-commercial Large RPAs (≥ 7 kg gross weight)</strong> must also be registered — including custom-built drones and drones built from a kit or off-the-shelf.</span>
            </li>
          </ul>
          <p className="text-[11.5px] text-white/40 mt-1">
            Users are held accountable for all activities involving the RPAs registered under their names.
          </p>
        </div>

        {/* Contact card */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">Concerned Office</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Department</p>
              <p className="text-[12.5px] text-white/80">Airworthiness Department</p>
              <p className="text-[11px] text-white/40">Flight Standards Inspectorate Service, CAAP</p>
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Email</p>
              <p className="text-[12.5px]" style={{ color: "#06b6d4" }}>awd@caap.gov.ph</p>
              <p className="text-[11px] text-white/40">aircraftreg@caap.gov.ph <span className="text-white/20">(for OPS requests)</span></p>
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Telephone</p>
              <p className="text-[12.5px] text-white/80">(02) 8246-4988</p>
              <p className="text-[11px] text-white/40">Local 2113</p>
            </div>
          </div>
        </div>

        {/* Fee callout */}
        <div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <div className="text-center shrink-0">
            <p className="text-[26px] font-bold leading-none" style={{ color: "#fbbf24" }}>₱1,680</p>
            <p className="text-[10px] text-white/35 mt-0.5">₱1,500 + 12% VAT</p>
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-white">Registration Fee</p>
            <p className="text-[11.5px] text-white/45 mt-0.5">Paid at the CAAP Cashiering Office. Bring your Order of Payment Slip. Additional fee may apply for on-site inspection.</p>
          </div>
        </div>

        {/* 10-step process */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">Process</p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-8 bottom-8 w-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            <div className="space-y-3">
              {STEPS.map((step) => (
                <div key={step.n} className="flex gap-4">
                  {/* Step number */}
                  <div
                    className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={
                      step.done
                        ? { background: "rgba(52,211,153,0.2)", border: "1px solid rgba(52,211,153,0.4)", color: "#34d399" }
                        : step.highlight
                        ? { background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.35)", color: "#fbbf24" }
                        : { background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)", color: "#06b6d4" }
                    }
                  >
                    {step.done ? "✓" : step.n}
                  </div>

                  {/* Content */}
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

        {/* Document checklist */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">Document Checklist</p>
          <div className="space-y-3">
            {CHECKLIST.map((group) => (
              <div
                key={group.category}
                className="rounded-2xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Group header */}
                <div
                  className="px-4 py-2.5 flex items-center gap-2"
                  style={{ background: `${group.color}10`, borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: group.color }} />
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: group.color }}>
                    {group.category}
                  </p>
                </div>

                {/* Items */}
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
            Source: <span className="text-white/45">caap.gov.ph/rpa-registration-2</span> · Civil Aviation Authority of the Philippines · Airworthiness Department
          </p>
        </div>

      </div>
    </div>
  );
}
