import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/public/deliveries/[token]
// Public endpoint — no auth required. Returns project + deliverables for the client.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!token || token.length < 8) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const { data: project, error: projErr } = await supabaseAdmin
    .from("projects")
    .select("id, title, service_type, status, location, description, shoot_date")
    .eq("delivery_token", token)
    .single();

  if (projErr || !project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: deliverables } = await supabaseAdmin
    .from("deliverables")
    .select("id, title, file_type, file_url, file_size_bytes, thumbnail_url, notes, created_at")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  const { data: surveys } = await supabaseAdmin
    .from("surveys")
    .select("id, title, survey_type, status, orthomosaic_url, dsm_url, model_3d_url, area_m2, gsd_cm_px, photo_count")
    .eq("project_id", project.id)
    .eq("status", "complete");

  return NextResponse.json({
    project: {
      title: project.title,
      service_type: project.service_type,
      status: project.status,
      location: project.location,
      description: project.description,
      shoot_date: project.shoot_date,
    },
    deliverables: deliverables || [],
    surveys: surveys || [],
  });
}
