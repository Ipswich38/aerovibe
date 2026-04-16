import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { computeTotals, InvoiceItem } from "@/lib/invoices";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const STATUSES = ["draft", "sent", "accepted", "paid", "cancelled", "overdue"];

function normalizeItems(raw: unknown): InvoiceItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const description = String(r?.description || "").trim();
      const quantity = Number(r?.quantity) || 0;
      const unit_price = Number(r?.unit_price) || 0;
      const amount = Math.round(quantity * unit_price * 100) / 100;
      return { description, quantity, unit_price, amount };
    })
    .filter((i) => i.description);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { data, error } = await supabaseAdmin.from("invoices").select("*").eq("id", id).single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const allowed: Record<string, unknown> = {};
  if ("contact_id" in body) allowed.contact_id = body.contact_id || null;
  if ("project_id" in body) allowed.project_id = body.project_id || null;
  if ("status" in body && STATUSES.includes(body.status)) {
    allowed.status = body.status;
    if (body.status === "paid" && !body.paid_at) allowed.paid_at = new Date().toISOString();
  }
  if ("issue_date" in body) allowed.issue_date = body.issue_date;
  if ("due_date" in body) allowed.due_date = body.due_date || null;
  if ("notes" in body) allowed.notes = body.notes?.trim() || null;
  if ("terms" in body) allowed.terms = body.terms?.trim() || null;
  if ("number" in body && body.number?.trim()) allowed.number = body.number.trim();

  if ("items" in body || "tax_rate" in body) {
    const current = await supabaseAdmin
      .from("invoices")
      .select("items, tax_rate")
      .eq("id", id)
      .single();
    const items = "items" in body ? normalizeItems(body.items) : (current.data?.items as InvoiceItem[]) || [];
    const taxRate = "tax_rate" in body ? Number(body.tax_rate) || 0 : Number(current.data?.tax_rate) || 0;
    const totals = computeTotals(items, taxRate);
    allowed.items = items;
    allowed.tax_rate = taxRate;
    allowed.subtotal = totals.subtotal;
    allowed.tax_amount = totals.tax;
    allowed.total = totals.total;
  }

  allowed.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("invoices")
    .update(allowed)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { error } = await supabaseAdmin.from("invoices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
