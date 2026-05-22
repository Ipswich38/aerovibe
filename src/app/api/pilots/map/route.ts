import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Public — returns approved pilot data for the map (no sensitive info)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spec    = searchParams.get("spec") ?? "";   // filter by specialization
  const country = searchParams.get("country") ?? ""; // filter by country

  let q = supabaseAdmin
    .from("pilot_applications")
    .select("id, name, location, country, services, offered_services, drone_models, primary_specialization, skill_level, subscription_status, lat, lng")
    .eq("status", "approved")
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (spec)    q = q.ilike("primary_specialization", `%${spec}%`);
  if (country) q = q.eq("country", country);

  const { data, error } = await q.limit(300);
  if (error) return NextResponse.json({ pilots: [] });

  return NextResponse.json({
    pilots: (data ?? []).map((p) => ({
      id:                    p.id,
      name:                  (p.name as string).split(" ")[0],
      location:              p.location,
      country:               p.country,
      services:              p.services,
      offered_services:      p.offered_services,
      drones:                p.drone_models,
      specialization:        p.primary_specialization,
      skill_level:           p.skill_level,
      available:             ["active", "trial"].includes(p.subscription_status ?? ""),
      lat:                   p.lat,
      lng:                   p.lng,
    })),
  });
}
