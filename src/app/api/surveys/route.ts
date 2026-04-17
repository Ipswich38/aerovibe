import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const VALID_STATUSES = ["pending", "uploading", "processing", "complete", "failed"];
const VALID_TYPES = ["2d", "3d"];

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get("project_id");
  const status = url.searchParams.get("status");

  let q = supabaseAdmin.from("surveys").select("*").order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  if (status && VALID_STATUSES.includes(status)) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const payload = {
    project_id: body.project_id || null,
    title: body.title.trim(),
    status: body.status && VALID_STATUSES.includes(body.status) ? body.status : "pending",
    survey_type: body.survey_type && VALID_TYPES.includes(body.survey_type) ? body.survey_type : "2d",
    photo_count: typeof body.photo_count === "number" ? body.photo_count : 0,
    area_m2: typeof body.area_m2 === "number" ? body.area_m2 : null,
    gsd_cm_px: typeof body.gsd_cm_px === "number" ? body.gsd_cm_px : null,
    altitude_m: typeof body.altitude_m === "number" ? body.altitude_m : null,
    location: body.location?.trim() || null,
    latitude: typeof body.latitude === "number" ? body.latitude : null,
    longitude: typeof body.longitude === "number" ? body.longitude : null,
    polygon: body.polygon || null,
    notes: body.notes?.trim() || null,
  };

  const { data, error } = await supabaseAdmin.from("surveys").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
