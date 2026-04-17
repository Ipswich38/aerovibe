import airportsData from "@/data/ph-airports.json";

export interface Airport {
  icao: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  class: "international" | "domestic";
}

export const AIRPORTS: Airport[] = airportsData as Airport[];

// CAAP rule: drone flight requires permission within 10km of any aerodrome.
export const NO_FLY_RADIUS_KM = 10;
export const CAUTION_RADIUS_KM = 15;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export type FlyStatus = "no_fly" | "caution" | "clear";

export interface FlyCheck {
  status: FlyStatus;
  nearest: Airport;
  distanceKm: number;
  message: string;
}

export function checkLocation(lat: number, lng: number): FlyCheck {
  let nearest = AIRPORTS[0];
  let best = haversineKm(lat, lng, nearest.lat, nearest.lng);
  for (const a of AIRPORTS) {
    const d = haversineKm(lat, lng, a.lat, a.lng);
    if (d < best) {
      best = d;
      nearest = a;
    }
  }

  if (best <= NO_FLY_RADIUS_KM) {
    return {
      status: "no_fly",
      nearest,
      distanceKm: best,
      message: `No-fly — inside 10km of ${nearest.name} (${best.toFixed(1)} km). CAAP permission required.`,
    };
  }
  if (best <= CAUTION_RADIUS_KM) {
    return {
      status: "caution",
      nearest,
      distanceKm: best,
      message: `Caution — ${best.toFixed(1)} km from ${nearest.name}. Check controlled airspace before flying.`,
    };
  }
  return {
    status: "clear",
    nearest,
    distanceKm: best,
    message: `Clear — ${best.toFixed(1)} km from nearest aerodrome (${nearest.name}). Observe altitude and VLOS rules.`,
  };
}
