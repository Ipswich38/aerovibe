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
  { key: "practical", label: "Practical", icon: "✈", desc: "CAAP skill test guide from SkyPixel18 reviewer" },
  { key: "actual", label: "Actual Skill Test", icon: "↯", desc: "CAAP field sequence, controller movement, and maneuvers" },
];

interface SkillGuide {
  label: string;
  motion: string;
  stick: string;
  note: string;
}

interface SkillStep {
  phase: string;
  command: string;
  action: string;
  maneuver: string;
  note: string;
}

interface QuickGuide {
  key: string;
  title: string;
  summary: string;
  lines: string[];
}

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
  {
    phase: "Bench setup",
    command: "Present the aircraft in its starting state.",
    action: "Bring the drone to the checker with the propellers detached and the battery detached so you can show the attachment process step by step.",
    maneuver: "No flight movement yet.",
    note: "Start here so the checker can see you know the safe handling order before powering anything on.",
  },
  {
    phase: "Bench setup",
    command: "Show how to attach the propellers.",
    action: "Demonstrate correct propeller placement, locking direction, and secure fit before moving to the battery.",
    maneuver: "Hands-on attachment only.",
    note: "Keep the explanation verbal while you perform it.",
  },
  {
    phase: "Bench setup",
    command: "Show how to attach the battery.",
    action: "Install the battery, secure the latch, and confirm the connection is properly seated.",
    maneuver: "Hands-on attachment only.",
    note: "This is still part of the pre-flight setup on the table or on the ground.",
  },
  {
    phase: "Calibration",
    command: "Request permission to calibrate the aircraft systems.",
    action: "Show the IMU calibration first, then the drone calibration, then the gimbal calibration in the same order the checker expects.",
    maneuver: "No flight movement yet.",
    note: "Speak each calibration step clearly and wait if the checker wants you to pause between them.",
  },
  {
    phase: "Pre-flight",
    command: "Request permission to power on the aircraft.",
    action: "Turn on the remote controller first, then the aircraft, and complete the system check on screen.",
    maneuver: "Controller first, aircraft second.",
    note: "Verify compass or IMU status, GPS lock, RC signal, battery voltage, and home point.",
  },
  {
    phase: "Takeoff",
    command: "Area clear. GPS locked. Home point recorded. Battery at 100 percent. Requesting permission for takeoff.",
    action: "Wait for checker confirmation, arm the motors, and lift off.",
    maneuver: "Vertical takeoff and hover at eye level.",
    note: "Do not begin the maneuver sequence until the aircraft is stable and the checker gives the signal.",
  },
  {
    phase: "Hover and control check",
    command: "Hover check complete. Aircraft stable. Ready for maneuvers.",
    action: "Hold a steady hover and confirm normal control response before starting the sequence.",
    maneuver: "Small altitude corrections only.",
    note: "This is the handoff point before the RC drills begin.",
  },
  {
    phase: "Flight maneuvers",
    command: "Perform the basic stick movements in sequence.",
    action: "Show pitch forward, pitch backward, roll left, roll right, forward-left, forward-right, backward-left, backward-right, ascend, descend, yaw right, yaw left, and the combined yaw-plus-altitude movements.",
    maneuver: "Basic movement set.",
    note: "These are the controller fundamentals the checker expects before the figures.",
  },
  {
    phase: "Flight figures",
    command: "Perform the pattern sequence.",
    action: "Demonstrate the square, triangle, circle, figure of 8, and spiral in the order the checker gives.",
    maneuver: "Pattern flight.",
    note: "Keep each shape smooth and return to the original position when asked.",
  },
  {
    phase: "Landing and emergency",
    command: "Show normal landing, then the emergency procedure and Return to Home.",
    action: "Land into wind when possible, then demonstrate the RTH demonstration with fingers near the pause control.",
    maneuver: "Normal landing and RTH.",
    note: "Treat emergency handling as a separate command sequence, not part of the pattern drills.",
  },
  {
    phase: "Post-flight",
    command: "Landing complete. Stopping motors. Permission to power off the aircraft.",
    action: "Land gently, power off the aircraft first, then the remote controller, and finish the inspection and report.",
    maneuver: "No maneuver, secure shutdown.",
    note: "Finish with the post-flight check and a clear final report to the checker.",
  },
];

const QUICK_GUIDES: QuickGuide[] = [
  {
    key: "pre-test",
    title: "Pre-test guide",
    summary: "What to have ready before the checker starts the actual skill test.",
    lines: [
      "Bring the drone with the propellers detached and the battery detached.",
      "Show the attachment process step by step before anything is powered on.",
      "Have the remote controller, aircraft, serial number, and license details ready.",
      "Use the original training certificate if it is required by the checker.",
    ],
  },
  {
    key: "post-test",
    title: "Post-test guide",
    summary: "What to finish after the landing and shutdown sequence.",
    lines: [
      "Power off the aircraft first, then the remote controller.",
      "Secure the gimbal cover, remove the battery, and check for damage or heat.",
      "Give the checker a short final report.",
      "Do not rush the post-flight check; treat it as part of the skill test.",
    ],
  },
  {
    key: "safety",
    title: "Safety equipment",
    summary: "The practical items that should stay with you during the test.",
    lines: [
      "Landing pad, cones, and a first-aid kit.",
      "Safety goggles if the checker expects them.",
      "Proper attire, usually a collared shirt.",
      "No shades unless you need correction glasses.",
    ],
  },
  {
    key: "battery",
    title: "Battery and temperature",
    summary: "A simple field guide for battery readiness and heat checks.",
    lines: [
      "Start with fully charged batteries and bring enough for the full test.",
      "At least three batteries is the safer practice when you can bring them.",
      "Swollen or damaged batteries should not be used.",
      "Warm is acceptable; hot enough to worry about handling means stop and cool it down.",
    ],
  },
  {
    key: "gps",
    title: "GPS guide",
    summary: "The quick reference for lock quality before takeoff.",
    lines: [
      "Wait for a stable GPS lock before takeoff.",
      "Use 10 or more satellites as the practical minimum.",
      "Confirm the home point is updated at your location.",
      "Keep compass or IMU status normal before starting flight movement.",
    ],
  },
  {
    key: "requirements",
    title: "Other requirements",
    summary: "The rest of the items that usually appear on the CAAP sheet.",
    lines: [
      "Drone body, controller, batteries, and landing pad.",
      "Original training certificate and identification details.",
      "Checker approval before each major phase.",
      "A clear spoken command before you move the sticks.",
    ],
  },
];

const SITUATIONAL_QUESTIONS: Question[] = [
  {
    id: "sit-1",
    type: "mc",
    category: "Manned Aircraft",
    question: "During a commercial shoot at 350 ft AGL, a light aircraft enters your area at low altitude and approaches your drone. What is the correct immediate action?",
    options: [
      "Maintain position because you are below 400 ft",
      "Ascend to 400 ft so the aircraft can see the drone",
      "Give way immediately by descending or moving away from the aircraft path",
      "Hover and wait for the aircraft to pass",
    ],
    correct: 2,
    explanation: "RPAS must give way to manned aircraft at all times. Altitude limits do not remove that duty.",
  },
  {
    id: "sit-2",
    type: "mc",
    category: "Night Operations",
    question: "A client asks for a night shoot far from any airport. You have standard certificates but no special permit. What applies?",
    options: [
      "Proceed if you maintain VLOS",
      "Proceed if the drone has lights",
      "Do not fly; night operations need CAAP special authorization",
      "Proceed below 120 m AGL",
    ],
    correct: 2,
    explanation: "Night operations require a special authorization or permit regardless of airport distance.",
  },
  {
    id: "sit-3",
    type: "mc",
    category: "Battery Emergency",
    question: "Mid-shoot your battery drops unexpectedly to 15% while the drone is 200 m away. What should you do?",
    options: [
      "Finish the remaining shot quickly",
      "Initiate return or controlled landing immediately",
      "Hover to preserve battery",
      "Climb for better signal before returning",
    ],
    correct: 1,
    explanation: "At critically low battery, safety and recovery take priority over mission completion.",
  },
  {
    id: "sit-4",
    type: "mc",
    category: "Crowd Safety",
    question: "You are descending to land when a child runs into the marked landing zone directly below the drone. What is the safest response?",
    options: [
      "Continue landing because the drone is already low",
      "Yell for the child to move while landing",
      "Abort landing, climb to a safe hover, and wait until the zone is clear",
      "Land on the closest uneven surface immediately",
    ],
    correct: 2,
    explanation: "Never land with a person in the landing zone. Abort, stabilize, and reattempt only when clear.",
  },
  {
    id: "sit-5",
    type: "mc",
    category: "ATTI Mode",
    question: "The drone loses GPS and switches to ATTI mode. What changes for the pilot?",
    options: [
      "It still holds GPS position from the last coordinate",
      "It maintains altitude but can drift horizontally and needs manual correction",
      "It returns home automatically without GPS",
      "It becomes safer because obstacle avoidance takes over",
    ],
    correct: 1,
    explanation: "ATTI mode has no GPS position hold. The pilot must actively counter drift.",
  },
  {
    id: "sit-6",
    type: "mc",
    category: "Obstacle Avoidance",
    question: "On a waypoint mission you see an unmarked power line ahead that may not be detected by sensors. What should you do?",
    options: [
      "Let obstacle avoidance handle it",
      "Activate RTH",
      "Immediately take manual control and avoid the obstacle",
      "Increase speed to pass before signal drops",
    ],
    correct: 2,
    explanation: "Thin wires may not be detected. Visual observation and manual intervention override automation.",
  },
  {
    id: "sit-7",
    type: "tf",
    category: "Fatigue",
    question: "Pilot fatigue can reduce reaction time and judgment enough to justify postponing a flight.",
    options: ["True", "False"],
    correct: 0,
    explanation: "Fatigue is a human factors hazard. A fatigued remote pilot should not continue safety-critical flight operations.",
  },
  {
    id: "sit-8",
    type: "tf",
    category: "Compass",
    question: "A compass calibration warning may be ignored if the flight area appears open and clear.",
    options: ["True", "False"],
    correct: 1,
    explanation: "Compass warnings must be resolved before flight. Bad heading data can cause unstable behavior or flyaway.",
  },
];

const THEORETICAL_QUESTIONS: Question[] = [
  {
    id: "theory-1",
    type: "mc",
    category: "Part 1",
    question: "Under PCAR terminology, a drone used for aviation activity is classified as what?",
    options: ["A toy aircraft", "A remotely piloted aircraft / RPAS", "A telecommunications device", "A ground camera platform"],
    correct: 1,
    explanation: "PCAR treats RPAS as aviation systems with applicable aircraft and operating rules.",
  },
  {
    id: "theory-2",
    type: "mc",
    category: "Part 2",
    question: "For commercial RPAS operations, which pilot authorization is generally required?",
    options: ["No license for sub-250 g aircraft", "Remote Pilot License / RPA Controller Certificate", "Driver's license", "Barangay clearance only"],
    correct: 1,
    explanation: "Commercial operations require pilot competency authorization regardless of small-drone weight exemptions.",
  },
  {
    id: "theory-3",
    type: "mc",
    category: "Part 4",
    question: "What registration marking prefix is used for civil RPAs in the Philippines?",
    options: ["RP-U", "RP-C", "PH-RPAS", "CAAP-UAV"],
    correct: 0,
    explanation: "Civil RPA registration marks use RP-U followed by assigned characters.",
  },
  {
    id: "theory-4",
    type: "mc",
    category: "Part 11",
    question: "Which operating condition normally requires special authorization?",
    options: ["VLOS below 400 ft in a clear area", "Flying over populated areas", "Hover check at eye level", "Flying outside airport zones recreationally"],
    correct: 1,
    explanation: "Operations over populated areas are outside standard low-risk conditions and require CAAP authorization.",
  },
  {
    id: "theory-5",
    type: "mc",
    category: "Airport Zones",
    question: "What is the standard airport distance rule commonly used in the ops reference?",
    options: ["No flights within 1 km", "No flights within 3 km", "Special authorization within 10 km of an aerodrome reference point", "Only notify the client"],
    correct: 2,
    explanation: "The ops regulations reference flags operations within 10 km of an airport/aerodrome as requiring authorization.",
  },
  {
    id: "theory-6",
    type: "mc",
    category: "Operational Limits",
    question: "What is the common maximum standard RPAS operating altitude used in the reference?",
    options: ["100 ft AGL", "400 ft AGL / about 120 m", "1,000 ft AGL", "Unlimited below clouds"],
    correct: 1,
    explanation: "The standard limit is 400 ft AGL, approximately 120 m.",
  },
  {
    id: "theory-7",
    type: "tf",
    category: "Commercial Ops",
    question: "A sub-250 g drone automatically removes all commercial certification requirements.",
    options: ["True", "False"],
    correct: 1,
    explanation: "Low weight can affect registration treatment, but commercial operation still triggers certification and operator requirements.",
  },
  {
    id: "theory-8",
    type: "tf",
    category: "Records",
    question: "An RPAS operator should keep operational, pilot, maintenance, and authorization records available for inspection.",
    options: ["True", "False"],
    correct: 0,
    explanation: "Recordkeeping and document availability are core operator responsibilities.",
  },
];

const PRACTICAL_QUESTIONS: Question[] = [
  {
    id: "prac-1",
    type: "mc",
    category: "Pre-flight Walkaround",
    question: "During the CAAP skill test walkaround, what should you do as you inspect each aircraft component?",
    options: [
      "Inspect silently to save time",
      "Voice out the part being inspected and declare if it is in good condition",
      "Only inspect the propellers",
      "Ask the checker to inspect the drone for you",
    ],
    correct: 1,
    explanation: "The SkyPixel18 skill test guide says to inspect in logical order, voice out the part, and declare condition.",
  },
  {
    id: "prac-2",
    type: "mc",
    category: "Power Sequence",
    question: "What is the correct startup sequence in the practical guide?",
    options: [
      "Aircraft first, then remote controller",
      "Remote controller first, request permission, then aircraft",
      "Phone first, aircraft second, controller last",
      "Aircraft and controller at the same time",
    ],
    correct: 1,
    explanation: "The guide lists remote controller first, verbal permission to power aircraft, then aircraft power-on.",
  },
  {
    id: "prac-3",
    type: "mc",
    category: "System Check",
    question: "Before takeoff, which screen data should be confirmed?",
    options: [
      "Only camera resolution",
      "Compass/IMU normal, GPS lock, RC signal, battery voltage, and home point",
      "Only memory card size",
      "Only map style",
    ],
    correct: 1,
    explanation: "The practical reviewer lists compass/IMU, GPS, RC signal, battery voltage, and home point verification.",
  },
  {
    id: "prac-4",
    type: "mc",
    category: "Takeoff",
    question: "After arming and takeoff, what should the pilot do before maneuvers?",
    options: [
      "Immediately begin the square pattern",
      "Hover at eye level and check aircraft stability",
      "Climb to maximum altitude",
      "Activate RTH",
    ],
    correct: 1,
    explanation: "The guide requires an eye-level hover check and verbal confirmation that the aircraft is stable.",
  },
  {
    id: "prac-5",
    type: "mc",
    category: "Square Pattern",
    question: "In a tail-in square pattern, what is the repeated action sequence?",
    options: [
      "Fly backward, stop, yaw left 45 degrees",
      "Push pitch forward, stop, yaw right 90 degrees",
      "Roll right continuously",
      "Ascend and descend only",
    ],
    correct: 1,
    explanation: "The tail-in square uses forward legs with a stop and right yaw 90 degrees at each corner.",
  },
  {
    id: "prac-6",
    type: "mc",
    category: "Nose-in Control",
    question: "What key warning applies to nose-in maneuvers?",
    options: [
      "Controls are reversed",
      "GPS turns off",
      "Throttle is disabled",
      "Yaw cannot be used",
    ],
    correct: 0,
    explanation: "The guide explicitly notes controls are reversed when the drone is nose-in.",
  },
  {
    id: "prac-7",
    type: "mc",
    category: "RTH Demo",
    question: "During the RTH feature demonstration, what critical safety habit is required?",
    options: [
      "Hands off the controller until landing",
      "Keep fingers near the pause button and intervene if needed",
      "Walk away from the landing area",
      "Disable the home point",
    ],
    correct: 1,
    explanation: "The practical guide says to keep fingers near pause and stop RTH if the aircraft drifts or enters a critical situation.",
  },
  {
    id: "prac-8",
    type: "mc",
    category: "Post-flight",
    question: "What is the correct power-down order after landing?",
    options: [
      "Controller first, aircraft second",
      "Aircraft first, remote controller second",
      "Phone first, then SD card",
      "Any order is acceptable",
    ],
    correct: 1,
    explanation: "The reviewer says power off the aircraft first, then the remote controller.",
  },
  {
    id: "prac-9",
    type: "mc",
    category: "What to Bring",
    question: "Which item is specifically listed as required to bring for the skill test?",
    options: ["Original Training Certificate", "Sunglasses", "External monitor", "Laptop"],
    correct: 0,
    explanation: "The guide lists the original training certificate. It also notes proper attire and no shades.",
  },
  {
    id: "prac-10",
    type: "tf",
    category: "Skill Test Attire",
    question: "The practical reviewer says to wear proper attire, including a collared shirt.",
    options: ["True", "False"],
    correct: 0,
    explanation: "The reviewer explicitly says: wear proper attire, collared shirt.",
  },
];

function getQuestions(tab: ExamTab) {
  if (tab === "theoretical") return THEORETICAL_QUESTIONS;
  if (tab === "practical") return PRACTICAL_QUESTIONS;
  return SITUATIONAL_QUESTIONS;
}

function ExamPanel({ tab }: { tab: ExamTab }) {
  const questions = useMemo(() => getQuestions(tab), [tab]);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const score = questions.filter((q) => answers[q.id] === q.correct).length;
  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  function reset() {
    setAnswers({});
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
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }))}
                      className="rounded-xl border px-3 py-2.5 text-left text-[12.5px] transition-colors"
                      style={{
                        background: isSelected ? `${color}18` : "rgba(255,255,255,0.03)",
                        borderColor: isSelected || (revealed && isCorrect) ? `${color}55` : "rgba(255,255,255,0.07)",
                        color: isSelected || (revealed && isCorrect) ? color : "rgba(255,255,255,0.62)",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              {revealed && (
                <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.035] p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/30">
                    {selected === q.correct ? "Correct" : "Review"}
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
            className="mt-4 w-full rounded-xl border border-white/[0.08] px-4 py-2 text-[12px] text-white/45 hover:bg-white/[0.04] hover:text-white/75"
          >
            Reset answers
          </button>
        </div>
        {tab === "practical" && (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-300">Practical source</p>
            <p className="mt-2 text-[12px] leading-relaxed text-white/55">
              Based on the CAAP RPAS Skill Test Guide from the SkyPixel18 practical reviewer PDF: pre-flight, stick maneuvers, RTH, post-flight, and test-day items.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

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
          <p className="mt-1 text-[12px] leading-relaxed text-white/48">
            Open any of these if you need a fast reminder during the skill test. They stay on this page so you do not have to jump to another section.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_GUIDES.map((guide) => (
              <button
                key={guide.key}
                onClick={() => setOpenGuide(guide)}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-[12px] text-white/72 hover:bg-white/[0.07] hover:text-white"
              >
                {guide.title}
              </button>
            ))}
          </div>
        </section>

        {openGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
            <button
              aria-label="Close guide"
              className="absolute inset-0"
              onClick={() => setOpenGuide(null)}
            />
            <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/[0.08] bg-[#19191b] p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300/80">Popup guide</p>
                  <h2 className="mt-1 text-[18px] font-semibold text-white">{openGuide.title}</h2>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/48">{openGuide.summary}</p>
                </div>
                <button
                  onClick={() => setOpenGuide(null)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70 hover:bg-white/[0.08]"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {openGuide.lines.map((line) => (
                  <div key={line} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] leading-relaxed text-white/66">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">Form header</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/48">
            Fill these details before the checker starts the actual skill test.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Name",
              "Company",
              "Checker",
              "Drone",
              "License number",
              "Serial number",
              "Grading system: S, S-, M, B, BS",
            ].map((field) => (
              <div key={field} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] text-white/68">
                {field}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.07] bg-[#1c1c1e] p-4 md:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-violet-300">Controller direction guide</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/48">
            Use this legend before the checker starts the sequence. The point is to know which stick motion matches each command.
          </p>
          <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/controller-guide.svg"
                alt="Controller direction guide for throttle, yaw, pitch, and roll"
                className="block h-auto w-full"
              />
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
              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/45">
                {steps.length} step{steps.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <article key={`${phase}-${index}`} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.06] text-[11px] font-semibold text-white/75">
                        {index + 1}
                      </span>
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
          <p className="mt-2 text-[12px] leading-relaxed text-white/52">
            This is a live field script. The checker gives the command, you repeat the command out loud, then you perform the stick movement in sequence.
          </p>
          <div className="mt-4 space-y-2">
            {[
              "Speak the command before moving.",
              "Hold position when the checker pauses the flow.",
              "Keep RTH and pause controls ready.",
              "Finish with landing, shutdown, and a post-flight report.",
            ].map((item) => (
              <div key={item} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[12px] text-white/64">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-300">Source</p>
          <p className="mt-2 text-[12px] leading-relaxed text-white/58">
            Based on the CAAP RPAS practical reviewer PDF from SkyPixel18, with the field sequence separated from the written practice tabs.
          </p>
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
            Separate the written practice from the live field skill test: judgment, PCAR theory, practical reviewer, and the actual controller sequence.
          </p>
        </div>

        <div className="mb-5 grid gap-2 md:grid-cols-3">
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30">{active.label} exam</p>
          <p className="mt-1 text-[13px] text-white/55">{active.desc}</p>
        </div>

        {tab === "actual" ? <ActualSkillPanel /> : <ExamPanel key={tab} tab={tab} />}
      </div>
    </div>
  );
}
