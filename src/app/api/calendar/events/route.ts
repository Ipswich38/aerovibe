import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const EVENT_COLORS: Record<string, string> = {
  activity:    "#06b6d4",
  appointment: "#a78bfa",
  reminder:    "#fbbf24",
  meeting:     "#34d399",
};

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  let query = supabaseAdmin
    .from("calendar_events")
    .select("id, title, type, date, time, end_time, notes, color")
    .order("date", { ascending: true })
    .order("time", { ascending: true, nullsFirst: true });

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const start = `${month}-01`;
    const end = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    query = query.gte("date", start).lt("date", end);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.date || !body?.type) {
    return NextResponse.json({ error: "title, date, and type are required" }, { status: 400 });
  }

  const color = EVENT_COLORS[body.type] ?? "#06b6d4";

  const { data, error } = await supabaseAdmin
    .from("calendar_events")
    .insert({
      title:    body.title.trim(),
      type:     body.type,
      date:     body.date,
      time:     body.time || null,
      end_time: body.end_time || null,
      notes:    body.notes?.trim() || null,
      location: body.location?.trim() || null,
      color,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
