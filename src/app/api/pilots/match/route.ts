import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface PilotRow {
  id: string;
  name: string;
  location: string;
  province: string;
  country: string;
  primary_specialization: string | null;
  skill_level: string | null;
  services: string;
  drone_models: string;
  experience_yrs: number;
  lat: number | null;
  lng: number | null;
}

function scorePilot(
  pilot: PilotRow,
  serviceType: string,
  country: string,
  province: string,
): number {
  let score = 0;
  const svc = serviceType.toLowerCase();
  const spec = (pilot.primary_specialization ?? "").toLowerCase();
  const services = (pilot.services ?? "").toLowerCase();

  // Primary specialization exact match — highest weight
  if (spec && svc.includes(spec.split(" ")[0])) score += 15;
  else if (spec && spec.split(" ").some(w => svc.includes(w))) score += 10;

  // Secondary services match
  if (services.includes(svc.split(" ")[0])) score += 6;

  // Skill level bonus
  if (pilot.skill_level === "expert")       score += 4;
  else if (pilot.skill_level === "intermediate") score += 2;

  // Location match
  if (pilot.country?.toLowerCase() === country?.toLowerCase()) score += 5;
  if (pilot.province && province &&
      pilot.province.toLowerCase() === province.toLowerCase()) score += 8;

  // Experience (capped at 5 bonus)
  score += Math.min(pilot.experience_yrs ?? 0, 5);

  return score;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const serviceType = searchParams.get("service_type") ?? "";
  const country     = searchParams.get("country") ?? "";
  const province    = searchParams.get("province") ?? "";

  const { data, error } = await supabaseAdmin
    .from("pilot_applications")
    .select("id, name, location, province, country, primary_specialization, skill_level, services, drone_models, experience_yrs, lat, lng")
    .eq("status", "approved")
    .eq("subscription_status", "active");

  if (error || !data) return NextResponse.json({ pilots: [] });

  const scored = (data as PilotRow[])
    .map(p => ({ ...p, score: scorePilot(p, serviceType, country, province) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(p => ({
      id:                    p.id,
      name:                  p.name,
      location:              p.location,
      country:               p.country,
      primary_specialization:p.primary_specialization,
      skill_level:           p.skill_level,
      services:              p.services,
      drones:                p.drone_models,
      experience_yrs:        p.experience_yrs,
      score:                 p.score,
    }));

  return NextResponse.json({ pilots: scored });
}
