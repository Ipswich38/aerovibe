import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const VALID_TYPES = ["orthomosaic", "3d_model", "dsm", "video", "photo_set", "report", "other"];

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const projectId = url.searchParams.get("project_id");

  let q = supabaseAdmin.from("deliverables").select("*").order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 });
  if (!body.title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const payload = {
    project_id: body.project_id,
    title: body.title.trim(),
    file_type: body.file_type && VALID_TYPES.includes(body.file_type) ? body.file_type : "other",
    file_url: body.file_url?.trim() || null,
    file_size_bytes: typeof body.file_size_bytes === "number" ? body.file_size_bytes : null,
    thumbnail_url: body.thumbnail_url?.trim() || null,
    survey_id: body.survey_id || null,
    notes: body.notes?.trim() || null,
  };

  const { data, error } = await supabaseAdmin.from("deliverables").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
