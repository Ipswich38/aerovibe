// Waevpoint mission preset library.
// Generates waypoint sequences for the signature shot types used in real estate,
// wedding, commercial, and travel/lifestyle work.

export type GeometryKind = "orbit" | "reveal" | "dolly" | "topdown" | "linear" | "grid" | "polygon_grid";

export interface Waypoint {
  index: number;
  lat: number;
  lng: number;
  alt: number;           // meters above takeoff point (AGL)
  heading: number;       // compass degrees (0 = north, 90 = east)
  gimbalPitch: number;   // -90 = straight down, 0 = horizontal
  speed: number;         // m/s
  action: "photo" | "hover" | "record" | "pass";
  hoverSec?: number;
}

export interface PresetParams {
  altitudeM: number;
  radiusM?: number;          // for orbit / reveal radius
  distanceM?: number;        // for linear moves
  pointCount?: number;
  speedMs: number;
  gimbalPitch: number;
  heading?: number;          // for linear moves — drone heading
  duration?: number;          // estimated seconds
}

export interface Preset {
  key: string;
  label: string;
  category: "real_estate" | "wedding" | "commercial" | "travel" | "photogrammetry";
  geometry: GeometryKind;
  description: string;
  defaults: PresetParams;
}

export const MISSION_PRESETS: Preset[] = [
  {
    key: "RE-1",
    label: "RE-1 Orbit (Real Estate)",
    category: "real_estate",
    geometry: "orbit",
    description: "Classic property orbit. 360° around the subject at a cinematic radius and altitude.",
    defaults: { altitudeM: 40, radiusM: 30, pointCount: 12, speedMs: 3, gimbalPitch: -25, duration: 60 },
  },
  {
    key: "RE-2",
    label: "RE-2 Reveal (Real Estate)",
    category: "real_estate",
    geometry: "reveal",
    description: "Start low & close, pull back + up to reveal the property and surroundings.",
    defaults: { altitudeM: 50, distanceM: 60, pointCount: 2, speedMs: 3, gimbalPitch: -15, duration: 25 },
  },
  {
    key: "RE-3",
    label: "RE-3 Dolly (Real Estate)",
    category: "real_estate",
    geometry: "dolly",
    description: "Sideways lateral flight parallel to facade. Clean architectural reveal.",
    defaults: { altitudeM: 25, distanceM: 80, pointCount: 2, speedMs: 2, gimbalPitch: -5, duration: 40 },
  },
  {
    key: "RE-4",
    label: "RE-4 Top-Down (Real Estate)",
    category: "real_estate",
    geometry: "topdown",
    description: "Nadir shot for property overview and site plan reference.",
    defaults: { altitudeM: 80, pointCount: 1, speedMs: 1, gimbalPitch: -90, duration: 15 },
  },
  {
    key: "WE-1",
    label: "WE-1 Establish (Wedding/Events)",
    category: "wedding",
    geometry: "linear",
    description: "High wide establishing shot over the venue. Slow pass for opening sequence.",
    defaults: { altitudeM: 70, distanceM: 100, pointCount: 2, speedMs: 2, gimbalPitch: -30, duration: 50 },
  },
  {
    key: "WE-2",
    label: "WE-2 Reveal (Wedding/Events)",
    category: "wedding",
    geometry: "reveal",
    description: "Dramatic reveal from behind obstacle. Use for venue entrances or altars.",
    defaults: { altitudeM: 35, distanceM: 45, pointCount: 2, speedMs: 2, gimbalPitch: -10, duration: 25 },
  },
  {
    key: "WE-3",
    label: "WE-3 Orbit (Wedding/Events)",
    category: "wedding",
    geometry: "orbit",
    description: "Slow orbit around the couple / ceremony space at low altitude.",
    defaults: { altitudeM: 20, radiusM: 15, pointCount: 10, speedMs: 1.5, gimbalPitch: -10, duration: 90 },
  },
  {
    key: "CO-1",
    label: "CO-1 Orbit (Commercial)",
    category: "commercial",
    geometry: "orbit",
    description: "Wide commercial orbit — bigger radius, higher altitude for industrial/infrastructure.",
    defaults: { altitudeM: 80, radiusM: 80, pointCount: 16, speedMs: 4, gimbalPitch: -20, duration: 120 },
  },
  {
    key: "CO-2",
    label: "CO-2 Top-Down (Commercial)",
    category: "commercial",
    geometry: "topdown",
    description: "Nadir overview for commercial property / construction / ops sites.",
    defaults: { altitudeM: 100, pointCount: 1, speedMs: 1, gimbalPitch: -90, duration: 15 },
  },
  {
    key: "CO-3",
    label: "CO-3 Dolly (Commercial)",
    category: "commercial",
    geometry: "dolly",
    description: "Sideways commercial dolly — building exteriors, facility walkthroughs.",
    defaults: { altitudeM: 40, distanceM: 120, pointCount: 2, speedMs: 3, gimbalPitch: -5, duration: 50 },
  },
  {
    key: "TL-1",
    label: "TL-1 Fly-Through (Travel/Lifestyle)",
    category: "travel",
    geometry: "linear",
    description: "Forward travel reveal — scenic approach shot for destination content.",
    defaults: { altitudeM: 40, distanceM: 150, pointCount: 2, speedMs: 5, gimbalPitch: -10, duration: 40 },
  },
  {
    key: "TL-2",
    label: "TL-2 Pull-Back (Travel/Lifestyle)",
    category: "travel",
    geometry: "reveal",
    description: "Pull-back reveal from subject into scenic wide. Classic travel money shot.",
    defaults: { altitudeM: 60, distanceM: 100, pointCount: 2, speedMs: 4, gimbalPitch: -15, duration: 35 },
  },
  {
    key: "MAP-1",
    label: "MAP-1 Photogrammetry Grid (2D)",
    category: "photogrammetry",
    geometry: "grid",
    description: "Nadir grid mission for orthomosaic output. Set altitude/overlap in planner.",
    defaults: { altitudeM: 60, distanceM: 80, pointCount: 0, speedMs: 4, gimbalPitch: -90, duration: 0 },
  },
  {
    key: "MAP-2",
    label: "MAP-2 Polygon Survey (2D)",
    category: "photogrammetry",
    geometry: "polygon_grid",
    description: "Draw a polygon boundary, auto-generates serpentine survey grid. Shows GSD, photo count, area.",
    defaults: { altitudeM: 60, speedMs: 4, gimbalPitch: -90, duration: 0 },
  },
];

// Convert local offset (meters) → (lat, lng) offset at a given origin latitude.
// Accurate for small distances (< ~5km).
function offsetMeters(
  originLat: number,
  originLng: number,
  dxE: number,
  dyN: number,
): { lat: number; lng: number } {
  const METERS_PER_DEG_LAT = 111_320;
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((originLat * Math.PI) / 180);
  return {
    lat: originLat + dyN / METERS_PER_DEG_LAT,
    lng: originLng + dxE / metersPerDegLng,
  };
}

function bearing(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  const φ1 = (fromLat * Math.PI) / 180;
  const φ2 = (toLat * Math.PI) / 180;
  const Δλ = ((toLng - fromLng) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

export interface MissionInput {
  preset: Preset;
  centerLat: number;
  centerLng: number;
  overrides?: Partial<PresetParams>;
  heading?: number;
  polygon?: { lat: number; lng: number }[];
}

export interface PhotogrammetryStats {
  areaM2: number;
  gsdCmPx: number;
  photoCount: number;
  flightLineCount: number;
  estimatedPhotoIntervalM: number;
  frontOverlap: number;
  sideOverlap: number;
}

export interface GeneratedMission {
  preset: Preset;
  params: PresetParams;
  center: { lat: number; lng: number };
  waypoints: Waypoint[];
  bounds: { minLat: number; minLng: number; maxLat: number; maxLng: number };
  estimatedDurationSec: number;
  totalDistanceM: number;
  photogrammetry?: PhotogrammetryStats;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function finalize(preset: Preset, params: PresetParams, center: { lat: number; lng: number }, waypoints: Waypoint[]): GeneratedMission {
  let totalDist = 0;
  for (let i = 1; i < waypoints.length; i++) {
    totalDist += haversine(waypoints[i - 1].lat, waypoints[i - 1].lng, waypoints[i].lat, waypoints[i].lng);
  }
  const est = params.speedMs > 0 ? totalDist / params.speedMs : 0;
  const hoverTotal = waypoints.reduce((s, w) => s + (w.hoverSec || 0), 0);
  const lats = waypoints.map((w) => w.lat);
  const lngs = waypoints.map((w) => w.lng);
  return {
    preset,
    params,
    center,
    waypoints,
    estimatedDurationSec: Math.round(est + hoverTotal),
    totalDistanceM: Math.round(totalDist),
    bounds: {
      minLat: Math.min(...lats, center.lat),
      minLng: Math.min(...lngs, center.lng),
      maxLat: Math.max(...lats, center.lat),
      maxLng: Math.max(...lngs, center.lng),
    },
  };
}

export function generateMission(input: MissionInput): GeneratedMission {
  const { preset, centerLat, centerLng } = input;
  const p: PresetParams = { ...preset.defaults, ...(input.overrides || {}) };
  const center = { lat: centerLat, lng: centerLng };

  switch (preset.geometry) {
    case "orbit": {
      const radius = p.radiusM || 30;
      const n = Math.max(4, p.pointCount || 12);
      const wps: Waypoint[] = [];
      for (let i = 0; i < n; i++) {
        const θ = (i / n) * 2 * Math.PI;
        const dxE = radius * Math.sin(θ);
        const dyN = radius * Math.cos(θ);
        const pt = offsetMeters(centerLat, centerLng, dxE, dyN);
        const heading = bearing(pt.lat, pt.lng, centerLat, centerLng);
        wps.push({
          index: i + 1,
          lat: pt.lat,
          lng: pt.lng,
          alt: p.altitudeM,
          heading,
          gimbalPitch: p.gimbalPitch,
          speed: p.speedMs,
          action: "pass",
        });
      }
      // close the loop
      if (wps.length > 0) wps.push({ ...wps[0], index: wps.length + 1 });
      return finalize(preset, p, center, wps);
    }

    case "reveal": {
      const dist = p.distanceM || 60;
      const heading = input.heading ?? 0;
      // Start close + low (behind foreground), end at full reveal distance + altitude
      const backRad = ((heading + 180) * Math.PI) / 180;
      const startOffsetE = 0;
      const startOffsetN = 0;
      const endE = dist * Math.sin(backRad);
      const endN = dist * Math.cos(backRad);
      const start = offsetMeters(centerLat, centerLng, startOffsetE, startOffsetN);
      const end = offsetMeters(centerLat, centerLng, endE, endN);
      return finalize(preset, p, center, [
        {
          index: 1,
          lat: start.lat,
          lng: start.lng,
          alt: Math.max(5, p.altitudeM * 0.3),
          heading,
          gimbalPitch: p.gimbalPitch + 10,
          speed: p.speedMs,
          action: "pass",
        },
        {
          index: 2,
          lat: end.lat,
          lng: end.lng,
          alt: p.altitudeM,
          heading,
          gimbalPitch: p.gimbalPitch,
          speed: p.speedMs,
          action: "pass",
        },
      ]);
    }

    case "dolly": {
      const dist = p.distanceM || 80;
      const heading = input.heading ?? 90;
      const travelRad = (heading * Math.PI) / 180;
      const half = dist / 2;
      const start = offsetMeters(centerLat, centerLng, -half * Math.sin(travelRad), -half * Math.cos(travelRad));
      const end = offsetMeters(centerLat, centerLng, half * Math.sin(travelRad), half * Math.cos(travelRad));
      // Gimbal faces perpendicular to travel direction (toward subject)
      const look = bearing(start.lat, start.lng, centerLat, centerLng);
      return finalize(preset, p, center, [
        {
          index: 1,
          lat: start.lat,
          lng: start.lng,
          alt: p.altitudeM,
          heading: look,
          gimbalPitch: p.gimbalPitch,
          speed: p.speedMs,
          action: "pass",
        },
        {
          index: 2,
          lat: end.lat,
          lng: end.lng,
          alt: p.altitudeM,
          heading: look,
          gimbalPitch: p.gimbalPitch,
          speed: p.speedMs,
          action: "pass",
        },
      ]);
    }

    case "topdown": {
      return finalize(preset, p, center, [
        {
          index: 1,
          lat: centerLat,
          lng: centerLng,
          alt: p.altitudeM,
          heading: input.heading ?? 0,
          gimbalPitch: -90,
          speed: p.speedMs,
          action: "photo",
          hoverSec: 5,
        },
      ]);
    }

    case "linear": {
      const dist = p.distanceM || 100;
      const heading = input.heading ?? 0;
      const travelRad = (heading * Math.PI) / 180;
      const end = offsetMeters(centerLat, centerLng, dist * Math.sin(travelRad), dist * Math.cos(travelRad));
      return finalize(preset, p, center, [
        {
          index: 1,
          lat: centerLat,
          lng: centerLng,
          alt: p.altitudeM,
          heading,
          gimbalPitch: p.gimbalPitch,
          speed: p.speedMs,
          action: "pass",
        },
        {
          index: 2,
          lat: end.lat,
          lng: end.lng,
          alt: p.altitudeM,
          heading,
          gimbalPitch: p.gimbalPitch,
          speed: p.speedMs,
          action: "pass",
        },
      ]);
    }

    case "polygon_grid": {
      const poly = input.polygon;
      if (!poly || poly.length < 3) {
        return finalize(preset, p, center, []);
      }
      const pgResult = generatePolygonGrid(poly, p, input.heading ?? 0, centerLat, centerLng);
      const mission = finalize(preset, p, center, pgResult.waypoints);
      mission.photogrammetry = pgResult.stats;
      return mission;
    }

    case "grid": {
      // Serpentine grid centered on (centerLat, centerLng).
      // p.distanceM = side length of square area (m). p.altitudeM = altitude AGL.
      // Front overlap 80%, side overlap 70% defaults (controlled by row/col spacing in override.radiusM/pointCount).
      const side = p.distanceM || 100;
      // rowSpacing defaults to 15m (dense), override via radiusM
      const rowSpacing = p.radiusM || 15;
      const heading = input.heading ?? 0;
      const travelRad = (heading * Math.PI) / 180;
      const perpRad = travelRad + Math.PI / 2;
      const rows = Math.max(2, Math.floor(side / rowSpacing) + 1);
      const wps: Waypoint[] = [];
      const halfSide = side / 2;
      for (let r = 0; r < rows; r++) {
        const perpOffset = -halfSide + r * rowSpacing;
        const perpE = perpOffset * Math.sin(perpRad);
        const perpN = perpOffset * Math.cos(perpRad);
        // Direction of travel alternates per row
        const forward = r % 2 === 0 ? halfSide : -halfSide;
        const back = r % 2 === 0 ? -halfSide : halfSide;
        const startE = perpE + back * Math.sin(travelRad);
        const startN = perpN + back * Math.cos(travelRad);
        const endE = perpE + forward * Math.sin(travelRad);
        const endN = perpN + forward * Math.cos(travelRad);
        const s = offsetMeters(centerLat, centerLng, startE, startN);
        const e = offsetMeters(centerLat, centerLng, endE, endN);
        wps.push({
          index: wps.length + 1,
          lat: s.lat,
          lng: s.lng,
          alt: p.altitudeM,
          heading,
          gimbalPitch: -90,
          speed: p.speedMs,
          action: "pass",
        });
        wps.push({
          index: wps.length + 1,
          lat: e.lat,
          lng: e.lng,
          alt: p.altitudeM,
          heading,
          gimbalPitch: -90,
          speed: p.speedMs,
          action: "pass",
        });
      }
      return finalize(preset, p, center, wps);
    }
  }
}

// ---- Polygon grid photogrammetry ----

// DJI Mini 5 Pro sensor: 1-inch CMOS, 4:3 mode 5472x3648
const SENSOR_WIDTH_MM = 13.2;
const SENSOR_HEIGHT_MM = 8.8;
const IMAGE_WIDTH_PX = 5472;
const IMAGE_HEIGHT_PX = 3648;
const DEFAULT_FOCAL_MM = 24;

export function calcGsd(altitudeM: number, focalMm = DEFAULT_FOCAL_MM): number {
  return (altitudeM * SENSOR_WIDTH_MM * 100) / (focalMm * IMAGE_WIDTH_PX);
}

function latLngToLocal(
  lat: number,
  lng: number,
  refLat: number,
  refLng: number,
): { x: number; y: number } {
  const METERS_PER_DEG_LAT = 111_320;
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((refLat * Math.PI) / 180);
  return {
    x: (lng - refLng) * metersPerDegLng,
    y: (lat - refLat) * METERS_PER_DEG_LAT,
  };
}

function localToLatLng(
  x: number,
  y: number,
  refLat: number,
  refLng: number,
): { lat: number; lng: number } {
  const METERS_PER_DEG_LAT = 111_320;
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((refLat * Math.PI) / 180);
  return {
    lat: refLat + y / METERS_PER_DEG_LAT,
    lng: refLng + x / metersPerDegLng,
  };
}

function polygonAreaM2(pts: { x: number; y: number }[]): number {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i].x * pts[j].y;
    area -= pts[j].x * pts[i].y;
  }
  return Math.abs(area) / 2;
}

function lineIntersectsSegment(
  scanY: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number | null {
  if ((ay <= scanY && by <= scanY) || (ay > scanY && by > scanY)) return null;
  const t = (scanY - ay) / (by - ay);
  return ax + t * (bx - ax);
}

function scanlineClip(
  localPoly: { x: number; y: number }[],
  scanY: number,
): { xMin: number; xMax: number } | null {
  const xs: number[] = [];
  for (let i = 0; i < localPoly.length; i++) {
    const j = (i + 1) % localPoly.length;
    const ix = lineIntersectsSegment(scanY, localPoly[i].x, localPoly[i].y, localPoly[j].x, localPoly[j].y);
    if (ix !== null) xs.push(ix);
  }
  if (xs.length < 2) return null;
  xs.sort((a, b) => a - b);
  return { xMin: xs[0], xMax: xs[xs.length - 1] };
}

function rotatePoints(
  pts: { x: number; y: number }[],
  angleDeg: number,
): { x: number; y: number }[] {
  const rad = (-angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return pts.map((p) => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  }));
}

function unrotatePoint(x: number, y: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

function generatePolygonGrid(
  polygon: { lat: number; lng: number }[],
  params: PresetParams,
  headingDeg: number,
  refLat: number,
  refLng: number,
): { waypoints: Waypoint[]; stats: PhotogrammetryStats } {
  const frontOverlap = 0.80;
  const sideOverlap = 0.70;

  const gsd = calcGsd(params.altitudeM, DEFAULT_FOCAL_MM);
  const footprintW = (gsd * IMAGE_WIDTH_PX) / 100;
  const footprintH = (gsd * IMAGE_HEIGHT_PX) / 100;

  const lineSpacing = footprintW * (1 - sideOverlap);
  const photoInterval = footprintH * (1 - frontOverlap);

  const localPoly = polygon.map((p) => latLngToLocal(p.lat, p.lng, refLat, refLng));
  const areaM2 = polygonAreaM2(localPoly);

  const rotated = rotatePoints(localPoly, headingDeg);
  const ys = rotated.map((p) => p.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  const wps: Waypoint[] = [];
  let lineIdx = 0;
  let photoCount = 0;

  for (let y = yMin + lineSpacing / 2; y <= yMax; y += lineSpacing) {
    const clip = scanlineClip(rotated, y);
    if (!clip) continue;

    const startX = clip.xMin;
    const endX = clip.xMax;
    const swap = lineIdx % 2 === 1;

    const sx = swap ? endX : startX;
    const ex = swap ? startX : endX;

    const sWorld = unrotatePoint(sx, y, headingDeg);
    const eWorld = unrotatePoint(ex, y, headingDeg);

    const sGeo = localToLatLng(sWorld.x, sWorld.y, refLat, refLng);
    const eGeo = localToLatLng(eWorld.x, eWorld.y, refLat, refLng);

    wps.push({
      index: wps.length + 1,
      lat: sGeo.lat,
      lng: sGeo.lng,
      alt: params.altitudeM,
      heading: headingDeg,
      gimbalPitch: -90,
      speed: params.speedMs,
      action: "pass",
    });
    wps.push({
      index: wps.length + 1,
      lat: eGeo.lat,
      lng: eGeo.lng,
      alt: params.altitudeM,
      heading: headingDeg,
      gimbalPitch: -90,
      speed: params.speedMs,
      action: "pass",
    });

    const lineLen = Math.abs(endX - startX);
    photoCount += Math.max(1, Math.floor(lineLen / photoInterval) + 1);
    lineIdx++;
  }

  return {
    waypoints: wps,
    stats: {
      areaM2: Math.round(areaM2),
      gsdCmPx: Math.round(gsd * 100) / 100,
      photoCount,
      flightLineCount: lineIdx,
      estimatedPhotoIntervalM: Math.round(photoInterval * 10) / 10,
      frontOverlap,
      sideOverlap,
    },
  };
}

// ---- Export formats ----

export function missionToKml(m: GeneratedMission, name: string): string {
  const coords = m.waypoints
    .map((w) => `${w.lng.toFixed(7)},${w.lat.toFixed(7)},${w.alt.toFixed(1)}`)
    .join("\n          ");
  const placemarks = m.waypoints
    .map(
      (w) => `  <Placemark>
    <name>WP${w.index}</name>
    <description>alt ${w.alt}m AGL · head ${Math.round(w.heading)}° · gimbal ${w.gimbalPitch}°${w.hoverSec ? ` · hover ${w.hoverSec}s` : ""}</description>
    <Point><coordinates>${w.lng.toFixed(7)},${w.lat.toFixed(7)},${w.alt.toFixed(1)}</coordinates></Point>
  </Placemark>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <name>${escapeXml(name)}</name>
  <description>Waevpoint ${m.preset.key} · ${m.preset.label} · ${m.waypoints.length} waypoints · ~${m.estimatedDurationSec}s · ${m.totalDistanceM}m</description>
  <Style id="track">
    <LineStyle><color>ff00ffff</color><width>3</width></LineStyle>
  </Style>
  <Placemark>
    <name>Flight path</name>
    <styleUrl>#track</styleUrl>
    <LineString>
      <tessellate>1</tessellate>
      <altitudeMode>relativeToGround</altitudeMode>
      <coordinates>
          ${coords}
      </coordinates>
    </LineString>
  </Placemark>
${placemarks}
</Document>
</kml>`;
}

export function missionToCsv(m: GeneratedMission): string {
  const header = "wp,lat,lng,alt_m,heading_deg,gimbal_deg,speed_mps,action,hover_sec";
  const rows = m.waypoints.map((w) =>
    [w.index, w.lat.toFixed(7), w.lng.toFixed(7), w.alt, w.heading.toFixed(1), w.gimbalPitch, w.speed, w.action, w.hoverSec || ""].join(","),
  );
  return [header, ...rows].join("\n");
}

// Litchi waypoint CSV — compatible with Litchi Mission Hub on iOS/Android.
// Column order matches Litchi's import spec.
export function missionToLitchiCsv(m: GeneratedMission): string {
  const header =
    "latitude,longitude,altitude(m),heading(deg),curvesize(m),rotationdir,gimbalmode,gimbalpitchangle,actiontype1,actionparam1,actiontype2,actionparam2,actiontype3,actionparam3,actiontype4,actionparam4,actiontype5,actionparam5,actiontype6,actionparam6,actiontype7,actionparam7,actiontype8,actionparam8,actiontype9,actionparam9,actiontype10,actionparam10,actiontype11,actionparam11,actiontype12,actionparam12,actiontype13,actionparam13,actiontype14,actionparam14,actiontype15,actionparam15,altitudemode,speed(m/s),poi_latitude,poi_longitude,poi_altitude(m),poi_altitudemode,photo_timeinterval,photo_distinterval";
  const rows = m.waypoints.map((w) => {
    const actions = Array(15)
      .fill("-1,0")
      .join(",");
    return [
      w.lat.toFixed(7),
      w.lng.toFixed(7),
      w.alt,
      w.heading.toFixed(1),
      0,
      0,
      2, // gimbal focus: interpolate
      w.gimbalPitch,
      actions,
      0, // altitudemode: relative
      w.speed,
      0,
      0,
      0,
      0,
      -1,
      -1,
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] || c,
  );
}
