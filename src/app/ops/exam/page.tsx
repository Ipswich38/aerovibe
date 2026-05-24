"use client";

import { useMemo, useState } from "react";
import { SYSTEM_FONT } from "@/lib/ops";

type ExamTab = "situational" | "theoretical" | "practical" | "actual";
type QuestionType = "mc" | "tf";

interface Question {
  id: string;
  type: QuestionType;
  category: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const TABS: { key: ExamTab; label: string; icon: string; desc: string }[] = [
  { key: "situational", label: "Situational", icon: "◇", desc: "Scenario judgment, emergencies, weather, and field decisions" },
  { key: "theoretical", label: "Theoretical", icon: "⚖", desc: "CAAP PCAR Parts 1, 2, 4, and 11" },
  { key: "practical", label: "Practical", icon: "✈", desc: "CAAP skill test guide: pre-flight, maneuvers, RTH, post-flight" },
  { key: "actual", label: "Actual Skill Test", icon: "↯", desc: "CAAP field sequence, controller movement, and maneuvers" },
];

// ─── POOL SIZES shown per session ───────────────────────────────────────────
const SESSION_SIZE: Record<"situational" | "theoretical" | "practical", number> = {
  situational: 15,
  theoretical: 20,
  practical: 12,
};

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

// ─── SITUATIONAL BANK (27 questions) ─────────────────────────────────────────
const SITUATIONAL_POOL: Question[] = [
  {
    id: "sit-01",
    type: "mc",
    category: "Manned Aircraft",
    question: "During a commercial shoot at 350 ft AGL, a light aircraft enters your sector at low altitude on an intersecting path. What is the immediate correct action?",
    options: [
      "Maintain position — you are below 400 ft and have priority",
      "Ascend quickly so the aircraft crew can see you",
      "Give way immediately by descending or vectoring away from the aircraft path",
      "Hover and wait for the pilot to adjust course",
    ],
    correct: 2,
    explanation: "RPAS must yield to all manned aircraft at all times under CAAP regulations. Altitude compliance does not remove the duty to give way.",
  },
  {
    id: "sit-02",
    type: "mc",
    category: "Night Operations",
    question: "A client requests a night shoot 15 km from the nearest airport. You hold a standard RPC with no special permits. What applies?",
    options: [
      "You may fly if you maintain VLOS and have navigational lights on the drone",
      "Night operations are permitted below 120 m AGL without a special permit",
      "Night operations require a CAAP special authorization regardless of airport distance",
      "You may fly because 15 km is outside the 10 km restriction zone",
    ],
    correct: 2,
    explanation: "Night operations are prohibited without a CAAP-issued special authorization. Airport proximity is a separate regulatory concern.",
  },
  {
    id: "sit-03",
    type: "mc",
    category: "Battery Emergency",
    question: "Mid-mission your battery drops to 12% with the drone 250 m out and 80 m AGL. What is the safest course of action?",
    options: [
      "Complete the current shot and then return immediately",
      "Activate RTH and monitor; intervene manually if it drifts",
      "Climb to 120 m to gain better GPS and then return",
      "Hover to conserve power while you plan the route",
    ],
    correct: 1,
    explanation: "At critically low battery the priority is safe recovery. Activating RTH while staying ready to intervene is the correct protocol.",
  },
  {
    id: "sit-04",
    type: "mc",
    category: "Crowd Safety",
    question: "You are on final approach to land when a spectator steps past the safety barrier into the marked landing zone. What is the safest response?",
    options: [
      "Continue landing because you are already committed on final",
      "Yell a warning and land quickly to clear the area",
      "Abort the landing, climb to a safe hover, and attempt only when the zone is clear",
      "Perform an emergency landing on the nearest flat surface",
    ],
    correct: 2,
    explanation: "Landing above a person is never acceptable. Abort, stabilize, and reattempt when the zone is verified clear.",
  },
  {
    id: "sit-05",
    type: "mc",
    category: "ATTI Mode",
    question: "The drone loses GPS mid-flight and enters ATTI mode. Wind is from the east at 12 kph. What is the primary control difference the pilot must manage?",
    options: [
      "Only heading hold is lost; the drone will still resist wind drift",
      "The drone loses both GPS position hold and altitude hold simultaneously",
      "Position hold is gone; the drone will drift with wind and needs constant manual correction",
      "RTH activates automatically when GPS is lost",
    ],
    correct: 2,
    explanation: "ATTI mode removes GPS-based position hold. The drone drifts with wind and turbulence; the pilot must actively counter horizontal drift.",
  },
  {
    id: "sit-06",
    type: "mc",
    category: "Obstacle Avoidance",
    question: "On a waypoint mission, visual inspection reveals an unmarked high-tension power line that your mapping sensors may not detect. What is the correct response?",
    options: [
      "Let obstacle avoidance handle it — that is what it is for",
      "Increase mission altitude by 5 m to clear any obstacles automatically",
      "Immediately override to manual control and fly clear of the hazard",
      "Activate RTH to avoid the line",
    ],
    correct: 2,
    explanation: "Thin cables are frequently invisible to obstacle sensors. The pilot must take manual control and clear the hazard visually.",
  },
  {
    id: "sit-07",
    type: "tf",
    category: "Fatigue",
    question: "Under CAAP human factors guidance, pilot fatigue can impair reaction time and aeronautical decision-making enough to justify postponing a flight.",
    options: ["True", "False"],
    correct: 0,
    explanation: "Fatigue is a recognized human factors hazard. A remote pilot who is fatigued must not conduct safety-critical flight operations.",
  },
  {
    id: "sit-08",
    type: "tf",
    category: "Compass",
    question: "A compass calibration warning on the flight app may be cleared and ignored if the flying area appears open with no visible metal structures nearby.",
    options: ["True", "False"],
    correct: 1,
    explanation: "A compass warning must be resolved before flight. Erroneous heading data can cause erratic behavior, flyaway, or loss of control.",
  },
  {
    id: "sit-09",
    type: "mc",
    category: "Weather",
    question: "Your wind app shows gusts to 40 kph at the site. Your drone is rated for 38 kph. What is the appropriate action?",
    options: [
      "Fly — the drone can handle occasional brief gusts above its rated limit",
      "Fly at low altitude where wind is usually weaker",
      "Postpone — operating in conditions exceeding the aircraft's rated limits is not permitted",
      "Fly only over soft terrain to reduce risk if the drone loses control",
    ],
    correct: 2,
    explanation: "Operating beyond the aircraft manufacturer's stated environmental limits is a violation of airworthiness and operator duty of care.",
  },
  {
    id: "sit-10",
    type: "mc",
    category: "VLOS",
    question: "During a shoot the drone drifts to 700 m horizontal distance in haze. You can still see a faint blinking light but cannot determine orientation. What should you do?",
    options: [
      "Continue — you technically have the aircraft in sight",
      "Recall the drone immediately; losing orientation awareness equals losing VLOS",
      "Switch to FPV to regain orientation",
      "Increase altitude to get above the haze layer",
    ],
    correct: 1,
    explanation: "VLOS requires that the pilot can determine the drone's position, altitude, attitude, and direction. Losing orientation awareness ends compliant VLOS.",
  },
  {
    id: "sit-11",
    type: "mc",
    category: "Signal Loss",
    question: "The drone loses RC signal for 8 seconds. What should the pilot do when signal is restored?",
    options: [
      "Immediately continue the mission waypoints",
      "First confirm the aircraft position, altitude, battery, and heading before any command input",
      "Activate RTH immediately without checking status",
      "Land immediately at the nearest flat surface without delay",
    ],
    correct: 1,
    explanation: "After signal recovery, confirm aircraft state before any command. An uninformed command after signal loss can cause collision or overshoot.",
  },
  {
    id: "sit-12",
    type: "mc",
    category: "Airspace Violation",
    question: "Midway through a mission you receive a geo-fence notification that you are 200 m from a restricted zone boundary. The mission route passes another 300 m in the same direction. What do you do?",
    options: [
      "Continue — geo-fence alerts are advisory and you have not yet entered the zone",
      "Reduce altitude to below 30 m to exit the restricted zone",
      "Abort the leg, return to the last safe waypoint, and replanning the route away from the boundary",
      "Speed up to complete the pass before any enforcement action",
    ],
    correct: 2,
    explanation: "Geo-fence notifications are mandatory stop signals for the adjacent flight path. Continuing toward a restricted zone is a regulatory violation.",
  },
  {
    id: "sit-13",
    type: "mc",
    category: "Thunderstorm",
    question: "A cumulonimbus cloud builds rapidly 8 km upwind during a shoot. Lightning is visible. What is the correct action?",
    options: [
      "Complete the current shot and leave before the storm arrives",
      "Land immediately — lightning within 15 km and a building CB are grounds for immediate flight termination",
      "Reduce altitude to 50 m AGL to stay below the cloud",
      "Check radar and resume if the storm appears stationary",
    ],
    correct: 1,
    explanation: "A growing cumulonimbus with visible lightning is an extreme hazard. The standard practice is to land immediately and secure the equipment.",
  },
  {
    id: "sit-14",
    type: "mc",
    category: "Flyaway",
    question: "Your drone stops responding to commands and continues flying away. You have exhausted manual override attempts. What is the last-resort action?",
    options: [
      "Wait for the battery to die and let it crash wherever it falls",
      "Activate RTH one more time and move to a safer area",
      "Force-stop motors using the emergency stop command and immediately report the incident to CAAP",
      "Continue calling the drone over the radio",
    ],
    correct: 2,
    explanation: "Emergency motor stop limits further uncontrolled flight. A flyaway that results in an incident must be reported to CAAP within the required reporting window.",
  },
  {
    id: "sit-15",
    type: "mc",
    category: "Over Vehicles",
    question: "You are filming a road for a client and the planned path crosses directly above moving highway traffic. What is the regulatory position?",
    options: [
      "Permitted if you are below 120 m AGL",
      "Permitted if you can maintain VLOS",
      "Not permitted without specific CAAP authorization for operations over moving vehicles",
      "Permitted if traffic is light and the drone is under 250 g",
    ],
    correct: 2,
    explanation: "Operations directly over moving vehicles are treated as operations over populated areas and require CAAP authorization.",
  },
  {
    id: "sit-16",
    type: "mc",
    category: "Swollen Battery",
    question: "During pre-flight you notice one of your spare batteries has a visibly swollen outer case. What is the correct action?",
    options: [
      "Use it only for brief hover checks near the landing zone",
      "Remove it from service, store it safely away from flammables, and dispose of it properly",
      "Discharge it fully by flying and then discard",
      "Tape the casing and continue using it for the day",
    ],
    correct: 1,
    explanation: "A swollen lithium battery is a thermal runaway hazard. It must not be used, must be isolated from combustibles, and must be disposed of correctly.",
  },
  {
    id: "sit-17",
    type: "mc",
    category: "Multiple Drones",
    question: "Two remote pilots from the same company plan to fly simultaneously in the same general area on separate shoots. What is required?",
    options: [
      "Each pilot proceeds independently — VLOS rules are individual",
      "A coordinated flight plan, clear separation agreements, and ideally a designated safety observer for each aircraft",
      "One pilot must land when the other is in the air",
      "Both may fly as long as they maintain 30 m lateral separation",
    ],
    correct: 1,
    explanation: "Multi-aircraft operations in shared airspace demand coordination, defined separation, and observer support to prevent mid-air conflict.",
  },
  {
    id: "sit-18",
    type: "tf",
    category: "Insurance",
    question: "Third-party liability insurance is optional for commercial RPAS operations in the Philippines.",
    options: ["True", "False"],
    correct: 1,
    explanation: "CAAP regulations require third-party liability insurance for commercial RPAS operations. It is not optional.",
  },
  {
    id: "sit-19",
    type: "mc",
    category: "Observer",
    question: "Your visual observer has lost sight of the drone in a gap between buildings. You still have it on FPV. What is the correct status?",
    options: [
      "You are still VLOS compliant because you can see via FPV",
      "VLOS is broken; the observer and the pilot must maintain unaided visual contact for VLOS compliance",
      "VLOS applies only to the pilot, not the observer",
      "FPV counts as VLOS if the feed is clear and latency is under 100 ms",
    ],
    correct: 1,
    explanation: "FPV does not satisfy VLOS requirements under CAAP. VLOS requires direct, unaided visual contact by the pilot or a designated observer.",
  },
  {
    id: "sit-20",
    type: "mc",
    category: "Rain",
    question: "Light drizzle begins unexpectedly midway through an exterior shoot. Your drone is not rated for rain or moisture ingress. What do you do?",
    options: [
      "Continue if the drizzle is light and the motors sound normal",
      "Cover the battery compartment with tape and finish the last angles",
      "Land immediately — moisture can cause short circuits, sensor failure, and loss of control",
      "Fly fast to minimize exposure time in the rain",
    ],
    correct: 2,
    explanation: "Flying an unrated drone in rain risks motor failure, ESC damage, and electrical shorts. Immediate landing is required.",
  },
  {
    id: "sit-21",
    type: "mc",
    category: "Altitude Limit",
    question: "A client requests the drone operate at 500 ft AGL for a panoramic shot in an uncontrolled area with no special authorization. What is correct?",
    options: [
      "Proceed — the area is uncontrolled so no altitude limit applies",
      "Proceed at 500 ft if you notify the nearest ATC unit verbally",
      "Decline — standard maximum is 400 ft AGL without CAAP authorization for higher altitude",
      "Proceed if no manned aircraft are visible in the area",
    ],
    correct: 2,
    explanation: "Standard RPAS altitude limit is 400 ft (120 m) AGL. Operations above this require CAAP authorization regardless of airspace class.",
  },
  {
    id: "sit-22",
    type: "mc",
    category: "Privacy",
    question: "During a real-estate aerial shoot you inadvertently capture extended footage of a neighbor's private property and its occupants. What is the responsible action?",
    options: [
      "Keep the footage since you were on a legitimate commercial job",
      "Review the footage and delete frames that clearly identify individuals or private spaces not part of the subject property",
      "Give the full footage to the client and let them decide",
      "Post it only to a closed drive, not publicly",
    ],
    correct: 1,
    explanation: "CAAP and Philippine privacy law require that incidental capture of private individuals be handled responsibly. Identifiable private footage must be removed.",
  },
  {
    id: "sit-23",
    type: "tf",
    category: "Incident Reporting",
    question: "Under CAAP RPAS rules, a serious incident involving an RPAS must be reported within 72 hours of occurrence.",
    options: ["True", "False"],
    correct: 0,
    explanation: "CAAP requires serious incidents to be reported within 72 hours. Accidents with injuries or significant property damage require a preliminary report within 24 hours.",
  },
  {
    id: "sit-24",
    type: "mc",
    category: "Human Factors",
    question: "You are four hours into a continuous outdoor shoot in 34°C heat. You feel alert but notice your stick inputs are less precise than normal. What should you do?",
    options: [
      "Continue — minor imprecision is normal and will self-correct",
      "Take a break, rehydrate, and reassess fitness before continuing",
      "Switch to automated flight modes to compensate for reduced manual skill",
      "Lower the altitude to reduce the consequence of any errors",
    ],
    correct: 1,
    explanation: "Physical fatigue, dehydration, and heat are human factors that degrade manual control. The pilot must assess fitness to fly before continuing.",
  },
  {
    id: "sit-25",
    type: "mc",
    category: "Emergency Landing",
    question: "Engine vibration spikes suddenly and the drone begins to wobble. You are 100 m from the takeoff point at 60 m AGL. What is the priority?",
    options: [
      "Return to the launch point immediately at full speed",
      "Climb to gain altitude buffer before assessing",
      "Select the safest available landing spot and execute a controlled descent immediately",
      "Activate RTH and trust the system to handle the return",
    ],
    correct: 2,
    explanation: "Abnormal vibration signals a potential propulsion failure. Immediate controlled descent to the nearest safe landing spot is the priority — not a long return journey.",
  },
  {
    id: "sit-26",
    type: "mc",
    category: "Night Operations",
    question: "You are authorized for a night operation. Which lighting configuration is required on the RPAS during the flight?",
    options: [
      "No lights required if the pilot can see the drone via FPV",
      "Anti-collision lighting visible from at least 3 statute miles is required",
      "A single white strobe light visible from any angle",
      "Lights are only required when flying above 200 ft AGL at night",
    ],
    correct: 1,
    explanation: "Authorized night operations require anti-collision lighting clearly visible from a minimum distance so the aircraft can be seen by other airspace users.",
  },
  {
    id: "sit-27",
    type: "mc",
    category: "Controlled Airspace",
    question: "You want to fly 4 km from Mactan-Cebu International Airport boundary. What is required before flight?",
    options: [
      "No special action — 4 km is outside all RPAS restriction zones",
      "Notify your ground observer by phone",
      "Obtain prior authorization from the appropriate Air Traffic Service (ATS) unit",
      "File a flight plan with the airline, not CAAP",
    ],
    correct: 2,
    explanation: "Operations within 10 km of an aerodrome reference point require prior authorization from the relevant ATS unit. 4 km is well inside that zone.",
  },
];

// ─── THEORETICAL BANK (40 questions — PCAR Parts 1, 2, 4, and 11 only) ────────
const THEORETICAL_POOL: Question[] = [
  // ── Part 1: Definitions ────────────────────────────────────────────────────
  {
    id: "th-01",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, an RPAS is defined as consisting of:",
    options: [
      "The remotely piloted aircraft alone",
      "The remotely piloted aircraft, its associated remote pilot station(s), required command-and-control links, and any other components specified in the design",
      "The aircraft and the pilot's certificate",
      "The aircraft and the application used to control it",
    ],
    correct: 1,
    explanation: "PCAR Part 1 defines RPAS as the complete system: the RPA, the remote pilot station(s), the C2 links, and any other components. The aircraft alone is just an RPA.",
  },
  {
    id: "th-02",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, what distinguishes a Remotely Piloted Aircraft (RPA) from a model aircraft?",
    options: [
      "Model aircraft weigh more than 25 kg",
      "An RPA is used for aviation purposes other than pure recreation; a model aircraft is used solely for recreational flying by sport or hobby clubs",
      "Only the presence of a camera distinguishes the two",
      "RPAs must always be registered; model aircraft never require registration",
    ],
    correct: 1,
    explanation: "PCAR Part 1 separates RPAs (aviation-purpose use, including commercial) from model aircraft (exclusively recreational or hobby use). The intended use is the key distinction.",
  },
  {
    id: "th-03",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, 'operating mass' of an RPAS is best defined as:",
    options: [
      "The manufacturer's published maximum takeoff weight",
      "The empty airframe weight without battery",
      "The total mass of the aircraft at the time of operation, including all installed components, battery, fuel (if any), and payload",
      "The dry weight as stamped on the aircraft data plate",
    ],
    correct: 2,
    explanation: "Operating mass includes everything on the aircraft at the time of the flight — airframe, battery, gimbal, camera, and any attached payload.",
  },
  {
    id: "th-04",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, a 'Remote Pilot Station' (RPS) is:",
    options: [
      "Any vehicle from which a remote pilot operates an RPAS",
      "The component of the RPAS that contains the equipment used to pilot the remotely piloted aircraft",
      "Only the handheld radio controller",
      "A fixed CAAP-designated ground control point",
    ],
    correct: 1,
    explanation: "The Remote Pilot Station is the ground-side element of the RPAS from which the pilot controls the aircraft — it may be a handheld controller, a ground control station, or a combination of both.",
  },
  {
    id: "th-05",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, 'Visual Line of Sight (VLOS)' requires:",
    options: [
      "FPV camera feed as the primary means of situational awareness",
      "Camera-assisted contact with less than 200 ms latency",
      "Direct, unaided visual contact by the remote pilot (or designated observer) sufficient to continuously determine the aircraft's position, altitude, attitude, and direction of flight",
      "Radar contact with the aircraft maintained by ATC",
    ],
    correct: 2,
    explanation: "VLOS is defined in PCAR Part 1 as direct, unaided eye contact (corrective lenses permitted). FPV or binoculars do not satisfy VLOS.",
  },
  {
    id: "th-06",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, the 'Remote Pilot in Command' (RPIC) is:",
    options: [
      "The most senior employee of the ROC holder present on site",
      "The person who signed the training certificate",
      "The remote pilot designated as having final responsibility for the conduct of a flight",
      "Any RPC holder physically present at the launch point",
    ],
    correct: 2,
    explanation: "The RPIC is the designated person with command authority and final responsibility for the safety of the flight. This is analogous to the Pilot in Command designation in manned aviation.",
  },
  {
    id: "th-07",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, a 'commercial RPAS operation' is one in which the RPAS is used:",
    options: [
      "At any altitude above 30 m AGL",
      "For compensation or hire, or in furtherance of a business, regardless of whether direct payment is made per flight",
      "Outdoors and beyond the operator's private property",
      "Only when a formal contract between operator and client exists",
    ],
    correct: 1,
    explanation: "Commercial operation is triggered by the use for compensation, hire, or business purposes — not solely by the existence of a direct per-flight payment.",
  },
  {
    id: "th-08",
    type: "mc",
    category: "Part 1 · Definitions",
    question: "Under PCAR Part 1, 'Beyond Visual Line of Sight (BVLOS)' operation means:",
    options: [
      "Flying at a range where FPV is the only available guidance",
      "Operating at night without anti-collision lighting",
      "Operating the RPA at a distance or in conditions where direct unaided visual contact cannot be maintained by the pilot or observer",
      "Operating inside controlled airspace without ATC clearance",
    ],
    correct: 2,
    explanation: "BVLOS is defined by the loss of direct unaided visual contact with the aircraft, regardless of whether FPV or telemetry is available.",
  },
  // ── Part 2: Personnel Licensing ───────────────────────────────────────────
  {
    id: "th-09",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "What is the minimum age requirement to apply for a Remote Pilot Certificate (RPC) under PCAR Part 2?",
    options: ["16 years old", "18 years old", "21 years old", "No minimum age is specified"],
    correct: 1,
    explanation: "PCAR Part 2 sets 18 years as the minimum age for RPC applicants.",
  },
  {
    id: "th-10",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "What is the required passing score for the CAAP Remote Pilot Certificate written knowledge examination?",
    options: ["70%", "75%", "80%", "85%"],
    correct: 1,
    explanation: "The CAAP RPC theoretical knowledge examination requires a minimum passing score of 75%.",
  },
  {
    id: "th-11",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "Under PCAR Part 2, an RPC applicant must complete ground school and practical training at:",
    options: [
      "Any registered drone club or association",
      "A CAAP-accredited training provider recognized under Part 2",
      "A foreign flight school with ICAO accreditation",
      "Any venue if the training is self-documented",
    ],
    correct: 1,
    explanation: "Training must be completed at a CAAP-accredited training provider. Unaccredited training does not satisfy the requirement.",
  },
  {
    id: "th-12",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "What is the difference between a Remote Pilot Certificate (RPC) and a Remote Operator Certificate (ROC) under PCAR Part 2?",
    options: [
      "They are the same document issued under different names to the same person",
      "The RPC is issued to the individual pilot; the ROC is issued to the operating organization or company",
      "The RPC covers recreational flying; the ROC covers all commercial operations",
      "The ROC is only required for RPAS weighing more than 25 kg",
    ],
    correct: 1,
    explanation: "The RPC certifies an individual pilot's competency and knowledge. The ROC certifies the operator organization's safety management system and authority to conduct RPAS operations commercially.",
  },
  {
    id: "th-13",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "Under PCAR Part 2, a Remote Operator Certificate (ROC) holder is required to:",
    options: [
      "Only ensure the RPC of each pilot is current",
      "Establish and maintain a safety management system and demonstrate organizational competency to CAAP",
      "Issue pilot certificates on behalf of CAAP",
      "Hold a Class 1 medical certificate as the chief pilot",
    ],
    correct: 1,
    explanation: "The ROC requires the organization to have a functioning safety management system and demonstrate systemic airworthiness and operational competency, not just individual pilot credentials.",
  },
  {
    id: "th-14",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "Under PCAR Part 2, if a remote pilot develops a medical condition that may impair their ability to safely operate an RPAS, they must:",
    options: [
      "Continue flying as long as they feel capable on the day",
      "Notify CAAP and refrain from exercising RPC privileges until medically cleared",
      "Only report it if the condition requires hospitalization",
      "Notify the training provider rather than CAAP",
    ],
    correct: 1,
    explanation: "A medical condition that could affect flight safety triggers a mandatory duty to notify CAAP and suspend flying until medical clearance is obtained.",
  },
  {
    id: "th-15",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "Under PCAR Part 2, a foreign-issued remote pilot certificate:",
    options: [
      "Is automatically valid in the Philippines for all commercial operations",
      "Must be validated or converted to a CAAP-issued equivalent before conducting commercial RPAS operations in the Philippines",
      "Is accepted for commercial operations if issued by any ICAO member state",
      "Is accepted for recreational use but not commercial use",
    ],
    correct: 1,
    explanation: "Foreign certificates must go through CAAP validation or conversion. There is no automatic mutual recognition for commercial operations.",
  },
  {
    id: "th-16",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "Under PCAR Part 2, currency requirements for an RPC holder mean:",
    options: [
      "The pilot must fly at least once every calendar month",
      "The pilot must demonstrate recent flight experience within the timeframe prescribed by CAAP to exercise certificate privileges",
      "Currency is automatically maintained by holding a valid RPC",
      "Currency requirements apply only to manned aircraft pilots, not remote pilots",
    ],
    correct: 1,
    explanation: "Currency is a separate, ongoing requirement from certification. Pilots must maintain recent experience as defined by CAAP to lawfully exercise the privileges of their RPC.",
  },
  {
    id: "th-17",
    type: "mc",
    category: "Part 2 · Licensing",
    question: "Under PCAR Part 2, renewal of an expired Remote Pilot Certificate requires the pilot to:",
    options: [
      "Simply pay the renewal fee without any re-evaluation",
      "Demonstrate continued competency through recurrent knowledge and skills assessment as prescribed by CAAP",
      "Obtain any medical certificate from a licensed physician",
      "Reapply from scratch and repeat full initial training",
    ],
    correct: 1,
    explanation: "CAAP specifies recurrency requirements for RPC renewal. Paying the fee alone is not sufficient — the pilot must demonstrate continuing competency.",
  },
  // ── Part 4: Airworthiness ─────────────────────────────────────────────────
  {
    id: "th-18",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, which RPAS category may be exempt from formal registration requirements?",
    options: [
      "Any aircraft under 2 kg operating mass",
      "Sub-250 g aircraft operated solely for recreational purposes",
      "Any aircraft operated entirely indoors",
      "Aircraft under 7 kg used by accredited training providers",
    ],
    correct: 1,
    explanation: "PCAR Part 4 allows sub-250 g aircraft used purely for recreation to be exempt from the standard RPAS registration process. Commercial use of any mass triggers full requirements.",
  },
  {
    id: "th-19",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, the 'Small RPAS' weight category covers aircraft with an operating mass of:",
    options: ["Less than 250 g", "More than 250 g up to 7 kg", "More than 7 kg up to 25 kg", "More than 25 kg up to 150 kg"],
    correct: 1,
    explanation: "PCAR Part 4 defines Small RPAS as aircraft with an operating mass exceeding 250 g but not more than 7 kg.",
  },
  {
    id: "th-20",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, the 'Medium RPAS' weight category covers aircraft with an operating mass of:",
    options: ["More than 250 g up to 7 kg", "More than 7 kg up to 25 kg", "More than 2 kg up to 20 kg", "More than 15 kg up to 50 kg"],
    correct: 1,
    explanation: "PCAR Part 4 defines Medium RPAS as aircraft with an operating mass exceeding 7 kg but not more than 25 kg.",
  },
  {
    id: "th-21",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, the 'Large RPAS' category applies to aircraft with an operating mass of:",
    options: ["More than 7 kg", "More than 15 kg", "More than 25 kg", "More than 150 kg"],
    correct: 2,
    explanation: "PCAR Part 4 classifies RPAS exceeding 25 kg operating mass as Large, which attracts the most stringent airworthiness and certification requirements.",
  },
  {
    id: "th-22",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "What registration marking prefix is assigned to civil Remotely Piloted Aircraft in the Philippines under PCAR Part 4?",
    options: ["RP-U", "RP-C", "PH-RPAS", "CAAP-UAV"],
    correct: 0,
    explanation: "Civil RPA registration markings use the prefix RP-U followed by CAAP-assigned alphanumeric characters, as specified in PCAR Part 4.",
  },
  {
    id: "th-23",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, where must the RP-U registration mark appear on the aircraft?",
    options: [
      "Only in the aircraft logbook and registration certificate",
      "Legibly displayed on the exterior of the aircraft in a location visible for inspection",
      "On the battery pack only",
      "On the remote controller only",
    ],
    correct: 1,
    explanation: "The registration mark must be physically affixed to the exterior of the aircraft so it is visible and legible for inspection without disassembly.",
  },
  {
    id: "th-24",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, who bears primary responsibility for maintaining the RPAS in an airworthy condition?",
    options: [
      "The drone manufacturer through a mandatory service contract",
      "CAAP through scheduled periodic inspections",
      "The registered operator or owner of the RPAS",
      "The accredited training provider that trained the pilot",
    ],
    correct: 2,
    explanation: "The registered operator/owner is responsible for airworthiness. CAAP does not conduct routine maintenance — it sets the standards and inspects for compliance.",
  },
  {
    id: "th-25",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, an RPAS that has sustained structural damage in an accident:",
    options: [
      "May resume flight once the pilot visually confirms there are no visible cracks",
      "Must be declared unairworthy and may not be operated until inspected and cleared by a qualified person",
      "Can fly again as long as the propellers are intact and the battery reads normal voltage",
      "Should be test-flown briefly at low altitude to confirm systems function before returning to service",
    ],
    correct: 1,
    explanation: "Structural damage renders the aircraft unairworthy. Operations must cease until a qualified inspection confirms the aircraft is again safe to fly.",
  },
  {
    id: "th-26",
    type: "mc",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, an RPAS registration must be updated or renewed when:",
    options: [
      "Never — registration is permanent for the life of the aircraft",
      "Only when the aircraft is involved in an accident",
      "When the aircraft changes ownership, the operator's address changes, or upon expiry of the registration validity period",
      "Only when the pilot upgrades to a higher RPC category",
    ],
    correct: 2,
    explanation: "PCAR Part 4 requires registration updates on change of ownership, change of operator address, or upon the registration period lapsing.",
  },
  {
    id: "th-27",
    type: "tf",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, the operator is required to keep records of maintenance, modifications, and airworthiness actions for CAAP inspection on demand.",
    options: ["True", "False"],
    correct: 0,
    explanation: "Comprehensive maintenance and airworthiness records are a Part 4 obligation. CAAP can demand access to these records at any time.",
  },
  {
    id: "th-28",
    type: "tf",
    category: "Part 4 · Airworthiness",
    question: "Under PCAR Part 4, a sub-250 g RPAS used for any commercial operation requires the same registration and certification as a Small RPAS.",
    options: ["True", "False"],
    correct: 0,
    explanation: "The sub-250 g recreational exemption does not apply to commercial operations. Commercial use triggers full registration and certification requirements regardless of aircraft mass.",
  },
  // ── Part 11: RPAS Operations ──────────────────────────────────────────────
  {
    id: "th-29",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, the maximum altitude for standard RPAS operations without special CAAP authorization is:",
    options: ["200 ft AGL (approximately 61 m)", "400 ft AGL (approximately 120 m)", "1,000 ft AGL", "3,000 ft AGL"],
    correct: 1,
    explanation: "PCAR Part 11 sets a standard ceiling of 400 ft AGL (approximately 120 m). Operations above this require a specific CAAP authorization.",
  },
  {
    id: "th-30",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, RPAS operations within how many kilometers of an aerodrome reference point (ARP) require prior ATS authorization?",
    options: ["3 km", "5 km", "10 km", "15 km"],
    correct: 2,
    explanation: "PCAR Part 11 mandates prior authorization from the relevant Air Traffic Service unit for any RPAS operation within 10 km of an aerodrome reference point.",
  },
  {
    id: "th-31",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, which of the following requires a specific CAAP special authorization?",
    options: [
      "VLOS flight in a rural area below 120 m AGL",
      "Recreational flight in an open field more than 10 km from any airport",
      "BVLOS operations and operations over congested areas or assemblies of persons",
      "A hover check at eye level inside a private compound",
    ],
    correct: 2,
    explanation: "PCAR Part 11 classifies BVLOS operations and flights over congested or populated areas as high-risk, requiring specific CAAP authorization beyond the standard RPC.",
  },
  {
    id: "th-32",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, standard RPAS day operations are defined as the period from:",
    options: [
      "Sunrise to sunset when the sun disc is fully above the horizon",
      "30 minutes before official sunrise to 30 minutes after official sunset (civil twilight)",
      "06:00 to 18:00 local time only",
      "Any time the pilot can visually acquire the aircraft",
    ],
    correct: 1,
    explanation: "PCAR Part 11 defines the standard day operating window as civil twilight — 30 minutes before sunrise to 30 minutes after sunset. Night authorization is required outside this window.",
  },
  {
    id: "th-33",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, the minimum flight visibility for standard RPAS VLOS operations is:",
    options: ["500 m", "800 m", "1,500 m", "5 km"],
    correct: 2,
    explanation: "PCAR Part 11 prescribes 1,500 m as the standard minimum flight visibility to support unaided VLOS operations.",
  },
  {
    id: "th-34",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, third-party liability insurance for commercial RPAS operations is:",
    options: [
      "Optional but strongly encouraged",
      "Mandatory — operators must maintain insurance covering bodily injury and property damage",
      "Required only for operations over congested areas",
      "Waived automatically if the operator holds a valid ROC",
    ],
    correct: 1,
    explanation: "PCAR Part 11 mandates third-party liability insurance for all commercial RPAS operations. It is not optional.",
  },
  {
    id: "th-35",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, a preliminary accident report involving serious injury must be submitted to CAAP within:",
    options: ["24 hours of the occurrence", "72 hours of the occurrence", "7 calendar days", "30 days through the annual safety report"],
    correct: 0,
    explanation: "PCAR Part 11 requires a preliminary accident report to CAAP within 24 hours when the accident involves serious injury. A full investigation report follows separately.",
  },
  {
    id: "th-36",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, a serious incident that did not result in an accident but nearly did:",
    options: [
      "Does not require any reporting to CAAP",
      "Must be reported through the CAAP safety reporting system",
      "Only needs to be noted in the operator's internal logbook",
      "Is reportable only if witnessed by a third party",
    ],
    correct: 1,
    explanation: "Near-miss and serious incident reporting is required under PCAR Part 11. The safety reporting system exists specifically to capture these events and prevent future accidents.",
  },
  {
    id: "th-37",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, how many RPAS may a single Remote Pilot in Command (RPIC) control simultaneously?",
    options: [
      "As many as the pilot's skill allows",
      "Up to two aircraft simultaneously if both are sub-7 kg",
      "Only one RPAS at a time, unless otherwise specifically authorized by CAAP",
      "Up to four aircraft with one approved visual observer per aircraft",
    ],
    correct: 2,
    explanation: "PCAR Part 11 limits the RPIC to one aircraft at a time. Multi-aircraft operations require specific authorization beyond standard RPC privileges.",
  },
  {
    id: "th-38",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, operations directly over moving vehicles or vessels on public roads or waterways:",
    options: [
      "Are permitted below 50 m AGL if VLOS is maintained",
      "Are permitted for aircraft under 7 kg operating mass",
      "Require specific CAAP authorization as they are treated as operations over populated or congested areas",
      "Are permitted for sub-250 g aircraft without authorization",
    ],
    correct: 2,
    explanation: "Flying directly over moving vehicles or vessels is treated as operations over a populated area, which is a high-risk category requiring CAAP special authorization under Part 11.",
  },
  {
    id: "th-39",
    type: "mc",
    category: "Part 11 · Operations",
    question: "PCAR Part 11 specifically governs:",
    options: [
      "Air traffic control procedures for manned aircraft",
      "Airworthiness standards for manned aircraft",
      "Remotely Piloted Aircraft Systems — operations, certification, registration, and operational rules in the Philippines",
      "Airport and aerodrome design standards",
    ],
    correct: 2,
    explanation: "PCAR Part 11 is the dedicated RPAS chapter covering the full spectrum: pilot certification, operator certification, registration, operational rules, and enforcement.",
  },
  {
    id: "th-40",
    type: "mc",
    category: "Part 11 · Operations",
    question: "Under PCAR Part 11, Designated Unmanned Aircraft Flying Areas (DUAFAs) allow RPAS operators to:",
    options: [
      "Fly without any restrictions or altitude limits",
      "Conduct RPAS operations under pre-approved conditions without requiring individual ATS authorization for every flight",
      "Override CAAP rules within the designated boundary",
      "Fly BVLOS without a specific waiver",
    ],
    correct: 1,
    explanation: "DUAFAs are pre-approved areas where compliant RPAS operations may proceed under established conditions, streamlining the authorization process for routine operations.",
  },
];

// ─── PRACTICAL BANK (20 questions) ────────────────────────────────────────────
const PRACTICAL_POOL: Question[] = [
  {
    id: "prac-01",
    type: "mc",
    category: "Pre-flight Walkaround",
    question: "During the CAAP skill test walkaround, what is the correct inspection protocol for each component?",
    options: [
      "Inspect silently and quickly to save time before the checker",
      "Voice out each part being inspected and declare its condition clearly",
      "Only visually check propellers and battery, skip the rest",
      "Ask the checker to confirm each item before moving to the next",
    ],
    correct: 1,
    explanation: "The skill test guide requires inspecting in logical order, voicing each part, and verbally declaring its condition. Silent inspection is not accepted.",
  },
  {
    id: "prac-02",
    type: "mc",
    category: "Power Sequence",
    question: "What is the correct and accepted startup sequence for the CAAP skill test?",
    options: [
      "Power on aircraft first, then the remote controller",
      "Power on the remote controller first, verbally request permission, then power on the aircraft",
      "Phone app first, then aircraft, then controller",
      "Power aircraft and controller simultaneously",
    ],
    correct: 1,
    explanation: "The approved sequence is: remote controller first, verbal permission request to the checker, then aircraft power-on.",
  },
  {
    id: "prac-03",
    type: "mc",
    category: "System Check",
    question: "Which five items must be verbally confirmed on the flight screen before the pilot declares ready for takeoff?",
    options: [
      "Map style, camera resolution, memory card size, flight mode, and signal bars",
      "Compass/IMU status, GPS satellite count, RC link quality, battery voltage, and home point recorded",
      "Drone weight, pilot name, client name, date, and location",
      "Weather app reading, SD card, gimbal status, obstacle avoidance mode, and screen brightness",
    ],
    correct: 1,
    explanation: "The practical reviewer lists compass/IMU normal, GPS lock, RC signal, battery voltage, and home point recording as the five required pre-takeoff checks.",
  },
  {
    id: "prac-04",
    type: "mc",
    category: "Post-hover Check",
    question: "After arming motors and achieving a stable hover at eye level, what must the pilot do before starting the maneuver sequence?",
    options: [
      "Immediately proceed to the square pattern to show confidence",
      "Verbally confirm hover stability and wait for checker's instruction to begin",
      "Climb to 30 m AGL for better stability before maneuvers",
      "Switch to sport mode to demonstrate advanced control",
    ],
    correct: 1,
    explanation: "An eye-level hover check and verbal confirmation that the aircraft is stable are required before any maneuver sequence begins.",
  },
  {
    id: "prac-05",
    type: "mc",
    category: "Tail-in Square",
    question: "In a tail-in square pattern, what is the stick input sequence at each corner?",
    options: [
      "Roll right, pause, yaw 45 degrees left",
      "Pitch forward to travel the leg, stop, yaw right 90 degrees, then pitch forward again",
      "Pitch forward continuously while yawing right",
      "Roll right for the full leg, yaw at corners",
    ],
    correct: 1,
    explanation: "Tail-in square: pitch forward along each leg, full stop, yaw right 90 degrees to align with the next leg, then pitch forward again.",
  },
  {
    id: "prac-06",
    type: "mc",
    category: "Nose-in Control",
    question: "When the drone is nose-in (facing the pilot), which control behavior must the pilot be aware of?",
    options: [
      "All controls function normally — orientation does not affect stick response",
      "Only the throttle axis is affected; lateral controls remain standard",
      "Roll and pitch inputs are reversed from the pilot's perspective",
      "Yaw control is disabled in nose-in orientation",
    ],
    correct: 2,
    explanation: "Nose-in orientation reverses the apparent direction of roll and pitch from the pilot's perspective. The pilot must compensate for this reversal during nose-in maneuvers.",
  },
  {
    id: "prac-07",
    type: "mc",
    category: "RTH Demo",
    question: "During the RTH demonstration for the checker, what safety habit is specifically required?",
    options: [
      "Step back from the controller and let the system complete the landing",
      "Keep one hand near the pause/stop control and be ready to intervene if the aircraft drifts or enters a hazardous path",
      "Keep hands completely off the controller to show confidence in the system",
      "Disable the home point so the checker can assess manual recovery skills",
    ],
    correct: 1,
    explanation: "The skill test guide requires keeping a finger near the pause control throughout RTH to intervene if the aircraft drifts, enters a hazard, or approaches a person.",
  },
  {
    id: "prac-08",
    type: "mc",
    category: "Post-flight Shutdown",
    question: "What is the correct power-down order after landing at the conclusion of the skill test?",
    options: [
      "Remote controller first, then aircraft",
      "Aircraft first, then remote controller",
      "Phone app disconnect first, then aircraft, then controller",
      "Any order is acceptable if done within 60 seconds",
    ],
    correct: 1,
    explanation: "The approved sequence is: power off the aircraft first, then the remote controller. This mirrors the startup sequence in reverse.",
  },
  {
    id: "prac-09",
    type: "mc",
    category: "Test Day Items",
    question: "Which document is specifically listed as required to bring to the CAAP skill test?",
    options: [
      "Photocopy of the manufacturer's manual",
      "Original Training Certificate from an accredited training provider",
      "Barangay clearance from your place of residence",
      "A letter of recommendation from a licensed pilot",
    ],
    correct: 1,
    explanation: "The original training certificate from an accredited training provider is a required document for the skill test day.",
  },
  {
    id: "prac-10",
    type: "tf",
    category: "Attire",
    question: "The CAAP skill test guide requires proper attire including a collared shirt for the test day.",
    options: ["True", "False"],
    correct: 0,
    explanation: "Proper attire, specifically including a collared shirt, is stated in the skill test guidance. Appearance is part of professional airmanship assessment.",
  },
  {
    id: "prac-11",
    type: "mc",
    category: "Calibration Order",
    question: "During bench setup, what is the required calibration sequence when the checker asks for calibration?",
    options: [
      "Gimbal first, then compass, then IMU",
      "IMU calibration, then drone compass calibration, then gimbal calibration",
      "Compass only — IMU and gimbal are not required for a standard test",
      "Any order is acceptable as long as all three are completed",
    ],
    correct: 1,
    explanation: "The skill test guide specifies: IMU first, then drone compass calibration, then gimbal calibration in that sequence.",
  },
  {
    id: "prac-12",
    type: "mc",
    category: "Bench Setup",
    question: "In what state should the aircraft be presented to the checker at the start of the bench setup phase?",
    options: [
      "Fully assembled and powered on to demonstrate readiness",
      "Propellers and battery detached so the attachment process can be demonstrated step by step",
      "Propellers attached but battery removed for safety",
      "Fully assembled but not powered on",
    ],
    correct: 1,
    explanation: "The aircraft must be presented with both propellers and battery detached so the checker can evaluate the pilot's safe assembly procedure.",
  },
  {
    id: "prac-13",
    type: "mc",
    category: "Figures",
    question: "During the pattern flight sequence, which five figures are typically demonstrated?",
    options: [
      "Circle, square, triangle, spiral, and figure-8",
      "Circle, square, rectangle, zigzag, and hover",
      "Orbit, box, triangle, line, and ascend/descend",
      "Figure-8, circle, hover, yaw spin, and landing",
    ],
    correct: 0,
    explanation: "The standard CAAP skill test pattern sequence includes circle, square, triangle, spiral, and figure-8 — each performed smoothly with return to starting position.",
  },
  {
    id: "prac-14",
    type: "mc",
    category: "Takeoff Clearance",
    question: "What is the correct pilot verbal statement before executing takeoff during the skill test?",
    options: [
      "'Drone is ready, starting flight.'",
      "'Area clear. GPS locked. Home point recorded. Battery at [level]. Requesting permission for takeoff.'",
      "'Ready when you are, sir.'",
      "'Battery confirmed, motors armed, initiating takeoff.'",
    ],
    correct: 1,
    explanation: "The required script covers area clearance, GPS lock, home point status, battery level, and a formal request for takeoff permission from the checker.",
  },
  {
    id: "prac-15",
    type: "mc",
    category: "Safety Equipment",
    question: "Which safety items should be present on the skill test site?",
    options: [
      "Only a fire extinguisher",
      "Landing pad, safety cones, and a first-aid kit",
      "High-visibility vest and safety goggles only",
      "No special equipment required for a skill test",
    ],
    correct: 1,
    explanation: "The skill test guidance lists landing pad, safety cones, and a first-aid kit as minimum site safety equipment.",
  },
  {
    id: "prac-16",
    type: "mc",
    category: "Normal Landing",
    question: "When performing normal landing into wind, what is the primary reason for landing into wind?",
    options: [
      "It reduces battery consumption during descent",
      "It gives the drone a slower ground speed, improving landing precision and reducing drift",
      "It prevents compass interference from the controller",
      "CAAP mandates all landings face the ARP of the nearest airport",
    ],
    correct: 1,
    explanation: "Landing into wind slows the effective ground speed, giving the pilot better control over the landing spot and reducing the risk of overshoot or drift.",
  },
  {
    id: "prac-17",
    type: "tf",
    category: "Sunglasses",
    question: "The CAAP skill test guide permits wearing sunglasses during the test if they are standard non-prescription fashion sunglasses.",
    options: ["True", "False"],
    correct: 1,
    explanation: "The skill test guide states no shades unless they are corrective eyewear. Standard fashion sunglasses are not permitted during the test.",
  },
  {
    id: "prac-18",
    type: "mc",
    category: "GPS Count",
    question: "What satellite count is stated in the practical guidance as the recommended minimum before commanding takeoff?",
    options: ["4 satellites", "6 satellites", "10 or more satellites", "Any positive GPS lock"],
    correct: 2,
    explanation: "The practical reviewer states 10 or more GPS satellites as the practical minimum for a confident, stable lock before takeoff.",
  },
  {
    id: "prac-19",
    type: "mc",
    category: "Post-flight Check",
    question: "After powering down during post-flight, what should the pilot check and report?",
    options: [
      "Only the SD card footage to confirm the shoot was successful",
      "Battery temperature, physical damage, propeller condition, and gimbal status — then deliver a verbal report to the checker",
      "Recharge batteries immediately and log flight duration only",
      "Post-flight checks are optional if the flight went smoothly",
    ],
    correct: 1,
    explanation: "Post-flight includes checking battery heat, physical damage, propeller and gimbal condition, followed by a clear verbal report to the checker.",
  },
  {
    id: "prac-20",
    type: "mc",
    category: "Emergency Procedure",
    question: "How is the emergency landing procedure different from normal landing in the skill test context?",
    options: [
      "Emergency landing uses RTH; normal landing uses manual descent",
      "Emergency landing is treated as a separate command sequence with immediate descent to the nearest safe spot, not a return to the planned landing pad",
      "Emergency and normal landings use the same procedure in the skill test",
      "Emergency landing requires the checker to handle the controller",
    ],
    correct: 1,
    explanation: "Emergency landing is a distinct sequence: immediate selection of the nearest safe landing area and controlled descent. It is demonstrated separately from normal landing.",
  },
];

// ─── SKILL TEST DATA (unchanged) ──────────────────────────────────────────────
interface SkillGuide { label: string; motion: string; stick: string; note: string }
interface SkillStep { phase: string; command: string; action: string; maneuver: string; note: string }
interface QuickGuide { key: string; title: string; summary: string; lines: string[] }

const CONTROLLER_GUIDE: SkillGuide[] = [
  { label: "Ascend", motion: "Go up", stick: "Throttle up", note: "Use for vertical lift and recovery." },
  { label: "Descend", motion: "Go down", stick: "Throttle down", note: "Use for controlled altitude reduction." },
  { label: "Yaw left / right", motion: "Rotate in place", stick: "Yaw left or right", note: "Camera heading changes without horizontal travel." },
  { label: "Yaw + ascend", motion: "Rotate while climbing", stick: "Yaw + throttle up", note: "Useful for coordinated climbs." },
  { label: "Yaw + descend", motion: "Rotate while lowering", stick: "Yaw + throttle down", note: "Keep descent smooth and deliberate." },
  { label: "Pitch forward / backward", motion: "Move ahead / back", stick: "Pitch forward or back", note: "Primary straight-line travel control." },
  { label: "Roll left / right", motion: "Move sideways", stick: "Roll left or right", note: "Use for lateral correction and side steps." },
  { label: "Pitch-roll combo", motion: "Diagonal travel", stick: "Pitch + roll together", note: "For forward-right, forward-left, back-right, or back-left paths." },
];

const ACTUAL_SKILL_STEPS: SkillStep[] = [
  { phase: "Bench setup", command: "Present the aircraft in its starting state.", action: "Bring the drone to the checker with the propellers detached and the battery detached so you can show the attachment process step by step.", maneuver: "No flight movement yet.", note: "Start here so the checker can see you know the safe handling order before powering anything on." },
  { phase: "Bench setup", command: "Show how to attach the propellers.", action: "Demonstrate correct propeller placement, locking direction, and secure fit before moving to the battery.", maneuver: "Hands-on attachment only.", note: "Keep the explanation verbal while you perform it." },
  { phase: "Bench setup", command: "Show how to attach the battery.", action: "Install the battery, secure the latch, and confirm the connection is properly seated.", maneuver: "Hands-on attachment only.", note: "This is still part of the pre-flight setup on the table or on the ground." },
  { phase: "Calibration", command: "Request permission to calibrate the aircraft systems.", action: "Show the IMU calibration first, then the drone calibration, then the gimbal calibration in the same order the checker expects.", maneuver: "No flight movement yet.", note: "Speak each calibration step clearly and wait if the checker wants you to pause between them." },
  { phase: "Pre-flight", command: "Request permission to power on the aircraft.", action: "Turn on the remote controller first, then the aircraft, and complete the system check on screen.", maneuver: "Controller first, aircraft second.", note: "Verify compass or IMU status, GPS lock, RC signal, battery voltage, and home point." },
  { phase: "Takeoff", command: "Area clear. GPS locked. Home point recorded. Battery at 100 percent. Requesting permission for takeoff.", action: "Wait for checker confirmation, arm the motors, and lift off.", maneuver: "Vertical takeoff and hover at eye level.", note: "Do not begin the maneuver sequence until the aircraft is stable and the checker gives the signal." },
  { phase: "Hover and control check", command: "Hover check complete. Aircraft stable. Ready for maneuvers.", action: "Hold a steady hover and confirm normal control response before starting the sequence.", maneuver: "Small altitude corrections only.", note: "This is the handoff point before the RC drills begin." },
  { phase: "Flight maneuvers", command: "Perform the basic stick movements in sequence.", action: "Show pitch forward, pitch backward, roll left, roll right, forward-left, forward-right, backward-left, backward-right, ascend, descend, yaw right, yaw left, and the combined yaw-plus-altitude movements.", maneuver: "Basic movement set.", note: "These are the controller fundamentals the checker expects before the figures." },
  { phase: "Flight figures", command: "Perform the pattern sequence.", action: "Demonstrate the square, triangle, circle, figure of 8, and spiral in the order the checker gives.", maneuver: "Pattern flight.", note: "Keep each shape smooth and return to the original position when asked." },
  { phase: "Landing and emergency", command: "Show normal landing, then the emergency procedure and Return to Home.", action: "Land into wind when possible, then demonstrate the RTH demonstration with fingers near the pause control.", maneuver: "Normal landing and RTH.", note: "Treat emergency handling as a separate command sequence, not part of the pattern drills." },
  { phase: "Post-flight", command: "Landing complete. Stopping motors. Permission to power off the aircraft.", action: "Land gently, power off the aircraft first, then the remote controller, and finish the inspection and report.", maneuver: "No maneuver, secure shutdown.", note: "Finish with the post-flight check and a clear final report to the checker." },
];

const QUICK_GUIDES: QuickGuide[] = [
  { key: "pre-test", title: "Pre-test guide", summary: "What to have ready before the checker starts the actual skill test.", lines: ["Bring the drone with the propellers detached and the battery detached.", "Show the attachment process step by step before anything is powered on.", "Have the remote controller, aircraft, serial number, and license details ready.", "Use the original training certificate if it is required by the checker."] },
  { key: "post-test", title: "Post-test guide", summary: "What to finish after the landing and shutdown sequence.", lines: ["Power off the aircraft first, then the remote controller.", "Secure the gimbal cover, remove the battery, and check for damage or heat.", "Give the checker a short final report.", "Do not rush the post-flight check; treat it as part of the skill test."] },
  { key: "safety", title: "Safety equipment", summary: "The practical items that should stay with you during the test.", lines: ["Landing pad, cones, and a first-aid kit.", "Safety goggles if the checker expects them.", "Proper attire, usually a collared shirt.", "No shades unless you need correction glasses."] },
  { key: "battery", title: "Battery and temperature", summary: "A simple field guide for battery readiness and heat checks.", lines: ["Start with fully charged batteries and bring enough for the full test.", "At least three batteries is the safer practice when you can bring them.", "Swollen or damaged batteries should not be used.", "Warm is acceptable; hot enough to worry about handling means stop and cool it down."] },
  { key: "gps", title: "GPS guide", summary: "The quick reference for lock quality before takeoff.", lines: ["Wait for a stable GPS lock before takeoff.", "Use 10 or more satellites as the practical minimum.", "Confirm the home point is updated at your location.", "Keep compass or IMU status normal before starting flight movement."] },
  { key: "requirements", title: "Other requirements", summary: "The rest of the items that usually appear on the CAAP sheet.", lines: ["Drone body, controller, batteries, and landing pad.", "Original training certificate and identification details.", "Checker approval before each major phase.", "A clear spoken command before you move the sticks."] },
];

function getPool(tab: "situational" | "theoretical" | "practical"): Question[] {
  if (tab === "theoretical") return THEORETICAL_POOL;
  if (tab === "practical") return PRACTICAL_POOL;
  return SITUATIONAL_POOL;
}

// ─── EXAM PANEL ───────────────────────────────────────────────────────────────
function ExamPanel({ tab }: { tab: "situational" | "theoretical" | "practical" }) {
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questions = useMemo(() => {
    const pool = getPool(tab);
    const count = SESSION_SIZE[tab];
    return shuffleAndPick(pool, count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, round]);

  const score = questions.filter((q) => answers[q.id] === q.correct).length;
  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const poolSize = getPool(tab).length;

  function reset() {
    setAnswers({});
    setRound((r) => r + 1);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        {questions.map((q, index) => {
          const selected = answers[q.id];
          const revealed = selected !== undefined;
          return (
            <article key={q.id} className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45">
                  {q.category}
                </span>
                <span className="rounded-full border border-white/[0.05] bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/25">
                  {q.type === "tf" ? "True/False" : "Multiple Choice"}
                </span>
              </div>
              <h2 className="text-[14px] font-semibold leading-relaxed text-white">{q.question}</h2>
              <div className="mt-4 grid gap-2">
                {q.options.map((option, optionIndex) => {
                  const isSelected = selected === optionIndex;
                  const isCorrect = q.correct === optionIndex;
                  const color = revealed && isCorrect ? "#34d399" : revealed && isSelected ? "#f87171" : "rgba(255,255,255,0.45)";
                  return (
                    <button
                      key={option}
                      onClick={() => !revealed && setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))}
                      className="rounded-xl border px-3 py-2.5 text-left text-[12.5px] transition-colors"
                      style={{
                        background: isSelected ? `${color}18` : "rgba(255,255,255,0.03)",
                        borderColor: isSelected || (revealed && isCorrect) ? `${color}55` : "rgba(255,255,255,0.07)",
                        color: isSelected || (revealed && isCorrect) ? color : "rgba(255,255,255,0.62)",
                        cursor: revealed ? "default" : "pointer",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: selected === q.correct ? "#34d399" : "#f87171" }}>
                    {selected === q.correct ? "Correct" : "Incorrect — Review"}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/58">{q.explanation}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-5 lg:self-start">
        <div className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Exam progress</p>
          <div className="mt-4 grid grid-cols-3 gap-2 lg:grid-cols-1">
            <StatPill label="Answered" value={`${answered}/${questions.length}`} color="#06b6d4" />
            <StatPill label="Score" value={`${pct}%`} color={pct >= 75 ? "#34d399" : "#fbbf24"} />
            <StatPill label="Result" value={answered === questions.length ? (pct >= 75 ? "PASS" : "REVIEW") : "OPEN"} color={answered === questions.length && pct >= 75 ? "#34d399" : "#fbbf24"} />
          </div>
          <button
            onClick={reset}
            className="mt-4 w-full rounded-xl border border-white/[0.08] px-4 py-2.5 text-[12px] font-medium text-white/45 hover:bg-white/[0.06] hover:text-white/80 transition-colors"
          >
            New set of questions
          </button>
          <p className="mt-2 text-center text-[10px] text-white/22">
            Draws {questions.length} random from {poolSize} questions
          </p>
        </div>
        <div className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.07] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300">Passing mark</p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/55">
            CAAP written exam pass mark is 75%. Each new set pulls a different random selection from the full question bank.
          </p>
        </div>
        {tab === "practical" && (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">Practical source</p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/55">
              Based on the CAAP RPAS Skill Test Guide from the SkyPixel18 practical reviewer: pre-flight, maneuvers, RTH, post-flight, and test-day requirements.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

// ─── ACTUAL SKILL PANEL (unchanged) ───────────────────────────────────────────
function ActualSkillPanel() {
  const [openGuide, setOpenGuide] = useState<QuickGuide | null>(null);
  const grouped = ACTUAL_SKILL_STEPS.reduce<Record<string, SkillStep[]>>((acc, step) => {
    acc[step.phase] = acc[step.phase] || [];
    acc[step.phase].push(step);
    return acc;
  }, {});

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <section className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Quick guides</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/48">Open any of these for a fast reminder during the skill test.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_GUIDES.map((guide) => (
              <button key={guide.key} onClick={() => setOpenGuide(guide)} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] text-white/72 hover:bg-white/[0.07] hover:text-white">
                {guide.title}
              </button>
            ))}
          </div>
        </section>

        {openGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
            <button aria-label="Close guide" className="absolute inset-0" onClick={() => setOpenGuide(null)} />
            <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#19191b] p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">Popup guide</p>
                  <h2 className="mt-1 text-[18px] font-semibold text-white">{openGuide.title}</h2>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/48">{openGuide.summary}</p>
                </div>
                <button onClick={() => setOpenGuide(null)} className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.08]">Close</button>
              </div>
              <div className="mt-4 space-y-2">
                {openGuide.lines.map((line) => (
                  <div key={line} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] leading-relaxed text-white/66">{line}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Form header</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/48">Fill these details before the checker starts the actual skill test.</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {["Name", "Company", "Checker", "Drone", "License number", "Serial number", "Grading system: S, S-, M, B, BS"].map((field) => (
              <div key={field} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] text-white/68">{field}</div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300">Controller direction guide</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/48">Use this legend before the checker starts the sequence.</p>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/controller-guide.svg" alt="Controller direction guide for throttle, yaw, pitch, and roll" className="block h-auto w-full" />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {CONTROLLER_GUIDE.map((item) => (
                <article key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
                  <p className="text-[12px] font-semibold text-white">{item.label}</p>
                  <p className="mt-1 text-[11px] text-white/45">{item.motion}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-white/72">{item.stick}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/38">{item.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {Object.entries(grouped).map(([phase, steps]) => (
          <section key={phase} className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300/80">Field sequence</p>
                <h2 className="text-[15px] font-semibold text-white">{phase}</h2>
              </div>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45">{steps.length} step{steps.length > 1 ? "s" : ""}</span>
            </div>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <article key={`${phase}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] font-semibold text-white/75">{index + 1}</span>
                      <p className="text-[12px] font-semibold text-white">{step.command}</p>
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-[1fr_1fr]">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">What to perform</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-white/65">{step.action}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">RC maneuver</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-white/65">{step.maneuver}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/40">{step.note}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="space-y-3 lg:sticky lg:top-5 lg:self-start">
        <div className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">How to use it</p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/52">This is a live field script. The checker gives the command, you repeat the command out loud, then you perform the stick movement in sequence.</p>
          <div className="mt-4 space-y-2">
            {["Speak the command before moving.", "Hold position when the checker pauses the flow.", "Keep RTH and pause controls ready.", "Finish with landing, shutdown, and a post-flight report."].map((item) => (
              <div key={item} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] text-white/64">{item}</div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-300">Source</p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/58">Based on the CAAP RPAS practical reviewer PDF from SkyPixel18, with the field sequence separated from the written practice tabs.</p>
        </div>
      </aside>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-white/30">{label}</p>
      <p className="text-[17px] font-semibold leading-tight" style={{ color }}>{value}</p>
    </div>
  );
}

export default function PilotExamPage() {
  const [tab, setTab] = useState<ExamTab>("situational");
  const active = TABS.find((item) => item.key === tab)!;

  return (
    <div className="h-full overflow-y-auto text-white" style={{ background: "#111112", fontFamily: SYSTEM_FONT }}>
      <div className="mx-auto max-w-[1180px] px-4 py-5 md:px-7 md:py-7">
        <div className="mb-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/70">CAAP readiness</p>
          <h1 className="text-[24px] font-semibold tracking-tight text-white">Pilot Exam</h1>
          <p className="mt-1 max-w-[760px] text-[13px] leading-relaxed text-white/42">
            Each session draws a randomized set from the full question bank. Reset at any time for a new mix. Pass mark is 75%.
          </p>
        </div>

        <div className="mb-5 grid gap-2 md:grid-cols-4">
          {TABS.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className="rounded-2xl border p-4 text-left transition-all"
              style={{
                background: tab === item.key ? "rgba(168,139,250,0.14)" : "rgba(255,255,255,0.035)",
                borderColor: tab === item.key ? "rgba(168,139,250,0.35)" : "rgba(255,255,255,0.07)",
              }}
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-[17px]">{item.icon}</div>
              <p className="text-[14px] font-semibold text-white">{item.label}</p>
              <p className="mt-1 text-[12px] leading-snug text-white/38">{item.desc}</p>
            </button>
          ))}
        </div>

        <div className="mb-4 rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">{active.label} exam</p>
              <p className="mt-1 text-[13px] text-white/55">{active.desc}</p>
            </div>
            {tab !== "actual" && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.04] px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
                <span className="text-[11px] text-white/35">
                  {SESSION_SIZE[tab as "situational" | "theoretical" | "practical"]} of {tab === "situational" ? SITUATIONAL_POOL.length : tab === "theoretical" ? THEORETICAL_POOL.length : PRACTICAL_POOL.length} questions per session
                </span>
              </div>
            )}
          </div>
        </div>

        {tab === "actual"
          ? <ActualSkillPanel />
          : <ExamPanel key={tab} tab={tab as "situational" | "theoretical" | "practical"} />
        }
      </div>
    </div>
  );
}
