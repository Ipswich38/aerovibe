"use client";

import { useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";

type Tab = "aircraft" | "rcn3" | "specs" | "lookup";

interface Part {
  num: number;
  name: string;
  category: string;
  desc: string;
  tip: string | null;
}

const AIRCRAFT_PARTS: Part[] = [
  { num: 1,  name: "Forward-Facing LiDAR",              category: "sensors",   desc: "Class 1 laser for forward obstacle detection. Works alongside the infrared sensing system for comprehensive coverage.", tip: "Cannot detect obstacles with reflectivity <10% or reflective objects like glass. Won't work in lighting >20,000 lux." },
  { num: 2,  name: "Omnidirectional Vision System",     category: "sensors",   desc: "Camera-based obstacle sensing in horizontal directions and above. Works best in well-lit environments.", tip: "Disabled in Sport mode. Unavailable when flying at night." },
  { num: 3,  name: "Gimbal and Camera",                 category: "camera",    desc: "3-axis stabilized camera with two modes: Follow (stable horizon) and FPV (rolls with aircraft for immersive footage).", tip: "Remove storage cover before powering on. Never tap the gimbal while powered on." },
  { num: 4,  name: "Downward Vision System",            category: "sensors",   desc: "Assists precise hovering when GNSS is weak. Best at 0.5–30 m altitude with sufficient lighting.", tip: "May not work properly near water, highly reflective, or monochrome surfaces." },
  { num: 5,  name: "Auxiliary Light",                   category: "lighting",  desc: "Built-in LED for better visibility and camera assist in low-light conditions.", tip: null },
  { num: 6,  name: "3D Infrared Sensing System",        category: "sensors",   desc: "Class 1 laser infrared system that pairs with LiDAR for full 3D obstacle sensing around the aircraft.", tip: "Meets human eye safety requirements for Class 1 laser products." },
  { num: 7,  name: "Side Button",                       category: "controls",  desc: "Triggers QuickTransfer — wirelessly sends photos/videos to your phone via Wi-Fi (5.8 GHz for fastest speed).", tip: "First connection: press and hold to confirm pairing. DJI Fly must be running." },
  { num: 8,  name: "Battery Buckles",                   category: "battery",   desc: "Latch mechanism securing the Intelligent Flight Battery. You should hear a click — if unsecured, DO NOT fly.", tip: null },
  { num: 9,  name: "Landing Gears (Built-in Antennas)", category: "comms",     desc: "Foldable legs for landing and housing built-in Wi-Fi + OcuSync transmission antennas.", tip: "Unfolding the right rear arm auto-powers on the aircraft. Folding it initiates power-off countdown." },
  { num: 10, name: "Aircraft Status Indicators",        category: "controls",  desc: "Two LEDs that show flight status, warnings, and errors in real time. Learn these patterns — they're your safety readout.", tip: "Green blink = GNSS active. Yellow slow = ATTI mode (no GPS). Red blink = error or low battery." },
  { num: 11, name: "Motors",                            category: "propulsion",desc: "Brushless motors — each matched to a specific propeller type (A or B) by color-coded markings.", tip: "Do not touch motors right after flight — they get hot. If motor overloads mid-flight, land immediately." },
  { num: 12, name: "Propellers",                        category: "propulsion",desc: "Quick-release foldable propellers (model 6028F). Color-coded A and B — must match motor markings.", tip: "Only use genuine DJI 6028F props. Never fly with chipped, bent, or aged blades." },
  { num: 13, name: "Intelligent Flight Battery",        category: "battery",   desc: "LiPo battery (BWXNN5-2788-7.0 standard). 4-LED level indicator. Rated 200 charge cycles.", tip: "Charge temp: 5–40°C. Ideal: 22–28°C. Discharge to 30% for transport. Never charge immediately after flying." },
  { num: 14, name: "Power Button",                      category: "controls",  desc: "Single press: check battery level. Press then press-and-hold: power on or off. Works even while folded.", tip: "If aircraft is running: a mid-flight power-off is possible but will crash the drone. Press carefully." },
  { num: 15, name: "Battery Level LEDs",                category: "battery",   desc: "4 LEDs showing charge: 4 on = 88–100%, 3 = 76–87%, 2 = 63–75%, 1 = 51–62%, flashing 1 = 0–12%.", tip: "All 4 blinking simultaneously during charging = battery damaged. Remove and inspect immediately." },
  { num: 16, name: "USB-C Port",                        category: "comms",     desc: "Dual-use: charges the battery directly via cable, and transfers footage to a computer.", tip: "Disconnect USB-C before using Unfold Arm to Power feature — otherwise it won't power on." },
  { num: 17, name: "microSD Card Slot",                 category: "storage",   desc: "Stores photos and videos. Footage can also save to internal storage when no card is inserted.", tip: "Never remove the microSD card while recording — can corrupt the card." },
];

const RCN3_PARTS: Part[] = [
  { num: 1,  name: "Power Button",                  category: "controls",     desc: "Single press checks battery level. Press then press-and-hold to power the RC-N3 on or off.", tip: null },
  { num: 2,  name: "Flight Mode Switch",            category: "controls",     desc: "3-position toggle: C = Cine (smooth, limited speed for filming), N = Normal, S = Sport (max speed, NO obstacle avoidance).", tip: "Always double-check your mode before takeoff. Sport disables all obstacle sensing." },
  { num: 3,  name: "Flight Pause / RTH Button",     category: "controls",     desc: "Single press: aircraft brakes and hovers. Hold until beep: triggers Return to Home. Press again to cancel RTH and regain control.", tip: "Always set RTH altitude in DJI Fly before every flight. Must be above all obstacles in area." },
  { num: 4,  name: "Battery Level LEDs",            category: "indicators",   desc: "4 LEDs for RC battery: 4 = 76–100%, 3 = 51–75%, 2 = 26–50%, 1 = 0–25%. Controller alerts when low.", tip: "Fully charge before each flight. Charge at minimum every 3 months to maintain cell health." },
  { num: 5,  name: "Control Sticks",               category: "controls",     desc: "Removable thumbsticks. Mode 2 (default): Left stick = Throttle (up/down) + Yaw (rotate). Right stick = Pitch (forward/back) + Roll (side).", tip: "Store in the stick slots when traveling. Sticks MUST be centered when powering on." },
  { num: 6,  name: "Customizable Button",          category: "controls",     desc: "Hold + Gimbal Dial = gimbal roll control (default). Can be reassigned to zoom or other functions via DJI Fly > Control > Button Customization.", tip: "Gimbal roll is great for Dutch angle shots. Note: Cruise Control gimbal auto-rotation NOT supported on RC-N3." },
  { num: 7,  name: "Photo / Video Button",         category: "controls",     desc: "Single press: switches between Photo mode and Video mode in DJI Fly.", tip: null },
  { num: 8,  name: "Remote Controller Cable",      category: "connectivity",  desc: "Built-in cable for connecting your phone. USB-C cable included by default. Lightning/micro-USB adapters available separately.", tip: "If Android shows a USB prompt on connection — always select 'Charge Only'. Other options break the link." },
  { num: 9,  name: "Mobile Device Holder",         category: "connectivity",  desc: "Spring-loaded clamp that holds your phone (which acts as the RC-N3's screen via DJI Fly). Pull out and adjust width for your phone.", tip: "Adjust the holder firmly before flying. A loose phone mid-flight can disconnect and cause signal loss." },
  { num: 10, name: "Antennas",                     category: "comms",         desc: "Two foldable antennas for O4 HD video transmission. Unfold and angle toward the aircraft for best signal.", tip: "Optimal zone: antennas pointing at the aircraft, not flat against the controller. Check DJI Fly signal bar." },
  { num: 11, name: "USB-C Port",                   category: "connectivity",  desc: "Charges the RC-N3 battery. Connect your charger here via USB-C cable.", tip: "Fully charge before every flight. Low RC battery will trigger audio alerts — controller auto powers off if ignored." },
  { num: 12, name: "Control Stick Storage Slots",  category: "storage",       desc: "Recessed cutouts on the controller body for storing the removable sticks during transport.", tip: null },
  { num: 13, name: "Gimbal Dial",                  category: "controls",     desc: "Scroll wheel that controls camera tilt (up/down). On the top-left of the RC-N3. Smooth and precise.", tip: "Combined with Customizable Button: controls gimbal roll angle for creative shots." },
  { num: 14, name: "Shutter / Record Button",      category: "controls",     desc: "In Photo mode: takes a photo. In Video mode: starts/stops recording. Context-sensitive.", tip: null },
  { num: 15, name: "Mobile Device Slot",           category: "connectivity",  desc: "The channel/track the phone holder slides into and locks. Accommodates most phone sizes.", tip: "Connect the cable to your phone on the side WITHOUT the DJI logo on the cable." },
];

const CATEGORY_COLORS: Record<string, string> = {
  sensors:      "#06b6d4",
  camera:       "#a78bfa",
  lighting:     "#fbbf24",
  controls:     "#34d399",
  battery:      "#f472b6",
  propulsion:   "#f97316",
  comms:        "#60a5fa",
  storage:      "#94a3b8",
  connectivity: "#60a5fa",
  indicators:   "#34d399",
};

const CATEGORY_LABELS: Record<string, string> = {
  sensors:      "Sensing",
  camera:       "Camera",
  lighting:     "Lighting",
  controls:     "Controls",
  battery:      "Battery",
  propulsion:   "Propulsion",
  comms:        "Comms",
  storage:      "Storage",
  connectivity: "Connectivity",
  indicators:   "Indicators",
};

const SPECS_SECTIONS = [
  {
    label: "Aircraft",
    color: "#06b6d4",
    items: [
      { label: "Model",                  value: "MT5MFND (DJI Mini 5 Pro)" },
      { label: "Weight (C0 config)",     value: "249.9 g — sub-250g, no CAAP registration recreational" },
      { label: "Weight (C1 config)",     value: "355 g" },
      { label: "UAS Class",              value: "C0 / C1" },
      { label: "Operating Temperature", value: "-10° to 40°C (14° to 104°F)" },
      { label: "Max Propeller Speed",    value: "7,800 RPM (C0) / 11,200 RPM (C1)" },
      { label: "Sound Power Level",      value: "81 dB (C1 config)" },
    ],
  },
  {
    label: "Intelligent Flight Battery",
    color: "#f472b6",
    items: [
      { label: "Standard Model",         value: "BWXNN5-2788-7.0 (~71.2 g)" },
      { label: "Plus Model (C1 only)",   value: "BWXNN5-4680-7.16 (~117 g)" },
      { label: "Charge Temperature",     value: "5° to 40°C (41° to 104°F)" },
      { label: "Ideal Charge Temp",      value: "22° to 28°C for longest battery life" },
      { label: "Max Charge Temp",        value: "55°C — charging stops automatically" },
      { label: "Rated Cycles",           value: "200 charge cycles" },
      { label: "Storage / Transport",    value: "Discharge to 30% or lower before transport" },
      { label: "Low-Temp Caution",       value: "Below 0°C: hover to warm up before flying" },
    ],
  },
  {
    label: "Propellers",
    color: "#f97316",
    items: [
      { label: "Model",       value: "6028F" },
      { label: "Dimensions",  value: "152.4 × 71.1 mm (diameter × thread pitch)" },
      { label: "Weight",      value: "2.8 g each" },
      { label: "Types",       value: "A and B — color-coded, must match motor markings" },
    ],
  },
  {
    label: "DJI RC-N3 Controller",
    color: "#34d399",
    items: [
      { label: "Type",                value: "No built-in screen — uses your phone as display" },
      { label: "Required App",        value: "DJI Fly (download from App Store / Google Play)" },
      { label: "Phone Connection",    value: "USB cable (USB-C default, adapters for Lightning)" },
      { label: "Charge Port",         value: "USB-C" },
      { label: "Battery Level",       value: "4 = 76–100%, 3 = 51–75%, 2 = 26–50%, 1 = 0–25%" },
      { label: "Linking Distance",    value: "Must be within 0.5 m of aircraft during linking" },
      { label: "Default Control Mode","value": "Mode 2 (Left = Throttle/Yaw, Right = Pitch/Roll)" },
      { label: "Cruise Control",      value: "Supported via Customizable Button" },
      { label: "Gimbal Roll",         value: "Hold Customizable Button + turn Gimbal Dial" },
    ],
  },
  {
    label: "Flight Modes",
    color: "#a78bfa",
    items: [
      { label: "Normal",   value: "All sensors active, hover precision, Intelligent Modes available" },
      { label: "Cine",     value: "Slower, smoother — ideal for cinematic video. Sensors active." },
      { label: "Sport",    value: "Maximum speed, obstacle avoidance DISABLED. Use in open areas only." },
      { label: "ATTI",     value: "Auto-fallback when GNSS + vision unavailable. Land immediately." },
    ],
  },
  {
    label: "Aircraft Status LED Quick Reference",
    color: "#fbbf24",
    items: [
      { label: "Blinks red/yellow/green alternately", value: "Powering on + self-diagnostic" },
      { label: "Blinks yellow × 4",                   value: "Warming up" },
      { label: "Blinks green slowly",                  value: "GNSS enabled — ready to fly" },
      { label: "Blinks green × 2 repeatedly",          value: "Vision systems enabled" },
      { label: "Blinks yellow slowly",                  value: "ATTI mode — no GNSS/vision" },
      { label: "Blinks yellow quickly",                 value: "Remote controller signal lost" },
      { label: "Blinks red slowly",                     value: "Takeoff disabled (e.g. low battery)" },
      { label: "Blinks red quickly",                    value: "Critically low battery — land now" },
      { label: "Solid red",                             value: "Critical error — do not fly" },
      { label: "Blinks red + yellow alternately",       value: "Compass calibration required" },
    ],
  },
  {
    label: "Key Resources",
    color: "#94a3b8",
    items: [
      { label: "Specs",           value: "dji.com/mini-5-pro/specs" },
      { label: "Compatibility",   value: "dji.com/mini-5-pro/faq" },
      { label: "Firmware",        value: "dji.com/mini-5-pro/downloads" },
      { label: "Tutorial Videos", value: "dji.com/mini-5-pro/video" },
      { label: "GEO System",      value: "fly-safe.dji.com" },
      { label: "DJI Assistant 2", value: "dji.com/downloads/softwares/dji-assistant-2-consumer-drones-series" },
      { label: "DJI Fly App",     value: "dji.com/downloads/djiapp/dji-fly" },
    ],
  },
];

const TABS: { key: Tab; label: string; count: number }[] = [
  { key: "aircraft", label: "Mini 5 Pro Aircraft",     count: 17 },
  { key: "rcn3",     label: "RC-N3 Controller",        count: 15 },
  { key: "specs",    label: "Specs & References",      count: 0  },
  { key: "lookup",   label: "S/N Lookup",              count: 0  },
];

export default function DronePage() {
  const [tab, setTab]           = useState<Tab>("aircraft");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter]     = useState("all");
  const [sn, setSn]             = useState("");
  const [snCopied, setSnCopied] = useState(false);

  const parts = tab === "aircraft" ? AIRCRAFT_PARTS : RCN3_PARTS;

  function handleSnLookup() {
    if (sn.trim()) {
      navigator.clipboard.writeText(sn.trim()).then(() => {
        setSnCopied(true);
        setTimeout(() => setSnCopied(false), 2000);
      }).catch(() => {});
    }
    window.open("https://repair.dji.com/device/", "_blank", "noopener,noreferrer");
  }

  const categories = Array.from(new Set(parts.map((p) => p.category)));
  const filtered   = filter === "all" ? parts : parts.filter((p) => p.category === filter);

  function toggle(num: number) {
    setExpanded((prev) => (prev === num ? null : num));
  }

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      {/* Header bar */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]" style={{ background: "#252527" }}>
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 pt-3 pb-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setExpanded(null); setFilter("all"); }}
                className={`px-3 py-2 text-[11px] font-medium rounded-t-lg border-b-2 transition-colors ${
                  tab === t.key
                    ? "text-cyan-400 border-cyan-400 bg-white/[0.04]"
                    : "text-white/40 border-transparent hover:text-white/70"
                }`}
              >
                {t.label}
                {t.count > 0 && (
                  <span className="ml-1.5 text-[9px] opacity-50">({t.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-5">

        {/* Aircraft + RC-N3 tabs */}
        {(tab === "aircraft" || tab === "rcn3") && (
          <>
            {/* Title */}
            <div className="mb-4">
              <h1 className="text-white text-[17px] font-semibold">
                {tab === "aircraft" ? "DJI Mini 5 Pro — Aircraft Parts" : "DJI RC-N3 — Controller Parts"}
              </h1>
              <p className="text-white/40 text-[12px] mt-0.5">
                {tab === "aircraft"
                  ? "17 labeled components. Tap any part to expand details and tips."
                  : "15 labeled components. Your RC-N3 uses your phone as its screen via DJI Fly."}
              </p>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                  filter === "all"
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/[0.08] text-white/40 hover:text-white/70"
                }`}
              >
                All
              </button>
              {categories.map((cat) => {
                const color = CATEGORY_COLORS[cat] ?? "#94a3b8";
                const isActive = filter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                      isActive ? "text-black" : "text-white/40 hover:text-white/70"
                    }`}
                    style={{
                      borderColor: isActive ? color : "rgba(255,255,255,0.08)",
                      background: isActive ? color : "transparent",
                    }}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                );
              })}
            </div>

            {/* Parts grid */}
            <div className="space-y-1.5">
              {filtered.map((part) => {
                const color   = CATEGORY_COLORS[part.category] ?? "#94a3b8";
                const isOpen  = expanded === part.num;
                return (
                  <div
                    key={part.num}
                    className="rounded-xl border border-white/[0.06] overflow-hidden cursor-pointer"
                    style={{ background: isOpen ? "#2a2a2d" : "#212123" }}
                    onClick={() => toggle(part.num)}
                  >
                    <div className="flex items-center gap-3 px-3.5 py-2.5">
                      {/* Number badge */}
                      <div
                        className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `${color}22`, color }}
                      >
                        {part.num}
                      </div>

                      {/* Category tag */}
                      <span
                        className="text-[9px] font-semibold uppercase tracking-[0.1em] shrink-0"
                        style={{ color: `${color}cc` }}
                      >
                        {CATEGORY_LABELS[part.category] ?? part.category}
                      </span>

                      {/* Name */}
                      <span className="text-white text-[13px] font-medium flex-1 leading-tight">
                        {part.name}
                      </span>

                      {/* Expand arrow */}
                      <svg
                        width="14" height="14" viewBox="0 0 14 14" fill="none"
                        className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M3 5l4 4 4-4" />
                      </svg>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div
                        className="px-4 pb-3 pt-0 border-t"
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}
                      >
                        <p className="text-white/70 text-[12.5px] leading-relaxed mt-2.5">
                          {part.desc}
                        </p>
                        {part.tip && (
                          <div
                            className="mt-2.5 flex items-start gap-2 rounded-lg px-3 py-2"
                            style={{ background: `${color}0f`, border: `1px solid ${color}22` }}
                          >
                            <span className="text-[10px] mt-0.5 shrink-0" style={{ color }}>
                              ⚡
                            </span>
                            <p className="text-[11.5px] leading-relaxed" style={{ color: `${color}cc` }}>
                              {part.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Specs tab */}
        {tab === "specs" && (
          <>
            <div className="mb-5">
              <h1 className="text-white text-[17px] font-semibold">
                DJI Mini 5 Pro — Specs & Quick Reference
              </h1>
              <p className="text-white/40 text-[12px] mt-0.5">
                Key specifications, LED codes, flight modes, and useful links.
              </p>
            </div>

            <div className="space-y-4">
              {SPECS_SECTIONS.map((section) => (
                <div
                  key={section.label}
                  className="rounded-xl border border-white/[0.06] overflow-hidden"
                  style={{ background: "#212123" }}
                >
                  {/* Section header */}
                  <div
                    className="px-4 py-2.5 border-b border-white/[0.05] flex items-center gap-2"
                    style={{ background: "#252527" }}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: section.color }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                      style={{ color: `${section.color}cc` }}
                    >
                      {section.label}
                    </span>
                  </div>

                  {/* Rows */}
                  <div>
                    {section.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 px-4 py-2 border-b border-white/[0.04] last:border-0"
                      >
                        <span className="text-white/40 text-[11.5px] w-[160px] shrink-0 leading-relaxed">
                          {item.label}
                        </span>
                        <span className="text-white/80 text-[11.5px] leading-relaxed flex-1">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* S/N Lookup tab */}
        {tab === "lookup" && (
          <>
            <div className="mb-5">
              <h1 className="text-white text-[17px] font-semibold">DJI S/N Lookup</h1>
              <p className="text-white/40 text-[12px] mt-0.5">
                Check warranty status, repair eligibility, or device info on DJI's official portal.
              </p>
            </div>

            {/* Search card */}
            <div
              className="rounded-2xl p-5 mb-4"
              style={{ background: "#212123", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                Serial Number
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sn}
                  onChange={(e) => setSn(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSnLookup()}
                  placeholder="e.g. 1ZNBP9D0081234"
                  spellCheck={false}
                  className="flex-1 rounded-xl px-3.5 py-2.5 text-[13px] font-mono text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    caretColor: "#06b6d4",
                  }}
                  onFocus={(e) => { e.currentTarget.style.border = "1px solid rgba(6,182,212,0.50)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onBlur={(e) => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.10)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                />
                <button
                  onClick={handleSnLookup}
                  className="px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95"
                  style={{ background: "rgba(6,182,212,0.20)", border: "1px solid rgba(6,182,212,0.35)", color: "#06b6d4" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.30)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(6,182,212,0.20)"; }}
                >
                  {snCopied ? "Copied ✓" : "Open DJI →"}
                </button>
              </div>
              {sn.trim() && (
                <p className="text-[11px] mt-2.5" style={{ color: "rgba(6,182,212,0.60)" }}>
                  S/N will be copied to clipboard — paste it into the DJI portal that opens.
                </p>
              )}
            </div>

            {/* What you can check */}
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{ background: "#212123", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="px-4 py-2.5 border-b border-white/[0.05]" style={{ background: "#252527" }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/30">
                  What You Can Check on DJI
                </p>
              </div>
              {[
                { icon: "🔍", label: "Device identification",    desc: "Confirm model name, SKU, and hardware version from S/N" },
                { icon: "🛡️", label: "Warranty status",          desc: "Check if your drone is still under DJI's standard or DJI Care warranty" },
                { icon: "🔧", label: "Repair eligibility",       desc: "See if your device qualifies for repair at an authorized DJI service center" },
                { icon: "📦", label: "Activation & purchase date",desc: "View when the device was first activated and registered with DJI" },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-4 py-3"
                  style={{ borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <span className="text-[17px] mt-0.5 shrink-0">{row.icon}</span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-white/80">{row.label}</p>
                    <p className="text-[11.5px] text-white/35 mt-0.5 leading-snug">{row.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Where to find S/N */}
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.18)" }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#fbbf24" }}>
                Where to Find Your S/N
              </p>
              <ul className="space-y-1.5">
                {[
                  "Battery compartment label (inside the drone body)",
                  "Original packaging box — barcode sticker",
                  "DJI Fly app → Me → My Devices → select your drone",
                  "Aircraft body — engraved or printed under the arms",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-white/55">
                    <span className="shrink-0 mt-0.5" style={{ color: "#fbbf2466" }}>·</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Note */}
            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[11px] text-white/25 leading-relaxed">
                This opens DJI's official repair portal at{" "}
                <span className="text-white/40">repair.dji.com/device</span>.
                Works for all DJI drones. DJI Mini 5 Pro S/N format: starts with 1ZN.
              </p>
            </div>
          </>
        )}

        <div className="mt-8 pt-4 text-center" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-white/15 text-[10px]">
            DJI Mini 5 Pro User Manual v1.0 · 2025.09 · Reference only
          </p>
        </div>
      </div>
    </div>
  );
}
