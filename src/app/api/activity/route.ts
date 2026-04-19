import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

interface ActivityEvent {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  status: string | null;
  timestamp: string;
  icon: string;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
  const ALLOWED_FILTERS = ["all", "messages", "projects", "invoices", "flights", "contacts", "surveys", "contracts", "leads"];
  const rawFilter = url.searchParams.get("filter") || "all";
  const filter = ALLOWED_FILTERS.includes(rawFilter) ? rawFilter : "all";

  const events: ActivityEvent[] = [];

  const queries: PromiseLike<void>[] = [];

  if (filter === "all" || filter === "messages") {
    queries.push(
      supabaseAdmin
        .from("waevpoint_messages")
        .select("id, name, contact, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((m) =>
            events.push({
              id: `msg-${m.id}`,
              type: "message",
              title: `Message from ${m.name || "Unknown"}`,
              subtitle: m.contact,
              status: m.status,
              timestamp: m.created_at,
              icon: "✉",
            })
          );
        })
    );
  }

  if (filter === "all" || filter === "projects") {
    queries.push(
      supabaseAdmin
        .from("projects")
        .select("id, title, status, service_type, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((p) =>
            events.push({
              id: `proj-${p.id}`,
              type: "project",
              title: p.title,
              subtitle: p.service_type,
              status: p.status,
              timestamp: p.updated_at || p.created_at,
              icon: "▦",
            })
          );
        })
    );
  }

  if (filter === "all" || filter === "invoices") {
    queries.push(
      supabaseAdmin
        .from("invoices")
        .select("id, invoice_number, kind, status, total, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((inv) =>
            events.push({
              id: `inv-${inv.id}`,
              type: "invoice",
              title: `${inv.kind === "quote" ? "Quote" : "Invoice"} ${inv.invoice_number || ""}`.trim(),
              subtitle: inv.total ? `₱${Number(inv.total).toLocaleString()}` : null,
              status: inv.status,
              timestamp: inv.updated_at || inv.created_at,
              icon: "₱",
            })
          );
        })
    );
  }

  if (filter === "all" || filter === "flights") {
    queries.push(
      supabaseAdmin
        .from("flights")
        .select("id, location, pilot, drone_id, created_at")
        .order("created_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((f) =>
            events.push({
              id: `flt-${f.id}`,
              type: "flight",
              title: `Flight at ${f.location || "Unknown"}`,
              subtitle: f.pilot,
              status: null,
              timestamp: f.created_at,
              icon: "✈",
            })
          );
        })
    );
  }

  if (filter === "all" || filter === "contacts") {
    queries.push(
      supabaseAdmin
        .from("contacts")
        .select("id, name, email, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((c) =>
            events.push({
              id: `con-${c.id}`,
              type: "contact",
              title: c.name || c.email || "Unknown contact",
              subtitle: c.email,
              status: c.status,
              timestamp: c.created_at,
              icon: "◉",
            })
          );
        })
    );
  }

  if (filter === "all" || filter === "surveys") {
    queries.push(
      supabaseAdmin
        .from("surveys")
        .select("id, title, status, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((s) =>
            events.push({
              id: `srv-${s.id}`,
              type: "survey",
              title: s.title || "Survey",
              subtitle: null,
              status: s.status,
              timestamp: s.updated_at || s.created_at,
              icon: "▣",
            })
          );
        })
    );
  }

  if (filter === "all" || filter === "contracts") {
    queries.push(
      supabaseAdmin
        .from("contracts")
        .select("id, template_key, status, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((ct) =>
            events.push({
              id: `ctr-${ct.id}`,
              type: "contract",
              title: `Contract: ${ct.template_key || "custom"}`,
              subtitle: null,
              status: ct.status,
              timestamp: ct.updated_at || ct.created_at,
              icon: "✎",
            })
          );
        })
    );
  }

  if (filter === "all" || filter === "leads") {
    queries.push(
      supabaseAdmin
        .from("leads")
        .select("id, name, industry, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit)
        .then(({ data }) => {
          (data || []).forEach((l) =>
            events.push({
              id: `lead-${l.id}`,
              type: "lead",
              title: l.name || "Unknown lead",
              subtitle: l.industry,
              status: l.status,
              timestamp: l.created_at,
              icon: "⌕",
            })
          );
        })
    );
  }

  await Promise.allSettled(queries);

  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return NextResponse.json(events.slice(0, limit));
}
