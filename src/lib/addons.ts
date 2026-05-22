export interface Addon {
  id:    string;
  label: string;
  desc:  string;
  icon:  string;
  price: number;
}

export interface PilotPlan {
  id: "starter" | "pro" | "studio";
  label: string;
  price: number;
  audience: string;
  desc: string;
  badge: string;
  features: string[];
}

export const FREE_PILOT_FEATURES = [
  "Create a pilot learning profile",
  "Preview below-7kg CAAP review notes",
  "Use starter checklist prompts",
  "Record basic study and flight remarks",
];

export const PILOT_PLANS: PilotPlan[] = [
  {
    id: "starter",
    label: "Starter",
    price: 80,
    audience: "Aspiring pilots",
    desc: "For learners preparing for below-7kg certificate work.",
    badge: "Learning",
    features: [
      "Below-7kg study roadmap",
      "Situational and theoretical exam prep",
      "Starter checklist and flight log previews",
      "Access to pilot learning updates",
    ],
  },
  {
    id: "pro",
    label: "Pilot Review",
    price: 110,
    audience: "Licensed pilots",
    desc: "For licensed pilots revisiting policies before flying.",
    badge: "Refresher",
    features: [
      "Policy refresher mode",
      "Smart checklist and logbook access",
      "Flight remarks and recurring review prompts",
      "Below-7kg and Large RPA labels",
    ],
  },
  {
    id: "studio",
    label: "Ops Logbook",
    price: 250,
    audience: "Frequent flyers",
    desc: "For pilots who want deeper logging and operating discipline.",
    badge: "Full review",
    features: [
      "Everything in Pilot Review",
      "Expanded flight logbook tools",
      "Practical skill-test review templates",
      "Equipment, battery, and maintenance notes",
    ],
  },
];

export const ADDONS: Addon[] = [
  { id: "missions",  label: "Mission Planner",    desc: "Plan waypoint missions and flight paths",       icon: "◇", price: 20 },
  { id: "flights",   label: "Flight Logbook",     desc: "Log, track and export your flight records",    icon: "✈", price: 20 },
  { id: "studio",    label: "Policy Review",      desc: "Focused review cards for PCAR and CAAP notes", icon: "◈", price: 20 },
  { id: "calendar",  label: "Training Calendar",  desc: "Schedule review blocks and practical practice", icon: "▥", price: 20 },
  { id: "documents", label: "Document Vault",     desc: "Track certificate, drone specs, and photos",    icon: "≡", price: 20 },
  { id: "leads",     label: "Study Tracker",      desc: "Track weak topics and review progress",         icon: "⌕", price: 20 },
  { id: "surveys",   label: "Mapping Notes",      desc: "Keep survey and mapping operating reminders",   icon: "▣", price: 20 },
  { id: "projects",  label: "Practical Prep",     desc: "Organize maneuvers, RTH, and skill-test notes", icon: "▦", price: 20 },
];

export const BASE_PRICE = 80;

export function calcTotal(selectedAddons: string[]): number {
  return BASE_PRICE + selectedAddons.reduce((sum, id) => {
    const addon = ADDONS.find(a => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);
}
