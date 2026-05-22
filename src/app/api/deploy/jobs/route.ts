import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("pilot_jobs")
    .select("id, client_name, location, province, service_type, budget, preferred_date, description, status, created_at")
    .in("status", ["open", "matched"])
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    jobs: (data ?? []).map((job) => ({
      id: job.id,
      client_name: job.client_name,
      location: job.location,
      province: job.province,
      service_type: job.service_type,
      budget: job.budget,
      preferred_date: job.preferred_date,
      description: job.description,
      status: job.status,
      created_at: job.created_at,
    })),
  });
}
