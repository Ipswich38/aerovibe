import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { CONTRACT_TEMPLATES, renderTemplate } from "@/lib/contracts";
import crypto from "crypto";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  let q = supabaseAdmin.from("contracts").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (!body.title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const variables: Record<string, string> = body.variables && typeof body.variables === "object" ? body.variables : {};
  const templateKey = body.template_key && CONTRACT_TEMPLATES[body.template_key] ? body.template_key : null;
  const baseBody = templateKey ? CONTRACT_TEMPLATES[templateKey].body : body.content || "";
  const content = renderTemplate(baseBody, variables);

  const payload = {
    title: body.title.trim(),
    contact_id: body.contact_id || null,
    project_id: body.project_id || null,
    template_key: templateKey,
    content,
    variables,
    status: "draft",
    public_token: crypto.randomBytes(16).toString("hex"),
  };

  const { data, error } = await supabaseAdmin.from("contracts").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
