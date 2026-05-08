import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const EVENT_COLORS: Record<string, string> = {
  activity:    "#06b6d4",
  appointment: "#a78bfa",
  reminder:    "#fbbf24",
  meeting:     "#34d399",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.title !== undefined)    patch.title    = body.title.trim();
  if (body.type !== undefined) {
    patch.type  = body.type;
    patch.color = EVENT_COLORS[body.type] ?? "#06b6d4";
  }
  if (body.date !== undefined)     patch.date     = body.date;
  if (body.time !== undefined)     patch.time     = body.time || null;
  if (body.end_time !== undefined) patch.end_time = body.end_time || null;
  if (body.notes !== undefined)    patch.notes    = body.notes?.trim() || null;
  if (body.location !== undefined) patch.location = body.location?.trim() || null;

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { error } = await supabaseAdmin.from("calendar_events").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
