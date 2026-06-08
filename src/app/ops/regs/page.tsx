"use client";

import { useState } from "react";
import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

type Tab = "overview" | "icao" | "registration" | "pilots" | "commercial" | "operations" | "noflyzone" | "penalties";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview",      label: "Overview",         icon: "⊕" },
  { key: "icao",          label: "ICAO Framework",    icon: "⊕" },
  { key: "registration",  label: "Registration",      icon: "⊞" },
  { key: "pilots",        label: "Pilot Cert",        icon: "⊛" },
  { key: "commercial",    label: "Commercial Ops",    icon: "⊘" },
  { key: "operations",    label: "Op Limits",         icon: "⊡" },
  { key: "noflyzone",     label: "No-Fly Zones",      icon: "⊗" },
  { key: "penalties",     label: "Enforcement",       icon: "⊜" },
];

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {title && <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 mb-3">{title}</p>}
      {children}
    </div>
  );
}

function Stat({ label, value, color = "#06b6d4", sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[22px] font-bold leading-none" style={{ color }}>{value}</span>
      <span className="text-[12px] font-medium text-white/70">{label}</span>
      {sub && <span className="text-[10px] text-white/30">{sub}</span>}
    </div>
  );
}

function Rule({ text, ok }: { text: string; ok?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] text-white/70 leading-snug">
      <span className="mt-[3px] shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold"
        style={{
          background: ok === false ? "rgba(239,68,68,0.15)" : ok === true ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)",
          color: ok === false ? "#f87171" : ok === true ? "#34d399" : "#fbbf24",
          border: `1px solid ${ok === false ? "rgba(239,68,68,0.3)" : ok === true ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)"}`,
        }}
      >
        {ok === false ? "✕" : ok === true ? "✓" : "!"}
      </span>
      {text}
    </li>
  );
}

function Badge({ label, color = "#06b6d4" }: { label: string; color?: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
      {label}
    </span>
  );
}

function Callout({ title, children, color = "#fbbf24" }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
      <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color }}>{title}</p>
      <div className="text-[12.5px] text-white/70 leading-relaxed">{children}</div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-4">
      <Callout title="Your Drone — DJI Mini 5 Pro (248g)" color="#34d399">
        Sub-250g means <strong className="text-white">no CAAP registration required for recreational use</strong>.
        But if you fly commercially (paid shoots, real estate, events), you need an RPAS Operator Certificate and a Remote Pilot License.
      </Callout>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <Stat label="Governing Authority" value="CAAP" sub="Civil Aviation Authority of the Philippines" />
        </Card>
        <Card>
          <Stat label="Legal Basis" value="RA 9497" sub="Civil Aviation Authority Act of 2008" />
        </Card>
        <Card>
          <Stat label="Latest Amendment" value="MC 010-2024" sub="PCAR Parts 1 & 11 — Aerial Works & RPAS Cert" />
        </Card>
        <Card>
          <Stat label="PCAR Parts Covered" value="1, 2, 4, 11" sub="Definitions · Licensing · Registration · Operations" />
        </Card>
      </div>

      <Callout title="Global Framework — ICAO" color="#a78bfa">
        The Philippines is an <strong className="text-white">ICAO Contracting State</strong>, so PCAR is built on the international
        standards (SARPs) ICAO sets under the 1944 Chicago Convention. See the <strong className="text-white">ICAO Framework</strong> tab
        for how the global rules connect to the CAAP rules you fly under here.
      </Callout>

      <Card title="Legal Classification">
        <div className="space-y-2.5">
          <p className="text-[13px] text-white/70 leading-relaxed">
            Drones are legally defined as <strong className="text-white">Remotely Piloted Aircraft (RPA)</strong> — a sub-type of UAS — and are classified as <em>aircraft</em> under the Civil Aviation Authority Act.
            Nationality mark: <Badge label="RP-U" color="#06b6d4" /> for civil RPAs. Government aircraft use <Badge label="RP" color="#a78bfa" />.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-xl p-3.5" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}>
              <p className="text-[11px] font-semibold text-emerald-400 mb-1">Non-Commercial</p>
              <p className="text-[12px] text-white/60">Sports or recreational use. No remuneration, no compensation, not in furtherance of business.</p>
            </div>
            <div className="rounded-xl p-3.5" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <p className="text-[11px] font-semibold text-amber-400 mb-1">Commercial</p>
              <p className="text-[12px] text-white/60">Used for remuneration, with compensation, or in furtherance of business. Requires full certification.</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="UAV Size Classifications (PCAR Part 4)">
        <div className="space-y-2">
          {[
            { size: "Micro UAV", weight: "≤ 100g gross weight", note: "Minimal regulatory burden" },
            { size: "Small UAV", weight: "Over 100g and not a Large UAV", note: "Standard rules apply" },
            { size: "Large UAV (Registration)", weight: "Over 7 kg", note: "CAAP registration + UCR required" },
            { size: "Large UAV (Airworthiness)", weight: "≥ 150 kg", note: "Special Certificate of Airworthiness or Experimental Certificate required" },
          ].map((r) => (
            <div key={r.size} className="flex items-center gap-3 py-2 border-b border-white/[0.05] last:border-0">
              <div className="w-36 shrink-0">
                <p className="text-[12px] font-semibold text-white">{r.size}</p>
                <p className="text-[11px] text-cyan-400">{r.weight}</p>
              </div>
              <p className="text-[12px] text-white/50">{r.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="PCAR Parts at a Glance">
        <div className="space-y-2">
          {[
            { part: "Part 1", title: "General Policies, Procedures & Definitions", desc: "Basic rules of construction, definitions, and penalty framework.", href: "/ops/regs/part1" },
            { part: "Part 2", title: "Personnel Licensing", desc: "Types of operations, certificates required, commercial vs. non-commercial.", href: "/ops/regs/part2" },
            { part: "Part 4", title: "Aircraft Registration & Marking", desc: "RP-U marking format, ECM placement, size and material requirements.", href: "/ops/regs/part4" },
            { part: "Part 11", title: "Aerial Works & RPAS Certification", desc: "MC 010-2024 — Operation categories, Certificate of Authorization, flight rules, roles, and aerial work types.", href: "/ops/regs/part11" },
          ].map((p) => (
            <div key={p.part} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-0">
              <Badge label={p.part} color="#06b6d4" />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-white">{p.title}</p>
                <p className="text-[11.5px] text-white/45 mt-0.5">{p.desc}</p>
              </div>
              {p.href ? (
                <Link
                  href={p.href}
                  className="shrink-0 flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors"
                  style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)" }}
                >
                  View
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 5h5M5 2.5L7.5 5 5 7.5" />
                  </svg>
                </Link>
              ) : (
                <span className="shrink-0 text-[10px] text-white/15 px-2">Soon</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function IcaoTab() {
  return (
    <div className="space-y-4">
      <Callout title="Why ICAO Matters to a Philippine Drone Pilot" color="#06b6d4">
        The Philippines is a <strong className="text-white">Contracting State of ICAO</strong> — it signed the
        1944 Chicago Convention as one of the original member states. ICAO sets the global rulebook;
        CAAP turns that rulebook into Philippine law (the PCAR). When you fly here,
        you follow <strong className="text-white">CAAP / PCAR</strong> — but those rules exist because of, and align with, ICAO.
      </Callout>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><Stat label="Chicago Convention" value="1944" sub="Signed 7 Dec; in force 1947" /></Card>
        <Card><Stat label="ICAO Member States" value="193" color="#a78bfa" sub="PH is a founding signatory" /></Card>
        <Card><Stat label="Annexes (SARPs)" value="19" color="#34d399" sub="Standards & Recommended Practices" /></Card>
        <Card><Stat label="PH Regulator" value="CAAP" color="#fbbf24" sub="Implements ICAO SARPs via PCAR" /></Card>
      </div>

      <Card title="Airspace Sovereignty — Chicago Convention, Article 1">
        <p className="text-[13px] text-white/70 leading-relaxed">
          “Every State has <strong className="text-white">complete and exclusive sovereignty</strong> over the
          airspace above its territory.” This is the legal reason CAAP — not ICAO — directly governs every
          drone flight inside the Philippines, including territorial waters and archipelagic airspace.
          A drone may not enter another State&apos;s airspace without that State&apos;s permission.
        </p>
        <div className="mt-3">
          <Callout title="Plain-language takeaway" color="#34d399">
            ICAO is the international framework. <strong className="text-white">CAAP is the law you actually fly under in the Philippines.</strong>
            They are not in conflict — PCAR is CAAP&apos;s national version of ICAO&apos;s global standards.
          </Callout>
        </div>
      </Card>

      <Card title="ICAO Annexes That Shape Philippine Drone Rules">
        <div className="space-y-2">
          {[
            { n: "Annex 1", t: "Personnel Licensing", d: "Basis for remote-pilot competency and licensing (PCAR Part 2)." },
            { n: "Annex 2", t: "Rules of the Air", d: "RPAS need authorization to operate; right-of-way and airspace rules." },
            { n: "Annex 7", t: "Nationality & Registration Marks", d: "Basis for the RP-U marking scheme (PCAR Part 4)." },
            { n: "Annex 8", t: "Airworthiness of Aircraft", d: "Airworthiness basis for larger UAS (≥150 kg)." },
            { n: "Annex 11", t: "Air Traffic Services", d: "Integration with controlled airspace and ATS coordination." },
            { n: "Annex 13", t: "Accident & Incident Investigation", d: "How drone accidents/serious incidents are investigated." },
            { n: "Annex 19", t: "Safety Management", d: "State safety oversight and risk-based regulation." },
          ].map((a) => (
            <div key={a.n} className="flex items-start gap-3 py-2 border-b border-white/[0.05] last:border-0">
              <Badge label={a.n} color="#a78bfa" />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-white">{a.t}</p>
                <p className="text-[11.5px] text-white/45 mt-0.5">{a.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="ICAO Guidance Material Specific to Drones (RPAS / UAS)">
        <div className="space-y-2">
          {[
            { n: "Cir 328", t: "Unmanned Aircraft Systems (UAS), 2011", d: "ICAO's first formal circular framing UAS within the Convention." },
            { n: "Doc 10019", t: "Manual on Remotely Piloted Aircraft Systems (RPAS)", d: "Core guidance for integrating RPAS into airspace and licensing." },
            { n: "Model UAS Regs", t: "Parts 101, 102 & 149", d: "Template regulations States may adopt — PCAR mirrors many concepts." },
            { n: "UAS Toolkit", t: "ICAO UAS / U-AID resources", d: "Practical material on safe domestic UAS operations and UTM." },
            { n: "RPAS Panel", t: "RPASP — developing binding SARPs", d: "Drafting standards for international IFR RPAS operations." },
          ].map((a) => (
            <div key={a.n} className="flex items-start gap-3 py-2 border-b border-white/[0.05] last:border-0">
              <Badge label={a.n} color="#06b6d4" />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium text-white">{a.t}</p>
                <p className="text-[11.5px] text-white/45 mt-0.5">{a.d}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="How CAAP Connects to ICAO">
        <ul className="space-y-2">
          <Rule ok={true} text="CAAP is the Philippines' designated Civil Aviation Authority under RA 9497, acting as the ICAO State regulator." />
          <Rule ok={true} text="PCAR (Philippine Civil Aviation Regulations) transposes ICAO Annexes/SARPs into enforceable national rules." />
          <Rule text="Where the Philippines differs from a SARP, it files a 'difference' with ICAO under Convention Article 38." />
          <Rule text="ICAO audits CAAP through USOAP (Universal Safety Oversight Audit Programme) to verify effective oversight." />
        </ul>
      </Card>

      <Callout title="Scope — Domestic vs. International" color="#fbbf24">
        For everyday Philippine flying — small drones, VLOS, recreational or commercial — <strong className="text-white">CAAP/PCAR is the complete authority</strong>;
        you do not deal with ICAO directly. ICAO&apos;s binding RPAS standards are aimed at <em>international, IFR</em> operations.
        Cross-border or international drone work needs additional, ICAO-aligned authorization from every State whose airspace is involved.
      </Callout>
    </div>
  );
}

function RegistrationTab() {
  return (
    <div className="space-y-4">
      <Callout title="Quick Check — Do You Need to Register?" color="#06b6d4">
        <ul className="space-y-1 mt-1">
          <li>🟢 <strong className="text-white">Sub-250g recreational</strong> (DJI Mini 5 Pro) → No registration required</li>
          <li>🟡 <strong className="text-white">Sub-7kg recreational</strong> → ₱1,000 fee, but registration is technically required per PCAR Part 4 for &quot;small UAVs&quot;</li>
          <li>🔴 <strong className="text-white">Over 7kg</strong> → CAAP registration mandatory, carry UCR during all flights</li>
          <li>🔴 <strong className="text-white">Over 150kg</strong> → Special Certificate of Airworthiness or Experimental Certificate required</li>
        </ul>
      </Callout>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <Stat label="Recreational (under 7kg)" value="₱1,000" sub="Registration fee" color="#34d399" />
        </Card>
        <Card>
          <Stat label="Operator Certificate" value="₱36,400" sub="Valid 3 years" color="#fbbf24" />
        </Card>
        <Card>
          <Stat label="Per RPA (commercial)" value="₱1,680" sub="Individual drone registration" color="#f472b6" />
        </Card>
      </div>

      <Card title="Registration Requirements (Large UAVs / Commercial)">
        <ul className="space-y-2">
          <Rule text="UAS Certificate of Registration (UCR) must be carried during all flights" ok={true} />
          <Rule text="Registration mark: RP-U followed by a number (001–999) and a letter (A–Z)" ok={true} />
          <Rule text="Mark must be on the visible side of the Electronic Control Module (ECM)" ok={true} />
          <Rule text="Mark must be waterproof, weather-resistant, and proportionate in size" ok={true} />
        </ul>
      </Card>

      <Card title="Ownership Eligibility for Registration">
        <div className="space-y-2.5">
          <p className="text-[13px] text-white/70">An RPA is eligible for registration if owned by or leased to:</p>
          <ul className="space-y-2">
            <Rule text="A citizen of the Philippines" ok={true} />
            <Rule text="Corporations organized under Philippine law with at least 60% capital owned by Filipino citizens" ok={true} />
            <Rule text="Foreign-owned RPAs — only if used by aero clubs for recreation, sport, or flying skill development" />
          </ul>
        </div>
      </Card>
    </div>
  );
}

function PilotsTab() {
  return (
    <div className="space-y-4">
      <Callout title="Remote Pilot License (RPA Controller Certificate)" color="#a78bfa">
        Required for commercial operations or for heavy drones (≥7 kg) used recreationally.
        Valid for <strong className="text-white">5 years</strong>. Minimum age: <strong className="text-white">18 years old</strong>.
      </Callout>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <Stat label="Minimum Age" value="18 yrs" sub="To apply for certification" color="#a78bfa" />
        </Card>
        <Card>
          <Stat label="License Validity" value="5 Years" sub="RPA Controller Certificate" color="#06b6d4" />
        </Card>
        <Card>
          <Stat label="When Required" value="Commercial" sub="Or ≥7kg recreational" color="#fbbf24" />
        </Card>
      </div>

      <Card title="Application Requirements">
        <p className="text-[12.5px] text-white/50 mb-3">Application must be made in writing, signed and sworn to by the applicant, stating:</p>
        <ul className="space-y-2">
          <Rule text="Type of RPA to be controlled" ok={true} />
          <Rule text="Experience in operating RPAs" ok={true} />
          <Rule text="Training courses undertaken" ok={true} />
          <Rule text="Completion of a knowledge exam" ok={true} />
          <Rule text="Passing a practical test / demonstration flight" ok={true} />
        </ul>
      </Card>

      <Card title="Foreign Controller Validation">
        <p className="text-[12.5px] text-white/50 mb-3">A person holding a valid RPA Controller Certificate from another contracting state may apply for validation. Requirements:</p>
        <ul className="space-y-2">
          <Rule text="Completion of RPA training course from the manufacturer" ok={true} />
          <Rule text="At least 5 hours of experience operating RPAs outside controlled airspace" ok={true} />
          <Rule text="Passing the RPAS Exam" ok={true} />
          <Rule text="Passing a demonstration flight conducted by CAAP personnel" ok={true} />
        </ul>
      </Card>
    </div>
  );
}

function CommercialTab() {
  return (
    <div className="space-y-4">
      <Callout title="RPAS Operator Certificate Required" color="#fbbf24">
        All commercial drone activities require a <strong className="text-white">UAS Operator Certificate</strong> (valid 3 years) plus <strong className="text-white">insurance coverage</strong> for the RPA, controllers, and third-party liability.
      </Callout>

      <Card title="Operator Certificate Eligibility">
        <ul className="space-y-2">
          <Rule text="Citizens of the Republic of the Philippines" ok={true} />
          <Rule text="Domestic partnerships, entities, or corporations with at least 60% Filipino capital" ok={true} />
          <Rule text="Foreign operators" ok={false} />
        </ul>
      </Card>

      <Card title="Pre-Application Requirements">
        <ul className="space-y-2">
          <Rule text="Letter of Intent" ok={true} />
          <Rule text="Duly accomplished Pre-Application Statement of Intent (PASI) Form" ok={true} />
          <Rule text="Copies of manuals relevant to RPA operations" ok={true} />
        </ul>
      </Card>

      <Card title="Insurance Requirement">
        <p className="text-[13px] text-white/70 leading-relaxed">
          No person may operate an RPA commercially without an RPAS Operator Certificate that includes a <strong className="text-white">Certificate of Insurance</strong> covering:
        </p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {["The RPA (drone)", "RPA Controllers (pilots)", "Third-Party Liability (TPL)"].map((item) => (
            <div key={item} className="rounded-xl p-3 text-center" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
              <p className="text-[12px] text-amber-300">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Multi-RPA Operations">
        <ul className="space-y-2">
          <Rule text="A Chief RPA Controller must be nominated" ok={true} />
          <Rule text="A Maintenance Controller must be nominated" ok={true} />
          <Rule text="Two or more persons cannot be jointly certified as a single RPA operator" ok={false} />
          <Rule text="Chief RPA Controller must perform duties full-time when operating more than one RPA" ok={true} />
        </ul>
      </Card>
    </div>
  );
}

function OperationsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <Stat label="Max Altitude" value="400 ft" sub="AGL — Above Ground Level" color="#f87171" />
        </Card>
        <Card>
          <Stat label="Airport Distance" value="10 km" sub="From Aerodrome Reference Point (ARP)" color="#f87171" />
        </Card>
        <Card>
          <Stat label="Person Clearance" value="30 m" sub="Lateral distance from uninvolved persons" color="#fbbf24" />
        </Card>
        <Card>
          <Stat label="Night Ops" value="Permit" sub="CAAP authorization required" color="#a78bfa" />
        </Card>
      </div>

      <Card title="General Operational Rules — All Operations">
        <ul className="space-y-2">
          <Rule text="Maximum altitude: 400 feet (≈120m) Above Ground Level (AGL)" ok={true} />
          <Rule text="Visual Line of Sight (VLOS) must be maintained at all times" ok={true} />
          <Rule text="Minimum 30m lateral clearance from uninvolved persons during flight, landing, and takeoff" ok={true} />
          <Rule text="Give way to manned aircraft at all times" ok={true} />
          <Rule text="No operation in controlled or prohibited airspace without CAAP authorization" ok={false} />
          <Rule text="No operation over a populous area below safe glide clearance altitude" ok={false} />
        </ul>
      </Card>

      <Card title="Special Flight Permits Required From CAAP">
        <div className="grid grid-cols-2 gap-2">
          {[
            "Night operations",
            "Beyond Visual Line of Sight (BVLOS)",
            "Above 400 feet AGL",
            "Within 10 km of airports",
            "Over populated areas",
            "RPA Flying Display or Air Show",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl p-2.5" style={{ background: "rgba(168,139,250,0.07)", border: "1px solid rgba(168,139,250,0.15)" }}>
              <span className="text-purple-400 text-[11px]">⊘</span>
              <span className="text-[12px] text-white/70">{item}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Non-Commercial / Recreational-Specific Rules (PCAR 11.11.7)">
        <ul className="space-y-2">
          <Rule text="Must operate within Visual Line of Sight (VLOS) only" ok={true} />
          <Rule text="Night operations prohibited unless authorized by CAAP" ok={false} />
          <Rule text="No RPA Flying Display or Air Show without CAAP authorization" ok={false} />
        </ul>
      </Card>

      <Callout title="Certificate of Airworthiness" color="#06b6d4">
        RPAs with a gross weight of <strong className="text-white">150 kg and above</strong> require either:
        a Special Certificate of Airworthiness (SCA) or an Experimental Certificate (EC).
      </Callout>
    </div>
  );
}

function NoFlyTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Key Restricted Zones">
          <ul className="space-y-2">
            {[
              { zone: "All airports & airfields", detail: "10km safety radius from Aerodrome Reference Point (ARP)" },
              { zone: "Military zones", detail: "No drone operations without special authorization" },
              { zone: "Police stations", detail: "Restricted area" },
              { zone: "Malacañang Palace", detail: "Sensitive government building — strict no-fly" },
              { zone: "Populated areas", detail: "Below safe glide altitude — prohibited without permit" },
              { zone: "Controlled airspace", detail: "Requires CAAP authorization to enter" },
              { zone: "Prohibited airspace", detail: "No flight permitted under any circumstance" },
            ].map((r) => (
              <li key={r.zone} className="flex items-start gap-2.5">
                <span className="mt-1 shrink-0 w-3.5 h-3.5 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-[9px] text-red-400 font-bold">✕</span>
                <div>
                  <p className="text-[12.5px] font-medium text-white">{r.zone}</p>
                  <p className="text-[11px] text-white/40">{r.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="NAIA Proximity — Waevpoint Context">
          <Callout title="14.38°N, 120.94°E — San Jose del Monte, Bulacan" color="#06b6d4">
            <p className="mt-1">Nearest major aerodrome: <strong className="text-white">NAIA (MNL)</strong> — approximately <strong className="text-white">17.2 km</strong> away.</p>
            <p className="mt-1">This is outside the 10km restriction zone. However, always verify your exact coordinates using the CAAP eRON system or DroneUA before flying.</p>
          </Callout>
          <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <p className="text-[12px] text-emerald-400 font-semibold">Airspace Status</p>
            <p className="text-[12px] text-white/60 mt-1">Generally clear for operations — maintain 400ft AGL max and VLOS. Check CAAP NOTAM for temporary restrictions before each flight.</p>
          </div>
        </Card>
      </div>

      <Card title="What PCAR Currently Does NOT Cover">
        <p className="text-[12px] text-white/40 mb-3">Areas where specific UAS rules are absent — general Philippine law applies by default:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Drone transport rules",
            "Data & Privacy (defaults to Data Privacy Act 2012)",
            "Control-link interference regulations",
            "UAS-specific maintenance rules",
            "Cargo loss or damage rules",
            "UAS accident/incident reporting (uses general PCAR)",
            "UAS manufacturer oversight",
            "Market access / pricing regulations",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 text-[11.5px] text-white/45">
              <span className="text-white/20 mt-0.5">○</span>
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PenaltiesTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <Stat label="Max Fine" value="₱200,000" sub="For restricted airspace violations" color="#f87171" />
        </Card>
        <Card>
          <Stat label="Equipment" value="Confiscation" sub="On-site seizure for violations" color="#f87171" />
        </Card>
        <Card>
          <Stat label="Severe Cases" value="Criminal" sub="Endangering commercial aviation" color="#f87171" />
        </Card>
      </div>

      <Card title="Enforcement Process">
        <div className="space-y-3">
          {[
            { step: "1", label: "Warning Notice", desc: "CAAP issues a notice reciting the facts and indicating a possible violation. No penalty yet — but it is on record." },
            { step: "2", label: "Letter of Correction", desc: "Confirms the decision and states the corrective action required. A deadline is given for compliance." },
            { step: "3", label: "Formal Certificate Action", desc: "If corrective action is not completed, suspension or revocation of any license or certificate may be imposed." },
            { step: "4", label: "Criminal Charges", desc: "In severe cases — especially those endangering commercial aviation — criminal charges may be filed regardless of administrative action." },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[11px] font-bold text-red-400 shrink-0 mt-0.5">
                {s.step}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">{s.label}</p>
                <p className="text-[12px] text-white/50 leading-snug mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="What Triggers Higher Penalties">
        <ul className="space-y-2">
          <Rule text="Flying in restricted areas or near airports" ok={false} />
          <Rule text="Commercial operations without Operator Certificate" ok={false} />
          <Rule text="No insurance for commercial operations" ok={false} />
          <Rule text="Operating without pilot certification (commercial or ≥7kg)" ok={false} />
          <Rule text="Endangering manned aircraft" ok={false} />
          <Rule text="BVLOS without Special Flight Permit" ok={false} />
        </ul>
      </Card>

      <Callout title="Source & References" color="#06b6d4">
        <p>CAAP Official RPAS Regulations: <span className="text-cyan-400">caap.gov.ph/rpas-regulations</span></p>
        <p className="mt-1">PCAR Parts 1, 2, 4, 11 · MC 010-2024 · MC 35-14 · Republic Act 9497</p>
      </Callout>
    </div>
  );
}

// ── Mock Exam ─────────────────────────────────────────────────────────────────

type Question = {
  id: number;
  type: "mc" | "tf";
  category: string;
  question: string;
  options?: string[];
  correct: number; // mc: option index 0-3 | tf: 0=True, 1=False
  explanation: string;
};

const ALL_QUESTIONS: Question[] = [
  // ── Multiple Choice ──────────────────────────────────────────────────────────
  {
    id: 1,
    type: "mc",
    category: "Commercial Ops",
    question: "You are hired to shoot aerial footage for a real estate company in Makati City. Your drone is a DJI Mini 5 Pro (248g). Which certificates do you need before flying?",
    options: [
      "No certificates — the drone is under 250g so you are exempt",
      "Only an RPA Controller Certificate",
      "Both an RPA Controller Certificate and a UAS Operator Certificate",
      "Only a UAS Operator Certificate",
    ],
    correct: 2,
    explanation: "Commercial operations require both an RPA Controller Certificate (for the pilot) and a UAS Operator Certificate (for the operating entity), regardless of drone weight. Weight only affects registration, not commercial certification.",
  },
  {
    id: 2,
    type: "mc",
    category: "Right of Way",
    question: "During a commercial shoot at 350 ft AGL, a light aircraft enters your area at low altitude and is approaching. What is the correct immediate action?",
    options: [
      "Maintain position — you are legally below the 400 ft limit",
      "Ascend to 400 ft so the aircraft can see you more easily",
      "Immediately give way — descend or move away from the aircraft's path",
      "Hover in place and wait for the aircraft to pass",
    ],
    correct: 2,
    explanation: "PCAR requires all RPA operators to give way to manned aircraft at all times, regardless of altitude or who arrived in the airspace first. This is a non-negotiable safety rule.",
  },
  {
    id: 3,
    type: "mc",
    category: "Special Permits",
    question: "A client books you for a night shoot at BGC, Taguig — well away from any airport. What do you need beyond your standard certifications?",
    options: [
      "Nothing extra — VLOS night flights are permitted anywhere",
      "A CAAP Special Flight Permit for night operations",
      "Just notify local barangay authorities before flying",
      "A higher-rated Controller Certificate covers night flights",
    ],
    correct: 1,
    explanation: "Night operations always require a CAAP Special Flight Permit regardless of location, distance from airports, or drone weight. This rule has no exceptions under PCAR.",
  },
  {
    id: 4,
    type: "mc",
    category: "VLOS / Emergency",
    question: "You are flying a survey at 380 ft AGL when your FPV video feed drops — but your stick controls still respond. What is the correct first response?",
    options: [
      "Continue the mission since flight controls still work",
      "Ascend higher to try to restore the video signal",
      "Return the drone to visual line-of-sight range immediately",
      "Switch to an autonomous waypoint mission to complete safely",
    ],
    correct: 2,
    explanation: "PCAR requires Visual Line of Sight (VLOS) to be maintained at all times during flight. Loss of video feed means you can no longer accurately assess the drone's environment. You must restore VLOS immediately.",
  },
  {
    id: 5,
    type: "mc",
    category: "Airspace / Airports",
    question: "You plan to photograph the NAIA terminal from the air for an architecture firm. Your proposed flight point is 8 km from NAIA's Aerodrome Reference Point. What applies?",
    options: [
      "No special permit needed if you stay at or below 400 ft AGL",
      "Only your Operator Certificate is needed",
      "A CAAP Special Flight Permit is required — you are within the 10 km airport zone",
      "Clearance from the architecture firm and airline is sufficient",
    ],
    correct: 2,
    explanation: "Any drone operation within 10 km of an aerodrome's reference point (ARP) requires a CAAP Special Flight Permit. At 8 km from NAIA, you are clearly inside this zone.",
  },
  {
    id: 6,
    type: "mc",
    category: "Populous Areas",
    question: "A concert promoter wants footage from directly above a crowd of 500 people at an outdoor festival. You hold an Operator Certificate and have insurance. Can you fly?",
    options: [
      "Yes — Operator Certificate and insurance satisfy all requirements",
      "Yes — if you stay below 400 ft AGL",
      "No — operations over populated areas require an additional CAAP Special Flight Permit",
      "Yes — if the event organizer signs a liability waiver",
    ],
    correct: 2,
    explanation: "PCAR prohibits drone operations over populated areas below safe glide clearance altitude without a CAAP Special Flight Permit, even with an Operator Certificate and insurance in place.",
  },
  {
    id: 7,
    type: "mc",
    category: "Emergency / Battery",
    question: "Mid-shoot, your battery unexpectedly drops to 15%. You are 200 m from the takeoff point. What is the safest course of action?",
    options: [
      "Quickly complete the remaining shots since 200 m is a short return",
      "Initiate return to home immediately",
      "Hover in place and call for a second drone",
      "Land on the nearest rooftop to avoid battery failure mid-air",
    ],
    correct: 1,
    explanation: "At 15% battery you must return immediately. The remaining charge must cover the return flight and landing. Continuing to shoot risks a forced landing at an uncontrolled location. Safety always overrides job completion.",
  },
  {
    id: 8,
    type: "mc",
    category: "Registration / Ownership",
    question: "A foreign production company wants to register their own drone in the Philippines to fly commercially for a film project. What applies under PCAR?",
    options: [
      "They can register for commercial use with a CAAP permit",
      "Foreign-owned RPAs cannot be registered for commercial use in the Philippines",
      "They can register if their Filipino partner holds an Operator Certificate",
      "They can register with a Special Flight Permit as a visiting operator",
    ],
    correct: 1,
    explanation: "PCAR limits RPA registration for commercial operations to Filipino citizens or Philippine corporations with at least 60% Filipino capital. Foreign-owned RPAs may only register for aero club recreational or sport use.",
  },
  {
    id: 9,
    type: "mc",
    category: "Operator Certificate",
    question: "A drone startup has 35% Filipino capital and 65% foreign ownership. Can it obtain an RPAS Operator Certificate from CAAP?",
    options: [
      "Yes, with a CAAP waiver",
      "Yes, if they hire a Filipino Chief RPA Controller",
      "No — RPAS Operator Certificate requires at least 60% Filipino capital",
      "Yes, for non-commercial operations only",
    ],
    correct: 2,
    explanation: "PCAR requires Operator Certificate applicants to be corporations organized under Philippine law with at least 60% capital owned by Filipino citizens. 35% Filipino capital does not meet this threshold.",
  },
  {
    id: 10,
    type: "mc",
    category: "Op Limits",
    question: "You are at a busy public park with spectators around. You need to take off and land. What is the minimum lateral distance PCAR requires from uninvolved persons?",
    options: ["10 meters", "20 meters", "30 meters", "50 meters"],
    correct: 2,
    explanation: "PCAR Part 11 mandates a minimum 30-meter lateral clearance from uninvolved persons during all flight phases including takeoff and landing.",
  },
  {
    id: 11,
    type: "mc",
    category: "No-Fly Zones",
    question: "A government agency asks you to fly near Malacañang Palace for official documentation photography. What is required?",
    options: [
      "Government contract work bypasses CAAP zone restrictions",
      "Fly if you stay under 400 ft AGL and maintain VLOS",
      "You must obtain CAAP special authorization — Malacañang is a sensitive restricted area",
      "Inform CAAP the day before and proceed",
    ],
    correct: 2,
    explanation: "Malacañang Palace is a strict restricted no-fly zone. Even government-commissioned operations require proper CAAP authorization and coordination with relevant security authorities.",
  },
  {
    id: 12,
    type: "mc",
    category: "BVLOS / Mission Planning",
    question: "You need to complete a 5 km wide aerial mapping mission for an agricultural firm. The area is too wide to cover from a single VLOS position. What is the legal approach?",
    options: [
      "Use FPV goggles to extend your effective visual range to cover the area",
      "Position an observer on a hilltop who radios you status updates while you fly BVLOS",
      "Break the mission into multiple VLOS-compliant segments from repositioned launch points, or obtain a BVLOS Special Flight Permit",
      "A single general BVLOS certificate covers all future large-area missions",
    ],
    correct: 2,
    explanation: "BVLOS operations require a CAAP Special Flight Permit per operation. The alternative is repositioning the launch point to cover the area in multiple legal VLOS segments. Observer radio updates alone do not satisfy the VLOS requirement.",
  },
  {
    id: 13,
    type: "mc",
    category: "Pilot Responsibility",
    question: "Your client says 'Just fly quickly over the restricted zone — nobody will catch you.' As the certified controller, what is your obligation?",
    options: [
      "Comply if the restricted zone is small and the flight will be brief",
      "Comply if the client signs a liability waiver",
      "Refuse — as the certified RPA Controller, you are personally responsible for all regulatory compliance",
      "Comply once, then file a self-correction report with CAAP",
    ],
    correct: 2,
    explanation: "The certified RPA Controller bears personal legal responsibility for compliance with all PCAR regulations during every flight. Client instructions, waivers, or assurances do not transfer regulatory liability to the client.",
  },
  {
    id: 14,
    type: "mc",
    category: "Airspace Knowledge",
    question: "What does 'NOTAM' stand for, and why must you check it before every drone flight?",
    options: [
      "Notice to Aerial Managers — lists all currently registered drone pilots",
      "Notice to Airmen — announces temporary airspace changes, restrictions, and hazards",
      "National Operations Traffic Air Management — tracks real-time aircraft positions",
      "Notice to Authorized Mechanics — covers aircraft maintenance requirements",
    ],
    correct: 1,
    explanation: "NOTAM (Notice to Airmen) is an official announcement about temporary airspace restrictions, hazards, active military operations, or other changes. Checking active NOTAMs before every flight is a core pre-flight responsibility.",
  },
  {
    id: 15,
    type: "mc",
    category: "Emergency / Safety",
    question: "During a live event shoot, your drone loses its control link and automatically enters Return-to-Home mode. A crowd is directly underneath the drone's return path. What do you do?",
    options: [
      "Allow RTH to complete — the system is designed to be safe",
      "Do nothing — RTH automatically detects and avoids people below",
      "Override RTH immediately and manually navigate the drone away from the crowd",
      "Call out to the crowd to move while RTH continues",
    ],
    correct: 2,
    explanation: "As the certified controller, you must override automatic systems when a safety hazard is detected. RTH does not guarantee avoidance of ground-level crowds. You have the duty and authority to intervene.",
  },
  {
    id: 16,
    type: "mc",
    category: "Foreign Certificates",
    question: "You hold a valid RPA Controller Certificate issued by Singapore's CAAS. You want to fly commercially in the Philippines. What does CAAP require?",
    options: [
      "Your Singapore certificate is automatically recognized — no additional steps needed",
      "Foreign certificates have no validity in the Philippines under any circumstances",
      "You may apply for CAAP validation, but you must still pass the RPAS written exam and a demonstration flight",
      "Just submit a notarized copy of your foreign certificate to CAAP",
    ],
    correct: 2,
    explanation: "PCAR allows validation of foreign RPA Controller Certificates from contracting states, but still requires passing the CAAP RPAS knowledge exam and completing a demonstration flight conducted by CAAP personnel.",
  },
  {
    id: 17,
    type: "mc",
    category: "Incidents & Accidents",
    question: "Your drone malfunctions mid-flight and crashes near bystanders. No one is injured, but a parked vehicle is damaged. What is your immediate legal obligation?",
    options: [
      "File a police report only — CAAP has no jurisdiction over ground incidents",
      "Settle damages privately without reporting to CAAP to avoid license suspension",
      "Report through CAAP's accident/incident reporting process and address third-party damages",
      "Wait to see if anyone complains before taking action",
    ],
    correct: 2,
    explanation: "CAAP's general accident/incident reporting procedures apply. Operators also bear civil liability for third-party damages caused by their drone. Concealing incidents can compound penalties.",
  },
  {
    id: 18,
    type: "mc",
    category: "Airspace / NOTAM",
    question: "You are flying at exactly 400 ft AGL when a NOTAM activates, extending a temporary restricted zone to include your current position. What must you do?",
    options: [
      "Continue — you were already legally flying before the NOTAM took effect",
      "Hover and verify the NOTAM details with CAAP by radio before moving",
      "Immediately descend and exit the restricted area",
      "Ascend above the zone's ceiling to fly over it",
    ],
    correct: 2,
    explanation: "NOTAMs create binding restrictions upon activation. You must immediately exit the restricted airspace regardless of whether you were previously operating legally. Prior legal status does not exempt you from a newly active NOTAM.",
  },
  {
    id: 19,
    type: "mc",
    category: "Registration",
    question: "Which of the following drones requires CAAP registration regardless of whether it is used recreationally or commercially?",
    options: [
      "DJI Mini 4 Pro (249g) used for recreational photography",
      "DJI Mavic 3 (895g) used for personal non-commercial filming",
      "DJI Phantom 4 Pro (1.4 kg) used recreationally",
      "DJI Agras T10 (8.9 kg) used for agricultural crop spraying",
    ],
    correct: 3,
    explanation: "RPAs with a gross weight over 7 kg are classified as 'Large RPA' under PCAR and require CAAP registration regardless of use type. The DJI Agras T10 at 8.9 kg exceeds this threshold.",
  },
  {
    id: 20,
    type: "mc",
    category: "Multi-RPA Operations",
    question: "An RPAS operator plans to run five drones simultaneously for a large agricultural survey. Under PCAR, who must be nominated for this operation?",
    options: [
      "Only a Chief RPA Controller",
      "Only a Maintenance Controller",
      "Both a Chief RPA Controller and a Maintenance Controller",
      "A separate certified controller for each drone",
    ],
    correct: 2,
    explanation: "PCAR requires that multi-RPA operations nominate both a Chief RPA Controller (who must perform duties full-time during operations) and a Maintenance Controller. Both nominations are mandatory.",
  },

  // ── True / False ─────────────────────────────────────────────────────────────
  {
    id: 21,
    type: "tf",
    category: "Certification",
    question: "Scenario: You are 18 years old, Filipino, and just passed the CAAP RPAS written knowledge exam. You can immediately begin commercial drone operations.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — Passing the knowledge exam is only one step. You must also pass a practical skills test (demonstration flight) conducted by CAAP, hold a valid RPA Controller Certificate, AND operate under an entity with a UAS Operator Certificate before any commercial flight.",
  },
  {
    id: 22,
    type: "tf",
    category: "Recreational Rules",
    question: "Scenario: You fly your DJI Mini 5 Pro (248g) recreationally in an open field in Batangas — approximately 20 km from the nearest airport, below 400 ft AGL, and within your visual range. No CAAP permits are required for this flight.",
    options: ["True", "False"],
    correct: 0,
    explanation: "TRUE — Sub-250g recreational flights outside restricted zones, beyond 10 km from airports, within VLOS, and below 400 ft AGL generally do not require CAAP registration or special permits under current RPAS rules. Basic safety rules still apply.",
  },
  {
    id: 23,
    type: "tf",
    category: "BVLOS",
    question: "Scenario: You hold a valid RPA Controller Certificate and a UAS Operator Certificate. This combination is sufficient to legally conduct Beyond Visual Line of Sight (BVLOS) drone flights in the Philippines.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — BVLOS operations require a dedicated CAAP Special Flight Permit in addition to standard certifications. An Operator Certificate and Controller Certificate alone do not authorize BVLOS flight.",
  },
  {
    id: 24,
    type: "tf",
    category: "Pilot Cert",
    question: "An RPA Controller Certificate issued by CAAP in the Philippines is valid for five (5) years from the date of issue.",
    options: ["True", "False"],
    correct: 0,
    explanation: "TRUE — Per PCAR Part 2, the RPA Controller Certificate has a validity period of five (5) years.",
  },
  {
    id: 25,
    type: "tf",
    category: "Populous Areas",
    question: "Scenario: You have a valid UAS Operator Certificate and full insurance coverage (RPA, controller, and third-party liability). This is sufficient to fly over a large crowd at an outdoor concert without any additional permit.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — Flying over populated areas requires a CAAP Special Flight Permit regardless of certification or insurance status. Having an Operator Certificate and insurance does not waive this requirement.",
  },
  {
    id: 26,
    type: "tf",
    category: "Night Ops",
    question: "Scenario: You plan to fly your drone at night over a remote open field, well away from airports, maintaining VLOS throughout and staying below 400 ft AGL. This flight is permitted without any special authorization.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — Night operations always require a CAAP Special Flight Permit under PCAR. There are no exceptions based on location, proximity to airports, or VLOS compliance.",
  },
  {
    id: 27,
    type: "tf",
    category: "Right of Way",
    question: "Scenario: A helicopter descends into your airspace while you are legally flying at 380 ft AGL. Since you were there first and the helicopter is entering your legal operating altitude, the helicopter pilot should give way to your drone.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — RPA operators must always give way to manned aircraft, without exception. The rule is absolute — it does not matter who arrived in the airspace first or what altitude is being used.",
  },
  {
    id: 28,
    type: "tf",
    category: "Operator Certificate",
    question: "Under PCAR, two business partners may be jointly certified as a single RPAS operator under one UAS Operator Certificate.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — PCAR explicitly states that two or more persons cannot be jointly certified as a single RPA operator. Each operator entity must hold its own certificate independently.",
  },
  {
    id: 29,
    type: "tf",
    category: "Operator Certificate",
    question: "A UAS Operator Certificate issued by CAAP is valid for three (3) years from the date of issuance.",
    options: ["True", "False"],
    correct: 0,
    explanation: "TRUE — Per PCAR Part 11, the RPAS / UAS Operator Certificate has a validity of three (3) years. This is distinct from the RPA Controller Certificate which is valid for five (5) years.",
  },
  {
    id: 30,
    type: "tf",
    category: "Penalties",
    question: "Scenario: A drone pilot is caught flying commercially without an RPA Controller Certificate. Under CAAP enforcement, they can face a maximum fine of ₱200,000 and possible on-site confiscation of their drone.",
    options: ["True", "False"],
    correct: 0,
    explanation: "TRUE — CAAP enforcement actions for violations (including flying commercially without certification) can include fines up to ₱200,000, on-site equipment confiscation, and in severe cases, criminal charges. All three are tools available to CAAP.",
  },

  // ── Hard Scenario / Emergency Questions ──────────────────────────────────────
  {
    id: 31,
    type: "mc",
    category: "Emergency — GPS Loss",
    question: "You are flying at 300 ft AGL over an open field when your controller suddenly displays 'GPS Signal Lost.' Your drone immediately starts drifting in Attitude mode. What is the correct immediate action?",
    options: [
      "Ascend to 400 ft to try to reacquire GPS signal",
      "Activate Return-to-Home — it will guide the drone back automatically",
      "Take manual control immediately and fly the drone back to your position using visual reference",
      "Switch to autonomous waypoint mode to resume the mission safely",
    ],
    correct: 2,
    explanation: "RTH requires GPS to navigate — it will NOT work without a GPS fix. Ascending only increases drift risk. You must manually fly the drone back using visual reference in attitude mode. This is why practicing attitude-mode flying is critical before any mission.",
  },
  {
    id: 32,
    type: "mc",
    category: "Emergency — Compass Error",
    question: "Before takeoff on a commercial shoot, your drone's pre-flight check shows a 'Compass Error' warning. The GPS signal is strong (18 satellites). What is the correct action?",
    options: [
      "Proceed — strong GPS signal compensates for compass errors",
      "Perform a quick compass calibration on the spot, then take off immediately",
      "Do not fly — resolve the compass error completely before any flight",
      "Switch to ATTI mode which bypasses the compass system",
    ],
    correct: 2,
    explanation: "The compass determines the drone's heading. A compass error causes erratic, unpredictable flight behavior even with strong GPS — the drone may yaw uncontrollably or fly in the wrong direction. NEVER fly with an unresolved compass error. Calibration must be done in a magnetically clean area and verified before flight.",
  },
  {
    id: 33,
    type: "mc",
    category: "Emergency — Signal Loss",
    question: "You are conducting a coastal survey when you suddenly lose control link with your drone. The drone starts drifting toward open water. Before this mission, you had set a failsafe. Which pre-configured failsafe is BEST for this over-water scenario?",
    options: [
      "Hover in place — so you can try to reconnect",
      "Land immediately — to prevent the drone going further",
      "Return to Home — so the drone autonomously navigates back to the launch point",
      "Cut motors — to prevent flyaway damage",
    ],
    correct: 2,
    explanation: "Over water, 'Land immediately' destroys the drone. 'Hover' leaves it drifting with wind/current. 'Cut motors' means it crashes into the sea. RTH is the only failsafe that actively returns the drone to safety — assuming home point was set and GPS was locked before takeoff. Always verify your failsafe settings are appropriate for each mission environment.",
  },
  {
    id: 34,
    type: "mc",
    category: "Emergency — Strong Wind",
    question: "Mid-mission at 250 ft AGL, your telemetry shows wind speed at 45 km/h. Your DJI Mini 5 Pro's rated maximum wind resistance is 38 km/h (Level 6 Beaufort). The drone is struggling to hold position. What do you do?",
    options: [
      "Maintain the mission — GPS lock is still strong so the drone will compensate",
      "Ascend higher where winds are typically calmer at altitude",
      "Immediately return the drone at low altitude and abort the mission",
      "Switch to Sport mode which improves wind resistance",
    ],
    correct: 2,
    explanation: "Operating beyond the drone's rated wind resistance is dangerous. The drone cannot fight winds it was not designed for. Winds often increase with altitude, not decrease. Sport mode changes flight feel but does not increase physical wind resistance. Return immediately at a lower altitude (winds near ground are usually less severe) and abort. Your equipment limits are non-negotiable.",
  },
  {
    id: 35,
    type: "mc",
    category: "Emergency — Battery",
    question: "You are 700m from your takeoff point at 180 ft AGL. Your battery drops to 12% and your controller alerts 'Critical Low Battery — Initiating Auto-Landing.' You are currently over a populated street. What is your best response?",
    options: [
      "Let auto-landing execute — the system knows best at critical battery",
      "Override auto-landing, gain altitude, and try to glide back to your launch point",
      "Override auto-landing immediately, fly at maximum speed to the nearest safe open area, and land there",
      "Cut throttle to zero to reduce battery drain and hover in place",
    ],
    correct: 2,
    explanation: "Auto-landing over a populated street is dangerous. You must override it immediately and redirect the drone to the nearest safe, clear area — even if you can't make it back to the launch point. The priority is to land in an area clear of people. Never let the drone auto-land over crowds or traffic. At 12%, every second counts — move fast.",
  },
  {
    id: 36,
    type: "mc",
    category: "Emergency — Motor Failure",
    question: "While hovering at 120 ft AGL over a field, your drone suddenly begins spinning rapidly and losing altitude. This most likely indicates what, and what is your immediate response?",
    options: [
      "GPS interference — switch to ATTI mode and stabilize the hover",
      "A compass error — perform mid-air compass recalibration by yawing 360°",
      "A motor or ESC failure — immediately try to guide it toward the safest possible landing area away from people",
      "A strong wind gust — increase throttle to maximum to fight the rotation",
    ],
    correct: 2,
    explanation: "Rapid uncontrolled rotation and altitude loss in a hover is the classic signature of a motor or ESC failure. The drone can no longer maintain stable flight. You will likely not be able to control it precisely, but do your best to steer it away from people toward open ground. Increasing throttle on a failed motor system makes the spin worse.",
  },
  {
    id: 37,
    type: "mc",
    category: "Weather Decision-Making",
    question: "You are 20 minutes into a commercial rooftop shoot. You notice the sky darkening rapidly and your weather app shows a storm cell 6 km away moving toward you at 30 km/h. Visibility is still good. What is the correct action?",
    options: [
      "Continue — the storm is still 6 km away and visibility is fine",
      "Complete the current sequence then land before the storm arrives",
      "Land immediately and pack up — weather can deteriorate faster than a drone can safely return",
      "Fly higher to visually assess the storm's direction and proximity before deciding",
    ],
    correct: 2,
    explanation: "A storm 6 km away at 30 km/h arrives in 12 minutes. By the time you finish 'one more sequence,' pack up, and get clear, conditions may already be dangerous. In tropical weather especially, storm cells accelerate and intensify rapidly. The correct professional decision is always to land immediately when a storm is approaching — not to optimize your last shot.",
  },
  {
    id: 38,
    type: "mc",
    category: "Emergency — Obstacle",
    question: "Your drone is on an automated waypoint mission at 80 ft AGL through a residential neighborhood when you spot an unmarked power line directly in its flight path, not visible on the map. What is the correct action?",
    options: [
      "Monitor for a few seconds — the obstacle avoidance sensors will detect and avoid it",
      "Immediately take manual control and navigate the drone around or above the obstacle",
      "Activate RTH — it will calculate a safe path home away from the obstacle",
      "Increase altitude rapidly using the auto-ascend function",
    ],
    correct: 1,
    explanation: "NEVER rely on obstacle avoidance for unmarked hazards during an automated mission. Obstacle avoidance may not detect thin wires. RTH follows a pre-programmed path that may also intersect the wire. You, as the certified controller, must take immediate manual control when you see a hazard. Your visual observation always overrides automation.",
  },
  {
    id: 39,
    type: "mc",
    category: "RF Interference",
    question: "While flying near a large cell tower, your drone begins to drift erratically, loses position hold despite strong GPS, and your compass indicator shows sudden instability. What is the most likely cause and correct response?",
    options: [
      "Low battery causing sensor degradation — land immediately at the current position",
      "A software bug — restart the drone controller to reset sensors",
      "Electromagnetic interference from the tower affecting compass and control signal — fly away from the tower and land",
      "GPS jamming — activate BVLOS mode to escape the interference zone",
    ],
    correct: 2,
    explanation: "Cell towers and high-power radio emitters generate electromagnetic fields that can saturate the compass sensor and interfere with the 2.4/5.8 GHz control signal. The correct response is to immediately fly away from the source (put distance between you and the tower) and land safely. Do NOT attempt to recalibrate the compass while still in the interference zone.",
  },
  {
    id: 40,
    type: "mc",
    category: "Pre-flight Failure",
    question: "You arrive at your commercial shoot location and discover you left your UAS Operator Certificate documentation at your office. A CAAP enforcement officer is present at the site. What must you do?",
    options: [
      "Proceed — your certificate is valid, even if the physical document isn't on you",
      "Show only your RPA Controller Certificate — that covers pilot authorization",
      "Postpone the flight — you are legally required to have your authorization documents available during commercial operations",
      "Ask your office to email you a PDF copy to show the officer",
    ],
    correct: 2,
    explanation: "PCAR requires operators to have certification documentation available and producible during commercial flights. A CAAP enforcement officer has grounds to halt your operation if you cannot produce the required documents on-site. An emailed PDF may not satisfy on-site legal document requirements. Always carry copies of all operational documents on every job.",
  },
  {
    id: 41,
    type: "mc",
    category: "Human Factors",
    question: "You have been on a demanding multi-location event shoot for 9 straight hours. Your client requests one final 30-minute aerial sequence at 6 PM. You feel mentally fatigued and your reaction time feels slow. What is the safest professional response?",
    options: [
      "Proceed — 30 more minutes is manageable and the client is counting on you",
      "Take a 10-minute coffee break then proceed with the final sequence",
      "Decline or hand controls to a rested, certified co-pilot — fatigue is a serious flight safety risk",
      "Proceed but fly conservatively at low altitude and slow speed",
    ],
    correct: 2,
    explanation: "Pilot fatigue is a recognized aviation safety hazard. A fatigued controller has degraded reaction time, reduced situational awareness, and poor judgment — the exact opposite of what safe drone operations require. No deadline or client expectation justifies flying fatigued. If no rested, certified co-pilot is available, postpone the final sequence. Safety is non-negotiable.",
  },
  {
    id: 42,
    type: "mc",
    category: "Emergency — Bystander Safety",
    question: "You are descending for a landing when a child runs into your marked landing zone directly beneath your drone at 15 ft AGL. What is the correct immediate action?",
    options: [
      "Continue landing quickly — the child will see and move away from the descending drone",
      "Yell at the child to move and continue your descent while steering slightly away",
      "Immediately abort the landing, ascend to a safe hover altitude, and wait until the zone is completely clear before attempting again",
      "Land in an alternate spot immediately even if the surface is uneven",
    ],
    correct: 2,
    explanation: "NEVER land with a bystander — especially a child — in the landing zone. Abort immediately and hover safely. The 30-meter lateral clearance rule applies to ALL flight phases including landing. An uneven alternate landing spot introduces new risks. Always wait until the zone is fully clear and then re-verify before re-attempting. Safety of bystanders is the absolute priority.",
  },
  {
    id: 43,
    type: "mc",
    category: "Night Ops / Permits",
    question: "You have a valid CAAP Special Flight Permit authorizing night operations until 8:00 PM. It is 7:56 PM and you are mid-sequence on the final shot your client needs. What is the correct action?",
    options: [
      "Quickly complete the shot — 4 minutes won't matter and the client needs it",
      "Ask your client for verbal authorization to continue past 8:00 PM",
      "Land immediately — your permit window expires at 8:00 PM and operating past it is a violation",
      "Log the overage in your flight record and notify CAAP the next business day",
    ],
    correct: 2,
    explanation: "CAAP special permits have strict time windows. Flying outside your authorized window — even by minutes — is a regulatory violation regardless of how close to the end you were. Client needs, verbal permissions, or proximity to completion do not extend your permit. Always plan your mission to finish well before your permit expiry time.",
  },
  {
    id: 44,
    type: "mc",
    category: "ATTI Mode Knowledge",
    question: "Your drone's GPS module fails mid-flight and the drone switches automatically to Attitude (ATTI) mode. What does this mean for your flight controls?",
    options: [
      "The drone will hold its current GPS position using its last known coordinates",
      "The drone will maintain altitude only using the barometer — it will drift horizontally with wind and requires continuous manual correction",
      "The drone automatically activates the compass to replace GPS positioning",
      "ATTI mode is equivalent to GPS mode but uses cellular tower triangulation instead",
    ],
    correct: 1,
    explanation: "Attitude mode uses only the barometer (altitude) and IMU (orientation) — there is NO position hold. The drone WILL drift with wind and any control input must account for this. You must actively counter drift with stick inputs to maintain your intended flight path. This is why pilots must practice ATTI mode flying — GPS failure is a real scenario during exams and real flights.",
  },
  {
    id: 45,
    type: "mc",
    category: "Urban Airspace",
    question: "You plan to fly a commercial shoot in a dense urban area between tall buildings (an 'urban canyon'). Which specific hazard should you plan for that does NOT typically affect flights in open rural areas?",
    options: [
      "Higher legal altitude limits apply in urban areas",
      "GPS multipath interference from building reflections causing position errors and unexpected drifts",
      "Reduced battery consumption due to wind protection from the buildings",
      "Stronger control signal due to nearby cellular infrastructure",
    ],
    correct: 1,
    explanation: "Urban canyons cause GPS multipath interference — GPS signals bounce off buildings before reaching the drone, causing the GPS module to calculate incorrect position fixes. This leads to sudden unexpected drifts, position jumps, and erratic behavior even with a high satellite count. Urban canyon flights require extra caution, lower speeds, and readiness to take manual control at any moment.",
  },

  // ── Hard True / False ────────────────────────────────────────────────────────
  {
    id: 46,
    type: "tf",
    category: "Emergency — RTH",
    question: "Scenario: Your drone loses GPS signal completely mid-flight. Your pre-configured failsafe is set to 'Return to Home.' The drone will successfully navigate back to the home point using RTH.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — Return-to-Home requires an active GPS fix to navigate back to the stored home point coordinates. Without GPS, the RTH function cannot execute. The drone will typically switch to Attitude mode and hover or drift. This is why pilots must know how to manually fly in ATTI mode as a backup.",
  },
  {
    id: 47,
    type: "tf",
    category: "ATTI Mode",
    question: "Scenario: Your drone is hovering in Attitude (ATTI) mode. You release both sticks to the center position. The drone will maintain its current GPS position and hover in place.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — Attitude mode has NO GPS position hold. Releasing the sticks only centers the control inputs — the drone will continue to drift with wind because there is no GPS-based stabilization holding its position. You must actively apply stick corrections to counter drift in ATTI mode.",
  },
  {
    id: 48,
    type: "tf",
    category: "Compass",
    question: "A compass calibration error warning can be safely dismissed if you plan to fly in an open area well away from any metal structures, vehicles, or power lines.",
    options: ["True", "False"],
    correct: 1,
    explanation: "FALSE — A compass error warning means the compass sensor reading is unreliable regardless of your location. Even in an open field, an uncalibrated or malfunctioning compass will give the drone incorrect heading data, which can cause erratic yaw behavior, position drift, or flyaway. A compass error must always be resolved before flight.",
  },
  {
    id: 49,
    type: "tf",
    category: "RF Interference",
    question: "Strong electromagnetic fields from high-voltage power lines or cellular towers can cause a drone to drift and behave erratically even when the GPS satellite count is high and signal strength is good.",
    options: ["True", "False"],
    correct: 0,
    explanation: "TRUE — Electromagnetic interference primarily affects the compass (magnetometer) sensor, not GPS directly. Even with 20 satellites locked, a compass reading corrupted by a nearby EMF source will feed bad heading data to the flight controller, causing position drift, yaw errors, and unstable flight.",
  },
  {
    id: 50,
    type: "tf",
    category: "Human Factors",
    question: "Pilot fatigue is classified as a human performance hazard in aviation. A drone controller who is physically and mentally fatigued is at greater risk of making unsafe decisions and having slower emergency reaction times.",
    options: ["True", "False"],
    correct: 0,
    explanation: "TRUE — Fatigue is one of the most studied human performance hazards in aviation. It impairs reaction time, situational awareness, judgment, and decision-making — all critical for safe drone operations. Recognizing personal fatigue and refusing to fly when impaired is a key professional and safety responsibility.",
  },
];

const EXAM_SIZE = 30;

type ExamPhase = "start" | "quiz" | "result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function MockExamTab() {
  const [phase, setPhase] = useState<ExamPhase>("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  function startExam() {
    const q = shuffle(ALL_QUESTIONS).slice(0, EXAM_SIZE);
    setQuestions(q);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers(new Array(q.length).fill(null));
    setPhase("quiz");
  }

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function handleReveal() {
    if (selected === null) return;
    const updated = [...answers];
    updated[current] = selected;
    setAnswers(updated);
    setRevealed(true);
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setPhase("result");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setRevealed(false);
    }
  }

  if (phase === "start") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] py-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-[32px] mb-5"
          style={{ background: "rgba(168,139,250,0.12)", border: "1px solid rgba(168,139,250,0.25)" }}>
          ✎
        </div>
        <h2 className="text-[20px] font-bold text-white mb-1">CAAP RPAS Mock Exam</h2>
        <p className="text-[13px] text-white/45 mb-6 text-center max-w-md leading-relaxed">
          Situational and scenario-based questions — GPS loss, emergency procedures, weather decisions, regulations, and pilot responsibilities. Harder questions included, just like the actual exam.
        </p>
        <div className="flex gap-4 mb-8">
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.18)" }}>
            <p className="text-[20px] font-bold text-cyan-400">{EXAM_SIZE}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Per session</p>
          </div>
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(168,139,250,0.08)", border: "1px solid rgba(168,139,250,0.18)" }}>
            <p className="text-[20px] font-bold text-purple-400">{ALL_QUESTIONS.length}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Question pool</p>
          </div>
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.18)" }}>
            <p className="text-[20px] font-bold text-amber-400">75%</p>
            <p className="text-[11px] text-white/40 mt-0.5">Passing score</p>
          </div>
        </div>
        <button
          onClick={startExam}
          className="px-8 py-3 rounded-xl text-[14px] font-semibold text-black transition-all hover:opacity-90 active:scale-95"
          style={{ background: "#a78bfa" }}
        >
          Start Exam
        </button>
        <p className="text-[11px] text-white/20 mt-4">30 random questions drawn from a {ALL_QUESTIONS.length}-item pool — different every attempt</p>
      </div>
    );
  }

  if (phase === "result") {
    const score = answers.filter((a, i) => a === questions[i].correct).length;
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 75;
    return (
      <div className="space-y-4 pb-6">
        {/* Score card */}
        <div className="rounded-2xl p-6 text-center" style={{ background: passed ? "rgba(52,211,153,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${passed ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}` }}>
          <p className="text-[48px] font-bold leading-none" style={{ color: passed ? "#34d399" : "#f87171" }}>{pct}%</p>
          <p className="text-[14px] font-semibold mt-2" style={{ color: passed ? "#34d399" : "#f87171" }}>{passed ? "PASSED" : "NEEDS REVIEW"}</p>
          <p className="text-[13px] text-white/45 mt-1">{score} of {questions.length} correct · Passing score: 75%</p>
          <button
            onClick={startExam}
            className="mt-5 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-black transition-all hover:opacity-90"
            style={{ background: "#a78bfa" }}
          >
            Retake Exam
          </button>
        </div>

        {/* Breakdown */}
        <div className="space-y-3">
          {questions.map((q, i) => {
            const chosen = answers[i];
            const correct = chosen === q.correct;
            const opts = q.options ?? ["True", "False"];
            return (
              <div
                key={q.id}
                className="rounded-2xl p-4"
                style={{
                  background: correct ? "rgba(52,211,153,0.05)" : "rgba(239,68,68,0.05)",
                  border: `1px solid ${correct ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.15)"}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                    style={{
                      background: correct ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)",
                      color: correct ? "#34d399" : "#f87171",
                    }}
                  >
                    {correct ? "✓" : "✕"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                        {q.type === "mc" ? "MC" : "T/F"}
                      </span>
                      <span className="text-[10px] text-white/25">{q.category}</span>
                    </div>
                    <p className="text-[12.5px] text-white/80 leading-snug mb-2">{q.question}</p>
                    <div className="space-y-1 mb-2.5">
                      {opts.map((opt, oi) => {
                        const isCorrect = oi === q.correct;
                        const isChosen = oi === chosen;
                        let color = "rgba(255,255,255,0.25)";
                        if (isCorrect) color = "#34d399";
                        else if (isChosen && !isCorrect) color = "#f87171";
                        return (
                          <div key={oi} className="flex items-center gap-2">
                            <span className="text-[10px] font-bold" style={{ color }}>
                              {isCorrect ? "✓" : isChosen ? "✕" : "○"}
                            </span>
                            <span className="text-[12px] leading-snug" style={{ color }}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11.5px] text-white/45 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // quiz phase
  const q = questions[current];
  const opts = q.options ?? ["True", "False"];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-4 pb-6 max-w-2xl">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-white/30">{current + 1} / {questions.length}</span>
          <span className="text-[11px] font-semibold" style={{ color: "#a78bfa" }}>{q.category}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "#a78bfa" }} />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: q.type === "mc" ? "rgba(6,182,212,0.12)" : "rgba(168,139,250,0.12)",
              color: q.type === "mc" ? "#06b6d4" : "#a78bfa",
              border: `1px solid ${q.type === "mc" ? "rgba(6,182,212,0.2)" : "rgba(168,139,250,0.2)"}`,
            }}
          >
            {q.type === "mc" ? "Multiple Choice" : "True / False"}
          </span>
        </div>
        <p className="text-[14px] text-white leading-relaxed font-medium">{q.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2">
        {opts.map((opt, oi) => {
          const isSelected = selected === oi;
          const isCorrect = oi === q.correct;
          let bg = "rgba(255,255,255,0.04)";
          let border = "rgba(255,255,255,0.08)";
          let textColor = "rgba(255,255,255,0.7)";
          if (revealed) {
            if (isCorrect) { bg = "rgba(52,211,153,0.1)"; border = "rgba(52,211,153,0.35)"; textColor = "#34d399"; }
            else if (isSelected) { bg = "rgba(239,68,68,0.1)"; border = "rgba(239,68,68,0.35)"; textColor = "#f87171"; }
          } else if (isSelected) {
            bg = "rgba(168,139,250,0.12)"; border = "rgba(168,139,250,0.35)"; textColor = "#c4b5fd";
          }
          return (
            <button
              key={oi}
              onClick={() => handleSelect(oi)}
              disabled={revealed}
              className="w-full text-left rounded-xl px-4 py-3 transition-all flex items-center gap-3"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{
                  background: revealed && isCorrect ? "rgba(52,211,153,0.2)" : revealed && isSelected ? "rgba(239,68,68,0.2)" : isSelected ? "rgba(168,139,250,0.2)" : "rgba(255,255,255,0.06)",
                  color: textColor,
                  border: `1px solid ${border}`,
                }}
              >
                {revealed
                  ? isCorrect ? "✓" : isSelected ? "✕" : ["A","B","C","D","T","F"][oi]
                  : ["A","B","C","D","T","F"][oi]}
              </span>
              <span className="text-[13px] leading-snug" style={{ color: textColor }}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div
          className="rounded-xl p-4"
          style={{
            background: selected === q.correct ? "rgba(52,211,153,0.06)" : "rgba(239,68,68,0.06)",
            border: `1px solid ${selected === q.correct ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: selected === q.correct ? "#34d399" : "#f87171" }}>
            {selected === q.correct ? "Correct" : "Incorrect"}
          </p>
          <p className="text-[12.5px] text-white/60 leading-relaxed">{q.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold transition-all"
            style={{
              background: selected !== null ? "#a78bfa" : "rgba(255,255,255,0.06)",
              color: selected !== null ? "#000" : "rgba(255,255,255,0.2)",
              cursor: selected !== null ? "pointer" : "not-allowed",
            }}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-black transition-all hover:opacity-90"
            style={{ background: "#06b6d4" }}
          >
            {current + 1 >= questions.length ? "See Results" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function RegsPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: SYSTEM_FONT, background: "#0f0f0f" }}
    >
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-[22px]">⚖</span>
          <div>
            <h1 className="text-[17px] font-bold text-white">PCAR / RPAS Regulations</h1>
            <p className="text-[11px] text-white/35">CAAP Philippines · RA 9497 · MC 010-2024 · Ask Panchi for details ↙</p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              background: tab === t.key ? "rgba(6,182,212,0.15)" : "transparent",
              color: tab === t.key ? "#06b6d4" : "rgba(255,255,255,0.4)",
              border: tab === t.key ? "1px solid rgba(6,182,212,0.3)" : "1px solid transparent",
            }}
          >
            <span className="text-[12px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {tab === "overview"     && <OverviewTab />}
        {tab === "icao"         && <IcaoTab />}
        {tab === "registration" && <RegistrationTab />}
        {tab === "pilots"       && <PilotsTab />}
        {tab === "commercial"   && <CommercialTab />}
        {tab === "operations"   && <OperationsTab />}
        {tab === "noflyzone"    && <NoFlyTab />}
        {tab === "penalties"    && <PenaltiesTab />}
      </div>
    </div>
  );
}
