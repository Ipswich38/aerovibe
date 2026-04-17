import { NextRequest, NextResponse } from "next/server";
import { parseSrt, srtWallToDateTime } from "@/lib/srt";

export const maxDuration = 30;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

// POST body: { srt: "<contents of .SRT file>", downsample?: number }
// Returns parsed summary + downsampled track for map preview.
// This endpoint does NOT write to the DB — it's a preview.
// The client confirms the parsed data, then POSTs to /api/flights with it.
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const srt: string = body.srt || "";
  const downsample = Math.max(Number(body.downsample) || 100, 10);

  if (!srt.trim() || srt.length < 30) {
    return NextResponse.json({ error: "empty or too-short SRT" }, { status: 400 });
  }

  const summary = parseSrt(srt);

  if (summary.totalSamples === 0) {
    return NextResponse.json({ error: "Could not parse SRT — unrecognized format" }, { status: 400 });
  }

  // Downsample track for the preview map (don't flood the client with 5000 points)
  const step = Math.max(1, Math.floor(summary.samples.length / downsample));
  const track = summary.samples
    .filter((_, i) => i % step === 0)
    .map((s) => ({
      t: s.tsMs,
      lat: s.lat,
      lng: s.lng,
      alt: s.relAlt,
    }))
    .filter((p) => p.lat != null && p.lng != null);

  const startDateTime = srtWallToDateTime(summary.startWallClock);
  const endDateTime = srtWallToDateTime(summary.endWallClock);

  return NextResponse.json({
    summary: {
      totalSamples: summary.totalSamples,
      durationSec: Math.round(summary.durationSec),
      startLat: summary.startLat,
      startLng: summary.startLng,
      avgLat: summary.avgLat,
      avgLng: summary.avgLng,
      maxRelAlt: summary.maxRelAlt,
      minRelAlt: summary.minRelAlt,
      maxAbsAlt: summary.maxAbsAlt,
      iso: summary.iso,
      shutter: summary.shutter,
      fnumF: summary.fnumF,
      focalMm: summary.focalMm,
      date: startDateTime?.date || null,
      takeoff_time: startDateTime?.time || null,
      landing_time: endDateTime?.time || null,
    },
    track,
  });
}
