"use client";

import { useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";

type SectionKey =
  | "setup"
  | "safety"
  | "basic"
  | "intelligent"
  | "aircraft"
  | "rcn3"
  | "appendix";

interface ManualSection {
  key: SectionKey;
  title: string;
  icon: string;
  color: string;
  chapters: Chapter[];
}

interface Chapter {
  title: string;
  blocks: ContentBlock[];
}

interface ContentBlock {
  type: "text" | "steps" | "list" | "warning" | "tip" | "table" | "heading";
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

function W({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg px-3 py-2 mb-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)" }}>
      <span className="text-red-400 text-[10px] mt-0.5 shrink-0 font-bold">!</span>
      <p className="text-red-400/90 text-[12px] leading-relaxed">{text}</p>
    </div>
  );
}

function T({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg px-3 py-2 mb-2" style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}>
      <span className="text-cyan-400 text-[10px] mt-0.5 shrink-0">✦</span>
      <p className="text-cyan-300/80 text-[12px] leading-relaxed">{text}</p>
    </div>
  );
}

const SECTIONS: ManualSection[] = [
  {
    key: "setup",
    title: "First Time Setup",
    icon: "⊕",
    color: "#06b6d4",
    chapters: [
      {
        title: "Preparing the Aircraft",
        blocks: [
          { type: "steps", items: [
            "Remove the storage cover from the gimbal.",
            "Press the power button once to check and activate the battery.",
            "Unfold the aircraft arms — back arms first, then front arms.",
            "Unfolding the right rear arm automatically powers on the aircraft.",
          ]},
          { type: "warning", content: "Remove the storage cover before powering on — it will affect self-diagnostics and damage the gimbal." },
          { type: "tip", content: "Automatic Power-Off: Folding the right rear arm triggers a countdown for power-off. Press any button to cancel." },
          { type: "tip", content: "Manual Power-On/Off: Press the button once, then immediately press-and-hold to toggle power." },
        ],
      },
      {
        title: "Preparing the RC-N3 Controller",
        blocks: [
          { type: "steps", items: [
            "Remove the control sticks from the storage slots and screw them onto the controller.",
            "Pull out the mobile device holder and extend it.",
            "Choose the correct cable end for your phone (USB-C default). Connect the cable end WITHOUT the DJI logo to your phone.",
            "Place your phone in the holder and secure it.",
            "Launch DJI Fly — your phone is now the screen.",
          ]},
          { type: "warning", content: "On Android: if a USB prompt appears, select 'Charge Only'. Any other option may break the DJI Fly connection." },
          { type: "tip", content: "Make sure your phone fits securely in the holder before flying. A loose phone causes signal drops." },
        ],
      },
      {
        title: "Activation & Firmware",
        blocks: [
          { type: "text", content: "The aircraft must be activated before first use. Power on both the aircraft and RC-N3, then follow the DJI Fly on-screen prompts. An internet connection is required." },
          { type: "tip", content: "Update firmware whenever DJI Fly prompts you — some features are only available on the latest firmware." },
          { type: "text", content: "To update manually: use DJI Assistant 2 (Consumer Drones Series) — connect via USB-C, launch the app, log in, and follow the Firmware Update steps." },
        ],
      },
    ],
  },
  {
    key: "safety",
    title: "Flight Safety",
    icon: "◈",
    color: "#f97316",
    chapters: [
      {
        title: "Pre-Flight Checklist",
        blocks: [
          { type: "list", items: [
            "Remove all protective covers from the aircraft and gimbal.",
            "Check that the Intelligent Flight Battery and propellers are mounted securely.",
            "Verify that the remote controller, phone, and battery are fully charged.",
            "Confirm the aircraft arms and propellers are fully unfolded.",
            "Check the gimbal and camera are functioning normally.",
            "Confirm nothing is obstructing the motors — they should spin freely.",
            "Connect to DJI Fly and confirm the aircraft is detected.",
            "Clean all camera lenses and sensors.",
            "Set Max Altitude, Max Distance, and Auto RTH Altitude in DJI Fly.",
            "Only use genuine DJI parts — unauthorized parts risk system failure.",
          ]},
        ],
      },
      {
        title: "Post-Flight Checklist",
        blocks: [
          { type: "list", items: [
            "Visually inspect the aircraft, gimbal, battery, and propellers for damage.",
            "Clean camera lens and vision system sensors.",
            "Store the aircraft correctly (arms folded) before transporting.",
          ]},
        ],
      },
      {
        title: "GEO System & Flight Limits",
        blocks: [
          { type: "text", content: "The DJI GEO (Geospatial Environment Online) system provides real-time airspace safety data. It automatically prevents flight in restricted areas. More info at fly-safe.dji.com." },
          { type: "text", content: "By default, max altitude and distance limits are enforced. With strong GNSS, altitude is capped at the value you set in DJI Fly. With weak GNSS, altitude is capped at 30m from takeoff (or 2m if the infrared system is not working)." },
          { type: "tip", content: "Self-Unlock Authorization Zones via the DJI FlySafe website, then sync the license through DJI Fly. You must be within the zone to unlock." },
          { type: "warning", content: "Once inside an unlocked zone, the aircraft cannot fly outside it. If your Home Point is outside the unlocked zone, RTH will not work." },
        ],
      },
      {
        title: "Flying Responsibly",
        blocks: [
          { type: "list", items: [
            "Do NOT fly in severe weather — strong wind, rain, snow, or fog.",
            "Only fly in open areas, away from tall buildings and large metal structures.",
            "Maintain visual line of sight (VLOS) at all times.",
            "Minimize electromagnetic interference — avoid power lines and base stations.",
            "Never fly over people, animals, or crowds.",
            "Do NOT take off from moving vehicles.",
            "Do NOT fly near bird flocks.",
            "Do NOT fly if you are under the influence of any substance.",
            "After landing, power off the aircraft before the remote controller.",
          ]},
        ],
      },
    ],
  },
  {
    key: "basic",
    title: "Basic Flight",
    icon: "▲",
    color: "#34d399",
    chapters: [
      {
        title: "Auto Takeoff",
        blocks: [
          { type: "steps", items: [
            "Launch DJI Fly and enter the camera view.",
            "Complete all pre-flight checklist items.",
            "Tap the takeoff icon. If conditions are safe, press and hold to confirm.",
            "Aircraft will take off and hover above ground.",
          ]},
          { type: "tip", content: "Choose a clear, flat area for takeoff. Avoid grass — it can enter the motors." },
        ],
      },
      {
        title: "Auto Landing",
        blocks: [
          { type: "steps", items: [
            "Hover over a flat, level surface.",
            "Tap the landing icon, then press and hold to confirm.",
            "Landing Protection activates if the Downward Vision System is working — it will hover if the ground is unsuitable.",
            "Motors stop automatically after landing.",
          ]},
          { type: "warning", content: "Do NOT push the throttle upward during auto landing — this causes progressive thrust decay and may crash the aircraft after battery depletion." },
        ],
      },
      {
        title: "Starting & Stopping Motors",
        blocks: [
          { type: "text", content: "To start motors: perform the Combination Stick Command (CSC) — push both sticks simultaneously to the inward-bottom or outward-bottom position. Release both sticks once motors start." },
          { type: "text", content: "To stop motors after landing: push the left throttle stick down and hold, OR perform CSC again." },
          { type: "warning", content: "Emergency Propeller Stop is set to 'Emergency Only' by default — only triggers in emergencies (collision, stall, etc.). Changing it to 'Anytime' can crash the aircraft mid-flight." },
        ],
      },
      {
        title: "Control Modes",
        blocks: [
          { type: "table", headers: ["Mode", "Left Stick", "Right Stick", "Notes"], rows: [
            ["Mode 1", "Pitch + Yaw", "Throttle + Roll", "Uncommon"],
            ["Mode 2 (Default)", "Throttle + Yaw", "Pitch + Roll", "Most common worldwide"],
            ["Mode 3", "Pitch + Roll", "Throttle + Yaw", "Uncommon"],
          ]},
          { type: "tip", content: "The more you push a stick away from center, the faster the aircraft moves in that direction." },
        ],
      },
      {
        title: "Takeoff & Landing Procedures",
        blocks: [
          { type: "steps", items: [
            "Place aircraft on flat ground with rear facing toward you.",
            "Power on RC-N3 first, then the aircraft.",
            "Launch DJI Fly and enter camera view.",
            "Wait for self-diagnostics — no irregular warnings should appear.",
            "Push throttle stick up slowly to take off.",
            "To land: hover over a level surface, push throttle stick down slowly to descend.",
            "After landing, push throttle down and hold until motors stop.",
            "Power off the aircraft first, then the remote controller.",
          ]},
          { type: "warning", content: "Do NOT operate the aircraft when lighting is too bright or too dark to see the screen clearly. You are responsible for display brightness and readability." },
        ],
      },
      {
        title: "Video Tips",
        blocks: [
          { type: "list", items: [
            "Shoot in Normal or Cine mode for best video quality.",
            "Do NOT fly in bad weather — rain or wind ruins footage and risks damage.",
            "Select the desired gimbal mode in DJI Fly before shooting.",
            "Perform flight tests first to establish routes and preview your scenes.",
            "Push control sticks gently for smooth, stable camera movement.",
          ]},
        ],
      },
    ],
  },
  {
    key: "intelligent",
    title: "Intelligent Flight Modes",
    icon: "◎",
    color: "#a78bfa",
    chapters: [
      {
        title: "FocusTrack",
        blocks: [
          { type: "text", content: "FocusTrack keeps the camera locked on a subject while you fly freely. Three sub-modes:" },
          { type: "list", items: [
            "Spotlight: Camera stays on subject while you pilot manually. Supports stationary and moving subjects.",
            "Point of Interest (POI): Aircraft orbits the subject automatically. Bypasses obstacles regardless of flight mode.",
            "ActiveTrack: Aircraft physically follows the subject. Horizontal distance 4–20 m (people) / 4–50 m (vehicles). Max speed: 12 m/s subject speed.",
          ]},
          { type: "warning", content: "DO NOT use FocusTrack near thin objects (power lines, branches), transparent objects (glass, water), or monochrome surfaces (white walls)." },
          { type: "tip", content: "Always be ready to press the Flight Pause button on RC-N3 to take manual control in an emergency." },
        ],
      },
      {
        title: "MasterShots",
        blocks: [
          { type: "text", content: "MasterShots automatically selects a preset flight route based on subject type and distance, then shoots a variety of classic aerial shots automatically. The aircraft returns to origin when done." },
          { type: "steps", items: [
            "Tap the Shooting Mode icon → select MasterShots.",
            "Drag-select your subject and adjust the shooting area.",
            "Tap record to begin. Aircraft flies and records automatically.",
            "Tap stop or press Flight Pause button to exit immediately.",
          ]},
          { type: "warning", content: "Use MasterShots only in clear areas with no buildings or obstacles. The aircraft does not have full obstacle avoidance during preset routes." },
        ],
      },
      {
        title: "QuickShots",
        blocks: [
          { type: "text", content: "QuickShots record a short cinematic clip using preset flight maneuvers. The aircraft flies automatically and generates a short video. Available modes:" },
          { type: "list", items: [
            "Dronie: flies backward and upward while keeping subject in frame.",
            "Rocket: flies straight up with camera pointing down.",
            "Circle: orbits around the subject.",
            "Helix: spirals upward around the subject.",
            "Boomerang: flies in an oval path, ascending and descending.",
            "Asteroid: flies backward-up, rotates, then returns — creates planet-like effect.",
          ]},
          { type: "tip", content: "Boomerang needs at least 30m radius and 10m clearance above. Asteroid needs 40m behind and 50m above." },
        ],
      },
      {
        title: "Hyperlapse",
        blocks: [
          { type: "text", content: "Hyperlapse takes photos at set intervals and compiles them into a short time-lapse video. Great for traffic, clouds, sunrises, and sunsets." },
          { type: "steps", items: [
            "Tap Shooting Modes → select Hyperlapse.",
            "Select the Hyperlapse mode (Free, Circle, Course Lock, or Waypoint).",
            "Set time interval and other parameters.",
            "Tap record button to begin. Tap stop or press Stop on RC-N3 to end.",
          ]},
        ],
      },
      {
        title: "Waypoint Flight",
        blocks: [
          { type: "text", content: "Set waypoints on a map and the aircraft automatically flies the route, executing preset camera actions at each point. Routes can be saved and repeated." },
          { type: "steps", items: [
            "Tap the Waypoint icon on the left side of camera view.",
            "Connect to internet and download the map for your area.",
            "Add waypoints on the map (can only add before takeoff).",
            "Set Camera Action, Heading, and Gimbal Tilt for each waypoint.",
            "Fly the route. Tap Waypoint icon again to exit and auto-save the route.",
          ]},
          { type: "warning", content: "Before enabling Waypoint Flight: go to *** > Safety > Manual Obstacle Avoidance. Set to Bypass or Brake — otherwise the aircraft cannot avoid obstacles mid-route." },
        ],
      },
      {
        title: "Cruise Control",
        blocks: [
          { type: "text", content: "Locks the current flight speed and camera movement speed, making continuous smooth camera panning easier without holding the sticks." },
          { type: "steps", items: [
            "Assign Cruise Control to one of the Customizable Buttons in DJI Fly.",
            "Push control sticks and press Cruise Control button — aircraft maintains current speed.",
            "Press Flight Pause button or tap stop to exit Cruise Control.",
          ]},
          { type: "tip", content: "RC-N3 limitation: Automatic gimbal rotation via Cruise Control is NOT supported on the RC-N3. Use the gimbal dial manually." },
        ],
      },
    ],
  },
  {
    key: "aircraft",
    title: "Aircraft Systems",
    icon: "◇",
    color: "#f472b6",
    chapters: [
      {
        title: "Flight Modes",
        blocks: [
          { type: "table", headers: ["Mode", "Speed", "Obstacle Avoidance", "Best For"], rows: [
            ["Normal", "Standard", "Full", "General flying, Intelligent Modes"],
            ["Cine", "Limited", "Full", "Cinematic footage, smooth panning"],
            ["Sport", "Max", "DISABLED", "Open areas only — fast action shots"],
            ["ATTI (auto)", "Varies", "Disabled", "Auto-fallback — land immediately"],
          ]},
          { type: "warning", content: "In Sport mode, obstacle avoidance is completely disabled. A minimum 30m braking distance is needed. Use only in clear, open spaces." },
        ],
      },
      {
        title: "Return to Home (RTH)",
        blocks: [
          { type: "text", content: "RTH automatically flies the aircraft back to the last recorded Home Point. Triggered three ways: manually (hold RTH button), low battery, or lost signal (Failsafe RTH after 6 seconds)." },
          { type: "tip", content: "Home Point is recorded at takeoff when GNSS signal is strong. A voice prompt confirms it in DJI Fly. If you move after takeoff, update the Home Point in *** > Safety." },
          { type: "warning", content: "Always set RTH altitude above the tallest obstacle between your position and the aircraft before flying. The aircraft will ascend to RTH altitude before flying home." },
          { type: "tip", content: "Advanced RTH uses the aircraft's sensors to plan the best path home — adjusting for wind speed, direction, and obstacles automatically." },
        ],
      },
      {
        title: "Sensing System (APAS)",
        blocks: [
          { type: "text", content: "The Advanced Pilot Assistance System (APAS) actively plans flight paths around obstacles. Available in Normal and Cine modes. Enable in *** > Safety > Manual Obstacle Avoidance > Bypass." },
          { type: "list", items: [
            "Bypass Normal: safe detour path around obstacles.",
            "Bypass Nifty: flies closer to obstacles for better footage (higher collision risk).",
            "Brake: aircraft stops when obstacle detected.",
            "Off: no automatic avoidance.",
          ]},
          { type: "warning", content: "Vision system works best between 0.5–30m altitude. At night, above 30m altitude, or in low-light, performance is significantly reduced." },
        ],
      },
      {
        title: "Propeller Care",
        blocks: [
          { type: "text", content: "Propellers are model 6028F — color-coded A and B to match motor markings. Attaching: align the propeller type with the motor, press down, and rotate until it locks." },
          { type: "list", items: [
            "Only use official DJI 6028F propellers.",
            "Inspect all propellers before every flight.",
            "Never use chipped, bent, warped, or aged blades.",
            "When folding blades: hold the middle of two blades with both hands and push inward simultaneously. Never single-hand fold.",
            "Propellers are consumables — replace when worn.",
          ]},
          { type: "warning", content: "Propeller blades are sharp. Handle carefully to avoid injury or deformation." },
        ],
      },
      {
        title: "Battery Management",
        blocks: [
          { type: "list", items: [
            "Do NOT charge the battery immediately after flight — let it cool first.",
            "Only charge between 5–40°C. Ideal: 22–28°C for longest life.",
            "Charging stops automatically above 55°C.",
            "Battery auto-discharges when idle to prevent degradation.",
            "Fully charge at least once every 3 months.",
            "Discharge to 30% or lower for transport (safety regulations).",
            "Battery is rated for 200 cycles — replace after that.",
            "In cold weather (below 0°C): hover for a few minutes to warm up before aggressive flying.",
          ]},
          { type: "warning", content: "When battery level is critically low: if there's not enough power to return home, land immediately. The aircraft will enter progressive thrust decay — it will crash if you wait too long." },
        ],
      },
      {
        title: "Gimbal & Camera",
        blocks: [
          { type: "text", content: "The gimbal provides 3-axis stabilization. Two operation modes:" },
          { type: "list", items: [
            "Follow Mode: roll angle stays stable relative to horizon — best for smooth footage.",
            "FPV Mode: gimbal rolls with the aircraft — gives a first-person flying feel.",
          ]},
          { type: "tip", content: "Use the Gimbal Dial on RC-N3 to control camera tilt, or press and hold in DJI Fly's camera view. The gimbal supports roll rotation via Customizable Button + Gimbal Dial." },
          { type: "warning", content: "Do NOT apply force to the gimbal when powered on. Do NOT fly in rain — water can permanently damage the gimbal motor." },
        ],
      },
      {
        title: "Storing & Exporting Footage",
        blocks: [
          { type: "text", content: "Footage saves to microSD card (recommended) or internal storage when no card is inserted." },
          { type: "list", items: [
            "QuickTransfer: wireless transfer to phone via Wi-Fi (fastest on 5.8 GHz). Press Side Button or use DJI Fly.",
            "USB-C cable: connect aircraft to computer and export directly.",
            "Card reader: remove microSD and insert into reader.",
          ]},
          { type: "tip", content: "Enable 'Allow QuickTransfer in Sleep' in DJI Fly so you can transfer even when the aircraft is powered off (consumes battery)." },
          { type: "warning", content: "Never remove the microSD card while recording or taking photos — this can corrupt the card and lose footage." },
        ],
      },
    ],
  },
  {
    key: "rcn3",
    title: "RC-N3 Controller Guide",
    icon: "⊞",
    color: "#60a5fa",
    chapters: [
      {
        title: "RC-N3 Overview",
        blocks: [
          { type: "text", content: "The DJI RC-N3 has NO built-in screen. Your smartphone acts as the display via the DJI Fly app, connected via USB cable." },
          { type: "table", headers: ["Button", "Action"], rows: [
            ["Power Button (×1 press)", "Check battery level"],
            ["Power Button (press + hold)", "Power on or off"],
            ["Flight Pause/RTH (×1 press)", "Brake and hover in place"],
            ["Flight Pause/RTH (hold)", "Trigger Return to Home"],
            ["Shutter/Record Button", "Take photo or start/stop recording"],
            ["Photo/Video Button", "Switch between photo and video mode"],
            ["Gimbal Dial (scroll)", "Tilt camera up or down"],
            ["Customizable Button (hold) + Gimbal Dial", "Roll the gimbal (Dutch angle)"],
            ["Customizable Button function", "Assign in DJI Fly > Control > Button Customization"],
          ]},
        ],
      },
      {
        title: "Flight Mode Switch",
        blocks: [
          { type: "table", headers: ["Position", "Mode", "Key Difference"], rows: [
            ["C", "Cine", "Slowest, smoothest — for filming"],
            ["N", "Normal", "Balanced — for general flying"],
            ["S", "Sport", "Fastest, NO obstacle avoidance"],
          ]},
          { type: "warning", content: "Always check the Flight Mode Switch position before takeoff. Sport mode disables all obstacle sensing." },
        ],
      },
      {
        title: "Battery Level LEDs",
        blocks: [
          { type: "table", headers: ["LEDs Lit", "Battery Level"], rows: [
            ["4 (all solid)", "76–100%"],
            ["3 solid", "51–75%"],
            ["2 solid", "26–50%"],
            ["1 solid or blinking", "0–25% — recharge soon"],
          ]},
        ],
      },
      {
        title: "Optimal Antenna Position",
        blocks: [
          { type: "text", content: "Unfold both antennas upward. The signal is strongest when the flat face of the antennas points toward the aircraft." },
          { type: "warning", content: "Antennas pointing directly at the aircraft (end-on) creates a weak signal zone. If signal weakens, adjust RC-N3 orientation or fly closer." },
          { type: "tip", content: "If a transmission signal warning appears in DJI Fly, adjust your antenna position and check the attitude indicator to keep the aircraft in the optimal zone." },
        ],
      },
      {
        title: "Linking the RC-N3 to the Aircraft",
        blocks: [
          { type: "text", content: "The RC-N3 is pre-linked when bought as a combo. If you need to re-link:" },
          { type: "steps", items: [
            "Power on both the aircraft and the RC-N3.",
            "Launch DJI Fly.",
            "In camera view, tap *** > Control > Re-pair to Aircraft.",
            "Press and hold the aircraft power button for 4+ seconds until it beeps.",
            "Battery level LEDs blink in sequence — aircraft is ready to link.",
            "RC-N3 beeps twice = linking successful.",
          ]},
          { type: "tip", content: "Keep the RC-N3 within 0.5m of the aircraft during the linking process." },
        ],
      },
      {
        title: "Phone Setup Tips",
        blocks: [
          { type: "list", items: [
            "Download DJI Fly before flying — the RC-N3 requires it.",
            "DJI Fly app login is valid for 90 days. Reconnect to internet when expired.",
            "Flight is restricted to 30m altitude and 50m range if not logged in.",
            "Turn off Wi-Fi on your phone during flight to reduce interference.",
            "Maximize screen brightness when flying in sunlight.",
            "Disable battery optimization for DJI Fly so it doesn't get suspended in background.",
          ]},
        ],
      },
    ],
  },
  {
    key: "appendix",
    title: "Appendix",
    icon: "≡",
    color: "#94a3b8",
    chapters: [
      {
        title: "Troubleshooting",
        blocks: [
          { type: "table", headers: ["Problem", "Solution"], rows: [
            ["Gimbal drift during flight", "Calibrate IMU and compass in DJI Fly. Contact DJI Support if persistent."],
            ["No function / won't start", "Check battery is activated by charging. Contact DJI Support if persistent."],
            ["Power-on / startup problems", "Check battery has charge. Contact DJI Support if cannot start normally."],
            ["Firmware update fails", "Restart all devices and try again. Ensure internet connection is stable."],
            ["Reset to factory defaults", "Use the DJI Fly app reset option."],
            ["Shutdown / power-off problems", "Contact DJI Support."],
            ["Suspected careless handling damage", "Contact DJI Support for inspection."],
          ]},
        ],
      },
      {
        title: "Risks & Warnings (DJI Fly Prompts)",
        blocks: [
          { type: "text", content: "When the aircraft detects a risk on startup, DJI Fly displays a warning. Common triggers:" },
          { type: "list", items: [
            "Location is not suitable for takeoff.",
            "An obstacle is detected during flight.",
            "Location is not suitable for landing.",
            "Compass or IMU requires calibration.",
          ]},
          { type: "text", content: "Always follow the on-screen instructions before proceeding." },
        ],
      },
      {
        title: "Maintenance",
        blocks: [
          { type: "list", items: [
            "After any crash or hard impact, inspect every part before flying again.",
            "Check Battery Level Indicators regularly — battery is rated for 200 cycles.",
            "Always transport with arms folded and antennas folded.",
            "Store battery in a cool, dry place (22–28°C). Never store below -10°C or above 45°C.",
            "Clean lenses and sensors with a soft, dry cloth — no alcohol-based cleaners.",
            "Do NOT store the aircraft in humid or dusty environments.",
            "Remove battery before servicing (cleaning, attaching props, etc.).",
          ]},
        ],
      },
      {
        title: "Certification & Compliance",
        blocks: [
          { type: "text", content: "The DJI Mini 5 Pro is compliant with C0 and C1 requirements (Model MT5MFND). C0 MTOM: 249.9g. C1 MTOM: 355g." },
          { type: "list", items: [
            "C0 restrictions: use only listed qualified accessories. No added payloads.",
            "Direct Remote ID via Wi-Fi Beacon is built in.",
            "Upload your UAS Operator Registration Number via DJI Fly > *** > Safety > UAS Remote Identification.",
            "In EU member states, EFTA countries, and Georgia — C0 and C1 restrictions apply.",
          ]},
        ],
      },
      {
        title: "Battery Disposal",
        blocks: [
          { type: "text", content: "Dispose of batteries in specific recycling containers only after a complete discharge. Do NOT dispose in regular trash. Follow local regulations." },
          { type: "warning", content: "If the battery cannot be powered on after over-discharging, contact a professional battery disposal/recycling agency — do NOT attempt to puncture or discard carelessly." },
        ],
      },
    ],
  },
];

function renderBlock(block: ContentBlock, i: number) {
  switch (block.type) {
    case "text":
      return <p key={i} className="text-white/70 text-[12.5px] leading-relaxed mb-2">{block.content}</p>;

    case "heading":
      return <p key={i} className="text-white/90 text-[13px] font-semibold mt-3 mb-1">{block.content}</p>;

    case "warning":
      return <W key={i} text={block.content!} />;

    case "tip":
      return <T key={i} text={block.content!} />;

    case "list":
      return (
        <ul key={i} className="space-y-1.5 mb-3">
          {block.items!.map((item, j) => (
            <li key={j} className="flex items-start gap-2">
              <span className="text-white/20 text-[10px] mt-1 shrink-0">◆</span>
              <span className="text-white/65 text-[12px] leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "steps":
      return (
        <ol key={i} className="space-y-2 mb-3">
          {block.items!.map((item, j) => (
            <li key={j} className="flex items-start gap-3">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}
              >
                {j + 1}
              </span>
              <span className="text-white/65 text-[12px] leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        <div key={i} className="mb-3 overflow-x-auto">
          <table className="w-full border-collapse text-[11.5px]">
            <thead>
              <tr>
                {block.headers!.map((h, j) => (
                  <th
                    key={j}
                    className="text-left px-3 py-2 text-white/40 font-semibold uppercase tracking-wider text-[10px] border-b border-white/[0.08]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows!.map((row, j) => (
                <tr key={j} className="border-b border-white/[0.04] last:border-0">
                  {row.map((cell, k) => (
                    <td
                      key={k}
                      className={`px-3 py-2 leading-relaxed ${k === 0 ? "text-white/80 font-medium" : "text-white/55"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("setup");
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);

  const section = SECTIONS.find((s) => s.key === activeSection)!;

  return (
    <div
      className="h-full flex overflow-hidden"
      style={{ background: "#1c1c1e", fontFamily: SYSTEM_FONT }}
    >
      {/* Sidebar nav */}
      <div
        className="w-[200px] shrink-0 border-r border-white/[0.06] overflow-y-auto flex flex-col"
        style={{ background: "#212123" }}
      >
        <div className="px-3 pt-4 pb-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-3">
            DJI Mini 5 Pro
          </p>
          <p className="text-white text-[13px] font-semibold leading-tight">
            User Manual
          </p>
          <p className="text-white/30 text-[10px] mt-0.5">v1.0 · 2025.09</p>
        </div>

        <div className="px-2 py-3 space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => { setActiveSection(s.key); setExpandedChapter(0); }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                activeSection === s.key
                  ? "bg-white/[0.08] text-white"
                  : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]"
              }`}
            >
              <span
                className="text-[13px] shrink-0"
                style={{ color: activeSection === s.key ? s.color : undefined }}
              >
                {s.icon}
              </span>
              <span className="text-[12px] font-medium leading-tight">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto px-3 py-3 border-t border-white/[0.06]">
          <p className="text-white/15 text-[9px]">© 2025 DJI · Reference</p>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-5">
          {/* Section header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] shrink-0"
              style={{ background: `${section.color}18` }}
            >
              <span style={{ color: section.color }}>{section.icon}</span>
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-0.5"
                style={{ color: `${section.color}99` }}
              >
                DJI Mini 5 Pro User Manual
              </p>
              <h1 className="text-white text-[18px] font-semibold leading-tight">
                {section.title}
              </h1>
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-2">
            {section.chapters.map((chapter, ci) => {
              const isOpen = expandedChapter === ci;
              return (
                <div
                  key={ci}
                  className="rounded-xl border border-white/[0.06] overflow-hidden"
                  style={{ background: "#212123" }}
                >
                  <button
                    onClick={() => setExpandedChapter(isOpen ? null : ci)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-white text-[13px] font-medium">{chapter.title}</span>
                    <svg
                      width="14" height="14" viewBox="0 0 14 14" fill="none"
                      className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <path d="M3 5l4 4 4-4" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div
                      className="px-4 pb-4 pt-1 border-t border-white/[0.05]"
                    >
                      {chapter.blocks.map((block, bi) => renderBlock(block, bi))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
