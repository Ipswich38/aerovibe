import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function geocode(city: string, country: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const q = encodeURIComponent(`${city}, ${country}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "WaevPilots/1.0 (waevpoint.quest)" } }
    );
    if (!res.ok) return null;
    const data = await res.json() as Array<{ lat: string; lon: string }>;
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

const ipLog = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 3) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let b: Record<string, string>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const required = ["name", "contact", "location", "province", "caap_license", "drone_models", "services"];
  for (const f of required) {
    if (!b[f]?.trim()) return NextResponse.json({ error: `${f} is required.` }, { status: 400 });
  }

  const coords = await geocode(b.location, b.province ?? b.country ?? "");

  const { error } = await supabaseAdmin.from("pilot_applications").insert({
    ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    name:                   b.name.trim().slice(0, 100),
    contact:                b.contact.trim().slice(0, 120),
    email:                  b.email?.trim().slice(0, 120) || null,
    location:               b.location.trim().slice(0, 150),
    province:               b.province?.trim().slice(0, 80) || null,
    country:                b.country?.trim().slice(0, 80) || "Philippines",
    caap_license:           b.caap_license?.trim().slice(0, 80) || null,
    drone_models:           b.drone_models.trim().slice(0, 200),
    primary_specialization: b.primary_specialization?.trim().slice(0, 100) || null,
    skill_level:            b.skill_level?.trim() || "intermediate",
    services:               b.services.trim().slice(0, 300),
    experience_yrs:         parseInt(b.experience_yrs ?? "0", 10) || 0,
    portfolio_url:          b.portfolio_url?.trim().slice(0, 300) || null,
    about:                  b.about?.trim().slice(0, 600) || null,
    status:                 "pending",
  });

  if (error) {
    console.error("Pilot apply error:", error);
    return NextResponse.json({ error: "Could not submit. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
