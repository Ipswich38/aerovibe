import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export interface CalendarEvent {
  id: string;
  type: "shoot" | "deadline" | "flight" | "invoice_due" | "contract" | "survey";
  title: string;
  date: string;
  status: string | null;
  color: string;
  href: string;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const month = url.searchParams.get("month");
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "month param required (YYYY-MM)" }, { status: 400 });
  }

  const startDate = `${month}-01`;
  const [y, m] = month.split("-").map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;

  const events: CalendarEvent[] = [];
  const queries: PromiseLike<void>[] = [];

  // Project shoot dates
  queries.push(
    supabaseAdmin
      .from("projects")
      .select("id, title, shoot_date, status")
      .gte("shoot_date", startDate)
      .lt("shoot_date", nextMonth)
      .not("shoot_date", "is", null)
      .then(({ data }) => {
        (data || []).forEach((p) =>
          events.push({
            id: `shoot-${p.id}`,
            type: "shoot",
            title: `Shoot: ${p.title}`,
            date: p.shoot_date,
            status: p.status,
            color: "#f97316",
            href: "/ops/projects",
          })
        );
      })
  );

  // Project deadlines
  queries.push(
    supabaseAdmin
      .from("projects")
      .select("id, title, deadline, status")
      .gte("deadline", startDate)
      .lt("deadline", nextMonth)
      .not("deadline", "is", null)
      .then(({ data }) => {
        (data || []).forEach((p) =>
          events.push({
            id: `deadline-${p.id}`,
            type: "deadline",
            title: `Due: ${p.title}`,
            date: p.deadline,
            status: p.status,
            color: "#ef4444",
            href: "/ops/projects",
          })
        );
      })
  );

  // Flights
  queries.push(
    supabaseAdmin
      .from("flights")
      .select("id, location, flight_date, pilot")
      .gte("flight_date", startDate)
      .lt("flight_date", nextMonth)
      .not("flight_date", "is", null)
      .then(({ data }) => {
        (data || []).forEach((f) =>
          events.push({
            id: `flight-${f.id}`,
            type: "flight",
            title: `Flight: ${f.location || "Unknown"}`,
            date: f.flight_date,
            status: null,
            color: "#06b6d4",
            href: "/ops/flights",
          })
        );
      })
  );

  // Invoice due dates
  queries.push(
    supabaseAdmin
      .from("invoices")
      .select("id, invoice_number, kind, due_date, status")
      .gte("due_date", startDate)
      .lt("due_date", nextMonth)
      .not("due_date", "is", null)
      .then(({ data }) => {
        (data || []).forEach((inv) =>
          events.push({
            id: `inv-${inv.id}`,
            type: "invoice_due",
            title: `${inv.kind === "quote" ? "Quote" : "Invoice"} ${inv.invoice_number || ""} due`.trim(),
            date: inv.due_date,
            status: inv.status,
            color: "#a855f7",
            href: "/ops/invoices",
          })
        );
      })
  );

  // Contracts
  queries.push(
    supabaseAdmin
      .from("contracts")
      .select("id, template_key, status, created_at")
      .gte("created_at", `${startDate}T00:00:00`)
      .lt("created_at", `${nextMonth}T00:00:00`)
      .then(({ data }) => {
        (data || []).forEach((ct) =>
          events.push({
            id: `ctr-${ct.id}`,
            type: "contract",
            title: `Contract: ${ct.template_key || "custom"}`,
            date: ct.created_at.slice(0, 10),
            status: ct.status,
            color: "#22c55e",
            href: "/ops/contracts",
          })
        );
      })
  );

  // Surveys
  queries.push(
    supabaseAdmin
      .from("surveys")
      .select("id, title, status, created_at")
      .gte("created_at", `${startDate}T00:00:00`)
      .lt("created_at", `${nextMonth}T00:00:00`)
      .then(({ data }) => {
        (data || []).forEach((s) =>
          events.push({
            id: `srv-${s.id}`,
            type: "survey",
            title: `Survey: ${s.title || "Untitled"}`,
            date: s.created_at.slice(0, 10),
            status: s.status,
            color: "#eab308",
            href: "/ops/surveys",
          })
        );
      })
  );

  await Promise.allSettled(queries);

  events.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json(events);
}
