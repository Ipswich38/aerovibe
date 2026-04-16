import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.INBOX_PASSWORD;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: lead } = await supabaseAdmin.from("leads").select("*").eq("id", id).single();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (lead.converted_contact_id) {
    return NextResponse.json({ error: "Already converted", contact_id: lead.converted_contact_id }, { status: 400 });
  }

  // If a contact with same email or phone exists, link instead of creating duplicate
  let contactId: string | null = null;
  if (lead.email) {
    const { data: existing } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("email", lead.email)
      .maybeSingle();
    if (existing) contactId = existing.id;
  }
  if (!contactId && lead.phone) {
    const { data: existing } = await supabaseAdmin
      .from("contacts")
      .select("id")
      .eq("phone", lead.phone)
      .maybeSingle();
    if (existing) contactId = existing.id;
  }

  if (!contactId) {
    const notesLines = [
      `Industry: ${lead.industry}`,
      lead.location ? `Location: ${lead.location}` : null,
      lead.address ? `Address: ${lead.address}` : null,
      lead.website ? `Website: ${lead.website}` : null,
      lead.rating ? `Rating: ${lead.rating} (${lead.rating_count || 0} reviews)` : null,
      lead.notes ? `Notes: ${lead.notes}` : null,
    ].filter(Boolean);

    const { data: created, error: createErr } = await supabaseAdmin
      .from("contacts")
      .insert({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        status: "lead",
        tags: [lead.industry, "from-lead-search"],
        notes: notesLines.join("\n"),
      })
      .select("id")
      .single();
    if (createErr || !created) {
      return NextResponse.json({ error: createErr?.message || "Failed to create contact" }, { status: 500 });
    }
    contactId = created.id;
  }

  await supabaseAdmin
    .from("leads")
    .update({
      status: "converted",
      converted_contact_id: contactId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ contact_id: contactId });
}
