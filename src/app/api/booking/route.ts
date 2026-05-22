import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const VALID_PACKAGES = new Set(["aerial-snaps", "aerial-snaps-reel"]);

// Naive IP rate limit: max 3 submissions per IP per hour
const ipLog = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (hits.length >= 3) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: Record<string, string>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { name, contact, pkg, date, area, notes } = body;

  if (!name?.trim() || !contact?.trim() || !pkg || !date || !area?.trim()) {
    return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }
  if (date < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ error: "Date cannot be in the past." }, { status: 400 });
  }
  if (!VALID_PACKAGES.has(pkg)) {
    return NextResponse.json({ error: "Invalid package." }, { status: 400 });
  }

  // Enforce 1 booking per day
  const { count } = await supabaseAdmin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("date", date)
    .in("status", ["pending", "confirmed"]);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "This date is already booked. Please choose another day." }, { status: 409 });
  }

  const { error } = await supabaseAdmin.from("bookings").insert({
    name:    name.trim().slice(0, 80),
    contact: contact.trim().slice(0, 120),
    package: pkg,
    date,
    area:    area.trim().slice(0, 120),
    notes:   notes?.trim().slice(0, 400) ?? null,
    source:  "opentofly",
    status:  "pending",
  });

  if (error) {
    console.error("Booking insert error:", error);
    return NextResponse.json({ error: "Could not save booking. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
