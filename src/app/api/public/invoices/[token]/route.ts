import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select("id, kind, number, status, issue_date, due_date, items, subtotal, tax_rate, tax_amount, total, currency, notes, terms, paid_at")
    .eq("public_token", token)
    .single();

  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Pull contact name only — nothing sensitive
  let client_name: string | null = null;
  const { data: inv } = await supabaseAdmin
    .from("invoices")
    .select("contact_id")
    .eq("public_token", token)
    .single();
  if (inv?.contact_id) {
    const { data: c } = await supabaseAdmin.from("contacts").select("name").eq("id", inv.contact_id).single();
    client_name = c?.name || null;
  }

  return NextResponse.json({ ...data, client_name });
}
