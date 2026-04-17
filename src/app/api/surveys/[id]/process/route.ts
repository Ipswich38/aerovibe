import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 30;

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

// POST /api/surveys/[id]/process
// Kicks off an OpenDroneMap processing job via NodeODM API.
// Requires NODEODM_URL env var (e.g. http://localhost:3000 or remote server).
// Body: { images_path?: string } — local folder path with geotagged JPEGs (optional override).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const nodeOdmUrl = process.env.NODEODM_URL;
  if (!nodeOdmUrl) {
    return NextResponse.json(
      { error: "NODEODM_URL not configured. Install WebODM/NodeODM first." },
      { status: 503 },
    );
  }

  const { data: survey, error: fetchErr } = await supabaseAdmin
    .from("surveys")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchErr || !survey) return NextResponse.json({ error: "Survey not found" }, { status: 404 });

  if (survey.status === "processing") {
    return NextResponse.json({ error: "Already processing", task_id: survey.odm_task_id }, { status: 409 });
  }

  // Create a NodeODM task
  const body = await req.json().catch(() => ({}));

  const odmOptions = [
    { name: "dsm", value: true },
    { name: "orthophoto-resolution", value: survey.gsd_cm_px || 2.0 },
  ];
  if (survey.survey_type === "3d") {
    odmOptions.push({ name: "mesh-octree-depth", value: 11 });
    odmOptions.push({ name: "pc-quality", value: "high" });
  }

  try {
    // Step 1: Create task on NodeODM
    const createRes = await fetch(`${nodeOdmUrl}/task/new/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: survey.title,
        options: odmOptions,
        ...(body.images_path ? { imagesPath: body.images_path } : {}),
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      return NextResponse.json({ error: `NodeODM error: ${errBody}` }, { status: 502 });
    }

    const taskData = await createRes.json();
    const taskId = taskData.uuid;

    // Step 2: Update survey record
    await supabaseAdmin
      .from("surveys")
      .update({
        status: "processing",
        odm_task_id: taskId,
        processing_started_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({ ok: true, task_id: taskId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    await supabaseAdmin
      .from("surveys")
      .update({
        status: "failed",
        error_message: `ODM connection failed: ${msg}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
