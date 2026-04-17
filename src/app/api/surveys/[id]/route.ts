import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("surveys").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.status !== undefined) updates.status = body.status;
  if (body.photo_count !== undefined) updates.photo_count = body.photo_count;
  if (body.area_m2 !== undefined) updates.area_m2 = body.area_m2;
  if (body.gsd_cm_px !== undefined) updates.gsd_cm_px = body.gsd_cm_px;
  if (body.odm_task_id !== undefined) updates.odm_task_id = body.odm_task_id;
  if (body.orthomosaic_url !== undefined) updates.orthomosaic_url = body.orthomosaic_url;
  if (body.dsm_url !== undefined) updates.dsm_url = body.dsm_url;
  if (body.model_3d_url !== undefined) updates.model_3d_url = body.model_3d_url;
  if (body.report_url !== undefined) updates.report_url = body.report_url;
  if (body.error_message !== undefined) updates.error_message = body.error_message;
  if (body.processing_started_at !== undefined) updates.processing_started_at = body.processing_started_at;
  if (body.processing_finished_at !== undefined) updates.processing_finished_at = body.processing_finished_at;
  if (body.notes !== undefined) updates.notes = body.notes;

  const { data, error } = await supabaseAdmin
    .from("surveys")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabaseAdmin.from("surveys").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
