import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const category = url.searchParams.get("category");

  let q = supabaseAdmin.from("transactions").select("*").order("date", { ascending: false });
  if (kind === "income" || kind === "expense") q = q.eq("kind", kind);
  if (from) q = q.gte("date", from);
  if (to) q = q.lte("date", to);
  if (category) q = q.eq("category", category);

  const { data, error } = await q;
  if (error) {
    console.error("Transactions fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { kind, date, amount, category, vendor, description, receipt_url, notes } = body;

  if (!kind || !["income", "expense"].includes(kind)) {
    return NextResponse.json({ error: "kind must be income or expense" }, { status: 400 });
  }
  if (typeof amount !== "number" || amount < 0 || !Number.isFinite(amount)) {
    return NextResponse.json({ error: "amount must be a non-negative number" }, { status: 400 });
  }
  if (!category?.trim()) {
    return NextResponse.json({ error: "category required" }, { status: 400 });
  }

  const payload = {
    kind,
    date: date || new Date().toISOString().slice(0, 10),
    amount,
    currency: "PHP",
    category: category.trim(),
    vendor: vendor?.trim() || null,
    description: description?.trim() || null,
    receipt_url: receipt_url?.trim() || null,
    notes: notes?.trim() || null,
  };

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Transaction insert error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
  return NextResponse.json(data);
}
