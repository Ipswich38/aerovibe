// DJI SRT telemetry parser.
// Handles modern Mini/Mavic/Air format (Mini 3/4/5 Pro, Mavic 3 series, Air 3+).
//
// Modern DJI SRT blocks look like:
//   1
//   00:00:00,000 --> 00:00:00,033
//   <font size="28">SrtCnt : 1, DiffTime : 33ms
//   2025-11-04 14:32:10.123
//   [iso : 110] [shutter : 1/2500.0] [fnum : 170] [ev : 0] [ct : 5400]
//   [color_md : default] [focal_len : 240]
//   [latitude: 14.599500] [longitude: 120.984200]
//   [rel_alt: 50.500 abs_alt: 45.200]</font>
//
// Legacy blocks use: HOME(lat,lng) GPS(lng,lat,alt) BAROMETER:xxM ISO:xxx etc.

export interface SrtSample {
  index: number;
  tsMs: number;            // milliseconds from start of video
  wallClock: string | null;
  lat: number | null;
  lng: number | null;
  absAlt: number | null;   // sea-level
  relAlt: number | null;   // relative to takeoff
  iso: number | null;
  shutter: string | null;  // e.g. "1/2500"
  fnum: number | null;     // aperture * 100
  focalLen: number | null; // mm * 10
  ev: number | null;
  ct: number | null;       // color temp
}

export interface SrtSummary {
  totalSamples: number;
  durationSec: number;
  startWallClock: string | null;
  endWallClock: string | null;
  // First valid GPS point
  startLat: number | null;
  startLng: number | null;
  // Averaged for flight log location
  avgLat: number | null;
  avgLng: number | null;
  maxRelAlt: number | null;
  maxAbsAlt: number | null;
  minRelAlt: number | null;
  // Representative camera settings (median of non-null)
  iso: number | null;
  shutter: string | null;
  fnumF: number | null;     // actual f-stop value (e.g. 1.7)
  focalMm: number | null;   // actual mm (e.g. 24)
  // Full sample array (caller can downsample for map preview)
  samples: SrtSample[];
}

const TIME_RE = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/;
const WALL_CLOCK_RE = /(\d{4}[-./]\d{2}[-./]\d{2}\s+\d{2}:\d{2}:\d{2}(?:\.\d+)?)/;

function num(m: RegExpMatchArray | null, idx = 1): number | null {
  if (!m || !m[idx]) return null;
  const v = Number(m[idx]);
  return Number.isFinite(v) ? v : null;
}

function parseTimeToMs(h: string, m: string, s: string, ms: string): number {
  return (Number(h) * 3600 + Number(m) * 60 + Number(s)) * 1000 + Number(ms);
}

function parseBlock(block: string, fallbackIdx: number): SrtSample | null {
  const lines = block.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return null;

  const idx = Number(lines[0]) || fallbackIdx;
  const timeLine = lines[1] || "";
  const timeMatch = timeLine.match(TIME_RE);
  const tsMs = timeMatch
    ? parseTimeToMs(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4])
    : 0;

  const body = lines.slice(2).join(" ");

  const wall = body.match(WALL_CLOCK_RE);

  // Modern Mini/Mavic format
  const latMatch = body.match(/\[latitude\s*:\s*(-?\d+\.\d+)\]/i);
  const lngMatch = body.match(/\[longitude\s*:\s*(-?\d+\.\d+)\]/i);
  const relAltMatch = body.match(/\[rel_alt\s*:\s*(-?\d+\.\d+)/i);
  const absAltMatch = body.match(/abs_alt\s*:\s*(-?\d+\.\d+)\]/i);

  // Legacy GPS(lng,lat,alt) format
  const gpsLegacy = body.match(/GPS\s*\(\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.?\d*)\s*\)/i);
  const baroLegacy = body.match(/BAROMETER\s*:\s*(-?\d+\.?\d*)\s*M/i);

  const iso = body.match(/\[iso\s*:\s*(\d+)\]/i) || body.match(/ISO\s*:\s*(\d+)/i);
  const shutterM = body.match(/\[shutter\s*:\s*([\d./]+)\]/i) || body.match(/Shutter\s*:\s*([\d./]+)/i);
  const fnum = body.match(/\[fnum\s*:\s*(\d+)\]/i) || body.match(/Fnum\s*:\s*F?([\d.]+)/i);
  const focal = body.match(/\[focal_len\s*:\s*(\d+)\]/i) || body.match(/FOCAL_LEN\s*:\s*([\d.]+)/i);
  const ev = body.match(/\[ev\s*:\s*(-?[\d.]+)\]/i);
  const ct = body.match(/\[ct\s*:\s*(\d+)\]/i);

  let lat: number | null = latMatch ? Number(latMatch[1]) : null;
  let lng: number | null = lngMatch ? Number(lngMatch[1]) : null;
  let absAlt: number | null = absAltMatch ? Number(absAltMatch[1]) : null;
  let relAlt: number | null = relAltMatch ? Number(relAltMatch[1]) : null;

  if ((lat == null || lng == null) && gpsLegacy) {
    // Legacy: first arg is longitude, second is latitude
    lng = Number(gpsLegacy[1]);
    lat = Number(gpsLegacy[2]);
    absAlt = absAlt ?? Number(gpsLegacy[3]);
  }
  if (relAlt == null && baroLegacy) relAlt = Number(baroLegacy[1]);

  // Sanity filter: reject clearly invalid coords (0,0)
  if (lat === 0 && lng === 0) {
    lat = null;
    lng = null;
  }

  return {
    index: idx,
    tsMs,
    wallClock: wall ? wall[1] : null,
    lat,
    lng,
    absAlt,
    relAlt,
    iso: num(iso),
    shutter: shutterM ? shutterM[1] : null,
    fnum: num(fnum),
    focalLen: num(focal),
    ev: num(ev),
    ct: num(ct),
  };
}

export function parseSrt(raw: string): SrtSummary {
  // Strip BOM and HTML-ish font tags
  const cleaned = raw.replace(/^\uFEFF/, "").replace(/<\/?font[^>]*>/gi, "");
  // Blocks are separated by blank lines
  const blocks = cleaned.split(/\r?\n\r?\n/);

  const samples: SrtSample[] = [];
  blocks.forEach((b, i) => {
    const s = parseBlock(b.trim(), i + 1);
    if (s) samples.push(s);
  });

  const withGps = samples.filter((s) => s.lat != null && s.lng != null);

  const startLat = withGps[0]?.lat ?? null;
  const startLng = withGps[0]?.lng ?? null;
  const avgLat =
    withGps.length > 0 ? withGps.reduce((a, s) => a + (s.lat || 0), 0) / withGps.length : null;
  const avgLng =
    withGps.length > 0 ? withGps.reduce((a, s) => a + (s.lng || 0), 0) / withGps.length : null;

  const relAlts = samples.map((s) => s.relAlt).filter((v): v is number => v != null);
  const absAlts = samples.map((s) => s.absAlt).filter((v): v is number => v != null);
  const isoVals = samples.map((s) => s.iso).filter((v): v is number => v != null);
  const shutters = samples.map((s) => s.shutter).filter((v): v is string => !!v);
  const fnums = samples.map((s) => s.fnum).filter((v): v is number => v != null);
  const focals = samples.map((s) => s.focalLen).filter((v): v is number => v != null);

  const median = <T>(arr: T[], cmp: (a: T, b: T) => number): T | null => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort(cmp);
    return sorted[Math.floor(sorted.length / 2)];
  };

  const medianIso = median(isoVals, (a, b) => a - b);
  const medianShutter = median(shutters, (a, b) => a.localeCompare(b));
  const medianFnum = median(fnums, (a, b) => a - b);
  const medianFocal = median(focals, (a, b) => a - b);

  const startWall = samples[0]?.wallClock ?? null;
  const endWall = samples[samples.length - 1]?.wallClock ?? null;
  const durationSec =
    samples.length > 1
      ? (samples[samples.length - 1].tsMs - samples[0].tsMs) / 1000
      : samples.length === 1
        ? 0
        : 0;

  return {
    totalSamples: samples.length,
    durationSec,
    startWallClock: startWall,
    endWallClock: endWall,
    startLat,
    startLng,
    avgLat,
    avgLng,
    maxRelAlt: relAlts.length ? Math.max(...relAlts) : null,
    minRelAlt: relAlts.length ? Math.min(...relAlts) : null,
    maxAbsAlt: absAlts.length ? Math.max(...absAlts) : null,
    iso: medianIso,
    shutter: medianShutter,
    fnumF: medianFnum != null ? medianFnum / 100 : null,
    focalMm: medianFocal != null ? medianFocal / 10 : null,
    samples,
  };
}

// Helper: convert SRT wall-clock "2025-11-04 14:32:10.123" to ISO date + HH:MM time
export function srtWallToDateTime(wall: string | null): { date: string; time: string } | null {
  if (!wall) return null;
  const m = wall.match(/(\d{4})[-./](\d{2})[-./](\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  return { date: `${m[1]}-${m[2]}-${m[3]}`, time: `${m[4]}:${m[5]}` };
}
