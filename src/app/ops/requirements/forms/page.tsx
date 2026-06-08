"use client";

import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

const FORMS = [
  {
    title: "Aircraft Registration Form",
    subtitle: "CAAP Form 1028-1",
    description: "The notarized registration form required for all RPA registrations submitted to the CAAP Airworthiness Department.",
    color: "#06b6d4",
    tag: "Required for RPA Registration",
    href: "https://caap.gov.ph/wp-content/uploads/2023/09/Aircraft-Registration-Form-long.pdf",
    fileType: "PDF",
    department: "Airworthiness Department",
  },
];

export default function FormsPage() {
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
          <span className="text-white/50">Forms</span>
        </div>
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0 mt-0.5"
            style={{ background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.25)", color: "#f472b6" }}
          >
            ⊘
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-white">CAAP Forms</h1>
            <p className="text-[11px] text-white/35">Official forms for CAAP applications and registrations</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

        <p className="text-[12.5px] text-white/40 leading-relaxed">
          Download official CAAP forms required for drone registration, certification, and licensing applications. Always verify you are using the latest version from the CAAP website.
        </p>

        {/* Forms list */}
        {FORMS.map((form) => (
          <a
            key={form.href}
            href={form.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-3 p-5 rounded-2xl transition-all block"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", textDecoration: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold shrink-0"
                style={{ background: `${form.color}15`, border: `1px solid ${form.color}30`, color: form.color }}
              >
                {form.fileType}
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: `${form.color}15`, color: form.color, border: `1px solid ${form.color}30` }}
              >
                {form.tag}
              </span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-white mb-0.5">{form.title}</p>
              <p className="text-[11.5px] font-medium mb-1.5" style={{ color: form.color }}>{form.subtitle}</p>
              <p className="text-[12px] text-white/45 leading-relaxed">{form.description}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/25">{form.department} · CAAP</p>
              <div className="flex items-center gap-1 text-[11px] font-medium" style={{ color: form.color }}>
                Download PDF
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 5h5M5 2.5L7.5 5 5 7.5" />
                </svg>
              </div>
            </div>
          </a>
        ))}

        {/* Note */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">Additional Forms</p>
          <p className="text-[12px] text-white/40 leading-relaxed">
            Other CAAP forms (CAAP Form 542 for RPC, PASI for COA applications) are available directly from the concerned CAAP office or via the CAAP website at{" "}
            <span className="text-white/55">caap.gov.ph</span>.
          </p>
        </div>

        {/* Source note */}
        <div className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] text-white/30 leading-relaxed">
            Source: <span className="text-white/45">caap.gov.ph</span> · Civil Aviation Authority of the Philippines
          </p>
        </div>

      </div>
    </div>
  );
}
