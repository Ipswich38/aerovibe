export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "dismissed";

export interface Lead {
  id: string;
  name: string;
  industry: string;
  location: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  rating_count: number | null;
  google_place_id: string | null;
  source: string;
  status: LeadStatus;
  notes: string | null;
  converted_contact_id: string | null;
  created_at: string;
  updated_at: string;
}

export const LEAD_STATUSES: { key: LeadStatus; label: string; color: string }[] = [
  { key: "new", label: "New", color: "text-cyan-400" },
  { key: "contacted", label: "Contacted", color: "text-blue-400" },
  { key: "qualified", label: "Qualified", color: "text-amber-400" },
  { key: "converted", label: "Converted", color: "text-green-400" },
  { key: "dismissed", label: "Dismissed", color: "text-white/30" },
];

export function leadStatusMeta(key: string): { label: string; color: string } {
  return LEAD_STATUSES.find((s) => s.key === key) || { label: key, color: "text-white/50" };
}

// Industry suggestions — high-value drone prospects in the PH.
export const INDUSTRY_SUGGESTIONS = [
  { key: "resorts", label: "Resorts & beach resorts", query: "resort" },
  { key: "hotels", label: "Hotels", query: "hotel" },
  { key: "construction", label: "Construction companies", query: "construction company" },
  { key: "real_estate", label: "Real estate developers", query: "real estate developer" },
  { key: "wedding_venues", label: "Wedding venues", query: "wedding venue" },
  { key: "event_venues", label: "Event venues", query: "event venue" },
  { key: "restaurants", label: "Restaurants (mid-upper)", query: "restaurant" },
  { key: "beach_clubs", label: "Beach clubs", query: "beach club" },
  { key: "golf_courses", label: "Golf courses", query: "golf course" },
  { key: "architecture", label: "Architecture firms", query: "architecture firm" },
  { key: "engineering", label: "Engineering firms", query: "engineering firm" },
  { key: "farms", label: "Farms & agriculture", query: "farm" },
  { key: "universities", label: "Universities / schools", query: "university" },
  { key: "hospitals", label: "Hospitals", query: "hospital" },
  { key: "malls", label: "Malls & shopping centers", query: "shopping mall" },
  { key: "car_dealers", label: "Car dealerships", query: "car dealership" },
];

export interface SearchResult {
  name: string;
  industry: string;
  location: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number | null;
  rating_count: number | null;
  google_place_id: string;
}
