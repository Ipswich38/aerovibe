"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

const PHASES = [
  {
    n: "I",
    title: "Pre-Application",
    color: "#06b6d4",
    steps: [
      {
        label: "Declaration of Intent",
        detail: "Submit a Letter of Intent to the ADG-II, FSIS, CAAP, together with the Pre-Application Statement of Intent (PASI) form. The PASI form is available on the CAAP website.",
      },
      {
        label: "Assignment of Certification Team",
        detail: "CAAP assigns a Certification Project Manager (CPM) and an Aviation Safety Inspector (ASI) as your dedicated team throughout the process.",
      },
      {
        label: "Pre-Application Meeting",
        detail: "Attend a pre-application meeting to get guidance on PCAR Part 11 requirements, type of operation, Schedule of Events, RCC, and Operations Manual standards.",
      },
      {
        label: "Schedule of Events & RCC",
        detail: "Prepare a Schedule of Events listing all activities, aircraft/facility acquisitions, and target dates for CAAP review. Receive and study the Regulations Compliance Checklist (RCC) template.",
      },
    ],
  },
  {
    n: "II",
    title: "Formal Application",
    color: "#a78bfa",
    steps: [
      {
        label: "Submit Formal Application Package",
        detail: "Submit a formal application letter containing: full official name, signed by owner/officer/all partners, physical operating location, key management personnel (accountable manager, chief remote pilot, remote pilots, VO, maintenance staff).",
      },
      {
        label: "Application Review Meeting",
        detail: "CAAP Certification Team reviews completeness and general compliance. If incomplete or unacceptable, the package is returned with written explanation.",
      },
      {
        label: "Acceptance / Rejection",
        detail: "CAAP formally accepts or rejects the application in writing. Acceptance moves the process to Phase III. Rejection allows resubmission after addressing deficiencies.",
      },
    ],
  },
  {
    n: "III",
    title: "Document Conformance / Compliance",
    color: "#fbbf24",
    steps: [
      {
        label: "Organization Evaluation",
        detail: "CAAP evaluates your organization and key personnel. Any objections or reservations are communicated to the applicant early in this phase.",
      },
      {
        label: "RCC Completion",
        detail: "Complete the Regulations Compliance Checklist demonstrating how each PCAR Part 11 requirement is addressed in your Operations Manual and procedures.",
      },
      {
        label: "Operations Manual & TPL Insurance Review",
        detail: "CAAP evaluates your Operations Manual, Training Manual/Curriculum, and Third Party Liability (TPL) Insurance. Interim approvals are issued as each document is accepted.",
      },
    ],
  },
  {
    n: "IV",
    title: "Demonstration and Inspection",
    color: "#f472b6",
    steps: [
      {
        label: "Conduct of Training & Knowledge Demos",
        detail: "CAAP observes and evaluates your conduct of training, knowledge demonstrations, qualification scenarios, and demonstration of processes. Minor discrepancies may be resolved during this phase.",
      },
      {
        label: "Facility & Organization Inspection",
        detail: "CAAP inspects your main base, facility, registered aircraft/RPA, and support arrangements including Operations Manual implementation, facility adequacy, and personnel qualification.",
      },
      {
        label: "Evaluation of Demonstrations",
        detail: "If all demonstrations are satisfactory, the process proceeds to Phase V. Gross deficiencies may require returning to an earlier phase or termination of the process.",
        highlight: true,
      },
    ],
  },
  {
    n: "V",
    title: "Final Certification",
    color: "#34d399",
    done: true,
    steps: [
      {
        label: "Issuance of COA & Operations Specifications",
        detail: "CAAP issues the Certificate of Authorization (COA) and Operations Specifications (OpSpecs), signed by the Director General. OpSpecs define authorized operations, conditions, and limitations.",
      },
      {
        label: "Certificate Valid 5 Years",
        detail: "The COA is valid for 5 years. CAAP will conduct routine continuing safety oversight through surveillance and related inspections of commercial operations.",
        done: true,
      },
    ],
  },
];

const PRIMARY_DOCS = [
  "Letter of Intent and completed PASI form",
  "Operations Manual / Training Manual / Curriculum-syllabus / program",
  "Operational checklists and forms",
  "Organizational chart / structure",
  "Resume of key management personnel and qualifications",
  "Third Party Liability (TPL) Insurance of the aircraft / RPA",
];

const OTHER_DOCS = [
  "Aircraft / RPA user's manual (soft copy)",
  "Photocopy of pilot / remote pilot license/s",
  "Certificate of Registration of aircraft / RPA",
  "Official receipt upon payment (Phase IV)",
  "Photos of aircraft/RPA with serial number, equipment, main base office, and facility",
  "Corporate Documents — SEC, DTI, and/or Secretary's Certificate (for corporations)",
  "Certificate of Public Convenience and Necessity (CPCN) — for agricultural operations",
  "Special Certificate of Airworthiness (if applicable)",
];

export default function RpasOperatorCertificatePage() {
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
          <span className="text-white/50">RPAS Operator Certificate</span>
        </div>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0 mt-0.5"
            style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)", color: "#fbbf24" }}
          >
            ⊞
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-white">RPAS Operator Certificate</h1>
            <p className="text-[11px] text-white/35">Certificate of Authorization (COA) · AC 001-2025 · AWOCID, Flight Operations Department, CAAP</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Who needs it */}
        <div className="rounded-2xl p-4 space-y-2" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.2)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#fbbf24" }}>Who Must Hold a COA</p>
          <ul className="space-y-1.5 text-[13px] text-white/70 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5 shrink-0">●</span>
              <span><strong className="text-white">Any organization or individual conducting commercial RPAS operations</strong> (mapping, surveillance, aerial photography, agricultural application, etc.) must hold a Certificate of Authorization (COA).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 shrink-0">●</span>
              <span><strong className="text-white">Applies to all aerial work operations</strong> including RPAS and AAO-manned aircraft — excluding recreational, hobby, model, and sport operations.</span>
            </li>
          </ul>
          <p className="text-[11.5px] text-white/40 mt-1">
            Governed by PCAR Part 11 · Advisory Circular No. 001-2025 · 31 Jan 2025
          </p>
        </div>

        {/* Contact card */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">Concerned Office</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Division</p>
              <p className="text-[12.5px] text-white/80">AWOCID</p>
              <p className="text-[11px] text-white/40">Aerial Works Operations Certification and Inspection Division · FOD-FSIS</p>
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Submit To</p>
              <p className="text-[12.5px] text-white/80">ADG-II, FSIS, CAAP</p>
              <p className="text-[11px] text-white/40">Flight Operations Department</p>
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-wide mb-0.5">Telephone</p>
              <p className="text-[12.5px] text-white/80">(02) 8246-4988</p>
              <p className="text-[11px] text-white/40">opcen@caap.gov.ph</p>
            </div>
          </div>
        </div>

        {/* Duration callout */}
        <div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.2)" }}>
          <div className="text-center shrink-0">
            <p className="text-[26px] font-bold leading-none" style={{ color: "#34d399" }}>5 yrs</p>
            <p className="text-[10px] text-white/35 mt-0.5">COA validity</p>
          </div>
          <div>
            <p className="text-[12.5px] font-semibold text-white">Certificate of Authorization (COA)</p>
            <p className="text-[11.5px] text-white/45 mt-0.5">Issued with Operations Specifications (OpSpecs) signed by the CAAP Director General. COA holders are subject to continued surveillance and inspections.</p>
          </div>
        </div>

        {/* 5-Phase process */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">5-Phase Certification Process</p>
          <div className="space-y-4">
            {PHASES.map((phase) => (
              <div
                key={phase.n}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${phase.color}25` }}
              >
                {/* Phase header */}
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{ background: `${phase.color}10`, borderBottom: `1px solid ${phase.color}15` }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={{ background: `${phase.color}20`, border: `1px solid ${phase.color}40`, color: phase.color }}
                  >
                    {phase.done ? "✓" : phase.n}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: phase.color }}>
                      Phase {phase.n}
                    </p>
                    <p className="text-[13px] font-semibold text-white leading-tight">{phase.title}</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="divide-y" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" }}>
                  {phase.steps.map((step, i) => (
                    <div
                      key={i}
                      className="px-4 py-3"
                      style={"highlight" in step && step.highlight ? { background: "rgba(251,191,36,0.04)" } : undefined}
                    >
                      <p className="text-[12.5px] font-semibold text-white/85 mb-0.5">{step.label}</p>
                      <p className="text-[12px] text-white/45 leading-relaxed">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document checklists */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-4">Application Documents</p>
          <div className="space-y-3">

            {/* Primary docs */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(6,182,212,0.08)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Primary Application Documents</p>
              </div>
              <div className="divide-y" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" }}>
                {PRIMARY_DOCS.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                    <div className="w-4 h-4 rounded flex items-center justify-center text-[9px] shrink-0 mt-0.5" style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)", color: "#06b6d4" }}>
                      ○
                    </div>
                    <p className="text-[12.5px] text-white/65 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Other docs */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: "rgba(167,139,250,0.08)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">Other Required Documents</p>
              </div>
              <div className="divide-y" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" }}>
                {OTHER_DOCS.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                    <div className="w-4 h-4 rounded flex items-center justify-center text-[9px] shrink-0 mt-0.5" style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", color: "#a78bfa" }}>
                      ○
                    </div>
                    <p className="text-[12.5px] text-white/65 leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Source note */}
        <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] text-white/30 leading-relaxed">
            Source: <span className="text-white/45">Advisory Circular No. 001-2025</span> · Certificate of Authorization (COA) Five Phase Certification Process · Civil Aviation Authority of the Philippines · 31 Jan 2025
          </p>
        </div>

      </div>
    </div>
  );
}
