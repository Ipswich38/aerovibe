import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const PURPOSES = ["training", "commercial", "test", "recreational", "other"];

function minutesBetween(takeoff?: string | null, landing?: string | null): number | null {
  if (!takeoff || !landing) return null;
  const [th, tm] = takeoff.split(":").map(Number);
  const [lh, lm] = landing.split(":").map(Number);
  let diff = lh * 60 + lm - (th * 60 + tm);
  if (diff < 0) diff += 24 * 60;
  return diff;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const droneId = url.searchParams.get("drone_id");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  let q = supabaseAdmin.from("flight_logs").select("*").order("date", { ascending: false });
  if (droneId) q = q.eq("drone_id", droneId);
  if (from) q = q.gte("date", from);
  if (to) q = q.lte("date", to);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (!body.pilot_name?.trim()) return NextResponse.json({ error: "pilot_name required" }, { status: 400 });
  if (!body.location?.trim()) return NextResponse.json({ error: "location required" }, { status: 400 });

  const duration =
    typeof body.duration_minutes === "number" && body.duration_minutes >= 0
      ? body.duration_minutes
      : minutesBetween(body.takeoff_time, body.landing_time);

  const payload = {
    date: body.date || new Date().toISOString().slice(0, 10),
    pilot_name: body.pilot_name.trim(),
    drone_id: body.drone_id || null,
    drone_name: body.drone_name?.trim() || null,
    location: body.location.trim(),
    takeoff_time: body.takeoff_time || null,
    landing_time: body.landing_time || null,
    duration_minutes: duration,
    purpose: PURPOSES.includes(body.purpose) ? body.purpose : "training",
    weather: body.weather?.trim() || null,
    incidents: body.incidents?.trim() || null,
    project_id: body.project_id || null,
    notes: body.notes?.trim() || null,
    latitude: typeof body.latitude === "number" ? body.latitude : null,
    longitude: typeof body.longitude === "number" ? body.longitude : null,
  };

  const { data, error } = await supabaseAdmin.from("flight_logs").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Store GPS track points if provided (from SRT ingest)
  if (data && Array.isArray(body.track) && body.track.length > 0) {
    const points = body.track
      .filter((p: { lat?: number; lng?: number }) => p.lat != null && p.lng != null)
      .map((p: { lat: number; lng: number; alt?: number | null; absAlt?: number | null; t?: number }, i: number) => ({
        flight_id: data.id,
        seq: i,
        latitude: p.lat,
        longitude: p.lng,
        rel_alt: p.alt ?? null,
        abs_alt: p.absAlt ?? null,
        ts_ms: p.t ?? null,
      }));
    if (points.length > 0) {
      await supabaseAdmin.from("flight_track_points").insert(points);
    }
  }

  return NextResponse.json(data);
}
