export type ContactStatus = "lead" | "active" | "past";

export interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tags: string[] | null;
  status: ContactStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactWithStats extends Contact {
  project_count: number;
  message_count: number;
  unread_count: number;
  total_revenue: number;
  last_activity: string | null;
}

export type ProjectStatus = "lead" | "booked" | "shooting" | "editing" | "delivered" | "cancelled";

export interface Project {
  id: string;
  contact_id: string;
  title: string;
  service_type: string | null;
  status: ProjectStatus;
  shoot_date: string | null;
  deadline: string | null;
  amount: number | null;
  location: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const CONTACT_STATUSES: { key: ContactStatus; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "text-amber-400" },
  { key: "active", label: "Active", color: "text-green-400" },
  { key: "past", label: "Past", color: "text-white/50" },
];

export const PROJECT_STATUSES: { key: ProjectStatus; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "text-amber-400" },
  { key: "booked", label: "Booked", color: "text-cyan-400" },
  { key: "shooting", label: "Shooting", color: "text-blue-400" },
  { key: "editing", label: "Editing", color: "text-violet-400" },
  { key: "delivered", label: "Delivered", color: "text-green-400" },
  { key: "cancelled", label: "Cancelled", color: "text-white/40" },
];

export const SERVICE_TYPES = [
  { key: "social", label: "Social Media" },
  { key: "real-estate", label: "Real Estate" },
  { key: "event", label: "Wedding / Event" },
  { key: "construction", label: "Construction" },
  { key: "travel", label: "Travel / Tourism" },
  { key: "commercial", label: "Commercial" },
  { key: "other", label: "Other" },
];

export function serviceLabel(key: string | null | undefined): string {
  if (!key) return "—";
  return SERVICE_TYPES.find((s) => s.key === key)?.label || key;
}

export function projectStatusMeta(key: string): { label: string; color: string } {
  return PROJECT_STATUSES.find((s) => s.key === key) || { label: key, color: "text-white/50" };
}

export function contactStatusMeta(key: string): { label: string; color: string } {
  return CONTACT_STATUSES.find((s) => s.key === key) || { label: key, color: "text-white/50" };
}
