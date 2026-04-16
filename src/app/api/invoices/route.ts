import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { computeTotals, InvoiceItem } from "@/lib/invoices";
import crypto from "crypto";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

const KINDS = ["quote", "invoice"];

async function nextNumber(kind: "quote" | "invoice"): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = kind === "quote" ? `Q-${year}-` : `INV-${year}-`;
  const { data } = await supabaseAdmin
    .from("invoices")
    .select("number")
    .like("number", `${prefix}%`)
    .order("number", { ascending: false })
    .limit(1);
  const last = data?.[0]?.number as string | undefined;
  const lastSeq = last ? parseInt(last.slice(prefix.length), 10) || 0 : 0;
  return `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;
}

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

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind");
  const status = url.searchParams.get("status");

  let q = supabaseAdmin.from("invoices").select("*").order("issue_date", { ascending: false });
  if (kind && KINDS.includes(kind)) q = q.eq("kind", kind);
  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: "Failed" }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const kind: "quote" | "invoice" = KINDS.includes(body.kind) ? body.kind : "invoice";
  const items = normalizeItems(body.items);
  const taxRate = Number(body.tax_rate) || 0;
  const totals = computeTotals(items, taxRate);
  const number = body.number?.trim() || (await nextNumber(kind));

  const payload = {
    kind,
    number,
    contact_id: body.contact_id || null,
    project_id: body.project_id || null,
    status: body.status || "draft",
    issue_date: body.issue_date || new Date().toISOString().slice(0, 10),
    due_date: body.due_date || null,
    items,
    subtotal: totals.subtotal,
    tax_rate: taxRate,
    tax_amount: totals.tax,
    total: totals.total,
    currency: body.currency || "PHP",
    notes: body.notes?.trim() || null,
    terms: body.terms?.trim() || null,
    public_token: crypto.randomBytes(16).toString("hex"),
  };

  const { data, error } = await supabaseAdmin.from("invoices").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
