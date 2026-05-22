"use client";

import { useState } from "react";
import Link from "next/link";

const V = "#8b5cf6";

const SECTIONS = [
  { id: "overview", label: "Overview", group: "Start" },
  { id: "weight-class", label: "Below 7kg vs 7kg+", group: "Start" },
  { id: "aspiring", label: "Aspiring Pilot Mode", group: "Use Cases" },
  { id: "licensed", label: "Licensed Pilot Mode", group: "Use Cases" },
  { id: "certificate", label: "Certificate Path", group: "CAAP Notes" },
  { id: "checks", label: "Checklist Discipline", group: "Flight Ops" },
  { id: "logbook", label: "Smart Logbook", group: "Flight Ops" },
  { id: "limits", label: "Operating Reminders", group: "Flight Ops" },
];

const GROUPS = ["Start", "Use Cases", "CAAP Notes", "Flight Ops"];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-14 scroll-mt-8">
      <h2 className="text-2xl font-bold text-white mb-5" style={{ fontFamily: "'League Spartan', sans-serif" }}>
        {title}
      </h2>
      <div className="space-y-3 text-[14px] leading-relaxed" style={{ color: "#999" }}>
        {children}
      </div>
    </section>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-4 py-3"
      style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.2)" }}>
      <p className="text-[12px]" style={{ color: "#c4b5fd" }}>{children}</p>
    </div>
  );
}

function Fact({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-4"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[13px] font-semibold text-white mb-1">{title}</p>
      <p className="text-[13px] leading-relaxed" style={{ color: "#888" }}>{children}</p>
    </div>
  );
}

export default function GuidePage() {
  const [activeId, setActiveId] = useState("overview");

  function scrollTo(id: string) {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const groupedSections = GROUPS.map(group => ({
    group,
    items: SECTIONS.filter(section => section.group === group),
  }));

  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a0a", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-30"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,10,10,0.95)", backdropFilter: "blur(10px)" }}>
        <div className="flex items-center gap-3">
          <Link href="/pilots">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="waevpoint" style={{ height: 20, opacity: 0.6 }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>x</span>
          <span className="text-[15px] font-bold" style={{ fontFamily: "'League Spartan', sans-serif", color: V }}>
            WaevPilots
          </span>
          <span className="text-[12px]" style={{ color: "#444" }}>/</span>
          <span className="text-[13px]" style={{ color: "#888" }}>Guide</span>
        </div>
        <Link href="/pilots" className="text-[11px] hover:text-white transition-colors" style={{ color: "#555" }}>
          Back to WaevPilots
        </Link>
      </header>

      <div className="flex max-w-6xl mx-auto">
        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto py-8 px-4 border-r"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {groupedSections.map(({ group, items }) => (
            <div key={group} className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-2 px-2"
                style={{ color: "#444", fontFamily: "'IBM Plex Mono', monospace" }}>
                {group}
              </p>
              {items.map(section => (
                <button key={section.id} onClick={() => scrollTo(section.id)}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-[12px] transition-colors mb-0.5"
                  style={{
                    background: activeId === section.id ? "rgba(139,92,246,0.12)" : "transparent",
                    color: activeId === section.id ? V : "#777",
                    fontWeight: activeId === section.id ? 500 : 400,
                  }}>
                  {section.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="flex-1 px-6 lg:px-12 py-10 max-w-3xl">
          <div className="mb-10">
            <p className="text-[11px] uppercase tracking-[0.2em] mb-2"
              style={{ color: V, fontFamily: "'IBM Plex Mono', monospace" }}>
              Pilot study and flight discipline
            </p>
            <h1 className="text-[2.5rem] font-bold text-white leading-tight mb-3"
              style={{ fontFamily: "'League Spartan', sans-serif" }}>
              How WaevPilots Works
            </h1>
            <p style={{ color: "#777" }}>
              WaevPilots is focused on licensing prep, policy refreshers,
              checklists, and smart logbook workflows for drone pilots.
            </p>
          </div>

          <Section id="overview" title="What is WaevPilots?">
            <p>
              The app helps pilots prepare before they fly and review after they fly. Aspiring pilots see study context,
              exam prep, and practical-test structure. Licensed pilots see the same core material as recurrent review,
              flight discipline, and logging support.
            </p>
            <p>
              The content is currently written around below-7kg drones. If a section applies to 7kg and above,
              it should be labeled as Large RPA material so the user knows they may be entering a different rule path.
            </p>
          </Section>

          <Section id="weight-class" title="Below 7kg vs 7kg and above">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Fact title="Below 7kg">
                CAAP PCAR Part 1 defines this as Small RPA. This is the default WaevPilots training and checklist track.
              </Fact>
              <Fact title="7kg and above">
                CAAP PCAR Part 1 defines this as Large RPA. WaevPilots treats this as a separate track and flags it clearly.
              </Fact>
            </div>
            <Note>
              CAAP states that a controller certificate is required for commercial operation or drones weighing 7kg and above.
              For non-commercial Large RPA, CAAP also states registration is required.
            </Note>
          </Section>

          <Section id="aspiring" title="Aspiring Pilot Mode">
            <p>
              The aspiring pilot experience should frame every item as preparation: what to study, what to memorize,
              what to demonstrate during practical assessment, and what to verify before flying.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Fact title="Study flow">PCAR definitions, personnel licensing, registration, operating limitations, and special flight conditions.</Fact>
              <Fact title="Practical flow">Walkaround, startup, GPS/home point, hover checks, maneuvers, return-to-home, landing, and post-flight inspection.</Fact>
            </div>
          </Section>

          <Section id="licensed" title="Licensed Pilot Mode">
            <p>
              Licensed pilots see the same information in refresher language. The goal is not to teach from zero;
              it is to make the pilot less likely to skip a requirement, checklist item, or safety decision.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Fact title="Before flight">Use checklist confirmations for aircraft, battery, compass/IMU, GPS, home point, area, people, and weather.</Fact>
              <Fact title="After flight">Log location, date, time, aircraft, battery notes, incidents, maintenance remarks, and operational lessons.</Fact>
            </div>
          </Section>

          <Section id="certificate" title="RPA Controller Certificate Path">
            <p>
              CAAP lists eligibility items including age, RPAS training, at least five hours of RPA operating experience
              outside controlled airspace, passing the RPAS exam, and passing a demonstration flight.
            </p>
            <p>
              The app should keep this as a checklist-style path: training certificate, aircraft specs, aircraft photos,
              exam scheduling, Knowledge Test Report, Skill Test Permit, skill assessment, and final certificate claim.
            </p>
          </Section>

          <Section id="checks" title="Checklist Discipline">
            <p>
              The checklist should require manual confirmation, not passive reading. Pre-flight, post-flight,
              and safety/equipment checks should support OK, X, and remarks so a pilot can log a real decision.
            </p>
            <Note>
              The system should not treat a failed safety item as complete. Failed items should become logbook remarks
              and, for critical items, should clearly indicate a no-go condition.
            </Note>
          </Section>

          <Section id="logbook" title="Smart Logbook">
            <p>
              A useful log entry should capture location, date, time, aircraft or drone class, checklist completion,
              failed items, corrective remarks, and whether the flight was training, review, or operational.
            </p>
            <p>
              For below-7kg and 7kg-plus separation, the logbook should record the declared weight class for each flight.
            </p>
          </Section>

          <Section id="limits" title="Operating Reminders">
            <p>
              WaevPilots should remind pilots to review current CAAP rules before flying, especially for night flying,
              BVLOS, airport proximity, populated areas, and flights above standard altitude limits.
            </p>
            <Note>
              This app is a study and workflow aid, not a legal authority. Current CAAP documents and official advisories
              remain the final source.
            </Note>
          </Section>

          <div className="border-t pt-10 mt-4 flex flex-col sm:flex-row gap-4"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <Link href="/pilots"
              className="flex-1 py-3 rounded-xl font-semibold text-center transition-all hover:opacity-90"
              style={{ background: V, color: "#fff", fontFamily: "'League Spartan', sans-serif" }}>
              Back to WaevPilots
            </Link>
            <Link href="/pilots/auth"
              className="flex-1 py-3 rounded-xl font-semibold text-center transition-all"
              style={{ background: "rgba(255,255,255,0.05)", color: "#ccc", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "'League Spartan', sans-serif" }}>
              Sign In
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
