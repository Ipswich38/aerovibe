import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

// GET /api/surveys/[id]/status
// Checks NodeODM task status and syncs back to Supabase.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const nodeOdmUrl = process.env.NODEODM_URL;
  if (!nodeOdmUrl) {
    return NextResponse.json({ error: "NODEODM_URL not configured" }, { status: 503 });
  }

  const { data: survey, error: fetchErr } = await supabaseAdmin
    .from("surveys")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchErr || !survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });
  if (!survey.odm_task_id) return NextResponse.json({ error: "No ODM task" }, { status: 400 });

  try {
    const res = await fetch(`${nodeOdmUrl}/task/${survey.odm_task_id}/info`);
    if (!res.ok) return NextResponse.json({ error: "ODM task not found" }, { status: 404 });

    const info = await res.json();
    const odmStatus = info.status?.code;

    // ODM status codes: 10=queued, 20=running, 30=failed, 40=completed, 50=cancelled
    if (odmStatus === 40 && survey.status !== "complete") {
      const baseUrl = `${nodeOdmUrl}/task/${survey.odm_task_id}/download`;
      await supabaseAdmin
        .from("surveys")
        .update({
          status: "complete",
          orthomosaic_url: `${baseUrl}/orthophoto.tif`,
          dsm_url: `${baseUrl}/dsm.tif`,
          model_3d_url: survey.survey_type === "3d" ? `${baseUrl}/textured_model.zip` : null,
          report_url: `${baseUrl}/all.zip`,
          processing_finished_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      return NextResponse.json({ status: "complete", odm_status: odmStatus });
    }

    if (odmStatus === 30 && survey.status !== "failed") {
      await supabaseAdmin
        .from("surveys")
        .update({
          status: "failed",
          error_message: info.status?.errorMessage || "Processing failed",
          processing_finished_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      return NextResponse.json({ status: "failed", error: info.status?.errorMessage });
    }

    const progress = info.progress ?? 0;
    return NextResponse.json({
      status: survey.status,
      odm_status: odmStatus,
      progress,
      images_count: info.imagesCount ?? 0,
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : "Failed to check ODM status",
    }, { status: 502 });
  }
}
