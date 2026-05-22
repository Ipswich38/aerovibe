"use client";

import { useEffect, useMemo, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";

type ChecklistTab = "preflight" | "postflight" | "equipment" | "logbook";
type CheckStatus = "pass" | "fail";

interface ChecklistItem {
  id: string;
  group: string;
  label: string;
  detail: string;
  critical?: boolean;
}

interface LogEntry {
  id: string;
  type: ChecklistTab;
  title: string;
  status: "GO" | "NO-GO" | "REVIEW";
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
  locationLabel: string;
  remarks: string;
  score: number;
  passed: number;
  failed: number;
  total: number;
  failedCritical: string[];
}

const LOGBOOK_KEY = "waevpoint_pilot_checklist_logbook";
const DRAFT_KEY = "waevpoint_pilot_checklist_draft";

const PRE_FLIGHT: ChecklistItem[] = [
  {
    id: "weather",
    group: "At home / work preparation",
    label: "Check weather and environmental conditions",
    detail: "Review wind speed, gusts, precipitation, visibility, temperature, and flight window.",
    critical: true,
  },
  {
    id: "airspace",
    group: "At home / work preparation",
    label: "Check airspace and local restrictions",
    detail: "Confirm CAAP limits, local ordinances, TFRs, airport proximity, people, roads, and site restrictions.",
    critical: true,
  },
  {
    id: "battery-charge",
    group: "At home / work preparation",
    label: "Charge all batteries",
    detail: "Drone batteries fully charged, remote controller charged, phone/tablet charged.",
    critical: true,
  },
  {
    id: "sd-format",
    group: "At home / work preparation",
    label: "Check and format SD card",
    detail: "Memory card installed, enough free space, formatted, and backup card packed.",
    critical: true,
  },
  {
    id: "firmware",
    group: "At home / work preparation",
    label: "Update firmware and app before leaving",
    detail: "Drone, controller, flight app, maps, and batteries checked while reliable Wi-Fi is available.",
  },
  {
    id: "pack-gear",
    group: "At home / work preparation",
    label: "Pack required flight gear",
    detail: "Drone, controller, batteries, propellers, cables, SD cards, landing pad, spares, and phone/tablet.",
    critical: true,
  },
  {
    id: "launch-zone",
    group: "On-site physical inspection",
    label: "Assess launch and landing zone",
    detail: "Flat, stable, clear area. Avoid sand, loose grass, dust, puddles, power lines, buildings, people, and animals.",
    critical: true,
  },
  {
    id: "aircraft-inspection",
    group: "On-site physical inspection",
    label: "Inspect aircraft body and arms",
    detail: "Unfold arms, check frame for cracks or damage, inspect gimbal clamp, cover, landing gear, vents, and sensors.",
    critical: true,
  },
  {
    id: "props",
    group: "On-site physical inspection",
    label: "Inspect propellers",
    detail: "Check nicks, cracks, secure lock, deformation, and sand or debris. Replace questionable props.",
    critical: true,
  },
  {
    id: "camera-sensors",
    group: "On-site physical inspection",
    label: "Clean camera, lens, and sensors",
    detail: "Lens, LiDAR, vision sensors, and gimbal are clean. SD card is properly inserted.",
    critical: true,
  },
  {
    id: "power-sequence",
    group: "System and app check",
    label: "Power on in correct sequence",
    detail: "Remote controller first, drone second, then connect phone/tablet and open flight app.",
  },
  {
    id: "link-status",
    group: "System and app check",
    label: "Confirm strong connection and GPS",
    detail: "Controller link stable, GPS strong, home point updated, compass/IMU status normal.",
    critical: true,
  },
  {
    id: "battery-status",
    group: "System and app check",
    label: "Check battery health and voltage",
    detail: "Drone/controller batteries healthy, enough charge, no cell warning, no swelling, and temperature safe.",
    critical: true,
  },
  {
    id: "rth-camera",
    group: "System and app check",
    label: "Set RTH altitude and camera settings",
    detail: "RTH altitude clears obstacles. Video/photo settings correct for intended shot.",
    critical: true,
  },
  {
    id: "final-clear",
    group: "Ready for takeoff",
    label: "Final visual scan and clear prop check",
    detail: "Area is clear. Announce takeoff. Hover low for a few seconds and watch for unusual sound or drift.",
    critical: true,
  },
];

const POST_FLIGHT: ChecklistItem[] = [
  {
    id: "power-off",
    group: "Immediately after landing",
    label: "Power off in correct sequence",
    detail: "Power off drone first to prevent accidental re-arming, then power off controller.",
    critical: true,
  },
  {
    id: "disconnect-display",
    group: "Immediately after landing",
    label: "Disconnect display device",
    detail: "Safely unplug phone/tablet from controller.",
  },
  {
    id: "remove-battery",
    group: "Immediately after landing",
    label: "Remove drone battery",
    detail: "Carefully unlatch and remove the battery. It may be warm after flight.",
  },
  {
    id: "cooldown",
    group: "Immediately after landing",
    label: "Allow battery to cool",
    detail: "Place battery in a safe, shaded spot to cool before charging. Never charge a hot battery.",
    critical: true,
  },
  {
    id: "quick-inspection",
    group: "Immediately after landing",
    label: "Quick aircraft inspection",
    detail: "Check props, arms, landing gear, gimbal, and body for damage before packing.",
    critical: true,
  },
  {
    id: "pack-clamp",
    group: "Packing up on-site",
    label: "Install gimbal clamp and cover",
    detail: "Protect the most delicate part of the drone before transport.",
    critical: true,
  },
  {
    id: "fold-props",
    group: "Packing up on-site",
    label: "Fold arms and propellers properly",
    detail: "Fold according to manufacturer instructions and avoid forcing hinges or propellers.",
  },
  {
    id: "secure-sd",
    group: "Packing up on-site",
    label: "Remove and secure SD card",
    detail: "Place media in a protective case and keep backups separated when possible.",
    critical: true,
  },
  {
    id: "final-sweep",
    group: "Packing up on-site",
    label: "Final sweep of launch area",
    detail: "Make sure no battery, cable, lens filter, SD card, landing pad, or spare part is left behind.",
  },
  {
    id: "transfer-footage",
    group: "Back at home / work",
    label: "Transfer and back up footage",
    detail: "Copy photos/videos from SD card to computer and create at least one separate backup.",
    critical: true,
  },
  {
    id: "format-card",
    group: "Back at home / work",
    label: "Format SD card only after backup",
    detail: "Confirm backup integrity before formatting for next flight.",
    critical: true,
  },
  {
    id: "charge-manage",
    group: "Back at home / work",
    label: "Manage and charge batteries",
    detail: "Inspect battery condition, charge for next flight, or store at safe level if unused for several days.",
  },
  {
    id: "clean-drone",
    group: "Back at home / work",
    label: "Clean and inspect drone",
    detail: "Clean body, propellers, and sensors with microfiber cloth or soft brush. Note damage or maintenance needs.",
  },
  {
    id: "log-flight",
    group: "Back at home / work",
    label: "Log flight details and review performance",
    detail: "Record date, location, duration, battery cycles, issues, and notes for better pilot assessment.",
    critical: true,
  },
];

const EQUIPMENT: ChecklistItem[] = [
  {
    id: "hard-case",
    group: "RPA handling and protection",
    label: "Waterproof protective hard case",
    detail: "Case protects drone and accessories from impact, moisture, dust, and transport damage.",
  },
  {
    id: "controller-case",
    group: "RPA handling and protection",
    label: "Remote controller cover or hard case",
    detail: "Protects controller from physical damage, dust, and environmental exposure.",
  },
  {
    id: "visibility-vest",
    group: "RPA handling and protection",
    label: "High-visibility vest",
    detail: "Pilot and crew wear bright colors or reflective strips for low-light visibility.",
  },
  {
    id: "cones",
    group: "RPA handling and protection",
    label: "Safety cones or markers",
    detail: "Mark takeoff/landing zone and keep unauthorized people away from active drone area.",
  },
  {
    id: "first-aid",
    group: "Safety and operational equipment",
    label: "First-aid kit",
    detail: "Bandages, sterile gauze, antiseptic wipes, burn gel, eyewash, gloves, and trauma basics.",
    critical: true,
  },
  {
    id: "fire-extinguisher",
    group: "Safety and operational equipment",
    label: "LiPo-ready fire suppression",
    detail: "Fire extinguisher or fire-resistant battery bag/blanket available near launch area.",
    critical: true,
  },
  {
    id: "goggles",
    group: "Support and operational equipment",
    label: "Safety goggles",
    detail: "Eye protection for pilot/crew against dust, sand, debris, and wind-blown particles.",
  },
  {
    id: "lanyard",
    group: "Support and operational equipment",
    label: "Controller lanyard",
    detail: "Supports remote controller during operations and reduces drop risk.",
  },
  {
    id: "landing-pad",
    group: "Support and operational equipment",
    label: "Landing pad",
    detail: "Clean, stable surface for takeoff/landing; protects camera, gimbal, motors, and sensors from debris.",
  },
  {
    id: "tripod",
    group: "Support and operational equipment",
    label: "Tripod or monitor support",
    detail: "For remote controller, tablet, monitor, telemetry display, or antenna system if used.",
  },
];

const TABS: { key: ChecklistTab; label: string; icon: string }[] = [
  { key: "preflight", label: "Pre-flight", icon: "↑" },
  { key: "postflight", label: "Post-flight", icon: "↓" },
  { key: "equipment", label: "Safety / Equipment", icon: "□" },
  { key: "logbook", label: "Smart Logbook", icon: "≡" },
];

function getItems(tab: ChecklistTab) {
  if (tab === "postflight") return POST_FLIGHT;
  if (tab === "equipment") return EQUIPMENT;
  return PRE_FLIGHT;
}

function groupedItems(items: ChecklistItem[]) {
  return items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});
}

function statusLabel(status?: CheckStatus) {
  if (status === "pass") return "OK";
  if (status === "fail") return "X";
  return "-";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function PilotChecklistPage() {
  const [tab, setTab] = useState<ChecklistTab>("preflight");
  const [checks, setChecks] = useState<Record<string, CheckStatus>>({});
  const [logbook, setLogbook] = useState<LogEntry[]>([]);
  const [remarks, setRemarks] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationState, setLocationState] = useState("Location not captured");

  useEffect(() => {
    setLogbook(loadJson<LogEntry[]>(LOGBOOK_KEY, []));
    const draft = loadJson<{ checks?: Record<string, CheckStatus>; remarks?: string; locationLabel?: string }>(DRAFT_KEY, {});
    setChecks(draft.checks || {});
    setRemarks(draft.remarks || "");
    setLocationLabel(draft.locationLabel || "");
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ checks, remarks, locationLabel }));
  }, [checks, remarks, locationLabel]);

  const activeItems = getItems(tab);
  const activeGroups = groupedItems(activeItems);

  const activeStats = useMemo(() => {
    const total = activeItems.length;
    const passed = activeItems.filter((item) => checks[item.id] === "pass").length;
    const failed = activeItems.filter((item) => checks[item.id] === "fail").length;
    const marked = passed + failed;
    const failedCritical = activeItems
      .filter((item) => item.critical && checks[item.id] === "fail")
      .map((item) => item.label);
    return {
      total,
      passed,
      failed,
      marked,
      failedCritical,
      complete: marked === total,
      score: total ? Math.round((passed / total) * 100) : 0,
    };
  }, [activeItems, checks]);

  const preflightStats = useMemo(() => {
    const passed = PRE_FLIGHT.filter((item) => checks[item.id] === "pass").length;
    const failed = PRE_FLIGHT.filter((item) => checks[item.id] === "fail").length;
    const failedCritical = PRE_FLIGHT
      .filter((item) => item.critical && checks[item.id] === "fail")
      .map((item) => item.label);
    return {
      passed,
      failed,
      total: PRE_FLIGHT.length,
      complete: passed + failed === PRE_FLIGHT.length,
      score: Math.round((passed / PRE_FLIGHT.length) * 100),
      failedCritical,
    };
  }, [checks]);

  function setItemStatus(id: string, status: CheckStatus) {
    setChecks((prev) => ({ ...prev, [id]: status }));
  }

  function clearActiveTab() {
    const ids = new Set(activeItems.map((item) => item.id));
    setChecks((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  }

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationState("Geolocation is not available");
      return;
    }
    setLocationState("Capturing GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        setCoords(next);
        setLocationLabel(`${next.latitude}, ${next.longitude}`);
        setLocationState("GPS location captured");
      },
      () => setLocationState("GPS denied or unavailable. Use manual location."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }

  function saveLog(type: ChecklistTab = tab) {
    const items = getItems(type);
    const passed = items.filter((item) => checks[item.id] === "pass").length;
    const failed = items.filter((item) => checks[item.id] === "fail").length;
    const failedCritical = items
      .filter((item) => item.critical && checks[item.id] === "fail")
      .map((item) => item.label);
    const score = items.length ? Math.round((passed / items.length) * 100) : 0;
    const status: LogEntry["status"] =
      failedCritical.length > 0 ? "NO-GO" : failed > 0 ? "REVIEW" : "GO";
    const now = new Date();
    const entry: LogEntry = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      type,
      title: TABS.find((item) => item.key === type)?.label || "Checklist",
      status,
      createdAt: now.toISOString(),
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
      locationLabel: locationLabel.trim() || "Unspecified location",
      remarks: remarks.trim(),
      score,
      passed,
      failed,
      total: items.length,
      failedCritical,
    };
    const next = [entry, ...logbook].slice(0, 100);
    setLogbook(next);
    localStorage.setItem(LOGBOOK_KEY, JSON.stringify(next));
    setTab("logbook");
  }

  function deleteLog(id: string) {
    const next = logbook.filter((entry) => entry.id !== id);
    setLogbook(next);
    localStorage.setItem(LOGBOOK_KEY, JSON.stringify(next));
  }

  function resetFlight() {
    if (!confirm("Clear current checklist marks and remarks?")) return;
    setChecks({});
    setRemarks("");
    setLocationLabel("");
    setCoords(null);
    setLocationState("Location not captured");
    localStorage.removeItem(DRAFT_KEY);
  }

  return (
    <div className="h-full overflow-y-auto text-white" style={{ background: "#111112", fontFamily: SYSTEM_FONT }}>
      <div className="mx-auto max-w-[1180px] px-4 py-5 md:px-7 md:py-7">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400/70">
              Flight discipline
            </p>
            <h1 className="text-[24px] font-semibold tracking-tight text-white">Pilot Checklist</h1>
            <p className="mt-1 max-w-[720px] text-[13px] leading-relaxed text-white/42">
              Mark each item OK or X. Critical X marks produce a NO-GO log so the record is honest and useful before every flight.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex">
            <StatPill label="Pre-flight" value={`${preflightStats.passed + preflightStats.failed}/${preflightStats.total}`} color="#06b6d4" />
            <StatPill label="Score" value={`${preflightStats.score}%`} color={preflightStats.failedCritical.length ? "#f87171" : "#34d399"} />
            <StatPill label="Status" value={preflightStats.failedCritical.length ? "NO-GO" : preflightStats.complete ? "GO" : "OPEN"} color={preflightStats.failedCritical.length ? "#f87171" : "#34d399"} />
          </div>
        </div>

        <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-xl border border-white/[0.07] bg-white/[0.035] p-1">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[12px] transition-colors ${
                tab === item.key ? "bg-white/[0.1] text-white" : "text-white/45 hover:bg-white/[0.05] hover:text-white/75"
              }`}
            >
              <span className="text-[13px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {tab !== "logbook" ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {Object.entries(activeGroups).map(([group, items]) => (
                <section key={group} className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1c1c1e]">
                  <div className="border-b border-white/[0.06] bg-white/[0.03] px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/38">{group}</p>
                  </div>
                  <div className="divide-y divide-white/[0.055]">
                    {items.map((item) => (
                      <div key={item.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_112px] md:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-medium text-white">{item.label}</p>
                            {item.critical && (
                              <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-300">
                                Critical
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[12px] leading-relaxed text-white/45">{item.detail}</p>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <StatusButton
                            active={checks[item.id] === "pass"}
                            label="OK"
                            color="#34d399"
                            onClick={() => setItemStatus(item.id, "pass")}
                          />
                          <StatusButton
                            active={checks[item.id] === "fail"}
                            label="X"
                            color="#f87171"
                            onClick={() => setItemStatus(item.id, "fail")}
                          />
                          <span className="w-8 text-center text-[11px] text-white/25">{statusLabel(checks[item.id])}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  Active checklist
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <StatPill label="Marked" value={`${activeStats.marked}/${activeStats.total}`} color="#06b6d4" compact />
                  <StatPill label="OK" value={String(activeStats.passed)} color="#34d399" compact />
                  <StatPill label="X" value={String(activeStats.failed)} color="#f87171" compact />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(activeStats.marked / activeStats.total) * 100}%`,
                      background: activeStats.failedCritical.length ? "#f87171" : "#06b6d4",
                    }}
                  />
                </div>

                {activeStats.failedCritical.length > 0 && (
                  <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-red-300">NO-GO critical items</p>
                    <ul className="mt-2 space-y-1">
                      {activeStats.failedCritical.map((item) => (
                        <li key={item} className="text-[12px] leading-snug text-red-100/70">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  Smart log details
                </p>
                <label className="mb-1 block text-[11px] text-white/38">Location</label>
                <div className="flex gap-2">
                  <input
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    placeholder="Site name or GPS"
                    className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/18 focus:border-cyan-400/35"
                  />
                  <button
                    onClick={captureLocation}
                    className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-400/15"
                  >
                    GPS
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-white/28">{locationState}</p>

                <label className="mb-1 mt-4 block text-[11px] text-white/38">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Wind, site hazards, battery note, client/job, abnormalities..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2 text-[12px] leading-relaxed text-white outline-none placeholder:text-white/18 focus:border-cyan-400/35"
                />

                <div className="mt-4 grid gap-2">
                  <button
                    onClick={() => saveLog(tab)}
                    disabled={!activeStats.complete}
                    className="rounded-xl bg-cyan-400 px-4 py-2.5 text-[12px] font-semibold text-black transition-opacity hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {activeStats.complete ? "Save completed checklist to logbook" : "Mark every item to enable log"}
                  </button>
                  <button
                    onClick={clearActiveTab}
                    className="rounded-xl border border-white/[0.08] px-4 py-2 text-[12px] text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                  >
                    Clear this tab
                  </button>
                  <button
                    onClick={resetFlight}
                    className="rounded-xl border border-red-400/15 px-4 py-2 text-[12px] text-red-300/70 hover:bg-red-400/10 hover:text-red-200"
                  >
                    Reset full flight checklist
                  </button>
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <LogbookView logbook={logbook} onDelete={deleteLog} />
        )}
      </div>
    </div>
  );
}

function StatPill({ label, value, color, compact = false }: { label: string; value: string; color: string; compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/[0.07] bg-white/[0.04] ${compact ? "px-2.5 py-2" : "px-3.5 py-2.5"}`}>
      <p className="text-[10px] uppercase tracking-wide text-white/30">{label}</p>
      <p className={`${compact ? "text-[15px]" : "text-[17px]"} font-semibold leading-tight`} style={{ color }}>{value}</p>
    </div>
  );
}

function StatusButton({ active, label, color, onClick }: { active: boolean; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-8 w-8 rounded-lg text-[12px] font-bold transition-all"
      style={{
        background: active ? `${color}22` : "rgba(255,255,255,0.045)",
        color: active ? color : "rgba(255,255,255,0.32)",
        border: active ? `1px solid ${color}55` : "1px solid rgba(255,255,255,0.07)",
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

function LogbookView({ logbook, onDelete }: { logbook: LogEntry[]; onDelete: (id: string) => void }) {
  const totals = logbook.reduce(
    (acc, entry) => {
      acc.entries += 1;
      acc.go += entry.status === "GO" ? 1 : 0;
      acc.review += entry.status !== "GO" ? 1 : 0;
      return acc;
    },
    { entries: 0, go: 0, review: 0 }
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4 lg:sticky lg:top-5 lg:self-start">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Smart logbook</p>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
          <StatPill label="Entries" value={String(totals.entries)} color="#06b6d4" />
          <StatPill label="GO" value={String(totals.go)} color="#34d399" />
          <StatPill label="Review / NO-GO" value={String(totals.review)} color="#f87171" />
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-white/38">
          Logs are saved locally on this device for fast field use. Export/sync can be connected to Supabase later if you want cloud records.
        </p>
      </aside>

      <div className="space-y-3">
        {logbook.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.025] p-8 text-center">
            <p className="text-[14px] font-medium text-white">No checklist logs yet</p>
            <p className="mt-1 text-[12px] text-white/35">Complete a checklist and save it to create your first flight record.</p>
          </div>
        ) : (
          logbook.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        color: entry.status === "GO" ? "#34d399" : entry.status === "NO-GO" ? "#f87171" : "#fbbf24",
                        background: entry.status === "GO" ? "rgba(52,211,153,0.1)" : entry.status === "NO-GO" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                        borderColor: entry.status === "GO" ? "rgba(52,211,153,0.25)" : entry.status === "NO-GO" ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.25)",
                      }}
                    >
                      {entry.status}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-white/25">{entry.title}</span>
                  </div>
                  <h2 className="text-[15px] font-semibold text-white">{formatDateTime(entry.createdAt)}</h2>
                  <p className="mt-1 text-[12px] text-white/42">{entry.locationLabel}</p>
                  {entry.latitude != null && entry.longitude != null && (
                    <p className="mt-0.5 text-[11px] text-cyan-300/60">
                      {entry.latitude}, {entry.longitude}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 md:items-center">
                  <StatPill label="Score" value={`${entry.score}%`} color={entry.status === "GO" ? "#34d399" : "#f87171"} compact />
                  <StatPill label="OK / X" value={`${entry.passed}/${entry.failed}`} color="#06b6d4" compact />
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="h-10 rounded-lg border border-red-400/15 px-3 text-[11px] text-red-300/60 hover:bg-red-400/10 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {entry.failedCritical.length > 0 && (
                <div className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-300">Critical failures</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-red-100/60">{entry.failedCritical.join(", ")}</p>
                </div>
              )}

              {entry.remarks && (
                <div className="mt-3 rounded-xl bg-white/[0.035] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/28">Remarks</p>
                  <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-white/58">{entry.remarks}</p>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
