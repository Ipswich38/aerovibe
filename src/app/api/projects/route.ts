import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const VALID_STATUSES = ["lead", "booked", "shooting", "editing", "delivered", "cancelled"];

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const contactId = url.searchParams.get("contact_id");
  const status = url.searchParams.get("status");

  let q = supabaseAdmin.from("projects").select("*").order("created_at", { ascending: false });
  if (contactId) q = q.eq("contact_id", contactId);
  if (status && VALID_STATUSES.includes(status)) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) {
    console.error("Projects fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { contact_id, title, service_type, status, shoot_date, deadline, amount, location, description, notes } = body;

  if (!contact_id) return NextResponse.json({ error: "contact_id required" }, { status: 400 });
  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });

  const payload = {
    contact_id,
    title: title.trim(),
    service_type: service_type?.trim() || null,
    status: status && VALID_STATUSES.includes(status) ? status : "lead",
    shoot_date: shoot_date || null,
    deadline: deadline || null,
    amount: typeof amount === "number" && Number.isFinite(amount) ? amount : null,
    location: location?.trim() || null,
    description: description?.trim() || null,
    notes: notes?.trim() || null,
  };

  const { data, error } = await supabaseAdmin.from("projects").insert(payload).select("*").single();
  if (error) {
    console.error("Project insert error:", error);
    return NextResponse.json({ error: error.message || "Failed to save" }, { status: 500 });
  }
  return NextResponse.json(data);
}
