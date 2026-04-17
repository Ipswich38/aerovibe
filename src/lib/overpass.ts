// Free leads discovery via OpenStreetMap Overpass API.
// No API key, no cost. Lower coverage than Google Places for phone/email,
// but solid for POIs that care about being on the map (hotels, resorts, venues).

export interface PhLocation {
  key: string;
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export const PH_LOCATIONS: PhLocation[] = [
  { key: "metro_manila", label: "Metro Manila", lat: 14.5995, lng: 120.9842, radiusKm: 22 },
  { key: "baguio", label: "Baguio", lat: 16.4023, lng: 120.596, radiusKm: 12 },
  { key: "tagaytay", label: "Tagaytay", lat: 14.1153, lng: 120.9621, radiusKm: 12 },
  { key: "batangas", label: "Batangas", lat: 13.7565, lng: 121.0583, radiusKm: 25 },
  { key: "cavite", label: "Cavite", lat: 14.4793, lng: 120.897, radiusKm: 18 },
  { key: "cebu", label: "Cebu", lat: 10.3157, lng: 123.8854, radiusKm: 22 },
  { key: "davao", label: "Davao", lat: 7.1907, lng: 125.4553, radiusKm: 22 },
  { key: "palawan", label: "Palawan", lat: 9.7392, lng: 118.7353, radiusKm: 30 },
  { key: "boracay", label: "Boracay", lat: 11.9674, lng: 121.9248, radiusKm: 8 },
  { key: "siargao", label: "Siargao", lat: 9.8432, lng: 126.0458, radiusKm: 18 },
  { key: "bohol", label: "Bohol", lat: 9.8458, lng: 124.1436, radiusKm: 30 },
  { key: "iloilo", label: "Iloilo", lat: 10.7202, lng: 122.5621, radiusKm: 18 },
  { key: "la_union", label: "La Union", lat: 16.6156, lng: 120.3211, radiusKm: 18 },
  { key: "pampanga", label: "Pampanga", lat: 15.0794, lng: 120.62, radiusKm: 18 },
  { key: "laguna", label: "Laguna", lat: 14.1775, lng: 121.2101, radiusKm: 22 },
  { key: "rizal", label: "Rizal", lat: 14.6037, lng: 121.3085, radiusKm: 18 },
];

// PH country bounding box for nationwide searches.
// Overpass accepts [s,w,n,e].
export const PH_BBOX = { s: 4.5, w: 116.9, n: 21.1, e: 126.7 };

export interface OsmTagFilter {
  key: string;
  value?: string; // omit for "any value"
  regex?: boolean;
}

export const INDUSTRY_OSM_TAGS: Record<string, OsmTagFilter[]> = {
  resorts: [
    { key: "tourism", value: "hotel" },
    { key: "leisure", value: "resort" },
    { key: "tourism", value: "guest_house" },
  ],
  hotels: [{ key: "tourism", value: "hotel" }],
  construction: [
    { key: "office", value: "construction_company" },
    { key: "shop", value: "doityourself" },
    { key: "craft", value: "builder" },
  ],
  real_estate: [{ key: "office", value: "estate_agent" }],
  wedding_venues: [
    { key: "amenity", value: "events_venue" },
    { key: "amenity", value: "conference_centre" },
  ],
  event_venues: [
    { key: "amenity", value: "events_venue" },
    { key: "amenity", value: "community_centre" },
    { key: "amenity", value: "conference_centre" },
  ],
  restaurants: [{ key: "amenity", value: "restaurant" }],
  beach_clubs: [
    { key: "leisure", value: "beach_resort" },
    { key: "leisure", value: "resort" },
  ],
  golf_courses: [
    { key: "leisure", value: "golf_course" },
    { key: "sport", value: "golf" },
  ],
  architecture: [{ key: "office", value: "architect" }],
  engineering: [{ key: "office", value: "engineer" }],
  farms: [
    { key: "landuse", value: "farmyard" },
    { key: "place", value: "farm" },
  ],
  universities: [
    { key: "amenity", value: "university" },
    { key: "amenity", value: "college" },
  ],
  hospitals: [{ key: "amenity", value: "hospital" }],
  malls: [{ key: "shop", value: "mall" }],
  car_dealers: [{ key: "shop", value: "car" }],
};

// Build an Overpass QL query. Uses `around:` radius filter when city given,
// or PH bounding box when nationwide. Returns nodes, ways, and relations.
export function buildOverpassQuery(
  filters: OsmTagFilter[],
  location: { lat: number; lng: number; radiusKm: number } | null,
  limit = 120,
): string {
  const scope = location
    ? `(around:${Math.round(location.radiusKm * 1000)},${location.lat},${location.lng})`
    : `(${PH_BBOX.s},${PH_BBOX.w},${PH_BBOX.n},${PH_BBOX.e})`;

  const clauses = filters
    .map((f) => {
      if (!f.value) return `nwr["${f.key}"]${scope};`;
      const op = f.regex ? "~" : "=";
      return `nwr["${f.key}"${op}"${f.value}"]${scope};`;
    })
    .join("\n  ");

  return `[out:json][timeout:45];\n(\n  ${clauses}\n);\nout center tags ${limit};`;
}

export interface OverpassTags {
  name?: string;
  "name:en"?: string;
  phone?: string;
  "contact:phone"?: string;
  "contact:mobile"?: string;
  email?: string;
  "contact:email"?: string;
  website?: string;
  "contact:website"?: string;
  url?: string;
  "addr:street"?: string;
  "addr:housenumber"?: string;
  "addr:city"?: string;
  "addr:province"?: string;
  "addr:postcode"?: string;
  [k: string]: string | undefined;
}

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OverpassTags;
}

export interface OverpassResponse {
  elements: OverpassElement[];
  remark?: string;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];

// Query Overpass with simple mirror fallback.
export async function fetchOverpass(query: string): Promise<OverpassResponse> {
  let lastErr: unknown = null;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(50000),
      });
      if (!res.ok) {
        lastErr = new Error(`Overpass ${url} returned ${res.status}`);
        continue;
      }
      return (await res.json()) as OverpassResponse;
    } catch (err) {
      lastErr = err;
      continue;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("All Overpass mirrors failed");
}

export function extractCoords(el: OverpassElement): [number, number] | null {
  if (el.lat != null && el.lon != null) return [el.lat, el.lon];
  if (el.center) return [el.center.lat, el.center.lon];
  return null;
}

export function extractName(tags: OverpassTags | undefined): string | null {
  if (!tags) return null;
  return tags["name"] || tags["name:en"] || null;
}

export function extractPhone(tags: OverpassTags | undefined): string | null {
  if (!tags) return null;
  const raw = tags.phone || tags["contact:phone"] || tags["contact:mobile"];
  if (!raw) return null;
  // Overpass can return `; ` separated lists. Take the first.
  return raw.split(";")[0].trim() || null;
}

export function extractEmail(tags: OverpassTags | undefined): string | null {
  if (!tags) return null;
  const raw = tags.email || tags["contact:email"];
  if (!raw) return null;
  return raw.split(";")[0].trim().toLowerCase() || null;
}

export function extractWebsite(tags: OverpassTags | undefined): string | null {
  if (!tags) return null;
  const raw = tags.website || tags["contact:website"] || tags.url;
  if (!raw) return null;
  const first = raw.split(";")[0].trim();
  if (!first) return null;
  return first.startsWith("http") ? first : `https://${first}`;
}

export function extractAddress(tags: OverpassTags | undefined): string | null {
  if (!tags) return null;
  const parts: string[] = [];
  const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  if (street) parts.push(street);
  if (tags["addr:city"]) parts.push(tags["addr:city"]);
  if (tags["addr:province"]) parts.push(tags["addr:province"]);
  if (tags["addr:postcode"]) parts.push(tags["addr:postcode"]);
  return parts.length ? parts.join(", ") : null;
}

// Jina Reader — free web→markdown proxy. No key required.
// Lets us scrape emails from websites without getting blocked by bot detection.
const EMAIL_RE = /[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const BAD_EMAIL_SUFFIX = /\.(png|jpg|jpeg|gif|webp|svg|css|js)$/i;
const BAD_EMAIL_DOMAIN = /sentry|wixpress|example\.com|noreply|no-reply|yourdomain|domain\.com/i;

export async function scrapeEmailViaJina(siteUrl: string): Promise<string | null> {
  try {
    const clean = siteUrl.replace(/^https?:\/\//, "");
    const jinaUrl = `https://r.jina.ai/https://${clean}`;
    const res = await fetch(jinaUrl, {
      headers: {
        Accept: "text/plain",
        "User-Agent": "waevpoint-lead-bot/1.0",
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    const matches = text.match(EMAIL_RE) || [];
    for (const m of matches) {
      if (BAD_EMAIL_SUFFIX.test(m)) continue;
      if (BAD_EMAIL_DOMAIN.test(m)) continue;
      return m.toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}
