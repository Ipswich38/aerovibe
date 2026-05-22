import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Public — returns booked dates only, no client details
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // YYYY-MM

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Send ?month=YYYY-MM" }, { status: 400 });
  }

  const [y, m] = month.split("-").map(Number);
  const start  = `${month}-01`;
  const end    = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("date")
    .gte("date", start)
    .lt("date", end)
    .in("status", ["pending", "confirmed"]);

  if (error) return NextResponse.json({ booked: [] });

  const booked = [...new Set((data ?? []).map((r) => r.date as string))];
  return NextResponse.json({ booked });
}
