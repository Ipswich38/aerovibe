export type DroneStatus = "active" | "maintenance" | "retired";

export interface Drone {
  id: string;
  name: string;
  model: string | null;
  serial_number: string | null;
  caap_registration: string | null;
  purchased_at: string | null;
  status: DroneStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type FlightPurpose = "training" | "commercial" | "test" | "recreational" | "other";

export interface FlightLog {
  id: string;
  date: string;
  pilot_name: string;
  drone_id: string | null;
  drone_name: string | null;
  location: string;
  takeoff_time: string | null;
  landing_time: string | null;
  duration_minutes: number | null;
  purpose: FlightPurpose;
  weather: string | null;
  incidents: string | null;
  project_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const FLIGHT_PURPOSES: { key: FlightPurpose; label: string }[] = [
  { key: "training", label: "Training" },
  { key: "commercial", label: "Commercial" },
  { key: "test", label: "Test" },
  { key: "recreational", label: "Recreational" },
  { key: "other", label: "Other" },
];

export const DRONE_STATUSES: { key: DroneStatus; label: string; color: string }[] = [
  { key: "active", label: "Active", color: "text-green-400" },
  { key: "maintenance", label: "Maintenance", color: "text-amber-400" },
  { key: "retired", label: "Retired", color: "text-white/40" },
];

export function minutesBetween(takeoff: string | null, landing: string | null): number | null {
  if (!takeoff || !landing) return null;
  const [th, tm] = takeoff.split(":").map(Number);
  const [lh, lm] = landing.split(":").map(Number);
  let diff = lh * 60 + lm - (th * 60 + tm);
  if (diff < 0) diff += 24 * 60; // overnight safety
  return diff;
}

export function formatDuration(minutes: number | null): string {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
