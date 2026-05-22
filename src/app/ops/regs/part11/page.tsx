"use client";

import { useState } from "react";
import Link from "next/link";
import { SYSTEM_FONT } from "@/lib/ops";

type Tab = "overview" | "categories" | "certificates" | "flightrules" | "permits" | "roles" | "aerialwork";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "overview",     label: "Overview",          icon: "⊕" },
  { key: "categories",  label: "Op Categories",      icon: "◈" },
  { key: "certificates",label: "Certificates",        icon: "⊞" },
  { key: "flightrules", label: "Flight Rules",        icon: "⊡" },
  { key: "permits",     label: "Special Permits",     icon: "⊗" },
  { key: "roles",       label: "Roles & Duties",      icon: "⊛" },
  { key: "aerialwork",  label: "Aerial Work Types",   icon: "◐" },
];

/* ── shared primitives ─────────────────────────────── */

function Sec({ id, label, color = "#06b6d4" }: { id: string; label?: string; color?: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
      style={{ background: `${color}15`, color, border: `1px solid ${color}28` }}>
      {label || id}
    </span>
  );
}

function Card({ title, sec, secColor, children }: { title: string; sec?: string; secColor?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {sec && <Sec id={sec} color={secColor} />}
        <p className="text-[13px] font-semibold text-white">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Rule({ children, bad }: { children: React.ReactNode; bad?: boolean }) {
  const color = bad ? "#f87171" : "#34d399";
  const bg = bad ? "rgba(239,68,68,0.12)" : "rgba(52,211,153,0.12)";
  const border = bad ? "rgba(239,68,68,0.28)" : "rgba(52,211,153,0.28)";
  return (
    <li className="flex items-start gap-2.5 text-[12.5px] text-white/70 leading-snug">
      <span className="mt-[3px] shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
        style={{ background: bg, color, border: `1px solid ${border}` }}>
        {bad ? "✕" : "✓"}
      </span>
      {children}
    </li>
  );
}

function Callout({ title, children, color = "#fbbf24" }: { title: string; children: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: `${color}0a`, border: `1px solid ${color}22` }}>
      <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color }}>{title}</p>
      <div className="text-[12.5px] text-white/65 leading-relaxed space-y-1">{children}</div>
    </div>
  );
}

function Stat({ value, label, color = "#06b6d4" }: { value: string; label: string; color?: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <p className="text-[20px] font-bold leading-none mb-1" style={{ color }}>{value}</p>
      <p className="text-[11px] text-white/50 leading-snug">{label}</p>
    </div>
  );
}

/* ── TABS ──────────────────────────────────────────── */

function OverviewTab() {
  const defs = [
    { term: "Assemblies of People", body: "A crowd of people. Not defined by a specific number, but related to the possibility for an individual to move around to avoid consequences of an out-of-control drone." },
    { term: "Certificate of Authorization", body: "A certificate issued by CAAP to an operator conducting aerial work operations." },
    { term: "Indoors", body: "The area or space inside a building." },
    { term: "Notice to Airmen (NOTAM)", body: "A notice distributed by telecommunication containing information about establishment, condition, or change in any aeronautical facility, service, procedure, or hazard." },
    { term: "Operator", body: "A person, organization, or enterprise engaged in or offering to engage in manned or unmanned aircraft operations." },
    { term: "Remote Pilot", body: "A person charged with duties essential to the operation of an unmanned aircraft who manipulates the flight controls during flight time." },
    { term: "Risk Mitigation", body: "The process of incorporating defenses or preventive controls to lower the severity and/or likelihood of a hazard and its projected consequences." },
    { term: "RPA Visual Observer", body: "A trained and competent person designated by the operator who, by visual observation of the unmanned aircraft, assists the remote pilot in the safe conduct of the flight." },
    { term: "Shielded Operation", body: "An operation of an aircraft within 100 m of, and below the top of, a natural or man-made object." },
    { term: "Unmanned Aircraft (UA)", body: "An aircraft intended to be operated with no pilot onboard." },
    { term: "Unmanned Aircraft System (UAS)", body: "An unmanned aircraft and its associated components." },
    { term: "Safety", body: "The state in which risks associated with aviation activities are reduced and controlled to an acceptable level." },
    { term: "Safety Management System (SMS)", body: "A systematic approach to managing safety, including necessary organizational structures, accountability, responsibilities, policies, and procedures." },
  ];
  return (
    <div className="space-y-5">
      <Callout title="MC 010-2024 — What Changed" color="#a78bfa">
        <p>Memorandum Circular No. 010-2024 from the CAAP Director General amends <strong className="text-white">PCAR Parts 1 and 11</strong> on Aerial Works and RPAS Certification.</p>
        <p className="mt-1">Legal basis: <strong className="text-white">Republic Act No. 9497</strong> (Civil Aviation Authority Act of 2008) · Board Resolution No. 2012-054 · ICAO Model Regulations Part 101 and 102.</p>
      </Callout>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat value="11.11" label="Primary RPAS subpart" color="#06b6d4" />
        <Stat value="5 yrs" label="Certificate of Authorization validity" color="#34d399" />
        <Stat value="48 hrs" label="Accident/incident report deadline" color="#f87171" />
        <Stat value="30 days" label="Advance notice for cert renewal" color="#fbbf24" />
      </div>

      <Card title="Part 11 Coverage at a Glance" sec="§11.11.1">
        <p className="text-[12.5px] text-white/55 mb-3">Part 11 prescribes rules governing the operation of civil Remotely Piloted Aircraft Systems (RPAS). It covers:</p>
        <div className="grid grid-cols-2 gap-2">
          {["RPAS registration requirements","Accident & incident reporting","Airspace knowledge requirements","Hazard & risk minimization","Right-of-way (give way to manned aircraft)","Alcohol & drug prohibition","Operation categories (Open/Specific/Certified)","Certificate of Authorization procedures","Special Flight Permits","Aerial work type-specific rules"].map(i => (
            <div key={i} className="flex items-start gap-2 text-[12px] text-white/60">
              <span className="text-cyan-400 mt-0.5 shrink-0">◦</span>{i}
            </div>
          ))}
        </div>
      </Card>

      <Card title="New Definitions Added by MC 010-2024" sec="Part 1 Appendix A">
        <div className="space-y-3">
          {defs.map(d => (
            <div key={d.term} className="py-2.5 border-b border-white/[0.05] last:border-0">
              <p className="text-[13px] font-semibold text-white mb-0.5">{d.term}</p>
              <p className="text-[12px] text-white/55 leading-snug">{d.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CategoriesTab() {
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-white/50 leading-relaxed">
        Under §11.11.8, all RPAS operations are classified into three risk-based categories. Your category determines what certificates you need.
      </p>

      {/* Category cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Open", risk: "Low Risk", color: "#34d399", icon: "○",
            desc: "Maximum Take-off Mass ≤ 25 kg. Must meet all standard operating conditions.",
            reqs: ["VLOS at all times","Max 120 m AGL","≥ 30 m from uninvolved persons","≥ 150 m from residential / commercial / industrial / recreational areas","No goods carriage","Familiar with manufacturer's manual","Only one RPA per operator"] },
          { label: "Specific", risk: "Medium / Regulated", color: "#fbbf24", icon: "◐",
            desc: "Any operation where one Open Category condition is not met. Requires Certificate of Authorization from CAAP (§11.1.6).",
            reqs: ["Certificate of Authorization required","Remote Pilot License required","RPA registered","Third-Party Liability Insurance required","Includes: aerial photography, surveys, mapping, events, construction, SAR, agriculture and 16 other types"] },
          { label: "Certified", risk: "High Risk", color: "#f87171", icon: "●",
            desc: "Operations involving carriage of passengers or engaged in international operations.",
            reqs: ["Certificate of Airworthiness required","Highest regulatory burden","International flight operations","Passenger carriage included"] },
        ].map(cat => (
          <div key={cat.label} className="rounded-2xl p-5" style={{ background: `${cat.color}07`, border: `1px solid ${cat.color}22` }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[18px]" style={{ color: cat.color }}>{cat.icon}</span>
              <h2 className="text-[15px] font-bold" style={{ color: cat.color }}>{cat.label}</h2>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: `${cat.color}99` }}>{cat.risk}</p>
            <p className="text-[12px] text-white/55 leading-snug mb-3">{cat.desc}</p>
            <ul className="space-y-1.5">
              {cat.reqs.map(r => (
                <li key={r} className="flex items-start gap-2 text-[11.5px] text-white/60">
                  <span style={{ color: cat.color }} className="mt-0.5 shrink-0">·</span>{r}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Card title="Standard RPAS Operating Conditions" sec="§11.11.8.1">
        <p className="text-[12px] text-white/40 mb-3">An RPA is in <strong className="text-white">standard operating conditions</strong> if ALL of the following are met during the operation:</p>
        <ul className="space-y-2">
          <Rule>Operated within Visual Line-of-Sight (VLOS)</Rule>
          <Rule>Operated within 120 m AGL</Rule>
          <Rule>Not within 30 m of any uninvolved person</Rule>
          <Rule>Only one RPA operated per person during the operation</Rule>
          <Rule bad>Not at night</Rule>
          <Rule bad>Not in a prohibited or restricted area</Rule>
          <Rule bad>Not over national security-sensitive facilities</Rule>
          <Rule bad>Not over assemblies of people</Rule>
          <Rule bad>Not within 10 km of a controlled aerodrome</Rule>
          <Rule bad>Not over fire, police, or emergency operation areas</Rule>
          <Rule bad>Not on-board a moving vehicle</Rule>
        </ul>
      </Card>

      <Callout title="Your Drone — DJI Mini 5 Pro (248 g, MTOM &lt; 25 kg)" color="#06b6d4">
        <p>Qualifies for the <strong className="text-white">Open Category</strong> for recreational use — no Certificate of Authorization needed if all standard conditions are met.</p>
        <p className="mt-1">For <strong className="text-amber-300">commercial use</strong> (aerial photography, real estate, events) → <strong className="text-white">Specific Category</strong> → Certificate of Authorization + RPL + registration + TPL insurance required.</p>
      </Callout>
    </div>
  );
}

function CertificatesTab() {
  return (
    <div className="space-y-5">
      <Card title="Certificate of Authorization — Issuance" sec="§11.1.1.6">
        <p className="text-[12px] text-white/40 mb-3">CAAP may issue a Certificate of Authorization if the applicant:</p>
        <ul className="space-y-2 mb-4">
          <Rule>Is a citizen of the Republic of the Philippines</Rule>
          <Rule>Has principal place of business and registered office in the Philippines</Rule>
          <Rule>Meets applicable regulations and standards for the certificate</Rule>
          <Rule>Is properly and adequately equipped for safe aerial work operations and maintenance</Rule>
        </ul>
        <p className="text-[12px] text-white/40 mb-3">CAAP may <strong className="text-red-400">deny</strong> the application if:</p>
        <ul className="space-y-2">
          <Rule bad>Applicant is not properly equipped or cannot conduct safe aerial work</Rule>
          <Rule bad>Applicant cannot provide proper maintenance to its aircraft</Rule>
          <Rule bad>Applicant previously held a certificate that was revoked</Rule>
        </ul>
      </Card>

      <Card title="Certificate Contents" sec="§11.1.1.7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">Certificate of Authorization</p>
            <ul className="space-y-1.5">
              {["Issuing authority, contact details & address","Operator's name (or trading name if different)","Operator's contact details & address of principal place of business","Period of validity","Date of issuance, name, title, and signature of authority representative"].map(i => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-white/60"><span className="text-cyan-400 shrink-0 mt-0.5">·</span>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-2">Operations Specifications (for RPA)</p>
            <ul className="space-y-1.5">
              {["Issuing authority & contact details","Operator's name / trading name","Certificate of Authorization number","RPA model and type","Type of operation","Areas of operations","Special authorizations: night flying, max altitude, distance from ARP, BVLOS, RPA controller, camera"].map(i => (
                <li key={i} className="flex items-start gap-2 text-[12px] text-white/60"><span className="text-purple-400 shrink-0 mt-0.5">·</span>{i}</li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Duration" sec="§11.1.1.8">
          <ul className="space-y-2">
            <Rule>Valid for <strong className="text-white">5 years</strong> from date of issuance</Rule>
            <Rule bad>Invalid if CAAP amends, suspends, or cancels it</Rule>
            <Rule bad>Invalid if operator surrenders it to CAAP</Rule>
            <Rule bad>Invalid if operator suspends operations for more than <strong className="text-white">60 days</strong></Rule>
          </ul>
        </Card>
        <Card title="Renewal" sec="§11.1.1.9">
          <p className="text-[12.5px] text-white/65 leading-relaxed">
            An operator may apply for renewal of its Certificate of Authorization at least <strong className="text-white">30 days</strong> before the end of the existing period of validity.
          </p>
        </Card>
      </div>

      <Card title="Amendment" sec="§11.1.1.10">
        <ul className="space-y-2">
          <Rule>May be amended on the Authority's own initiative or upon application by the holder</Rule>
          <Rule>Application must be filed at least <strong className="text-white">15 days</strong> before the intended effective date</Rule>
          <Rule>CAAP will grant amendment if it determines safety and public interest allow</Rule>
          <Rule>If denied, holder may file a petition to reconsider within <strong className="text-white">30 days</strong></Rule>
          <Rule bad>No aerial work may be performed if an amendment is required but not yet approved</Rule>
        </ul>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Cancellation" sec="§11.1.1.15">
          <p className="text-[12px] text-white/40 mb-2">CAAP may cancel the certificate by written notice if:</p>
          <ul className="space-y-2">
            <Rule bad>Holder committed a violation of PCAR or certification limitation</Rule>
            <Rule bad>Holder negligently operated aircraft or recklessly endangered human life or property</Rule>
            <Rule bad>Holder ceases operations under the certificate for <strong className="text-white">60 days</strong></Rule>
          </ul>
        </Card>
        <Card title="Key Rules" sec="§11.1.1.13–16">
          <ul className="space-y-2">
            <Rule bad>Certificate is <strong className="text-white">not transferable</strong></Rule>
            <Rule>Must grant CAAP free and uninterrupted access to facilities and aircraft for inspection</Rule>
            <Rule>Must notify CAAP in advance of any change of home base address</Rule>
            <Rule>Must surrender certificate if CAAP suspends/cancels it or if ops are suspended &gt;60 days</Rule>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function FlightRulesTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat value="120 m" label="Max altitude AGL (≈ 400 ft)" color="#f87171" />
        <Stat value="30 m" label="Min horizontal distance from uninvolved persons" color="#fbbf24" />
        <Stat value="10 km" label="Exclusion zone from controlled aerodrome" color="#f87171" />
        <Stat value="8 hrs" label="After alcohol consumption — no flying" color="#f87171" />
      </div>

      <Card title="VLOS — Visual Line-of-Sight" sec="§11.11.8.3.6">
        <ul className="space-y-2">
          <Rule bad>Do not operate where your view of the surrounding airspace is obstructed</Rule>
          <Rule bad>Do not operate in unfavorable meteorological conditions that obstruct VLOS</Rule>
          <Rule bad>Do not operate over any cloud base</Rule>
          <Rule bad>Do not operate without maintaining VLOS with the RPA</Rule>
          <Rule>VLOS means a clear straight line — corrective lenses (glasses, contacts) are allowed</Rule>
          <Rule bad>Electronic, mechanical, electromagnetic, or optical instruments do NOT count as VLOS</Rule>
        </ul>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Weather & Day Limitations" sec="§11.11.8.3.7">
          <ul className="space-y-2">
            <Rule bad>Do not operate in or into a cloud</Rule>
            <Rule bad>Do not operate at night (without Special Permit)</Rule>
            <Rule bad>Do not operate in conditions other than Visual Meteorological Conditions (VMC)</Rule>
          </ul>
        </Card>

        <Card title="Night Operations" sec="§11.11.8.3.8">
          <p className="text-[12px] text-white/40 mb-2">Night ops are prohibited <strong className="text-white">except</strong>:</p>
          <ul className="space-y-2">
            <Rule>Indoors (inside a building)</Rule>
            <Rule>Shielded operation (within 100 m of and below the top of a natural or man-made object)</Rule>
          </ul>
          <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.18)" }}>
            <p className="text-[11px] font-semibold text-purple-400 mb-1">With Special Permit — night ops allowed if RPA equipped with:</p>
            <ul className="space-y-1">
              <li className="text-[12px] text-white/60">· Anti-collision light</li>
              <li className="text-[12px] text-white/60">· Navigation light</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card title="Operation Near and Over People" sec="§11.11.8.3.9">
        <p className="text-[12px] text-white/40 mb-2">No person shall operate an RPA over a person unless the person is:</p>
        <ul className="space-y-2 mb-4">
          <Rule>Located under a covered structure or inside a stationary vehicle that provides reasonable protection</Rule>
          <Rule>Directly associated with the RPA operation AND at least 30 m from any second uninvolved person</Rule>
        </ul>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <p className="text-[11px] text-emerald-400 font-semibold mb-1">Airspace Rule (§11.11.8.3.5)</p>
            <p className="text-[12px] text-white/55">Operate at least 30 m from any person (measured horizontally). Continuously observe surrounding airspace. Max 120 m AGL.</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
            <p className="text-[11px] text-amber-400 font-semibold mb-1">Open Category Rule (§11.11.8)</p>
            <p className="text-[12px] text-white/55">Stay at least 150 m from residential, commercial, industrial, or recreational areas in Open Category operations.</p>
          </div>
        </div>
      </Card>

      <Card title="Aerodromes" sec="§11.11.8.3.4">
        <p className="text-[12px] text-white/40 mb-2">Do not operate within <strong className="text-white">10 km</strong> of an aerodrome unless ALL three conditions are met:</p>
        <ul className="space-y-2">
          <Rule>Special Permit secured from CAAP</Rule>
          <Rule>Each remote pilot has an RPA observer in attendance during flight</Rule>
          <Rule>RPA not operated above 120 m AGL</Rule>
        </ul>
      </Card>

      <Card title="Alcohol and Drugs" sec="§11.11.7">
        <p className="text-[12px] text-white/40 mb-2">No person shall act as a remote pilot or RPA observer:</p>
        <ul className="space-y-2">
          <Rule bad>Within <strong className="text-white">8 hours</strong> after consuming an alcoholic beverage</Rule>
          <Rule bad>While under the influence of alcohol</Rule>
          <Rule bad>While using any drug that impairs the person's faculties</Rule>
        </ul>
      </Card>

      <Card title="Prohibited Operations" sec="§11.11.8.3.10">
        <ul className="space-y-2">
          <Rule bad>No person shall operate an RPA in a careless or reckless manner as to endanger aviation safety or the safety of any person or property</Rule>
        </ul>
      </Card>

      <Card title="Accident & Incident Reporting" sec="§11.11.3">
        <ul className="space-y-2">
          <Rule>Remote pilot must report any serious injury to a person or damage to property (other than the RPA) within <strong className="text-white">48 hours</strong> after an RPAS operation</Rule>
          <Rule>Owner/operator shall file a report in accordance with <strong className="text-white">PCAR Part 13.040</strong></Rule>
        </ul>
      </Card>
    </div>
  );
}

function PermitsTab() {
  return (
    <div className="space-y-5">
      <Callout title="When a Special Permit is Required" color="#a78bfa">
        <p>A Special Permit is required any time you exceed the <strong className="text-white">standard RPAS operating conditions</strong> listed in §11.11.8.1 — regardless of whether you are in the Open or Specific category.</p>
      </Callout>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Night operations", detail: "Must have anti-collision + navigation light", color: "#a78bfa" },
          { label: "Beyond Visual Line of Sight (BVLOS)", detail: "Needs: Detect & Avoid + GPS + Homing device", color: "#a78bfa" },
          { label: "Within 10 km of aerodrome (ARP)", detail: "Requires RPA observer on site; max 120 m AGL", color: "#f87171" },
          { label: "Over populated areas", detail: "Special authorization required from CAAP", color: "#f87171" },
          { label: "Above 400 ft AGL (120 m)", detail: "Beyond standard altitude ceiling", color: "#f87171" },
          { label: "Controlled airspace", detail: "Requires aeronautical radio qualification", color: "#fbbf24" },
        ].map(item => (
          <div key={item.label} className="rounded-xl p-3.5" style={{ background: `${item.color}09`, border: `1px solid ${item.color}22` }}>
            <p className="text-[12.5px] font-semibold mb-1" style={{ color: item.color }}>{item.label}</p>
            <p className="text-[11.5px] text-white/45">{item.detail}</p>
          </div>
        ))}
      </div>

      <Card title="How to Apply for a Special Permit" sec="§11.11.8.2">
        <ul className="space-y-2">
          <Rule>Must hold a current Remote Pilot License (RPL)</Rule>
          <Rule>Intended operation must exceed standard conditions (§11.11.8.1) or exceed Operations Spec limits</Rule>
          <Rule>Meet requirements prescribed by CAAP</Rule>
          <Rule>CAAP will publish permit details (including conditions) in a <strong className="text-white">NOTAM</strong> if approved</Rule>
          <Rule bad>CAAP may revoke or change conditions at any time in the interest of air navigation safety</Rule>
          <Rule>Written notice of revocation or change will be provided to the permit holder</Rule>
        </ul>
      </Card>

      <Card title="Controlled Airspace Requirements" sec="§11.11.8.3.3">
        <p className="text-[12px] text-white/40 mb-2">To operate an RPA in controlled airspace, you must:</p>
        <ul className="space-y-2">
          <Rule>Hold a <strong className="text-white">relevant qualification</strong> for aeronautical radio use</Rule>
          <Rule>Maintain a listening watch on the specified frequency</Rule>
          <Rule>Make broadcasts on the specified frequency and/or maintain other communication methods per ATC</Rule>
        </ul>
        <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px] font-semibold text-white/40 mb-1.5">"Relevant qualification" means any of:</p>
          <ul className="space-y-1">
            {["Aeronautical radio operator certificate","Remote pilot license (or flight crew license)","Air traffic control license","Military qualification equivalent to the above"].map(q => (
              <li key={q} className="text-[12px] text-white/55 flex items-start gap-2"><span className="text-cyan-400 shrink-0">·</span>{q}</li>
            ))}
          </ul>
        </div>
      </Card>

      <Card title="Shielded Operations" sec="§11.11.8.3.2">
        <ul className="space-y-2">
          <Rule>A shielded operation is within 100 m of, and below the top of, a natural or man-made object</Rule>
          <Rule bad>If the shielded operation is within 10 km of an aerodrome, there must be a physical solid barrier between the shield and the airport to prevent the RPA from straying in</Rule>
          <Rule bad>Obstacle avoidance, Return-to-Home, and failsafe features <strong className="text-white">must be turned OFF</strong> during shielded operations</Rule>
        </ul>
      </Card>
    </div>
  );
}

function RolesTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* RPAS Operator */}
        <Card title="RPAS Operator" sec="§11.11.8.4.12" secColor="#06b6d4">
          <p className="text-[11.5px] text-white/40 mb-3">An operator shall:</p>
          <ul className="space-y-2">
            {["Comply with procedures and limitations on RPAS operations and risk, including safety procedures, security requirements, and protection against unauthorized access","Designate a remote pilot for each flight","Ensure efficient use of radio spectrum to avoid harmful interference","Ensure all pilots have the competency for the operation and are informed of the operations manual","Ensure support personnel complete on-the-job training and are briefed on operations manual","Operate within the limitations, conditions, and mitigation measures in the Certificate of Authorization","Maintain up-to-date qualification and training records","Develop procedures to coordinate activities between employees"].map(r => (
              <Rule key={r}>{r}</Rule>
            ))}
          </ul>
        </Card>

        {/* Chief Remote Pilot */}
        <Card title="Chief Remote Pilot" sec="§11.11.8.4.8" secColor="#a78bfa">
          <p className="text-[11.5px] text-white/40 mb-3">An operator shall nominate an RPL-licensed person as Chief Remote Pilot. Their duties:</p>
          <ul className="space-y-2">
            {["Ensure the operator's RPA operations are conducted in accordance with civil aviation regulations","Maintain a record of the qualifications held by each person operating an RPA for the operator","Monitor the operational standards and proficiency of each person operating an RPA","Maintain a complete and up-to-date reference library of operational documents for the types of operations conducted"].map(r => (
              <Rule key={r}>{r}</Rule>
            ))}
          </ul>
        </Card>

        {/* Remote Pilot */}
        <Card title="Remote Pilot" sec="§11.11.8.4.9" secColor="#34d399">
          <p className="text-[11.5px] text-white/40 mb-1.5">Pre-flight:</p>
          <ul className="space-y-1.5 mb-3">
            {["Obtain updated geographical restriction information for the intended area","Ensure operating environment is compatible with authorized limitations","Ensure the RPA is in safe condition to complete the flight","Ensure relevant ATS unit, airspace users, and stakeholders are informed"].map(r => <Rule key={r}>{r}</Rule>)}
          </ul>
          <p className="text-[11.5px] text-white/40 mb-1.5">During flight:</p>
          <ul className="space-y-1.5 mb-3">
            {["Comply with authorized limitations and conditions","Avoid any risk of collision with manned aircraft; discontinue if continuing poses a risk","Comply with the operator's procedures","Do not fly near areas where an emergency response is ongoing without permission"].map(r => <Rule key={r}>{r}</Rule>)}
          </ul>
          <ul className="space-y-1.5">
            <Rule>Ensure all checklists are complied with in detail</Rule>
            <Rule>Report all known or suspected RPAS defects to the operator at the earliest practicable time</Rule>
            <Rule>Responsible for the journey logbook (flight time, operation type, area, accident/incident)</Rule>
            <Rule bad>Must not perform duties while under the influence of alcohol, drugs, fatigue, medication, or injury</Rule>
          </ul>
        </Card>

        {/* Visual Observer */}
        <Card title="RPA Visual Observer" sec="§11.11.8.4.10" secColor="#fbbf24">
          <p className="text-[11.5px] text-white/40 mb-3">An RPA Visual Observer shall:</p>
          <ul className="space-y-2">
            {["Maintain a thorough airspace scan to identify any risk of collision with manned aircraft","Maintain awareness of the RPA's position through direct airspace observation or electronic assistance","Alert the remote pilot when a hazard is detected and assist in minimizing negative effects","Provide clear information on the RPA's geographical position, speed, and height above surface or takeoff point","Use the same system provided to the remote pilot"].map(r => (
              <Rule key={r}>{r}</Rule>
            ))}
          </ul>
        </Card>
      </div>

      {/* Record retention */}
      <Card title="Record Retention" sec="§11.11.8.4.6">
        <p className="text-[12px] text-white/40 mb-3">Each holder of a Certificate of Authorization shall maintain:</p>
        <ul className="space-y-2">
          <Rule>Names of remote pilots and RPA observers for each flight</Rule>
          <Rule>Time of each flight or series of flights</Rule>
          <Rule>Maintenance records: who performed work, dates, parts/equipment used, instructions provided</Rule>
          <Rule>Transfer all records to new owner when RPAS ownership is transferred</Rule>
          <Rule>All records must be stored and protected from damage, alteration, and theft</Rule>
          <Rule>Records must be traceable, available, and retrievable throughout a <strong className="text-white">5-year retention period</strong></Rule>
          <Rule>Adequate backups must be ensured</Rule>
        </ul>
      </Card>

      {/* EVLOS */}
      <Card title="Extended VLOS (EVLOS)" sec="§11.11.8.4.5">
        <ul className="space-y-2">
          <Rule>Remote pilot must maintain uninterrupted situational awareness of the airspace via visual observers, possibly aided by technology</Rule>
          <Rule bad>EVLOS operations are considered <strong className="text-white">BVLOS</strong> — all VLOS requirements apply plus more</Rule>
          <Rule>Communication latency between remote pilot and visual observers must be <strong className="text-white">less than 15 seconds</strong></Rule>
          <Rule>Remote pilot must have direct control of the RPA at all times</Rule>
        </ul>
      </Card>
    </div>
  );
}

function AerialWorkTab() {
  const types = [
    { section: "11.2", label: "Agricultural Air Operations", icon: "⊕", color: "#34d399",
      notes: ["Certificate of Authorization required for agricultural operators","Remote pilots for RPAS operations must hold current RPL and be rated for the RPA","Must also conform with RPAS-specific requirements in Subpart 11.11.8.4","In public emergency, may deviate from Part 11 rules for relief activities; must report to CAAP within 10 days"] },
    { section: "11.5", label: "Banner Towing", icon: "◐", color: "#06b6d4",
      notes: ["Certificate of Authorization required","For RPAS banner towing: demonstrate competence relevant to specific operation in a manner acceptable to CAAP","Must also conform with Subpart 11.11.8.4"] },
    { section: "11.6", label: "TV and Movie Operations", icon: "◈", color: "#a78bfa",
      notes: ["Certificate of Authorization required (per Subparts 11.1 and 11.6)","For RPAS TV/movie ops: demonstrate competence relevant to specific operation in a manner acceptable to CAAP","Must also conform with Subpart 11.11.8.4"] },
    { section: "11.7", label: "Sightseeing Flights", icon: "◎", color: "#fbbf24",
      notes: ["Certificate of Authorization required","Specific pilot hour requirements for manned aircraft operations (commercial license, 500 hrs PIC, 100 hrs in category, 5 hrs in specific make/model)"] },
    { section: "11.8", label: "Fish Spotting", icon: "⊡", color: "#60a5fa",
      notes: ["Certificate of Authorization required","For RPAS operations: demonstrate competence relevant to specific operation in a manner acceptable to CAAP","Must also conform with Subpart 11.11.8.4"] },
    { section: "11.9", label: "News Media & Traffic Reporting", icon: "⊛", color: "#f472b6",
      notes: ["Certificate of Authorization required","For RPAS operations: demonstrate competence relevant to specific operation in a manner acceptable to CAAP","Must also conform with Subpart 11.11.8.4"] },
    { section: "11.4", label: "Glider Towing", icon: "⊘", color: "#fb923c",
      notes: ["Certificate of Authorization required","Aircraft and experience requirements apply","Operating rules as specified in Part 11"] },
  ];

  const specificTypes = ["Agricultural operations (chemical handling, restrictions, procedures)","Surveying and mapping","Aerial photography, videography, advertisement","Pipeline and powerline inspections","Media, entertainment, flying display (observed by the public)","Delivery and carriage of items","Drone training operations","Discharge of substances","Flight competitions","Flight demonstrations","Flight trials and experimentation","Research and development (environment, wildlife, marine, contamination measurement)","Construction monitoring","Observation and patrol","Search and rescue, disaster and relief","Highway and road traffic monitoring"];

  return (
    <div className="space-y-5">
      <Callout title="Specific Category — 16 Recognized Operation Types" color="#fbbf24">
        <p>Under §11.11.8.4.1, operations that exceed Open Category conditions include — but are not limited to — the following:</p>
      </Callout>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {specificTypes.map((t, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-white/20 text-[11px] font-mono mt-0.5">{String(i+1).padStart(2,"0")}</span>
            <span className="text-[11.5px] text-white/60 leading-snug">{t}</span>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-white/30 px-1">Specific rules for Part 11 aerial work types covered by CAAP:</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map(t => (
          <div key={t.section} className="rounded-2xl p-4" style={{ background: `${t.color}07`, border: `1px solid ${t.color}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <Sec id={`§${t.section}`} color={t.color} />
              <span className="text-[13px]">{t.icon}</span>
              <h3 className="text-[13px] font-semibold" style={{ color: t.color }}>{t.label}</h3>
            </div>
            <ul className="space-y-1.5">
              {t.notes.map(n => (
                <li key={n} className="flex items-start gap-2 text-[12px] text-white/60 leading-snug">
                  <span className="mt-0.5 shrink-0" style={{ color: t.color }}>·</span>{n}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Card title="Inspection, Testing & Demonstration of Compliance" sec="§11.11.8.4.3" secColor="#f87171">
        <p className="text-[12px] text-white/40 mb-3">A remote pilot, operator/owner, or RPA observer shall allow CAAP to conduct surveillance, tests, and inspections at any time or place. Upon request, make available:</p>
        <ul className="space-y-2">
          <Rule>Certificate of Authorization</Rule>
          <Rule>Remote Pilot License</Rule>
          <Rule>Operations Manual</Rule>
          <Rule>A current list of individual positions responsible for each required record, document, and report</Rule>
          <Rule>Any other required documents, records, or reports</Rule>
        </ul>
        <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <p className="text-[11.5px] text-red-400 font-semibold">Penalty for non-compliance:</p>
          <p className="text-[12px] text-white/55 mt-1">Failure to make documents available to CAAP upon request is grounds for suspension of all or part of the Certificate of Authorization for a minimum of <strong className="text-white">30 days</strong> and a maximum of <strong className="text-white">90 days</strong>.</p>
        </div>
      </Card>
    </div>
  );
}

/* ── Root page ─────────────────────────────────────── */

export default function Part11Page() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ fontFamily: SYSTEM_FONT, background: "#0f0f0f" }}>

      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-1.5 text-[11px] text-white/30 mb-3">
          <Link href="/ops/regs" className="hover:text-white/60 transition-colors">PCAR / RPAS Regulations</Link>
          <span>/</span>
          <span className="text-white/55">Part 11</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
                PCAR Part 11
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.22)" }}>
                MC 010-2024
              </span>
            </div>
            <h1 className="text-[18px] font-bold text-white leading-snug">Aerial Works & RPAS Certification</h1>
            <p className="text-[12px] text-white/35 mt-1">
              RPAS Operations · Certificate of Authorization · Flight Rules · Roles & Duties · Aerial Work Types
            </p>
          </div>
          <Link href="/ops/regs"
            className="flex items-center gap-1.5 text-[12px] text-white/35 hover:text-white/70 transition-colors shrink-0 mt-1">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 9L4.5 6l3-3" />
            </svg>
            Back to Regulations
          </Link>
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              background: tab === t.key ? "rgba(239,68,68,0.15)" : "transparent",
              color: tab === t.key ? "#f87171" : "rgba(255,255,255,0.4)",
              border: tab === t.key ? "1px solid rgba(239,68,68,0.3)" : "1px solid transparent",
            }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {tab === "overview"     && <OverviewTab />}
        {tab === "categories"   && <CategoriesTab />}
        {tab === "certificates" && <CertificatesTab />}
        {tab === "flightrules"  && <FlightRulesTab />}
        {tab === "permits"      && <PermitsTab />}
        {tab === "roles"        && <RolesTab />}
        {tab === "aerialwork"   && <AerialWorkTab />}

        <div className="mt-8 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-[11px] text-white/20 leading-relaxed max-w-3xl">
            Source: Memorandum Circular No. 010-2024 — Amendments to Civil Aviation Regulations Parts 1 and 11 RE: Aerial Works and Remotely Piloted Aircraft Systems Certification · Civil Aviation Authority of the Philippines (CAAP) · Republic Act 9497 · Board Resolution No. 2012-054 · ICAO Model Regulations Part 101 and 102
          </p>
        </div>
      </div>
    </div>
  );
}
