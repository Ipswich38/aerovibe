import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { CONTRACT_TEMPLATES, renderTemplate } from "@/lib/contracts";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const STATUSES = ["draft", "sent", "signed", "cancelled"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("contracts").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("title" in body && body.title?.trim()) allowed.title = body.title.trim();
  if ("contact_id" in body) allowed.contact_id = body.contact_id || null;
  if ("project_id" in body) allowed.project_id = body.project_id || null;
  if ("status" in body && STATUSES.includes(body.status)) {
    allowed.status = body.status;
    if (body.status === "sent" && !body.sent_at) allowed.sent_at = new Date().toISOString();
  }
  if ("content" in body) allowed.content = body.content;

  if ("variables" in body && body.variables && typeof body.variables === "object") {
    allowed.variables = body.variables;
    // if template_key present (existing or new), re-render
    const current = await supabaseAdmin
      .from("contracts")
      .select("template_key, content")
      .eq("id", id)
      .single();
    const key = (body.template_key ?? current.data?.template_key) as string | null;
    if (key && CONTRACT_TEMPLATES[key]) {
      allowed.content = renderTemplate(CONTRACT_TEMPLATES[key].body, body.variables);
    }
  }

  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("contracts")
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabaseAdmin.from("contracts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
