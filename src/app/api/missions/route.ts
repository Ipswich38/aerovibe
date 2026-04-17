import { NextRequest, NextResponse } from "next/server";
import {
  MISSION_PRESETS,
  PresetParams,
  generateMission,
  missionToCsv,
  missionToKml,
  missionToLitchiCsv,
} from "@/lib/missions";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

// POST { preset_key, center_lat, center_lng, heading?, overrides?, format? }
// format: "json" (default) | "kml" | "csv" | "litchi"
// json returns the full mission object; others return raw text with download headers.
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const presetKey = String(body.preset_key || "").trim();
  const preset = MISSION_PRESETS.find((p) => p.key === presetKey);
  if (!preset) return NextResponse.json({ error: "Unknown preset_key" }, { status: 400 });

  const lat = Number(body.center_lat);
  const lng = Number(body.center_lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "center_lat / center_lng required" }, { status: 400 });
  }

  const overrides: Partial<PresetParams> = {};
  if (typeof body.altitude_m === "number") overrides.altitudeM = body.altitude_m;
  if (typeof body.radius_m === "number") overrides.radiusM = body.radius_m;
  if (typeof body.distance_m === "number") overrides.distanceM = body.distance_m;
  if (typeof body.point_count === "number") overrides.pointCount = body.point_count;
  if (typeof body.speed_ms === "number") overrides.speedMs = body.speed_ms;
  if (typeof body.gimbal_pitch === "number") overrides.gimbalPitch = body.gimbal_pitch;

  const heading = typeof body.heading === "number" ? body.heading : undefined;
  const mission = generateMission({
    preset,
    centerLat: lat,
    centerLng: lng,
    overrides,
    heading,
  });

  const format = String(body.format || "json");
  const fileBase = body.name
    ? String(body.name).replace(/[^a-z0-9_-]+/gi, "_")
    : `waevpoint_${preset.key}_${new Date().toISOString().slice(0, 10)}`;

  if (format === "kml") {
    const kml = missionToKml(mission, fileBase);
    return new NextResponse(kml, {
      headers: {
        "Content-Type": "application/vnd.google-earth.kml+xml",
        "Content-Disposition": `attachment; filename="${fileBase}.kml"`,
      },
    });
  }
  if (format === "csv") {
    const csv = missionToCsv(mission);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileBase}.csv"`,
      },
    });
  }
  if (format === "litchi") {
    const csv = missionToLitchiCsv(mission);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${fileBase}_litchi.csv"`,
      },
    });
  }

  return NextResponse.json({ mission });
}

export async function GET() {
  return NextResponse.json({
    presets: MISSION_PRESETS.map((p) => ({
      key: p.key,
      label: p.label,
      category: p.category,
      geometry: p.geometry,
      description: p.description,
      defaults: p.defaults,
    })),
  });
}
