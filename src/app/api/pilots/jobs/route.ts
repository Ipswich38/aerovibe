import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const ipLog = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 5) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

// Public POST — client posts a job
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  let b: Record<string, string>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const required = ["client_name", "contact", "location", "province", "service_type", "description"];
  for (const f of required) {
    if (!b[f]?.trim()) return NextResponse.json({ error: `${f} is required.` }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("pilot_jobs").insert({
    client_name:    b.client_name.trim().slice(0, 100),
    contact:        b.contact.trim().slice(0, 120),
    location:       b.location.trim().slice(0, 150),
    province:       b.province.trim().slice(0, 80),
    service_type:   b.service_type.trim().slice(0, 100),
    budget:         b.budget?.trim().slice(0, 80) || null,
    preferred_date: b.preferred_date || null,
    description:    b.description.trim().slice(0, 600),
    status:         "open",
  });

  if (error) {
    console.error("Job post error:", error);
    return NextResponse.json({ error: "Could not submit. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// Ops GET — list all jobs
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("pilot_jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
