import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { SearchResult } from "@/lib/leads";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const industry = url.searchParams.get("industry");

  let q = supabaseAdmin.from("leads").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  if (industry) q = q.eq("industry", industry);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const leads: SearchResult[] = Array.isArray(body.leads) ? body.leads : [];
  const batchSource = typeof body.source === "string" ? body.source : null;

  if (leads.length === 0) return NextResponse.json({ error: "leads array required" }, { status: 400 });

  const rows = leads
    .filter((l) => (l.phone || l.email) && l.name?.trim())
    .map((l) => {
      const placeId = l.google_place_id || null;
      const inferredSource = placeId?.startsWith("osm:") ? "osm" : "google_places";
      return {
        name: l.name.trim(),
        industry: l.industry || "unknown",
        location: l.location || null,
        address: l.address || null,
        phone: l.phone || null,
        email: l.email ? l.email.toLowerCase() : null,
        website: l.website || null,
        rating: l.rating,
        rating_count: l.rating_count,
        google_place_id: placeId,
        source: batchSource || inferredSource,
        status: "new",
      };
    });

  if (rows.length === 0) return NextResponse.json({ saved: 0, skipped: leads.length });

  // Upsert by google_place_id to avoid duplicates from repeat searches
  const { data, error } = await supabaseAdmin
    .from("leads")
    .upsert(rows, { onConflict: "google_place_id", ignoreDuplicates: true })
    .select("*");

  if (error) {
    console.error("Lead insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: data?.length || 0, skipped: leads.length - (data?.length || 0) });
}
